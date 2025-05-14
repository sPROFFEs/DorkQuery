// This file contains utilities for validating challenge solutions

/**
 * Validates a flag submission for a challenge
 * @param submittedFlag The flag submitted by the user
 * @param correctFlag The correct flag for the challenge
 * @returns True if the flag is correct, false otherwise
 */
export const validateFlag = (submittedFlag: string, correctFlag: string): boolean => {
  // Trim whitespace and make case-insensitive comparison
  return submittedFlag.trim().toLowerCase() === correctFlag.toLowerCase();
};

/**
 * Validates user code for a course module
 * @param code The code submitted by the user
 * @param validationFn JavaScript function (as string) that validates the code
 * @returns True if the code passes validation, false otherwise
 */
export const validateCode = (code: string, validationFn: string): boolean => {
  try {
    // Use Function constructor to create a function from the string
    const validateFunction = new Function('code', validationFn + '\nreturn validateCode(code);');
    return validateFunction(code);
  } catch (error) {
    console.error('Error validating code:', error);
    return false;
  }
};

/**
 * Sanitizes HTML content to prevent XSS
 * @param html The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHTML = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.textContent = html;
  return tempDiv.innerHTML;
};