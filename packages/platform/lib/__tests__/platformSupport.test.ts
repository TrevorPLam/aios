import { isSidebarSwipeSupported } from "@platform/lib/platformSupport";

describe("isSidebarSwipeSupported", () => {
  it("returns true for native platforms", () => {
    expect(isSidebarSwipeSupported("ios")).toBe(true);
    expect(isSidebarSwipeSupported("android")).toBe(true);
  });

  it("returns false for web", () => {
    expect(isSidebarSwipeSupported("web")).toBe(false);
  });

  it("returns false for missing platform input", () => {
    expect(isSidebarSwipeSupported("")).toBe(false);
  });
});
