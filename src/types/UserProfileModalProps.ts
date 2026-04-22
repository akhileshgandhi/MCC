export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    contactNumber?: string;
  };
  usersList: any;
}
