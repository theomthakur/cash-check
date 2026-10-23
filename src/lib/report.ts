import { cashThenNote, ignoredSummary } from "./activities";
import type { Bucket, PortfolioSnapshot } from "./types";
import { bucketValues, cashByCurrency, hypotheticalAnnualEarnings, simulateBuyOnly } from "./portfolio";

const GROUP_NAMES: Record<Bucket, string> = { stocks: "Stocks", bonds: "Bonds", cash: "Cash", other: "Other" };

/** Plain ASCII money text, so the PDF's built-in font can always draw it. */
export function pdfMoney(value: number, currency: string): string {
  const sign = value < 0 ? "-" : "";
  const number = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(value));
  return `${currency} ${sign}${number}`;
}

export type ReportData = {
  title: string;
  sourceLabel: string;
  generatedOn: string;
  currency: string;
  accounts: { name: string; institution: string; cash: string; synced: string }[];
  cashToday: string;
  moneyIn: { total: string; dividends: string; interest: string; deposits: string; sales: string };
  moneyOut: { total: string; purchases: string; withdrawals: string; fees: string };
  summary: string;
  cashNote: string;
  example: string;
  groups: { group: string; now: string; target: string; after: string; buy: string }[];
  holdings: { symbol: string; name: string; group: string; value: string }[];
  targetsAddUp: boolean;
  otherCurrencies: { currency: string; cash: string; change: string }[];
  notes: string[];
};

function dateText(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "unknown" : date.toISOString().slice(0, 16).replace("T", " ") + " UTC";
}

/** Everything the PDF says, as plain data. Kept separate from drawing so it can be tested. */
export function buildReportData(
  portfolio: PortfolioSnapshot,
  currency: string,
  targets: Record<Bucket, number>,
  rate: number,
  now = new Date(),
): ReportData {
  const summaries = cashByCurrency(portfolio);
  const active = summaries.find((row) => row.currency === currency) ?? { currency, currentCash: 0, inflows30d: 0, outflows30d: 0, net30d: 0, cashThen: 0, dividends: 0, interest: 0, contributions: 0, sales: 0, purchases: 0, withdrawals: 0, fees: 0 };
  const values = bucketValues(portfolio, currency);
  const rows = simulateBuyOnly(values, targets);
  const total = rows.reduce((sum, row) => sum + row.currentValue, 0);
  const pct = (value: number) => `${value.toFixed(1)}%`;
  const targetTotal = Object.values(targets).reduce((sum, value) => sum + value, 0);

  return {
    title: "Cash Check summary",
    sourceLabel: portfolio.source === "demo" ? "Demo data (made up, not a real account)" : "Read from your accounts through SnapTrade (read-only)",
    generatedOn: now.toISOString().slice(0, 16).replace("T", " ") + " UTC",
    currency,
    accounts: portfolio.accounts
      .filter((account) => account.cash.some((cash) => cash.currency === currency))
      .map((account) => ({
        name: account.name,
        institution: account.institution,
        cash: pdfMoney(account.cash.filter((cash) => cash.currency === currency).reduce((sum, cash) => sum + cash.amount, 0), currency),
        synced: account.syncing ? "still syncing" : dateText(account.lastSyncedAt),
      })),
    cashToday: pdfMoney(active.currentCash, currency),
    moneyIn: {
      total: pdfMoney(active.inflows30d, currency),
      dividends: pdfMoney(active.dividends, currency),
      interest: pdfMoney(active.interest, currency),
      deposits: pdfMoney(active.contributions, currency),
      sales: pdfMoney(active.sales, currency),
    },
    moneyOut: {
      total: pdfMoney(active.outflows30d, currency),
      purchases: pdfMoney(active.purchases, currency),
      withdrawals: pdfMoney(active.withdrawals, currency),
      fees: pdfMoney(active.fees, currency),
    },
    summary: `In the last 30 days, ${pdfMoney(active.inflows30d, currency)} came in and ${pdfMoney(active.outflows30d, currency)} went out. Your cash ${active.net30d >= 0 ? "grew" : "shrank"} by ${pdfMoney(Math.abs(active.net30d), currency)}, to ${pdfMoney(active.currentCash, currency)} today.`,
    cashNote: cashThenNote(pdfMoney(active.cashThen, currency), ignoredSummary(portfolio.ignoredActivities ?? 0, portfolio.ignoredTypes)),
    example: `If this cash earned ${rate}% a year, that would be about ${pdfMoney(hypotheticalAnnualEarnings(active.currentCash, rate), currency)}. Just an example, not a prediction or advice.`,
    groups: rows.map((row) => ({
      group: GROUP_NAMES[row.bucket],
      now: total ? pct(row.currentPercent) : "n/a",
      target: pct(row.targetPercent),
      after: total ? pct(row.simulatedPercent) : "n/a",
      buy: row.buyAmount > 0 ? pdfMoney(row.buyAmount, currency) : "none",
    })),
    holdings: portfolio.holdings
      .filter((holding) => holding.currency === currency)
      .map((holding) => ({ symbol: holding.symbol, name: holding.name, group: GROUP_NAMES[holding.bucket], value: pdfMoney(holding.value, currency) })),
    targetsAddUp: Math.abs(targetTotal - 100) <= 0.001,
    otherCurrencies: summaries
      .filter((row) => row.currency !== currency)
      .map((row) => ({ currency: row.currency, cash: pdfMoney(row.currentCash, row.currency), change: `${row.net30d >= 0 ? "up" : "down"} ${pdfMoney(Math.abs(row.net30d), row.currency)}` })),
    notes: [
      "Read-only snapshot. Cash Check does not buy, sell or move anything.",
      "The what-if only uses as much cash as it takes to bring your smallest groups closer to your targets. Nothing is sold.",
      "Each currency is shown on its own and is never converted.",
      "Not investment advice.",
      "This file was made in your browser. Cash Check does not save your balances, and nothing was uploaded.",
    ],
  };
}

