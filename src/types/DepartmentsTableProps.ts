export interface Dept {
  Id: number;
  DepartmentName: string;
  HeadOfDepartment: string;
  HeadOfDepartmentId: number | null;
  DepartmentShortName: string;
  Vision: string;
  Mission: string;
}

export interface DepartmentsTableProps {
  departments: Dept[];
  siteUsers: { id: number; title: string }[];
  onEdit: (item: Dept) => void;
  onDelete: (id: number) => void;
}

export type SortField = 'DepartmentName' | 'HeadOfDepartment' | 'DepartmentShortName' | 'Vision' | 'Mission';
export type SortDirection = 'asc' | 'desc' | null;
