#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
config_dir="${ABYSS_CONFIG_DIR:-$HOME/.config/abyss-echo}"
keystore="${ABYSS_KEYSTORE_FILE:-$config_dir/android-release.jks}"
password_file="$config_dir/android-keystore.pass"

if [[ ! -f "$keystore" || ! -f "$password_file" ]]; then
  echo "缺少安卓签名文件。先运行 android/create-signing-key.sh" >&2
  exit 1
fi

export ABYSS_KEYSTORE_FILE="$keystore"
export ABYSS_KEYSTORE_PASSWORD="$(<"$password_file")"
export ABYSS_KEY_PASSWORD="$ABYSS_KEYSTORE_PASSWORD"
export ABYSS_KEY_ALIAS="abyss-release"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/.local/android-sdk}"

cd "$script_dir"
./gradlew --no-daemon clean assembleRelease
mkdir -p "$script_dir/../android-release"
cp "$script_dir/app/build/outputs/apk/release/app-release.apk" "$script_dir/../android-release/Abyssal-Echoes.apk"
"$ANDROID_HOME/build-tools/36.0.0/apksigner" verify --verbose --print-certs "$script_dir/../android-release/Abyssal-Echoes.apk"
echo "APK: $script_dir/../android-release/Abyssal-Echoes.apk"
