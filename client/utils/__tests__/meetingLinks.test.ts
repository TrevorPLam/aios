import {
  extractMeetingLinkFromText,
  meetingLinkLabels,
  parseMeetingLink,
} from "../meetingLinks";

describe("meetingLinks", () => {
  test("test_parseMeetingLink_happy", () => {
    // Happy path: valid Zoom link should normalize and pass validation.
    const result = parseMeetingLink("zoom.us/j/1234567890");
    expect(result.value).toBe("https://zoom.us/j/1234567890");
    expect(result.error).toBeUndefined();
  });

  test("test_parseMeetingLink_empty", () => {
    // Edge case: empty input stays optional without errors.
    const result = parseMeetingLink("  ");
    expect(result.value).toBeNull();
    expect(result.error).toBeUndefined();
  });

  test("test_parseMeetingLink_error", () => {
    // Error case: unsupported hosts should return a clear validation error.
    const result = parseMeetingLink("https://example.com/meeting");
    expect(result.value).toBeNull();
    expect(result.error).toBeDefined();
  });

  test("test_extractMeetingLink_happy", () => {
    // Happy path: extract a supported meeting link from freeform text.
    const result = extractMeetingLinkFromText(
      "Join via https://meet.google.com/abc-defg-hij",
    );
    expect(result.value).toBe("https://meet.google.com/abc-defg-hij");
    expect(result.error).toBeUndefined();
  });

  test("test_extractMeetingLink_error", () => {
    // Error case: URL-like text that is not supported should report a reason.
    const result = extractMeetingLinkFromText("Join https://example.com/foo");
    expect(result.value).toBeNull();
    expect(result.error).toBeDefined();
  });

  test("test_meetingLinkLabels_happy", () => {
    // Happy path: labels are exposed for UI helpers.
    expect(meetingLinkLabels).toEqual([
      "Zoom",
      "Google Meet",
      "Microsoft Teams",
    ]);
  });
});
