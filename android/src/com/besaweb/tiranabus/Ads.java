package com.besaweb.tiranabus;

import android.app.Activity;
import android.net.Uri;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.FrameLayout;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.ump.ConsentDebugSettings;
import com.google.android.ump.ConsentInformation;
import com.google.android.ump.ConsentRequestParameters;
import com.google.android.ump.UserMessagingPlatform;

final class Ads {
  static final long RETRY = 60000;

  final Activity act;
  final WebView web;
  final FrameLayout box;
  final ConsentInformation ci;
  boolean want, kbd, sdk, asking, loaded;
  long tried, failed;
  volatile boolean privacy;
  AdView view;

  Ads(Activity a, WebView w, FrameLayout b) {
    act = a;
    web = w;
    box = b;
    ci = UserMessagingPlatform.getConsentInformation(a);
  }

  boolean trusted() {
    String u = web.getUrl();
    return u != null && MainActivity.HOST.equals(Uri.parse(u).getHost());
  }

  @JavascriptInterface
  public void set(final boolean on) {
    act.runOnUiThread(() -> { if (trusted()) apply(on); });
  }

  @JavascriptInterface
  public boolean privacy() {
    return privacy;
  }

  @JavascriptInterface
  public void options() {
    act.runOnUiThread(() -> { if (trusted()) UserMessagingPlatform.showPrivacyOptionsForm(act, e -> sync()); });
  }

  void apply(boolean on) {
    want = on && BuildConfig.ADS;
    if (!want) { drop(); return; }
    if (view != null) { show(); return; }
    if (ci.canRequestAds() && tried > 0) load(); else consent();
  }

  void consent() {
    long now = System.currentTimeMillis();
    if (asking || now - tried < RETRY) return;
    asking = true;
    tried = now;
    ConsentRequestParameters.Builder p = new ConsentRequestParameters.Builder();
    if (BuildConfig.ADS_EEA) p.setConsentDebugSettings(new ConsentDebugSettings.Builder(act).setDebugGeography(ConsentDebugSettings.DebugGeography.DEBUG_GEOGRAPHY_EEA).build());
    ci.requestConsentInfoUpdate(act, p.build(),
      () -> UserMessagingPlatform.loadAndShowConsentFormIfRequired(act, e -> done()),
      e -> done());
  }

  void done() {
    asking = false;
    sync();
    if (want && ci.canRequestAds()) load();
  }

  void sync() {
    privacy = ci.getPrivacyOptionsRequirementStatus() == ConsentInformation.PrivacyOptionsRequirementStatus.REQUIRED;
    web.evaluateJavascript("window.tbAdsPrivacy&&window.tbAdsPrivacy()", null);
    if (!ci.canRequestAds()) drop();
  }

  void load() {
    if (view != null || !want || System.currentTimeMillis() - failed < RETRY) return;
    if (!sdk) {
      sdk = true;
      new Thread(() -> MobileAds.initialize(act, s -> {})).start();
    }
    View p = (View) box.getParent();
    float d = act.getResources().getDisplayMetrics().density;
    int w = p.getWidth() - p.getPaddingLeft() - p.getPaddingRight();
    if (w <= 0) w = act.getResources().getDisplayMetrics().widthPixels;
    final AdView v = new AdView(act);
    v.setAdUnitId(BuildConfig.ADS_BANNER);
    v.setAdSize(AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(act, (int) (w / d)));
    v.setAdListener(new AdListener() {
      @Override
      public void onAdLoaded() {
        if (view != v) return;
        loaded = true;
        show();
      }

      @Override
      public void onAdFailedToLoad(LoadAdError e) {
        if (view != v) return;
        failed = System.currentTimeMillis();
        drop();
      }
    });
    view = v;
    box.addView(v, new FrameLayout.LayoutParams(-1, -2));
    v.loadAd(new AdRequest.Builder().build());
  }

  void show() {
    box.setVisibility(want && loaded && !kbd && view != null ? View.VISIBLE : View.GONE);
  }

  void drop() {
    loaded = false;
    if (view != null) {
      box.removeAllViews();
      view.destroy();
      view = null;
    }
    show();
  }

  void keyboard(boolean on) {
    if (kbd == on) return;
    kbd = on;
    show();
  }

  void resize() {
    if (view == null) return;
    drop();
    box.post(this::load);
  }

  void pause() {
    if (view != null) view.pause();
  }

  void resume() {
    if (view != null) view.resume();
  }
}
