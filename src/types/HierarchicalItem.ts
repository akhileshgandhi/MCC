export interface HierarchicalItem {
  id: string;
  name: string;
  type?: 'department' | 'scorecard' | 'section' | string;
  description?: string;
  year?: string;
  head?: string;
  children?: HierarchicalItem[];
  iepCount?: number;
  iepIds?: number[];
  departmentId?: number;
  scorecardId?: number;
  directIepCount?: number;
}
