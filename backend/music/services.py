import requests
import yt_dlp
import random
from youtubesearchpython import VideosSearch

# ==================== CONFIGURATION ====================

# Invidious instances (public, no auth required)
INVIDIOUS_INSTANCES = [
    'https://inv.nadeko.net',
    'https://invidious.fdn.fr',
    'https://invidious.protokolla.fi',
    'https://inv.riverside.rocks',
    'https://yt.artemislena.eu',
]

# Piped instances (backup)
PIPED_INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.projectsegfau.lt',
    'https://pipedapi.adminforge.de',
]

# ==================== SEARCH ====================

def youtube_search(query):
    """
    Search for videos using multiple methods with fallbacks
    """
    # Method 1: Try Invidious API (fast and reliable)
    try:
        results = search_with_invidious(query)
        if results:
            print(f"✅ Invidious search successful: {len(results)} results")
            return results
    except Exception as e:
        print(f"⚠️ Invidious search failed: {e}")
    
    # Method 2: Try Piped API
    try:
        results = search_with_piped(query)
        if results:
            print(f"✅ Piped search successful: {len(results)} results")
            return results
    except Exception as e:
        print(f"⚠️ Piped search failed: {e}")
    
    # Method 3: Fallback to youtubesearchpython (may fail on Render)
    try:
        results = search_with_youtube_search_python(query)
        if results:
            print(f"✅ YouTubeSearchPython successful: {len(results)} results")
            return results
    except Exception as e:
        print(f"⚠️ YouTubeSearchPython failed: {e}")
    
    print("❌ All search methods failed")
    return []


