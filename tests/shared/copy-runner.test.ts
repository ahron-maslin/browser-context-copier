import { afterEach, describe, expect, it, vi } from "vitest";

const { executeScriptMock, getActiveTabMock, setBadgeMock, writeToClipboardMock } = vi.hoisted(
  () => ({
    executeScriptMock: vi.fn(),
    getActiveTabMock: vi.fn(),
    setBadgeMock: vi.fn(),
    writeToClipboardMock: vi.fn(),
  }),
);

vi.mock("@shared/browser-api", () => ({
  browserAPI: { scripting: { executeScript: executeScriptMock } },
  getActiveTab: getActiveTabMock,
  setBadge: setBadgeMock,
}));

vi.mock("@shared/clipboard", () => ({
  writeToClipboard: writeToClipboardMock,
}));

const { runCopyPageContext } = await import("@shared/copy-runner");

afterEach(() => {
  vi.clearAllMocks();
});

describe("runCopyPageContext", () => {
  it("retries the clipboard write from here when the content script hands back a payload", async () => {
    const payload = { text: "hello", html: "<p>hello</p>" };
    executeScriptMock
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([
        {
          result: {
            ok: true,
            charCount: 0,
            error: null,
            payload,
            effectiveMode: "selection",
            warning: null,
            pageCount: 2,
          },
        },
      ]);
    writeToClipboardMock.mockResolvedValue({ ok: true, charCount: 5, error: null });

    const result = await runCopyPageContext("page", { id: 1, url: "https://example.com" });

    expect(writeToClipboardMock).toHaveBeenCalledWith(payload);
    expect(result).toEqual({
      ok: true,
      charCount: 5,
      error: null,
      effectiveMode: "selection",
      warning: null,
      pageCount: 2,
    });
    expect(setBadgeMock).toHaveBeenCalledWith(1, "✓", "#16a34a");
  });

  it("uses the content script's own result directly when it already wrote successfully", async () => {
    executeScriptMock
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([
        {
          result: {
            ok: true,
            charCount: 42,
            error: null,
            payload: null,
            effectiveMode: "page",
            warning: "This is a lot of text.",
            pageCount: 1,
          },
        },
      ]);

    const result = await runCopyPageContext("page", { id: 1, url: "https://example.com" });

    expect(writeToClipboardMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: true,
      charCount: 42,
      error: null,
      effectiveMode: "page",
      warning: "This is a lot of text.",
      pageCount: 1,
    });
  });

  it("injects the content bundle by a root-absolute path, since Firefox resolves relative paths against the calling page (e.g. popup/)", async () => {
    executeScriptMock.mockResolvedValue([
      {
        result: {
          ok: true,
          charCount: 1,
          error: null,
          payload: null,
          effectiveMode: "page",
          warning: null,
          pageCount: 1,
        },
      },
    ]);

    await runCopyPageContext("page", { id: 1, url: "https://example.com" });

    expect(executeScriptMock).toHaveBeenCalledWith(
      expect.objectContaining({ files: ["/content/inject.js"] }),
    );
  });

  it("surfaces the browser's injection error instead of a generic missing-result message", async () => {
    executeScriptMock
      .mockResolvedValueOnce([{ frameId: 0 }])
      .mockResolvedValueOnce([
        {
          frameId: 0,
          error: { message: "Unable to load script: moz-extension://x/popup/content/inject.js" },
        },
      ])
      .mockResolvedValueOnce([{ frameId: 0 }]);

    const result = await runCopyPageContext("page", { id: 1, url: "https://example.com" });

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Unable to load script: moz-extension://x/popup/content/inject.js");
    expect(setBadgeMock).toHaveBeenCalledWith(1, "!", "#dc2626");
  });

  it("reports the page as inaccessible without attempting injection", async () => {
    const result = await runCopyPageContext("page", { id: 1, url: "chrome://extensions" });

    expect(executeScriptMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: false,
      charCount: 0,
      error: "This page cannot be accessed by the extension.",
      effectiveMode: "page",
      warning: null,
      pageCount: 1,
    });
  });
});
