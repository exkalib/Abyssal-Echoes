#!/usr/bin/env bash
set -euo pipefail

config_dir="${ABYSS_CONFIG_DIR:-$HOME/.config/abyss-echo}"
keystore="$config_dir/android-release.jks"
password_file="$config_dir/android-keystore.pass"
mkdir -p "$config_dir"
chmod 700 "$config_dir"

if [[ -e "$keystore" || -e "$password_file" ]]; then
  echo "签名文件已经存在：$keystore"
  exit 0
fi

openssl rand -hex 24 > "$password_file"
chmod 600 "$password_file"
password="$(<"$password_file")"
keytool -genkeypair -noprompt \
  -keystore "$keystore" \
  -storepass "$password" \
  -keypass "$password" \
  -alias abyss-release \
  -keyalg RSA -keysize 4096 -validity 10000 \
  -dname "CN=Abyssal Echoes, OU=Release, O=Exkalib, L=Beijing, C=CN"
chmod 600 "$keystore"
echo "已创建签名文件：$keystore"
