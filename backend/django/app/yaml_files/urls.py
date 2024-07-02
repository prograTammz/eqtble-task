from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import YamlFileViewSet, YamlFileDownloadView

router = DefaultRouter()
router.register(r'yaml-files', YamlFileViewSet, basename='yamlfile')

urlpatterns = [
    path('', include(router.urls)),
    path('download/<file_name>.yaml',
         YamlFileDownloadView.as_view(), name='yamlfile-download'),
]
