from django.urls import path
from . import views

urlpatterns = [
    # Search
    path('search/', views.search_music, name='search_music'),
    
    # Likes
    path('like/', views.toggle_like_song, name='toggle_like_song'),
    path('liked-songs/', views.get_liked_songs, name='get_liked_songs'),
    path('check-liked/', views.check_if_liked, name='check_if_liked'),  # NEW
    
    # Playlists
    path('playlists/', views.get_user_playlists, name='get_user_playlists'),
    
    # Streaming
    path('stream/', views.stream_music, name='stream_music'),
    
    # Recommendations
    path('recommendations/', views.recommend_songs, name='recommend_songs'),
    
    # Discovery / Home
    path('discovery/', views.get_home_discovery, name='get_home_discovery'),
    path('section/', views.get_section_songs, name='get_section_songs'),
]