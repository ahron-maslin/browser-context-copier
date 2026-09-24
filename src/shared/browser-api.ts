type BrowserNamespace = typeof chrome;

declare const browser: BrowserNamespace | undefined;

export const browserAPI: BrowserNamespace =
  typeof browser !== "undefined" ? browser : chrome;
