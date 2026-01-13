from youtubesearchpython import Video
import json

def test_video_info(video_id):
    try:
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        video = Video.getInfo(video_url)
        print(f"Keys in video info: {video.keys()}")
        # Check for something related to recommendations or related videos
        if 'recommendations' in video:
            print(f"Found recommendations: {len(video['recommendations'])}")
        
        # Print a bit of the info to see what's there
        print(json.dumps({k: video[k] for k in list(video.keys())[:10]}, indent=2))
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_video_info("dQw4w9WgXcQ")
