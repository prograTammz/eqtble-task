"""
Models Manager Definition
"""

from django.db import models


class SoftDeleteManager(models.Manager):
    """
    SoftDeleteManager
    Returns all the values who hasn't been soft deleted by default
    """

    def get_queryset(self):
        """ Return queryset not is_deleted by default """
        return super().get_queryset().filter(is_deleted=False)

    def get_default_queryset(self):
        return super().get_queryset()
