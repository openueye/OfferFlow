#!/usr/bin/env bash

set -Eeuo pipefail

readonly PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

trap 'echo "[OfferFlow] 启动失败（第 ${LINENO} 行）。" >&2' ERR

echo "[OfferFlow] 正在检查运行环境..."

if ! command -v node >/dev/null 2>&1; then
  echo "[OfferFlow] 未找到 Node.js。请先安装 Node.js 22.x。" >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[OfferFlow] 未找到 npm。请安装随 Node.js 22.x 提供的 npm。" >&2
  exit 1
fi

readonly NODE_MAJOR="$(node -p "process.versions.node.split('.')[0]")"
if [[ "$NODE_MAJOR" != "22" ]]; then
  echo "[OfferFlow] 当前 Node.js 版本为 $(node --version)，项目需要 22.x。" >&2
  echo "[OfferFlow] 如果使用 nvm，请执行：nvm install && nvm use" >&2
  exit 1
fi

echo "[OfferFlow] 正在准备本地 SQLite 配置..."
node scripts/switch-db.mjs sqlite

if [[ ! -d node_modules ]] ||
  [[ ! -f node_modules/.package-lock.json ]] ||
  [[ package.json -nt node_modules/.package-lock.json ]] ||
  [[ package-lock.json -nt node_modules/.package-lock.json ]]; then
  echo "[OfferFlow] 正在安装依赖..."
  npm ci
else
  echo "[OfferFlow] 依赖已是最新，跳过安装。"
  npm run db:generate
fi

echo "[OfferFlow] 正在同步本地数据库..."
npm run db:push -- --skip-generate

echo "[OfferFlow] 启动开发服务器：http://localhost:3000"
if (( $# > 0 )); then
  exec npm run dev -- "$@"
else
  exec npm run dev
fi
