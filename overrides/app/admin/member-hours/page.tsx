"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./member-hours.css";

type MemberSummary = {
  id: string;
  name: string;
  email: string;
  department: string;
  year: string;
  joinedAt: string;
  approvedHours: number;
  pendingHours: number;
  rejectedHours: number;
  totalLoggedHours: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  categories: Record<string, number>;
};

type Contribution = {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  department: string;
  year: string;
  title: string;
  description: string;
  category: string;
  hours: number;
  workDate: string;
  status: string;
  reviewNote: string;
  submittedAt: string;
  updatedAt: string;
  reviewedAt: string;
  reviewedBy: string;
};

type SheetName = "members" | "ledger";
const fmt = (value: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(value || 0);
const dateFmt = (value: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-IN");
};

export default function MemberHoursPage() {
  const router = useRouter();
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [sheet, setSheet] = useState<SheetName>("members");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport() {
    setLoading(true);
    setError("");
    try {
      const meResponse = await fetch("/api/auth/me", { cache: "no-store" });
      const me = await meResponse.json();
      if (!me.user || me.user.role !== "coordinator") {
        router.replace("/admin/login");
        return;
      }
      const response = await fetch("/api/admin/member-hours", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load the member hours workbook.");
      setMembers(data.members || []);
      setContributions(data.contributions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the report.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReport();
  }, []);

  const visibleMembers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return members;
    return members.filter((member) =>
      [member.name, member.email, member.department, member.year, member.id]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [members, search]);

  const visibleContributions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return contributions;
    return contributions.filter((record) =>
      [
        record.memberName,
        record.memberEmail,
        record.department,
        record.year,
        record.title,
        record.description,
        record.category,
        record.status,
        record.reviewNote,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [contributions, search]);

  const approvedHours = members.reduce((sum, member) => sum + member.approvedHours, 0);
  const pendingHours = members.reduce((sum, member) => sum + member.pendingHours, 0);
  const totalLoggedHours = members.reduce((sum, member) => sum + member.totalLoggedHours, 0);

  return (
    <main className="admin-shell">
      <header className="admin-top">
        <Link href="/" className="brand-lockup">
          <span className="brand-mark">PF<span>.</span></span>
          <span className="brand-copy">
            <strong>PICT Finance Society</strong>
            <small>ADMIN CONTROL CENTRE</small>
          </span>
        </Link>
        <div className="admin-top-actions">
          <span className="admin-tag">ADMINISTRATOR</span>
          <Link href="/admin" className="button button-outline">Admin workspace</Link>
          <Link href="/" className="button button-dark">Website ↗</Link>
        </div>
      </header>

      <div className="member-sheet-main">
        <div className="member-sheet-heading">
          <div>
            <div className="eyebrow">COORDINATOR REPORTING</div>
            <h1>Member hours <em>workbook.</em></h1>
            <p>Every member’s profile, hours by review status, category totals and the complete contribution history.</p>
          </div>
          <div className="member-sheet-actions">
            <Link href="/admin" className="member-sheet-back">← Back to dashboard</Link>
            <a href="/api/admin/member-hours/export" className="member-sheet-download">
              <span aria-hidden="true">↓</span> Download Excel
            </a>
          </div>
        </div>

        <div className="member-sheet-metrics">
          <div><span>REGISTERED MEMBERS</span><strong>{members.length}</strong></div>
          <div><span>APPROVED HOURS</span><strong>{fmt(approvedHours)}h</strong></div>
          <div><span>PENDING HOURS</span><strong>{fmt(pendingHours)}h</strong></div>
          <div><span>TOTAL LOGGED HOURS</span><strong>{fmt(totalLoggedHours)}h</strong></div>
        </div>

        {error && <div className="member-sheet-error">{error}</div>}

        <section className="member-sheet-card">
          <div className="member-sheet-toolbar">
            <div>
              <div className="eyebrow">LIVE REPORT</div>
              <h2>Society records</h2>
              <p>Read-only reporting view. Changes to contributions are made in the admin workspace.</p>
            </div>
            <div className="member-sheet-tools">
              <input
                aria-label="Search spreadsheet"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={sheet === "members" ? "Search members..." : "Search contributions..."}
              />
              <button type="button" className="button button-outline" onClick={() => void loadReport()}>
                ↻ Refresh
              </button>
            </div>
          </div>

          <div className="member-sheet-tabs" role="tablist" aria-label="Workbook sheets">
            <button
              type="button"
              role="tab"
              aria-selected={sheet === "members"}
              className={sheet === "members" ? "active" : ""}
              onClick={() => { setSheet("members"); setSearch(""); }}
            >
              <span aria-hidden="true">▦</span> Member Summary <small>{members.length}</small>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={sheet === "ledger"}
              className={sheet === "ledger" ? "active" : ""}
              onClick={() => { setSheet("ledger"); setSearch(""); }}
            >
              <span aria-hidden="true">▤</span> Contribution Ledger <small>{contributions.length}</small>
            </button>
          </div>

          <div className="member-sheet-grid">
            {loading ? (
              <div className="member-sheet-empty">Loading member records…</div>
            ) : sheet === "members" ? (
              <table className="member-sheet-table">
                <thead>
                  <tr>
                    <th>Member</th><th>Email</th><th>Department</th><th>Academic year</th><th>Joined</th>
                    <th>Approved h</th><th>Pending h</th><th>Rejected h</th><th>Total logged h</th>
                    <th>Approved entries</th><th>Pending entries</th><th>Rejected entries</th>
                    <th>Events h</th><th>Research h</th><th>Content h</th><th>Partnerships h</th>
                    <th>Operations h</th><th>Marketing h</th><th>Other h</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="member-sheet-name">{member.name}<small>{member.id}</small></td>
                      <td>{member.email}</td><td>{member.department || "—"}</td><td>{member.year || "—"}</td>
                      <td>{dateFmt(member.joinedAt)}</td>
                      <td className="numeric positive">{fmt(member.approvedHours)}</td>
                      <td className="numeric">{fmt(member.pendingHours)}</td>
                      <td className="numeric negative">{fmt(member.rejectedHours)}</td>
                      <td className="numeric total">{fmt(member.totalLoggedHours)}</td>
                      <td className="numeric">{member.approvedCount}</td><td className="numeric">{member.pendingCount}</td><td className="numeric">{member.rejectedCount}</td>
                      <td className="numeric">{fmt(member.categories.Events || 0)}</td>
                      <td className="numeric">{fmt(member.categories.Research || 0)}</td>
                      <td className="numeric">{fmt(member.categories.Content || 0)}</td>
                      <td className="numeric">{fmt(member.categories.Partnerships || 0)}</td>
                      <td className="numeric">{fmt(member.categories.Operations || 0)}</td>
                      <td className="numeric">{fmt(member.categories.Marketing || 0)}</td>
                      <td className="numeric">{fmt(member.categories.Other || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="member-sheet-table member-sheet-ledger">
                <thead>
                  <tr>
                    <th>Work date</th><th>Member</th><th>Email</th><th>Department</th><th>Academic year</th>
                    <th>Contribution title</th><th>Description</th><th>Category</th><th>Hours</th><th>Status</th>
                    <th>Review note</th><th>Submitted</th><th>Updated</th><th>Reviewed</th><th>Reviewer ID</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleContributions.map((record) => (
                    <tr key={record.id}>
                      <td>{dateFmt(record.workDate)}</td>
                      <td className="member-sheet-name">{record.memberName}<small>{record.memberId}</small></td>
                      <td>{record.memberEmail || "—"}</td><td>{record.department || "—"}</td><td>{record.year || "—"}</td>
                      <td className="ledger-title">{record.title}</td><td className="ledger-description">{record.description}</td><td>{record.category}</td>
                      <td className="numeric total">{fmt(record.hours)}</td>
                      <td><span className={"member-sheet-status " + record.status}>{record.status}</span></td>
                      <td className="ledger-description">{record.reviewNote || "—"}</td>
                      <td>{dateFmt(record.submittedAt)}</td><td>{dateFmt(record.updatedAt)}</td><td>{dateFmt(record.reviewedAt)}</td><td>{record.reviewedBy || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && ((sheet === "members" && visibleMembers.length === 0) || (sheet === "ledger" && visibleContributions.length === 0)) && (
              <div className="member-sheet-empty">No matching records found.</div>
            )}
          </div>

          <div className="member-sheet-footer">
            <span>
              {sheet === "members"
                ? "Showing " + visibleMembers.length + " of " + members.length + " members"
                : "Showing " + visibleContributions.length + " of " + contributions.length + " contribution records"}
            </span>
            <span>Approved hours are the only hours credited to society totals.</span>
          </div>
        </section>
      </div>
    </main>
  );
}
