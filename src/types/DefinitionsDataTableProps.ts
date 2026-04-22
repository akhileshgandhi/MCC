export interface DefinitionsDataTableProps {
  definitions: any[];
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
}

export type SortField = 'Term' | 'Definition' | 'Section';
export type SortDirection = 'asc' | 'desc' | null;
