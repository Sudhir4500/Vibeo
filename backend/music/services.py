from youtubesearchpython import VideosSearch
import yt_dlp
"""
function for youtube search query
"""
def youtube_search(query):
     #this library handle scrapping of youtube search results 
    search= VideosSearch(query, limit = 10)
    results= search.result()["result"]

    cleaned_results = []
    for result in results:
        cleaned_results.append({
            "id": result["id"],
            "title": result["title"],
            "thumbnail": result["thumbnails"][0]["url"],
            "duration": result["duration"],
            "artist": result["channel"]["name"],
        })
    return cleaned_results
   

# function for getting audio stream url
def get_audio_stream_url(video_id):
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    ydl_opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'force_generic_extractor': False,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=False)
        return info['url']
    
