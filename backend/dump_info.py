import yt_dlp
import json

def dump_info(video_id):
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=False)
        # Remove large fields
        if 'formats' in info: del info['formats']
        if 'thumbnails' in info: del info['thumbnails']
        
        with open('info_dump.json', 'w') as f:
            json.dump(info, f, indent=2)
        print("Done dumping info to info_dump.json")

if __name__ == "__main__":
    dump_info("dQw4w9WgXcQ")
