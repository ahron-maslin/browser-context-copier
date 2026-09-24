import type { ContentBlock } from "@shared/types";

function hasDirectText(el: Element): boolean {
  return Array.from(el.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim().length > 0,
  );
}

function pushParagraph(el: Element, blocks: ContentBlock[]): void {
  const html = el.innerHTML.trim();
  if (html) blocks.push({ type: "paragraph", html });
}

function pushHeading(el: Element, blocks: ContentBlock[]): void {
  const text = (el.textContent ?? "").trim();
  if (!text) return;
  const level = Number(el.tagName[1]) as 1 | 2 | 3 | 4 | 5 | 6;
  blocks.push({ type: "heading", level, text });
}

function pushList(el: Element, blocks: ContentBlock[]): void {
  const items = Array.from(el.querySelectorAll(":scope > li"))
    .map((li) => (li.textContent ?? "").trim())
    .filter((text) => text.length > 0);
  if (items.length) blocks.push({ type: "list", ordered: el.tagName === "OL", items });
}

function pushBlockquote(el: Element, blocks: ContentBlock[]): void {
  const text = (el.textContent ?? "").trim();
  if (text) blocks.push({ type: "blockquote", text });
}

function pushCode(el: Element, blocks: ContentBlock[]): void {
  const codeEl = el.querySelector("code");
  const source = codeEl ?? el;
  const langMatch = codeEl?.className.match(/language-(\S+)/);
  blocks.push({
    type: "code",
    language: langMatch ? (langMatch[1] ?? null) : null,
    code: source.textContent ?? "",
  });
}

function pushTable(el: Element, blocks: ContentBlock[]): void {
  const headerRow = el.querySelector("thead tr");
  const headers = headerRow
    ? Array.from(headerRow.children).map((cell) => (cell.textContent ?? "").trim())
    : [];
  const bodyRowEls = el.querySelectorAll("tbody tr").length
    ? Array.from(el.querySelectorAll("tbody tr"))
    : Array.from(el.querySelectorAll("tr")).filter((row) => row !== headerRow);
  const rows = bodyRowEls.map((row) =>
    Array.from(row.children).map((cell) => (cell.textContent ?? "").trim()),
  );
  blocks.push({ type: "table", headers, rows });
}

function pushImageFromFigure(el: Element, blocks: ContentBlock[]): void {
  const img = el.querySelector("img");
  if (!img) return;
  const captionEl = el.querySelector("figcaption");
  const caption = captionEl ? (captionEl.textContent ?? "").trim() || null : null;
  blocks.push({
    type: "image",
    src: img.getAttribute("src") ?? "",
    alt: img.getAttribute("alt") ?? "",
    caption,
  });
}

function pushImage(el: Element, blocks: ContentBlock[]): void {
  blocks.push({
    type: "image",
    src: el.getAttribute("src") ?? "",
    alt: el.getAttribute("alt") ?? "",
    caption: null,
  });
}

function walk(el: Element, blocks: ContentBlock[]): void {
  switch (el.tagName) {
    case "H1":
    case "H2":
    case "H3":
    case "H4":
    case "H5":
    case "H6":
      pushHeading(el, blocks);
      return;
    case "P":
      pushParagraph(el, blocks);
      return;
    case "UL":
    case "OL":
      pushList(el, blocks);
      return;
    case "BLOCKQUOTE":
      pushBlockquote(el, blocks);
      return;
    case "PRE":
      pushCode(el, blocks);
      return;
    case "TABLE":
      pushTable(el, blocks);
      return;
    case "FIGURE":
      pushImageFromFigure(el, blocks);
      return;
    case "IMG":
      pushImage(el, blocks);
      return;
    case "HR":
      blocks.push({ type: "separator" });
      return;
    default:
      if (hasDirectText(el)) {
        pushParagraph(el, blocks);
        return;
      }
      for (const child of Array.from(el.children)) {
        walk(child, blocks);
      }
  }
}

export function elementToBlocks(root: Element): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  for (const child of Array.from(root.children)) {
    walk(child, blocks);
  }
  return blocks;
}
