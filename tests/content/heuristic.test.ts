import { describe, expect, it } from "vitest";
import { findHeuristicContainer, scoreElement } from "@content/heuristic";

function parse(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html");
}

describe("scoreElement", () => {
  it("scores -Infinity for a container with no paragraphs", () => {
    const doc = parse("<div><a href='/1'>1</a><a href='/2'>2</a></div>");
    expect(scoreElement(doc.querySelector("div") as Element)).toBe(-Infinity);
  });

  it("scores a paragraph-dense, low-link-density container higher than a link-dense one", () => {
    const doc = parse(`
      <div id="links"><p>x</p><a href="/1">one</a><a href="/2">two</a><a href="/3">three</a><a href="/4">four</a></div>
      <div id="content"><p>A solid paragraph of real editorial content with plenty of words in it.</p>
      <p>A second paragraph continuing the same thought with more descriptive text.</p></div>
    `);
    const linky = doc.querySelector("#links") as Element;
    const content = doc.querySelector("#content") as Element;
    expect(scoreElement(content)).toBeGreaterThan(scoreElement(linky));
  });
});

describe("findHeuristicContainer", () => {
  it("picks the highest-scoring candidate above the minimum text length", () => {
    const doc = parse(`
      <div class="links"><p>x</p><a href="/1">1</a><a href="/2">2</a><a href="/3">3</a></div>
      <div class="content">
        <p>First real paragraph with enough substantive text to clear the heuristic minimum threshold on its own.</p>
        <p>Second real paragraph continuing the thought with more descriptive sentence content for good measure.</p>
      </div>
    `);
    const best = findHeuristicContainer(doc, 140);
    expect(best?.className).toBe("content");
  });

  it("returns null when no candidate clears the minimum text length", () => {
    const doc = parse("<div><p>Too short.</p></div>");
    expect(findHeuristicContainer(doc, 140)).toBeNull();
  });
});
