#!/bin/bash
# 回到官方镜像：移除 override 后重建应用容器（数据不受影响）
set -euo pipefail
STACK=$(cd "$(dirname "$0")/../.." && pwd); cd "$STACK"
[ -f compose.override.yaml ] && mv compose.override.yaml compose.override.yaml.disabled.$(date +%Y%m%d%H%M%S)
sudo docker compose up -d backend-web websocket scheduler frontend
sleep 20; sudo docker compose ps --format '{{.Service}} {{.Image}} {{.Status}}'
