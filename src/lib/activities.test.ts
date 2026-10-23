import { describe, expect, it } from "vitest";
import { cashThenNote, classifyActivity, ignoredSummary, isMoneyIn } from "./activities";

describe("classifyActivity", () => {
  it("sorts SnapTrade activity types into money in and money out", () => {
    expect(classifyActivity("DIVIDEND")).toBe("dividend");
    expect(classifyActivity("substitute_dividend")).toBe("dividend");
    expect(classifyActivity("INTEREST")).toBe("interest");
    expect(classifyActivity("CONTRIBUTION")).toBe("contribution");
    expect(classifyActivity("SELL")).toBe("sale");
    expect(classifyActivity("BUY")).toBe("purchase");
    expect(classifyActivity("REI")).toBe("purchase");
    expect(classifyActivity("WITHDRAWAL")).toBe("withdrawal");
    expect(classifyActivity("FEE")).toBe("fee");
    expect(classifyActivity("TAX")).toBe("fee");
  });

  it("leaves out kinds we do not count, so they are never guessed", () => {
    for (const type of ["TRANSFER", "SPLIT", "OPTIONEXPIRATION", "STOCK_DIVIDEND", ""]) expect(classifyActivity(type)).toBeNull();
  });

  it("knows which direction each kind moves cash", () => {
    expect(isMoneyIn("sale")).toBe(true);
    expect(isMoneyIn("dividend")).toBe(true);
    expect(isMoneyIn("purchase")).toBe(false);
    expect(isMoneyIn("fee")).toBe(false);
  });
});

describe("notes about skipped activity", () => {
  it("says nothing when nothing was skipped", () => {
    expect(ignoredSummary(0)).toBeNull();
  });

  it("names the biggest skipped kinds in plain words", () => {
    expect(ignoredSummary(11, { OPTIONEXPIRATION: 2, TRANSFER: 9 })).toBe("11 other items are not counted (9 transfer, 2 optionexpiration).");
    expect(ignoredSummary(1, { SPLIT: 1 })).toBe("1 other item is not counted (1 split).");
  });

  it("calls the cash 30 days ago a rough guess when anything was skipped", () => {
    expect(cashThenNote("$100.00", null)).toContain("Cash was about $100.00 30 days ago");
    const guess = cashThenNote("$100.00", "2 other items are not counted.");
    expect(guess).toContain("Rough guess");
    expect(guess).toContain("Treat this as a guess");
  });
});
