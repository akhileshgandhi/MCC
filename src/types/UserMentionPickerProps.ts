import { User } from './User';

export interface UserMentionPickerProps {
  sp: any;
  onUsersSelected: (users: User[]) => void;
  selectedUsers: User[];
}
