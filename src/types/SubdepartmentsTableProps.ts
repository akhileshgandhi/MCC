export interface Subdept {
  Id: number;
  SubDepartmentName: string;
  DepartmentId: number | null;
  DepartmentShortName: string;
  Remark: string;
}

export interface SubdepartmentsTableProps {
  subdepartments: Subdept[];
  departments: { Id: number; DepartmentShortName: string }[];
  onEdit: (item: Subdept) => void;
  onDelete: (id: number) => void;
}

export type SortField = 'SubDepartmentName' | 'Department' | 'Remark';
export type SortDirection = 'asc' | 'desc' | null;
