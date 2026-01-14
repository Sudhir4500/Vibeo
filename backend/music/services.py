from youtubesearchpython import VideosSearch
import yt_dlp
import requests
import random
import time
import json
from functools import lru_cache
from typing import Optional, List, Dict, Any
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

"""
Function for youtube search query with robust None handling
"""
def youtube_search(query: str) -> List[Dict[str, str]]:
    try:
        search = VideosSearch(query, limit=10)
        results = search.result().get("result", [])

        cleaned_results = []
        for result in results:
            try:
                # Skip if result is None or doesn't have an ID
                if not result or not result.get("id"):
                    continue

                # Get title with fallback
                title = result.get("title")
                if not title or title is None:
                    title = "Unknown Title"
                
                # Get thumbnail with proper None checking
                thumbnail = ""
                thumbnails = result.get("thumbnails")
                if thumbnails and isinstance(thumbnails, list) and len(thumbnails) > 0:
                    thumbnail_obj = thumbnails[0]
                    if thumbnail_obj and isinstance(thumbnail_obj, dict):
                        thumbnail = thumbnail_obj.get("url", "")
                
                # Get duration with fallback
                duration = result.get("duration")
                if not duration or duration is None:
                    duration = "0:00"
                
                # Get artist/channel name with proper None checking
                artist = "Unknown Artist"
                channel = result.get("channel")
                if channel and isinstance(channel, dict):
                    channel_name = channel.get("name")
                    if channel_name and channel_name is not None:
                        artist = channel_name

                # Only add if we have minimum required data
                if result.get("id") and title and thumbnail:
                    cleaned_results.append({
                        "id": result["id"],
                        "title": str(title),  # Ensure it's a string
                        "thumbnail": str(thumbnail),
                        "duration": str(duration),
                        "artist": str(artist),
                    })
            except Exception as item_error:
                # Skip this item if there's any error processing it
                logger.error(f"Error processing item: {item_error}")
                continue
        
        return cleaned_results
    
    except Exception as e:
        logger.error(f"Search error: {e}")
        return []


