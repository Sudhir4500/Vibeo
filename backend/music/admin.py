from django.contrib import admin
from .models import Song, Playlist

@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display = ('title', 'artist', 'video_id')
    search_fields = ('title', 'artist')

@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    # This allows you to filter playlists by specific users in the sidebar
    list_filter = ('user', 'created_at')
    # Helps you find a specific playlist by name or owner's email
    search_fields = ('name', 'user__email')