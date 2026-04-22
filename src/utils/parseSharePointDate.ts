export const parseSharePointDate = (value: any): Date | null => {
  if (!value) return null;
  if (typeof value === 'string' && value.startsWith('/Date(')) {
    const match = value.match(/\/Date\((\d+)\)\//);
    if (match) {
      const ms = parseInt(match[1], 10);
      return new Date(ms);
    }
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
};
