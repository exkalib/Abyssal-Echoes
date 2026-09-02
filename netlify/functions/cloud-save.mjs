import { getDatabase } from "@netlify/database";
import {
  CloudSaveError,
  MAX_REQUEST_BYTES,
  createCloudSaveService,
} from "../lib/cloud-save.mjs";
import { PostgresCloudSaveStore } from "../lib/postgres-cloud-save.mjs";

let service;

function cloudSaveService() {
  if (!service) {
    const store = new PostgresCloudSaveStore(getDatabase().pool);
    service = createCloudSaveService(store);
  }
  return service;
}

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

export default async function handler(request) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed", message: "只支持 POST 请求" }, 405);
  }

  try {
    const declaredLength = Number(request.headers.get("content-length") || 0);
    if (declaredLength > MAX_REQUEST_BYTES) {
      throw new CloudSaveError(413, "request_too_large", "云存档请求大小异常");
    }
    const text = await request.text();
    if (!text || Buffer.byteLength(text, "utf8") > MAX_REQUEST_BYTES) {
      throw new CloudSaveError(413, "request_too_large", "云存档请求大小异常");
    }

    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new CloudSaveError(400, "invalid_json", "请求内容不是有效 JSON");
    }
    return json(await cloudSaveService().dispatch(payload));
  } catch (error) {
    if (error instanceof CloudSaveError) {
      return json({ ok: false, error: error.code, message: error.message, ...error.details }, error.status);
    }
    console.error("Cloud-save function failed", error);
    return json({ ok: false, error: "server_error", message: "云存档服务暂时不可用" }, 500);
  }
}
