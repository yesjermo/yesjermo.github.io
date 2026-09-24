"""Run: python3 start-preview.py. Press Ctrl+C to stop."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import webbrowser

if __name__ == '__main__':
    root = Path(__file__).resolve().parent
    handler = partial(SimpleHTTPRequestHandler, directory=str(root))
    with ThreadingHTTPServer(('127.0.0.1', 0), handler) as server:
        address = f'http://127.0.0.1:{server.server_port}/index.html'
        print(f'Open {address}\nKeep this terminal open. Press Ctrl+C to stop.', flush=True)
        webbrowser.open(address)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print('\nPreview stopped.')
