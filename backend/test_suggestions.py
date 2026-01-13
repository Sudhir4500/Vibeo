from youtubesearchpython import Suggestions
import json

def test_suggestions(query):
    try:
        suggestions = Suggestions()
        # This is for search suggestions (autocomplete)
        # Not quite what we want (related videos)
        results = suggestions.get(query)
        print(f"Suggestions for '{query}':")
        print(json.dumps(results, indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_suggestions("Never Gonna Give You Up")
