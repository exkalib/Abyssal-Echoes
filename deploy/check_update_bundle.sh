#!/usr/bin/env bash
set -euo pipefail

bundle_file="${1:?需要更新 ZIP 路径}"
# Shell 11 uses the same bound for download AND total extracted bytes.
# The optional bound is used by tiny regression fixtures; publishers use 160 MiB.
limit_bytes="${2:-167772160}"
[[ "$limit_bytes" =~ ^[1-9][0-9]*$ ]] || { echo "资源上限必须为正整数" >&2; exit 1; }
[[ -f "$bundle_file" ]] || { echo "缺少更新 ZIP" >&2; exit 1; }
compressed_bytes="$(wc -c < "$bundle_file" | tr -d ' ')"
expanded_bytes="$(unzip -l "$bundle_file" | awk 'END {print $1}')"
[[ "$expanded_bytes" =~ ^[0-9]+$ ]] || { echo "无法读取 ZIP 解压大小" >&2; exit 1; }
if (( compressed_bytes <= 0 || compressed_bytes > limit_bytes || expanded_bytes <= 0 || expanded_bytes > limit_bytes )); then
  echo "更新包超过旧版兼容限制：ZIP $compressed_bytes / 解压 $expanded_bytes / 上限 $limit_bytes 字节；请使用兼容 lean 包。尚未上传。" >&2
  exit 1
fi
echo "旧版更新容量校验通过：ZIP $compressed_bytes / 解压 $expanded_bytes / 上限 $limit_bytes 字节"
