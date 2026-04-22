export interface AddEditFormProps {
  show: boolean;
  currentForm: string;
  editingId: number | null;
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  lookupData: any;
  sp: any;
  onSave: () => void;
  onClose: () => void;
  isSubmitting: boolean;
}
