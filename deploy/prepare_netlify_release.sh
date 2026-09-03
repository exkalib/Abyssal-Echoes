#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/.." && pwd)"
config_dir="${ABYSS_CONFIG_DIR:-$HOME/.config/abyss-echo}"
signing_key="${ABYSS_UPDATE_KEY:-$config_dir/update-signing-key.pem}"
apk_source="${ABYSS_APK_FILE:-$root_dir/android-release/Abyssal-Echoes.apk}"
output_dir="$root_dir/prototype/app-update"
public_url="${ABYSS_PUBLIC_URL:-http://59.110.144.30:9091}"
build="${1:-1788331816}"
version="${2:-0.5.3-own-server}"
min_shell="${3:-1}"

[[ "$build" =~ ^[0-9]+$ ]] || { echo "build 必须是正整数" >&2; exit 1; }
[[ "$min_shell" =~ ^[0-9]+$ ]] || { echo "minShell 必须是正整数" >&2; exit 1; }
[[ "$version" =~ ^[0-9A-Za-z._-]+$ ]] || { echo "version 只能包含字母、数字、点、下划线和横线" >&2; exit 1; }
[[ -f "$signing_key" ]] || { echo "缺少更新签名私钥：$signing_key" >&2; exit 1; }
[[ -f "$apk_source" ]] || { echo "缺少 APK：$apk_source" >&2; exit 1; }

work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT
payload_dir="$work_dir/payload"
mkdir -p "$payload_dir/assets" "$output_dir"

cp "$root_dir/prototype/index.html" "$root_dir/prototype/style.css" \
  "$root_dir/prototype/ui-system.css" "$root_dir/prototype/game.js" "$payload_dir/"
cp -R "$root_dir/prototype/assets/." "$payload_dir/assets/"
find "$payload_dir/assets" -type f \( \
  -name '*-contact.png' -o -name '*-contact-final.png' -o -name '*-contact.jpg' \
\) -delete

bundle="bundle.zip"
(cd "$payload_dir" && zip -q -9 -r "$work_dir/$bundle" index.html style.css ui-system.css game.js assets)
sha256="$(shasum -a 256 "$work_dir/$bundle" | awk '{print $1}')"
size="$(wc -c < "$work_dir/$bundle" | tr -d ' ')"
apk_url="${public_url%/}/app-update/Abyssal-Echoes.apk"
apk_sha256="$(shasum -a 256 "$apk_source" | awk '{print $1}')"
apk_size="$(wc -c < "$apk_source" | tr -d ' ')"

printf '{"schema":1,"build":%s,"version":"%s","minShell":%s,"bundle":"%s","sha256":"%s","size":%s,"apkUrl":"%s","apkSha256":"%s","apkSize":%s}\n' \
  "$build" "$version" "$min_shell" "$bundle" "$sha256" "$size" "$apk_url" "$apk_sha256" "$apk_size" > "$work_dir/manifest.json"
openssl dgst -sha256 -sign "$signing_key" -out "$work_dir/manifest.sig.bin" "$work_dir/manifest.json"
base64 < "$work_dir/manifest.sig.bin" | tr -d '\n' > "$work_dir/manifest.sig"

install -m 644 "$work_dir/$bundle" "$output_dir/$bundle"
install -m 644 "$work_dir/manifest.json" "$output_dir/manifest.json"
install -m 644 "$work_dir/manifest.sig" "$output_dir/manifest.sig"
install -m 644 "$apk_source" "$output_dir/Abyssal-Echoes.apk"

echo "59 测试服更新资源已生成：build $build · $version"
echo "清单：${public_url%/}/app-update/manifest.json"
echo "APK：$apk_url"
