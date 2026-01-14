from youtubesearchpython import VideosSearch
import yt_dlp
import random

"""
Function for youtube search query with robust None handling
"""
def youtube_search(query):
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
                print(f"Error processing item: {item_error}")
                continue
        
        return cleaned_results
    
    except Exception as e:
        print(f"Search error: {e}")
        return []


# Function for getting audio stream url
def get_audio_stream_url(video_id):
    """
    Get direct audio stream URL from YouTube video
    """
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    dl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'skip_download': True,
        'youtube_include_dash_manifest': False,
        # Use mobile clients that don't require authentication
        'extractor_args': {
            'youtube': {
                'player_client': ['android', 'ios'],
                'player_skip': ['webpage', 'configs'],
            }
        },
    }
    
    try:
        with yt_dlp.YoutubeDL(dl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            return info.get('url', '')
    except Exception as e:
        print(f"Stream URL error: {e}")
        raise


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

    ydl_opts = {
        'extract_flat': True,
        'quiet': True,
        'no_warnings': True,
        'playlist_end': 20,
        'extractor_args': {
            'youtube': {
                'player_client': ['android', 'ios'],
                'player_skip': ['webpage', 'configs'],
            }
        },
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
        print(f"YouTube Mix error: {e}")

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
            print(f"Fallback search error: {e}")

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