/**
 * Contact Helper Utilities
 *
 * Shared utility functions for contact management to avoid code duplication
 * and improve maintainability.
 */

import { Contact } from "@/models/types";

/**
 * Check if a contact's birthday falls within the specified date range
 * Handles year boundaries correctly
 */
export function isBirthdayInRange(
  birthday: string,
  startDate: Date,
  endDate: Date,
): boolean {
  const birthdayDate = new Date(birthday);
  const currentYear = startDate.getFullYear();

  // Create birthday for current year
  const thisYearBirthday = new Date(
    currentYear,
    birthdayDate.getMonth(),
    birthdayDate.getDate(),
  );

  // Check if this year's birthday is in range
  if (thisYearBirthday >= startDate && thisYearBirthday <= endDate) {
    return true;
  }

  // Check if next year's birthday is in range (for year boundaries)
  const nextYearBirthday = new Date(
    currentYear + 1,
    birthdayDate.getMonth(),
    birthdayDate.getDate(),
  );

  return nextYearBirthday >= startDate && nextYearBirthday <= endDate;
}

/**
 * Get the next occurrence of a birthday from today
 * Returns the date for sorting purposes
 */
export function getNextBirthdayDate(birthday: string): Date {
  const birthdayDate = new Date(birthday);
  const today = new Date();
  const currentYear = today.getFullYear();

  // Try this year first
  const thisYearBirthday = new Date(
    currentYear,
    birthdayDate.getMonth(),
    birthdayDate.getDate(),
  );

  if (thisYearBirthday >= today) {
    return thisYearBirthday;
  }

  // Use next year
  return new Date(
    currentYear + 1,
    birthdayDate.getMonth(),
    birthdayDate.getDate(),
  );
}

/**
 * Sort contacts by upcoming birthday (closest first)
 */
export function sortByUpcomingBirthday(contacts: Contact[]): Contact[] {
  return contacts
    .filter((c) => c.birthday)
    .sort((a, b) => {
      const aNext = getNextBirthdayDate(a.birthday!);
      const bNext = getNextBirthdayDate(b.birthday!);
      return aNext.getTime() - bNext.getTime();
    });
}

/**
 * Validate and sanitize tag name
 */
export function validateTag(tag: string): string | null {
  const sanitized = tag.trim();
  if (!sanitized || sanitized.length === 0) return null;
  if (sanitized.length > 50) return null; // Max length
  // Remove special characters that might cause issues
  return sanitized.replace(/[<>]/g, "");
}

/**
 * Validate and sanitize group name
 */
export function validateGroup(group: string): string | null {
  const sanitized = group.trim();
  if (!sanitized || sanitized.length === 0) return null;
  if (sanitized.length > 50) return null; // Max length
  return sanitized.replace(/[<>]/g, "");
}

/**
 * Validate and sanitize note text
 */
export function validateNote(note: string): string | null {
  const sanitized = note.trim();
  if (!sanitized || sanitized.length === 0) return null;
  if (sanitized.length > 5000) return null; // Max length
  return sanitized;
}

/**
 * Check if two contacts are potential duplicates
 */
export function arePotentialDuplicates(
  contact1: Contact,
  contact2: Contact,
): boolean {
  // Check for exact name match (case-insensitive)
  if (contact1.name.toLowerCase() === contact2.name.toLowerCase()) {
    return true;
  }

  // Check for matching phone numbers using Set for O(1) lookup
  if (contact1.phoneNumbers.length > 0 && contact2.phoneNumbers.length > 0) {
    const phoneSet = new Set(contact2.phoneNumbers);
    if (contact1.phoneNumbers.some((p) => phoneSet.has(p))) {
      return true;
    }
  }

  // Check for matching email addresses using Set for O(1) lookup
  if (contact1.emails.length > 0 && contact2.emails.length > 0) {
    const emailSet = new Set(contact2.emails);
    if (contact1.emails.some((e) => emailSet.has(e))) {
      return true;
    }
  }

  return false;
}

/**
 * Search contact by query string
 * Returns true if contact matches the query
 */
export function matchesSearchQuery(contact: Contact, query: string): boolean {
  const lowerQuery = query.toLowerCase();

  // Search in name
  if (contact.name.toLowerCase().includes(lowerQuery)) return true;

  // Search in emails
  if (contact.emails.some((e) => e.toLowerCase().includes(lowerQuery))) {
    return true;
  }

  // Search in phone numbers
  if (contact.phoneNumbers.some((p) => p.includes(lowerQuery))) return true;

  // Search in company
  if (contact.company?.toLowerCase().includes(lowerQuery)) return true;

  // Search in tags
  if (contact.tags?.some((t) => t.toLowerCase().includes(lowerQuery))) {
    return true;
  }

  // Search in notes
  if (contact.notes?.some((n) => n.text.toLowerCase().includes(lowerQuery))) {
    return true;
  }

  return false;
}
