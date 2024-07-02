from rest_framework import serializers
from .models import YamlFile


class YamlFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = YamlFile
        fields = '__all__'
