/**
 * Generates an academic year label (e.g., "2023-2024") based on the given date.
 * The academic year starts in June (month index 5).
 * 
 * @param date - The date to calculate the academic year for. Defaults to current date.
 * @returns A string in "YYYY-YYYY" format.
 */
export const getAcademicYearLabel = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = date.getMonth();
  // Academic year starts in June (month index 5)
  const startYear = month >= 5 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
};

/**
 * Normalizes various year input formats to the standard "YYYY-YYYY" format.
 * Handles:
 * - "YYYY-YYYY" (returns as is)
 * - "YYYY" (converts to "YYYY-YYYY+1")
 * - Strings containing a 4-digit year (extracts first 4-digit match)
 * 
 * @param input - The year string or number to normalize.
 * @returns The normalized "YYYY-YYYY" string, or null if invalid.
 */
export const normalizeYearLabel = (input?: string | number | null): string | null => {
  if (input === null || input === undefined) return null;
  
  const cleaned = String(input).trim();
  if (!cleaned) return null;
  
  const noSpaces = cleaned.replace(/\s+/g, '');
  
  // Format: YYYY-YYYY
  if (/^\d{4}-\d{4}$/.test(noSpaces)) return noSpaces;
  
  // Format: YYYY
  if (/^\d{4}$/.test(noSpaces)) {
    const startYear = Number(noSpaces);
    return `${startYear}-${startYear + 1}`;
  }
  
  // Contains a 4-digit year (fallback)
  const match = noSpaces.match(/\d{4}/);
  if (match) {
    const startYear = Number(match[0]);
    return `${startYear}-${startYear + 1}`;
  }
  
  return null;
};
