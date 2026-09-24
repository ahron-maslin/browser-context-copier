import { describe, expect, it } from "vitest";
import { blocksToHtml } from "@content/html-output";
import type { ContentBlock } from "@shared/types";

function html(blocks: ContentBlock[]): string {
  return blocksToHtml(blocks, { preserveLinks: true, includeImageDescriptions: true });
}

describe("blocksToHtml", () => {
  it("renders headings with the matching heading level", () => {
    expect(html([{ type: "heading", level: 2, text: "Sub" }])).toBe("<h2>Sub</h2>");
  });

  it("renders paragraphs with clean semantic inline tags, escaping text", () => {
    expect(
      html([
        {
          type: "paragraph",
          html: 'See <a href="https://x.test">the docs</a> & <strong>this</strong>.',
        },
      ]),
    ).toBe('<p>See <a href="https://x.test">the docs</a> &amp; <strong>this</strong>.</p>');
  });

  it("strips link tags but keeps text when preserveLinks is false", () => {
    expect(
      blocksToHtml([{ type: "paragraph", html: 'Read <a href="https://x.test">this</a>.' }], {
        preserveLinks: false,
        includeImageDescriptions: true,
      }),
    ).toBe("<p>Read this.</p>");
  });

  it("renders lists as real ul/ol elements", () => {
    expect(html([{ type: "list", ordered: true, items: ["a", "b"] }])).toBe(
      "<ol><li>a</li><li>b</li></ol>",
    );
  });

  it("renders a table with th/td cells", () => {
    expect(
      html([
        {
          type: "table",
          headers: ["Name"],
          rows: [["A"]],
        },
      ]),
    ).toBe("<table><tr><th>Name</th></tr><tr><td>A</td></tr></table>");
  });

  it("omits images when includeImageDescriptions is false", () => {
    expect(
      blocksToHtml([{ type: "image", src: "a.png", alt: "A", caption: null }], {
        preserveLinks: true,
        includeImageDescriptions: false,
      }),
    ).toBe("");
  });

  it("renders a separator as an hr", () => {
    expect(html([{ type: "separator" }])).toBe("<hr>");
  });
});
