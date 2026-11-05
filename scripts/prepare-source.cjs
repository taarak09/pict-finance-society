const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const chunks = fs.readdirSync(root)
  .filter((name) => /^pictsrc\.\d+\.b64$/.test(name))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
if (chunks.length === 0) {
  console.log('PICT Finance Society source already extracted.');
  process.exit(0);
}
const archive = path.join(root, '.pict-source.tar.gz');
const base64 = chunks.map((name) => fs.readFileSync(path.join(root, name), 'utf8').trim()).join('');
fs.writeFileSync(archive, Buffer.from(base64, 'base64'));
try {
  execFileSync('tar', ['-xzf', archive, '-C', root], { stdio: 'inherit' });

  // Keep the setup lock's string _id accurately typed with MongoDB 7+.
  const bootstrapRoute = path.join(root, 'app', 'api', 'auth', 'bootstrap', 'route.ts');
  if (fs.existsSync(bootstrapRoute)) {
    const source = fs.readFileSync(bootstrapRoute, 'utf8');
    const original = 'const setupLocks = db.collection("system_locks");';
    const fixed = 'const setupLocks = db.collection<{ _id: string; createdAt: Date }>("system_locks");';
    if (source.includes(original)) fs.writeFileSync(bootstrapRoute, source.replace(original, fixed));
  }
} finally {
  fs.rmSync(archive, { force: true });
  for (const name of chunks) fs.rmSync(path.join(root, name), { force: true });
  fs.rmSync(__dirname, { recursive: true, force: true });
}
console.log('PICT Finance Society full-stack source extracted successfully.');
