// Read-only credential audit. Prints paths/fingerprints only, never values.
const cp = require('child_process');
const fs = require('fs');
const crypto = require('crypto');
const git = (...args) => cp.execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['pipe', 'pipe', 'ignore'] });
const hashes = new Set();
const revisions = git('log', '--all', '--format=%H', '--', 'server/.env').trim().split(/\s+/);
for (const revision of revisions) {
  let content;
  try { content = git('show', `${revision}:server/.env`); } catch { continue; }
  for (const line of content.split(/\r?\n/)) {
    const match = /^\s*(?:API_KEYS|[A-Z_]*API_KEY)\s*=(.*)$/.exec(line);
    if (!match) continue;
    for (const key of match[1].split(',').map((value) => value.trim().replace(/^["']|["']$/g, '')).filter(Boolean)) {
      hashes.add(crypto.createHash('sha256').update(key).digest('hex'));
    }
  }
}
const secrets = [];
if (fs.existsSync('server/.env')) {
  for (const line of fs.readFileSync('server/.env', 'utf8').split(/\r?\n/)) {
    const match = /^\s*([A-Z_]*(?:KEYS?|TOKEN|SECRET|PASSWORD))\s*=(.*)$/.exec(line);
    if (match) secrets.push(...match[2].split(',').map((value) => value.trim().replace(/^["']|["']$/g, '')).filter((value) => value.length >= 12));
  }
}
const objects = git('rev-list', '--objects', '--all').trim().split('\n').map((line) => {
  const space = line.indexOf(' ');
  return [line.slice(0, space), line.slice(space + 1)];
}).filter(([id, path]) => !path.includes('node_modules/') &&
  /\.(js|jsx|ts|tsx|json|md|html|yaml|yml|sql|txt|env|example|log)$/.test(path));
const data = cp.execFileSync('git', ['cat-file', '--batch'], {
  input: objects.map(([id]) => id).join('\n') + '\n', maxBuffer: 256 * 1024 * 1024,
});
let offset = 0;
const findings = [];
const check = (body, path, blob) => {
  if (secrets.some((secret) => body.includes(secret))) findings.push({ path, blob, kind: 'matches current local secret' });
  if (/sk-[A-Za-z0-9_-]{20,}|AKIA[A-Z0-9]{16}|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,}/.test(body)) {
    findings.push({ path, blob, kind: 'credential pattern' });
  }
};
for (const [id, path] of objects) {
  const end = data.indexOf(10, offset);
  const size = Number(data.subarray(offset, end).toString().split(' ')[2]);
  const body = data.subarray(end + 1, end + 1 + size).toString();
  offset = end + size + 2;
  check(body, path, id.slice(0, 12));
}
const currentFiles = git('ls-files', '--cached', '--others', '--exclude-standard').trim().split('\n')
  .filter((path) => !path.includes('node_modules/') && /\.(js|jsx|ts|tsx|cjs|json|md|html|yaml|yml|sql|txt|example|log)$/.test(path) && fs.existsSync(path));
for (const path of currentFiles) check(fs.readFileSync(path, 'utf8'), path, 'working-tree');
console.log(JSON.stringify({ scannedFirstPartyHistoryBlobs: objects.length,
  scannedCurrentFirstPartyFiles: currentFiles.length,
  historicalApiKeyFingerprints: [...hashes], findings,
  currentKeysMatchingHistoricalExposure: secrets.filter((secret) => hashes.has(crypto.createHash('sha256').update(secret).digest('hex'))).length,
}, null, 2));
