#!/usr/bin/env python3
"""Small threaded static server compatible with the server's Python 3.6."""

import mimetypes
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn

mimetypes.add_type("application/vnd.android.package-archive", ".apk")


class AbyssStaticHandler(SimpleHTTPRequestHandler):
    extensions_map = dict(SimpleHTTPRequestHandler.extensions_map)
    extensions_map[".apk"] = "application/vnd.android.package-archive"

    def end_headers(self):
        if self.path.endswith("/manifest.json") or self.path.endswith("/manifest.sig"):
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()


class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


if __name__ == "__main__":
    ThreadingHTTPServer(("0.0.0.0", 9091), AbyssStaticHandler).serve_forever()
