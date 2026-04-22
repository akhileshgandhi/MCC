export interface DiscussionSidebarProps {
  sp: any;
  iepId: number;
  departmentId: number;
  currentUser: any;
  isMobile?: boolean;
}

export interface Comment {
  Id: number;
  Comment: string;
  ParentCommentId?: number;
  Author: {
    Id: number;
    Title: string;
  };
  Created: string;
  MentionedUsers?: any[];
  replies?: Comment[];
}
