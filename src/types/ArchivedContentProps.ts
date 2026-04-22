import { ArchivedIEPHierarchy } from './ArchivedIEPServiceTypes';

export interface ArchivedContentProps {
  archivedIEPs: ArchivedIEPHierarchy[];
  selectedArchivedYear?: string | null;
  onDocumentClick: (documentId: string, documentUrl: string) => void;
  isMobile?: boolean;
}
