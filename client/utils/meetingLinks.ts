// Re-export shared meeting link helpers to keep client + server validation aligned.
export {
  extractMeetingLinkFromText,
  meetingLinkLabels,
  meetingLinkSchema,
  parseMeetingLink,
} from "@shared/meetingLinks";

export type { ParsedMeetingLink } from "@shared/meetingLinks";
