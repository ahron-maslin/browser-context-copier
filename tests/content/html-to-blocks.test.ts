import { describe, expect, it } from "vitest";
import { elementToBlocks } from "@content/html-to-blocks";

function parse(html: string): HTMLElement {
  const container = document.createElement("div");
  container.innerHTML = html;
  return container;
}

describe("elementToBlocks", () => {
  it("converts headings with their level", () => {
    const blocks = elementToBlocks(parse("<h1>Title</h1><h3>Subhead</h3>"));
    expect(blocks).toEqual([
      { type: "heading", level: 1, text: "Title" },
      { type: "heading", level: 3, text: "Subhead" },
    ]);
  });

  it("converts paragraphs and preserves inline markup as html", () => {
    const blocks = elementToBlocks(parse("<p>Hello <a href='https://x.test'>link</a></p>"));
    expect(blocks).toEqual([
      { type: "paragraph", html: 'Hello <a href="https://x.test">link</a>' },
    ]);
  });

  it("skips empty paragraphs", () => {
    const blocks = elementToBlocks(parse("<p>  </p><p>Real content</p>"));
    expect(blocks).toEqual([{ type: "paragraph", html: "Real content" }]);
  });

  it("converts unordered and ordered lists", () => {
    const blocks = elementToBlocks(
      parse("<ul><li>one</li><li>two</li></ul><ol><li>first</li></ol>"),
    );
    expect(blocks).toEqual([
      { type: "list", ordered: false, items: ["one", "two"] },
      { type: "list", ordered: true, items: ["first"] },
    ]);
  });

  it("converts blockquotes to plain text", () => {
    const blocks = elementToBlocks(parse("<blockquote>  A quote.  </blockquote>"));
    expect(blocks).toEqual([{ type: "blockquote", text: "A quote." }]);
  });

  it("extracts the language from a fenced code block's class", () => {
    const blocks = elementToBlocks(
      parse('<pre><code class="language-javascript">const x = 1;</code></pre>'),
    );
    expect(blocks).toEqual([{ type: "code", language: "javascript", code: "const x = 1;" }]);
  });

  it("falls back to null language for a plain pre block", () => {
    const blocks = elementToBlocks(parse("<pre>raw text</pre>"));
    expect(blocks).toEqual([{ type: "code", language: null, code: "raw text" }]);
  });

  it("converts a table with thead/tbody into headers and rows", () => {
    const blocks = elementToBlocks(
      parse(
        "<table><thead><tr><th>Name</th><th>Price</th></tr></thead>" +
          "<tbody><tr><td>A</td><td>$1</td></tr><tr><td>B</td><td>$2</td></tr></tbody></table>",
      ),
    );
    expect(blocks).toEqual([
      {
        type: "table",
        headers: ["Name", "Price"],
        rows: [
          ["A", "$1"],
          ["B", "$2"],
        ],
      },
    ]);
  });

  it("converts an image with a figcaption", () => {
    const blocks = elementToBlocks(
      parse('<figure><img src="a.png" alt="A thing"><figcaption>Caption text</figcaption></figure>'),
    );
    expect(blocks).toEqual([
      { type: "image", src: "a.png", alt: "A thing", caption: "Caption text" },
    ]);
  });

  it("converts hr into a separator block", () => {
    const blocks = elementToBlocks(parse("<p>a</p><hr><p>b</p>"));
    expect(blocks).toEqual([
      { type: "paragraph", html: "a" },
      { type: "separator" },
      { type: "paragraph", html: "b" },
    ]);
  });

  it("recurses into generic wrapper elements like div/section", () => {
    const blocks = elementToBlocks(parse("<div><section><p>Wrapped</p></section></div>"));
    expect(blocks).toEqual([{ type: "paragraph", html: "Wrapped" }]);
  });

  it("treats an element with direct un-wrapped text as its own paragraph", () => {
    const blocks = elementToBlocks(parse("<div>Loose text <b>bold</b></div>"));
    expect(blocks).toEqual([{ type: "paragraph", html: "Loose text <b>bold</b>" }]);
  });
});
