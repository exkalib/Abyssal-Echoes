#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/.." && pwd)"
config_dir="${ABYSS_CONFIG_DIR:-$HOME/.config/abyss-echo}"
signing_key="${ABYSS_UPDATE_KEY:-$config_dir/update-signing-key.pem}"
apk_source="$root_dir/android-release/Abyssal-Echoes.apk"
remote_host="${ABYSS_REMOTE_HOST:-aliyun-nrftw}"
remote_dir="${ABYSS_REMOTE_DIR:-/srv/www/abyss-echo/app-update}"
web_dir="${ABYSS_WEB_DIR:-/srv/www/abyss-echo}"
build="${1:-$(date +%s)}"
version="${2:-$(date +%Y.%m.%d-%H%M)}"
min_shell="${3:-1}"
bundle_mode="${4:-full}"

[[ "$build" =~ ^[0-9]+$ ]] || { echo "build 必须是正整数" >&2; exit 1; }
[[ "$min_shell" =~ ^[0-9]+$ ]] || { echo "minShell 必须是正整数" >&2; exit 1; }
[[ "$version" =~ ^[0-9A-Za-z._-]+$ ]] || { echo "version 只能包含字母、数字、点、下划线和横线" >&2; exit 1; }
[[ "$bundle_mode" == "full" || "$bundle_mode" == "lean" ]] || { echo "bundle_mode 只能是 full 或 lean" >&2; exit 1; }
[[ -f "$signing_key" ]] || { echo "缺少更新签名私钥：$signing_key" >&2; exit 1; }
[[ -f "$apk_source" ]] || { echo "缺少 APK，请先运行 android/build-release.sh" >&2; exit 1; }

work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT
payload_dir="$work_dir/payload"
mkdir -p "$payload_dir"
cp "$root_dir/prototype/index.html" "$root_dir/prototype/style.css" "$root_dir/prototype/ui-system.css" "$root_dir/prototype/story-scenes.css" "$root_dir/prototype/game.js" "$payload_dir/"
bundle_files=(index.html style.css ui-system.css story-scenes.css game.js)
if [[ "$bundle_mode" == "full" ]]; then
  cp -R "$root_dir/prototype/assets" "$payload_dir/assets"
  bundle_files+=(assets)
else
  # 精简热更新也要携带本版本新增的科技台图；旧 APK 的内置资源中没有它。
  mkdir -p "$payload_dir/assets/building-art-v1"
  cp "$root_dir/prototype/assets/building-art-v1/research.png" "$payload_dir/assets/building-art-v1/"
  bundle_files+=(assets)
fi

bundle="bundle-$build.zip"
(cd "$payload_dir" && zip -q -9 -r "$work_dir/$bundle" "${bundle_files[@]}")
sha256="$(shasum -a 256 "$work_dir/$bundle" | awk '{print $1}')"
size="$(wc -c < "$work_dir/$bundle" | tr -d ' ')"
apk_url="${ABYSS_APK_URL:-https://github.com/exkalib/Abyssal-Echoes/releases/latest/download/Abyssal-Echoes.apk}"
apk_sha256="$(shasum -a 256 "$apk_source" | awk '{print $1}')"
apk_size="$(wc -c < "$apk_source" | tr -d ' ')"

printf '{"schema":1,"build":%s,"version":"%s","minShell":%s,"bundle":"%s","sha256":"%s","size":%s,"apkUrl":"%s","apkSha256":"%s","apkSize":%s}\n' \
  "$build" "$version" "$min_shell" "$bundle" "$sha256" "$size" "$apk_url" "$apk_sha256" "$apk_size" > "$work_dir/manifest.json"
openssl dgst -sha256 -sign "$signing_key" -out "$work_dir/manifest.sig.bin" "$work_dir/manifest.json"
base64 < "$work_dir/manifest.sig.bin" | tr -d '\n' > "$work_dir/manifest.sig"

