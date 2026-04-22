export interface GlobalGoalsTableProps {
  data: any[];
  onEdit: (goal: any) => void;
  onDelete: (id: number) => void;
  currentUser: any;
}
