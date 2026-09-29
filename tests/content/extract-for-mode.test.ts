import { afterEach, describe, expect, it } from "vitest";
import { extractForMode } from "@content/extract-for-mode";
import { DEFAULT_SETTINGS } from "@shared/types";

const MAIN_HTML =
  "<main><h1>Quick Note</h1><p>Just a short note here, enough to pass the check.</p></main>";

afterEach(() => {
  document.body.innerHTML = "";
  window.getSelection()?.removeAllRanges();
});

function selectWholeParagraph(): void {
  document.body.innerHTML = MAIN_HTML;
  const p = document.querySelector("p") as Node;
  const range = document.createRange();
  range.selectNodeContents(p);
  window.getSelection()?.addRange(range);
}

describe("extractForMode", () => {
  it("extracts the full page when mode is 'page' and nothing is selected", () => {
    document.body.innerHTML = MAIN_HTML;
    const result = extractForMode("page", DEFAULT_SETTINGS);
    expect(result?.effectiveMode).toBe("page");
    expect(result?.blocks).toContainEqual({
      type: "paragraph",
      html: "Just a short note here, enough to pass the check.",
    });
  });

  it("prefers an active selection over the full page when mode is 'page'", () => {
    selectWholeParagraph();
    const result = extractForMode("page", DEFAULT_SETTINGS);
    expect(result?.effectiveMode).toBe("selection");
    expect(result?.blocks).toEqual([
      { type: "paragraph", html: "Just a short note here, enough to pass the check." },
    ]);
  });

  it("extracts the selection when mode is explicitly 'selection'", () => {
    selectWholeParagraph();
    const result = extractForMode("selection", DEFAULT_SETTINGS);
    expect(result?.effectiveMode).toBe("selection");
  });

  it("returns null when mode is 'selection' but nothing is selected", () => {
    document.body.innerHTML = MAIN_HTML;
    expect(extractForMode("selection", DEFAULT_SETTINGS)).toBeNull();
  });
});
