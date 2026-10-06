export type InlineToken =
  | { kind: "text"; text: string }
  | { kind: "bold"; children: InlineToken[] }
  | { kind: "italic"; children: InlineToken[] }
  | { kind: "code"; text: string }
  | { kind: "link"; href: string; children: InlineToken[] }
  | { kind: "break" };

function parseInlineNodes(nodes: NodeListOf<ChildNode>): InlineToken[] {
  const tokens: InlineToken[] = [];
  for (const node of Array.from(nodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? "";
      if (text) tokens.push({ kind: "text", text });
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as Element;
    switch (el.tagName) {
      case "BR":
        tokens.push({ kind: "break" });
        break;
      case "STRONG":
      case "B":
        tokens.push({ kind: "bold", children: parseInlineNodes(el.childNodes) });
        break;
      case "EM":
      case "I":
        tokens.push({ kind: "italic", children: parseInlineNodes(el.childNodes) });
        break;
      case "CODE":
        tokens.push({ kind: "code", text: el.textContent ?? "" });
        break;
      case "A": {
        const rawHref = el.getAttribute("href") ?? "";
        // A same-page fragment link (citation markers, "back to top") points
        // nowhere once this content is pasted elsewhere - render as plain text.
        const href = rawHref.startsWith("#") ? "" : rawHref;
        tokens.push({ kind: "link", href, children: parseInlineNodes(el.childNodes) });
        break;
      }
      default:
        tokens.push(...parseInlineNodes(el.childNodes));
    }
  }
  return tokens;
}

export function parseInline(html: string): InlineToken[] {
  const parsed = new DOMParser().parseFromString(html, "text/html");
  return parseInlineNodes(parsed.body.childNodes);
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
