from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def home_view(request):
    return JsonResponse({"message": "Music Player API is running", "status": "ok"})

urlpatterns = [
    path('', home_view), # Root URL
    path('admin/', admin.site.urls),
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')),
    path('api/music/', include('music.urls')),
]
