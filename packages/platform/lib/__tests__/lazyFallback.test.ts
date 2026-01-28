import { getLazyFallbackCopy } from "@aios/platform/lib/lazyFallback";

describe("getLazyFallbackCopy", () => {
  it("returns tailored copy for a valid screen name", () => {
    const result = getLazyFallbackCopy("Photos");

    expect("error" in result).toBe(false);
    expect(result.copy.title).toBe("Loading Photos");
    expect(result.copy.description).toContain("Photos");
  });

  it("returns default copy for empty input", () => {
    const result = getLazyFallbackCopy("   ");

    expect(result.copy.title).toBe("Loading module");
    expect(result.copy.description).toContain("open the screen");
  });

  it("returns an error when given a non-string input", () => {
    const result = getLazyFallbackCopy(123);

    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toBe("Screen name must be a string.");
    }
  });
});
