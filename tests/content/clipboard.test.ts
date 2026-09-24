import { afterEach, describe, expect, it, vi } from "vitest";
import { writeToClipboard } from "@content/clipboard";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("writeToClipboard", () => {
  it("writes both text/plain and text/html via ClipboardItem when supported", async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { write, writeText } });
    vi.stubGlobal(
      "ClipboardItem",
      function (this: { items: unknown }, items: unknown) {
        this.items = items;
      },
    );

    const result = await writeToClipboard({ text: "hello", html: "<p>hello</p>" });

    expect(result).toEqual({ ok: true, charCount: 5, error: null });
    expect(write).toHaveBeenCalledTimes(1);
    expect(writeText).not.toHaveBeenCalled();
  });

  it("falls back to writeText when ClipboardItem is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    vi.stubGlobal("ClipboardItem", undefined);

    const result = await writeToClipboard({ text: "hello", html: "<p>hello</p>" });

    expect(result).toEqual({ ok: true, charCount: 5, error: null });
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("falls back to writeText when the rich write throws", async () => {
    const write = vi.fn().mockRejectedValue(new Error("nope"));
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { write, writeText } });
    vi.stubGlobal(
      "ClipboardItem",
      function (this: { items: unknown }, items: unknown) {
        this.items = items;
      },
    );

    const result = await writeToClipboard({ text: "hello", html: "<p>hello</p>" });

    expect(result).toEqual({ ok: true, charCount: 5, error: null });
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("reports an error when every clipboard write attempt fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    vi.stubGlobal("ClipboardItem", undefined);

    const result = await writeToClipboard({ text: "hello", html: "<p>hello</p>" });

    expect(result).toEqual({ ok: false, charCount: 0, error: "denied" });
  });
});
