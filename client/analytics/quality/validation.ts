/**
 * Runtime Data Validation
 *
 * Validates event data at runtime against schema rules.
 * Catches invalid data before sending to backend.
 *
 * TODO: Implement validation similar to Amplitude's data validation
 * - Type checking for properties
 * - Range validation for numeric values
 * - Enum validation for categorical values
 * - Custom validation rules
 */

import { AnalyticsEvent, EventName } from "../types";

export interface ValidationRule {
  field: string;
  type: "string" | "number" | "boolean" | "enum";
  required: boolean;
  min?: number;
  max?: number;
  enum?: any[];
  custom?: (value: any) => boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class RuntimeValidator {
  /**
   * TODO: Validate event against rules
   */
  validate(event: AnalyticsEvent): ValidationResult {
    // Placeholder: always valid
    return { valid: true, errors: [] };
  }

  /**
   * TODO: Add validation rule
   */
  addRule(eventName: EventName, rule: ValidationRule): void {
    throw new Error("Not implemented");
  }
}
