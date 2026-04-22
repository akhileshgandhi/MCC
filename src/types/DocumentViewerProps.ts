export interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string | null;
  isMobile?: boolean;
}
