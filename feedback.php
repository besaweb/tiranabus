<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('Vary: Origin');

const TO = 'tiranabus@besaweb.al';
const FROM = 'noreply@tiranabus.al';
const MAX_SIZE = 4194304;
const MAX_TEXT = 5000;
const PER_HOUR = 5;
const ORIGINS = ['https://appassets.androidplatform.net', 'https://tiranabus.al', 'https://www.tiranabus.al'];
const CATS = ['bug' => 'Bug report', 'idea' => 'Improvement suggestion', 'other' => 'Other'];

function out($ok, $err = '', $status = 200) {
  http_response_code($status);
  echo json_encode(['ok' => $ok, 'error' => $err]);
  exit;
}

function cut($s, $max) {
  return function_exists('mb_substr') ? mb_substr($s, 0, $max, 'UTF-8') : substr($s, 0, $max);
}

function line($k, $max) {
  return cut(trim(preg_replace('/[\r\n\t]+/', ' ', isset($_POST[$k]) ? (string) $_POST[$k] : '')), $max);
}

function enc($s) {
  return '=?UTF-8?B?' . base64_encode($s) . '?=';
}

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if ($origin !== '') {
  if (!in_array($origin, ORIGINS, true)) out(false, 'origin', 403);
  header('Access-Control-Allow-Origin: ' . $origin);
}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  header('Access-Control-Allow-Methods: POST');
  http_response_code(204);
  exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(false, 'method', 405);

$cat = line('category', 10);
$email = line('email', 150);
$message = trim(isset($_POST['message']) ? (string) $_POST['message'] : '');
$message = cut($message, MAX_TEXT);
$lang = preg_replace('/[^a-z]/', '', strtolower(line('lang', 5)));
$version = preg_replace('/[^0-9A-Za-z._-]/', '', line('version', 20));
$device = line('device', 60);
$android = preg_replace('/[^0-9.]/', '', line('android', 10));
$sent = preg_replace('/[^0-9TZ:.+-]/', '', line('sent', 30));

if (!isset(CATS[$cat]) || $message === '' || ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL))) out(false, 'fields', 400);

$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
$rf = sys_get_temp_dir() . '/tiranabus-feedback-' . md5($ip);
$now = time();
$hits = [];
if (is_file($rf)) {
  foreach (explode(',', (string) @file_get_contents($rf)) as $h) {
    if ((int) $h > $now - 3600) $hits[] = (int) $h;
  }
}
if (count($hits) >= PER_HOUR) out(false, 'rate', 429);

$part = null;
if (isset($_FILES['shot'])) {
  if (is_array($_FILES['shot']['name'])) out(false, 'files', 400);
  if ($_FILES['shot']['error'] !== UPLOAD_ERR_NO_FILE) {
    $tmp = $_FILES['shot']['tmp_name'];
    if ($_FILES['shot']['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($tmp) || $_FILES['shot']['size'] > MAX_SIZE) out(false, 'files', 400);
    $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $fi = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($fi, $tmp);
    if (!isset($ext[$mime]) || @getimagesize($tmp) === false) out(false, 'files', 400);
    $part = ['mime' => $mime, 'name' => 'screenshot.' . $ext[$mime], 'data' => file_get_contents($tmp)];
  }
}

$b = 'tb' . md5(uniqid('', true));
$text = 'Category: ' . CATS[$cat] . " ($cat)\n"
  . 'Email: ' . ($email !== '' ? $email : '-') . "\n"
  . "App version: $version\nDevice: $device\nAndroid: $android\nLanguage: $lang\n"
  . "Sent (device): $sent\nReceived (server): " . gmdate('Y-m-d\TH:i:s\Z', $now) . "\n"
  . "\n$message\n";
$body = "--$b\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n";
$body .= chunk_split(base64_encode($text)) . "\r\n";
if ($part) {
  $body .= "--$b\r\nContent-Type: {$part['mime']}; name=\"{$part['name']}\"\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"{$part['name']}\"\r\n\r\n";
  $body .= chunk_split(base64_encode($part['data'])) . "\r\n";
}
$body .= "--$b--\r\n";

$headers = 'From: ' . enc('Tirana Bus') . ' <' . FROM . ">\r\n"
  . ($email !== '' ? 'Reply-To: <' . $email . ">\r\n" : '')
  . "MIME-Version: 1.0\r\n"
  . "Content-Type: multipart/mixed; boundary=\"$b\"\r\n";

if (!mail(TO, enc('[Tirana Bus] Feedback: ' . CATS[$cat] . ($version !== '' ? ' (' . $version . ')' : '')), $body, $headers)) out(false, 'send', 500);

$hits[] = $now;
@file_put_contents($rf, implode(',', $hits));
out(true);
