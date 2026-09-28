import { afterEach, describe, expect, it, vi } from "vitest";

const { captureVisibleTabMock } = vi.hoisted(() => ({ captureVisibleTabMock: vi.fn() }));

vi.mock("@shared/browser-api", () => ({
  browserAPI: { tabs: { captureVisibleTab: captureVisibleTabMock } },
}));

const { copyScreenshotToClipboard } = await import("@shared/screenshot");

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("copyScreenshotToClipboard", () => {
  it("captures the visible tab as PNG and writes it to the clipboard", async () => {
    captureVisibleTabMock.mockResolvedValue("data:image/png;base64,AAAA");
    const fakeBlob = { type: "image/png" };
    const fetchMock = vi.fn().mockResolvedValue({ blob: () => Promise.resolve(fakeBlob) });
    vi.stubGlobal("fetch", fetchMock);

    const write = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { write } });
    vi.stubGlobal(
      "ClipboardItem",
      function (this: { items: unknown }, items: unknown) {
        this.items = items;
      },
    );

    await copyScreenshotToClipboard();

    expect(captureVisibleTabMock).toHaveBeenCalledWith({ format: "png" });
    expect(fetchMock).toHaveBeenCalledWith("data:image/png;base64,AAAA");
    expect(write).toHaveBeenCalledTimes(1);
  });
});
