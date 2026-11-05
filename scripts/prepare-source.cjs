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
  // Normalize accidental outer whitespace around the one-time setup secret.
  const bootstrapRoute = path.join(root, 'app', 'api', 'auth', 'bootstrap', 'route.ts');
  if (fs.existsSync(bootstrapRoute)) {
    let source = fs.readFileSync(bootstrapRoute, 'utf8');
    const patches = [
      [
        'const setupLocks = db.collection("system_locks");',
        'const setupLocks = db.collection<{ _id: string; createdAt: Date }>("system_locks");',
      ],
      [
        'const configuredSecret = process.env.BOOTSTRAP_SECRET;',
        'const configuredSecret = process.env.BOOTSTRAP_SECRET?.trim();',
      ],
      [
        'const suppliedSecret = typeof body.secret === "string" ? body.secret : "";',
        'const suppliedSecret = typeof body.secret === "string" ? body.secret.trim() : "";',
      ],
    ];
    for (const [original, fixed] of patches) {
      if (!source.includes(original)) {
        throw new Error('Expected bootstrap route text was not found; refusing an incomplete patch.');
      }
      source = source.replace(original, fixed);
    }
    fs.writeFileSync(bootstrapRoute, source);
  }
  // Apply checked-in source overrides after extracting the compact source archive.
  // This keeps the app source editable while retaining the repository's split archive packaging.
  const overrides = path.join(root, 'overrides');
  if (fs.existsSync(overrides)) {
    for (const entry of fs.readdirSync(overrides, { withFileTypes: true })) {
      fs.cpSync(path.join(overrides, entry.name), path.join(root, entry.name), { recursive: true });
    }
  }

} finally {
  fs.rmSync(archive, { force: true });
  for (const name of chunks) fs.rmSync(path.join(root, name), { force: true });
  fs.rmSync(__dirname, { recursive: true, force: true });
}
console.log('PICT Finance Society full-stack source extracted successfully.');
