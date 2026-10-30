package com.besaweb.tiranabus;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

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
        if (!HOST.equals(u.getHost()) || !"GET".equals(r.getMethod())) return null;
        String p = u.getPath();
        if (p == null || p.equals("/")) p = "/index.html";
        p = p.substring(1);
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

  InputStream feed() {
    try {
      HttpURLConnection c = (HttpURLConnection) new URL(FEED).openConnection();
      c.setConnectTimeout(4000);
      c.setReadTimeout(8000);
      if (c.getResponseCode() == 200) return c.getInputStream();
    } catch (Exception e) {}
    return null;
  }

  @Override
  public void onBackPressed() {
    if (web.canGoBack()) web.goBack(); else super.onBackPressed();
  }
}
