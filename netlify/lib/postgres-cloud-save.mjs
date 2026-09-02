import { CloudSaveError, HISTORY_LIMIT } from "./cloud-save.mjs";

function parsePayload(value) {
  return typeof value === "string" ? JSON.parse(value) : value;
}

function rowRecord(row, includeSave = false) {
  const record = {
    revision: Number(row.revision),
    updatedAt: Number(row.updated_at),
  };
  if (includeSave) record.save = parsePayload(row.payload);
  return record;
}

export class PostgresCloudSaveStore {
  constructor(pool) {
    this.pool = pool;
  }

  async transaction(operation) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await operation(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async create(digest, save, timestamp) {
    return this.transaction(async (client) => {
      const inserted = await client.query(
        `INSERT INTO abyss_cloud_saves
          (code_hash, payload, revision, created_at, updated_at)
         VALUES ($1, $2::jsonb, 1, $3, $3)
         ON CONFLICT (code_hash) DO NOTHING
         RETURNING revision`,
        [digest, JSON.stringify(save), timestamp],
      );
      if (inserted.rowCount === 0) return false;
      await client.query(
        `INSERT INTO abyss_cloud_save_history (code_hash, revision, payload, saved_at)
         VALUES ($1, 1, $2::jsonb, $3)`,
        [digest, JSON.stringify(save), timestamp],
      );
      return true;
    });
  }

  async load(digest) {
    const result = await this.pool.query(
      `SELECT payload, revision, updated_at
       FROM abyss_cloud_saves WHERE code_hash = $1`,
      [digest],
    );
    if (result.rowCount === 0) {
      throw new CloudSaveError(404, "save_not_found", "没有找到这个云存档");
    }
    return rowRecord(result.rows[0], true);
  }

  async save(digest, expected, save, timestamp) {
    return this.transaction(async (client) => {
      const current = await client.query(
        `SELECT revision, updated_at FROM abyss_cloud_saves
         WHERE code_hash = $1 FOR UPDATE`,
        [digest],
      );
      if (current.rowCount === 0) {
        throw new CloudSaveError(404, "save_not_found", "没有找到这个云存档");
      }
      const row = current.rows[0];
      if (Number(row.revision) !== expected) {
        throw new CloudSaveError(409, "save_conflict", "云端已有更新，已停止覆盖", {
          revision: Number(row.revision),
          updatedAt: Number(row.updated_at),
        });
      }

      const revision = expected + 1;
      const payload = JSON.stringify(save);
      await client.query(
        `UPDATE abyss_cloud_saves
         SET payload = $2::jsonb, revision = $3, updated_at = $4
         WHERE code_hash = $1`,
        [digest, payload, revision, timestamp],
      );
      await client.query(
        `INSERT INTO abyss_cloud_save_history (code_hash, revision, payload, saved_at)
         VALUES ($1, $2, $3::jsonb, $4)`,
        [digest, revision, payload, timestamp],
      );
      await this.pruneHistory(client, digest);
      return { revision, updatedAt: timestamp };
    });
  }

  async history(digest) {
    const current = await this.pool.query(
      `SELECT revision, updated_at FROM abyss_cloud_saves WHERE code_hash = $1`,
      [digest],
    );
    if (current.rowCount === 0) {
      throw new CloudSaveError(404, "save_not_found", "没有找到这个云存档");
    }
    const history = await this.pool.query(
      `SELECT revision, saved_at FROM abyss_cloud_save_history
       WHERE code_hash = $1 ORDER BY revision DESC LIMIT $2`,
      [digest, HISTORY_LIMIT],
    );
    return {
      ...rowRecord(current.rows[0]),
      items: history.rows.map((row) => ({
        revision: Number(row.revision),
        savedAt: Number(row.saved_at),
      })),
    };
  }

  async restore(digest, expected, target, timestamp) {
    return this.transaction(async (client) => {
      const current = await client.query(
        `SELECT revision, updated_at FROM abyss_cloud_saves
         WHERE code_hash = $1 FOR UPDATE`,
        [digest],
      );
      if (current.rowCount === 0) {
        throw new CloudSaveError(404, "save_not_found", "没有找到这个云存档");
      }
      const row = current.rows[0];
      if (Number(row.revision) !== expected) {
        throw new CloudSaveError(409, "save_conflict", "云端已有更新，已停止恢复", {
          revision: Number(row.revision),
          updatedAt: Number(row.updated_at),
        });
      }

      const historical = await client.query(
        `SELECT payload FROM abyss_cloud_save_history
         WHERE code_hash = $1 AND revision = $2`,
        [digest, target],
      );
      if (historical.rowCount === 0) {
        throw new CloudSaveError(404, "backup_not_found", "这个备份版本已不存在");
      }

      const revision = expected + 1;
      const save = parsePayload(historical.rows[0].payload);
      const payload = JSON.stringify(save);
      await client.query(
        `UPDATE abyss_cloud_saves
         SET payload = $2::jsonb, revision = $3, updated_at = $4
         WHERE code_hash = $1`,
        [digest, payload, revision, timestamp],
      );
      await client.query(
        `INSERT INTO abyss_cloud_save_history (code_hash, revision, payload, saved_at)
         VALUES ($1, $2, $3::jsonb, $4)`,
        [digest, revision, payload, timestamp],
      );
      await this.pruneHistory(client, digest);
      return { revision, updatedAt: timestamp, save, restoredFrom: target };
    });
  }

  async pruneHistory(client, digest) {
    await client.query(
      `DELETE FROM abyss_cloud_save_history
       WHERE code_hash = $1 AND revision NOT IN (
         SELECT revision FROM abyss_cloud_save_history
         WHERE code_hash = $1 ORDER BY revision DESC LIMIT $2
       )`,
      [digest, HISTORY_LIMIT],
    );
  }
}
