import { afterEach, describe, expect, it } from "vitest";
import { selectionToBlocks } from "@content/selection";

afterEach(() => {
  document.body.innerHTML = "";
  window.getSelection()?.removeAllRanges();
});

describe("selectionToBlocks", () => {
  it("returns null when there is no selection", () => {
    document.body.innerHTML = "<p>Some text</p>";
    expect(selectionToBlocks(document)).toBeNull();
  });

  it("converts a selection spanning whole block elements into blocks", () => {
    document.body.innerHTML = "<p>First paragraph.</p><p>Second paragraph.</p>";
    const [p1, p2] = Array.from(document.querySelectorAll("p"));
    const range = document.createRange();
    range.setStartBefore(p1 as Node);
    range.setEndAfter(p2 as Node);
    window.getSelection()?.addRange(range);

    expect(selectionToBlocks(document)).toEqual([
      { type: "paragraph", html: "First paragraph." },
      { type: "paragraph", html: "Second paragraph." },
    ]);
  });

  it("wraps a plain inline text selection as a single paragraph", () => {
    document.body.innerHTML = "<p>Hello wonderful world</p>";
    const textNode = document.querySelector("p")?.firstChild as Text;
    const range = document.createRange();
    range.setStart(textNode, 6);
    range.setEnd(textNode, 15);
    window.getSelection()?.addRange(range);

    expect(selectionToBlocks(document)).toEqual([{ type: "paragraph", html: "wonderful" }]);
  });
});
