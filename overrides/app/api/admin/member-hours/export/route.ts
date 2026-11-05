import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { requireCoordinator } from "@/lib/auth";
import { errorResponse } from "@/lib/http";
import { getMemberHoursReport } from "../report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatSheet(sheet: ExcelJS.Worksheet) {
  const header = sheet.getRow(1);
  header.height = 26;
  header.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF173C35" },
  };
  header.alignment = { vertical: "middle", wrapText: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  };
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { vertical: "top", wrapText: true };
      if (rowNumber % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF4F7F1" },
          };
        });
      }
    }
  });
}

export async function GET() {
  try {
    await requireCoordinator();
    const report = await getMemberHoursReport();
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "PICT Finance Society";
    workbook.subject = "Member contribution hours and activity";
    workbook.title = "PICT Finance Society - Member Hours";
    workbook.created = new Date();

    const summary = workbook.addWorksheet("Member Summary");
    summary.columns = [
      { header: "Member ID", key: "memberId", width: 28 },
      { header: "Full Name", key: "name", width: 24 },
      { header: "Email", key: "email", width: 30 },
      { header: "Department", key: "department", width: 18 },
      { header: "Academic Year", key: "year", width: 18 },
      { header: "Joined On", key: "joinedAt", width: 24 },
      { header: "Approved Hours", key: "approvedHours", width: 17 },
      { header: "Pending Hours", key: "pendingHours", width: 16 },
      { header: "Rejected Hours", key: "rejectedHours", width: 17 },
      { header: "Total Logged Hours", key: "totalLoggedHours", width: 19 },
      { header: "Approved Entries", key: "approvedCount", width: 18 },
      { header: "Pending Entries", key: "pendingCount", width: 17 },
      { header: "Rejected Entries", key: "rejectedCount", width: 18 },
      { header: "Events Approved Hours", key: "eventsHours", width: 22 },
      { header: "Research Approved Hours", key: "researchHours", width: 24 },
      { header: "Content Approved Hours", key: "contentHours", width: 23 },
      { header: "Partnerships Approved Hours", key: "partnershipsHours", width: 27 },
      { header: "Operations Approved Hours", key: "operationsHours", width: 25 },
      { header: "Marketing Approved Hours", key: "marketingHours", width: 24 },
      { header: "Other Approved Hours", key: "otherHours", width: 21 },
    ];
    summary.addRows(report.members.map((member) => ({
      memberId: member.id,
      name: member.name,
      email: member.email,
      department: member.department,
      year: member.year,
      joinedAt: member.joinedAt,
      approvedHours: member.approvedHours,
      pendingHours: member.pendingHours,
      rejectedHours: member.rejectedHours,
      totalLoggedHours: member.totalLoggedHours,
      approvedCount: member.approvedCount,
      pendingCount: member.pendingCount,
      rejectedCount: member.rejectedCount,
      eventsHours: member.categories.Events || 0,
      researchHours: member.categories.Research || 0,
      contentHours: member.categories.Content || 0,
      partnershipsHours: member.categories.Partnerships || 0,
      operationsHours: member.categories.Operations || 0,
      marketingHours: member.categories.Marketing || 0,
      otherHours: member.categories.Other || 0,
    })));
    formatSheet(summary);

    const ledger = workbook.addWorksheet("Contribution Ledger");
    ledger.columns = [
      { header: "Contribution ID", key: "id", width: 28 },
      { header: "Member ID", key: "memberId", width: 28 },
      { header: "Member Name", key: "memberName", width: 24 },
      { header: "Member Email", key: "memberEmail", width: 30 },
      { header: "Department", key: "department", width: 18 },
      { header: "Academic Year", key: "year", width: 18 },
      { header: "Contribution Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 48 },
      { header: "Category", key: "category", width: 18 },
      { header: "Hours", key: "hours", width: 12 },
      { header: "Work Date", key: "workDate", width: 16 },
      { header: "Status", key: "status", width: 14 },
      { header: "Review Note", key: "reviewNote", width: 38 },
      { header: "Submitted At", key: "submittedAt", width: 24 },
      { header: "Last Updated", key: "updatedAt", width: 24 },
      { header: "Reviewed At", key: "reviewedAt", width: 24 },
      { header: "Reviewed By (ID)", key: "reviewedBy", width: 28 },
    ];
    ledger.addRows(report.contributions.map((record) => ({ ...record })));
    formatSheet(ledger);

    const generated = new Date(report.generatedAt).toISOString().slice(0, 10);
    const file = new Uint8Array(await workbook.xlsx.writeBuffer());
    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="pict-finance-society-member-hours-' + generated + '.xlsx"',
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
