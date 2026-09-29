export type ContentBlock =
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { type: "paragraph"; html: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "code"; language: string | null; code: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "image"; alt: string; src: string; caption: string | null }
  | { type: "separator" };

export type ExtractionMethod = "readability" | "semantic" | "heuristic" | "fallback";

export interface PageContext {
  title: string;
  url: string;
  hostname: string;
  description: string | null;
  author: string | null;
  publishedDate: string | null;
  blocks: ContentBlock[];
  extractionMethod: ExtractionMethod;
  timestamp: number;
}

export interface ExtractionResult {
  ok: boolean;
  pageContext: PageContext | null;
  error: string | null;
}

export type CopyMode = "page" | "selection";

export interface CopyResult {
  ok: boolean;
  charCount: number;
  error: string | null;
}

export interface RunCopyResult extends CopyResult {
  effectiveMode: CopyMode;
}

export interface ClipboardPayload {
  text: string;
  html: string;
}

export interface CopyPipelineResult {
  ok: boolean;
  charCount: number;
  error: string | null;
  payload: ClipboardPayload | null;
  effectiveMode: CopyMode;
}

export interface ExtensionSettings {
  outputFormat: "markdown" | "plain-text";
  includeUrl: boolean;
  includeMetadata: boolean;
  preserveLinks: boolean;
  includeImageDescriptions: boolean;
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  outputFormat: "markdown",
  includeUrl: true,
  includeMetadata: true,
  preserveLinks: true,
  includeImageDescriptions: true,
};
