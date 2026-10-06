import { browserAPI, getActiveTab, setBadge } from "@shared/browser-api";
import { writeToClipboard } from "@shared/clipboard";
import type { CopyMode, CopyPipelineResult, RunCopyResult } from "@shared/types";

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
): Promise<RunCopyResult> {
  const tab = knownTab ?? (await getActiveTab());

  if (!tab?.id) {
    return {
      ok: false,
      charCount: 0,
      error: "No active tab found.",
      effectiveMode: mode,
      warning: null,
      pageCount: 1,
    };
  }
  if (!isInjectableUrl(tab.url)) {
    return {
      ok: false,
      charCount: 0,
      error: "This page cannot be accessed by the extension.",
      effectiveMode: mode,
      warning: null,
      pageCount: 1,
    };
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
        (window as unknown as { __browserContextCopierResult: CopyPipelineResult })
          .__browserContextCopierResult,
    });

    const raw = injectionResults[0]?.result as CopyPipelineResult | undefined;
    if (!raw) {
      throw new Error("The content script did not return a result.");
    }

    // The content script couldn't write to the clipboard itself (most often
    // because the page's document wasn't focused - e.g. this popup stole
    // focus when it opened) - retry from here, since this context should be
    // the one currently focused.
    const written = raw.payload
      ? await writeToClipboard(raw.payload)
      : { ok: raw.ok, charCount: raw.charCount, error: raw.error };
    const copyResult: RunCopyResult = {
      ...written,
      effectiveMode: raw.effectiveMode,
      warning: raw.warning,
      pageCount: raw.pageCount,
    };

    setBadge(tab.id, copyResult.ok ? "✓" : "!", copyResult.ok ? BADGE_SUCCESS_COLOR : BADGE_ERROR_COLOR);
    return copyResult;
  } catch (err) {
    setBadge(tab.id, "!", BADGE_ERROR_COLOR);
    return {
      ok: false,
      charCount: 0,
      error: err instanceof Error ? err.message : String(err),
      effectiveMode: mode,
      warning: null,
      pageCount: 1,
    };
  }
}
