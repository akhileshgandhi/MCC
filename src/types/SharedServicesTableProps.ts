export interface Service {
  Id: number;
  ThreeYRSharedService: string;
  DepartmentId: number | null;
  DepartmentName: string;
}

export interface SharedServicesTableProps {
  sharedServices: Service[];
  departments: { id: number; departmentName: string }[];
  onEdit: (item: Service) => void;
  onDelete: (id: number) => void;
}

export type SortField = 'ThreeYRSharedService' | 'DepartmentName';
export type SortDirection = 'asc' | 'desc' | null;
