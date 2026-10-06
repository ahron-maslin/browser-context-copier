import { describe, expect, it } from "vitest";
import { MAX_RECOMMENDED_CHARS, sizeWarning } from "@content/size-warning";

describe("sizeWarning", () => {
  it("returns null at and below the threshold", () => {
    expect(sizeWarning(0)).toBeNull();
    expect(sizeWarning(MAX_RECOMMENDED_CHARS)).toBeNull();
  });

  it("returns a warning string above the threshold", () => {
    expect(sizeWarning(MAX_RECOMMENDED_CHARS + 1)).toEqual(expect.any(String));
  });
});
