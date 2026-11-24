const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function encode(bytes) {
  let bits = ''; for (const byte of bytes) bits += byte.toString(2).padStart(8, '0');
  return bits.match(/.{1,5}/g).map(group => alphabet[parseInt(group.padEnd(5, '0'), 2)]).join('');
}
function decode(secret) {
  const bits = [...secret].map(char => alphabet.indexOf(char).toString(2).padStart(5, '0')).join('');
  return Buffer.from((bits.match(/.{8}/g) || []).map(byte => parseInt(byte, 2)));
}
function codeAt(secret, counter) {
  const input = Buffer.alloc(8); input.writeBigUInt64BE(BigInt(counter));
  const digest = crypto.createHmac('sha1', decode(secret)).update(input).digest();
  const offset = digest[digest.length - 1] & 15;
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 1000000).padStart(6, '0');
}
function verify(secret, code, lastCounter = -1, now = Date.now()) {
  if (!/^\d{6}$/.test(String(code))) return null;
  const counter = Math.floor(now / 30000);
  for (const step of [counter, counter - 1, counter + 1]) {
    if (step > Number(lastCounter) && crypto.timingSafeEqual(Buffer.from(codeAt(secret, step)), Buffer.from(String(code)))) return step;
  }
  return null;
}
function key() {
  let value = process.env.SECURITY_KEY;
  if (!value && process.env.NODE_ENV !== 'production') {
    const file = path.join(__dirname, '../security-key.local.txt');
    if (!fs.existsSync(file)) fs.writeFileSync(file, crypto.randomBytes(32).toString('hex'), { flag: 'wx', mode: 0o600 });
    value = fs.readFileSync(file, 'utf8').trim();
  }
  if (!/^[a-f0-9]{64}$/i.test(value || '')) throw new Error('SECURITY_KEY must contain 64 hexadecimal characters.');
  return Buffer.from(value, 'hex');
}
function encrypt(secret) {
  const iv = crypto.randomBytes(12), cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64');
}
function decrypt(value) {
  const bytes = Buffer.from(value, 'base64'), decipher = crypto.createDecipheriv('aes-256-gcm', key(), bytes.subarray(0, 12));
  decipher.setAuthTag(bytes.subarray(12, 28));
  return Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8');
}
module.exports = { encode, codeAt, verify, encrypt, decrypt, newSecret: () => encode(crypto.randomBytes(20)) };
