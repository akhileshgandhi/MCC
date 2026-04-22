export interface RecentIEPsContentProps {
  allIEPs: any[];
  onIEPClick?: (iep: any) => void;
  onEditIEP?: (iep: any) => void;
  onDeleteIEP?: (iep: any) => void;
  canEditIEP?: (iep: any) => boolean;
  canDeleteIEP?: (iep: any) => boolean;
  isMobile?: boolean;
  isTablet?: boolean;
}
