from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

# Create your models here.

class User(AbstractUser):
    pass

class Template(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.TextField()
    content = models.TextField()
    visibility = models.CharField(max_length=16, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="templates")
    rating_user = models.ManyToManyField(User, blank=True, related_name="rated")
    rating_total = models.IntegerField()
    saved_user = models.ManyToManyField(User, blank=True, related_name="saved")
    date = models.DateTimeField()
    words = models.JSONField()
    length = models.IntegerField()
