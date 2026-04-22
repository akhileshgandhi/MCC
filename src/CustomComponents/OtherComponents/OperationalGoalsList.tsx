import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronRight, Target, Users, Building, CheckCircle, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import DOMPurify from 'dompurify';
import { stripHtml } from '../HelperCustomComponents/Alluse';
import IEPDetailsView from './IEPDetailsView';

// Helper function to decode HTML entities and sanitize
const decodeAndSanitizeHtml = (html: string): string => {
  if (!html) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  const decoded = textarea.value;
  return DOMPurify.sanitize(decoded);
};

interface OperationalGoalsListProps {
  selectedDepartment: string | null;
  selectedScorecard: string | null;
  selectedIEP: string | null;
  ieps: any[];
  stats: any;
  loading: boolean;
  departments: any[];
  organizationalScorecards: any[];
  allIEPs: any[];
  sp: any;
  currentUser: any;
  usersList: any[];
  onIEPCreated: () => void;
  onSelectDepartment: (id: string) => void;
  isMobile: boolean;
  isTablet: boolean;
  userRole: string;
  handleIEPClick: (scorecardId: string, deptId: string, tagId: string, tagName: string) => void;
  searchTerm: string;
  chartDeptId: any;
  onSearchChange: (term: string) => void;
  onBack: () => void;
  districtMode?: boolean;
  onEditIEP?: (iep: any) => void;
}

