from rest_framework import serializers
from .models import Song, Playlist


class SongSerializer(serializers.ModelSerializer):
    # Map video_id to id for frontend consistency
    id = serializers.CharField(source='video_id', read_only=True)
    
    class Meta:
        model = Song
        fields = ['id', 'title', 'artist', 'thumbnail', 'duration']
        # Explicitly list fields to ensure frontend gets exactly what it needs


class PlaylistSerializer(serializers.ModelSerializer):
    songs = SongSerializer(many=True, read_only=True)
    song_count = serializers.IntegerField(source='songs.count', read_only=True)
    
    class Meta:
        model = Playlist
        fields = ['id', 'name', 'songs', 'song_count', 'created_at']
        read_only_fields = ['created_at']


# Alternative: If you want to keep using video_id in responses
class SongDetailSerializer(serializers.ModelSerializer):
    """
    Detailed song serializer with all fields including video_id
    """
    class Meta:
        model = Song
        fields = ['video_id', 'title', 'artist', 'thumbnail', 'duration']


# For search results and recommendations (if coming from YouTube directly)
class SongSearchSerializer(serializers.Serializer):
    """
    Serializer for songs coming from YouTube search (not from DB)
    """
    id = serializers.CharField()
    title = serializers.CharField()
    artist = serializers.CharField(allow_blank=True, required=False)
    thumbnail = serializers.URLField()
    duration = serializers.CharField(allow_blank=True, required=False)