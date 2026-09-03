package com.exkalib.abyssalecho;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;

import java.io.File;
import java.io.FileNotFoundException;

public final class UpdateFileProvider extends ContentProvider {
    static final String FILE_NAME = "Abyssal-Echoes-update.apk";
    private static final String MIME_APK = "application/vnd.android.package-archive";

    static Uri contentUri(String packageName) {
        return new Uri.Builder()
                .scheme("content")
                .authority(packageName + ".updates")
                .appendPath(FILE_NAME)
                .build();
    }

    @Override
    public boolean onCreate() {
        return true;
    }

    @Override
    public String getType(Uri uri) {
        return MIME_APK;
    }

    @Override
    public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
        if (!"r".equals(mode) || !('/' + FILE_NAME).equals(uri.getPath()) || getContext() == null) {
            throw new FileNotFoundException("Unknown update file");
        }
        File apk = new File(getContext().getCacheDir(), FILE_NAME);
        if (!apk.isFile()) throw new FileNotFoundException("Update file is missing");
        return ParcelFileDescriptor.open(apk, ParcelFileDescriptor.MODE_READ_ONLY);
    }

    @Override
    public Cursor query(Uri uri, String[] projection, String selection,
                        String[] selectionArgs, String sortOrder) {
        String[] columns = projection == null
                ? new String[]{OpenableColumns.DISPLAY_NAME, OpenableColumns.SIZE}
                : projection;
        MatrixCursor cursor = new MatrixCursor(columns, 1);
        MatrixCursor.RowBuilder row = cursor.newRow();
        File apk = getContext() == null ? null : new File(getContext().getCacheDir(), FILE_NAME);
        for (String column : columns) {
            if (OpenableColumns.DISPLAY_NAME.equals(column)) row.add(FILE_NAME);
            else if (OpenableColumns.SIZE.equals(column)) row.add(apk != null && apk.isFile() ? apk.length() : 0L);
            else row.add(null);
        }
        return cursor;
    }

    @Override
    public Uri insert(Uri uri, ContentValues values) {
        throw new UnsupportedOperationException("Read only");
    }

    @Override
    public int delete(Uri uri, String selection, String[] selectionArgs) {
        return 0;
    }

    @Override
    public int update(Uri uri, ContentValues values, String selection, String[] selectionArgs) {
        return 0;
    }
}
