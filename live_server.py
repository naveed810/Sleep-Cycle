"""
Sleep Cycle™ - Dedicated Live Server
Serves frontend/dist with SPA fallback, CORS headers, and dual path support (/ and /frontend/dist/).
Automatically handles ports 5500 / 5501 with fallback.
"""

import os
import sys
import socket
from http.server import HTTPServer, SimpleHTTPRequestHandler

DEFAULT_PORT = 5500
HOST = "0.0.0.0"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, "frontend", "dist")

if not os.path.exists(DIST_DIR):
    print(f"Error: Directory {DIST_DIR} does not exist.")
    sys.exit(1)


class LiveServerHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

    def do_GET(self):
        # Normalize paths prefixed with /frontend/dist
        if self.path.startswith("/frontend/dist"):
            self.path = self.path[len("/frontend/dist"):] or "/"

        # SPA fallback: if file does not exist, serve index.html
        clean_path = self.path.split("?")[0].split("#")[0].lstrip("/")
        full_path = os.path.join(DIST_DIR, clean_path)

        if clean_path and not os.path.exists(full_path):
            self.path = "/index.html"
        elif not clean_path or os.path.isdir(full_path):
            self.path = "/index.html"

        return super().do_GET()

    def do_OPTIONS(self):
        self.send_response(200, "OK")
        self.end_headers()

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def log_message(self, format, *args):
        sys.stdout.write(f"[LiveServer] {self.address_string()} - {args[0]} {args[1]}\n")
        sys.stdout.flush()


def find_available_port(preferred_port=5500):
    for port in [preferred_port, 5501, 5502, 5503]:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind((HOST, port))
                return port
            except OSError:
                continue
    return preferred_port


def run():
    target_port = DEFAULT_PORT
    if len(sys.argv) > 1:
        try:
            target_port = int(sys.argv[1])
        except ValueError:
            pass

    actual_port = find_available_port(target_port)
    server_address = (HOST, actual_port)
    httpd = HTTPServer(server_address, LiveServerHandler)

    print("============================================================")
    print("  🌙 SLEEP CYCLE™ - LIVE SERVER ACTIVE")
    print(f"  Local:    http://localhost:{actual_port}/")
    print(f"  Network:  http://127.0.0.1:{actual_port}/")
    print(f"  Serving:  {DIST_DIR}")
    print("============================================================")
    sys.stdout.flush()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nLive Server stopped.")
        httpd.server_close()


if __name__ == "__main__":
    run()
