#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/.." && pwd)"
config_dir="${ABYSS_CONFIG_DIR:-$HOME/.config/abyss-echo}"
signing_key="${ABYSS_UPDATE_KEY:-$config_dir/update-signing-key.pem}"
remote_host="${ABYSS_REMOTE_HOST:-aliyun-nrftw}"
remote_dir="${ABYSS_REMOTE_DIR:-/srv/www/abyss-echo/app-update}"
build="${1:-$(date +%s)}"
version="${2:-$(date +%Y.%m.%d-%H%M)}"
min_shell="${3:-1}"

[[ "$build" =~ ^[0-9]+$ ]] || { echo "build 必须是正整数" >&2; exit 1; }
[[ "$min_shell" =~ ^[0-9]+$ ]] || { echo "minShell 必须是正整数" >&2; exit 1; }
[[ "$version" =~ ^[0-9A-Za-z._-]+$ ]] || { echo "version 只能包含字母、数字、点、下划线和横线" >&2; exit 1; }
[[ -f "$signing_key" ]] || { echo "缺少更新签名私钥：$signing_key" >&2; exit 1; }

work_dir="$(mktemp -d)"
payload_dir="$work_dir/payload"
mkdir -p "$payload_dir"
cp "$root_dir/prototype/index.html" "$root_dir/prototype/style.css" "$root_dir/prototype/game.js" "$payload_dir/"

bundle="bundle-$build.zip"
(cd "$payload_dir" && zip -q -9 "$work_dir/$bundle" index.html style.css game.js)
sha256="$(shasum -a 256 "$work_dir/$bundle" | awk '{print $1}')"
size="$(wc -c < "$work_dir/$bundle" | tr -d ' ')"
apk_url="http://59.110.144.30:9091/app-update/Abyssal-Echoes.apk"

printf '{"schema":1,"build":%s,"version":"%s","minShell":%s,"bundle":"%s","sha256":"%s","size":%s,"apkUrl":"%s"}\n' \
  "$build" "$version" "$min_shell" "$bundle" "$sha256" "$size" "$apk_url" > "$work_dir/manifest.json"
openssl dgst -sha256 -sign "$signing_key" -out "$work_dir/manifest.sig.bin" "$work_dir/manifest.json"
base64 < "$work_dir/manifest.sig.bin" | tr -d '\n' > "$work_dir/manifest.sig"

ssh "$remote_host" "mkdir -p '$remote_dir'"
scp "$work_dir/$bundle" "$remote_host:$remote_dir/$bundle"
scp "$work_dir/manifest.json" "$remote_host:$remote_dir/manifest.json.new"
scp "$work_dir/manifest.sig" "$remote_host:$remote_dir/manifest.sig.new"
ssh "$remote_host" "chmod 644 '$remote_dir/$bundle' '$remote_dir/manifest.json.new' '$remote_dir/manifest.sig.new' && mv '$remote_dir/manifest.sig.new' '$remote_dir/manifest.sig' && mv '$remote_dir/manifest.json.new' '$remote_dir/manifest.json'"

echo "已发布资源版本 ${version}（build ${build}）"
echo "清单：http://59.110.144.30:9091/app-update/manifest.json"
