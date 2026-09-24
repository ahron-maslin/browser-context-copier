import { describe, expect, it } from "vitest";
import { extractPage } from "@content/extractor";

function parseDocument(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

const ARTICLE_PARAGRAPHS = Array.from(
  { length: 6 },
  (_, i) =>
    `<p>This is paragraph number ${i + 1} of a long article about testing extraction pipelines. It contains enough descriptive text, with commas, periods, and general sentence structure, to resemble real editorial writing that a readability algorithm would recognize as genuine article content rather than boilerplate navigation.</p>`,
).join("\n");

const ARTICLE_HTML = `<!DOCTYPE html><html><head><title>Deep Dive Into Testing</title>
<meta name="author" content="Jane Doe">
<meta name="description" content="An article about testing.">
</head><body>
<nav><a href="/">Home</a><a href="/about">About</a></nav>
<header><h1>Site Header</h1></header>
<article>
<h1>Deep Dive Into Testing</h1>
${ARTICLE_PARAGRAPHS}
</article>
<aside class="sidebar"><p>Related links and ads go here.</p></aside>
<footer>Copyright 2026</footer>
</body></html>`;

const SHORT_MAIN_HTML = `<!DOCTYPE html><html><head><title>Short Page</title></head><body>
<nav><a href="/">Home</a></nav>
<main><h1>Quick Note</h1><p>Just a short note here, enough to pass the check.</p></main>
<footer>Footer text</footer>
</body></html>`;

const NO_STRUCTURE_HTML = `<!DOCTYPE html><html><head><title>Bare Page</title></head>
<body>Just some raw text sitting directly in the body, with no article, main, div, or paragraph tags around it at all.</body></html>`;

describe("extractPage", () => {
  it("uses Readability when there is a substantial article", () => {
    const doc = parseDocument(ARTICLE_HTML);
    const result = extractPage(doc, "https://example.com/article");

    expect(result.extractionMethod).toBe("readability");
    expect(result.title).toContain("Deep Dive");
    expect(result.author).toBe("Jane Doe");
    expect(result.hostname).toBe("example.com");

    const paragraphCount = result.blocks.filter((b) => b.type === "paragraph").length;
    expect(paragraphCount).toBeGreaterThanOrEqual(5);

    const allText = JSON.stringify(result.blocks);
    expect(allText).not.toContain("Copyright 2026");
    expect(allText).not.toContain("Related links and ads");
  });

  it("falls back to the semantic <main> element when there isn't enough content for Readability", () => {
    const doc = parseDocument(SHORT_MAIN_HTML);
    const result = extractPage(doc, "https://example.com/note");

    expect(result.extractionMethod).toBe("semantic");
    expect(result.blocks).toContainEqual({
      type: "paragraph",
      html: "Just a short note here, enough to pass the check.",
    });
  });

  it("falls back to cleaned body text when nothing else matches", () => {
    const doc = parseDocument(NO_STRUCTURE_HTML);
    const result = extractPage(doc, "https://example.com/bare");

    expect(result.extractionMethod).toBe("fallback");
    expect(result.blocks.length).toBeGreaterThan(0);
    const allText = JSON.stringify(result.blocks);
    expect(allText).toContain("Just some raw text");
  });
});
