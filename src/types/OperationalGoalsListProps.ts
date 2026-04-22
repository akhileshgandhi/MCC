export interface OperationalGoalsListProps {
  selectedDepartment: string | null;
  selectedScorecard: string | null;
  selectedIEP: string | null;
  ieps: any[];
  stats: any;
  loading: boolean;
  departments: any[];
  organizationalScorecards: any[];
  allIEPs: any[];
  sp: any;
  currentUser: any;
  usersList: any[];
  onIEPCreated: () => void;
  onSelectDepartment: (id: string) => void;
  isMobile: boolean;
  isTablet: boolean;
  userRole: string;
  handleIEPClick: (scorecardId: string, deptId: string, tagId: string, tagName: string) => void;
  searchTerm: string;
  chartDeptId: any;
  onSearchChange: (term: string) => void;
  onBack: () => void;
  districtMode?: boolean;
  onEditIEP?: (iep: any) => void;
}
