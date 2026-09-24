import type { ContentBlock } from "@shared/types";
import { elementToBlocks } from "@content/html-to-blocks";

export function selectionToBlocks(doc: Document): ContentBlock[] | null {
  const selection = doc.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;

  const text = selection.toString().trim();
  if (!text) return null;

  const container = doc.createElement("div");
  for (let i = 0; i < selection.rangeCount; i += 1) {
    container.appendChild(selection.getRangeAt(i).cloneContents());
  }

  const blocks = elementToBlocks(container);
  if (blocks.length > 0) return blocks;

  return [{ type: "paragraph", html: container.innerHTML.trim() || text }];
}
