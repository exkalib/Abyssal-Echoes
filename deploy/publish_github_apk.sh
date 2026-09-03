#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root_dir"

version="${1:-$(sed -n 's/^[[:space:]]*versionName "\([^"]*\)"/\1/p' android/app/build.gradle | head -1)}"
tag="android-v${version}"

[[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z.-]+)?$ ]] || {
  echo "Android 版本格式不正确：$version" >&2
  exit 1
}

git diff --quiet && git diff --cached --quiet || {
  echo "发布前必须先提交当前改动" >&2
  exit 1
}

git fetch origin main --tags
[[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]] || {
  echo "发布提交尚未同步到 origin/main" >&2
  exit 1
}

if git rev-parse "$tag" >/dev/null 2>&1; then
  echo "版本标签已存在：$tag" >&2
  exit 1
fi

git tag -a "$tag" -m "深渊回响 Android ${version}"
git push origin "$tag"

echo "GitHub 正在校验并发布 APK："
echo "https://github.com/exkalib/Abyssal-Echoes/actions/workflows/publish-android-release.yml"
