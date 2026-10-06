import { extractForMode } from "@content/extract-for-mode";
import { blocksToMarkdown } from "@content/markdown";
import { blocksToPlainText } from "@content/plain-text";
import { blocksToHtml } from "@content/html-output";
import { closingNote, closingNoteHtml } from "@content/header";
import { sizeWarning } from "@content/size-warning";
import { writeToClipboard } from "@shared/clipboard";
import { appendToAccumulator } from "@shared/clipboard-accumulator";
import { getSettings } from "@shared/settings";
import type { CopyMode, CopyPipelineResult } from "@shared/types";

declare global {
  interface Window {
    __browserContextCopierMode?: CopyMode;
    __browserContextCopierResult?: Promise<CopyPipelineResult>;
  }
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
        warning: null,
        pageCount: 1,
        effectiveMode: mode,
        error: mode === "selection" ? "No text is selected." : "No readable page content was detected.",
      };
    }

    const markdown = settings.outputFormat === "markdown";
    const body = markdown
      ? blocksToMarkdown(extracted.blocks, settings)
      : blocksToPlainText(extracted.blocks, settings);
    const htmlBody = blocksToHtml(extracted.blocks, settings);

    const pageText = `${extracted.header}\n\n${body}\n\n${closingNote(markdown)}`;
    const pageHtml = `${extracted.headerHtml}${htmlBody}${closingNoteHtml()}`;

    // Append mode never reads the real system clipboard (that's a hard
    // constraint - see CLAUDE.md). It keeps its own running buffer in
    // extension storage and writes the full combined buffer every time.
    const { text, html, count } = settings.appendMode
      ? await appendToAccumulator({ text: pageText, html: pageHtml })
      : { text: pageText, html: pageHtml, count: 1 };

    const payload = { text, html };
    const warning = sizeWarning(text.length);

    const writeResult = await writeToClipboard(payload);
    if (writeResult.ok) {
      return {
        ok: true,
        charCount: writeResult.charCount,
        error: null,
        payload: null,
        warning,
        pageCount: count,
        effectiveMode: extracted.effectiveMode,
      };
    }

    // The page's document commonly isn't focused when this ran because an
    // extension popup was open and stole focus - hand the payload back so
    // the caller can retry the write from its own (focused) context.
    return {
      ok: true,
      charCount: text.length,
      error: null,
      payload,
      warning,
      pageCount: count,
      effectiveMode: extracted.effectiveMode,
    };
  } catch (err) {
    return {
      ok: false,
      charCount: 0,
      payload: null,
      warning: null,
      pageCount: 1,
      effectiveMode: mode,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

window.__browserContextCopierResult = run();
