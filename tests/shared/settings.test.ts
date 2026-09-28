import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "@shared/types";

const { getMock, setMock } = vi.hoisted(() => ({ getMock: vi.fn(), setMock: vi.fn() }));

vi.mock("@shared/browser-api", () => ({
  browserAPI: { storage: { sync: { get: getMock, set: setMock } } },
}));

const { getSettings, saveSettings } = await import("@shared/settings");

afterEach(() => {
  vi.clearAllMocks();
});

describe("getSettings", () => {
  it("returns the defaults merged with whatever is stored", async () => {
    getMock.mockResolvedValue({ preserveLinks: false });

    const settings = await getSettings();

    expect(settings).toEqual({ ...DEFAULT_SETTINGS, preserveLinks: false });
    expect(getMock).toHaveBeenCalledWith(DEFAULT_SETTINGS);
  });

  it("falls back entirely to defaults when storage is empty", async () => {
    getMock.mockResolvedValue({});

    expect(await getSettings()).toEqual(DEFAULT_SETTINGS);
  });
});

describe("saveSettings", () => {
  it("writes a partial update to sync storage", async () => {
    setMock.mockResolvedValue(undefined);

    await saveSettings({ outputFormat: "plain-text" });

    expect(setMock).toHaveBeenCalledWith({ outputFormat: "plain-text" });
  });
});
