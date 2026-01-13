import sys
import os

# Add the current directory to sys.path
sys.path.append('c:\\Users\\acer\\Desktop\\musicPlayer\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from music.services import get_recommendations
import json

def test_new_recommendations(video_id, title):
    print(f"Testing recommendations for: {title} ({video_id})")
    recs = get_recommendations(video_id, title)
    print(f"Received {len(recs)} recommendations")
    for r in recs:
        print(f"- {r['title']} by {r['artist']} [{r['id']}]")

if __name__ == "__main__":
    # Test with a popular pop song
    test_new_recommendations("kJQP7kiw5Fk", "Despacito")
