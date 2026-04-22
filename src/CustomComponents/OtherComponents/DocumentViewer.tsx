import React from 'react';
import { X, Download, ExternalLink, Maximize2 } from 'lucide-react';
import { DocumentViewerProps } from '../../types/DocumentViewerProps';

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  isOpen,
  onClose,
  documentUrl,
  isMobile = false
}) => {
  if (!isOpen || !documentUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentUrl.split('/').pop() || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(documentUrl, '_blank');
  };

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
      style={{ 
        zIndex: 9999, 
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded shadow-lg position-relative" 
        style={{ 
          width: isMobile ? '95%' : '90%', 
          height: isMobile ? '90%' : '90%',
          maxWidth: '1400px',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="d-flex align-items-center justify-content-between p-3 border-bottom bg-light"
          style={{ borderTopLeftRadius: '0.375rem', borderTopRightRadius: '0.375rem' }}
        >
          <h5 className={`mb-0 fw-semibold ${isMobile ? 'small' : ''}`}>
            Document Viewer
          </h5>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
              onClick={handleDownload}
              title="Download document"
            >
              <Download size={16} />
              {!isMobile && <span>Download</span>}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
              onClick={handleOpenInNewTab}
              title="Open in new tab"
            >
              <ExternalLink size={16} />
              {!isMobile && <span>Open</span>}
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
              onClick={onClose}
              title="Close viewer"
            >
              <X size={16} />
              {!isMobile && <span>Close</span>}
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-grow-1 position-relative" style={{ overflow: 'hidden' }}>
          <iframe
            src={`${documentUrl}#view=FitH`}
            className="w-100 h-100 border-0"
            title="Document Viewer"
            style={{ 
              display: 'block',
              backgroundColor: '#f5f5f5'
            }}
          />
        </div>

        {/* Footer */}
        <div className="p-2 border-top bg-light text-center">
          <small className="text-muted">
            {documentUrl.split('/').pop()}
          </small>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
