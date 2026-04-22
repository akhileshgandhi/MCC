import { HierarchicalItem } from './HierarchicalItem';
import { SharePointIEP } from './SharePointIEP';
import { ArchivedIEPHierarchy } from '../APIsServices/ArchivedIEPService';

export interface SidebarProps {
  sidebarOpen: boolean;
  activePage: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  currentData: any[];
  expandedSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  selectedDepartment: string | null;
  selectedScorecard: string | null;
  selectedIEP: string | null;
  onDepartmentClick: (id: string, name: string) => void;
  onScorecardClick: (id: string, name: string) => void;
  onIEPClick: (scorecardId: string, deptId: string, tagId: string, tagName: string) => void;
  getSafeExpandedState: (id: string) => boolean;
  onPageChange: (page: string) => void;
  iepsData?: SharePointIEP[];
  archivedIEPs?: ArchivedIEPHierarchy[];
  onArchivedDocumentClick?: (documentId: string, documentUrl: string) => void;
  onArchivedYearClick?: (yearId: string) => void;
  selectedArchivedDocument?: string | null;
  selectedArchivedYear?: string | null;
  isMobile?: boolean;
  isTablet?: boolean;
  userRole: string;
}
