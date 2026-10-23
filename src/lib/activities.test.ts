import { describe, expect, it } from "vitest";
import { classifyActivity, isMoneyIn } from "./activities";

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
