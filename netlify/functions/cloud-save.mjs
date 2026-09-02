import { getStore } from "@netlify/blobs";
import {
  CloudSaveError,
  MAX_REQUEST_BYTES,
  createCloudSaveService,
} from "../lib/cloud-save.mjs";
import { BlobCloudSaveStore, CLOUD_BLOB_STORE } from "../lib/blob-cloud-save.mjs";

let service;
const ALLOWED_WEB_ORIGINS = new Set([
  "http://59.110.144.30:9091",
  "https://abyssal-echoes-survival.netlify.app",
]);

function cloudSaveService() {
  if (!service) {
    const blobs = getStore({ name: CLOUD_BLOB_STORE, consistency: "strong" });
    const store = new BlobCloudSaveStore(blobs);
    service = createCloudSaveService(store);
  }
  return service;
}

function corsHeaders(request) {
  const origin = request.headers.get("origin");
  if (!origin || !ALLOWED_WEB_ORIGINS.has(origin)) return {};
  return {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(request, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      ...corsHeaders(request),
    },
  });
}

export default async function handler(request) {
  const origin = request.headers.get("origin");
  if (origin && !ALLOWED_WEB_ORIGINS.has(origin)) {
    return json(request, { ok: false, error: "origin_not_allowed", message: "当前网页来源不能访问云存档" }, 403);
  }
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  if (request.method !== "POST") {
    return json(request, { ok: false, error: "method_not_allowed", message: "只支持 POST 请求" }, 405);
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
    return json(request, await cloudSaveService().dispatch(payload));
  } catch (error) {
    if (error instanceof CloudSaveError) {
      return json(request, { ok: false, error: error.code, message: error.message, ...error.details }, error.status);
    }
    console.error("Cloud-save function failed", error);
    return json(request, { ok: false, error: "server_error", message: "云存档服务暂时不可用" }, 500);
  }
}

export const config = {
  path: "/api/cloud-save",
  rateLimit: {
    aggregateBy: ["ip", "domain"],
    windowLimit: 8,
    windowSize: 60,
  },
};
