#!/bin/bash
# 开发模式：把源码目录直接挂进容器，改完 Python 只需 restart，无需 build
#   custom/dev.sh on      开启（重建 3 个后端容器）
#   custom/dev.sh off     关闭（恢复为镜像内代码）
#   之后改代码: cd ~/stacks/xianyu && sudo docker compose restart websocket
set -euo pipefail
SRC=$(cd "$(dirname "$0")/.." && pwd); STACK=$(dirname "$SRC"); cd "$STACK"
F=compose.dev.yaml
case "${1:-}" in
on)
cat > $F <<EOD
services:
  backend-web:
    volumes: ["$SRC/common:/app/common:ro", "$SRC/backend-web/app:/app/backend-web/app:ro"]
  websocket:
    volumes: ["$SRC/common:/app/common:ro", "$SRC/websocket/app:/app/websocket/app:ro"]
  scheduler:
    volumes: ["$SRC/common:/app/common:ro", "$SRC/scheduler/app:/app/scheduler/app:ro"]
EOD
  OV=""; [ -f compose.override.yaml ] && OV="-f compose.override.yaml"
  sudo docker compose -f compose.yaml $OV -f $F up -d backend-web websocket scheduler ;;
off)
  rm -f $F; sudo docker compose up -d backend-web websocket scheduler ;;
*) echo "usage: $0 on|off"; exit 1 ;;
esac