class YouTubeStreamExtractor:
    def __init__(self):
        self.last_request_time = 0
        self.request_count = 0
        self.min_request_interval = 1.0  # Minimum seconds between requests
        self.max_requests_per_minute = 25  # Rate limit
        
    def rate_limit(self):
        """Implement rate limiting to avoid being blocked"""
        current_time = time.time()
        elapsed = current_time - self.last_request_time
        
        # Reset counter every minute
        if elapsed > 60:
            self.request_count = 0
            
        # Check if we're hitting rate limits
        if self.request_count >= self.max_requests_per_minute:
            wait_time = 5 + random.uniform(1, 3)
            logger.warning(f"Rate limit approaching. Waiting {wait_time:.1f} seconds")
            time.sleep(wait_time)
            self.request_count = 0
        
        # Ensure minimum time between requests
        if elapsed < self.min_request_interval:
            sleep_time = self.min_request_interval - elapsed
            time.sleep(sleep_time)
            
        self.last_request_time = time.time()
        self.request_count += 1
        
        # Add random delay to avoid patterns
        time.sleep(random.uniform(0.3, 1.0))
    
    @lru_cache(maxsize=100)
    def get_stream_url(self, video_id: str, method: str = 'auto') -> Optional[str]:
        """
        Get stream URL with multiple fallback methods
        
        Args:
            video_id: YouTube video ID
            method: 'auto', 'yt_dlp', 'piped', 'invidious', or 'embed'
            
        Returns:
            Audio stream URL or None if all methods fail
        """
        self.rate_limit()
        logger.info(f"Getting stream for video: {video_id}")
        
        # Ordered list of methods to try
        if method == 'auto':
            methods = ['yt_dlp', 'piped', 'invidious', 'embed']
        else:
            methods = [method]
        
        for method_name in methods:
            try:
                if method_name == 'yt_dlp':
                    stream_url = self._yt_dlp_method(video_id)
                elif method_name == 'piped':
                    stream_url = self._piped_method(video_id)
                elif method_name == 'invidious':
                    stream_url = self._invidious_method(video_id)
                elif method_name == 'embed':
                    stream_url = self._embed_method(video_id)
                else:
                    continue
                
                if stream_url:
                    logger.info(f"Successfully got stream using {method_name}")
                    return stream_url
                    
            except Exception as e:
                logger.error(f"Method {method_name} failed: {e}")
                continue
        
        logger.error(f"All methods failed for video {video_id}")
        return None
    
    def _yt_dlp_method(self, video_id: str) -> Optional[str]:
        """yt-dlp with rotating configurations"""
        configs = [
            # Config 1: Mobile Android client
            {
                'format': 'bestaudio/best',
                'extractor_args': {
                    'youtube': {
                        'player_client': ['android'],
                        'player_skip': ['webpage', 'configs'],
                    }
                },
                'http_headers': {
                    'User-Agent': 'com.google.android.youtube/19.29.37 (Linux; U; Android 11) gzip',
                    'X-YouTube-Client-Name': '3',
                    'X-YouTube-Client-Version': '19.29.37',
                },
                'ignoreerrors': True,
                'retries': 3,
                'fragment_retries': 3,
            },
            # Config 2: iOS client
            {
                'format': 'bestaudio/best',
                'extractor_args': {
                    'youtube': {
                        'player_client': ['ios'],
                        'player_skip': ['webpage', 'configs'],
                    }
                },
                'http_headers': {
                    'User-Agent': 'com.google.ios.youtube/17.36.4 (iPhone14,3; U; CPU iOS 15_6 like Mac OS X)',
                    'X-YouTube-Client-Name': '5',
                    'X-YouTube-Client-Version': '17.36.4',
                },
                'ignoreerrors': True,
                'retries': 3,
            },
            # Config 3: TV client
            {
                'format': 'bestaudio/best',
                'extractor_args': {
                    'youtube': {
                        'player_client': ['tv'],
                        'player_skip': ['webpage'],
                    }
                },
                'http_headers': {
                    'User-Agent': 'SmartTV',
                },
                'ignoreerrors': True,
            },
            # Config 4: Minimal configuration
            {
                'format': 'bestaudio/best',
                'ignoreerrors': True,
                'no_warnings': True,
                'quiet': True,
            }
        ]
        
        for config in configs:
            try:
                # Add common options
                config.update({
                    'skip_download': True,
                    'quiet': True,
                    'no_warnings': True,
                    'no_check_certificate': True,
                })
                
                with yt_dlp.YoutubeDL(config) as ydl:
                    info = ydl.extract_info(
                        f"https://www.youtube.com/watch?v={video_id}", 
                        download=False
                    )
                    if info and 'url' in info:
                        return info['url']
                        
            except Exception as e:
                logger.debug(f"yt-dlp config failed: {e}")
                continue
        
        return None
    
    def _piped_method(self, video_id: str) -> Optional[str]:
        """Use Piped API (privacy-focused YouTube frontend)"""
        # List of Piped instances with priority
        piped_instances = [
            "https://pipedapi.kavin.rocks",           # Primary
            "https://piped-api.garudalinux.org",       # Backup 1
            "https://pipedapi.moomoo.me",              # Backup 2
            "https://api.piped.projectsegfau.lt",      # Backup 3
        ]
        
        for instance in piped_instances:
            try:
                logger.debug(f"Trying Piped instance: {instance}")
                api_url = f"{instance}/streams/{video_id}"
                
                # Use a timeout to avoid hanging
                response = requests.get(api_url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Get audio streams
                    audio_streams = data.get('audioStreams', [])
                    
                    # Try to find medium quality first
                    for stream in audio_streams:
                        if stream.get('quality') == 'AUDIO_QUALITY_MEDIUM':
                            url = stream.get('url')
                            if url:
                                return url
                    
                    # If no medium quality, take the first available
                    if audio_streams:
                        url = audio_streams[0].get('url')
                        if url:
                            return url
                    
                    # Fallback to video with audio
                    video_streams = data.get('videoStreams', [])
                    for stream in video_streams:
                        if stream.get('hasAudio'):
                            url = stream.get('url')
                            if url:
                                return url
                                
            except requests.exceptions.Timeout:
                logger.warning(f"Piped instance {instance} timeout")
                continue
            except Exception as e:
                logger.debug(f"Piped instance {instance} error: {e}")
                continue
        
        return None
    
    def _invidious_method(self, video_id: str) -> Optional[str]:
        """Use Invidious API"""
        invidious_instances = [
            "https://inv.riverside.rocks",      # Primary
            "https://yewtu.be",                 # Backup 1
            "https://invidious.nerdvpn.de",     # Backup 2
            "https://vid.puffyan.us",           # Backup 3
        ]
        
        for instance in invidious_instances:
            try:
                logger.debug(f"Trying Invidious instance: {instance}")
                api_url = f"{instance}/api/v1/videos/{video_id}"
                
                response = requests.get(api_url, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check adaptive formats (audio only)
                    adaptive_formats = data.get('adaptiveFormats', [])
                    
                    # Find audio formats
                    audio_formats = []
                    for fmt in adaptive_formats:
                        fmt_type = fmt.get('type', '')
                        fmt_url = fmt.get('url')
                        
                        if fmt_url and ('audio/' in fmt_type or 'm4a' in fmt_type or 'webm' in fmt_type):
                            audio_formats.append({
                                'url': fmt_url,
                                'bitrate': fmt.get('bitrate', 0),
                            })
                    
                    # Sort by bitrate (higher is better)
                    audio_formats.sort(key=lambda x: x['bitrate'], reverse=True)
                    
                    if audio_formats:
                        return audio_formats[0]['url']
                        
            except requests.exceptions.Timeout:
                logger.warning(f"Invidious instance {instance} timeout")
                continue
            except Exception as e:
                logger.debug(f"Invidious instance {instance} error: {e}")
                continue
        
        return None
    
    def _embed_method(self, video_id: str) -> Optional[str]:
        """Extract from YouTube embed page"""
        try:
            embed_url = f"https://www.youtube.com/embed/{video_id}"
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
            
            response = requests.get(embed_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                # Look for player config JSON
                import re
                
                # Pattern 1: Look for player_response JSON
                patterns = [
                    r'var ytInitialPlayerResponse\s*=\s*({.*?});',
                    r'ytInitialPlayerResponse\s*=\s*({.*?});',
                    r'"player_response":"({.*?})"',
                    r'"url":"([^"]*m3u8[^"]*)"',
                    r'"audioUrl":"([^"]*)"',
                ]
                
                for pattern in patterns:
                    matches = re.findall(pattern, response.text, re.DOTALL)
                    for match in matches:
                        if isinstance(match, str) and 'm3u8' in match:
                            return match
                        elif isinstance(match, str) and match.startswith('{'):
                            try:
                                player_response = json.loads(match.replace('\\"', '"'))
                                
                                # Extract streaming data
                                streaming_data = player_response.get('streamingData', {})
                                
                                # Check adaptive formats
                                adaptive_formats = streaming_data.get('adaptiveFormats', [])
                                for fmt in adaptive_formats:
                                    if 'audio' in fmt.get('mimeType', '').lower():
                                        url = fmt.get('url')
                                        if url:
                                            return url
                                
                                # Check regular formats
                                formats = streaming_data.get('formats', [])
                                for fmt in formats:
                                    if 'audio' in fmt.get('mimeType', '').lower():
                                        url = fmt.get('url')
                                        if url:
                                            return url
                                        
                            except json.JSONDecodeError:
                                continue
                                
        except Exception as e:
            logger.debug(f"Embed method error: {e}")
        
        return None

# Initialize the extractor globally
stream_extractor = YouTubeStreamExtractor()

# Function for getting audio stream url
def get_audio_stream_url(video_id: str) -> Optional[str]:
    """
    Public function to get audio stream URL using hybrid approach
    
    Args:
        video_id: YouTube video ID
        
    Returns:
        Audio stream URL or None
    """
    try:
        return stream_extractor.get_stream_url(video_id, method='auto')
    except Exception as e:
        logger.error(f"Error getting audio stream for {video_id}: {e}")
        return None


def get_recommendations(video_id, title, artist=""):
    """
    Enhanced recommendations using a mix of YouTube Mix, 
    Related Videos, and Artist-based discovery.
    """
    # Ensure artist is a string
    if artist is None:
        artist = ""
    
    # 1. YouTube Mix URL
    mix_url = f"https://www.youtube.com/watch?v={video_id}&list=RD{video_id}"
    
    # 2. Fallback search query with None handling
    if artist and artist.strip():
        fallback_query = f"{artist} official music video"
    elif title and title.strip():
        fallback_query = f"{title} official audio"
    else:
        fallback_query = "popular music"

    # Use a simpler yt-dlp config for recommendations
    ydl_opts = {
        'extract_flat': True,
        'quiet': True,
        'no_warnings': True,
        'playlist_end': 20,
        'ignoreerrors': True,
        'extractor_args': {
            'youtube': {
                'player_client': ['android'],
                'player_skip': ['webpage'],
            }
        },
        'http_headers': {
            'User-Agent': 'com.google.android.youtube/19.29.37',
        }
    }
    
    all_results = []
    
    # Try to get YouTube Mix results
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(mix_url, download=False)
            if info and 'entries' in info and info['entries']:
                for entry in info['entries']:
                    if not entry:
                        continue
                    
                    entry_id = entry.get('id')
                    if not entry_id or entry_id == video_id:
                        continue
                    
                    entry_title = entry.get('title') or 'Unknown Title'
                    entry_duration = entry.get('duration') or '0:00'
                    entry_uploader = entry.get('uploader') or entry.get('channel') or 'Various Artists'
                    
                    all_results.append({
                        "id": str(entry_id),
                        "title": str(entry_title),
                        "thumbnail": f"https://i.ytimg.com/vi/{entry_id}/hqdefault.jpg",
                        "duration": str(entry_duration),
                        "artist": str(entry_uploader),
                    })
    except Exception as e:
        logger.warning(f"YouTube Mix error: {e}")

    # Shuffle Mix results for variety
    random.shuffle(all_results)

    # If we don't have enough results, search for more
    if len(all_results) < 15:
        try:
            search = VideosSearch(fallback_query, limit=10)
            search_result = search.result()
            
            if search_result and "result" in search_result:
                search_results = search_result["result"]
                
                for res in search_results:
                    if not res or not res.get("id"):
                        continue
                    
                    res_id = res.get("id")
                    if res_id == video_id:
                        continue
                    
                    # Safe extraction with None checks
                    res_title = res.get("title") or "Unknown Title"
                    res_duration = res.get("duration") or "0:00"
                    
                    res_thumbnail = ""
                    thumbnails = res.get("thumbnails")
                    if thumbnails and isinstance(thumbnails, list) and len(thumbnails) > 0:
                        res_thumbnail = thumbnails[0].get("url", "")
                    
                    res_artist = "Unknown Artist"
                    channel = res.get("channel")
                    if channel and isinstance(channel, dict):
                        res_artist = channel.get("name") or "Unknown Artist"
                    
                    all_results.append({
                        "id": str(res_id),
                        "title": str(res_title),
                        "thumbnail": str(res_thumbnail),
                        "duration": str(res_duration),
                        "artist": str(res_artist),
                    })
        except Exception as e:
            logger.warning(f"Fallback search error: {e}")

    # Remove duplicates based on ID
    seen = set()
    unique_results = []
    for item in all_results:
        item_id = item.get('id')
        if item_id and item_id not in seen:
            unique_results.append(item)
            seen.add(item_id)

    # Shuffle and return top results
    if unique_results:
        random.shuffle(unique_results)
        return unique_results[:12]
    
    return []


# Optional: Cache for frequently accessed streams
from cachetools import TTLCache

# Cache stream URLs for 1 hour (adjust as needed)
stream_cache = TTLCache(maxsize=500, ttl=3600)

def get_audio_stream_url_cached(video_id: str) -> Optional[str]:
    """
    Get audio stream URL with caching
    """
    if video_id in stream_cache:
        logger.info(f"Cache hit for {video_id}")
        return stream_cache[video_id]
    
    stream_url = get_audio_stream_url(video_id)
    if stream_url:
        stream_cache[video_id] = stream_url
    
    return stream_url


# Usage examples
if __name__ == "__main__":
    # Test the functions
    test_video_id = "dQw4w9WgXcQ"  # Example video ID
    
    # Search for videos
    search_results = youtube_search("never gonna give you up")
    print(f"Found {len(search_results)} videos")
    
    # Get stream URL
    if search_results:
        video_id = search_results[0]["id"]
        stream_url = get_audio_stream_url_cached(video_id)
        
        if stream_url:
            print(f"Got stream URL: {stream_url[:100]}...")
        else:
            print("Failed to get stream URL")
        
        # Get recommendations
        recommendations = get_recommendations(
            video_id,
            search_results[0]["title"],
            search_results[0]["artist"]
        )
        print(f"Got {len(recommendations)} recommendations")