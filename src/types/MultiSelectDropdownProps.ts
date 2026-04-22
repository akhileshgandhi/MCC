export interface MultiSelectDropdownProps {
  label: string;
  options: any[];
  selected: string[];
  onChange: (selected: string[]) => void;
  getOptionLabel: (option: any) => string;
  placeholder?: string;
}
