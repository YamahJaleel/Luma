/**
 * Utility functions for normalizing display names and text
 */

/**
 * Normalize a display name for different purposes
 * @param {string} displayName - The display name to normalize
 * @param {object} options - Normalization options
 * @param {boolean} options.lowercase - Convert to lowercase (default: true)
 * @param {boolean} options.removeSpaces - Remove all spaces (default: true)
 * @param {boolean} options.removeSpecialChars - Remove special characters (default: false)
 * @param {boolean} options.trim - Trim whitespace (default: true)
 * @returns {string} Normalized string
 */
export const normalizeDisplayName = (displayName, options = {}) => {
  if (!displayName || typeof displayName !== 'string') {
    return '';
  }

  const {
    lowercase = true,
    removeSpaces = true,
    removeSpecialChars = false,
    trim = true
  } = options;

  let normalized = displayName;

  if (trim) normalized = normalized.trim();
  if (lowercase) normalized = normalized.toLowerCase();
  if (removeSpaces) normalized = normalized.replace(/\s+/g, '');
  if (removeSpecialChars) normalized = normalized.replace(/[^a-z0-9]/g, '');

  return normalized;
};

/**
 * Generate a username-style display from a display name
 * @param {string} displayName - The display name
 * @returns {string} Username with @ prefix
 */
export const generateUsername = (displayName) => {
  const normalized = normalizeDisplayName(displayName);
  return normalized ? `@${normalized}` : '@user';
};

/**
 * Normalize text for search purposes
 * @param {string} text - Text to normalize for search
 * @returns {string} Normalized text
 */
export const normalizeForSearch = (text) => {
  return normalizeDisplayName(text, {
    lowercase: true,
    removeSpaces: false, // Keep spaces for search
    removeSpecialChars: false,
    trim: true
  });
};

/**
 * Normalize text for URL/slug purposes
 * @param {string} text - Text to normalize for URL
 * @returns {string} URL-friendly string
 */
export const normalizeForUrl = (text) => {
  return normalizeDisplayName(text, {
    lowercase: true,
    removeSpaces: true,
    removeSpecialChars: true,
    trim: true
  });
};

/**
 * Check if two display names are the same (case-insensitive, space-insensitive)
 * @param {string} name1 - First display name
 * @param {string} name2 - Second display name
 * @returns {boolean} True if names are the same
 */
export const areDisplayNamesEqual = (name1, name2) => {
  const normalized1 = normalizeDisplayName(name1);
  const normalized2 = normalizeDisplayName(name2);
  return normalized1 === normalized2;
};

/**
 * Check if a search term matches a display name
 * @param {string} searchTerm - The search term
 * @param {string} displayName - The display name to search in
 * @returns {boolean} True if search term matches
 */
export const matchesSearch = (searchTerm, displayName) => {
  const normalizedSearch = normalizeForSearch(searchTerm);
  const normalizedDisplayName = normalizeForSearch(displayName);
  return normalizedDisplayName.includes(normalizedSearch);
};
