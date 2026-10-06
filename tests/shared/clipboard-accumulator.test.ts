import { afterEach, describe, expect, it, vi } from "vitest";

const { getMock, setMock, removeMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  setMock: vi.fn(),
  removeMock: vi.fn(),
}));

vi.mock("@shared/browser-api", () => ({
  browserAPI: { storage: { session: { get: getMock, set: setMock, remove: removeMock } } },
}));

const { appendToAccumulator, clearAccumulator, getAccumulatorCount } = await import(
  "@shared/clipboard-accumulator"
);

afterEach(() => {
  vi.clearAllMocks();
});

describe("appendToAccumulator", () => {
  it("starts a fresh buffer with the first entry as-is, no separator", async () => {
    getMock.mockResolvedValue({});
    setMock.mockResolvedValue(undefined);

    const result = await appendToAccumulator({ text: "first", html: "<p>first</p>" });

    expect(result).toEqual({ text: "first", html: "<p>first</p>", count: 1 });
    expect(setMock).toHaveBeenCalledWith({
      clipboardAccumulator: { text: "first", html: "<p>first</p>", count: 1 },
    });
  });

  it("joins a second entry onto the existing buffer with a separator", async () => {
    getMock.mockResolvedValue({
      clipboardAccumulator: { text: "first", html: "<p>first</p>", count: 1 },
    });
    setMock.mockResolvedValue(undefined);

    const result = await appendToAccumulator({ text: "second", html: "<p>second</p>" });

    expect(result.count).toBe(2);
    expect(result.text.startsWith("first")).toBe(true);
    expect(result.text.endsWith("second")).toBe(true);
    expect(result.text).not.toBe(`firstsecond`);
    expect(result.html).toContain("<p>first</p>");
    expect(result.html).toContain("<p>second</p>");
  });

  it("never calls the real system clipboard - only its own storage area", async () => {
    getMock.mockResolvedValue({});
    setMock.mockResolvedValue(undefined);

    await appendToAccumulator({ text: "x", html: "<p>x</p>" });

    // Mocking @shared/browser-api entirely with only `storage.session` on it
    // means any attempt to touch navigator.clipboard or a different storage
    // area would throw here rather than silently succeed.
    expect(getMock).toHaveBeenCalled();
    expect(setMock).toHaveBeenCalled();
  });
});

describe("clearAccumulator", () => {
  it("removes the stored buffer", async () => {
    removeMock.mockResolvedValue(undefined);
    await clearAccumulator();
    expect(removeMock).toHaveBeenCalledWith("clipboardAccumulator");
  });
});

describe("getAccumulatorCount", () => {
  it("returns 0 when nothing has been accumulated yet", async () => {
    getMock.mockResolvedValue({});
    expect(await getAccumulatorCount()).toBe(0);
  });

  it("returns the stored count", async () => {
    getMock.mockResolvedValue({ clipboardAccumulator: { text: "a", html: "a", count: 3 } });
    expect(await getAccumulatorCount()).toBe(3);
  });
});
