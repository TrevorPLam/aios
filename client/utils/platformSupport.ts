export function isSidebarSwipeSupported(platform: string): boolean {
  if (!platform) {
    return false;
  }

  return platform !== "web";
}