# 59 服务器统一负责网页版、签名更新资源和手动云存档。
scp "$root_dir/deploy/serve_static.py" "$remote_host:$web_dir/serve_static.py.new"
scp "$root_dir/deploy/abyss-echo.service" "$remote_host:/etc/systemd/system/abyss-echo.service.new"
ssh "$remote_host" "install -d -o nobody -g nobody -m 700 /var/lib/abyss-echo; install -d -m 700 /var/backups/abyss-echo; if [ -f /var/lib/abyss-echo/saves.sqlite3 ]; then sqlite3 /var/lib/abyss-echo/saves.sqlite3 \".backup '/var/backups/abyss-echo/saves-before-$build.sqlite3'\"; chmod 600 /var/backups/abyss-echo/saves-before-$build.sqlite3; fi; service_changed=0; if ! cmp -s '$web_dir/serve_static.py.new' '$web_dir/serve_static.py'; then install -m 755 '$web_dir/serve_static.py.new' '$web_dir/serve_static.py'; service_changed=1; fi; rm -f '$web_dir/serve_static.py.new'; if ! cmp -s /etc/systemd/system/abyss-echo.service.new /etc/systemd/system/abyss-echo.service; then install -m 644 /etc/systemd/system/abyss-echo.service.new /etc/systemd/system/abyss-echo.service; systemctl daemon-reload; service_changed=1; fi; rm -f /etc/systemd/system/abyss-echo.service.new; if [ \"\$service_changed\" = 1 ]; then systemctl restart abyss-echo.service; fi; for attempt in 1 2 3 4 5; do curl -fsS http://127.0.0.1:9091/api/cloud-save/health >/dev/null && exit 0; sleep 1; done; exit 1"

ssh "$remote_host" "mkdir -p '$remote_dir'"
scp "$work_dir/$bundle" "$remote_host:$remote_dir/$bundle"
remote_apk_sha256="$(ssh "$remote_host" "if [ -f '$remote_dir/Abyssal-Echoes.apk' ]; then sha256sum '$remote_dir/Abyssal-Echoes.apk' | cut -d' ' -f1; fi")"
if [[ "$remote_apk_sha256" != "$apk_sha256" ]]; then
  scp "$apk_source" "$remote_host:$remote_dir/Abyssal-Echoes.apk.new"
  ssh "$remote_host" "chmod 644 '$remote_dir/Abyssal-Echoes.apk.new' && mv '$remote_dir/Abyssal-Echoes.apk.new' '$remote_dir/Abyssal-Echoes.apk'"
else
  echo "服务器 APK 校验一致，跳过重复上传"
fi
scp "$work_dir/manifest.json" "$remote_host:$remote_dir/manifest.json.new"
scp "$work_dir/manifest.sig" "$remote_host:$remote_dir/manifest.sig.new"
ssh "$remote_host" "chmod 644 '$remote_dir/$bundle' '$remote_dir/manifest.json.new' '$remote_dir/manifest.sig.new' && mv '$remote_dir/manifest.sig.new' '$remote_dir/manifest.sig' && mv '$remote_dir/manifest.json.new' '$remote_dir/manifest.json'"

# Safari/浏览器直接读取站点根目录；资源先同步，入口文件最后切换，避免页面引用到尚未上传的文件。
ssh "$remote_host" "mkdir -p '$web_dir/assets'"
if [[ "$bundle_mode" == "full" ]]; then
  scp -r "$root_dir/prototype/assets" "$remote_host:$web_dir/"
else
  ssh "$remote_host" "mkdir -p '$web_dir/assets/building-art-v1'"
  scp "$root_dir/prototype/assets/building-art-v1/research.png" "$remote_host:$web_dir/assets/building-art-v1/research.png"
fi
for file in style.css ui-system.css story-scenes.css game.js index.html; do
  scp "$root_dir/prototype/$file" "$remote_host:$web_dir/$file.new"
done
ssh "$remote_host" "chmod 644 '$web_dir/style.css.new' '$web_dir/ui-system.css.new' '$web_dir/story-scenes.css.new' '$web_dir/game.js.new' '$web_dir/index.html.new' && mv '$web_dir/style.css.new' '$web_dir/style.css' && mv '$web_dir/ui-system.css.new' '$web_dir/ui-system.css' && mv '$web_dir/story-scenes.css.new' '$web_dir/story-scenes.css' && mv '$web_dir/game.js.new' '$web_dir/game.js' && mv '$web_dir/index.html.new' '$web_dir/index.html'"

echo "已发布资源版本 ${version}（build ${build}）"
echo "清单：http://59.110.144.30:9091/app-update/manifest.json"
echo "网页版：http://59.110.144.30:9091/"
