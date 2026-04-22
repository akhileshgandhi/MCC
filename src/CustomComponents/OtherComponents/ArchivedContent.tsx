import React from 'react';
import { Archive, FileText, Calendar, Building, Download, ExternalLink } from 'lucide-react';
import { ArchivedContentProps } from '../../types/ArchivedContentProps';

const ArchivedContent: React.FC<ArchivedContentProps> = ({
  archivedIEPs,
  selectedArchivedYear,
  onDocumentClick,
  isMobile = false
}) => {
  // Filter to show only selected year if one is selected, otherwise show the first year by default
  const displayedYears = selectedArchivedYear 
    ? archivedIEPs.filter(year => year.id === selectedArchivedYear)
    : archivedIEPs.length > 0 
      ? [archivedIEPs[0]] // Default to first year if none selected
      : [];

  // Calculate total documents
  const getTotalDocuments = () => {
    let total = 0;
    displayedYears.forEach(year => {
      // Count documents directly under year
      const yearDocs = year.children?.filter(child => child.type === 'document').length || 0;
      total += yearDocs;
      
      // Count documents under departments
      year.children?.filter(child => child.type === 'department').forEach(dept => {
        total += dept.children?.length || 0;
      });
    });
    return total;
  };
  console.log(displayedYears,'displayedYears');
  

  const totalDocs = getTotalDocuments();

  if (!displayedYears || displayedYears.length === 0) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <Archive size={64} className="text-muted mb-3" />
                <h4 className="text-muted mb-2">No Archived Goals Found</h4>
                <p className="text-muted mb-0">
                  Archived Goal documents will appear here once they are uploaded to the SharePoint library.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid pbbbb">
      {/* Header Section */}
      <div className="row m-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body py-4">
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3 text-white">
                  <Archive color='#0b4f86' size={isMobile ? 32 : 48} />
                  <div>
                    <h2 className={`mb-1  ${isMobile ? 'h4' : 'h2'}`} style={{color:'#0b4f86'}}>Archived Goals Repository</h2>
                    <p className="mb-0 opacity-90" style={{ fontSize: isMobile ? '0.85rem' : '1rem', color:'rgb(113 142 187)' }}>
                      Historical institutional effectiveness plans and documentation
                    </p>
                  </div>
                </div>
                <div className="text-white text-end">
                  <div className="d-flex flex-column gap-1">
                    <div className={`${isMobile ? 'h5' : 'h3'} mb-0 fw-bold`} style={{color:'#0b4f86'}}>{totalDocs}</div>
                    <small className="opacity-90" style={{color:'#0b4f86'}}>Total Documents</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Documents by Year - Organized View */}
      {displayedYears.map((yearFolder) => (
        <div key={yearFolder.id} className="row m-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              {/* Year Header */}
              <div className="card-header bg-light border-0 py-3">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <Calendar size={isMobile ? 20 : 24} className="text-warning" />
                    <div>
                      <h4 className={`mb-0 ${isMobile ? 'h6' : 'h5'}`}>{yearFolder.name}</h4>
                      <small className="text-muted">Academic Year {yearFolder.year}</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {/* <span className="badge bg-secondary">
                      {yearFolder.children?.filter(child => child.type === 'department').length || 0} Departments
                    </span> */}
                    <span className="badge bg-primary">
                      {(yearFolder.children?.filter(child => child.type === 'document').length || 0) + 
                       (yearFolder.children?.filter(child => child.type === 'department').reduce((acc, dept) => acc + (dept.children?.length || 0), 0) || 0)} Documents
                    </span>
                  </div>
                </div>
              </div>

              {/* Departments and Documents */}
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '30%' }}>Department</th>
                        <th style={{ width: '50%' }}>Document</th>
                        <th style={{ width: '20%' }} className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Documents directly under year (no department) */}
                      {yearFolder.children?.filter(child => child.type === 'document').map((doc) => (
                        <tr key={doc.id}>
                          <td className="align-middle bg-light">
                            <div className="d-flex align-items-center gap-2">
                              <Building size={16} className="text-info" />
                              <span className="fw-semibold text-muted">{doc.name}</span>
                            </div>
                          </td>
                          <td className="align-middle">
                            <div className="d-flex align-items-center gap-2">
                              <FileText size={14} className="text-danger flex-shrink-0" />
                              <span>{doc.name}</span>
                            </div>
                          </td>
                          <td className="align-middle text-center">
                            <button type='button'
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                if (doc.documentUrl) {
                                  onDocumentClick(doc.id, doc.documentUrl);
                                }
                              }}
                              title="View document"
                            >
                              <ExternalLink size={14} className="me-1" />
                              {!isMobile && 'View'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      
                      {/* Documents under departments */}
                      {yearFolder.children?.filter(child => child.type === 'department').map((deptFolder) => (
                        <React.Fragment key={deptFolder.id}>
                          {deptFolder.children?.map((doc, index) => (
                            <tr key={doc.id}>
                              {index === 0 && (
                                <td rowSpan={deptFolder.children?.length || 1} className="align-middle bg-light">
                                  <div 
                                    className="d-flex align-items-center gap-2"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                      // When department name is clicked, open the first document
                                      if (deptFolder.children && deptFolder.children.length > 0) {
                                        const firstDoc = deptFolder.children[0];
                                        if (firstDoc.documentUrl) {
                                          onDocumentClick(firstDoc.id, firstDoc.documentUrl);
                                        }
                                      }
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#e3f2fd';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '';
                                    }}
                                    title="Click to view department document"
                                  >
                                    <Building size={16} className="text-info" />
                                    <span className="fw-semibold text-primary">{deptFolder.name}</span>
                                  </div>
                                  <small className="text-muted d-block mt-1">
                                    {deptFolder.children?.length} {deptFolder.children?.length === 1 ? 'document' : 'documents'}
                                  </small>
                                </td>
                              )}
                              <td className="align-middle">
                                <div className="d-flex align-items-center gap-2">
                                  <FileText size={14} className="text-danger flex-shrink-0" />
                                  <span>{doc.name}</span>
                                </div>
                              </td>
                              <td className="align-middle text-center">
                                <button type='button'
                                  className="btn btn-sm btn-primary"
                                  onClick={() => {
                                    if (doc.documentUrl) {
                                      onDocumentClick(doc.id, doc.documentUrl);
                                    }
                                  }}
                                  title="View document"
                                >
                                  <ExternalLink size={14} className="me-1" />
                                  {!isMobile && 'View'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Info Footer */}
      <div className="row m-4">
        <div className="col-12">
          <div className="alert alert-info border-0 d-flex align-items-start gap-3 mb-0">
            <Archive size={24} className="flex-shrink-0 mt-1" />
            <div>
              <h6 className="mb-2">About Archived Goals</h6>
              <ul className="mb-0 ps-3" style={{ fontSize: '0.9rem' }}>
                <li>Click on a department name to view its associated document</li>
                <li>Click "View" button to open any document in the viewer</li>
                <li>Use the "Download" button in the viewer to save documents locally</li>
                <li>All archived documents are read-only and cannot be modified</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchivedContent;
