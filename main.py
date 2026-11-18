
import http.server
import socketserver
import os

PORT = 8000
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

os.chdir(PROJECT_DIR)

class XannUPServer(http.server.SimpleHTTPRequestHandler):
    pass

with socketserver.TCPServer(("0.0.0.0", PORT), XannUPServer) as server:
    print("XannUP server started!")
    print("Port:", PORT)
    server.serve_forever()
