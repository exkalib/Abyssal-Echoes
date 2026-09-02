import { HISTORY_LIMIT } from "../lib/cloud-save.mjs";

export default async function handler(request) {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({
      ok: false,
      error: "method_not_allowed",
      message: "只支持 GET 请求",
    }), {
      status: 405,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
  return new Response(JSON.stringify({
    ok: true,
    service: "cloud-save",
    storage: "netlify-database",
    historyLimit: HISTORY_LIMIT,
  }), {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
