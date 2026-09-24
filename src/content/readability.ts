import { Readability } from "@mozilla/readability";

export interface ReadabilityExtraction {
  title: string;
  byline: string | null;
  content: string;
  textContent: string;
  siteName: string | null;
  publishedTime: string | null;
  excerpt: string | null;
}

export function runReadability(doc: Document): ReadabilityExtraction | null {
  const clone = doc.cloneNode(true) as Document;
  try {
    const result = new Readability(clone).parse();
    if (!result) return null;
    return {
      title: result.title ?? "",
      byline: result.byline ?? null,
      content: result.content ?? "",
      textContent: result.textContent ?? "",
      siteName: result.siteName ?? null,
      publishedTime: result.publishedTime ?? null,
      excerpt: result.excerpt ?? null,
    };
  } catch {
    return null;
  }
}
