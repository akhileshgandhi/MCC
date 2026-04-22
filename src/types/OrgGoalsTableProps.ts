export interface OrgGoal {
  Id: string | number;
  OrganizationalGoalAlignment: string;
  Value: string;
  Tag?: string;
}

export interface OrgGoalsTableProps {
  orgGoals: OrgGoal[];
  onEdit: (goal: OrgGoal) => void;
  onDelete: (id: string | number) => void;
}

export type SortField = 'OrganizationalGoalAlignment' | 'Value' | 'Tag';
export type SortDirection = 'asc' | 'desc' | null;
