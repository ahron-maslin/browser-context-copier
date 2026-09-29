import { extractPage } from "@content/extractor";
import { selectionToBlocks } from "@content/selection";
import { pageHeader, pageHeaderHtml, selectionHeader, selectionHeaderHtml } from "@content/header";
import type { ContentBlock, CopyMode, ExtensionSettings } from "@shared/types";

export interface Extracted {
  blocks: ContentBlock[];
  header: string;
  headerHtml: string;
  effectiveMode: CopyMode;
}

function buildSelectionExtracted(markdown: boolean): Extracted | null {
  const blocks = selectionToBlocks(document);
  if (!blocks) return null;
  return {
    blocks,
    header: selectionHeader(window.location.href, markdown),
    headerHtml: selectionHeaderHtml(window.location.href),
    effectiveMode: "selection",
  };
}

export function extractForMode(mode: CopyMode, settings: ExtensionSettings): Extracted | null {
  const markdown = settings.outputFormat === "markdown";

  if (mode === "selection") {
    return buildSelectionExtracted(markdown);
  }

  // "page" mode prefers an active selection when one exists, so the default
  // one-click action copies highlighted text instead of the whole page.
  const selectionExtracted = buildSelectionExtracted(markdown);
  if (selectionExtracted) return selectionExtracted;

  const page = extractPage(document, window.location.href);
  if (page.blocks.length === 0) return null;
  return {
    blocks: page.blocks,
    header: pageHeader(page, settings, markdown),
    headerHtml: pageHeaderHtml(page, settings),
    effectiveMode: "page",
  };
}
