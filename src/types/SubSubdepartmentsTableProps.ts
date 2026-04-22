export interface SubSubdept {
  Id: number;
  SubSubDepartmentName: string;
  SubDepartmentId: number | null;
  Remark: string;
}

export interface SubSubdepartmentsTableProps {
  subsubdepartments: SubSubdept[];
  subdepartments: { Id: number; SubDepartmentName: string }[];
  onEdit: (item: SubSubdept) => void;
  onDelete: (id: number) => void;
}

export type SortField = 'SubSubDepartmentName' | 'SubDepartment' | 'Remark';
export type SortDirection = 'asc' | 'desc' | null;
