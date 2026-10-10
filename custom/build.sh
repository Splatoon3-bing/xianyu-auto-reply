#!/bin/bash
# 用法: custom/build.sh [服务...]   默认: backend-web websocket scheduler
#      custom/build.sh frontend    前端（编译约需 1GB 内存、几分钟）
set -euo pipefail
SRC=$(cd "$(dirname "$0")/.." && pwd); STACK=$(dirname "$SRC")
SVCS=${*:-backend-web websocket scheduler}
cd "$SRC"
TAG=$(git rev-parse --short HEAD)$(git diff --quiet && git diff --cached --quiet || echo -dirty)
for s in $SVCS; do
  echo "== build $s ($TAG)"
  sudo docker build -q -f custom/Dockerfile.$s -t xianyu-$s:custom -t xianyu-$s:$TAG \
    --label org.opencontainers.image.revision=$TAG .
done
[ -f "$STACK/compose.override.yaml" ] || cp custom/compose.override.yaml "$STACK/compose.override.yaml"
for s in $SVCS; do
  grep -qE "^  $s:" "$STACK/compose.override.yaml" || { echo "!! $s 未在 $STACK/compose.override.yaml 中启用，请取消注释"; exit 1; }
done
cd "$STACK"
sudo docker compose up -d $SVCS
echo "== waiting for health"; sleep 20
sudo docker compose ps --format '{{.Service}} {{.Image}} {{.Status}}'
