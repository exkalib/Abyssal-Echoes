#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/.." && pwd)"
apk="$root_dir/android-release/Abyssal-Echoes.apk"
remote_host="${ABYSS_REMOTE_HOST:-aliyun-nrftw}"
remote_dir="${ABYSS_REMOTE_DIR:-/srv/www/abyss-echo/app-update}"

[[ -f "$apk" ]] || { echo "缺少 APK，请先运行 android/build-release.sh" >&2; exit 1; }
ssh "$remote_host" "mkdir -p '$remote_dir'"
scp "$apk" "$remote_host:$remote_dir/Abyssal-Echoes.apk"
ssh "$remote_host" "chmod 644 '$remote_dir/Abyssal-Echoes.apk'"
echo "APK：http://59.110.144.30:9091/app-update/Abyssal-Echoes.apk"
