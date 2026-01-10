# Vibeo - Advanced Music & Video Streaming App

Vibeo is a modern, full-stack music streaming application that leverages YouTube as a content source. It features a sleek React Native frontend and a powerful Django backend, offering users a premium experience for searching, streaming, and managing their favorite tracks.

---

## 🚀 Features

- **YouTube-Powered Search**: Discover millions of songs and videos using real-time YouTube scraping.
- **Audio Streaming**: High-quality audio extraction and streaming using `yt-dlp`.
- **User Authentication**: Secure JWT-based login and registration system.
- **Personalized Library**: Like songs and manage playlists tailored to your taste.
- **Dark Mode UI**: A premium, "Spotify-inspired" dark glassmorphism design.
- **Seamless Navigation**: Smooth transitions using React Navigation.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native (with TypeScript)
- **State Management**: Zustand
- **Navigation**: React Navigation (Bottom Tabs & Stack)
- **Networking**: Axios
- **Form Handling**: React Hook Form & Zod
- **Icons**: Lucide & Ionicons

### Backend
- **Framework**: Django & Django Rest Framework (DRF)
- **Scraping/Search**: `youtube-search-python`
- **Audio Processing**: `yt-dlp`
- **Database**: SQLite (Default) / PostgreSQL (Optional)
- **Auth**: JWT (SimpleJWT)

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v20+)
- Python (3.12+)
- Android Studio / Xcode (for mobile emulation)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Unix/MacOS:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### 2. Frontend Setup
```bash
cd MusicApp
npm install
npm start
```

---

## 📸 Screenshots
later

---
