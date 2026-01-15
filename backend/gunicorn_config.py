# Gunicorn configuration for Render deployment

import multiprocessing

# Increase timeout to handle slow YouTube API calls
timeout = 120  # 2 minutes (was 30 seconds by default)
graceful_timeout = 120
keepalive = 5

# Worker configuration
workers = 2  # For free tier Render
worker_class = 'sync'
worker_connections = 1000
max_requests = 1000  # Restart workers after 1000 requests to prevent memory leaks
max_requests_jitter = 50

# Logging
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# Server mechanics
daemon = False
pidfile = None
umask = 0
user = None
group = None
tmp_upload_dir = None

# Binding
bind = '0.0.0.0:10000'  # Render's default port