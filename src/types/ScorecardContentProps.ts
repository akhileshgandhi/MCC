export interface IEPFormData {
  OperationalGoal: string;
  OperationalTactic: string;
  PerformanceMeasure: string;
  PerformanceMeasureResults: string;
  ResultsMet: string;
  ContinuousImprovement: string;
  FutureBudgetImpact: string;
  IfYesPleaseDescribe: string;
  StartDate: string;
  EndDate: string;
  Priority: string;
  Target: string;
  // BudgetImpactDescription: string;
  OrganizationalGoals: string;
  Departments: string;
  DepartmentsId: number | null;
  SubDepartmentId: string;
  SubSubDepartmentId?: string;
  OrganizationGoalAlignment: string[];
  HLCAlignment: string[];
  SharedServiceCampusGoalAlignment: string[];
  TagId?: string;
  Tags?: string[];
}

export interface IEP {
  Id: number;
  OperationalGoal?: string;
  OperationalTactic?: string;
  PerformanceMeasure?: string;
  PerformanceMeasureResults?: string;
  ResultsMet?: string;
  ContinuousImprovement?: string;
  FutureBudgetImpact?: string;
  IfYesPleaseDescribe?: string;
  StartDate?: string;
  EndDate?: string;
  Priority?: string;
  Target?: string;
  BudgetImpactDescription?: string;
  OrganizationGoalAlignment?: OrganizationGoalAlignment[];
  HLCAlignment?: HLCAlignment[];
  SharedServiceCampusGoalAlignment?: SharedServiceCampusGoalAlignment[];
  SubDepartments?: { Id: number };
  SubSubDepartments?: { Id: number };
  Departments?: { Id: number };
  Modified?: string;
  Created?: string;
}

export interface OrganizationGoalAlignment {
  OrganizationalGoalAlignment?: string;
  Value?: string;
  Tag?: string;
  Id?: number;
}

export interface HLCAlignment {
  HLCAlignment?: string;
  Description?: string;
  Id?: number;
}

export interface SharedServiceCampusGoalAlignment {
  ThreeYRSharedService?: string;
  Id?: number;
}

export interface StatusSegment {
  key: string;
  label: string;
  color: string;
}

export interface SummaryBreakdown {
  label: string;
  count: number;
  color: string;
}
