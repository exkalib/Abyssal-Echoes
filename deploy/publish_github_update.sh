#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root_dir"

version="${1:-}"
[[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+([.-][0-9A-Za-z.-]+)?$ ]] || {
  echo "用法：deploy/publish_github_update.sh 0.7.8" >&2
  exit 1
}
tag="game-v${version}"

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

git tag -a "$tag" -m "深渊回响资源 ${version}"
git push origin "$tag"

echo "GitHub 正在校验并发布签名资源："
echo "https://github.com/exkalib/Abyssal-Echoes/actions/workflows/publish-android-release.yml"
