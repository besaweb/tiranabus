package com.besaweb.tiranabus;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.AssetFileDescriptor;
import android.content.res.Configuration;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.View;
import android.view.WindowInsets;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.window.OnBackInvokedCallback;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.window.OnBackInvokedDispatcher;
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
  long tilesFailed;
  GeolocationPermissions.Callback geoCb;
  String geoOrigin;
  DiskCache ext;
  Ads ads;

  @Override
  protected void onCreate(Bundle b) {
    super.onCreate(b);
    ext = new DiskCache(new File(getCacheDir(), "ext"), 100L << 20, 30L * 86400000L);
    new Thread(new Runnable() {
      @Override
      public void run() {
        ext.trim();
      }
    }).start();
    web = new WebView(this);
    LinearLayout root = new LinearLayout(this);
    root.setOrientation(LinearLayout.VERTICAL);
    root.addView(web, new LinearLayout.LayoutParams(-1, 0, 1));
    FrameLayout adBox = new FrameLayout(this);
    adBox.setVisibility(View.GONE);
    root.addView(adBox, new LinearLayout.LayoutParams(-1, -2));
    setContentView(root);
    ads = new Ads(this, web, adBox);
    root.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
      @Override
      public WindowInsets onApplyWindowInsets(View v, WindowInsets in) {
        if (Build.VERSION.SDK_INT >= 30) {
          android.graphics.Insets i = in.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
          v.setPadding(i.left, i.top, i.right, i.bottom);
          ads.keyboard(in.isVisible(WindowInsets.Type.ime()));
          return WindowInsets.CONSUMED;
        }
        v.setPadding(in.getSystemWindowInsetLeft(), in.getSystemWindowInsetTop(), in.getSystemWindowInsetRight(), in.getSystemWindowInsetBottom());
        ads.keyboard(in.getSystemWindowInsetBottom() > v.getHeight() / 4);
        return in.consumeSystemWindowInsets();
      }
    });
    if (Build.VERSION.SDK_INT >= 33) {
      getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, new OnBackInvokedCallback() {
        @Override
        public void onBackInvoked() {
          if (web.canGoBack()) web.goBack(); else finish();
        }
      });
    }
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setAllowFileAccess(false);
    s.setGeolocationEnabled(true);
    web.setWebChromeClient(new WebChromeClient() {
      @Override
      public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback cb) {
        if (!HOST.equals(Uri.parse(origin).getHost())) { cb.invoke(origin, false, false); return; }
        if (hasGeo()) { geoAllow(origin, cb); return; }
        geoOrigin = origin;
        geoCb = cb;
        requestPermissions(new String[] { Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION }, 7);
      }
    });
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
        if ("tbapp".equals(r.getUrl().getScheme())) {
          String h = r.getUrl().getHost();
          Intent i = "location".equals(h) ? new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
            : new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.fromParts("package", getPackageName(), null));
          try { startActivity(i); } catch (Exception e) {}
          return true;
        }
        try { startActivity(new Intent(Intent.ACTION_VIEW, r.getUrl())); } catch (Exception e) {}
        return true;
      }
    });
    web.addJavascriptInterface(ads, "TBAds");
    web.loadUrl("https://" + HOST + "/index.html");
  }

  @Override
  protected void onPause() {
    ads.pause();
    super.onPause();
  }

  @Override
  protected void onResume() {
    super.onResume();
    ads.resume();
  }

  @Override
  protected void onDestroy() {
    ads.drop();
    super.onDestroy();
  }

  @Override
  public void onConfigurationChanged(Configuration c) {
    super.onConfigurationChanged(c);
    ads.resize();
  }

  boolean hasGeo() {
    return checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
      || checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
  }

  @SuppressWarnings("deprecation")
  boolean geoOn() {
    LocationManager lm = (LocationManager) getSystemService(LOCATION_SERVICE);
    if (lm == null) return true;
    if (Build.VERSION.SDK_INT >= 28) return lm.isLocationEnabled();
    return lm.isProviderEnabled(LocationManager.GPS_PROVIDER) || lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
  }

  void geoState(String st) {
    web.evaluateJavascript("window.tbGeo='" + st + "'", null);
  }

  void geoAllow(String origin, GeolocationPermissions.Callback cb) {
    boolean on = geoOn();
    geoState(on ? "ok" : "off");
    cb.invoke(origin, on, false);
  }

  @Override
  public void onRequestPermissionsResult(int code, String[] perms, int[] res) {
    if (code != 7 || geoCb == null) return;
    GeolocationPermissions.Callback cb = geoCb;
    geoCb = null;
    if (hasGeo()) { geoAllow(geoOrigin, cb); return; }
    boolean ask = shouldShowRequestPermissionRationale(Manifest.permission.ACCESS_FINE_LOCATION)
      || shouldShowRequestPermissionRationale(Manifest.permission.ACCESS_COARSE_LOCATION);
    geoState(ask || res.length == 0 ? "denied" : "blocked");
    cb.invoke(geoOrigin, false, false);
  }

  @SuppressWarnings("deprecation")
  String mapVersion() throws Exception {
    long len = -1;
    try {
      AssetFileDescriptor fd = getAssets().openFd("map/tirana.mbtiles");
      len = fd.getLength();
      fd.close();
    } catch (Exception e) {}
    return getPackageManager().getPackageInfo(getPackageName(), 0).versionCode + ":" + len;
  }

  String read(File f) {
    try {
      FileInputStream in = new FileInputStream(f);
      try {
        byte[] d = new byte[(int) f.length()];
        int o = 0, n;
        while (o < d.length && (n = in.read(d, o, d.length - o)) > 0) o += n;
        return new String(d, 0, o, "UTF-8");
      } finally {
        in.close();
      }
    } catch (Exception e) {
      return "";
    }
  }

  void copyMap(File f, File v, String ver) throws Exception {
    File t = new File(f.getPath() + ".tmp");
    InputStream in = getAssets().open("map/tirana.mbtiles");
    try {
      FileOutputStream o = new FileOutputStream(t);
      try {
        byte[] buf = new byte[65536];
        int n;
        while ((n = in.read(buf)) > 0) o.write(buf, 0, n);
        o.getFD().sync();
      } finally {
        o.close();
      }
      f.delete();
      if (!t.renameTo(f)) throw new Exception("rename");
      FileOutputStream m = new FileOutputStream(v);
      m.write(ver.getBytes("UTF-8"));
      m.close();
    } catch (Exception e) {
      t.delete();
      throw e;
    } finally {
      in.close();
    }
  }

  SQLiteDatabase db() {
    if (tiles != null) return tiles;
    if (System.currentTimeMillis() - tilesFailed < 60000) return null;
    File f = new File(getFilesDir(), "tirana.mbtiles"), v = new File(getFilesDir(), "tirana.mbtiles.ver");
    try {
      String want = mapVersion();
      for (int i = 0; i < 2 && tiles == null; i++) {
        try {
          if (!f.exists() || !want.equals(read(v))) copyMap(f, v, want);
          SQLiteDatabase d = SQLiteDatabase.openDatabase(f.getPath(), null, SQLiteDatabase.OPEN_READONLY);
          Cursor c = d.rawQuery("SELECT 1 FROM tiles LIMIT 1", null);
          boolean ok = c.moveToFirst();
          c.close();
          if (!ok) {
            d.close();
            throw new Exception("empty");
          }
          tiles = d;
        } catch (Exception e) {
          f.delete();
          v.delete();
        }
      }
    } catch (Exception e) {}
    if (tiles == null) tilesFailed = System.currentTimeMillis();
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
      try {
        if (c.moveToFirst()) b = c.getBlob(0);
      } finally {
        c.close();
      }
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
    String h = u.getHost();
    String mime = h.contains("googleapis") ? "text/css" : h.contains("gstatic") ? "font/woff2" : url.contains("opentopomap") || url.contains("openstreetmap") || url.contains("arcgisonline") ? "image/png" : null;
    if (mime == null) return null;
    try {
      byte[] d = ext.get(url, false);
      if (d == null) {
        d = download(url, 5000, 8000);
        if (d != null) ext.put(url, d); else d = ext.get(url, true);
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
