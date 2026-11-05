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
            <strong>Open member hours spreadsheet</strong>
            <em>View every member, approved and pending hours, and the full contribution ledger.</em>
          </span>
          <b>Open workbook ↗</b>
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


  // Add an explicit one-action bulk hour credit for every registered member.
  const bulkAdminPage = path.join(root, 'app', 'admin', 'page.tsx');
  if (fs.existsSync(bulkAdminPage)) {
    let source = fs.readFileSync(bulkAdminPage, 'utf8');
    const patches = [
      [
        '  async function addHours(event: React.FormEvent<HTMLFormElement>) {\n    event.preventDefault(); setBusy("manual"); setError(""); setNotice("");\n    try {\n      const res = await fetch("/api/admin/contributions", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(manual)});\n      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Could not add hours.");\n      setNotice("Hours adjustment added and credited."); setManual({...manual,hours:"1"}); await load();\n    } catch (err) { setError(err instanceof Error ? err.message : "Could not add hours."); }\n    finally { setBusy(""); }\n  }',
        '  async function addHours(event: React.FormEvent<HTMLFormElement>) {\n    event.preventDefault();\n    const allMembers = manual.userId === "__all_members__";\n    if (allMembers && !window.confirm("Add " + manual.hours + " hours to each of " + members.length + " members? This will create one approved contribution for every member.")) return;\n    setBusy("manual"); setError(""); setNotice("");\n    try {\n      const res = await fetch("/api/admin/contributions", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...manual,userId:allMembers ? "" : manual.userId,allMembers})});\n      const data = await res.json(); if (!res.ok) throw new Error(data.error || "Could not add hours.");\n      setNotice(allMembers ? (fmt(data.hoursPerMember) + " hours credited to each of " + data.memberCount + " members.") : "Hours adjustment added and credited."); setManual({...manual,userId:"",hours:"1"}); await load();\n    } catch (err) { setError(err instanceof Error ? err.message : "Could not add hours."); }\n    finally { setBusy(""); }\n  }'
      ],
      [
        '<h2>Add hours to a member</h2><p>Use this for approved offline work or corrections. The change is recorded as an approved contribution.</p>',
        '<h2>Add hours to members</h2><p>Select one member or all members. With “All members”, the full hours amount entered is credited individually to every registered member.</p>'
      ],
      [
        '<label>Member<select required value={manual.userId} onChange={e=>setManual({...manual,userId:e.target.value})}><option value="">Choose member</option>{members.map(m=><option key={m.id} value={m.id}>{m.name} · {m.email}</option>)}</select></label>',
        '<label>Member / recipient<select required value={manual.userId} onChange={e=>setManual({...manual,userId:e.target.value})}><option value="">Choose member</option><option value="__all_members__" disabled={!members.length}>All members — apply hours to everyone</option>{members.map(m=><option key={m.id} value={m.id}>{m.name} · {m.email}</option>)}</select><small className="manual-bulk-note">All members receives the full entered hours individually, not a shared split.</small></label>'
      ]
    ];
    for (const [original, fixed] of patches) {
      if (source.includes(original)) {
        source = source.replace(original, fixed);
      } else if (!source.includes(fixed)) {
        throw new Error('Expected admin bulk-hours insertion point was not found.');
      }
    }
    fs.writeFileSync(bulkAdminPage, source);
  }

  // Increase only small supporting text on the admin login page; keep large headings unchanged.
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

  // Add an all-members branch to the existing coordinator-only manual-credit API.
  const contributionApi = path.join(root, 'app', 'api', 'admin', 'contributions', 'route.ts');
  if (fs.existsSync(contributionApi)) {
    let source = fs.readFileSync(contributionApi, 'utf8');
    const patches = [
      [
        '    const userId = typeof body.userId === "string" ? body.userId : "";',
        '    const userId = typeof body.userId === "string" ? body.userId : "";\n    const applyToAllMembers = body.allMembers === true;'
      ],
      [
        '    if (!ObjectId.isValid(userId)) return NextResponse.json({ error: "Choose a valid member." }, { status: 400 });',
        '    if (!applyToAllMembers && !ObjectId.isValid(userId)) return NextResponse.json({ error: "Choose a valid member." }, { status: 400 });'
      ],
      [
        '    const member = await db.collection<UserDocument>("users").findOne({ _id: new ObjectId(userId), role: "member" });\n    if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });\n    const now = new Date();\n    const document = { _id: new ObjectId(), userId: new ObjectId(userId), title, description, category, hours: Math.round(hours * 10) / 10, workDate, status: "approved" as const, reviewNote: "Added by administrator", reviewedBy: new ObjectId(admin.id), reviewedAt: now, createdAt: now, updatedAt: now, createdByAdmin: true };\n    await db.collection<ContributionDocument>("contributions").insertOne(document as ContributionDocument);\n    await db.collection("admin_audit_logs").insertOne({ action: "create_contribution", contributionId: document._id, userId: document.userId, hours: document.hours, adminId: new ObjectId(admin.id), createdAt: now });\n    return NextResponse.json({ success: true, id: document._id.toString() }, { status: 201 });',
        '    const userCollection = db.collection<UserDocument>("users");\n    const targetMembers = applyToAllMembers\n      ? await userCollection.find({ role: "member" }, { projection: { _id: 1 } }).toArray()\n      : await userCollection.find({ _id: new ObjectId(userId), role: "member" }, { projection: { _id: 1 } }).toArray();\n    if (!targetMembers.length) return NextResponse.json({ error: applyToAllMembers ? "There are no registered members to credit." : "Member not found." }, { status: 404 });\n    const now = new Date();\n    const creditedHours = Math.round(hours * 10) / 10;\n    const batchId = new ObjectId();\n    const documents = targetMembers.map((member) => ({ _id: new ObjectId(), userId: member._id, title, description, category, hours: creditedHours, workDate, status: "approved" as const, reviewNote: applyToAllMembers ? "Bulk-added by administrator" : "Added by administrator", reviewedBy: new ObjectId(admin.id), reviewedAt: now, createdAt: now, updatedAt: now, createdByAdmin: true, ...(applyToAllMembers ? { batchId } : {}) }));\n    await db.collection<ContributionDocument>("contributions").insertMany(documents as ContributionDocument[]);\n    await db.collection("admin_audit_logs").insertMany(documents.map((document) => ({ action: applyToAllMembers ? "bulk_create_contribution" : "create_contribution", batchId: applyToAllMembers ? batchId : undefined, contributionId: document._id, userId: document.userId, hours: document.hours, adminId: new ObjectId(admin.id), createdAt: now })));\n    return NextResponse.json({ success: true, count: documents.length, memberCount: targetMembers.length, hoursPerMember: creditedHours, ids: documents.map((document) => document._id.toString()) }, { status: 201 });'
      ]
    ];
    for (const [original, fixed] of patches) {
      if (source.includes(original)) {
        source = source.replace(original, fixed);
      } else if (!source.includes(fixed)) {
        throw new Error('Expected contribution API insertion point was not found.');
      }
    }
    fs.writeFileSync(contributionApi, source);
  }

} finally {
  fs.rmSync(archive, { force: true });
  for (const name of chunks) fs.rmSync(path.join(root, name), { force: true });
  fs.rmSync(__dirname, { recursive: true, force: true });
}
console.log('PICT Finance Society full-stack source extracted successfully.');
