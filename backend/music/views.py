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
        data = request.data  # DRF automatically parses JSON
        vid_id = data.get('id')
        
        if not vid_id:
            return Response({'error': 'Missing song ID'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # 1. Get or create the "Liked Songs" playlist for this user
            playlist, _ = Playlist.objects.get_or_create(
                user=request.user,
                name="Liked Songs"
            )

            # 2. Get or create the Song in your DB using video_id
            song, created = Song.objects.get_or_create(
                video_id=vid_id,
                defaults={
                    'title': data.get('title', 'Unknown Title'),
                    'artist': data.get('artist', 'Unknown Artist'),
                    'thumbnail': data.get('thumbnail', ''),
                    'duration': str(data.get('duration', '')),
                }
            )
            
            # If song already exists, update its metadata
            if not created:
                song.title = data.get('title', song.title)
                song.artist = data.get('artist', song.artist)
                song.thumbnail = data.get('thumbnail', song.thumbnail)
                song.duration = str(data.get('duration', song.duration))
                song.save()

            # 3. Toggle logic - Check if song exists in this playlist
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
        
        # Return songs in reverse order (newest first)
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


# ==================== DISCOVERY / HOME ====================

def _get_search_query_for_section(section_type, user):
    """
    Helper function to get search query based on section type.
    Centralizes search query logic to avoid duplication.
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
    Spotify-style home screen with diverse content sections.
    Returns: Trending, Personalized Mix, New Releases, Popular Artists, and Genre-based playlists
    """
    try:
        user = request.user
        sections = []

        # 1. TRENDING NOW
        print("=" * 50)
        print("🏠 Starting Home Discovery")
        print("=" * 50)
        
        trending_queries = ["pop music 2025", "trending music", "top songs"]
        trending = []
        for query in trending_queries:
            print(f"\n📊 Trying Trending query: {query}")
            try:
                trending = youtube_search(query)
                if trending and len(trending) >= 6:
                    print(f"✅ Success! Got {len(trending)} results")
                    break
            except Exception as e:
                print(f"❌ Query failed: {e}")
                continue
        
        if trending:
            sections.append({
                'title': 'Trending Now',
                'type': 'horizontal',
                'data': trending[:12]
            })
            print(f"✅ Added Trending section with {len(trending[:12])} items")

        # 2. MADE FOR YOU
        print("\n💝 Building Made For You section...")
        try:
            personalized = youtube_search(_get_search_query_for_section('personalized', user))
            if personalized:
                sections.append({
                    'title': 'Made For You',
                    'type': 'horizontal',
                    'data': personalized[:12]
                })
                print(f"✅ Added Made For You with {len(personalized[:12])} items")
        except Exception as e:
            print(f"❌ Made For You error: {e}")

        # 3. NEW RELEASES
        print("\n🆕 Fetching New Releases...")
        try:
            new_releases = youtube_search("new music 2025")
            if new_releases:
                sections.append({
                    'title': 'New Releases',
                    'type': 'horizontal',
                    'data': new_releases[:12]
                })
                print(f"✅ Added New Releases with {len(new_releases[:12])} items")
        except Exception as e:
            print(f"❌ New Releases error: {e}")

        # 4. POPULAR RIGHT NOW
        print("\n⭐ Fetching Popular content...")
        try:
            popular = youtube_search("popular songs right now")
            if popular:
                sections.append({
                    'title': 'Popular Right Now',
                    'type': 'horizontal',
                    'data': popular[:12]
                })
                print(f"✅ Added Popular with {len(popular[:12])} items")
        except Exception as e:
            print(f"❌ Popular error: {e}")

        # 5. QUICK PICKS
        print("\n⚡ Fetching Quick Picks...")
        try:
            quick_picks = youtube_search("music 2025")
            if quick_picks:
                sections.append({
                    'title': 'Quick Picks',
                    'type': 'horizontal',
                    'data': quick_picks[:10]
                })
                print(f"✅ Added Quick Picks with {len(quick_picks[:10])} items")
        except Exception as e:
            print(f"❌ Quick Picks error: {e}")

        # Filter out empty sections
        sections = [s for s in sections if s.get('data') and len(s['data']) > 0]

        print(f"\n{'=' * 50}")
        print(f"✅ FINAL: Returning {len(sections)} sections")
        for section in sections:
            print(f"  - {section['title']}: {len(section['data'])} items")
        print(f"{'=' * 50}\n")

        # Emergency fallback
        if not sections:
            print("⚠️  No sections found, using emergency fallback")
            fallback = youtube_search("music")
            if fallback:
                sections.append({
                    'title': 'Discover Music',
                    'type': 'horizontal',
                    'data': fallback[:12]
                })

        return Response({'sections': sections}, status=status.HTTP_200_OK)

    except Exception as e:
        print(f"\n❌ CRITICAL ERROR in get_home_discovery: {str(e)}")
        import traceback
        traceback.print_exc()
        
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
        
        # If we need more results, do additional search
        if len(results) < limit and len(results) < 50:
            additional_query = f"{search_query} official audio"
            additional_results = youtube_search(additional_query)
            
            # Merge and remove duplicates
            existing_ids = {song['id'] for song in results}
            for song in additional_results:
                if song['id'] not in existing_ids:
                    results.append(song)
                    existing_ids.add(song['id'])
        
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