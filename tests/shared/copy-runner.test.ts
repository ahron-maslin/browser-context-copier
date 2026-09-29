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
        { result: { ok: true, charCount: 0, error: null, payload, effectiveMode: "selection" } },
      ]);
    writeToClipboardMock.mockResolvedValue({ ok: true, charCount: 5, error: null });

    const result = await runCopyPageContext("page", { id: 1, url: "https://example.com" });

    expect(writeToClipboardMock).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ ok: true, charCount: 5, error: null, effectiveMode: "selection" });
    expect(setBadgeMock).toHaveBeenCalledWith(1, "✓", "#16a34a");
  });

  it("uses the content script's own result directly when it already wrote successfully", async () => {
    executeScriptMock
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce([
        { result: { ok: true, charCount: 42, error: null, payload: null, effectiveMode: "page" } },
      ]);

    const result = await runCopyPageContext("page", { id: 1, url: "https://example.com" });

    expect(writeToClipboardMock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true, charCount: 42, error: null, effectiveMode: "page" });
  });

  it("reports the page as inaccessible without attempting injection", async () => {
    const result = await runCopyPageContext("page", { id: 1, url: "chrome://extensions" });

    expect(executeScriptMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: false,
      charCount: 0,
      error: "This page cannot be accessed by the extension.",
      effectiveMode: "page",
    });
  });
});
