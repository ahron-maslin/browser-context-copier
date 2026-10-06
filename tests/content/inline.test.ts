import { describe, expect, it } from "vitest";
import { parseInline } from "@content/inline";

describe("parseInline", () => {
  it("keeps a real href on a link token", () => {
    expect(parseInline('<a href="https://x.test">text</a>')).toEqual([
      { kind: "link", href: "https://x.test", children: [{ kind: "text", text: "text" }] },
    ]);
  });

  it("strips same-page fragment-only hrefs (citation markers, jump links)", () => {
    expect(parseInline('<a href="#cite_note-1">[1]</a>')).toEqual([
      { kind: "link", href: "", children: [{ kind: "text", text: "[1]" }] },
    ]);
  });

  it("strips a bare # href the same way", () => {
    expect(parseInline('<a href="#">top</a>')).toEqual([
      { kind: "link", href: "", children: [{ kind: "text", text: "top" }] },
    ]);
  });
});
