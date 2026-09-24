import { describe, expect, it } from "vitest";
import { normalizeWhitespace } from "@shared/utils";

describe("normalizeWhitespace", () => {
  it("collapses runs of 3+ blank lines down to a single blank line", () => {
    expect(normalizeWhitespace("a\n\n\n\n\nb")).toBe("a\n\nb");
  });

  it("trims trailing whitespace from each line", () => {
    expect(normalizeWhitespace("a   \nb\t\n")).toBe("a\nb");
  });

  it("trims leading and trailing blank lines from the whole string", () => {
    expect(normalizeWhitespace("\n\n  hello  \n\n")).toBe("hello");
  });

  it("leaves single blank lines between paragraphs untouched", () => {
    expect(normalizeWhitespace("para one\n\npara two")).toBe("para one\n\npara two");
  });
});