def search_with_invidious(query):
    """Search using Invidious API"""
    for instance in INVIDIOUS_INSTANCES:
        try:
            response = requests.get(
                f'{instance}/api/v1/search',
                params={
                    'q': query,
                    'type': 'video',
                    'sort_by': 'relevance',
                    'page': 1
                },
                timeout=10,
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            
            if response.status_code == 200:
                results = response.json()
                
                cleaned_results = []
                for item in results[:10]:
                    try:
                        video_id = item.get('videoId', '')
                        if not video_id:
                            continue
                        
                        # Get best thumbnail
                        thumbnails = item.get('videoThumbnails', [])
                        thumbnail = ''
                        if thumbnails:
                            # Try to get high quality thumbnail
                            for t in thumbnails:
                                if t.get('quality') in ['high', 'maxres', 'sddefault']:
                                    thumbnail = t.get('url', '')
                                    break
                            if not thumbnail:
                                thumbnail = thumbnails[0].get('url', '')
                        
                        # Format duration
                        duration_seconds = item.get('lengthSeconds', 0)
                        duration = format_duration(duration_seconds)
                        
                        cleaned_results.append({
                            'id': video_id,
                            'title': item.get('title', 'Unknown Title'),
                            'thumbnail': thumbnail or f'https://i.ytimg.com/vi/{video_id}/hqdefault.jpg',
                            'duration': duration,
                            'artist': item.get('author', 'Unknown Artist'),
                        })
                    except Exception as e:
                        print(f"Error processing Invidious item: {e}")
                        continue
                
                if cleaned_results:
                    return cleaned_results
        
        except Exception as e:
            print(f"Invidious instance {instance} failed: {e}")
            continue
    
    raise Exception("All Invidious instances failed")


def search_with_piped(query):
    """Search using Piped API"""
    for instance in PIPED_INSTANCES:
        try:
            response = requests.get(
                f'{instance}/search',
                params={
                    'q': query,
                    'filter': 'all'  # or 'music_songs' for music only
                },
                timeout=10,
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            
            if response.status_code == 200:
                data = response.json()
                results = data.get('items', [])
                
                cleaned_results = []
                for item in results[:10]:
                    try:
                        # Extract video ID from URL
                        url = item.get('url', '')
                        video_id = url.replace('/watch?v=', '')
                        
                        if not video_id or video_id == url:
                            continue
                        
                        # Format duration
                        duration_seconds = item.get('duration', 0)
                        if duration_seconds == -1:  # Live stream
                            duration = 'LIVE'
                        else:
                            duration = format_duration(duration_seconds)
                        
                        cleaned_results.append({
                            'id': video_id,
                            'title': item.get('title', 'Unknown Title'),
                            'thumbnail': item.get('thumbnail', f'https://i.ytimg.com/vi/{video_id}/hqdefault.jpg'),
                            'duration': duration,
                            'artist': item.get('uploaderName', 'Unknown Artist'),
                        })
                    except Exception as e:
                        print(f"Error processing Piped item: {e}")
                        continue
                
                if cleaned_results:
                    return cleaned_results
        
        except Exception as e:
            print(f"Piped instance {instance} failed: {e}")
            continue
    
    raise Exception("All Piped instances failed")


def search_with_youtube_search_python(query):
    """Original search method using youtubesearchpython"""
    try:
        search = VideosSearch(query, limit=10)
        results = search.result().get("result", [])

        cleaned_results = []
        for result in results:
            try:
                if not result or not result.get("id"):
                    continue

                title = result.get("title")
                if not title or title is None:
                    title = "Unknown Title"
                
                thumbnail = ""
                thumbnails = result.get("thumbnails")
                if thumbnails and isinstance(thumbnails, list) and len(thumbnails) > 0:
                    thumbnail_obj = thumbnails[0]
                    if thumbnail_obj and isinstance(thumbnail_obj, dict):
                        thumbnail = thumbnail_obj.get("url", "")
                
                duration = result.get("duration")
                if not duration or duration is None:
                    duration = "0:00"
                
                artist = "Unknown Artist"
                channel = result.get("channel")
                if channel and isinstance(channel, dict):
                    channel_name = channel.get("name")
                    if channel_name and channel_name is not None:
                        artist = channel_name

                if result.get("id") and title and thumbnail:
                    cleaned_results.append({
                        "id": result["id"],
                        "title": str(title),
                        "thumbnail": str(thumbnail),
                        "duration": str(duration),
                        "artist": str(artist),
                    })
            except Exception as item_error:
                print(f"Error processing item: {item_error}")
                continue
        
        return cleaned_results
    
    except Exception as e:
        print(f"YouTubeSearchPython error: {e}")
        raise


def format_duration(seconds):
    """Convert seconds to MM:SS or HH:MM:SS format"""
    try:
        seconds = int(seconds)
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60
        
        if hours > 0:
            return f"{hours}:{minutes:02d}:{secs:02d}"
        else:
            return f"{minutes}:{secs:02d}"
    except:
        return "0:00"


# ==================== AUDIO STREAMING ====================

def get_audio_stream_url(video_id):
    """
    Get direct audio stream URL using multiple methods with fallbacks
    Priority: Invidious -> Piped -> yt-dlp
    """
    print(f"\n🎵 Getting stream URL for video: {video_id}")
    
    # Method 1: Try Invidious (fastest and most reliable)
    try:
        url = get_stream_from_invidious(video_id)
        if url:
            print(f"✅ Invidious stream successful")
            return url
    except Exception as e:
        print(f"⚠️ Invidious stream failed: {e}")
    
    # Method 2: Try Piped
    try:
        url = get_stream_from_piped(video_id)
        if url:
            print(f"✅ Piped stream successful")
            return url
    except Exception as e:
        print(f"⚠️ Piped stream failed: {e}")
    
    # Method 3: Fallback to yt-dlp (may fail on Render without cookies)
    try:
        url = get_stream_from_ytdlp(video_id)
        if url:
            print(f"✅ yt-dlp stream successful")
            return url
    except Exception as e:
        print(f"⚠️ yt-dlp stream failed: {e}")
    
    # If all methods fail
    print(f"❌ All streaming methods failed for {video_id}")
    raise Exception("Could not retrieve stream URL from any source")


def get_stream_from_invidious(video_id):
    """Get stream URL from Invidious instances"""
    for instance in INVIDIOUS_INSTANCES:
        try:
            response = requests.get(
                f'{instance}/api/v1/videos/{video_id}',
                timeout=15,
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Try adaptive formats first (better quality)
                audio_formats = [
                    f for f in data.get('adaptiveFormats', [])
                    if f.get('type', '').startswith('audio')
                ]
                
                if audio_formats:
                    # Sort by bitrate and get highest quality
                    best_audio = max(audio_formats, key=lambda x: x.get('bitrate', 0))
                    stream_url = best_audio.get('url')
                    
                    if stream_url:
                        return stream_url
        
        except Exception as e:
            print(f"Invidious instance {instance} failed: {e}")
            continue
    
    raise Exception("All Invidious instances failed for streaming")


def get_stream_from_piped(video_id):
    """Get stream URL from Piped instances"""
    for instance in PIPED_INSTANCES:
        try:
            response = requests.get(
                f'{instance}/streams/{video_id}',
                timeout=15,
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Get audio streams
                audio_streams = data.get('audioStreams', [])
                
                if audio_streams:
                    # Get highest quality audio
                    best_audio = max(audio_streams, key=lambda x: x.get('bitrate', 0))
                    stream_url = best_audio.get('url')
                    
                    if stream_url:
                        return stream_url
        
        except Exception as e:
            print(f"Piped instance {instance} failed: {e}")
            continue
    
    raise Exception("All Piped instances failed for streaming")


def get_stream_from_ytdlp(video_id):
    """Fallback to yt-dlp (may require cookies on some servers)"""
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    
    dl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'skip_download': True,
        'youtube_include_dash_manifest': False,
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'referer': 'https://www.youtube.com/',
        'socket_timeout': 30,
    }
    
    try:
        with yt_dlp.YoutubeDL(dl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            return info.get('url', '')
    except Exception as e:
        print(f"yt-dlp extraction failed: {e}")
        raise


# ==================== RECOMMENDATIONS ====================

def get_recommendations(video_id, title, artist=""):
    """
    Get recommendations using hybrid approach
    """
    print(f"\n🎯 Getting recommendations for: {title}")
    
    # Ensure artist is a string
    if artist is None:
        artist = ""
    
    # Method 1: Try Invidious recommendations
    try:
        recommendations = get_recommendations_from_invidious(video_id)
        if recommendations and len(recommendations) >= 8:
            print(f"✅ Invidious recommendations: {len(recommendations)} results")
            return recommendations[:12]
    except Exception as e:
        print(f"⚠️ Invidious recommendations failed: {e}")
    
    # Method 2: Try search-based recommendations
    try:
        if artist and artist.strip():
            search_query = f"{artist} official music"
        elif title and title.strip():
            search_query = f"{title} official audio"
        else:
            search_query = "popular music"
        
        recommendations = youtube_search(search_query)
        
        # Filter out the current video
        recommendations = [r for r in recommendations if r.get('id') != video_id]
        
        if recommendations:
            print(f"✅ Search-based recommendations: {len(recommendations)} results")
            random.shuffle(recommendations)
            return recommendations[:12]
    
    except Exception as e:
        print(f"⚠️ Search-based recommendations failed: {e}")
    
    print("⚠️ No recommendations found")
    return []


def get_recommendations_from_invidious(video_id):
    """Get related videos from Invidious"""
    for instance in INVIDIOUS_INSTANCES:
        try:
            response = requests.get(
                f'{instance}/api/v1/videos/{video_id}',
                timeout=10,
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            
            if response.status_code == 200:
                data = response.json()
                recommended_videos = data.get('recommendedVideos', [])
                
                cleaned_results = []
                for video in recommended_videos:
                    try:
                        rec_id = video.get('videoId', '')
                        if not rec_id or rec_id == video_id:
                            continue
                        
                        duration_seconds = video.get('lengthSeconds', 0)
                        duration = format_duration(duration_seconds)
                        
                        # Get thumbnails
                        thumbnails = video.get('videoThumbnails', [])
                        thumbnail = ''
                        if thumbnails:
                            for t in thumbnails:
                                if t.get('quality') in ['high', 'maxres']:
                                    thumbnail = t.get('url', '')
                                    break
                            if not thumbnail:
                                thumbnail = thumbnails[0].get('url', '')
                        
                        if not thumbnail:
                            thumbnail = f'https://i.ytimg.com/vi/{rec_id}/hqdefault.jpg'
                        
                        cleaned_results.append({
                            'id': rec_id,
                            'title': video.get('title', 'Unknown Title'),
                            'thumbnail': thumbnail,
                            'duration': duration,
                            'artist': video.get('author', 'Unknown Artist'),
                        })
                    except Exception as e:
                        print(f"Error processing recommendation: {e}")
                        continue
                
                if cleaned_results:
                    return cleaned_results
        
        except Exception as e:
            print(f"Invidious instance {instance} failed for recommendations: {e}")
            continue
    
    raise Exception("All Invidious instances failed for recommendations")