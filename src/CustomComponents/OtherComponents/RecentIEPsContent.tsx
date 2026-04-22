import React, { useState, useMemo } from 'react';
import { Eye, PencilLine, Trash2, Filter, Download } from 'lucide-react';
import DOMPurify from 'dompurify';

interface RecentIEPsContentProps {
  allIEPs: any[];
  onIEPClick?: (iep: any) => void;
  onEditIEP?: (iep: any) => void;
  onDeleteIEP?: (iep: any) => void;
  canEditIEP?: (iep: any) => boolean;
  canDeleteIEP?: (iep: any) => boolean;
  isMobile?: boolean;
  isTablet?: boolean;
}

const RecentIEPsContent: React.FC<RecentIEPsContentProps> = ({
  allIEPs = [],
  onIEPClick,
  onEditIEP,
  onDeleteIEP,
  canEditIEP,
  canDeleteIEP,
  isMobile = false,
  isTablet = false,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'department'>('date');

  const getIEPStatus = (iep: any): string => {
    if (!iep.ResultsMet) return 'Not Defined';
    const status = iep.ResultsMet.toLowerCase();
    if (status.includes('completed')) return 'Completed';
    if (status.includes('partially')) return 'Partially Completed';
    if (status.includes('not')) return 'Not Completed';
    return 'Not Defined';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Completed':
        return '#28a745';
      case 'Partially Completed':
        return '#ffc107';
      case 'Not Completed':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const recentIEPs = useMemo(() => {
    let filtered = allIEPs
      .filter(iep => iep.OperationalGoal)
      .sort((a, b) => {
        const dateA = new Date(a.Modified || a.Created).getTime();
        const dateB = new Date(b.Modified || b.Created).getTime();
        return dateB - dateA;
      });

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(iep => getIEPStatus(iep) === filterStatus);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(iep =>
        iep.OperationalGoal?.toLowerCase().includes(query) ||
        iep.Departments?.DepartmentName?.toLowerCase().includes(query) ||
        iep.OperationalTactic?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    if (sortBy === 'department') {
      filtered.sort((a, b) => {
        const deptA = a.Departments?.DepartmentName || '';
        const deptB = b.Departments?.DepartmentName || '';
        return deptA.localeCompare(deptB);
      });
    }

    return filtered;
  }, [allIEPs, filterStatus, searchQuery, sortBy]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    const sanitized = DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
    if (sanitized.length <= maxLength) return sanitized;
    return sanitized.substring(0, maxLength) + '...';
  };

  return (
    <div className="container-fluid p-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-2">Recent Goals</h3>
        <p className="text-muted mb-0">View and manage all recently modified Institutional Effectiveness Plans</p>
      </div>

      {/* Filters and Search */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3">
            {/* Search */}
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Filter size={16} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by goal, department, or tactic..."
                  value={searchQuery}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Partially Completed">Partially Completed</option>
                <option value="Not Completed">Not Completed</option>
                <option value="Not Defined">Not Defined</option>
              </select>
            </div>

            {/* Sort */}
            <div className="col-md-3">
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'department')}
              >
                <option value="date">Sort by Date</option>
                <option value="department">Sort by Department</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-3 d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Showing {recentIEPs.length} of {allIEPs.filter(iep => iep.OperationalGoal).length} Goals
            </small>
            {(filterStatus !== 'all' || searchQuery) && (
              <button
                className="btn btn-sm btn-link text-decoration-none"
                onClick={() => {
                  setFilterStatus('all');
                  setSearchQuery('');
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* IEPs List */}
      {recentIEPs.length === 0 ? (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <p className="text-muted mb-0">No Goals found matching your criteria</p>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {recentIEPs.map((iep) => {
            const status = getIEPStatus(iep);
            const statusColor = getStatusColor(status);
            const modifiedDate = formatDate(iep.Modified || iep.Created);
            const departmentName = iep.Departments?.DepartmentName || 'General';

            return (
              <div key={iep.Id} className="col-12">
                <div
                  className="card shadow-sm border-0 h-100"
                  style={{
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: onIEPClick ? 'pointer' : 'default'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
                  }}
                >
                  <div className="card-body">
                    <div className="row align-items-start">
                      {/* Status Indicator */}
                      <div className="col-auto">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: isMobile ? '40px' : '48px',
                            height: isMobile ? '40px' : '48px',
                            backgroundColor: statusColor,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: isMobile ? '0.9rem' : '1rem'
                          }}
                        >
                          {departmentName[0]?.toUpperCase() || 'G'}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="col">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="flex-grow-1">
                            <h6
                              className="fw-bold text-dark mb-1"
                              onClick={() => onIEPClick && onIEPClick(iep)}
                              style={{ cursor: onIEPClick ? 'pointer' : 'default' }}
                            >
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(
                                    truncateText(iep.OperationalGoal, isMobile ? 60 : 100)
                                  )
                                }}
                              />
                            </h6>
                            <div className="d-flex flex-wrap gap-2 align-items-center">
                              <span className="badge" style={{ backgroundColor: '#e9ecef', color: '#495057' }}>
                                {departmentName}
                              </span>
                              <span
                                className="badge"
                                style={{ backgroundColor: statusColor, color: 'white' }}
                              >
                                {status}
                              </span>
                              <small className="text-muted">
                                Last updated: {modifiedDate}
                              </small>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {!isMobile && (
                            <div className="d-flex gap-2">
                              {onIEPClick && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => onIEPClick(iep)}
                                  title="View Goal"
                                >
                                  <Eye size={16} />
                                </button>
                              )}
                              {onEditIEP && (!canEditIEP || canEditIEP(iep)) && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => onEditIEP(iep)}
                                  title="Edit Goal"
                                >
                                  <PencilLine size={16} />
                                </button>
                              )}
                              {onDeleteIEP && (!canDeleteIEP || canDeleteIEP(iep)) && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => onDeleteIEP(iep)}
                                  title="Delete Goal"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Tactic Preview */}
                        {iep.OperationalTactic && (
                          <p className="text-muted small mb-0">
                            <span
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                  truncateText(iep.OperationalTactic, isMobile ? 80 : 150)
                                )
                              }}
                            />
                          </p>
                        )}

                        {/* Mobile Actions */}
                        {isMobile && (
                          <div className="d-flex gap-2 mt-3">
                            {onIEPClick && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary flex-fill"
                                onClick={() => onIEPClick(iep)}
                              >
                                <Eye size={14} className="me-1" /> View
                              </button>
                            )}
                            {onEditIEP && (!canEditIEP || canEditIEP(iep)) && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary flex-fill"
                                onClick={() => onEditIEP(iep)}
                              >
                                <PencilLine size={14} className="me-1" /> Edit
                              </button>
                            )}
                            {onDeleteIEP && (!canDeleteIEP || canDeleteIEP(iep)) && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger flex-fill"
                                onClick={() => onDeleteIEP(iep)}
                              >
                                <Trash2 size={14} className="me-1" /> Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentIEPsContent;
