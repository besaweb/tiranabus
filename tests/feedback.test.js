const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const FB = require('../js/feedback.js');
const I18N = require('../js/i18n.js');
const { ROOT } = require('./helpers');

test('feedback: validace e-mailu', () => {
  for (const ok of ['a@b.al', 'jan.novak+tb@mail.example.com', ' x@y.cz ']) assert.equal(FB.mailOk(ok), true, ok);
  for (const bad of ['', 'a', 'a@b', 'a@b.', 'a @b.cz', 'a@b..cz', '@b.cz', 'a@@b.cz', 'x'.repeat(150) + '@b.cz']) assert.equal(FB.mailOk(bad), false, bad);
});

test('feedback: příloha – typ a velikost', () => {
  assert.equal(FB.fileErr(null), null);
  assert.equal(FB.fileErr({ type: 'image/png', size: 1000 }), null);
  assert.equal(FB.fileErr({ type: 'image/jpeg', size: FB.MAX_FILE }), null);
  assert.equal(FB.fileErr({ type: 'image/jpeg', size: FB.MAX_FILE + 1 }), 'size');
  assert.equal(FB.fileErr({ type: 'image/png', size: 0 }), 'size');
  for (const t of ['image/gif', 'image/svg+xml', 'application/pdf', 'text/html', '']) assert.equal(FB.fileErr({ type: t, size: 10 }), 'type', t);
});

test('feedback: validace formuláře', () => {
  const ok = { cat: 'bug', text: 'Nejde to', email: '', file: null };
  assert.equal(FB.validate(ok), null);
  assert.equal(FB.validate({ ...ok, cat: 'x' }), 'cat');
  assert.equal(FB.validate({ ...ok, cat: null }), 'cat');
  assert.equal(FB.validate({ ...ok, text: '  \n ' }), 'text');
  assert.equal(FB.validate({ ...ok, email: 'nesmysl' }), 'mail');
  assert.equal(FB.validate({ ...ok, email: 'a@b.cz' }), null);
  assert.equal(FB.validate({ ...ok, file: { type: 'image/gif', size: 5 } }), 'file');
  assert.equal(FB.validate(null), 'cat');
});

test('feedback: model a verze Androidu z user agenta', () => {
  const wv = 'Mozilla/5.0 (Linux; Android 14; SM-G991B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.0.0 Mobile Safari/537.36';
  assert.deepEqual(FB.device(wv), { android: '14', model: 'SM-G991B' });
  assert.deepEqual(FB.device('Mozilla/5.0 (Linux; Android 16; sdk_gphone64_x86_64 Build/BP22; wv) AppleWebKit/537.36'), { android: '16', model: 'sdk_gphone64_x86_64' });
  assert.deepEqual(FB.device('Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'), { android: '10', model: '' });
  assert.deepEqual(FB.device('Mozilla/5.0 (Linux; Android 8.1.0; Pixel 2) AppleWebKit/537.36'), { android: '8.1.0', model: 'Pixel 2' });
  assert.deepEqual(FB.device('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'), { android: '', model: '' });
  assert.deepEqual(FB.device(undefined), { android: '', model: '' });
});

test('feedback: sestavení zprávy', () => {
  const now = new Date('2026-11-12T23:59:30Z');
  const p = FB.payload({ cat: 'idea', text: '  Přidejte\nnoční linky  ', email: ' a@b.cz ' }, { ver: '1.9', lang: 'cs', ua: 'Mozilla/5.0 (Linux; Android 14; SM-G991B Build/X; wv)', now });
  assert.deepEqual(p, { category: 'idea', message: 'Přidejte\nnoční linky', email: 'a@b.cz', version: '1.9', lang: 'cs', device: 'SM-G991B', android: '14', sent: '2026-11-12T23:59:30.000Z' });
  assert.equal(FB.payload({ cat: 'bug', text: 'x'.repeat(6000) }, {}).message.length, FB.MAX_TEXT);
  assert.equal(FB.payload({ cat: 'bug', text: 'a' }, { ver: '1.9\r\nBcc: x@y.z' }).version, '1.9 Bcc: x@y.z');
  assert.match(FB.payload({ cat: 'bug', text: 'a' }).sent, /^\d{4}-\d\d-\d\dT/);
});

test('feedback: chybové kódy vedou na existující texty ve 12 jazycích', () => {
  const codes = ['cat', 'text', 'mail', 'fields', 'file', 'files', 'rate', 'net', 'send', 'origin', 'cokoli'];
  for (const c of codes) for (const l of I18N.LANGS) assert.equal(typeof I18N.D[l][FB.errKey(c)], 'string', `${l} ${c}`);
  assert.equal(FB.errKey('neznámý'), 'fbErrSend');
});

test('feedback: texty fb* ve všech jazycích neprázdné, kategorie mají popisek', () => {
  const ks = Object.keys(I18N.D.en).filter(k => /^fb[A-Z]/.test(k));
  assert.ok(ks.length >= 20, String(ks.length));
  for (const l of I18N.LANGS) for (const k of ks) assert.ok(String(I18N.D[l][k]).trim(), `${l}.${k}`);
  const cap = s => 'fb' + s[0].toUpperCase() + s.slice(1);
  for (const c of FB.CATS) assert.ok(I18N.D.en[cap(c)], c);
});

test('feedback: server a klient mají stejné limity a kategorie', () => {
  const php = fs.readFileSync(path.join(ROOT, 'feedback.php'), 'utf8');
  assert.match(php, new RegExp('const MAX_SIZE = ' + FB.MAX_FILE + ';'));
  assert.match(php, new RegExp('const MAX_TEXT = ' + FB.MAX_TEXT + ';'));
  for (const c of FB.CATS) assert.ok(php.includes("'" + c + "'"), c);
  for (const t of FB.TYPES) assert.ok(php.includes("'" + t + "'"), t);
  assert.ok(!php.includes('image/gif'));
});
