from django.urls import path
from . import views
urlpatterns = [
    path('search/', views.search_music),
    path('like/', views.like_song, name='like_song'),
    path('liked-songs/', views.get_liked_songs, name='get_liked_songs'),
    path('stream/', views.stream_music, name='stream_music'),
]