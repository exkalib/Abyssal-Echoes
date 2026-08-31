package com.exkalib.abyssalecho;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.Locale;

final class LocalContentWebViewClient extends WebViewClient {
    interface FatalErrorListener {
        void onMainPageError();
    }

    static final String ORIGIN = "https://appassets.androidplatform.net";
    static final String HOME = ORIGIN + "/index.html";

    private final Context context;
    private final BundleUpdater updater;
    private final FatalErrorListener fatalErrorListener;

    LocalContentWebViewClient(Context context, BundleUpdater updater, FatalErrorListener listener) {
        this.context = context.getApplicationContext();
        this.updater = updater;
        this.fatalErrorListener = listener;
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        Uri uri = request.getUrl();
        if (!"appassets.androidplatform.net".equals(uri.getHost())) return null;
        return localResponse(uri.getPath());
    }

    private WebResourceResponse localResponse(String rawPath) {
        String path = rawPath == null ? "index.html" : Uri.decode(rawPath).replaceFirst("^/+", "");
        if (path.isEmpty()) path = "index.html";
        if (path.contains("..") || path.contains("\\")) return forbidden();
        try {
            InputStream input = null;
            File root = updater.activeRoot();
            if (root != null) {
                File file = new File(root, path);
                String rootPath = root.getCanonicalPath() + File.separator;
                if (file.getCanonicalPath().startsWith(rootPath) && file.isFile()) input = new FileInputStream(file);
            }
            if (input == null) input = context.getAssets().open("web/" + path);
            return new WebResourceResponse(mime(path), "UTF-8", 200, "OK",
                    Collections.singletonMap("Cache-Control", "no-store"), input);
        } catch (IOException ignored) {
            return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", null,
                    new java.io.ByteArrayInputStream(new byte[0]));
        }
    }

    private static WebResourceResponse forbidden() {
        return new WebResourceResponse("text/plain", "UTF-8", 403, "Forbidden", null,
                new java.io.ByteArrayInputStream(new byte[0]));
    }

    private static String mime(String path) {
        String lower = path.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".html")) return "text/html";
        if (lower.endsWith(".css")) return "text/css";
        if (lower.endsWith(".js")) return "application/javascript";
        if (lower.endsWith(".json")) return "application/json";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".woff2")) return "font/woff2";
        return "application/octet-stream";
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        Uri uri = request.getUrl();
        if ("appassets.androidplatform.net".equals(uri.getHost())) return false;
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        } catch (Exception ignored) { }
        return true;
    }

    @Override
    public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
        super.onReceivedError(view, request, error);
        if (request.isForMainFrame()) fatalErrorListener.onMainPageError();
    }
}
