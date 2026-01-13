import yt_dlp
import json

def test_yt_dlp_related(video_id):
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True, # Keep it fast
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=False)
        # Check if there is a 'related_videos' key or similar
        print(f"Keys in info: {info.keys()}")
        if 'related_videos' in info:
            print(f"Found related_videos: {len(info['related_videos'])}")
            print(json.dumps(info['related_videos'][:2], indent=2))
        else:
            print("related_videos not found in info")

if __name__ == "__main__":
    test_yt_dlp_related("dQw4w9WgXcQ") # Rickroll for testing
