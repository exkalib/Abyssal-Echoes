import assert from "node:assert/strict";
import test from "node:test";

import {
  CloudSaveError,
  HISTORY_LIMIT,
  createCloudSaveService,
  normalizeCode,
} from "../lib/cloud-save.mjs";
import { BlobCloudSaveStore } from "../lib/blob-cloud-save.mjs";

class MemoryCloudSaveStore {
  constructor() {
    this.saves = new Map();
  }

  async create(digest, save, timestamp) {
    if (this.saves.has(digest)) return false;
    this.saves.set(digest, {
      save: structuredClone(save),
      revision: 1,
      updatedAt: timestamp,
      history: [{ revision: 1, savedAt: timestamp, save: structuredClone(save) }],
    });
    return true;
  }

  record(digest) {
    const record = this.saves.get(digest);
    if (!record) throw new CloudSaveError(404, "save_not_found", "没有找到这个云存档");
    return record;
  }

  async load(digest) {
    const record = this.record(digest);
    return {
      revision: record.revision,
      updatedAt: record.updatedAt,
      save: structuredClone(record.save),
    };
  }

  async save(digest, expected, save, timestamp) {
    const record = this.record(digest);
    if (record.revision !== expected) {
      throw new CloudSaveError(409, "save_conflict", "云端已有更新，已停止覆盖", {
        revision: record.revision,
        updatedAt: record.updatedAt,
      });
    }
    record.revision += 1;
    record.updatedAt = timestamp;
    record.save = structuredClone(save);
    record.history.unshift({ revision: record.revision, savedAt: timestamp, save: structuredClone(save) });
    record.history = record.history.slice(0, HISTORY_LIMIT);
    return { revision: record.revision, updatedAt: timestamp };
  }

  async history(digest) {
    const record = this.record(digest);
    return {
      revision: record.revision,
      updatedAt: record.updatedAt,
      items: record.history.map(({ revision, savedAt }) => ({ revision, savedAt })),
    };
  }

  async restore(digest, expected, target, timestamp) {
    const record = this.record(digest);
    if (record.revision !== expected) {
      throw new CloudSaveError(409, "save_conflict", "云端已有更新，已停止恢复", {
        revision: record.revision,
        updatedAt: record.updatedAt,
      });
    }
    const historical = record.history.find((item) => item.revision === target);
    if (!historical) throw new CloudSaveError(404, "backup_not_found", "这个备份版本已不存在");
    const save = structuredClone(historical.save);
    record.revision += 1;
    record.updatedAt = timestamp;
    record.save = save;
    record.history.unshift({ revision: record.revision, savedAt: timestamp, save: structuredClone(save) });
    record.history = record.history.slice(0, HISTORY_LIMIT);
    return { revision: record.revision, updatedAt: timestamp, save, restoredFrom: target };
  }
}

function sampleSave(day = 1) {
  return {
    player: { location: "camp", hp: 100 },
    inv: { scrap: day },
    meta: { playthrough: 1 },
    time: (day - 1) * 24,
  };
}

function fixture() {
  let timestamp = 1_800_000_000;
  const service = createCloudSaveService(new MemoryCloudSaveStore(), {
    now: () => timestamp += 1,
    generateCode: () => "234523452345234523452345",
  });
  return service;
}

test("creates, loads, updates, and rejects stale revisions", async () => {
  const service = fixture();
  const created = await service.create(sampleSave());
  assert.equal(normalizeCode(created.code).length, 24);
  assert.equal((await service.load(created.code.toLowerCase())).save.inv.scrap, 1);

  const updated = await service.save(created.code, 1, sampleSave(2));
  assert.equal(updated.revision, 2);
  await assert.rejects(
    service.save(created.code, 1, sampleSave(3)),
    (error) => error instanceof CloudSaveError && error.status === 409 && error.details.revision === 2,
  );
  assert.equal((await service.load(created.code)).save.inv.scrap, 2);
});

test("restores the previous manual upload as a new revision", async () => {
  const service = fixture();
  const created = await service.create(sampleSave());
  await service.save(created.code, 1, sampleSave(2));
  await service.save(created.code, 2, sampleSave(3));

  const history = await service.history(created.code);
  assert.deepEqual(history.items.map((item) => item.revision), [3, 2]);
  const restored = await service.restore(created.code, 3, 2);
  assert.equal(restored.revision, 4);
  assert.equal(restored.restoredFrom, 2);
  assert.equal(restored.save.inv.scrap, 2);
});

test("rejects invalid codes and incomplete saves", async () => {
  const service = fixture();
  await assert.rejects(service.load("1234"), (error) => error.status === 400);
  await assert.rejects(service.create({ player: {}, inv: {} }), (error) => error.status === 400);
});

test("keeps only the current and previous manual versions", async () => {
  const service = fixture();
  const created = await service.create(sampleSave());
  let revision = 1;
  for (let day = 2; day <= 25; day += 1) {
    revision = (await service.save(created.code, revision, sampleSave(day))).revision;
  }
  const history = (await service.history(created.code)).items;
  assert.equal(history.length, 2);
  assert.equal(history[0].revision, 25);
  assert.equal(history.at(-1).revision, 24);
});

class MemoryBlobStore {
  constructor() {
    this.entries = new Map();
    this.sequence = 0;
  }

  async getWithMetadata(key) {
    const entry = this.entries.get(key);
    return entry ? structuredClone(entry) : null;
  }

  async setJSON(key, value, options = {}) {
    const current = this.entries.get(key);
    if (options.onlyIfNew && current) return { modified: false };
    if (options.onlyIfMatch && (!current || current.etag !== options.onlyIfMatch)) {
      return { modified: false };
    }
    const etag = `\"${++this.sequence}\"`;
    this.entries.set(key, {
      data: structuredClone(value),
      etag,
      metadata: structuredClone(options.metadata || {}),
    });
    return { modified: true, etag };
  }
}

test("blob storage remains idle between explicit operations and retains one rollback", async () => {
  const blobs = new MemoryBlobStore();
  const store = new BlobCloudSaveStore(blobs);
  const digest = "a".repeat(64);

  assert.equal(await store.create(digest, sampleSave(1), 100), true);
  assert.equal((await store.load(digest)).save.inv.scrap, 1);
  assert.deepEqual((await store.history(digest)).items.map((item) => item.revision), [1]);

  await store.save(digest, 1, sampleSave(2), 200);
  assert.equal(blobs.entries.size, 1);
  assert.equal(blobs.entries.get(`saves/${digest}`).data.previous.revision, 1);
  assert.deepEqual((await store.history(digest)).items.map((item) => item.revision), [2, 1]);

  const restored = await store.restore(digest, 2, 1, 300);
  assert.equal(restored.revision, 3);
  assert.equal(restored.save.inv.scrap, 1);
  assert.deepEqual((await store.history(digest)).items.map((item) => item.revision), [3, 2]);
});

test("concurrent manual uploads atomically preserve the winning previous version", async () => {
  const blobs = new MemoryBlobStore();
  const store = new BlobCloudSaveStore(blobs);
  const digest = "b".repeat(64);
  await store.create(digest, sampleSave(1), 100);

  const results = await Promise.allSettled([
    store.save(digest, 1, sampleSave(2), 200),
    store.save(digest, 1, sampleSave(3), 300),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.filter((result) => result.status === "rejected").length, 1);
  assert.deepEqual((await store.history(digest)).items.map((item) => item.revision), [2, 1]);
  assert.equal(blobs.entries.size, 1);
});
