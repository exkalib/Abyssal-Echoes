import { createHash, randomInt } from "node:crypto";

export const MAX_REQUEST_BYTES = 2 * 1024 * 1024;
export const HISTORY_LIMIT = 2;

const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_PATTERN = /^[2-9A-HJ-NP-Z]{24}$/;

export class CloudSaveError extends Error {
  constructor(status, code, message, details = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function normalizeCode(value) {
  const code = String(value ?? "").toUpperCase().replace(/[-\s]/g, "");
  if (!CODE_PATTERN.test(code)) {
    throw new CloudSaveError(400, "invalid_code", "存档码格式不正确");
  }
  return code;
}

function formatCode(code) {
  return code.match(/.{4}/g).join("-");
}

function hashCode(code) {
  return createHash("sha256").update(normalizeCode(code), "ascii").digest("hex");
}

function validateSave(save) {
  if (!save || typeof save !== "object" || Array.isArray(save)
      || !save.player || typeof save.player !== "object" || Array.isArray(save.player)
      || !save.inv || typeof save.inv !== "object" || Array.isArray(save.inv)
      || !save.meta || typeof save.meta !== "object" || Array.isArray(save.meta)) {
    throw new CloudSaveError(400, "invalid_save", "存档内容不完整");
  }

  let payload;
  try {
    payload = JSON.stringify(save);
  } catch {
    throw new CloudSaveError(400, "invalid_save", "存档内容无法保存");
  }
  if (Buffer.byteLength(payload, "utf8") > MAX_REQUEST_BYTES - 4096) {
    throw new CloudSaveError(413, "save_too_large", "存档内容超过大小限制");
  }
  return JSON.parse(payload);
}

function parseRevision(value) {
  const revision = Number(value);
  if (!Number.isInteger(revision) || revision < 1) {
    throw new CloudSaveError(400, "invalid_revision", "云存档版本号无效");
  }
  return revision;
}

function generateCode() {
  let code = "";
  for (let index = 0; index < 24; index += 1) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

export function createCloudSaveService(store, options = {}) {
  const now = options.now ?? (() => Math.floor(Date.now() / 1000));
  const newCode = options.generateCode ?? generateCode;

  const api = {
    async create(save) {
      const cleanSave = validateSave(save);
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const code = normalizeCode(newCode());
        const timestamp = now();
        const created = await store.create(hashCode(code), cleanSave, timestamp);
        if (created) {
          return { ok: true, code: formatCode(code), revision: 1, updatedAt: timestamp };
        }
      }
      throw new CloudSaveError(503, "code_generation_failed", "暂时无法创建存档码");
    },

    async load(code) {
      const record = await store.load(hashCode(code));
      return { ok: true, ...record };
    },

    async save(code, baseRevision, save) {
      const cleanSave = validateSave(save);
      const record = await store.save(hashCode(code), parseRevision(baseRevision), cleanSave, now());
      return { ok: true, ...record };
    },

    async history(code) {
      const record = await store.history(hashCode(code));
      return { ok: true, ...record };
    },

    async restore(code, baseRevision, targetRevision) {
      const record = await store.restore(
        hashCode(code),
        parseRevision(baseRevision),
        parseRevision(targetRevision),
        now(),
      );
      return { ok: true, ...record };
    },
  };

  api.dispatch = async (request) => {
    const action = request && typeof request === "object" ? request.action : null;
    if (action === "create") return api.create(request.save);
    if (action === "load") return api.load(request.code);
    if (action === "save") return api.save(request.code, request.baseRevision, request.save);
    if (action === "history") return api.history(request.code);
    if (action === "restore") {
      return api.restore(request.code, request.baseRevision, request.targetRevision);
    }
    throw new CloudSaveError(400, "invalid_action", "不支持的云存档操作");
  };

  return api;
}
