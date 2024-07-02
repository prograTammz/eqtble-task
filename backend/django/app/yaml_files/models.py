from django.db import models

import uuid
from .managers import SoftDeleteManager


class CoreFields(models.Model):
    """
    Core Fields
    -> All Fields that are exposed to API should have UUID beside id for security measure
    -> CreatedAt & ModifiedAt for visualizations measured
    -> isDeleted with SoftDeleteManager to add support for SoftDelete instead of Hard Delete
    """
    uuid = models.UUIDField(
        db_index=True, default=uuid.uuid4, editable=False, unique=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)

    objects = SoftDeleteManager()

    class Meta:
        """Set the CoreFieldsa as Abstract no as DB Model"""
        abstract = True


class YamlFile(CoreFields):
    name = models.CharField(max_length=255)
    s3_key = models.CharField(max_length=255)
