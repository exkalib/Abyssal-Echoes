import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const publicDir = path.join(root, "netlify", "public");

test("landing page is a lightweight download site, not the web game", () => {
  const html = fs.readFileSync(path.join(publicDir, "index.html"), "utf8");
  const download = "https://github.com/exkalib/Abyssal-Echoes/releases/latest/download/Abyssal-Echoes.apk";

  assert.match(html, /深渊回响 · Abyssal Echoes/);
  assert.equal(html.split(download).length - 1, 3);
  assert.doesNotMatch(html, /prototype\/game\.js|游戏网页版|noindex/);
  assert.match(html, /href="\.\/site\.css"/);
  assert.match(html, /src="\.\/site\.js"/);
});

test("promotional artwork stays optimized for Netlify bandwidth", () => {
  const posters = ["hero-crash-ark.jpg", "expedition-cargo.jpg", "core-echo.jpg"];
  let total = 0;
  for (const poster of posters) {
    const bytes = fs.statSync(path.join(publicDir, "assets", poster)).size;
    assert.ok(bytes < 500_000, `${poster} should remain below 500 KB`);
    total += bytes;
  }
  assert.ok(total < 1_200_000, "all promotional images should remain below 1.2 MB");
});

test("tagged Android releases verify the APK before publishing", () => {
  const workflow = fs.readFileSync(path.join(root, ".github", "workflows", "publish-android-release.yml"), "utf8");
  assert.match(workflow, /tags:[\s\S]*android-v\*/);
  assert.match(workflow, /apkSha256[\s\S]*apkSize[\s\S]*sha256sum --check --strict/);
  assert.match(workflow, /gh release create[\s\S]*--latest/);
});
