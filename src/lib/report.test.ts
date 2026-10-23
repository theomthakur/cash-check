import { describe, expect, it } from "vitest";
import { demoPortfolio } from "./demo-data";
import { buildReportData, pdfMoney, renderReportPdf, reportFileName } from "./report";

const targets = { stocks: 65, bonds: 20, cash: 10, other: 5 };
const now = new Date("2026-10-23T18:00:00Z");

describe("report data", () => {
  it("formats money as plain text a PDF font can draw", () => {
    expect(pdfMoney(15745.8, "USD")).toBe("USD 15,745.80");
    expect(pdfMoney(-5, "CAD")).toBe("CAD -5.00");
  });

  it("tells the story of money in, money out and the change in cash", () => {
    const data = buildReportData(demoPortfolio, "USD", targets, 4, now);
    expect(data.summary).toBe("In the last 30 days, USD 1,460.60 came in and USD 1,154.95 went out. Your cash grew by USD 305.65, to USD 15,745.80 today.");
    expect(data.cashThen).toContain("USD 15,440.15");
    expect(data.moneyOut.purchases).toBe("USD 900.00");
    expect(data.sourceLabel).toContain("Demo data");
  });

  it("shows the what-if groups with targets and never uses dashes", () => {
    const data = buildReportData(demoPortfolio, "USD", targets, 4, now);
    expect(data.groups.map((group) => group.group)).toEqual(["Stocks", "Bonds", "Cash", "Other"]);
    expect(data.targetsAddUp).toBe(true);
    expect(JSON.stringify(data)).not.toMatch(/[\u2013\u2014]/);
  });

  it("flags targets that do not add up to 100", () => {
    expect(buildReportData(demoPortfolio, "USD", { ...targets, stocks: 50 }, 4, now).targetsAddUp).toBe(false);
  });

  it("builds a real PDF file", async () => {
    const bytes = await renderReportPdf(buildReportData(demoPortfolio, "USD", targets, 4, now));
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    expect(bytes.length).toBeGreaterThan(2000);
    expect(reportFileName(now)).toBe("cash-check-summary-2026-10-23.pdf");
  });
});
