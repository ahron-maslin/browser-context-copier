import { describe, expect, it } from "vitest";
import {
  AI_CONTEXT_CLOSING_NOTE,
  AI_CONTEXT_NOTE,
  closingNote,
  closingNoteHtml,
  pageHeader,
  pageHeaderHtml,
  selectionHeader,
  selectionHeaderHtml,
} from "@content/header";
import { DEFAULT_SETTINGS } from "@shared/types";
import type { PageContext } from "@shared/types";

const page: PageContext = {
  title: "Some Article",
  url: "https://example.com/a",
  hostname: "example.com",
  description: null,
  author: "Jane Doe",
  publishedDate: "2026-01-01",
  blocks: [],
  extractionMethod: "readability",
  timestamp: 0,
};

describe("pageHeader", () => {
  it("leads with the AI context note, then title/source/metadata, in markdown", () => {
    const result = pageHeader(page, DEFAULT_SETTINGS, true);
    expect(result).toBe(
      [
        `[${AI_CONTEXT_NOTE}]`,
        "",
        "# Some Article",
        "",
        "Source: https://example.com/a",
        "Author: Jane Doe",
        "Published: 2026-01-01",
        "",
        "---",
      ].join("\n"),
    );
  });

  it("omits url/metadata lines per settings, in plain text", () => {
    const result = pageHeader(
      page,
      { ...DEFAULT_SETTINGS, includeUrl: false, includeMetadata: false },
      false,
    );
    expect(result).toBe([AI_CONTEXT_NOTE, "", "Some Article", "", "", "----------"].join("\n"));
  });
});

describe("pageHeaderHtml", () => {
  it("includes the context note as its own paragraph before the title", () => {
    const result = pageHeaderHtml(page, DEFAULT_SETTINGS);
    expect(result.startsWith(`<p><em>${AI_CONTEXT_NOTE}</em></p><h1>Some Article</h1>`)).toBe(true);
    expect(result).toContain("Author: Jane Doe");
    expect(result.endsWith("<hr>")).toBe(true);
  });
});

describe("selectionHeader", () => {
  it("includes the context note and the source url", () => {
    expect(selectionHeader("https://example.com/a", true)).toBe(
      `[${AI_CONTEXT_NOTE}]\n\nSource: https://example.com/a\n\n---`,
    );
  });
});

describe("selectionHeaderHtml", () => {
  it("includes the context note and a linked source url", () => {
    expect(selectionHeaderHtml("https://example.com/a")).toBe(
      `<p><em>${AI_CONTEXT_NOTE}</em></p><p>Source: <a href="https://example.com/a">https://example.com/a</a></p><hr>`,
    );
  });
});

describe("closingNote", () => {
  it("brackets the note in markdown", () => {
    expect(closingNote(true)).toBe(`[${AI_CONTEXT_CLOSING_NOTE}]`);
  });

  it("leaves the note unbracketed in plain text", () => {
    expect(closingNote(false)).toBe(AI_CONTEXT_CLOSING_NOTE);
  });
});

describe("closingNoteHtml", () => {
  it("renders as its own emphasized paragraph", () => {
    expect(closingNoteHtml()).toBe(`<p><em>${AI_CONTEXT_CLOSING_NOTE}</em></p>`);
  });
});
