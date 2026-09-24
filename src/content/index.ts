import { extractPage } from "@content/extractor";
import { selectionToBlocks } from "@content/selection";
import { blocksToMarkdown } from "@content/markdown";
import { blocksToHtml } from "@content/html-output";
import { writeToClipboard } from "@content/clipboard";
import { escapeHtml } from "@content/inline";
import { DEFAULT_SETTINGS } from "@shared/types";
import type { ContentBlock, CopyMode, CopyResult, PageContext } from "@shared/types";

declare global {
  interface Window {
    __browserContextCopierMode?: CopyMode;
    __browserContextCopierResult?: Promise<CopyResult>;
  }
}

function pageHeaderMarkdown(page: PageContext): string {
  const lines = [`# ${page.title || "Untitled page"}`, ""];
  if (DEFAULT_SETTINGS.includeUrl && page.url) lines.push(`Source: ${page.url}`);
  if (DEFAULT_SETTINGS.includeMetadata) {
    if (page.author) lines.push(`Author: ${page.author}`);
    if (page.publishedDate) lines.push(`Published: ${page.publishedDate}`);
  }
  lines.push("", "---");
  return lines.join("\n");
}

function pageHeaderHtml(page: PageContext): string {
  const parts = [`<h1>${escapeHtml(page.title || "Untitled page")}</h1>`];
  if (DEFAULT_SETTINGS.includeUrl && page.url) {
    parts.push(`<p>Source: <a href="${escapeHtml(page.url)}">${escapeHtml(page.url)}</a></p>`);
  }
  if (DEFAULT_SETTINGS.includeMetadata) {
    if (page.author) parts.push(`<p>Author: ${escapeHtml(page.author)}</p>`);
    if (page.publishedDate) parts.push(`<p>Published: ${escapeHtml(page.publishedDate)}</p>`);
  }
  parts.push("<hr>");
  return parts.join("");
}

function selectionHeaderMarkdown(): string {
  return `Source: ${window.location.href}\n\n---`;
}

function selectionHeaderHtml(): string {
  const url = escapeHtml(window.location.href);
  return `<p>Source: <a href="${url}">${url}</a></p><hr>`;
}

interface Extracted {
  blocks: ContentBlock[];
  headerMarkdown: string;
  headerHtml: string;
}

function extractForMode(mode: CopyMode): Extracted | null {
  if (mode === "selection") {
    const blocks = selectionToBlocks(document);
    if (!blocks) return null;
    return { blocks, headerMarkdown: selectionHeaderMarkdown(), headerHtml: selectionHeaderHtml() };
  }

  const page = extractPage(document, window.location.href);
  if (page.blocks.length === 0) return null;
  return {
    blocks: page.blocks,
    headerMarkdown: pageHeaderMarkdown(page),
    headerHtml: pageHeaderHtml(page),
  };
}

async function run(): Promise<CopyResult> {
  const mode: CopyMode = window.__browserContextCopierMode ?? "page";

  try {
    const extracted = extractForMode(mode);
    if (!extracted) {
      return {
        ok: false,
        charCount: 0,
        error: mode === "selection" ? "No text is selected." : "No readable page content was detected.",
      };
    }

    const markdownBody = blocksToMarkdown(extracted.blocks, DEFAULT_SETTINGS);
    const htmlBody = blocksToHtml(extracted.blocks, DEFAULT_SETTINGS);

    const text = `${extracted.headerMarkdown}\n\n${markdownBody}`;
    const html = `${extracted.headerHtml}${htmlBody}`;

    return await writeToClipboard({ text, html });
  } catch (err) {
    return { ok: false, charCount: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

window.__browserContextCopierResult = run();
