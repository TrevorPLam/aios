const MEETING_LINK_PATTERNS = [
  {
    label: "Zoom",
    pattern: /^(https?:\/\/)?([\w-]+\.)?zoom\.us\/j\/[\w?=&#%-]+$/i,
  },
  {
    label: "Google Meet",
    pattern: /^(https?:\/\/)?meet\.google\.com\/[\w-]+$/i,
  },
  {
    label: "Microsoft Teams",
    pattern:
      /^(https?:\/\/)?(teams\.microsoft\.com|teams\.live\.com)\/l\/meetup-join\/[\w?=&#%-]+$/i,
  },
];

const URL_LIKE_PATTERN =
  /\b(https?:\/\/[^\s]+|([\w-]+\.)?zoom\.us\/j\/[\w?=&#%-]+|meet\.google\.com\/[\w-]+|(teams\.microsoft\.com|teams\.live\.com)\/l\/meetup-join\/[\w?=&#%-]+)\b/gi;

type ParsedMeetingLink = {
  value: string | null;
  error?: string;
};

function isSupportedMeetingLink(link: string): boolean {
  return MEETING_LINK_PATTERNS.some((pattern) => pattern.pattern.test(link));
}

function normalizeMeetingLink(candidate: string): ParsedMeetingLink {
  const trimmed = candidate.trim();
  if (!trimmed) {
    return { value: null };
  }

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const normalized = new URL(withScheme).toString();
    if (!isSupportedMeetingLink(normalized)) {
      return {
        value: null,
        error: "Only Zoom, Google Meet, and Teams links are supported.",
      };
    }
    return { value: normalized };
  } catch (error) {
    return { value: null, error: "Meeting link must be a valid URL." };
  }
}

/**
 * Parse a meeting link input.
 *
 * We keep validation centralized so UI components can stay small and consistent.
 */
export function parseMeetingLink(raw: string): ParsedMeetingLink {
  return normalizeMeetingLink(raw);
}

/**
 * Extract a meeting link from freeform text (description, location, etc.).
 *
 * We scan for URL-like substrings first to avoid false positives in normal text.
 */
export function extractMeetingLinkFromText(text: string): ParsedMeetingLink {
  const trimmed = text.trim();
  if (!trimmed) {
    return { value: null };
  }

  const matches = [...trimmed.matchAll(URL_LIKE_PATTERN)].map((match) => match[0]);
  if (matches.length === 0) {
    return { value: null };
  }

  for (const candidate of matches) {
    const parsed = normalizeMeetingLink(candidate);
    if (parsed.value) {
      return parsed;
    }
  }

  return { value: null, error: "No supported meeting link found." };
}

export const meetingLinkLabels = MEETING_LINK_PATTERNS.map(
  (pattern) => pattern.label,
);
