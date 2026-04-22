/**
 * Extract numeric ID from string key (e.g., 'scorecard-123' -> 123)
 */
export const extractNumericId = (key: string | null, prefix: string): number | null => {
  if (!key) return null;
  const numeric = key.replace(prefix, '');
  const parsed = parseInt(numeric, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Extract scorecard ID from scorecard key
 */
export const extractScorecardIdFromKey = (scorecardKey: string | null): number | null => {
  return extractNumericId(scorecardKey, 'scorecard-');
};

/**
 * Extract department ID from department key
 */
export const extractDepartmentIdFromKey = (deptKey: string | null): number | null => {
  return extractNumericId(deptKey, 'dept-');
};

/**
 * Extract sub-department ID from sub-department key
 */
export const extractSubDepartmentIdFromKey = (subDeptKey: string | null): number | null => {
  if (!subDeptKey) return null;
  // Handle both 'sub-123' and 'sub-123-456' formats
  const parts = subDeptKey.replace('sub-', '').split('-');
  const parsed = parseInt(parts[0], 10);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * Extract sub-sub-department ID from sub-sub-department key
 */
export const extractSubSubDepartmentIdFromKey = (subSubDeptKey: string | null): number | null => {
  if (!subSubDeptKey) return null;
  // Handle format 'subsub-123-456' or from sub-123-456
  const parts = subSubDeptKey.replace('subsub-', '').split('-');
  if (parts.length >= 2) {
    const parsed = parseInt(parts[1], 10);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};
