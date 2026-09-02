package com.exkalib.abyssalecho;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Handler;
import android.os.Looper;
import android.util.Base64;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

final class BundleUpdater {
    static final class UpdateInfo {
        final long build;
        final String version;
        final boolean nativeShell;
        final String apkUrl;
        final String bundleName;
        final String expectedHash;
        final long expectedSize;

        private UpdateInfo(long build, String version, boolean nativeShell, String apkUrl,
                           String bundleName, String expectedHash, long expectedSize) {
            this.build = build;
            this.version = version;
            this.nativeShell = nativeShell;
            this.apkUrl = apkUrl;
            this.bundleName = bundleName;
            this.expectedHash = expectedHash;
            this.expectedSize = expectedSize;
        }
    }

    interface Listener {
        void onStatus(String text);
        void onNoUpdate();
        void onUpdateAvailable(UpdateInfo update);
        void onProgress(int percent);
        void onReady(long build, String version);
        void onError(String message);
    }

    private static final String PREFS = "web_bundle";
    private static final String ACTIVE_BUILD = "active_build";
    private static final String PREVIOUS_BUILD = "previous_build";
    private static final int MAX_MANIFEST_BYTES = 64 * 1024;
    private static final long MAX_BUNDLE_BYTES = 30L * 1024L * 1024L;

    private final Context context;
    private final SharedPreferences prefs;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Handler main = new Handler(Looper.getMainLooper());

