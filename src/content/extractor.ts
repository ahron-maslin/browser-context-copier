import type { ContentBlock, ExtractionMethod, PageContext } from "@shared/types";
import { normalizeWhitespace } from "@shared/utils";
import { runReadability } from "@content/readability";
import { cleanDocument } from "@content/clean-document";
import { elementToBlocks } from "@content/html-to-blocks";
import { findHeuristicContainer } from "@content/heuristic";

export const MIN_READABILITY_LENGTH = 200;
export const MIN_SEMANTIC_LENGTH = 40;
export const MIN_HEURISTIC_LENGTH = 140;

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function metaContent(doc: Document, name: string): string | null {
  const el = doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  return el?.getAttribute("content")?.trim() || null;
}

function textLength(el: Element): number {
  return (el.textContent ?? "").trim().length;
}

function findSemanticContainer(doc: Document): Element | null {
  const article = doc.querySelector("article");
  if (article && textLength(article) >= MIN_SEMANTIC_LENGTH) return article;
  const main = doc.querySelector("main");
  if (main && textLength(main) >= MIN_SEMANTIC_LENGTH) return main;
  return null;
}

function htmlStringToBlocks(doc: Document, html: string): ContentBlock[] {
  const container = doc.createElement("div");
  container.innerHTML = html;
  return elementToBlocks(container);
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fallbackBlocks(doc: Document): ContentBlock[] {
  const text = normalizeWhitespace(doc.body?.textContent ?? "");
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)
    .map((paragraph) => ({ type: "paragraph" as const, html: escapeHtml(paragraph) }));
}

function basePageContext(
  doc: Document,
  url: string,
  method: ExtractionMethod,
  overrides: Partial<Pick<PageContext, "title" | "description" | "author" | "publishedDate">> = {},
): Omit<PageContext, "blocks"> {
  return {
    title: overrides.title ?? doc.title ?? "",
    url,
    hostname: safeHostname(url),
    description: overrides.description ?? metaContent(doc, "description"),
    author: overrides.author ?? metaContent(doc, "author"),
    publishedDate: overrides.publishedDate ?? metaContent(doc, "article:published_time"),
    extractionMethod: method,
    timestamp: Date.now(),
  };
}

export function extractPage(doc: Document, url: string): PageContext {
  const readability = runReadability(doc);
  if (readability && readability.textContent.trim().length >= MIN_READABILITY_LENGTH) {
    return {
      ...basePageContext(doc, url, "readability", {
        title: readability.title || doc.title || "",
        description: readability.excerpt,
        author: readability.byline,
        publishedDate: readability.publishedTime,
      }),
      blocks: htmlStringToBlocks(doc, readability.content),
    };
  }

  const cleaned = cleanDocument(doc);

  const semantic = findSemanticContainer(cleaned);
  if (semantic) {
    return { ...basePageContext(doc, url, "semantic"), blocks: elementToBlocks(semantic) };
  }

  const heuristic = findHeuristicContainer(cleaned, MIN_HEURISTIC_LENGTH);
  if (heuristic) {
    return { ...basePageContext(doc, url, "heuristic"), blocks: elementToBlocks(heuristic) };
  }

  return { ...basePageContext(doc, url, "fallback"), blocks: fallbackBlocks(cleaned) };
}
