package com.besaweb.tiranabus;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Comparator;

final class DiskCache {
  static final int TRIM_EVERY = 50;

  final File dir;
  final long max, ttl;
  int puts;

  DiskCache(File dir, long max, long ttl) {
    this.dir = dir;
    this.max = max;
    this.ttl = ttl;
  }

  static String key(String url) {
    try {
      byte[] h = MessageDigest.getInstance("SHA-256").digest(url.getBytes("UTF-8"));
      StringBuilder s = new StringBuilder();
      for (int i = 0; i < 16; i++) s.append(String.format("%02x", h[i] & 0xff));
      return s.toString();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  File file(String url) {
    return new File(dir, key(url));
  }

  byte[] get(String url, boolean stale) {
    File f = file(url);
    if (!f.isFile()) return null;
    if (!stale && System.currentTimeMillis() - f.lastModified() > ttl) return null;
    try {
      FileInputStream in = new FileInputStream(f);
      try {
        byte[] d = new byte[(int) f.length()];
        int o = 0, n;
        while (o < d.length && (n = in.read(d, o, d.length - o)) > 0) o += n;
        return o == d.length ? d : null;
      } finally {
        in.close();
      }
    } catch (Exception e) {
      return null;
    }
  }

  synchronized void put(String url, byte[] d) {
    File f = file(url), t = new File(f.getPath() + ".tmp");
    try {
      dir.mkdirs();
      FileOutputStream o = new FileOutputStream(t);
      try {
        o.write(d);
      } finally {
        o.close();
      }
      if (!t.renameTo(f)) {
        f.delete();
        if (!t.renameTo(f)) t.delete();
      }
    } catch (Exception e) {
      t.delete();
      return;
    }
    if (++puts % TRIM_EVERY == 0) trim();
  }

  synchronized void trim() {
    File[] fs = dir.listFiles();
    if (fs == null) return;
    long now = System.currentTimeMillis(), total = 0;
    int n = 0;
    File[] keep = new File[fs.length];
    for (File f : fs) {
      if (!f.isFile()) continue;
      boolean tmp = f.getName().endsWith(".tmp");
      boolean legacy = !f.getName().matches("[0-9a-f]{32}") && !tmp;
      if (legacy || (tmp && now - f.lastModified() > 3600000L)) {
        f.delete();
        continue;
      }
      if (tmp) continue;
      keep[n++] = f;
      total += f.length();
    }
    if (total <= max) return;
    File[] a = Arrays.copyOf(keep, n);
    Arrays.sort(a, new Comparator<File>() {
      @Override
      public int compare(File x, File y) {
        return Long.compare(x.lastModified(), y.lastModified());
      }
    });
    long goal = max * 8 / 10;
    for (File f : a) {
      if (total <= goal) break;
      long l = f.length();
      if (f.delete()) total -= l;
    }
  }
}
