import type { ContentBlock } from "@shared/types";
import { type InlineToken, parseInline } from "@content/inline";
import type { MarkdownOptions } from "@content/markdown";

function renderInlinePlain(tokens: InlineToken[], opts: MarkdownOptions): string {
  return tokens.map((token) => renderTokenPlain(token, opts)).join("");
}

function renderTokenPlain(token: InlineToken, opts: MarkdownOptions): string {
  switch (token.kind) {
    case "text":
      return token.text;
    case "break":
      return "\n";
    case "bold":
    case "italic":
      return renderInlinePlain(token.children, opts);
    case "code":
      return token.text;
    case "link": {
      const inner = renderInlinePlain(token.children, opts);
      return opts.preserveLinks && token.href ? `${inner} (${token.href})` : inner;
    }
  }
}

function inlineHtmlToPlainText(html: string, opts: MarkdownOptions): string {
  return renderInlinePlain(parseInline(html), opts).trim();
}

function blockToPlainText(block: ContentBlock, opts: MarkdownOptions): string {
  switch (block.type) {
    case "heading":
      return block.text;
    case "paragraph":
      return inlineHtmlToPlainText(block.html, opts);
    case "list":
      return block.items
        .map((item, index) => (block.ordered ? `${index + 1}. ${item}` : `- ${item}`))
        .join("\n");
    case "blockquote":
      return block.text;
    case "code":
      return block.code;
    case "table":
      return block.rows
        .map((row) => row.map((cell, i) => `${block.headers[i] ?? ""}: ${cell}`).join(", "))
        .join("\n");
    case "image": {
      if (!opts.includeImageDescriptions) return "";
      const lines = [`Image: ${block.alt}`];
      if (block.caption) lines.push(`Caption: ${block.caption}`);
      return lines.join("\n");
    }
    case "separator":
      return "----------";
  }
}

export function blocksToPlainText(blocks: ContentBlock[], opts: MarkdownOptions): string {
  return blocks
    .map((block) => blockToPlainText(block, opts))
    .filter((text) => text.length > 0)
    .join("\n\n");
}
