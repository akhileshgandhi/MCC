export { getAcademicYearLabel, normalizeYearLabel } from './academicYearHelpers';


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
