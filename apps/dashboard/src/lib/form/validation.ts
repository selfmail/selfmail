/**
 * Form validation utilities for enhanced user experience
 */

import { FieldValues, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * Enhanced error message formatter for form validation errors
 */
export function getFormErrorMessage(error: any): string {
  if (!error) return "";

  // Handle zod validation errors
  if (error.type === "invalid_type" && error.message) {
    return error.message;
  }

  // Handle custom validation errors
  if (error.type === "custom" && error.message) {
    return error.message;
  }

  // Handle required field errors
  if (error.type === "required") {
    return "This field is required";
  }

  // Handle min/max length errors
  if (error.type === "min" || error.type === "max") {
    return error.message || "Invalid length";
  }

  // Handle pattern validation errors
  if (error.type === "pattern") {
    return error.message || "Invalid format";
  }

  // Handle server-side errors
  if (error.type === "server") {
    return error.message || "Server validation failed";
  }

  // Default error message
  return error.message || "Invalid input";
}

/**
 * Determines if a form field should be marked as invalid for UI feedback
 */
export function isFieldInvalid<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: keyof T,
): boolean {
  return (
    !!form.formState.errors[fieldName as string] &&
    (form.formState.touchedFields[fieldName as string] ||
      form.formState.isSubmitted)
  );
}

/**
 * Configures a form with consistent validation settings
 */
export function getFormConfig<T extends z.ZodType>(schema: T) {
  return {
    resolver: zodResolver(schema),
    mode: "onChange" as const,
    criteriaMode: "all" as const,
    delayError: 500,
    reValidateMode: "onChange" as const,
  };
}

/**
 * Formats error text with proper capitalization and punctuation
 */
export function formatErrorText(text: string): string {
  if (!text) return "";

  // Capitalize first letter if not already capitalized
  let formatted = text.charAt(0).toUpperCase() + text.slice(1);

  // Add period if missing and text doesn't end with !, ? or .
  if (!/[.!?]$/.test(formatted)) {
    formatted += ".";
  }

  return formatted;
}

/**
 * Extracts first error message from form errors for display
 */
export function getFirstFormError<T extends FieldValues>(
  formState: UseFormReturn<T>["formState"],
): string | null {
  const { errors } = formState;

  if (!errors || Object.keys(errors).length === 0) return null;

  // Check for root error first
  if (errors.root?.message) {
    return errors.root.message as string;
  }

  // Get first field error
  const firstErrorKey = Object.keys(errors)[0];
  if (firstErrorKey && errors[firstErrorKey]?.message) {
    return errors[firstErrorKey].message as string;
  }

  return "Form validation failed";
}
