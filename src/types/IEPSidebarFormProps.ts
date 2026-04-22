export interface IEPSidebarFormProps {
  selScorecard: any;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  editingIEP: any;
  isOperationalGoalLocked?: boolean;
  departments: any[];
  organizationalScorecards: any[];
  orgGoalOptions: any[];
  threeYrOptions: any[];
  hlcOptions: any[];
  tagOptions: Array<{ Id: number; Tag: string; TagType?: string }>;
  subDepartments: Array<{ Id: number; SubDepartmentName: string }>;
  subSubDepartments?: Array<{ Id: number; SubSubDepartmentName: string }>;
  selectedSubDeptId: string;
  setSelectedSubDeptId: (v: string) => void;
  selectedSubSubDeptId?: string;
  setSelectedSubSubDeptId?: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  userRole: string;
}
