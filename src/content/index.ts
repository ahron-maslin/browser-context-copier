import { extractPage } from "@content/extractor";
import { selectionToBlocks } from "@content/selection";
import { blocksToMarkdown } from "@content/markdown";
import { blocksToPlainText } from "@content/plain-text";
import { blocksToHtml } from "@content/html-output";
import { writeToClipboard } from "@shared/clipboard";
import { escapeHtml } from "@content/inline";
import { getSettings } from "@shared/settings";
import type {
  ContentBlock,
  CopyMode,
  CopyPipelineResult,
  ExtensionSettings,
  PageContext,
} from "@shared/types";

declare global {
  interface Window {
    __browserContextCopierMode?: CopyMode;
    __browserContextCopierResult?: Promise<CopyPipelineResult>;
  }
}

function pageHeader(page: PageContext, settings: ExtensionSettings, markdown: boolean): string {
  const title = page.title || "Untitled page";
  const lines = [markdown ? `# ${title}` : title, ""];
  if (settings.includeUrl && page.url) lines.push(`Source: ${page.url}`);
  if (settings.includeMetadata) {
    if (page.author) lines.push(`Author: ${page.author}`);
    if (page.publishedDate) lines.push(`Published: ${page.publishedDate}`);
  }
  lines.push("", markdown ? "---" : "----------");
  return lines.join("\n");
}

function pageHeaderHtml(page: PageContext, settings: ExtensionSettings): string {
  const parts = [`<h1>${escapeHtml(page.title || "Untitled page")}</h1>`];
  if (settings.includeUrl && page.url) {
    parts.push(`<p>Source: <a href="${escapeHtml(page.url)}">${escapeHtml(page.url)}</a></p>`);
  }
  if (settings.includeMetadata) {
    if (page.author) parts.push(`<p>Author: ${escapeHtml(page.author)}</p>`);
    if (page.publishedDate) parts.push(`<p>Published: ${escapeHtml(page.publishedDate)}</p>`);
  }
  parts.push("<hr>");
  return parts.join("");
}

function selectionHeader(markdown: boolean): string {
  return `Source: ${window.location.href}\n\n${markdown ? "---" : "----------"}`;
}

function selectionHeaderHtml(): string {
  const url = escapeHtml(window.location.href);
  return `<p>Source: <a href="${url}">${url}</a></p><hr>`;
}

interface Extracted {
  blocks: ContentBlock[];
  header: string;
  headerHtml: string;
}

function extractForMode(mode: CopyMode, settings: ExtensionSettings): Extracted | null {
  const markdown = settings.outputFormat === "markdown";

  if (mode === "selection") {
    const blocks = selectionToBlocks(document);
    if (!blocks) return null;
    return { blocks, header: selectionHeader(markdown), headerHtml: selectionHeaderHtml() };
  }

  const page = extractPage(document, window.location.href);
  if (page.blocks.length === 0) return null;
  return {
    blocks: page.blocks,
    header: pageHeader(page, settings, markdown),
    headerHtml: pageHeaderHtml(page, settings),
  };
}

async function run(): Promise<CopyPipelineResult> {
  const mode: CopyMode = window.__browserContextCopierMode ?? "page";

  try {
    const settings = await getSettings();
    const extracted = extractForMode(mode, settings);
    if (!extracted) {
      return {
        ok: false,
        charCount: 0,
        payload: null,
        error: mode === "selection" ? "No text is selected." : "No readable page content was detected.",
      };
    }

    const body =
      settings.outputFormat === "markdown"
        ? blocksToMarkdown(extracted.blocks, settings)
        : blocksToPlainText(extracted.blocks, settings);
    const htmlBody = blocksToHtml(extracted.blocks, settings);

    const text = `${extracted.header}\n\n${body}`;
    const html = `${extracted.headerHtml}${htmlBody}`;
    const payload = { text, html };

    const writeResult = await writeToClipboard(payload);
    if (writeResult.ok) {
      return { ok: true, charCount: writeResult.charCount, error: null, payload: null };
    }

    // The page's document commonly isn't focused when this ran because an
    // extension popup was open and stole focus - hand the payload back so
    // the caller can retry the write from its own (focused) context.
    return { ok: true, charCount: text.length, error: null, payload };
  } catch (err) {
    return {
      ok: false,
      charCount: 0,
      payload: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

window.__browserContextCopierResult = run();