    BundleUpdater(Context context) {
        this.context = context.getApplicationContext();
        this.prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    File activeRoot() {
        long build = prefs.getLong(ACTIVE_BUILD, 0L);
        if (build <= BuildConfig.BUNDLED_BUILD) return null;
        File root = releaseDir(build);
        return isValidBundle(root) ? root : null;
    }

    long currentBuild() {
        return Math.max(BuildConfig.BUNDLED_BUILD, prefs.getLong(ACTIVE_BUILD, 0L));
    }

    void check(Listener listener) {
        executor.execute(() -> {
            try {
                post(() -> listener.onStatus("正在检查资源更新…"));
                byte[] manifestBytes = getBytes(BuildConfig.UPDATE_BASE_URL + "manifest.json", MAX_MANIFEST_BYTES);
                byte[] signatureText = getBytes(BuildConfig.UPDATE_BASE_URL + "manifest.sig", 8 * 1024);
                verifyManifest(manifestBytes, signatureText);

                JSONObject manifest = new JSONObject(new String(manifestBytes, StandardCharsets.UTF_8));
                if (manifest.getInt("schema") != 1) throw new IOException("不支持的更新清单格式");
                long build = manifest.getLong("build");
                String version = manifest.getString("version");
                int minShell = manifest.getInt("minShell");

                if (minShell > BuildConfig.SHELL_VERSION) {
                    String apkUrl = manifest.optString("apkUrl", BuildConfig.UPDATE_BASE_URL + "Abyssal-Echoes.apk");
                    if (!apkUrl.startsWith(BuildConfig.UPDATE_BASE_URL) || !apkUrl.endsWith(".apk")) {
                        throw new IOException("安装包地址无效");
                    }
                    UpdateInfo update = new UpdateInfo(build, version, true, apkUrl,
                            null, null, 0L);
                    post(() -> listener.onUpdateAvailable(update));
                    return;
                }
                if (build <= currentBuild()) {
                    post(listener::onNoUpdate);
                    return;
                }

                String bundleName = manifest.getString("bundle");
                if (!bundleName.matches("[A-Za-z0-9._-]+\\.zip")) throw new IOException("更新包名称无效");
                String expectedHash = manifest.getString("sha256").toLowerCase(Locale.ROOT);
                if (!expectedHash.matches("[0-9a-f]{64}")) throw new IOException("更新包校验值无效");
                long expectedSize = manifest.getLong("size");
                if (expectedSize <= 0 || expectedSize > MAX_BUNDLE_BYTES) throw new IOException("更新包大小异常");
                UpdateInfo update = new UpdateInfo(build, version, false, null,
                        bundleName, expectedHash, expectedSize);
                post(() -> listener.onUpdateAvailable(update));
            } catch (Exception error) {
                post(() -> listener.onError(error.getMessage() == null ? "更新检查失败" : error.getMessage()));
            }
        });
    }

    void downloadAndInstall(UpdateInfo update, Listener listener) {
        if (update == null || update.nativeShell || update.bundleName == null) {
            post(() -> listener.onError("更新信息无效"));
            return;
        }
        executor.execute(() -> {
            File zip = new File(context.getCacheDir(), "web-update-" + update.build + ".zip");
            try {
                post(() -> listener.onStatus("正在下载 " + update.version + "…"));
                String actualHash = download(BuildConfig.UPDATE_BASE_URL + update.bundleName,
                        zip, update.expectedSize, listener);
                if (!actualHash.equals(update.expectedHash)) throw new IOException("更新包校验失败");
                post(() -> listener.onStatus("正在安装资源更新…"));
                install(zip, update.build);
                post(() -> listener.onReady(update.build, update.version));
            } catch (Exception error) {
                post(() -> listener.onError(error.getMessage() == null ? "更新下载失败" : error.getMessage()));
            } finally {
                //noinspection ResultOfMethodCallIgnored
                zip.delete();
            }
        });
    }

    boolean rollback() {
        long previous = prefs.getLong(PREVIOUS_BUILD, 0L);
        if (previous > 0L && isValidBundle(releaseDir(previous))) {
            prefs.edit().putLong(ACTIVE_BUILD, previous).remove(PREVIOUS_BUILD).apply();
            return true;
        }
        if (prefs.getLong(ACTIVE_BUILD, 0L) > 0L) {
            prefs.edit().putLong(ACTIVE_BUILD, 0L).remove(PREVIOUS_BUILD).apply();
            return true;
        }
        return false;
    }

    void shutdown() {
        executor.shutdownNow();
    }

    private void install(File zip, long build) throws Exception {
        File releases = new File(context.getFilesDir(), "web/releases");
        if (!releases.exists() && !releases.mkdirs()) throw new IOException("无法创建更新目录");
        File target = releaseDir(build);
        if (!isValidBundle(target)) {
            File staging = new File(releases, "." + build + ".staging");
            deleteTree(staging);
            if (!staging.mkdirs()) throw new IOException("无法创建更新临时目录");
            unzip(zip, staging);
            if (!isValidBundle(staging)) throw new IOException("更新包缺少必要文件");
            deleteTree(target);
            if (!staging.renameTo(target)) throw new IOException("无法启用新资源");
        }

        long active = prefs.getLong(ACTIVE_BUILD, 0L);
        SharedPreferences.Editor editor = prefs.edit().putLong(ACTIVE_BUILD, build);
        if (active > 0L && active != build) editor.putLong(PREVIOUS_BUILD, active);
        else editor.remove(PREVIOUS_BUILD);
        editor.apply();
        cleanupOldReleases(build, active);
    }

    private void cleanupOldReleases(long active, long previous) {
        File[] dirs = new File(context.getFilesDir(), "web/releases").listFiles();
        if (dirs == null) return;
        for (File dir : dirs) {
            long build;
            try { build = Long.parseLong(dir.getName()); }
            catch (NumberFormatException ignored) { continue; }
            if (build != active && build != previous) deleteTree(dir);
        }
    }

    private File releaseDir(long build) {
        return new File(context.getFilesDir(), "web/releases/" + build);
    }

    private static boolean isValidBundle(File root) {
        return root != null && new File(root, "index.html").isFile()
                && new File(root, "style.css").isFile() && new File(root, "game.js").isFile();
    }

    private static void unzip(File zip, File output) throws IOException {
        String root = output.getCanonicalPath() + File.separator;
        try (ZipInputStream input = new ZipInputStream(new FileInputStream(zip))) {
            ZipEntry entry;
            byte[] buffer = new byte[16 * 1024];
            long written = 0L;
            while ((entry = input.getNextEntry()) != null) {
                File destination = new File(output, entry.getName());
                String canonical = destination.getCanonicalPath();
                if (!canonical.startsWith(root)) throw new IOException("更新包路径非法");
                if (entry.isDirectory()) {
                    if (!destination.exists() && !destination.mkdirs()) throw new IOException("无法创建资源目录");
                    continue;
                }
                File parent = destination.getParentFile();
                if (parent != null && !parent.exists() && !parent.mkdirs()) throw new IOException("无法创建资源目录");
                try (FileOutputStream out = new FileOutputStream(destination)) {
                    int count;
                    while ((count = input.read(buffer)) != -1) {
                        written += count;
                        if (written > MAX_BUNDLE_BYTES) throw new IOException("解压后资源过大");
                        out.write(buffer, 0, count);
                    }
                }
            }
        }
    }

    private static void deleteTree(File file) {
        if (file == null || !file.exists()) return;
        File[] children = file.listFiles();
        if (children != null) for (File child : children) deleteTree(child);
        //noinspection ResultOfMethodCallIgnored
        file.delete();
    }

    private static void verifyManifest(byte[] manifest, byte[] signatureText) throws Exception {
        byte[] encodedKey = Base64.decode(BuildConfig.UPDATE_PUBLIC_KEY, Base64.DEFAULT);
        PublicKey key = KeyFactory.getInstance("EC").generatePublic(new X509EncodedKeySpec(encodedKey));
        Signature verifier = Signature.getInstance("SHA256withECDSA");
        verifier.initVerify(key);
        verifier.update(manifest);
        byte[] signature = Base64.decode(new String(signatureText, StandardCharsets.US_ASCII).trim(), Base64.DEFAULT);
        if (!verifier.verify(signature)) throw new IOException("更新清单签名无效");
    }

    private static byte[] getBytes(String address, int limit) throws IOException {
        HttpURLConnection connection = open(address);
        try {
            int status = connection.getResponseCode();
            if (status != HttpURLConnection.HTTP_OK) throw new IOException("更新服务器返回 " + status);
            try (InputStream input = connection.getInputStream(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[8192];
                int count;
                while ((count = input.read(buffer)) != -1) {
                    if (output.size() + count > limit) throw new IOException("更新响应过大");
                    output.write(buffer, 0, count);
                }
                return output.toByteArray();
            }
        } finally {
            connection.disconnect();
        }
    }

    private String download(String address, File destination, long expectedSize, Listener listener) throws Exception {
        HttpURLConnection connection = open(address);
        try {
            int status = connection.getResponseCode();
            if (status != HttpURLConnection.HTTP_OK) throw new IOException("更新包下载失败：" + status);
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            long total = 0L;
            int reported = -1;
            try (InputStream input = connection.getInputStream(); FileOutputStream output = new FileOutputStream(destination)) {
                byte[] buffer = new byte[16 * 1024];
                int count;
                while ((count = input.read(buffer)) != -1) {
                    total += count;
                    if (total > MAX_BUNDLE_BYTES) throw new IOException("更新包超过大小限制");
                    digest.update(buffer, 0, count);
                    output.write(buffer, 0, count);
                    int percent = (int) Math.min(100L, total * 100L / expectedSize);
                    if (percent >= reported + 2 || percent == 100) {
                        reported = percent;
                        int progress = percent;
                        post(() -> listener.onProgress(progress));
                    }
                }
            }
            if (total != expectedSize) throw new IOException("更新包下载不完整");
            return hex(digest.digest());
        } finally {
            connection.disconnect();
        }
    }

    private static HttpURLConnection open(String address) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(address).openConnection();
        connection.setConnectTimeout(6000);
        connection.setReadTimeout(15000);
        connection.setInstanceFollowRedirects(true);
        connection.setUseCaches(false);
        connection.setRequestProperty("Cache-Control", "no-cache");
        connection.setRequestProperty("Accept", "application/json, application/octet-stream, */*");
        connection.setRequestProperty("User-Agent", "AbyssalEchoes-Android/" + BuildConfig.VERSION_NAME);
        return connection;
    }

    private static String hex(byte[] bytes) {
        StringBuilder result = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) result.append(String.format(Locale.ROOT, "%02x", value & 0xff));
        return result.toString();
    }

    private void post(Runnable action) {
        main.post(action);
    }
}
