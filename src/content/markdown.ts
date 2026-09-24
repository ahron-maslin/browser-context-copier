import type { ContentBlock } from "@shared/types";
import { type InlineToken, parseInline } from "@content/inline";

export interface MarkdownOptions {
  preserveLinks: boolean;
  includeImageDescriptions: boolean;
}

function renderInlineMarkdown(tokens: InlineToken[], opts: MarkdownOptions): string {
  return tokens.map((token) => renderTokenMarkdown(token, opts)).join("");
}

function renderTokenMarkdown(token: InlineToken, opts: MarkdownOptions): string {
  switch (token.kind) {
    case "text":
      return token.text;
    case "break":
      return "\n";
    case "bold":
      return `**${renderInlineMarkdown(token.children, opts)}**`;
    case "italic":
      return `_${renderInlineMarkdown(token.children, opts)}_`;
    case "code":
      return `\`${token.text}\``;
    case "link": {
      const inner = renderInlineMarkdown(token.children, opts);
      return opts.preserveLinks && token.href ? `[${inner}](${token.href})` : inner;
    }
  }
}

function inlineHtmlToMarkdown(html: string, opts: MarkdownOptions): string {
  return renderInlineMarkdown(parseInline(html), opts).trim();
}

function blockToMarkdown(block: ContentBlock, opts: MarkdownOptions): string {
  switch (block.type) {
    case "heading":
      return `${"#".repeat(block.level)} ${block.text}`;
    case "paragraph":
      return inlineHtmlToMarkdown(block.html, opts);
    case "list":
      return block.items
        .map((item, index) => (block.ordered ? `${index + 1}. ${item}` : `- ${item}`))
        .join("\n");
    case "blockquote":
      return block.text
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
    case "code":
      return `\`\`\`${block.language ?? ""}\n${block.code}\n\`\`\``;
    case "table": {
      const headerRow = `| ${block.headers.join(" | ")} |`;
      const separatorRow = `| ${block.headers.map(() => "---").join(" | ")} |`;
      const rows = block.rows.map((row) => `| ${row.join(" | ")} |`);
      return [headerRow, separatorRow, ...rows].join("\n");
    }
    case "image": {
      if (!opts.includeImageDescriptions) return "";
      const lines = [`Image: ${block.alt}`];
      if (block.caption) lines.push(`Caption: ${block.caption}`);
      return lines.join("\n");
    }
    case "separator":
      return "---";
  }
}

export function blocksToMarkdown(blocks: ContentBlock[], opts: MarkdownOptions): string {
  return blocks
    .map((block) => blockToMarkdown(block, opts))
    .filter((text) => text.length > 0)
    .join("\n\n");
}
