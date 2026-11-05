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
      if (source.includes(original)) {
        source = source.replace(original, fixed);
      } else if (!source.includes(fixed)) {
        throw new Error('Expected bootstrap route text was not found; refusing an incomplete patch.');
      }
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

  // Add a prominent shortcut to the coordinator-only member hours workbook.
  const adminPage = path.join(root, 'app', 'admin', 'page.tsx');
  if (fs.existsSync(adminPage)) {
    let source = fs.readFileSync(adminPage, 'utf8');
    if (!source.includes('import "./admin.css";')) {
      source = source.replace('"use client";', '"use client";' + String.fromCharCode(10) + String.fromCharCode(10) + 'import "./admin.css";');
    }
    const marker = '      {notice && <div className="admin-notice">';
    const shortcut = `      <section className="admin-sheet-launch">
        <a className="admin-sheet-link" href="/admin/member-hours">
          <span className="admin-sheet-icon" aria-hidden="true">▦</span>
          <span className="admin-sheet-copy">
            <small>MEMBER REPORTING</small>
            <strong>Member hours spreadsheet</strong>
            <em>Preview every member, their hours by status, and the full contribution ledger.</em>
          </span>
          <b>Preview workbook ↗</b>
        </a>
        <a className="admin-sheet-file" href="/api/admin/member-hours/export" title="Download the live Excel workbook">
          <span className="admin-sheet-file-icon" aria-hidden="true">XLSX</span>
          <span className="admin-sheet-file-copy">
            <strong>Download Excel file</strong>
            <small>Live member data · Two worksheets · .xlsx format</small>
          </span>
          <b>↓ Download</b>
        </a>
      </section>
`;
    if (source.includes(marker)) {
      source = source.replace(marker, shortcut + marker);
    } else if (!source.includes('admin-sheet-launch')) {
      throw new Error('Admin dashboard insertion point was not found.');
    }
    fs.writeFileSync(adminPage, source);
  }

  // Make administrator login copy and form controls comfortably readable.
  const adminLoginPage = path.join(root, 'app', 'admin', 'login', 'page.tsx');
  if (fs.existsSync(adminLoginPage)) {
    let source = fs.readFileSync(adminLoginPage, 'utf8');
    if (!source.includes('import "./admin-login.css";')) {
      source = source.replace('"use client";', '"use client";' + String.fromCharCode(10) + String.fromCharCode(10) + 'import "./admin-login.css";');
    }
    if (source.includes('return <main className="auth-page">')) {
      source = source.replace('return <main className="auth-page">', 'return <main className="auth-page admin-login-page">');
    } else if (!source.includes('auth-page admin-login-page')) {
      throw new Error('Admin login page root was not found.');
    }
    fs.writeFileSync(adminLoginPage, source);
  }

} finally {
  fs.rmSync(archive, { force: true });
  for (const name of chunks) fs.rmSync(path.join(root, name), { force: true });
  fs.rmSync(__dirname, { recursive: true, force: true });
}
console.log('PICT Finance Society full-stack source extracted successfully.');
