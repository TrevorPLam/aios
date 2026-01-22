import { meetingLinkSchema, parseMeetingLink } from "../meetingLinks";

describe("meetingLinkSchema", () => {
  test("test_meetingLinkSchema_happy", () => {
    // Happy path: supported links should validate cleanly.
    const result = meetingLinkSchema.safeParse(
      "https://meet.google.com/abc-defg-hij",
    );

    expect(result.success).toBe(true);
    // Use parseMeetingLink to assert normalization stays aligned.
    expect(parseMeetingLink("meet.google.com/abc-defg-hij").value).toBe(
      "https://meet.google.com/abc-defg-hij",
    );
  });

  test("test_meetingLinkSchema_empty", () => {
    // Empty input is allowed so events can remain link-free.
    const result = meetingLinkSchema.safeParse("");

    expect(result.success).toBe(true);
  });

  test("test_meetingLinkSchema_error", () => {
    // Error case: unsupported providers must be rejected server-side.
    const result = meetingLinkSchema.safeParse("https://example.com/meeting");

    expect(result.success).toBe(false);
  });
});
