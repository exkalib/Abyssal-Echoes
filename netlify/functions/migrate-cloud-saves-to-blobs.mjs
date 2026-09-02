import { timingSafeEqual } from "node:crypto";

import { getStore } from "@netlify/blobs";
import { getDatabase } from "@netlify/database";

import {
  CLOUD_BLOB_STORE,
  currentBlobKey,
} from "../lib/blob-cloud-save.mjs";

const MARKER_KEY = "admin/database-v1-migrated";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function authorized(request) {
  const configured = process.env.CLOUD_MIGRATION_TOKEN || "";
  const header = request.headers.get("authorization") || "";
  const supplied = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (configured.length < 32 || supplied.length !== configured.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(configured));
}

function payload(value) {
  return typeof value === "string" ? JSON.parse(value) : value;
}

export default async function handler(request) {
  if (!authorized(request)) return json({ ok: false, error: "not_found" }, 404);

  const blobs = getStore({ name: CLOUD_BLOB_STORE, consistency: "strong" });
  const marker = await blobs.get(MARKER_KEY, { consistency: "strong" });
  if (marker) return json({ ok: true, alreadyMigrated: true });

  const pool = getDatabase().pool;
  const current = await pool.query(
    `SELECT code_hash, payload, revision, created_at, updated_at
     FROM abyss_cloud_saves ORDER BY code_hash`,
  );
  const history = await pool.query(
    `SELECT code_hash, payload, revision, saved_at
     FROM abyss_cloud_save_history ORDER BY code_hash, revision DESC`,
  );

  const previousByCode = new Map();
  const revisionByCode = new Map(
    current.rows.map((row) => [row.code_hash, Number(row.revision)]),
  );
  for (const row of history.rows) {
    const currentRevision = revisionByCode.get(row.code_hash);
    if (currentRevision && Number(row.revision) < currentRevision
        && !previousByCode.has(row.code_hash)) {
      previousByCode.set(row.code_hash, row);
    }
  }

  let migrated = 0;
  for (const row of current.rows) {
    const record = {
      createdAt: Number(row.created_at),
      revision: Number(row.revision),
      save: payload(row.payload),
      updatedAt: Number(row.updated_at),
    };
    const previousRow = previousByCode.get(row.code_hash);
    const previous = previousRow ? {
      createdAt: record.createdAt,
      revision: Number(previousRow.revision),
      save: payload(previousRow.payload),
      updatedAt: Number(previousRow.saved_at),
    } : null;
    const result = await blobs.setJSON(currentBlobKey(row.code_hash), {
      schema: 1,
      current: record,
      previous,
    }, {
      metadata: { revision: record.revision, updatedAt: record.updatedAt },
      onlyIfNew: true,
    });
    if (result.modified) migrated += 1;
  }

  const finishedAt = Math.floor(Date.now() / 1000);
  await blobs.setJSON(MARKER_KEY, {
    finishedAt,
    migrated,
    sourceRows: current.rowCount,
  }, { onlyIfNew: true });

  return json({ ok: true, finishedAt, migrated, sourceRows: current.rowCount });
}

export const config = {
  path: "/api/admin/migrate-cloud-saves-to-blobs",
  rateLimit: {
    aggregateBy: ["ip", "domain"],
    windowLimit: 3,
    windowSize: 60,
  },
};
