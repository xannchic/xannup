
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

HOST = "127.0.0.1"
PORT = 8000

PROJECT_DIR = Path(__file__).resolve().parent

handler = lambda *args, **kwargs: SimpleHTTPRequestHandler(
    *args,
    directory=str(PROJECT_DIR),
    **kwargs
)

server = ThreadingHTTPServer((HOST, PORT), handler)

print("================================")
print("       XannUP SERVER")
print("================================")
print(f"Сервер запущен: http://{HOST}:{PORT}")
print(f"Сайт: http://{HOST}:{PORT}/index.html")
print("Для остановки нажми Ctrl+C")
print("================================")

try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nСервер остановлен.")
    server.server_close()