const OperationalGoalsList: React.FC<OperationalGoalsListProps> = ({
  selectedDepartment,
  selectedScorecard,
  selectedIEP,
  ieps,
  stats,
  loading,
  departments,
  organizationalScorecards,
  allIEPs,
  sp,
  currentUser,
  usersList,
  onIEPCreated,
  onSelectDepartment,
  isMobile,
  isTablet,
  userRole,
  handleIEPClick,
  searchTerm,
  chartDeptId,
  onSearchChange,
  onBack,
  districtMode = false,
  onEditIEP
}) => {
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedOrgGoalAlignment, setSelectedOrgGoalAlignment] = useState<string>('');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'department'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIEPDetail, setSelectedIEPDetail] = useState<any>(null);

  // Filter allIEPs once by chartDeptId
  const currentDeptIEPs = useMemo(() => {
    if (districtMode) return allIEPs;
    if (!chartDeptId) return [];
    return allIEPs.filter(iep => iep.Departments?.Id === chartDeptId);
  }, [allIEPs, chartDeptId, districtMode]);

  // Get unique tags from current department IEPs (from OrganizationGoalAlignment)
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    currentDeptIEPs.forEach(iep => {
      // Get tags from OrganizationGoalAlignment instead of Tag field
      const orgAlignments = iep.OrganizationGoalAlignment || [];
      orgAlignments.forEach((org: any) => {
        if (org.Tag && org.Tag.trim()) {
          tags.add(org.Tag.trim());
        }
      });
    });
    return Array.from(tags).sort();
  }, [currentDeptIEPs]);

  // Get unique organizational goal alignments
  const allOrgGoalAlignments = useMemo(() => {
    const alignments = new Set<string>();
    currentDeptIEPs.forEach(iep => {
      const orgAlignments = iep.OrganizationGoalAlignment || [];
      orgAlignments.forEach((org: any) => {
        if (org.OrganizationalGoalAlignment && org.OrganizationalGoalAlignment.trim()) {
          alignments.add(org.OrganizationalGoalAlignment.trim());
        }
      });
    });
    return Array.from(alignments).sort();
  }, [currentDeptIEPs]);

  // Get unique sub-departments
  const allDepartments = useMemo(() => {
    const depts = new Set<string>();
    currentDeptIEPs.forEach(iep => {
      if (iep.SubDepartments?.SubDepartmentName) {
        depts.add(iep.SubDepartments.SubDepartmentName);
      }
    });
    return Array.from(depts).sort();
  }, [currentDeptIEPs]);

  // Filter IEPs (ieps is already department-filtered)
  const filteredIEPs = useMemo(() => {
    let filtered = [...ieps];

    // Filter by tag (from OrganizationGoalAlignment)
    if (selectedTag) {
      filtered = filtered.filter(iep => {
        const orgAlignments = iep.OrganizationGoalAlignment || [];
        return orgAlignments.some((org: any) => org.Tag?.trim() === selectedTag);
      });
    }

    // Filter by organizational goal alignment
    if (selectedOrgGoalAlignment) {
      filtered = filtered.filter(iep => {
        const orgAlignments = iep.OrganizationGoalAlignment || [];
        return orgAlignments.some((org: any) => org.OrganizationalGoalAlignment?.trim() === selectedOrgGoalAlignment);
      });
    }

    // Filter by sub-department
    if (selectedDepartmentFilter) {
      filtered = filtered.filter(iep => iep.SubDepartments?.SubDepartmentName === selectedDepartmentFilter);
    }

    // Search filter (KPI fields removed)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(iep =>
        [
          iep.OperationalGoal,
          iep.OperationalTactic,
          iep.SubDepartments?.SubDepartmentName,
          iep.SubSubDepartments?.SubSubDepartmentName
        ].some(field => field && field.toString().toLowerCase().includes(term))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.Modified || a.Created).getTime();
          bValue = new Date(b.Modified || b.Created).getTime();
          break;
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          aValue = priorityOrder[a.Priority] || 0;
          bValue = priorityOrder[b.Priority] || 0;
          break;
        case 'department':
          aValue = a.SubDepartments?.SubDepartmentName || '';
          bValue = b.SubDepartments?.SubDepartmentName || '';
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });

    return filtered;
  }, [ieps, selectedTag, selectedOrgGoalAlignment, selectedDepartmentFilter, searchTerm, sortBy, sortOrder]);

  // Group by Organizational Goal Alignment, then by Tag
  const groupedByGoal = useMemo(() => {
    const groups: Record<string, Record<string, any[]>> = {};
    const scope = districtMode
      ? filteredIEPs
      : filteredIEPs.filter(iep => iep.Departments?.Id === chartDeptId);
    
    scope.forEach(iep => {
      const orgAlignments = iep.OrganizationGoalAlignment || [];
      if (orgAlignments.length > 0) {
        orgAlignments.forEach((org: any) => {
          const orgGoalAlignment = org.OrganizationalGoalAlignment?.trim();
          const tagName = org.Tag?.trim();
          
          // Only add if both orgGoalAlignment and tagName exist
          if (orgGoalAlignment && tagName && tagName.toLowerCase() !== 'uncategorized') {
            if (!groups[orgGoalAlignment]) {
              groups[orgGoalAlignment] = {};
            }
            if (!groups[orgGoalAlignment][tagName]) {
              groups[orgGoalAlignment][tagName] = [];
            }
            // Avoid duplicates
            if (!groups[orgGoalAlignment][tagName].find(existingIep => existingIep.Id === iep.Id)) {
              groups[orgGoalAlignment][tagName].push(iep);
            }
          }
        });
      }
    });
    return groups;
  }, [filteredIEPs, chartDeptId, districtMode]);

  const getIEPStatus = (iep: any) => {
    const start = iep.StartDate ? new Date(iep.StartDate).getTime() : 0;
    const end = iep.EndDate ? new Date(iep.EndDate).getTime() : 0;
    const now = Date.now();

    if (iep.ResultsMet === 'Completed') return 'Completed';
    if (end && end < now && iep.ResultsMet !== 'Completed') return 'Overdue';
    if (start && start > now) return 'Upcoming';
    return 'Active';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle size={16} className="text-success" />;
      case 'Overdue': return <AlertTriangle size={16} className="text-danger" />;
      case 'Upcoming': return <Clock size={16} className="text-warning" />;
      default: return <Target size={16} className="text-primary" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-danger';
      case 'Medium': return 'bg-warning';
      case 'Low': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  const getTagColor = (resultsMet: string) => {
    switch (resultsMet) {
      case 'Completed':
        return '#28a745'; // Green
      case 'Partially Completed':
        return '#ffc107'; // Yellow
      case 'Not Completed':
        return '#dc3545'; // Red
      case 'CONTINUOUS IMPROVEMENT':
        return '#17a2b8'; // Cyan
      case 'Not Defined':
      default:
        return '#6c757d'; // Gray
    }
  };

  const toggleGoalExpansion = (key: string) => {
    setExpandedGoals(prev => {
      const current = !!prev[key];
      return { ...prev, [key]: !current };
    });
  };

  const clearFilters = () => {
    setSelectedTag('');
    setSelectedOrgGoalAlignment('');
    setSelectedDepartmentFilter('');
    onSearchChange('');
  };

  const activeFiltersCount = (selectedTag ? 1 : 0) + (selectedOrgGoalAlignment ? 1 : 0) + (selectedDepartmentFilter ? 1 : 0) + (searchTerm ? 1 : 0);

  const handleIEPDetailClick = (iep: any) => setSelectedIEPDetail(iep);
  const handleBackToGoalsList = () => setSelectedIEPDetail(null);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (selectedIEPDetail) {
    return (
      <div className="container-fluid pbbbb bg-light">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            type="button"
            className={`btn btn-outline-secondary ${isMobile ? 'btn-sm mb-2' : 'btn-sm mb-3'}`}
            onClick={handleBackToGoalsList}
          >
            <ArrowLeft size={16} className="me-1" />
            Back to Goals List
          </button>
          <button
            type="button"
            className={`btn ${isMobile ? 'btn-sm' : 'btn-sm'} btn-primary`}
            onClick={() => {
              if (onEditIEP) {
                onEditIEP(selectedIEPDetail);
                onBack(); // Close the operational goals list view
              }
            }}
          >
            Edit
          </button>
        </div>
        <IEPDetailsView
          iep={selectedIEPDetail}
          onEdit={() => {
            if (onEditIEP) {
              onEditIEP(selectedIEPDetail);
              onBack(); // Close the operational goals list view
            }
          }}
          isMobile={isMobile}
          isTablet={isTablet}
          sp={sp}
          currentUser={currentUser}
        />
      </div>
    );
  }

  return (
    <div className="container-fluid pbbbb bg-light">
      {/* Header */}
      <div className="row align-items-center mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center gap-2 justify-content-between mb-3">
            <button type='button' className={`btn ${isMobile ? 'btn-sm' : 'btn-sm'} btn-outline-secondary`} onClick={onBack}>
              <ArrowLeft size={16} className="me-1" />
              Back
            </button>
            <button
              className={`btn ${isMobile ? 'btn-sm' : 'btn-sm'} btn-outline-secondary`}
              onClick={(e) =>{e.preventDefault(); setShowFilters(!showFilters)}}
            >
              <Filter size={16} className="me-1" />
              Filters {activeFiltersCount > 0 && <span className="badge bg-primary ms-1">{activeFiltersCount}</span>}
            </button>
          </div>
          {/* Branded Header (match report-like UI) */}
          <div className="d-flex flex-column align-items-center mb-3">
            <div className="d-flex align-items-center gap-3 mb-2">
              <img src={require("../../CustomAssets/MCCLogoPhotoroom.png")} alt="MCC Logo" style={{ height: isMobile ? '42px' : '56px' }} />
              <img src={require("../../CustomAssets/MCCNamePhotoroom.png")} alt="MCC Name" style={{ height: isMobile ? '24px' : '32px' }} />
            </div>
            <div className="fw-semibold" style={{ fontSize: isMobile ? '0.9rem' : '1rem', color: '#0b4f86' }}>
              Operational Goal List by Organizational Goal
            </div>
          </div>
        </div>
      </div>



      {/* Filters */}
      {showFilters && (
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className={`${isMobile ? 'col-12' : 'col-md-3'}`}>
                <label className="form-label fw-semibold">Filter by Tag</label>
                <select
                  className="form-select"
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                >
                  <option value="">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              <div className={`${isMobile ? 'col-12' : 'col-md-3'}`}>
                <label className="form-label fw-semibold">Filter by Organizational Goal Alignment</label>
                <select
                  className="form-select"
                  value={selectedOrgGoalAlignment}
                  onChange={(e) => setSelectedOrgGoalAlignment(e.target.value)}
                >
                  <option value="">All Alignments</option>
                  {allOrgGoalAlignments.map(alignment => (
                    <option key={alignment} value={alignment}>{alignment}</option>
                  ))}
                </select>
              </div>

              <div className={`${isMobile ? 'col-12' : 'col-md-3'}`}>
                <label className="form-label fw-semibold">Filter by Sub-Department</label>
                <select
                  className="form-select"
                  value={selectedDepartmentFilter}
                  onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {allDepartments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className={`${isMobile ? 'col-12' : 'col-md-3'}`}>
                <label className="form-label fw-semibold">Search</label>
                <div className="position-relative">
                  <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
                  <input
                    type="text"
                    className="form-control ps-4"
                    placeholder="Search goals..."
                    value={searchTerm}
                    onKeyDown={(e) => {
                      if ((e as any).key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                    onChange={(e) => onSearchChange((e as any).target.value)}
                  />
                </div>
              </div>
            </div>
            {activeFiltersCount > 0 && (
              <div className="mt-3">
                <button type='button' className="btn btn-sm btn-outline-danger" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {/* <div className="row g-3 mb-4">
        <div className={`${isMobile ? 'col-6' : 'col-md-3'}`}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <h4 className="text-primary mb-1">{filteredIEPs.length}</h4>
              <p className="text-muted mb-0 small">Total Goals</p>
            </div>
          </div>
        </div>
        <div className={`${isMobile ? 'col-6' : 'col-md-3'}`}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <h4 className="text-success mb-1">
                {filteredIEPs.filter(iep => getIEPStatus(iep) === 'Completed').length}
              </h4>
              <p className="text-muted mb-0 small">Completed</p>
            </div>
          </div>
        </div>
        <div className={`${isMobile ? 'col-6' : 'col-md-3'}`}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <h4 className="text-warning mb-1">
                {filteredIEPs.filter(iep => getIEPStatus(iep) === 'Active').length}
              </h4>
              <p className="text-muted mb-0 small">Active</p>
            </div>
          </div>
        </div>
        <div className={`${isMobile ? 'col-6' : 'col-md-3'}`}>
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <h4 className="text-danger mb-1">
                {filteredIEPs.filter(iep => getIEPStatus(iep) === 'Overdue').length}
              </h4>
              <p className="text-muted mb-0 small">Overdue</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Goals List - Nested by Organizational Goal Alignment and Tag */}
      <div className="row">
        {Object.keys(groupedByGoal).length === 0 ? (
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <Target size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No operational goals found</h5>
                <p className="text-muted">
                  {activeFiltersCount > 0
                    ? 'Try adjusting your filters or search terms'
                    : 'There are no operational goals to display'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {Object.entries(groupedByGoal)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([orgGoalAlignment, tagGroups]) => {
                const orgGoalKey = `org-${orgGoalAlignment}`;
                const isOrgExpanded = expandedGoals[orgGoalKey] ?? true;
                const totalGoalsInOrg = Object.values(tagGroups).reduce((sum, goals) => sum + goals.length, 0);
                
                return (
                  <div key={orgGoalAlignment} className="col-6 mb-4">
                    {/* Organizational Goal Alignment Card */}
                    <div className="card shadow-sm" style={{ border: '2px solid #ffc107' }}>
                      <div
                        className="d-flex align-items-center justify-content-between p-3"
                        style={{ 
                          backgroundColor: '#0b4f86', 
                          cursor: 'pointer', 
                          borderTopLeftRadius: '0.25rem', 
                          borderTopRightRadius: '0.25rem'
                        }}
                        onClick={() => toggleGoalExpansion(orgGoalKey)}
                      >
                        <div className="d-flex align-items-center gap-2">
                          {isOrgExpanded ? <ChevronDown size={18} color='white' /> : <ChevronRight size={18} color='white' />}
                          <span className="fw-bold" style={{ color: 'white', fontSize: '1.1rem' }}>
                           Progress on Perspective : {orgGoalAlignment}
                          </span>
                        </div>
                        <span className="badge bg-light text-dark">{totalGoalsInOrg}</span>
                      </div>
                      
                      {isOrgExpanded && (
                        <div className="card-body p-3">
                          {/* Tags within this Organizational Goal */}
                          <div className="row g-3">
                            {Object.entries(tagGroups)
                              .sort((a, b) => a[0].localeCompare(b[0]))
                              .map(([tagName, goalIEPs]) => {
                                const tagKey = `tag-${orgGoalAlignment}-${tagName}`;
                                const isTagExpanded = expandedGoals[tagKey] ?? true;
                                
                                return (
                                  <div key={tagName} className="col-12">
                                    <div className="card shadow-sm h-100">
                                      <div
                                        className="d-flex align-items-center justify-content-between p-2"
                                        style={{ 
                                          backgroundColor: '#343a40', 
                                          cursor: 'pointer'
                                        }}
                                        onClick={() => toggleGoalExpansion(tagKey)}
                                      >
                                        <div className="d-flex align-items-center gap-2">
                                          {isTagExpanded ? <ChevronDown size={14} color='white' /> : <ChevronRight size={14} color='white' />}
                                          <span className="fw-semibold" style={{ color: 'white', fontSize: '0.9rem' }}>
                                            {tagName}
                                          </span>
                                        </div>
                                        <span className="badge bg-primary" style={{ fontSize: '0.75rem' }}>{goalIEPs.length}</span>
                                      </div>
                                      
                                      {isTagExpanded && (
                                        <div className="list-group list-group-flush">
                                          {goalIEPs.map((iep, index) => {
                                            const tagColor = getTagColor(iep.ResultsMet || 'Not Defined');
                                            const isFirstRow = index === 0;
                                            const globalGoal = iep.OrganizationalGoals?.GlobalGoal;
                                            
                                            return (
                                              <button
                                                key={iep.Id}
                                                type="button"
                                                className="list-group-item list-group-item-action d-flex align-items-start gap-2 py-2"
                                                onClick={() => handleIEPDetailClick(iep)}
                                                style={{ border: 'none', borderBottom: '1px solid #e9ecef' }}
                                              >
                                                <div
                                                  style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    backgroundColor: tagColor,
                                                    borderRadius: '3px',
                                                    flexShrink: 0,
                                                    marginTop: '2px'
                                                  }}
                                                />
                                                <div className="flex-grow-1 text-start">
                                                  <div
                                                    className="mb-1"
                                                    style={{ 
                                                      color: '#007bff', 
                                                      fontWeight: 500, 
                                                      fontSize: '13px', 
                                                      lineHeight: '1.4' 
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: decodeAndSanitizeHtml(iep.OperationalGoal || '') }}
                                                  />
                                                  <div className="text-muted" style={{ fontSize: '11px' }}>
                                                    {iep.SubDepartments?.SubDepartmentName || iep.Departments?.DepartmentName || 'N/A'}
                                                  </div>
                                                </div>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </>
        )}
      </div>
    </div>
  );
};

export default OperationalGoalsList;