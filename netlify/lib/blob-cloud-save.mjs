import { CloudSaveError } from "./cloud-save.mjs";

export const CLOUD_BLOB_STORE = "abyss-migration-saves";

export function currentBlobKey(digest) {
  return `saves/${digest}`;
}

function recordFrom(record) {
  if (!record || typeof record !== "object" || !record.save
      || !Number.isInteger(Number(record.revision)) || !Number.isFinite(Number(record.updatedAt))) {
    throw new CloudSaveError(500, "corrupt_save", "云端迁移存档格式异常");
  }
  return {
    createdAt: Number(record.createdAt) || Number(record.updatedAt),
    revision: Number(record.revision),
    save: record.save,
    updatedAt: Number(record.updatedAt),
  };
}

function archiveFrom(entry) {
  const archive = entry && entry.data;
  if (!archive || typeof archive !== "object" || !archive.current) {
    throw new CloudSaveError(500, "corrupt_save", "云端迁移存档格式异常");
  }
  return {
    current: recordFrom(archive.current),
    previous: archive.previous ? recordFrom(archive.previous) : null,
  };
}

function archiveFor(current, previous = null) {
  return { schema: 1, current, previous };
}

function publicRecord(record, includeSave = false) {
  const result = { revision: record.revision, updatedAt: record.updatedAt };
  if (includeSave) result.save = record.save;
  return result;
}

export class BlobCloudSaveStore {
  constructor(store) {
    this.store = store;
  }

  async read(key) {
    return this.store.getWithMetadata(key, { consistency: "strong", type: "json" });
  }

  async current(digest) {
    const entry = await this.read(currentBlobKey(digest));
    if (!entry) throw new CloudSaveError(404, "save_not_found", "没有找到这个迁移存档");
    return { entry, archive: archiveFrom(entry) };
  }

  conflict(record, message = "云端已有更新，已停止覆盖") {
    throw new CloudSaveError(409, "save_conflict", message, {
      revision: record.revision,
      updatedAt: record.updatedAt,
    });
  }

  async create(digest, save, timestamp) {
    const record = {
      createdAt: timestamp,
      revision: 1,
      save,
      updatedAt: timestamp,
    };
    const result = await this.store.setJSON(currentBlobKey(digest), archiveFor(record), {
      metadata: { revision: 1, updatedAt: timestamp },
      onlyIfNew: true,
    });
    return result.modified;
  }

  async load(digest) {
    const { archive } = await this.current(digest);
    return publicRecord(archive.current, true);
  }

  async save(digest, expected, save, timestamp) {
    const { entry, archive } = await this.current(digest);
    const record = archive.current;
    if (record.revision !== expected) this.conflict(record);

    const revision = expected + 1;
    const next = {
      createdAt: record.createdAt,
      revision,
      save,
      updatedAt: timestamp,
    };
    const result = await this.store.setJSON(currentBlobKey(digest), archiveFor(next, record), {
      metadata: { revision, updatedAt: timestamp },
      onlyIfMatch: entry.etag,
    });
    if (!result.modified) {
      const latest = await this.current(digest);
      this.conflict(latest.archive.current);
    }
    return { revision, updatedAt: timestamp };
  }

  async history(digest) {
    const { archive } = await this.current(digest);
    const record = archive.current;
    const items = [{ revision: record.revision, savedAt: record.updatedAt }];
    if (archive.previous) {
      const previous = archive.previous;
      if (previous.revision !== record.revision) {
        items.push({ revision: previous.revision, savedAt: previous.updatedAt });
      }
    }
    return { ...publicRecord(record), items };
  }

  async restore(digest, expected, target, timestamp) {
    const { entry, archive } = await this.current(digest);
    const record = archive.current;
    if (record.revision !== expected) this.conflict(record, "云端已有更新，已停止恢复");

    if (!archive.previous) {
      throw new CloudSaveError(404, "backup_not_found", "上一个云端迁移版本已不存在");
    }
    const previous = archive.previous;
    if (previous.revision !== target) {
      throw new CloudSaveError(404, "backup_not_found", "这个云端迁移版本已不存在");
    }

    const revision = expected + 1;
    const next = {
      createdAt: record.createdAt,
      revision,
      save: previous.save,
      updatedAt: timestamp,
    };
    const result = await this.store.setJSON(currentBlobKey(digest), archiveFor(next, record), {
      metadata: { revision, updatedAt: timestamp },
      onlyIfMatch: entry.etag,
    });
    if (!result.modified) {
      const latest = await this.current(digest);
      this.conflict(latest.archive.current, "云端已有更新，已停止恢复");
    }
    return {
      revision,
      restoredFrom: target,
      save: previous.save,
      updatedAt: timestamp,
    };
  }
}
