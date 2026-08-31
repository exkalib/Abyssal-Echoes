package com.exkalib.abyssalecho;

import android.app.Activity;
import android.app.AlertDialog;
import android.annotation.SuppressLint;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Build;
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

public final class MainActivity extends Activity {
    private WebView webView;
    private TextView updateStatus;
    private BundleUpdater updater;
    private boolean rollbackAttempted;
    private boolean updateCheckRunning;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureFullscreen();
        updater = new BundleUpdater(this);
        buildUi();
        configureWebView();
        configureBackNavigation();
        loadGame();
        checkForUpdates();
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
        webView.setWebViewClient(new LocalContentWebViewClient(this, updater, this::handleMainPageError));
    }

    private void checkForUpdates() {
        if (updateCheckRunning) {
            showStatus("正在检查资源更新…", 0L);
            return;
        }
        updateCheckRunning = true;
        updater.check(new BundleUpdater.Listener() {
            @Override public void onStatus(String text) { showStatus(text, 0L); }
            @Override public void onNoUpdate() {
                updateCheckRunning = false;
                showStatus("资源已是最新版本", 900L);
            }
            @Override public void onReady(long build, String version) {
                updateCheckRunning = false;
                rollbackAttempted = false;
                showStatus("已更新至 " + version, 1300L);
                webView.clearCache(true);
                loadGame();
            }
            @Override public void onNativeUpdate(String apkUrl, String version) {
                updateCheckRunning = false;
                notifyWebUpdateStatus("发现安卓外壳更新 " + version, true);
                hideStatus();
                showNativeUpdateDialog(apkUrl, version);
            }
            @Override public void onError(String message) {
                updateCheckRunning = false;
                showStatus("离线运行 · " + message, 1600L);
            }
        });
    }

    private void handleMainPageError() {
        if (!rollbackAttempted && updater.rollback()) {
            rollbackAttempted = true;
            showStatus("新资源加载失败，已恢复上一版本", 1800L);
            loadGame();
        }
    }

    private void loadGame() {
        webView.loadUrl(LocalContentWebViewClient.HOME);
    }

    private void showNativeUpdateDialog(String apkUrl, String version) {
        new AlertDialog.Builder(this)
                .setTitle("需要更新应用外壳")
                .setMessage("版本 " + version + " 包含安卓底层变更，需要下载一次新的安装包。游戏存档会保留。")
                .setNegativeButton("稍后", null)
                .setPositiveButton("下载更新", (dialog, which) -> {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl))); }
                    catch (Exception ignored) { showStatus("无法打开下载地址", 1800L); }
                })
                .show();
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
        if (webView != null) {
            webView.stopLoading();
            webView.destroy();
        }
        super.onDestroy();
    }
}
