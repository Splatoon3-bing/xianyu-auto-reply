# 二开说明（custom 分支）

服务器: `~/stacks/xianyu/`，源码: `~/stacks/xianyu/src`（本仓库）

## 分支
- `main`：跟随上游 zhinianboke/xianyu-auto-reply，不直接改
- `custom`：二开代码 + 本目录的构建脚本

## 日常流程
```bash
cd ~/stacks/xianyu/src
# 改代码...
custom/build.sh websocket          # 只重建改过的服务（几秒~几十秒）
sudo docker compose -f ../compose.yaml logs -f websocket   # 观察
git add -A && git commit -m "feat: ..." && git push
```
- 改 `common/` → 三个后端都要 build：`custom/build.sh`
- 改前端 → `custom/build.sh frontend`，并在 ../compose.override.yaml 中取消 frontend 注释
- 快速调试 Python：`custom/dev.sh on`，之后改完 `sudo docker compose restart <服务>`；调完 `custom/dev.sh off`

## 跟进上游更新
```bash
git fetch upstream && git checkout main && git merge --ff-only upstream/main && git push origin main
git checkout custom && git merge main      # 解决冲突
```
上游如果改了依赖或基础镜像：先 `cd .. && sudo docker compose pull`（约 6GB，较慢），
再把 custom/Dockerfile.* 里的 digest 更新为新的官方镜像 digest，然后 build。

## 回滚到官方镜像
`custom/rollback.sh`（数据库、Cookie 等数据不受影响）

## 绝不提交
`.env`、密码、`data/`（数据库、browser_data 里的闲鱼 Cookie）。它们在仓库外的 `~/stacks/xianyu/` 目录下。
