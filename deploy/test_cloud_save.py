#!/usr/bin/env python3

import os
import tempfile
import unittest
from unittest import mock

from serve_static import (
    AbyssHandler,
    HISTORY_LIMIT,
    WRITE_COOLDOWN_SECONDS,
    CloudSaveError,
    CloudSaveStore,
    normalize_code,
)


def sample_save(day=1):
    return {"player": {"location": "camp", "hp": 100}, "inv": {"scrap": day},
            "meta": {"playthrough": 1}, "time": (day - 1) * 24}


class CloudSaveStoreTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = CloudSaveStore(os.path.join(self.temp.name, "saves.sqlite3"))
        self.store.initialize()
        self.now = 1_800_000_000
        self.clock = mock.patch("serve_static.time.time", side_effect=self.tick)
        self.clock.start()

    def tearDown(self):
        self.clock.stop()
        self.temp.cleanup()

    def tick(self):
        current = self.now
        self.now += WRITE_COOLDOWN_SECONDS + 1
        return current

    def test_create_load_update_and_conflict(self):
        created = self.store.create(sample_save())
        self.assertEqual(len(normalize_code(created["code"])), 24)
        loaded = self.store.load(created["code"].lower())
        self.assertEqual(loaded["revision"], 1)
        self.assertEqual(loaded["save"]["inv"]["scrap"], 1)
        updated = self.store.save(created["code"], 1, sample_save(2))
        self.assertEqual(updated["revision"], 2)
        with self.assertRaises(CloudSaveError) as conflict:
            self.store.save(created["code"], 1, sample_save(3))
        self.assertEqual(conflict.exception.status, 409)
        self.assertEqual(conflict.exception.details["revision"], 2)
        self.assertEqual(self.store.load(created["code"])["save"]["inv"]["scrap"], 2)

    def test_history_and_restore_create_a_new_revision(self):
        created = self.store.create(sample_save())
        self.store.save(created["code"], 1, sample_save(2))
        history = self.store.history(created["code"])
        self.assertEqual([item["revision"] for item in history["items"]], [2, 1])
        restored = self.store.restore(created["code"], 2, 1)
        self.assertEqual(restored["revision"], 3)
        self.assertEqual(restored["restoredFrom"], 1)
        self.assertEqual(restored["save"]["inv"]["scrap"], 1)

    def test_invalid_code_and_save_are_rejected(self):
        with self.assertRaises(CloudSaveError):
            self.store.load("1234")
        with self.assertRaises(CloudSaveError):
            self.store.create({"player": {}, "inv": {}})

    def test_history_keeps_only_the_configured_versions(self):
        created = self.store.create(sample_save())
        revision = 1
        for day in range(2, 7):
            revision = self.store.save(created["code"], revision, sample_save(day))["revision"]
        history = self.store.history(created["code"])["items"]
        self.assertEqual(len(history), HISTORY_LIMIT)
        self.assertEqual([item["revision"] for item in history], [6, 5])

    def test_write_cooldown_is_enforced(self):
        with mock.patch("serve_static.time.time", return_value=1_900_000_000):
            created = self.store.create(sample_save())
            with self.assertRaises(CloudSaveError) as cooldown:
                self.store.save(created["code"], 1, sample_save(2))
        self.assertEqual(cooldown.exception.status, 429)
        self.assertEqual(cooldown.exception.code, "write_cooldown")
        self.assertEqual(cooldown.exception.details["retryAfter"], WRITE_COOLDOWN_SECONDS)

    def test_webp_assets_have_a_browser_safe_content_type(self):
        self.assertEqual(AbyssHandler.extensions_map[".webp"], "image/webp")


if __name__ == "__main__":
    unittest.main()
