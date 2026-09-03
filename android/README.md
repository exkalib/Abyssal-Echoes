# 深渊回响 Android 外壳

这是一个原生 WebView 外壳。APK 内置 `prototype/` 当前版本，离线也能游玩。启动时先进入坠舰开屏并从 GitHub Release 校验签名更新清单：Wi-Fi 下自动更新，其他网络会先确认；没有更新或更新节点不可用时载入本地存档，再由玩家点击“进入游戏”。

游戏进度始终先保存在设备本地。Netlify Blobs 只在玩家明确点击上传、下载或查看上一版本时提供迁移包；读取操作冷却 10 秒，上传、覆盖和恢复冷却 30 秒。正常游玩、切换前后台和退出 App 都不会连接云存档服务。

- 最低系统：Android 8.0（API 26）
- 当前安装包：https://github.com/exkalib/Abyssal-Echoes/releases/latest/download/Abyssal-Echoes.apk

## 更新分层

- HTML、CSS、JavaScript、剧情和数值：运行 `deploy/publish_android_update.sh` 生成并暂存签名资源，再创建 `game-v*` 标签发布到 GitHub；已安装的 App 下次启动自动下载并切换。
- Android 权限、WebView 外壳、更新协议：提高 `SHELL_VERSION` 和 `versionCode`，重新构建 APK；发布清单时把第三个参数设为新的外壳版本，再创建 `android-v*` 标签发布到 GitHub。

资源更新依次校验 ECDSA 清单签名、ZIP 文件长度和 SHA-256。安装使用临时目录，加载失败会回滚到上一资源版本。

## 首次构建

```bash
cd android
./create-signing-key.sh
./build-release.sh
../deploy/publish_android_apk.sh
../deploy/publish_android_update.sh 1 0.1.0 1
```

发布签名私钥位于 `~/.config/abyss-echo/update-signing-key.pem`，APK 签名文件位于 `~/.config/abyss-echo/android-release.jks`。两者都不得提交到 Git；丢失 APK 签名文件后将无法覆盖安装未来的原生版本。

服务器的受限备份目录为 `/root/.config/abyss-echo/`（权限 `600`）。服务器 Web 根目录中不存放任何私钥；59 仅保留测试网页和发布暂存，不再作为正式更新或云存档下载源。
