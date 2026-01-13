from youtubesearchpython import Video
import json

try:
    video_id = 'aqz-KE-bpKQ'
    video = Video.get(f'https://www.youtube.com/watch?v={video_id}')
    print("KEYS:", video.keys())
    # Suggestions is usually in 'suggestions' or part of the response
    suggestions = video.get('suggestions', [])
    print(f"FOUND {len(suggestions)} SUGGESTIONS")
    if suggestions:
        print("FIRST SUGGESTION:", json.dumps(suggestions[0], indent=2))
except Exception as e:
    print(f"ERROR: {e}")
