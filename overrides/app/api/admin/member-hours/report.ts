import { getDb } from "@/lib/db";
import type { ContributionDocument, UserDocument } from "@/lib/types";

const CATEGORIES = [
  "Events",
  "Research",
  "Content",
  "Partnerships",
  "Operations",
  "Marketing",
  "Other",
] as const;

const STATUSES = ["approved", "pending", "rejected"] as const;

function iso(value: Date | string | undefined): string {
  if (!value) return "";
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}

export type MemberHoursSummary = {
  id: string;
  name: string;
  email: string;
  department: string;
  year: string;
  role: "member";
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

export type MemberContributionLedgerRow = {
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

export async function getMemberHoursReport() {
  const db = await getDb();
  const memberDocs = await db
    .collection<UserDocument>("users")
    .find(
      { role: "member" },
      { projection: { passwordHash: 0 } },
    )
    .sort({ name: 1 })
    .toArray();

  const contributionDocs = await db
    .collection<ContributionDocument>("contributions")
    .find({})
    .sort({ workDate: -1, createdAt: -1 })
    .toArray();

  const members: MemberHoursSummary[] = memberDocs.map((member) => ({
    id: member._id.toString(),
    name: member.name || "",
    email: member.email || "",
    department: member.department || "",
    year: member.year || "",
    role: "member",
    joinedAt: iso(member.createdAt),
    approvedHours: 0,
    pendingHours: 0,
    rejectedHours: 0,
    totalLoggedHours: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    categories: Object.fromEntries(CATEGORIES.map((category) => [category, 0])),
  }));

  const byId = new Map(members.map((member) => [member.id, member]));

  const contributions: MemberContributionLedgerRow[] = contributionDocs.map((record) => {
    const memberId = record.userId?.toString?.() || "";
    const member = byId.get(memberId);
    const hours = Number(record.hours || 0);
    const status = STATUSES.includes(record.status) ? record.status : "pending";

    if (member) {
      const hoursKey = status + "Hours" as "approvedHours" | "pendingHours" | "rejectedHours";
      const countKey = status + "Count" as "approvedCount" | "pendingCount" | "rejectedCount";
      member[hoursKey] += hours;
      member[countKey] += 1;
      if (status === "approved") {
        member.categories[record.category || "Other"] =
          (member.categories[record.category || "Other"] || 0) + hours;
      }
    }

    return {
      id: record._id.toString(),
      memberId,
      memberName: member?.name || "Deleted or non-member account",
      memberEmail: member?.email || "",
      department: member?.department || "",
      year: member?.year || "",
      title: record.title || "",
      description: record.description || "",
      category: record.category || "Other",
      hours,
      workDate: record.workDate || "",
      status,
      reviewNote: record.reviewNote || "",
      submittedAt: iso(record.createdAt),
      updatedAt: iso(record.updatedAt),
      reviewedAt: iso(record.reviewedAt),
      reviewedBy: record.reviewedBy?.toString?.() || "",
    };
  });

  for (const member of members) {
    member.totalLoggedHours =
      member.approvedHours + member.pendingHours + member.rejectedHours;
  }

  return {
    generatedAt: new Date().toISOString(),
    members,
    contributions,
  };
}
