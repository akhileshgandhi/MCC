export interface Stats {
  totalScorecards: number;
  totalIEPs: number;
  activeIEPs: number;
  highPriorityIEPs: number;
}

export interface OrganizationalScorecard {
  Id: number;
  ScorecardName: string;
  Description?: string;
  Year: string;
  Mission?: string;
}

export interface NoSelectionViewProps {
  stats: Stats;
  organizationalScorecards: OrganizationalScorecard[];
}
