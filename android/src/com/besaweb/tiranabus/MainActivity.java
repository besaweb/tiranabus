package com.besaweb.tiranabus;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.GZIPInputStream;

public class MainActivity extends Activity {
  static final String HOST = "appassets.androidplatform.net";
  static final String FEED = "https://besaweb.github.io/tiranabus/gtfs.zip";
  static final Map<String, String> MIME = new HashMap<>();
  static {
    MIME.put("html", "text/html");
    MIME.put("js", "text/javascript");
    MIME.put("css", "text/css");
    MIME.put("png", "image/png");
    MIME.put("svg", "image/svg+xml");
    MIME.put("webp", "image/webp");
    MIME.put("json", "application/json");
    MIME.put("zip", "application/zip");
  }

  WebView web;
  SQLiteDatabase tiles;

  @Override
  protected void onCreate(Bundle b) {
    super.onCreate(b);
    web = new WebView(this);
    setContentView(web);
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setAllowFileAccess(false);
    web.setWebViewClient(new WebViewClient() {
      @Override
      public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
        Uri u = r.getUrl();
        if (!"GET".equals(r.getMethod())) return null;
        if (!HOST.equals(u.getHost())) return external(u);
        String p = u.getPath();
        if (p == null || p.equals("/")) p = "/index.html";
        p = p.substring(1);
        if (p.startsWith("vt/")) return tile(p);
        try {
          InputStream in = p.equals("gtfs.zip") ? feed() : null;
          if (in == null) in = getAssets().open(p);
          String ext = p.substring(p.lastIndexOf('.') + 1);
          String mime = MIME.containsKey(ext) ? MIME.get(ext) : "application/octet-stream";
          return new WebResourceResponse(mime, "utf-8", in);
        } catch (Exception e) {
          return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", new HashMap<String, String>(), null);
        }
      }

      @Override
      public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
        if (HOST.equals(r.getUrl().getHost())) return false;
        try { startActivity(new Intent(Intent.ACTION_VIEW, r.getUrl())); } catch (Exception e) {}
        return true;
      }
    });
    web.loadUrl("https://" + HOST + "/index.html");
  }

  SQLiteDatabase db() {
    if (tiles != null) return tiles;
    try {
      File f = new File(getFilesDir(), "tirana.mbtiles");
      InputStream in = getAssets().open("map/tirana.mbtiles");
      if (!f.exists() || f.length() != in.available()) {
        FileOutputStream o = new FileOutputStream(f);
        byte[] buf = new byte[65536];
        int n;
        while ((n = in.read(buf)) > 0) o.write(buf, 0, n);
        o.close();
      }
      in.close();
      tiles = SQLiteDatabase.openDatabase(f.getPath(), null, SQLiteDatabase.OPEN_READONLY);
    } catch (Exception e) {}
    return tiles;
  }

  WebResourceResponse tile(String p) {
    Map<String, String> hd = new HashMap<>();
    hd.put("Access-Control-Allow-Origin", "*");
    try {
      String[] a = p.substring(3, p.lastIndexOf('.')).split("/");
      int z = Integer.parseInt(a[0]), x = Integer.parseInt(a[1]), y = Integer.parseInt(a[2]);
      SQLiteDatabase d;
      synchronized (this) { d = db(); }
      Cursor c = d.rawQuery("SELECT tile_data FROM tiles WHERE zoom_level=? AND tile_column=? AND tile_row=?",
        new String[] { "" + z, "" + x, "" + ((1 << z) - 1 - y) });
      byte[] b = null;
      if (c.moveToFirst()) b = c.getBlob(0);
      c.close();
      if (b == null) return new WebResourceResponse("application/x-protobuf", null, 404, "Not Found", hd, new ByteArrayInputStream(new byte[0]));
      InputStream in = new ByteArrayInputStream(b);
      if (b.length > 2 && (b[0] & 0xff) == 0x1f && (b[1] & 0xff) == 0x8b) in = new GZIPInputStream(in);
      return new WebResourceResponse("application/x-protobuf", null, 200, "OK", hd, in);
    } catch (Exception e) {
      return new WebResourceResponse("application/x-protobuf", null, 404, "Not Found", hd, new ByteArrayInputStream(new byte[0]));
    }
  }

  byte[] download(String url, int ct, int rt) {
    try {
      HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
      c.setConnectTimeout(ct);
      c.setReadTimeout(rt);
      c.setRequestProperty("User-Agent", "TiranaBus-Android");
      if (c.getResponseCode() != 200) return null;
      InputStream in = c.getInputStream();
      ByteArrayOutputStream o = new ByteArrayOutputStream();
      byte[] buf = new byte[16384];
      int n;
      while ((n = in.read(buf)) > 0) o.write(buf, 0, n);
      in.close();
      return o.toByteArray();
    } catch (Exception e) {
      return null;
    }
  }

  void save(File f, byte[] d) {
    try {
      File t = new File(f.getPath() + ".tmp");
      FileOutputStream o = new FileOutputStream(t);
      o.write(d);
      o.close();
      f.getParentFile().mkdirs();
      if (!t.renameTo(f)) { f.delete(); t.renameTo(f); }
    } catch (Exception e) {}
  }

  InputStream feed() {
    File f = new File(getFilesDir(), "gtfs.zip");
    byte[] d = download(FEED, 4000, 15000);
    if (d != null && d.length > 1000 && d[0] == 'P' && d[1] == 'K') {
      save(f, d);
      return new ByteArrayInputStream(d);
    }
    try { if (f.exists()) return new FileInputStream(f); } catch (Exception e) {}
    return null;
  }

  WebResourceResponse external(Uri u) {
    String url = u.toString();
    if (!url.startsWith("https://")) return null;
    File f = new File(new File(getCacheDir(), "ext"), Integer.toHexString(url.hashCode()) + "_" + url.length());
    String h = u.getHost();
    String mime = h.contains("googleapis") ? "text/css" : h.contains("gstatic") ? "font/woff2" : url.contains("opentopomap") || url.contains("openstreetmap") || url.contains("arcgisonline") ? "image/png" : null;
    if (mime == null) return null;
    try {
      byte[] d = null;
      if (f.exists()) {
        FileInputStream in = new FileInputStream(f);
        d = new byte[(int) f.length()];
        int o = 0, n;
        while (o < d.length && (n = in.read(d, o, d.length - o)) > 0) o += n;
        in.close();
      } else {
        d = download(url, 5000, 8000);
        if (d != null) save(f, d);
      }
      if (d == null) return null;
      Map<String, String> hd = new HashMap<>();
      hd.put("Access-Control-Allow-Origin", "*");
      return new WebResourceResponse(mime, "utf-8", 200, "OK", hd, new ByteArrayInputStream(d));
    } catch (Exception e) {
      return null;
    }
  }

  @Override
  public void onBackPressed() {
    if (web.canGoBack()) web.goBack(); else super.onBackPressed();
  }
}
