import { describe, expect, it } from "vitest";
import { blocksToPlainText } from "@content/plain-text";
import type { ContentBlock } from "@shared/types";

function plain(blocks: ContentBlock[]): string {
  return blocksToPlainText(blocks, { preserveLinks: true, includeImageDescriptions: true });
}

describe("blocksToPlainText", () => {
  it("renders headings as plain text with no # decoration", () => {
    expect(plain([{ type: "heading", level: 2, text: "Sub" }])).toBe("Sub");
  });

  it("renders paragraphs with bold/italic/code stripped but links kept as trailing urls", () => {
    expect(
      plain([
        {
          type: "paragraph",
          html: 'See <a href="https://x.test">the docs</a> and <strong>this</strong>, <code>x = 1</code>.',
        },
      ]),
    ).toBe("See the docs (https://x.test) and this, x = 1.");
  });

  it("drops the trailing url when preserveLinks is false", () => {
    expect(
      blocksToPlainText([{ type: "paragraph", html: 'Read <a href="https://x.test">this</a>.' }], {
        preserveLinks: false,
        includeImageDescriptions: true,
      }),
    ).toBe("Read this.");
  });

  it("renders lists with plain bullet markers", () => {
    expect(plain([{ type: "list", ordered: false, items: ["one", "two"] }])).toBe("- one\n- two");
  });

  it("renders blockquotes with no > prefix", () => {
    expect(plain([{ type: "blockquote", text: "Line one\nLine two" }])).toBe("Line one\nLine two");
  });

  it("renders code blocks with no fences", () => {
    expect(plain([{ type: "code", language: "javascript", code: "const x = 1;" }])).toBe(
      "const x = 1;",
    );
  });

  it("renders a table as readable key: value lines per row", () => {
    expect(
      plain([
        {
          type: "table",
          headers: ["Name", "Price"],
          rows: [
            ["A", "$1"],
            ["B", "$2"],
          ],
        },
      ]),
    ).toBe("Name: A, Price: $1\nName: B, Price: $2");
  });

  it("omits images when includeImageDescriptions is false", () => {
    expect(
      blocksToPlainText([{ type: "image", src: "a.png", alt: "A", caption: null }], {
        preserveLinks: true,
        includeImageDescriptions: false,
      }),
    ).toBe("");
  });
});
