#!/usr/bin/env python3
"""Static game/update server with anonymous revisioned cloud saves (Python 3.6+)."""

import hashlib
import json
import mimetypes
import os
import re
import secrets
import sqlite3
import threading
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn
from urllib.parse import urlsplit

mimetypes.add_type("application/vnd.android.package-archive", ".apk")

SAVE_API = "/api/cloud-save"
MAX_REQUEST_BYTES = 2 * 1024 * 1024
HISTORY_LIMIT = 2
WRITE_COOLDOWN_SECONDS = 30
RATE_LIMIT_REQUESTS = 8
RATE_LIMIT_WINDOW_SECONDS = 60
CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
CODE_RE = re.compile(r"^[2-9A-HJ-NP-Z]{24}$")


class CloudSaveError(Exception):
    def __init__(self, status, code, message, details=None):
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message
        self.details = details or {}


def normalize_code(value):
    code = re.sub(r"[-\s]", "", str(value or "").upper())
    if not CODE_RE.match(code):
        raise CloudSaveError(400, "invalid_code", "存档码格式不正确")
    return code


def format_code(code):
    return "-".join(code[index:index + 4] for index in range(0, len(code), 4))


def code_hash(code):
    return hashlib.sha256(normalize_code(code).encode("ascii")).hexdigest()


def encode_save(save):
    if not isinstance(save, dict) or not isinstance(save.get("player"), dict) \
            or not isinstance(save.get("inv"), dict) or not isinstance(save.get("meta"), dict):
        raise CloudSaveError(400, "invalid_save", "存档内容不完整")
    try:
        payload = json.dumps(save, ensure_ascii=False, separators=(",", ":"))
    except (TypeError, ValueError):
        raise CloudSaveError(400, "invalid_save", "存档内容无法保存")
    if len(payload.encode("utf-8")) > MAX_REQUEST_BYTES - 4096:
        raise CloudSaveError(413, "save_too_large", "存档内容超过大小限制")
    return payload


def parse_revision(value):
    try:
        revision = int(value)
    except (TypeError, ValueError):
        raise CloudSaveError(400, "invalid_revision", "云存档版本号无效")
    if revision < 1:
        raise CloudSaveError(400, "invalid_revision", "云存档版本号无效")
    return revision


