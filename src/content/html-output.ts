import type { ContentBlock } from "@shared/types";
import { type InlineToken, escapeHtml, parseInline } from "@content/inline";
import type { MarkdownOptions } from "@content/markdown";

function renderInlineHtml(tokens: InlineToken[], opts: MarkdownOptions): string {
  return tokens.map((token) => renderTokenHtml(token, opts)).join("");
}

function renderTokenHtml(token: InlineToken, opts: MarkdownOptions): string {
  switch (token.kind) {
    case "text":
      return escapeHtml(token.text);
    case "break":
      return "<br>";
    case "bold":
      return `<strong>${renderInlineHtml(token.children, opts)}</strong>`;
    case "italic":
      return `<em>${renderInlineHtml(token.children, opts)}</em>`;
    case "code":
      return `<code>${escapeHtml(token.text)}</code>`;
    case "link": {
      const inner = renderInlineHtml(token.children, opts);
      return opts.preserveLinks && token.href
        ? `<a href="${escapeHtml(token.href)}">${inner}</a>`
        : inner;
    }
  }
}

function inlineHtmlToCleanHtml(html: string, opts: MarkdownOptions): string {
  return renderInlineHtml(parseInline(html), opts);
}

function blockToHtml(block: ContentBlock, opts: MarkdownOptions): string {
  switch (block.type) {
    case "heading":
      return `<h${block.level}>${escapeHtml(block.text)}</h${block.level}>`;
    case "paragraph":
      return `<p>${inlineHtmlToCleanHtml(block.html, opts)}</p>`;
    case "list": {
      const tag = block.ordered ? "ol" : "ul";
      return `<${tag}>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${tag}>`;
    }
    case "blockquote":
      return `<blockquote>${escapeHtml(block.text).replace(/\n/g, "<br>")}</blockquote>`;
    case "code":
      return `<pre><code>${escapeHtml(block.code)}</code></pre>`;
    case "table": {
      const headerRow = block.headers.length
        ? `<tr>${block.headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr>`
        : "";
      const rows = block.rows
        .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
        .join("");
      return `<table>${headerRow}${rows}</table>`;
    }
    case "image": {
      if (!opts.includeImageDescriptions) return "";
      const caption = block.caption ? ` (Caption: ${escapeHtml(block.caption)})` : "";
      return `<p>Image: ${escapeHtml(block.alt)}${caption}</p>`;
    }
    case "separator":
      return "<hr>";
  }
}

export function blocksToHtml(blocks: ContentBlock[], opts: MarkdownOptions): string {
  return blocks
    .map((block) => blockToHtml(block, opts))
    .filter((html) => html.length > 0)
    .join("");
}
