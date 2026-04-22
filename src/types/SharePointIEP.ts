export interface SharePointIEP {
  Id: number;
  ID: number;
  Title: string | null;
  OperationalGoal: string;
  OperationalTactic: string;
  PerformanceMeasure: string;
  Target: string;
  BudgetImpactDescription: string;
  OrganizationalGoals: Array<{ Id: number; ScorecardName: string; Vision: string; }>;
  OrganizationGoalAlignment: Array<{ Id: number; OrganizationGoalAlignment: string; Value: string; }>;
  Departments: Array<{ Id: number; DepartmentName: string; DepartmentShortName: string; }>;
  SharedServiceCampusGoalAlignment: Array<{ Id: number; Departments: { DepartmentName: string; }; ThreeYRSharedService: string; }>;
  HLCAlignment: Array<{ Id: number; HLCAlignment: string; Description: string; }>;
}