class CloudSaveStore(object):
    def __init__(self, path):
        self.path = path

    def initialize(self):
        parent = os.path.dirname(os.path.abspath(self.path))
        if not os.path.isdir(parent):
            os.makedirs(parent)
        with self._connect() as db:
            db.execute("""
                CREATE TABLE IF NOT EXISTS cloud_saves (
                    code_hash TEXT PRIMARY KEY,
                    payload TEXT NOT NULL,
                    revision INTEGER NOT NULL,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL
                )
            """)
            db.execute("""
                CREATE TABLE IF NOT EXISTS cloud_save_history (
                    code_hash TEXT NOT NULL,
                    revision INTEGER NOT NULL,
                    payload TEXT NOT NULL,
                    saved_at INTEGER NOT NULL,
                    PRIMARY KEY (code_hash, revision)
                )
            """)
            db.execute("CREATE INDEX IF NOT EXISTS cloud_history_code "
                       "ON cloud_save_history(code_hash, revision DESC)")

    def _connect(self):
        db = sqlite3.connect(self.path, timeout=10)
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA journal_mode=WAL")
        db.execute("PRAGMA busy_timeout=10000")
        return db

    @staticmethod
    def _row_result(row, include_save=False):
        result = {"ok": True, "revision": row["revision"], "updatedAt": row["updated_at"]}
        if include_save:
            result["save"] = json.loads(row["payload"])
        return result

    @staticmethod
    def _enforce_write_cooldown(row, timestamp):
        retry_after = row["updated_at"] + WRITE_COOLDOWN_SECONDS - timestamp
        if retry_after > 0:
            raise CloudSaveError(
                429,
                "write_cooldown",
                "云存档写入冷却中，请 {} 秒后重试".format(retry_after),
                {"retryAfter": retry_after},
            )

    @staticmethod
    def _prune_history(db, digest):
        db.execute("""
            DELETE FROM cloud_save_history
            WHERE code_hash=? AND revision NOT IN (
                SELECT revision FROM cloud_save_history
                WHERE code_hash=? ORDER BY revision DESC LIMIT ?
            )
        """, (digest, digest, HISTORY_LIMIT))

    def create(self, save):
        payload = encode_save(save)
        timestamp = int(time.time())
        for _ in range(8):
            code = "".join(secrets.choice(CODE_ALPHABET) for _ in range(24))
            digest = code_hash(code)
            try:
                with self._connect() as db:
                    db.execute("INSERT INTO cloud_saves VALUES (?, ?, 1, ?, ?)",
                               (digest, payload, timestamp, timestamp))
                    db.execute("INSERT INTO cloud_save_history VALUES (?, 1, ?, ?)",
                               (digest, payload, timestamp))
                return {"ok": True, "code": format_code(code), "revision": 1,
                        "updatedAt": timestamp}
            except sqlite3.IntegrityError:
                continue
        raise CloudSaveError(503, "code_generation_failed", "暂时无法创建存档码")

    def load(self, code):
        digest = code_hash(code)
        with self._connect() as db:
            row = db.execute(
                "SELECT payload, revision, updated_at FROM cloud_saves WHERE code_hash=?",
                (digest,),
            ).fetchone()
        if row is None:
            raise CloudSaveError(404, "save_not_found", "没有找到这个迁移存档")
        return self._row_result(row, True)

    def save(self, code, base_revision, save):
        digest = code_hash(code)
        payload = encode_save(save)
        expected = parse_revision(base_revision)
        timestamp = int(time.time())
        db = self._connect()
        try:
            db.execute("BEGIN IMMEDIATE")
            row = db.execute(
                "SELECT revision, updated_at FROM cloud_saves WHERE code_hash=?", (digest,)
            ).fetchone()
            if row is None:
                raise CloudSaveError(404, "save_not_found", "没有找到这个迁移存档")
            if row["revision"] != expected:
                raise CloudSaveError(409, "save_conflict", "云端已有更新，已停止覆盖",
                                     {"revision": row["revision"], "updatedAt": row["updated_at"]})
            self._enforce_write_cooldown(row, timestamp)
            revision = expected + 1
            db.execute("UPDATE cloud_saves SET payload=?, revision=?, updated_at=? WHERE code_hash=?",
                       (payload, revision, timestamp, digest))
            db.execute("INSERT INTO cloud_save_history VALUES (?, ?, ?, ?)",
                       (digest, revision, payload, timestamp))
            self._prune_history(db, digest)
            db.commit()
            return {"ok": True, "revision": revision, "updatedAt": timestamp}
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    def history(self, code):
        digest = code_hash(code)
        with self._connect() as db:
            current = db.execute(
                "SELECT revision, updated_at FROM cloud_saves WHERE code_hash=?", (digest,)
            ).fetchone()
            if current is None:
                raise CloudSaveError(404, "save_not_found", "没有找到这个迁移存档")
            rows = db.execute("""
                SELECT revision, saved_at FROM cloud_save_history
                WHERE code_hash=? ORDER BY revision DESC LIMIT ?
            """, (digest, HISTORY_LIMIT)).fetchall()
        return {"ok": True, "revision": current["revision"],
                "updatedAt": current["updated_at"],
                "items": [{"revision": row["revision"], "savedAt": row["saved_at"]}
                          for row in rows]}

    def restore(self, code, base_revision, target_revision):
        digest = code_hash(code)
        expected = parse_revision(base_revision)
        target = parse_revision(target_revision)
        timestamp = int(time.time())
        db = self._connect()
        try:
            db.execute("BEGIN IMMEDIATE")
            current = db.execute(
                "SELECT revision, updated_at FROM cloud_saves WHERE code_hash=?", (digest,)
            ).fetchone()
            if current is None:
                raise CloudSaveError(404, "save_not_found", "没有找到这个迁移存档")
            if current["revision"] != expected:
                raise CloudSaveError(409, "save_conflict", "云端已有更新，已停止恢复",
                                     {"revision": current["revision"],
                                      "updatedAt": current["updated_at"]})
            self._enforce_write_cooldown(current, timestamp)
            historical = db.execute(
                "SELECT payload FROM cloud_save_history WHERE code_hash=? AND revision=?",
                (digest, target),
            ).fetchone()
            if historical is None:
                raise CloudSaveError(404, "backup_not_found", "这个云端迁移版本已不存在")
            revision = expected + 1
            payload = historical["payload"]
            db.execute("UPDATE cloud_saves SET payload=?, revision=?, updated_at=? WHERE code_hash=?",
                       (payload, revision, timestamp, digest))
            db.execute("INSERT INTO cloud_save_history VALUES (?, ?, ?, ?)",
                       (digest, revision, payload, timestamp))
            self._prune_history(db, digest)
            db.commit()
            return {"ok": True, "revision": revision, "updatedAt": timestamp,
                    "save": json.loads(payload), "restoredFrom": target}
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    def dispatch(self, request):
        action = request.get("action") if isinstance(request, dict) else None
        if action == "create":
            return self.create(request.get("save"))
        if action == "load":
            return self.load(request.get("code"))
        if action == "save":
            return self.save(request.get("code"), request.get("baseRevision"), request.get("save"))
        if action == "history":
            return self.history(request.get("code"))
        if action == "restore":
            return self.restore(request.get("code"), request.get("baseRevision"),
                                request.get("targetRevision"))
        raise CloudSaveError(400, "invalid_action", "不支持的云存档操作")


