import { createHash, timingSafeEqual } from "node:crypto";
import { getDatabase } from "@netlify/database";

const AUTH_HASH = "01e4a89b26b2441eaeb6357a10e4b203abc9cf56c71e838cb006a0dde1cde5a6";
const CODE_HASH = /^[0-9a-f]{64}$/;

function response(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function authorized(request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const actual = Buffer.from(createHash("sha256").update(token).digest("hex"));
  const expected = Buffer.from(AUTH_HASH);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function validRow(row, withCreatedAt = false) {
  return row && CODE_HASH.test(row.code_hash)
    && Number.isInteger(row.revision) && row.revision > 0
    && Number.isInteger(row.updated_at ?? row.saved_at)
    && (!withCreatedAt || Number.isInteger(row.created_at))
    && row.payload && typeof row.payload === "object" && !Array.isArray(row.payload);
}

export default async function handler(request) {
  if (request.method !== "POST" || !authorized(request)) {
    return response({ ok: false, error: "not_found" }, 404);
  }

  try {
    const payload = await request.json();
    const saves = Array.isArray(payload?.saves) ? payload.saves : [];
    const history = Array.isArray(payload?.history) ? payload.history : [];
    if (saves.length > 100 || history.length > 2000
        || saves.some((row) => !validRow(row, true))
        || history.some((row) => !validRow(row))) {
      return response({ ok: false, error: "invalid_export" }, 400);
    }

    const client = await getDatabase().pool.connect();
    let importedSaves = 0;
    let importedHistory = 0;
    try {
      await client.query("BEGIN");
      for (const save of saves) {
        const inserted = await client.query(
          `INSERT INTO abyss_cloud_saves
            (code_hash, payload, revision, created_at, updated_at)
           VALUES ($1, $2::jsonb, $3, $4, $5)
           ON CONFLICT (code_hash) DO NOTHING
           RETURNING code_hash`,
          [save.code_hash, JSON.stringify(save.payload), save.revision, save.created_at, save.updated_at],
        );
        if (inserted.rowCount === 0) continue;
        importedSaves += 1;
        const versions = history.filter((row) => row.code_hash === save.code_hash);
        for (const version of versions) {
          const historyInsert = await client.query(
            `INSERT INTO abyss_cloud_save_history (code_hash, revision, payload, saved_at)
             VALUES ($1, $2, $3::jsonb, $4)
             ON CONFLICT (code_hash, revision) DO NOTHING`,
            [version.code_hash, version.revision, JSON.stringify(version.payload), version.saved_at],
          );
          importedHistory += historyInsert.rowCount;
        }
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    const total = await getDatabase().pool.query("SELECT COUNT(*)::int AS count FROM abyss_cloud_saves");
    return response({
      ok: true,
      importedSaves,
      importedHistory,
      totalSaves: total.rows[0].count,
    });
  } catch (error) {
    console.error("One-time cloud-save import failed", error);
    return response({ ok: false, error: "import_failed" }, 500);
  }
}
