package com.exkalib.abyssalecho;

import android.os.Handler;
import android.os.Looper;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

final class CloudSaveClient {
    interface Callback {
        void onComplete(int status, String response);
    }

    private static final int MAX_BODY_BYTES = 2 * 1024 * 1024;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Handler main = new Handler(Looper.getMainLooper());

    void request(String body, Callback callback) {
        byte[] request = body == null ? new byte[0] : body.getBytes(StandardCharsets.UTF_8);
        if (request.length == 0 || request.length > MAX_BODY_BYTES) {
            main.post(() -> callback.onComplete(0, errorJson("云存档请求大小异常")));
            return;
        }
        executor.execute(() -> {
            HttpURLConnection connection = null;
            try {
                connection = (HttpURLConnection) new URL(BuildConfig.CLOUD_SAVE_URL).openConnection();
                connection.setConnectTimeout(6000);
                connection.setReadTimeout(15000);
                connection.setUseCaches(false);
                connection.setRequestMethod("POST");
                connection.setDoOutput(true);
                connection.setFixedLengthStreamingMode(request.length);
                connection.setRequestProperty("Content-Type", "application/json; charset=utf-8");
                connection.setRequestProperty("Accept", "application/json");
                connection.setRequestProperty("User-Agent", "AbyssalEchoes-Android/" + BuildConfig.VERSION_NAME);
                try (OutputStream output = connection.getOutputStream()) {
                    output.write(request);
                }
                int status = connection.getResponseCode();
                InputStream input = status >= 400 ? connection.getErrorStream() : connection.getInputStream();
                String response = read(input);
                main.post(() -> callback.onComplete(status, response));
            } catch (Exception error) {
                String response = errorJson(error.getMessage() == null ? "无法连接云存档服务器" : error.getMessage());
                main.post(() -> callback.onComplete(0, response));
            } finally {
                if (connection != null) connection.disconnect();
            }
        });
    }

    void shutdown() {
        executor.shutdownNow();
    }

    private static String read(InputStream input) throws IOException {
        if (input == null) return errorJson("云存档服务器没有返回内容");
        try (InputStream source = input; ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            byte[] buffer = new byte[8192];
            int count;
            while ((count = source.read(buffer)) != -1) {
                if (output.size() + count > MAX_BODY_BYTES) throw new IOException("云存档响应超过大小限制");
                output.write(buffer, 0, count);
            }
            return new String(output.toByteArray(), StandardCharsets.UTF_8);
        }
    }

    private static String errorJson(String message) {
        return "{\"ok\":false,\"error\":\"network_error\",\"message\":"
                + JSONObject.quote(message) + "}";
    }
}
