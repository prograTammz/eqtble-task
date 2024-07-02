import boto3
import yaml
import json
import requests
from django.conf import settings
from django.http import FileResponse, Http404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.parsers import FileUploadParser, MultiPartParser, JSONParser
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from rest_framework.parsers import BaseParser
from rest_framework.renderers import JSONRenderer
from rest_framework.views import APIView
import uuid
from .models import YamlFile
from .serializers import YamlFileSerializer
from jsonschema import validate, ValidationError
from definitions.table import table_def
import tempfile
import os

s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_S3_REGION_NAME
)


class PlainTextParser(BaseParser):
    """
    Plain text parser.
    """
    media_type = 'text/plain'

    def parse(self, stream, media_type=None, parser_context=None):
        """
        Simply return a string representing the body of the request.
        """
        return stream.read().decode('utf-8')


class YamlFileViewSet(viewsets.ViewSet):
    parser_classes = [PlainTextParser, MultiPartParser, JSONParser]
    renderer_classes = [JSONRenderer]

    def validate_yaml_content(self, yaml_content):
        try:
            data = yaml.safe_load(yaml_content)
            validate(instance=data, schema=table_def)
            return data, None
        except yaml.YAMLError as e:
            return None, f"YAML error: {str(e)}"
        except ValidationError as e:
            return None, f"Schema validation error: {str(e)}"

    @swagger_auto_schema(responses={200: YamlFileSerializer(many=True)})
    def list(self, request):
        queryset = YamlFile.objects.all()
        serializer = YamlFileSerializer(queryset, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(responses={200: YamlFileSerializer()})
    def retrieve(self, request, pk=None):
        try:
            yaml_file = YamlFile.objects.get(pk=pk)
        except Exception as e:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Retrieve version history from S3
        versions = s3_client.list_object_versions(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Prefix=yaml_file.s3_key
        )

        version_info = [
            {
                "VersionId": version['VersionId'],
                "LastModified": version['LastModified'],
                "IsLatest": version['IsLatest'],
                "Size": version['Size']
            }
            for version in versions.get('Versions', [])
        ]

        # Retrieve the actual YAML content from S3
        latest_version = next((v for v in versions.get(
            'Versions', []) if v.get('IsLatest')), None)
        yaml_content = ''
        if latest_version:
            response = s3_client.get_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=yaml_file.s3_key, VersionId=latest_version['VersionId'])
            yaml_content = response['Body'].read().decode('utf-8')

        serializer = YamlFileSerializer(yaml_file)
        data = serializer.data
        data['history'] = version_info
        data['content'] = yaml_content

        return Response(data)

    @swagger_auto_schema(
        request_body=None,
        responses={201: YamlFileSerializer()}
    )
    def create(self, request):
        yaml_content = request.data
        if not yaml_content:
            return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
        data, error = self.validate_yaml_content(yaml_content)
        if error:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

        file_name = f'{uuid.uuid4()}.yaml'
        s3_key = f'yaml_files/{file_name}'

        print(settings.AWS_STORAGE_BUCKET_NAME, 'HI')

        # Upload the YAML content as a file to S3
        s3_client.put_object(
            Body=yaml_content, Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=s3_key)

        # Save reference to the database
        yaml_file = YamlFile.objects.create(name=file_name, s3_key=s3_key)
        serializer = YamlFileSerializer(yaml_file)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @swagger_auto_schema(
        request_body=None,
        responses={200: YamlFileSerializer()}
    )
    def update(self, request, pk=None):
        try:
            yaml_file = YamlFile.objects.get(pk=pk)
        except Exception as e:
            return Response(status=status.HTTP_404_NOT_FOUND)

        yaml_content = request.data
        if not yaml_content:
            return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)

        data, error = self.validate_yaml_content(yaml_content)
        if error:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

        # Upload the updated YAML content to S3
        s3_client.put_object(
            Body=yaml_content, Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=yaml_file.s3_key)

        yaml_file.name = yaml_file.name  # Keep the same file name
        yaml_file.save()

        serializer = YamlFileSerializer(yaml_file)
        return Response(serializer.data)

    @swagger_auto_schema(responses={204: 'No Content'})
    def destroy(self, request, pk=None):
        try:
            yaml_file = YamlFile.objects.get(pk=pk)
        except Exception as e:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Delete the file from S3
        s3_client.delete_object(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=yaml_file.s3_key)
        yaml_file.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['get'], url_path='version/(?P<version_id>[^/.]+)')
    @swagger_auto_schema(responses={200: 'application/yaml'})
    def retrieve_version(self, request, pk=None, version_id=None):
        try:
            yaml_file = YamlFile.objects.get(pk=pk)
        except Exception as e:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Retrieve the specific version of the YAML content from S3
        try:
            response = s3_client.get_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=yaml_file.s3_key, VersionId=version_id)
            yaml_content = response['Body'].read().decode('utf-8')
        except s3_client.exceptions.NoSuchVersion:
            return Response({'error': 'Version not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(yaml_content, content_type='text/plain')

    @swagger_auto_schema(
        method='post',
        manual_parameters=[],
        responses={201: YamlFileSerializer()},
        request_body=None
    )
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser])
    def upload(self, request):
        if 'file' not in request.data:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        file = request.data['file']
        yaml_content = file.read().decode('utf-8')

        data, error = self.validate_yaml_content(yaml_content)
        if error:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)

        file_name = f'{uuid.uuid4()}.yaml'
        s3_key = f'yaml_files/{file_name}'

        # Upload the YAML content as a file to S3
        s3_client.put_object(
            Body=yaml_content, Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=s3_key)

        # Save reference to the database
        yaml_file = YamlFile.objects.create(name=file_name, s3_key=s3_key)
        serializer = YamlFileSerializer(yaml_file)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='parse')
    def parse(self, request, pk=None):
        try:
            yaml_file = YamlFile.objects.get(pk=pk)
        except Exception as e:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Retrieve the YAML content from S3
        try:
            response = s3_client.get_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=yaml_file.s3_key)
            yaml_content = response['Body'].read().decode('utf-8')
        except s3_client.exceptions.NoSuchKey:
            return Response({'error': 'File not found in S3'}, status=status.HTTP_404_NOT_FOUND)

        # Make a request to the external parse API
        external_api_url = 'http://flask:5500/parse'
        try:
            external_response = requests.post(external_api_url, data=yaml_content, headers={
                                              'Content-Type': 'text/plain'})
            external_response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(external_response.json(), status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='query')
    def query(self, request, pk=None):
        try:
            yaml_file = YamlFile.objects.get(pk=pk)
        except Exception as e:
            return Response(status=status.HTTP_404_NOT_FOUND)

        # Retrieve the YAML content from S3
        try:
            response = s3_client.get_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=yaml_file.s3_key)
            yaml_content = response['Body'].read().decode('utf-8')
        except s3_client.exceptions.NoSuchKey:
            return Response({'error': 'File not found in S3'}, status=status.HTTP_404_NOT_FOUND)

        # Construct the payload for the external query API\
        payload = {
            'yaml': yaml_content,
            'queries': request.data.get('queries', [])
        }
        # Make a request to the external query API
        external_api_url = 'http://flask:5500/query'
        try:
            external_response = requests.post(external_api_url, json=payload)
            external_response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(external_response.json(), status=status.HTTP_200_OK)


class YamlFileDownloadView(APIView):
    def get(self, request, file_name):
        s3_key = f'yaml_files/{file_name}.yaml'
        print(file_name)
        temp_file_name = None

        try:
            response = s3_client.get_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=s3_key)
            file_content = response['Body'].read()

            # Create a temporary file to hold the content
            temp_file = tempfile.NamedTemporaryFile(delete=False)
            temp_file.write(file_content)
            temp_file.seek(0)
            temp_file_name = temp_file.name

            # Create a FileResponse to serve the file
            response = FileResponse(
                open(temp_file_name, 'rb'), as_attachment=True, filename=file_name)
            response['Content-Type'] = 'application/x-yaml'
            return response
        except s3_client.exceptions.NoSuchKey:
            raise Http404("File does not exist")
        finally:
            # Clean up the temporary file
            if temp_file_name and os.path.exists(temp_file_name):
                os.remove(temp_file_name)
