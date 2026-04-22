export interface Column {
  key: string;
  label: string;
  visible: boolean;
  responsiveClass?: string;
  sortKey?: string;
  bgColor?: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface IEPTableProps {
  ieps?: any[];
  columns: Record<string, Column>;
  searchQuery?: string;
  sortConfig?: SortConfig;
  expandedRows: Record<string, boolean>;
  onToggleRow: (id: string) => void;
  onSort: (key: string) => void;
  onToggleColumn: (key: string) => void;
  onRowClick?: (iep: any) => void;
  departmentShortName?: string;
  Reimagined?: string;
  onSearch?: (value: string) => void;
  isMobile?: boolean;
  isTablet?: boolean;
  exportMode?: boolean;
  onExportPdf?: () => void;
  onExportExcel?: () => void;
  isExportingPdf?: boolean;
  onEditIEP?: (iep: any) => void;
  onViewIEP?: (iep: any) => void;
  onDeleteIEP?: (iep: any) => void;
  canEditIEP?: (iep: any) => boolean;
  canDeleteIEP?: (iep: any) => boolean;
  selScorecard?: any;
}
