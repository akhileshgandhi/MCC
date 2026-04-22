export const getAcademicYearLabel = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const startYear = month >= 5 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
};

export const normalizeYearLabel = (input?: string | number | null): string | null => {
  if (input === null || input === undefined) return null;
  const cleaned = String(input).trim();
  if (!cleaned) return null;
  const noSpaces = cleaned.replace(/\s+/g, '');
  if (/^\d{4}-\d{4}$/.test(noSpaces)) return noSpaces;
  if (/^\d{4}$/.test(noSpaces)) {
    const startYear = Number(noSpaces);
    return `${startYear}-${startYear + 1}`;
  }
  const match = noSpaces.match(/\d{4}/);
  if (match) {
    const startYear = Number(match[0]);
    return `${startYear}-${startYear + 1}`;
  }
  return null;
};

export const DEFAULT_SCORECARD_KEYWORD = 'mcc';

export const getDefaultScorecardKey = (scorecardsData: any[] = []) => {
  if (!scorecardsData.length) return null;
  const preferred = scorecardsData.find(
    (scorecard: any) => scorecard?.ScorecardName?.toLowerCase().includes(DEFAULT_SCORECARD_KEYWORD)
  );
  const target = preferred || scorecardsData[0];
  return target?.Id ? `scorecard-${target.Id}` : null;
};

export const extractScorecardId = (scorecardKey: string | null) => {
  if (!scorecardKey) return null;
  const numeric = scorecardKey.replace('scorecard-', '');
  const parsed = parseInt(numeric, 10);
  return Number.isNaN(parsed) ? null : parsed;
};
