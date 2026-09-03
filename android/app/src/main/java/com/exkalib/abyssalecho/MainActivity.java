package com.exkalib.abyssalecho;

import android.app.Activity;
import android.app.AlertDialog;
import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.Uri;
import android.os.Bundle;
import android.os.Build;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.JavascriptInterface;
import android.widget.FrameLayout;
import android.widget.TextView;

import org.json.JSONObject;

import java.io.File;

public final class MainActivity extends Activity {
    private WebView webView;
    private TextView updateStatus;
    private BundleUpdater updater;
    private CloudSaveClient cloudSaves;
    private boolean rollbackAttempted;
    private boolean updateCheckRunning;
    private boolean launchCheckStarted;
    private boolean launchResolved;
    private BundleUpdater.UpdateInfo pendingNativeUpdate;
    private File pendingNativeApk;
    private boolean waitingForInstallPermission;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureFullscreen();
        updater = new BundleUpdater(this);
        cloudSaves = new CloudSaveClient();
        buildUi();
        configureWebView();
        configureBackNavigation();
        loadGame();
    }

    private void buildUi() {
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(5, 9, 14));

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(5, 9, 14));
        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        updateStatus = new TextView(this);
        updateStatus.setTextColor(Color.rgb(211, 245, 255));
        updateStatus.setTextSize(12f);
        updateStatus.setGravity(Gravity.CENTER);
        updateStatus.setBackgroundColor(Color.argb(235, 10, 24, 36));
        updateStatus.setPadding(dp(16), dp(8), dp(16), dp(8));
        updateStatus.setVisibility(View.GONE);
        FrameLayout.LayoutParams statusParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.TOP | Gravity.CENTER_HORIZONTAL);
        statusParams.topMargin = dp(12);
        root.addView(updateStatus, statusParams);
        setContentView(root);
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(settings.getUserAgentString() + " AbyssalEchoesShell/" + BuildConfig.SHELL_VERSION);
        webView.addJavascriptInterface(new AppBridge(), "AbyssApp");
        webView.setWebViewClient(new LocalContentWebViewClient(this, updater,
                this::handleMainPageError, this::handleMainPageReady));
    }

    private void checkForUpdates() {
        checkForUpdates(false);
    }

    private void checkForUpdates(boolean startup) {
        if (updateCheckRunning) {
            if (startup) notifyLaunchState("checking", "正在检查资源更新", "正在等待更新节点响应。", null);
            else showStatus("正在检查资源更新…", 0L);
            return;
        }
        updateCheckRunning = true;
        updater.check(new BundleUpdater.Listener() {
            @Override public void onStatus(String text) {
                if (startup) {
                    String phase = text.contains("安装") ? "installing" : text.contains("下载") ? "downloading" : "checking";
                    notifyLaunchState(phase, text, phase.equals("installing") ? "资源校验完成，正在切换版本。" : "请保持应用在前台。", null);
                } else showStatus(text, 0L);
            }
            @Override public void onNoUpdate() {
                updateCheckRunning = false;
                if (startup) releaseLaunchGate("ready", "版本校验完成", "本地存档已经载入，可以进入游戏。");
                else showStatus("资源已是最新版本", 900L);
            }
            @Override public void onUpdateAvailable(BundleUpdater.UpdateInfo update) {
                handleUpdateAvailable(update, startup, this);
            }
            @Override public void onProgress(int percent) {
                boolean nativeUpdate = pendingNativeUpdate != null;
                String target = nativeUpdate ? "安装包" : "资源更新";
                if (startup) notifyLaunchState("downloading", "正在下载" + target,
                        nativeUpdate ? "下载完成后将请求系统确认安装。" : "更新完成后将自动校验并加载。", percent);
                else showStatus("正在下载" + target + " " + percent + "%", 0L);
            }
            @Override public void onNativeReady(File apk, BundleUpdater.UpdateInfo update) {
                updateCheckRunning = false;
                pendingNativeApk = apk;
                pendingNativeUpdate = update;
                installDownloadedApk();
            }
            @Override public void onReady(long build, String version) {
                updateCheckRunning = false;
                rollbackAttempted = false;
                launchResolved = true;
                if (startup) notifyLaunchState("installing", "更新安装完成", "正在重新载入方舟系统。", 100);
                else showStatus("已更新至 " + version, 1300L);
                webView.clearCache(true);
                loadGame();
            }
            @Override public void onError(String message) {
                updateCheckRunning = false;
                if (pendingNativeUpdate != null) {
                    BundleUpdater.UpdateInfo failedUpdate = pendingNativeUpdate;
                    pendingNativeApk = null;
                    pendingNativeUpdate = null;
                    waitingForInstallPermission = false;
                    showNativeUpdateFallback(failedUpdate, message);
                    return;
                }
                if (startup) releaseLaunchGate("offline", "更新节点不可用", "已切换离线模式，本地存档仍可正常游玩。");
                else showStatus("离线运行 · " + message, 1600L);
            }
        });
    }

    private void handleUpdateAvailable(BundleUpdater.UpdateInfo update, boolean startup,
                                       BundleUpdater.Listener listener) {
        String description = update.nativeShell
                ? "检测到安卓外壳更新 " + update.version + " · " + readableSize(update.expectedSize)
                : "检测到资源更新 " + update.version + " · " + readableSize(update.expectedSize);
        if (startup) notifyLaunchState("checking", "发现可用更新", description, null);
        else showStatus(description, 0L);
        if (isWifiOrUnmetered()) {
            startUpdate(update, startup, listener);
            return;
        }
        new AlertDialog.Builder(this)
                .setTitle("当前不是 Wi-Fi 网络")
                .setMessage(description + "。继续更新可能消耗移动数据；如果不更新，本次将退出游戏。")
                .setCancelable(false)
                .setNegativeButton("退出游戏", (dialog, which) -> {
                    updateCheckRunning = false;
                    finishAndRemoveTask();
                })
                .setPositiveButton("继续更新", (dialog, which) -> startUpdate(update, startup, listener))
                .show();
    }

    private void startUpdate(BundleUpdater.UpdateInfo update, boolean startup,
                             BundleUpdater.Listener listener) {
        if (update.nativeShell) {
            pendingNativeUpdate = update;
            if (startup) notifyLaunchState("downloading", "正在下载安装包", "下载完成后将请求系统确认安装。", 0);
            else notifyWebUpdateStatus("正在下载安装包 " + update.version, false);
            updater.downloadNativeUpdate(update, listener);
            return;
        }
        if (startup) notifyLaunchState("downloading", "正在下载资源更新", "更新完成后将自动校验并安装。", 0);
        updater.downloadAndInstall(update, listener);
    }

    private boolean isWifiOrUnmetered() {
        ConnectivityManager manager = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
        if (manager == null) return false;
        Network network = manager.getActiveNetwork();
        NetworkCapabilities capabilities = network == null ? null : manager.getNetworkCapabilities(network);
        return capabilities != null && (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)
                || capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)
                || capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_METERED));
    }

    private static String readableSize(long bytes) {
        if (bytes <= 0L) return "安装包";
        return String.format(java.util.Locale.CHINA, "%.1f MB", bytes / 1024d / 1024d);
    }

    private void handleMainPageError() {
        if (!rollbackAttempted && updater.rollback()) {
            rollbackAttempted = true;
            showStatus("新资源加载失败，已恢复上一版本", 1800L);
            loadGame();
        }
    }

    private void handleMainPageReady() {
        if (launchResolved) {
            notifyLaunchState("ready", "方舟系统已就绪", "本地存档已经载入，可以进入游戏。", 100);
        } else if (!launchCheckStarted) {
            launchCheckStarted = true;
            checkForUpdates(true);
        }
    }

    private void loadGame() {
        webView.loadUrl(LocalContentWebViewClient.HOME);
    }

    private void installDownloadedApk() {
        BundleUpdater.UpdateInfo update = pendingNativeUpdate;
        File apk = pendingNativeApk;
        if (update == null || apk == null || !apk.isFile()) {
            if (update != null) showNativeUpdateFallback(update, "已下载的安装包不存在");
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                && !getPackageManager().canRequestPackageInstalls()) {
            notifyLaunchState("installing", "需要允许安装游戏更新",
                    "安卓系统需要你确认一次“允许来自此来源”。授权后会继续安装。", 100);
            new AlertDialog.Builder(this)
                    .setTitle("允许安装游戏更新")
                    .setMessage("请在系统设置中开启“允许来自此来源”，返回后会自动继续安装。")
                    .setCancelable(false)
                    .setPositiveButton("去开启权限", (dialog, which) -> openInstallPermissionSettings())
                    .setNegativeButton("手动下载", (dialog, which) -> openManualUpdate(update.apkUrl))
                    .show();
            return;
        }
        try {
            Uri uri = UpdateFileProvider.contentUri(getPackageName());
            Intent install = new Intent(Intent.ACTION_VIEW)
                    .setDataAndType(uri, "application/vnd.android.package-archive")
                    .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            startActivity(install);
            pendingNativeApk = null;
            pendingNativeUpdate = null;
            finishAndRemoveTask();
        } catch (Exception error) {
            showNativeUpdateFallback(update, "系统安装界面未能启动");
        }
    }

    private void openInstallPermissionSettings() {
        waitingForInstallPermission = true;
        try {
            Intent settings = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:" + getPackageName()));
            startActivity(settings);
        } catch (Exception error) {
            waitingForInstallPermission = false;
            if (pendingNativeUpdate != null) {
                showNativeUpdateFallback(pendingNativeUpdate, "无法打开安装权限设置");
            }
        }
    }

    private void showNativeUpdateFallback(BundleUpdater.UpdateInfo update, String reason) {
        updateCheckRunning = false;
        notifyLaunchState("installing", "自动安装未完成",
                reason + "。可以改用系统浏览器手动下载安装包。", null);
        AlertDialog.Builder builder = new AlertDialog.Builder(this)
                .setTitle("自动安装未完成")
                .setMessage(reason + "。\n\n可以改用系统浏览器下载新版 APK；安装完成后重新打开游戏。")
                .setCancelable(false)
                .setPositiveButton("手动下载", (dialog, which) -> openManualUpdate(update.apkUrl))
                .setNegativeButton("退出游戏", (dialog, which) -> finishAndRemoveTask());
        if (pendingNativeApk != null && pendingNativeApk.isFile()) {
            builder.setNeutralButton("重试安装", (ignored, which) -> installDownloadedApk());
        }
        builder.show();
    }

    private void openManualUpdate(String apkUrl) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl)));
            notifyLaunchState("installing", "已打开手动下载",
                    "请在浏览器下载并安装新版，完成后重新打开游戏。", null);
        } catch (Exception error) {
            new AlertDialog.Builder(this)
                    .setTitle("无法打开下载地址")
                    .setMessage("请在浏览器访问：\n" + apkUrl)
                    .setPositiveButton("知道了", null)
                    .show();
        }
    }

    private void showStatus(String text, long hideAfterMs) {
        updateStatus.setText(text);
        updateStatus.setVisibility(View.VISIBLE);
        updateStatus.removeCallbacks(hideStatusAction);
        if (hideAfterMs > 0L) updateStatus.postDelayed(hideStatusAction, hideAfterMs);
        notifyWebUpdateStatus(text, hideAfterMs > 0L);
    }

    private void notifyWebUpdateStatus(String text, boolean finished) {
        if (webView == null) return;
        String script = "window.onAbyssUpdateStatus&&window.onAbyssUpdateStatus("
                + JSONObject.quote(text) + "," + finished + ");";
        webView.evaluateJavascript(script, null);
    }

    private void notifyLaunchState(String state, String text, String detail, Integer progress) {
        if (webView == null) return;
        String value = progress == null ? "null" : String.valueOf(progress);
        String script = "window.onAbyssLaunchState&&window.onAbyssLaunchState("
                + JSONObject.quote(state) + "," + JSONObject.quote(text) + ","
                + JSONObject.quote(detail) + "," + value + ");";
        webView.evaluateJavascript(script, null);
    }

    private void releaseLaunchGate(String state, String text, String detail) {
        launchResolved = true;
        notifyLaunchState(state, text, detail, 100);
    }

    private final class AppBridge {
        @JavascriptInterface
        public void checkForUpdates() {
            runOnUiThread(MainActivity.this::checkForUpdates);
        }

        @JavascriptInterface
        public String versionInfo() {
            return "安卓 " + BuildConfig.VERSION_NAME + " · 外壳 " + BuildConfig.SHELL_VERSION
                    + " · 资源 " + updater.currentBuild();
        }

        @JavascriptInterface
        public void cloudRequest(String requestId, String body) {
            if (requestId == null || requestId.length() > 80 || cloudSaves == null) return;
            cloudSaves.request(body, (status, response) -> {
                if (webView == null) return;
                String script = "window.onAbyssCloudResponse&&window.onAbyssCloudResponse("
                        + JSONObject.quote(requestId) + "," + status + "," + JSONObject.quote(response) + ");";
                webView.evaluateJavascript(script, null);
            });
        }
    }

    private final Runnable hideStatusAction = this::hideStatus;

    private void hideStatus() {
        if (updateStatus != null) updateStatus.setVisibility(View.GONE);
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private void configureFullscreen() {
        Window window = getWindow();
        window.setStatusBarColor(Color.BLACK);
        window.setNavigationBarColor(Color.BLACK);
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        applyImmersiveMode();
    }

    private void applyImmersiveMode() {
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (!waitingForInstallPermission) return;
        waitingForInstallPermission = false;
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O
                || getPackageManager().canRequestPackageInstalls()) {
            installDownloadedApk();
        } else if (pendingNativeUpdate != null) {
            showNativeUpdateFallback(pendingNativeUpdate, "尚未授予安装权限");
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) applyImmersiveMode();
    }

    private void configureBackNavigation() {
        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        }
    }

    private void handleBack() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else finishAfterTransition();
    }

    @SuppressLint("GestureBackNavigation")
    @Override
    public void onBackPressed() {
        handleBack();
    }

    @Override
    protected void onDestroy() {
        if (updater != null) updater.shutdown();
        if (cloudSaves != null) cloudSaves.shutdown();
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
