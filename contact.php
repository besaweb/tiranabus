<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

const TO = 'tiranabus@besaweb.al';
const FROM = 'noreply@tiranabus.al';
const MAX_FILES = 3;
const MAX_SIZE = 4194304;
const PER_HOUR = 5;

function out($ok, $err = '', $status = 200) {
  http_response_code($status);
  echo json_encode(['ok' => $ok, 'error' => $err]);
  exit;
}

function line($s, $max) {
  $s = trim(preg_replace('/[\r\n\t]+/', ' ', (string) $s));
  return function_exists('mb_substr') ? mb_substr($s, 0, $max, 'UTF-8') : substr($s, 0, $max);
}

function enc($s) {
  return '=?UTF-8?B?' . base64_encode($s) . '?=';
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(false, 'method', 405);

$origin = isset($_SERVER['HTTP_ORIGIN']) ? parse_url($_SERVER['HTTP_ORIGIN'], PHP_URL_HOST) : null;
if ($origin && $origin !== 'tiranabus.al' && $origin !== 'www.tiranabus.al') out(false, 'origin', 403);

if (!empty($_POST['website'])) out(true);

$name = line(isset($_POST['name']) ? $_POST['name'] : '', 100);
$email = line(isset($_POST['email']) ? $_POST['email'] : '', 150);
$subject = line(isset($_POST['subject']) ? $_POST['subject'] : '', 150);
$message = trim(isset($_POST['message']) ? (string) $_POST['message'] : '');
$lang = preg_replace('/[^a-z]/', '', strtolower(line(isset($_POST['lang']) ? $_POST['lang'] : '', 5)));
if (function_exists('mb_substr')) $message = mb_substr($message, 0, 5000, 'UTF-8');

if ($name === '' || $subject === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) out(false, 'fields', 400);

$ip = isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '';
$rf = sys_get_temp_dir() . '/tiranabus-contact-' . md5($ip);
$now = time();
$hits = [];
if (is_file($rf)) {
  foreach (explode(',', (string) @file_get_contents($rf)) as $h) {
    if ((int) $h > $now - 3600) $hits[] = (int) $h;
  }
}
if (count($hits) >= PER_HOUR) out(false, 'rate', 429);

$parts = [];
if (isset($_FILES['files']) && is_array($_FILES['files']['name'])) {
  $fi = finfo_open(FILEINFO_MIME_TYPE);
  $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
  $n = count($_FILES['files']['name']);
  if ($n > MAX_FILES) out(false, 'files', 400);
  for ($i = 0; $i < $n; $i++) {
    $err = $_FILES['files']['error'][$i];
    if ($err === UPLOAD_ERR_NO_FILE) continue;
    $tmp = $_FILES['files']['tmp_name'][$i];
    if ($err !== UPLOAD_ERR_OK || !is_uploaded_file($tmp) || $_FILES['files']['size'][$i] > MAX_SIZE) out(false, 'files', 400);
    $mime = finfo_file($fi, $tmp);
    if (!isset($ext[$mime]) || @getimagesize($tmp) === false) out(false, 'files', 400);
    $parts[] = ['mime' => $mime, 'name' => 'photo' . (count($parts) + 1) . '.' . $ext[$mime], 'data' => file_get_contents($tmp)];
  }
}

$b = 'tb' . md5(uniqid('', true));
$body = "--$b\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n";
$text = "Name: $name\nEmail: $email\nLanguage: $lang\n\n$message\n";
$body .= chunk_split(base64_encode($text)) . "\r\n";
foreach ($parts as $p) {
  $body .= "--$b\r\nContent-Type: {$p['mime']}; name=\"{$p['name']}\"\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"{$p['name']}\"\r\n\r\n";
  $body .= chunk_split(base64_encode($p['data'])) . "\r\n";
}
$body .= "--$b--\r\n";

$safe = str_replace(['"', '<', '>', '\\'], '', $name);
$headers = 'From: ' . enc('Tirana Bus') . ' <' . FROM . ">\r\n"
  . 'Reply-To: ' . enc($safe) . ' <' . $email . ">\r\n"
  . "MIME-Version: 1.0\r\n"
  . "Content-Type: multipart/mixed; boundary=\"$b\"\r\n";

if (!mail(TO, enc('[Tirana Bus] ' . $subject), $body, $headers)) out(false, 'send', 500);

$hits[] = $now;
@file_put_contents($rf, implode(',', $hits));
out(true);
