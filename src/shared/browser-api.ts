type BrowserNamespace = typeof chrome;

declare const browser: BrowserNamespace | undefined;

export const browserAPI: BrowserNamespace = typeof browser !== "undefined" ? browser : chrome;

export async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await browserAPI.tabs.query({ active: true, currentWindow: true });
  return tab ?? null;
}

const BADGE_CLEAR_DELAY_MS = 2500;

export function setBadge(tabId: number | undefined, text: string, color: string): void {
  void browserAPI.action.setBadgeText({ tabId, text });
  void browserAPI.action.setBadgeBackgroundColor({ tabId, color });
  if (text) {
    setTimeout(() => {
      void browserAPI.action.setBadgeText({ tabId, text: "" });
    }, BADGE_CLEAR_DELAY_MS);
  }
}
