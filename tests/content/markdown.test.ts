import { describe, expect, it } from "vitest";
import { blocksToMarkdown } from "@content/markdown";
import type { ContentBlock } from "@shared/types";

function md(blocks: ContentBlock[]): string {
  return blocksToMarkdown(blocks, { preserveLinks: true, includeImageDescriptions: true });
}

describe("blocksToMarkdown", () => {
  it("renders headings with the right number of #s", () => {
    expect(
      md([
        { type: "heading", level: 1, text: "Title" },
        { type: "heading", level: 3, text: "Sub" },
      ]),
    ).toBe("# Title\n\n### Sub");
  });

  it("converts inline links, bold, italic, and code in paragraphs to markdown", () => {
    expect(
      md([
        {
          type: "paragraph",
          html: 'See <a href="https://x.test">the docs</a> and <strong>this</strong>, <em>that</em>, <code>x = 1</code>.',
        },
      ]),
    ).toBe("See [the docs](https://x.test) and **this**, _that_, `x = 1`.");
  });

  it("drops link markup when preserveLinks is false, keeping the text", () => {
    expect(
      blocksToMarkdown(
        [{ type: "paragraph", html: 'Read <a href="https://x.test">this</a>.' }],
        { preserveLinks: false, includeImageDescriptions: true },
      ),
    ).toBe("Read this.");
  });

  it("renders unordered and ordered lists", () => {
    expect(
      md([
        { type: "list", ordered: false, items: ["one", "two"] },
        { type: "list", ordered: true, items: ["first", "second"] },
      ]),
    ).toBe("- one\n- two\n\n1. first\n2. second");
  });

  it("renders blockquotes with a > prefix on every line", () => {
    expect(md([{ type: "blockquote", text: "Line one\nLine two" }])).toBe(
      "> Line one\n> Line two",
    );
  });

  it("renders fenced code blocks with the language tag", () => {
    expect(md([{ type: "code", language: "javascript", code: "const x = 1;" }])).toBe(
      "```javascript\nconst x = 1;\n```",
    );
  });

  it("renders fenced code blocks with no language tag when unknown", () => {
    expect(md([{ type: "code", language: null, code: "raw" }])).toBe("```\nraw\n```");
  });

  it("renders a markdown table with a header separator row", () => {
    expect(
      md([
        {
          type: "table",
          headers: ["Name", "Price"],
          rows: [
            ["A", "$1"],
            ["B", "$2"],
          ],
        },
      ]),
    ).toBe("| Name | Price |\n| --- | --- |\n| A | $1 |\n| B | $2 |");
  });

  it("renders images as compact text by default, with caption when present", () => {
    expect(md([{ type: "image", src: "a.png", alt: "A thing", caption: "A caption" }])).toBe(
      "Image: A thing\nCaption: A caption",
    );
  });

  it("omits images entirely when includeImageDescriptions is false", () => {
    expect(
      blocksToMarkdown([{ type: "image", src: "a.png", alt: "A thing", caption: null }], {
        preserveLinks: true,
        includeImageDescriptions: false,
      }),
    ).toBe("");
  });

  it("renders a separator as a thematic break", () => {
    expect(md([{ type: "paragraph", html: "a" }, { type: "separator" }, { type: "paragraph", html: "b" }])).toBe(
      "a\n\n---\n\nb",
    );
  });

  it("joins multiple blocks with a blank line between them", () => {
    expect(
      md([
        { type: "heading", level: 2, text: "H" },
        { type: "paragraph", html: "para" },
      ]),
    ).toBe("## H\n\npara");
  });
});
