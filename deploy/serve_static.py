#!/usr/bin/env python3
"""Small threaded static server compatible with the server's Python 3.6."""

from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn


class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", 9091), SimpleHTTPRequestHandler).serve_forever()