class RequestLimiter(object):
    def __init__(self):
        self.events = {}
        self.lock = threading.Lock()

    def check(self, address):
        now = time.time()
        cutoff = now - RATE_LIMIT_WINDOW_SECONDS
        with self.lock:
            recent = [seen for seen in self.events.get(address, []) if seen > cutoff]
            if len(recent) >= RATE_LIMIT_REQUESTS:
                retry_after = max(1, int(recent[0] + RATE_LIMIT_WINDOW_SECONDS - now) + 1)
                self.events[address] = recent
                raise CloudSaveError(429, "rate_limited", "云存档请求过于频繁，请稍后重试",
                                     {"retryAfter": retry_after})
            recent.append(now)
            self.events[address] = recent
            if len(self.events) > 1024:
                self.events = {
                    key: [seen for seen in values if seen > cutoff]
                    for key, values in self.events.items()
                    if any(seen > cutoff for seen in values)
                }


class AbyssHandler(SimpleHTTPRequestHandler):
    extensions_map = dict(SimpleHTTPRequestHandler.extensions_map)
    extensions_map[".apk"] = "application/vnd.android.package-archive"

    def end_headers(self):
        path = urlsplit(self.path).path
        if path.startswith("/api/") or path.endswith("/manifest.json") \
                or path.endswith("/manifest.sig"):
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        super().end_headers()

    def _send_json(self, status, body):
        encoded = json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        if status == 429 and body.get("retryAfter"):
            self.send_header("Retry-After", str(body["retryAfter"]))
        self.end_headers()
        self.wfile.write(encoded)

    def do_GET(self):
        if urlsplit(self.path).path == SAVE_API + "/health":
            self._send_json(200, {
                "ok": True,
                "service": "cloud-save",
                "storage": "sqlite",
                "historyLimit": HISTORY_LIMIT,
                "writeCooldown": WRITE_COOLDOWN_SECONDS,
            })
            return
        super().do_GET()

    def do_POST(self):
        if urlsplit(self.path).path != SAVE_API:
            self._send_json(404, {"ok": False, "error": "not_found", "message": "接口不存在"})
            return
        try:
            self.server.request_limiter.check(self.client_address[0])
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > MAX_REQUEST_BYTES:
                raise CloudSaveError(413, "request_too_large", "云存档请求大小异常")
            request = json.loads(self.rfile.read(length).decode("utf-8"))
            self._send_json(200, self.server.save_store.dispatch(request))
        except CloudSaveError as error:
            body = {"ok": False, "error": error.code, "message": error.message}
            body.update(error.details)
            self._send_json(error.status, body)
        except (TypeError, ValueError, UnicodeDecodeError):
            self._send_json(400, {"ok": False, "error": "invalid_json",
                                  "message": "请求内容不是有效 JSON"})
        except Exception:
            self._send_json(500, {"ok": False, "error": "server_error",
                                  "message": "云存档服务暂时不可用"})


class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main():
    port = int(os.environ.get("ABYSS_PORT", "9091"))
    database = os.environ.get("ABYSS_SAVE_DB", "/var/lib/abyss-echo/saves.sqlite3")
    store = CloudSaveStore(database)
    store.initialize()
    server = ThreadingHTTPServer(("0.0.0.0", port), AbyssHandler)
    server.save_store = store
    server.request_limiter = RequestLimiter()
    server.serve_forever()


if __name__ == "__main__":
    main()
