import { browserAPI, getActiveTab, setBadge } from "@shared/browser-api";
import type { CopyMode, CopyResult } from "@shared/types";

const CONTENT_SCRIPT_FILE = "content/inject.js";
const BADGE_SUCCESS_COLOR = "#16a34a";
const BADGE_ERROR_COLOR = "#dc2626";

function isInjectableUrl(url: string | undefined): boolean {
  if (!url) return false;
  return /^https?:\/\//.test(url) || url.startsWith("file://");
}

export async function runCopyPageContext(
  mode: CopyMode,
  knownTab?: { id: number; url?: string | undefined },
): Promise<CopyResult> {
  const tab = knownTab ?? (await getActiveTab());

  if (!tab?.id) {
    return { ok: false, charCount: 0, error: "No active tab found." };
  }
  if (!isInjectableUrl(tab.url)) {
    return { ok: false, charCount: 0, error: "This page cannot be accessed by the extension." };
  }

  try {
    await browserAPI.scripting.executeScript({
      target: { tabId: tab.id },
      func: (injectedMode: CopyMode) => {
        (window as unknown as { __browserContextCopierMode: CopyMode }).__browserContextCopierMode =
          injectedMode;
      },
      args: [mode],
    });

    await browserAPI.scripting.executeScript({
      target: { tabId: tab.id },
      files: [CONTENT_SCRIPT_FILE],
    });

    const injectionResults = await browserAPI.scripting.executeScript({
      target: { tabId: tab.id },
      func: () =>
        (window as unknown as { __browserContextCopierResult: CopyResult })
          .__browserContextCopierResult,
    });

    const copyResult = injectionResults[0]?.result as CopyResult | undefined;
    if (!copyResult) {
      throw new Error("The content script did not return a result.");
    }
    setBadge(tab.id, copyResult.ok ? "✓" : "!", copyResult.ok ? BADGE_SUCCESS_COLOR : BADGE_ERROR_COLOR);
    return copyResult;
  } catch (err) {
    setBadge(tab.id, "!", BADGE_ERROR_COLOR);
    return { ok: false, charCount: 0, error: err instanceof Error ? err.message : String(err) };
  }
}
