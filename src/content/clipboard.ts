import type { ClipboardPayload, CopyResult } from "@shared/types";

async function writeTextOnly(text: string): Promise<CopyResult> {
  try {
    await navigator.clipboard.writeText(text);
    return { ok: true, charCount: text.length, error: null };
  } catch (err) {
    return {
      ok: false,
      charCount: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function writeToClipboard(payload: ClipboardPayload): Promise<CopyResult> {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    return writeTextOnly(payload.text);
  }

  try {
    const item = new ClipboardItem({
      "text/plain": new Blob([payload.text], { type: "text/plain" }),
      "text/html": new Blob([payload.html], { type: "text/html" }),
    });
    await navigator.clipboard.write([item]);
    return { ok: true, charCount: payload.text.length, error: null };
  } catch {
    return writeTextOnly(payload.text);
  }
}
