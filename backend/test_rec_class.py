try:
    from youtubesearchpython import Recommendations
    print("Recommendations class found!")
    rec = Recommendations("dQw4w9WgXcQ")
    print(rec.result())
except ImportError:
    print("Recommendations class NOT found!")
except Exception as e:
    print(f"Error: {e}")
