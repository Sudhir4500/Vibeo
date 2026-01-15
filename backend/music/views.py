from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from .services import youtube_search, get_audio_stream_url, get_recommendations
from .models import Song, Playlist
from .serializers import SongSerializer, PlaylistSerializer
import json


# ==================== SEARCH ====================

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


# ==================== LIKES ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like_song(request):
    """
    Toggle like/unlike for a song.
    Required: id (video_id)
    Optional: title, artist, thumbnail, duration
    """
    try:
        data = request.data
        vid_id = data.get('id')
        
        if not vid_id:
            return Response({'error': 'Missing song ID'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            playlist, _ = Playlist.objects.get_or_create(
                user=request.user,
                name="Liked Songs"
            )

            song, created = Song.objects.get_or_create(
                video_id=vid_id,
                defaults={
                    'title': data.get('title', 'Unknown Title'),
                    'artist': data.get('artist', 'Unknown Artist'),
                    'thumbnail': data.get('thumbnail', ''),
                    'duration': str(data.get('duration', '')),
                }
            )
            
            if not created:
                song.title = data.get('title', song.title)
                song.artist = data.get('artist', song.artist)
                song.thumbnail = data.get('thumbnail', song.thumbnail)
                song.duration = str(data.get('duration', song.duration))
                song.save()

            if song in playlist.songs.all():
                playlist.songs.remove(song)
                return Response({
                    'status': 'unliked',
                    'liked': False,
                    'song_id': vid_id
                }, status=status.HTTP_200_OK)
            else:
                playlist.songs.add(song)
                return Response({
                    'status': 'liked',
                    'liked': True,
                    'song_id': vid_id
                }, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"Error in toggle_like_song: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': f'Failed to toggle like: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_if_liked(request):
    """
    Check if a specific song is liked.
    Query param: id (video_id)
    """
    video_id = request.query_params.get('id')
    
    if not video_id:
        return Response({'error': 'video_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        playlist = Playlist.objects.filter(
            user=request.user,
            name="Liked Songs"
        ).first()
        
        if not playlist:
            return Response({'liked': False}, status=status.HTTP_200_OK)
        
        song = Song.objects.filter(video_id=video_id).first()
        
        if not song:
            return Response({'liked': False}, status=status.HTTP_200_OK)
        
        is_liked = song in playlist.songs.all()
        
        return Response({'liked': is_liked}, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_liked_songs(request):
    """
    Get the user's liked songs playlist with all songs.
    """
    try:
        playlist, _ = Playlist.objects.get_or_create(
            user=request.user,
            name="Liked Songs"
        )
        
        songs = playlist.songs.all().order_by('-id')
        serializer = SongSerializer(songs, many=True)
        
        print(f"Found {songs.count()} liked songs for user {request.user.username}")
        
        return Response({
            'playlist': {
                'id': playlist.id,
                'name': playlist.name,
                'song_count': songs.count()
            },
            'songs': serializer.data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"Error in get_liked_songs: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {'error': f'Failed to retrieve liked songs: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== PLAYLISTS ====================

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


# ==================== STREAMING ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stream_music(request):
    """
    Takes a video_id and returns a direct streamable audio URL.
    """
    video_id = request.query_params.get('id')
    if not video_id:
        return Response({'error': 'video_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        stream_url = get_audio_stream_url(video_id)
        return Response({'stream_url': stream_url}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== RECOMMENDATIONS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommend_songs(request):
    """
    Get recommendations based on current song.
    """
    video_id = request.query_params.get('id')
    title = request.query_params.get('title')
    artist = request.query_params.get('artist', '')
    
    if not video_id or not title:
        return Response(
            {'error': 'id and title are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        recommendations = get_recommendations(video_id, title, artist)
        return Response({'results': recommendations}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ==================== OPTIMIZED DISCOVERY ====================

def _get_search_query_for_section(section_type, user):
    """
    Helper function to get search query based on section type.
    """
    if section_type == 'trending':
        return "top hits 2025"
    
    elif section_type == 'personalized':
        last_liked = Song.objects.filter(
            playlist__user=user,
            playlist__name="Liked Songs"
        ).order_by('-id').first()
        
        if last_liked and last_liked.artist:
            return f"{last_liked.artist} songs"
        return "popular music mix"
    
    elif section_type == 'new_releases':
        return "new music 2025"
    
    elif section_type == 'popular':
        return "popular songs right now"
    
    else:
        return "music 2025"


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_home_discovery(request):
    """
    OPTIMIZED: Fast home screen with minimal API calls
    Strategy: Do ONE search and reuse results across sections
    """
    try:
        print("\n🏠 Starting OPTIMIZED Home Discovery")
        user = request.user
        sections = []
        
        # Strategy: Do just 2-3 searches total and slice them differently
        
        # 1. PRIMARY SEARCH - Get trending/popular music
        print("📊 Fetching primary content...")
        try:
            primary_results = youtube_search("popular music 2025")
            
            if primary_results and len(primary_results) >= 8:
                # Split results across multiple sections
                sections.append({
                    'title': 'Trending Now',
                    'type': 'horizontal',
                    'data': primary_results[0:6]  # First 6
                })
                
                sections.append({
                    'title': 'Popular Right Now',
                    'type': 'horizontal',
                    'data': primary_results[6:12] if len(primary_results) > 6 else primary_results[0:6]
                })
                
                print(f"✅ Primary search successful: {len(primary_results)} results")
            else:
                print("⚠️ Primary search returned insufficient results")
        
        except Exception as e:
            print(f"❌ Primary search failed: {e}")
        
        # 2. SECONDARY SEARCH - Personalized (only if we have liked songs)
        print("💝 Checking for personalized content...")
        try:
            last_liked = Song.objects.filter(
                playlist__user=user,
                playlist__name="Liked Songs"
            ).order_by('-id').first()
            
            if last_liked and last_liked.artist:
                personalized_query = f"{last_liked.artist} music"
                personalized = youtube_search(personalized_query)
                
                if personalized:
                    sections.append({
                        'title': 'Made For You',
                        'type': 'horizontal',
                        'data': personalized[:8]
                    })
                    print(f"✅ Personalized section added")
        except Exception as e:
            print(f"⚠️ Personalized section skipped: {e}")
        
        # 3. TERTIARY SEARCH - New releases (optional, only if time permits)
        print("🆕 Fetching new releases...")
        try:
            new_releases = youtube_search("new music")
            
            if new_releases:
                sections.append({
                    'title': 'New Releases',
                    'type': 'horizontal',
                    'data': new_releases[:8]
                })
                print(f"✅ New releases added")
        except Exception as e:
            print(f"⚠️ New releases skipped: {e}")
        
        # Filter out empty sections
        sections = [s for s in sections if s.get('data') and len(s['data']) > 0]
        
        print(f"\n✅ Discovery complete: {len(sections)} sections ready")
        
        # Absolute minimum fallback - return something
        if not sections:
            print("⚠️ No sections created, using emergency fallback")
            sections = [{
                'title': 'Discover Music',
                'type': 'horizontal',
                'data': []
            }]
        
        return Response({'sections': sections}, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR in get_home_discovery: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Always return valid response structure
        return Response({
            'sections': [{
                'title': 'Music',
                'type': 'horizontal',
                'data': []
            }]
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_section_songs(request):
    """
    Get full list of songs for a specific section.
    Query params: 
    - section: Section type (trending, personalized, new_releases, popular)
    - query: Custom search query (optional)
    - limit: Number of results (default: 50)
    """
    section_type = request.query_params.get('section', 'trending')
    custom_query = request.query_params.get('query')
    limit = int(request.query_params.get('limit', 50))
    user = request.user
    
    try:
        # Use helper function to get search query
        search_query = custom_query if custom_query else _get_search_query_for_section(section_type, user)
        
        # Perform search
        results = youtube_search(search_query)
        
        # Only do additional search if we got very few results
        if len(results) < 5 and len(results) > 0:
            try:
                additional_query = f"{search_query} official"
                additional_results = youtube_search(additional_query)
                
                # Merge and remove duplicates
                existing_ids = {song['id'] for song in results}
                for song in additional_results:
                    if song['id'] not in existing_ids:
                        results.append(song)
                        existing_ids.add(song['id'])
            except:
                pass  # If additional search fails, just use what we have
        
        # Limit results
        results = results[:limit]
        
        return Response({
            'section': section_type,
            'query': search_query,
            'total': len(results),
            'songs': results
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error fetching section songs: {e}")
        return Response({
            'error': str(e),
            'section': section_type,
            'songs': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)