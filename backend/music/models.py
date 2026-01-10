from django.db import models
from django.conf import settings

# Create your models here.
class Song(models.Model):
    video_id = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=200)
    thumbnail= models.URLField()
    duration = models.CharField(max_length=20,blank=True, null=True)
    artist = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.title
    
"""
model to store the playlist of a user
"""
class Playlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name= models.CharField(max_length=100)
    songs = models.ManyToManyField(Song, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} by {self.user.username}"