export function reportFileName(now = new Date()): string {
  return `cash-check-summary-${now.toISOString().slice(0, 10)}.pdf`;
}

/** Draws the report with pdf-lib. Loaded only when someone presses Download. */
export async function renderReportPdf(data: ReportData): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.create();
  doc.setTitle(data.title);
  doc.setAuthor("Cash Check");
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const W = 612, H = 792, M = 48, CONTENT = W - M * 2;
  const ink = rgb(0.075, 0.169, 0.153), muted = rgb(0.41, 0.455, 0.435), acid = rgb(0.851, 1, 0.439), line = rgb(0.85, 0.85, 0.8);
  let page = doc.addPage([W, H]);
  let y = H - M;

  const ensure = (height: number) => {
    if (y - height < M + 24) { page = doc.addPage([W, H]); y = H - M; }
  };
  const wrap = (text: string, font: typeof regular, size: number, width: number): string[] => {
    const lines: string[] = [];
    let current = "";
    for (const word of text.split(/\s+/)) {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > width && current) { lines.push(current); current = word; } else current = test;
    }
    if (current) lines.push(current);
    return lines;
  };
  const paragraph = (text: string, size = 10.5, font = regular, color = ink, width = CONTENT) => {
    for (const lineText of wrap(text, font, size, width)) {
      ensure(size + 5);
      page.drawText(lineText, { x: M, y: y - size, size, font, color });
      y -= size + 5;
    }
  };
  const heading = (text: string) => {
    ensure(84);
    y -= 14;
    page.drawText(text.toUpperCase(), { x: M, y: y - 9, size: 9, font: mono, color: muted });
    y -= 20;
  };
  const table = (columns: { label: string; width: number; right?: boolean }[], rows: string[][]) => {
    const size = 9.5;
    ensure(24);
    page.drawRectangle({ x: M, y: y - 18, width: CONTENT, height: 18, color: ink });
    let x = M + 6;
    columns.forEach((column) => {
      const textWidth = bold.widthOfTextAtSize(column.label, 8.5);
      page.drawText(column.label, { x: column.right ? x + column.width - 12 - textWidth : x, y: y - 12.5, size: 8.5, font: bold, color: rgb(1, 1, 1) });
      x += column.width;
    });
    y -= 18;
    for (const row of rows) {
      const cells = row.map((cell, index) => wrap(cell, regular, size, columns[index].width - 12));
      const lines = Math.max(...cells.map((cell) => cell.length));
      const height = lines * 12 + 8;
      ensure(height);
      x = M + 6;
      cells.forEach((cell, index) => {
        cell.forEach((cellLine, lineIndex) => {
          const textWidth = regular.widthOfTextAtSize(cellLine, size);
          const column = columns[index];
          page.drawText(cellLine, { x: column.right ? x + column.width - 12 - textWidth : x, y: y - 14 - lineIndex * 12, size, font: regular, color: ink });
        });
        x += columns[index].width;
      });
      y -= height;
      page.drawLine({ start: { x: M, y }, end: { x: M + CONTENT, y }, thickness: 0.5, color: line });
    }
  };

  // title strip
  page.drawRectangle({ x: 0, y: H - 96, width: W, height: 96, color: acid });
  page.drawText("CASH CHECK", { x: M, y: H - 38, size: 9, font: mono, color: ink });
  page.drawText(data.title, { x: M, y: H - 68, size: 24, font: bold, color: ink });
  y = H - 96 - 16;
  paragraph(`Made ${data.generatedOn}`, 9.5, regular, muted);
  paragraph(`Source: ${data.sourceLabel}`, 9.5, regular, muted);
  paragraph(`Currency shown: ${data.currency}`, 9.5, regular, muted);

  heading("Your cash today");
  paragraph(data.cashToday, 26, bold);
  y -= 4;
  table(
    [{ label: "Account", width: 190 }, { label: "Where", width: 140 }, { label: "Cash", width: 100, right: true }, { label: "Last synced", width: 68 }],
    data.accounts.map((account) => [account.name, account.institution, account.cash, account.synced]),
  );

  heading("Money in and out over the last 30 days");
  paragraph(data.summary);
  y -= 4;
  table(
    [{ label: "Came in", width: 102 }, { label: "Dividends", width: 102, right: true }, { label: "Interest", width: 96, right: true }, { label: "Deposits", width: 102, right: true }, { label: "Sales", width: 96, right: true }],
    [["Total " + data.moneyIn.total.replace(/^[A-Z]{3} /, ""), data.moneyIn.dividends, data.moneyIn.interest, data.moneyIn.deposits, data.moneyIn.sales]],
  );
  y -= 8;
  table(
    [{ label: "Went out", width: 102 }, { label: "Purchases", width: 150, right: true }, { label: "Withdrawals", width: 150, right: true }, { label: "Fees and taxes", width: 96, right: true }],
    [["Total " + data.moneyOut.total.replace(/^[A-Z]{3} /, ""), data.moneyOut.purchases, data.moneyOut.withdrawals, data.moneyOut.fees]],
  );
  y -= 10;
  paragraph(data.cashNote, 10, regular, muted);
  y -= 2;
  paragraph(data.example, 10, regular, muted);

  heading("A what-if: investing some of the cash");
  if (!data.targetsAddUp) paragraph("Your targets do not add up to 100%, so no purchase is shown.", 10, bold);
  table(
    [{ label: "Group", width: 100 }, { label: "Now", width: 100, right: true }, { label: "Your target", width: 110, right: true }, { label: "After investing", width: 112, right: true }, { label: "Cash used", width: 78, right: true }],
    data.groups.map((group) => [group.group, group.now, group.target, group.after, group.buy]),
  );

  if (data.holdings.length) {
    heading("Holdings and the group you chose for each");
    table(
      [{ label: "Symbol", width: 70 }, { label: "Name", width: 220 }, { label: "Group", width: 70 }, { label: "Value", width: 138, right: true }],
      data.holdings.map((holding) => [holding.symbol, holding.name, holding.group, holding.value]),
    );
  }

  if (data.otherCurrencies.length) {
    heading("Other currencies (not converted)");
    table(
      [{ label: "Currency", width: 100 }, { label: "Cash today", width: 224, right: true }, { label: "Change, last 30 days", width: 144, right: true }],
      data.otherCurrencies.map((row) => [row.currency, row.cash, row.change]),
    );
  }

  heading("Good to know");
  data.notes.forEach((note) => paragraph(note, 10, regular, muted));

  doc.getPages().forEach((p, index, all) => {
    p.drawText(`Cash Check  |  page ${index + 1} of ${all.length}`, { x: M, y: 28, size: 8, font: mono, color: muted });
  });
  return doc.save();
}
