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

test("landing advances in locked full-screen panels without a visible scrollbar", () => {
  const html = fs.readFileSync(path.join(publicDir, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(publicDir, "site.css"), "utf8");
  const script = fs.readFileSync(path.join(publicDir, "site.js"), "utf8");

  assert.equal(html.match(/data-page-panel/g)?.length, 7);
  assert.match(css, /scroll-snap-type:\s*y mandatory/);
  assert.match(css, /scrollbar-width:\s*none/);
  assert.match(css, /\.page-panel\s*\{[\s\S]*height:\s*100svh[\s\S]*scroll-snap-stop:\s*always/);
  assert.match(script, /WHEEL_THRESHOLD\s*=\s*72/);
  assert.match(script, /TOUCH_THRESHOLD\s*=\s*56/);
  assert.match(script, /PAGE_LOCK_MS\s*=\s*reducedMotion\s*\?\s*180\s*:\s*1800/);
  assert.doesNotMatch(script, /wheelPaging/);
  assert.match(script, /addEventListener\('wheel'[\s\S]*passive:\s*false/);
  assert.match(script, /addEventListener\('touchmove'[\s\S]*passive:\s*false/);
});

test("tagged Android releases verify the APK before publishing", () => {
  const workflow = fs.readFileSync(path.join(root, ".github", "workflows", "publish-android-release.yml"), "utf8");
  assert.match(workflow, /tags:[\s\S]*android-v\*[\s\S]*game-v\*/);
  assert.match(workflow, /apkSha256[\s\S]*apkSize[\s\S]*sha256sum --check --strict/);
  assert.match(workflow, /manifest\.sig[\s\S]*BUNDLE_NAME[\s\S]*bundle_hash[\s\S]*gh release create[\s\S]*--latest/);
});
