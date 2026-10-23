import { describe, expect, it } from "vitest";
import { isSameOrigin, MAX_NOTE, parseEventName, parseFeedback, parseNote } from "./feedback";

describe("parseEventName", () => {
  it("accepts only the events we count", () => {
    expect(parseEventName("pdf_downloaded")).toBe("pdf_downloaded");
    expect(parseEventName("drop table")).toBeNull();
    expect(parseEventName(42)).toBeNull();
  });
});

describe("parseFeedback", () => {
  it("accepts a yes or no with where it came from", () => {
    expect(parseFeedback({ useful: true, source: "demo" })).toEqual({ useful: true, source: "demo", note: null });
  });

  it("tidies and shortens the note", () => {
    const parsed = parseFeedback({ useful: false, source: "live", note: `  too   many\nnumbers ${"x".repeat(500)} ` });
    expect(parsed?.note?.startsWith("too many numbers")).toBe(true);
    expect(parsed?.note?.length).toBeLessThanOrEqual(MAX_NOTE);
  });

  it("rejects anything else", () => {
    expect(parseFeedback(null)).toBeNull();
    expect(parseFeedback({ useful: "yes", source: "demo" })).toBeNull();
    expect(parseFeedback({ useful: true, source: "other" })).toBeNull();
    expect(parseFeedback({ useful: true, source: "demo", note: 5 })).toBeNull();
  });
});

describe("isSameOrigin", () => {
  it("accepts our own origin and rejects the rest", () => {
    expect(isSameOrigin("https://cash-check.test", "https://cash-check.test")).toBe(true);
    expect(isSameOrigin("https://evil.test", "https://cash-check.test")).toBe(false);
    expect(isSameOrigin(null, "https://cash-check.test")).toBe(false);
    expect(isSameOrigin("not a url", "https://cash-check.test")).toBe(false);
  });
});

describe("parseNote", () => {
  const token = "123e4567-e89b-12d3-a456-426614174000";
  it("needs the private token and a real note", () => {
    expect(parseNote({ token, note: "  more   detail " })).toEqual({ token, note: "more detail" });
    expect(parseNote({ token: "1", note: "hi" })).toBeNull();
    expect(parseNote({ token, note: "   " })).toBeNull();
    expect(parseNote({ note: "hi" })).toBeNull();
  });
});
