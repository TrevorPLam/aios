export function formatTimeForDisplay(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTimeForInput(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function parseTimeInput(
  input: string,
  referenceDate: Date,
): { date?: Date; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { error: "Enter a time in 24-hour format (HH:MM)." };
  }

  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!match) {
    return { error: "Use 24-hour format like 09:30." };
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return { error: "Time values must be numeric." };
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return { error: "Time must be between 00:00 and 23:59." };
  }

  const nextDate = new Date(referenceDate);
  nextDate.setHours(hours, minutes, 0, 0);
  return { date: nextDate };
}
