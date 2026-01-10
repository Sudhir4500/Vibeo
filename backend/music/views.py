from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .services import youtube_search
from .models import Song, Playlist
from .serializers import SongSerializer, PlaylistSerializer
from .services import get_audio_stream_url # Ensure this helper is in services.py


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_music(request):
    """
    Search for music using YouTube scraping.
    Query parameter: q (search query)
    """
    query = request.query_params.get('q')
    
    if not query:
        return Response(
            {'error': 'Search query parameter "q" is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        results = youtube_search(query)
        return Response({'results': results}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response(
            {'error': f'Search failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_song(request):
    """
    Toggle like/unlike for a song. Adds or removes song from user's "Liked Songs" playlist.
    Required fields: video_id, title, thumbnail
    Optional fields: artist, duration
    """
    user = request.user
    song_data = request.data
    
    # Validate required fields
    required_fields = ['video_id', 'title', 'thumbnail']
    missing_fields = [field for field in required_fields if field not in song_data]
    
    if missing_fields:
        return Response(
            {'error': f'Missing required fields: {", ".join(missing_fields)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        with transaction.atomic():
            # Get or create song in database
            song, song_created = Song.objects.get_or_create(
                video_id=song_data['video_id'],
                defaults={
                    'title': song_data['title'],
                    'artist': song_data.get('artist', ''),
                    'thumbnail': song_data['thumbnail'],
                    'duration': song_data.get('duration', ''),
                }
            )
            
            # Get or create the user's liked songs playlist
            playlist, playlist_created = Playlist.objects.get_or_create(
                user=user,
                name="Liked Songs"
            )
            
            # Toggle song in playlist
            if song in playlist.songs.all():
                playlist.songs.remove(song)
                return Response(
                    {
                        'message': 'Song unliked successfully',
                        'liked': False,
                        'song': SongSerializer(song).data
                    },
                    status=status.HTTP_200_OK
                )
            else:
                playlist.songs.add(song)
                return Response(
                    {
                        'message': 'Song liked successfully',
                        'liked': True,
                        'song': SongSerializer(song).data
                    },
                    status=status.HTTP_201_CREATED if song_created else status.HTTP_200_OK
                )
    
    except Exception as e:
        return Response(
            {'error': f'Failed to like/unlike song: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_liked_songs(request):
    """
    Get the user's liked songs playlist with all songs.
    """
    try:
        playlist, created = Playlist.objects.get_or_create(
            user=request.user,
            name="Liked Songs"
        )
        
        # Prefetch related songs for better performance
        playlist = Playlist.objects.prefetch_related('songs').get(id=playlist.id)
        
        serializer = PlaylistSerializer(playlist)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': f'Failed to retrieve liked songs: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_playlists(request):
    """
    Get all playlists for the authenticated user.
    """
    try:
        playlists = Playlist.objects.filter(user=request.user).prefetch_related('songs')
        serializer = PlaylistSerializer(playlists, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': f'Failed to retrieve playlists: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stream_music(request):
    """
    Takes a video_id and returns a direct streamable audio URL.
    """
    video_id = request.query_params.get('id')
    if not video_id:
        return Response({'error': 'video_id is required'}, status=400)
    
    try:
        # This calls yt-dlp to get the actual audio file link
        stream_url = get_audio_stream_url(video_id)
        return Response({'stream_url': stream_url})
    except Exception as e:
        return Response({'error': str(e)}, status=500)