import http.server
import os
import sys

PORT = 3000
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def log_message(self, format, *args):
        # Quiet standard logging to prevent console spam
        pass

def start_server():
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    print("=" * 75)
    print(" [EV FLEET ANALYTICS PLATFORM] - THREADED WEB SERVER LAUNCHER")
    print("=" * 75)
    print(f"Serving Web Dashboard from: {DIRECTORY}")
    print(f"Server live at: http://localhost:{PORT}")
    print("Press Ctrl+C to stop the server.")
    print("=" * 75)
    
    server = http.server.ThreadingHTTPServer(("", PORT), CustomHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped cleanly.")

if __name__ == '__main__':
    start_server()

