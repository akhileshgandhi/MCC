import React from 'react';
import { Search, ChevronRight, ChevronDown, FileText, Archive } from 'lucide-react';
import "../CustomCss/Sidebar.scss";
import { ArchivedIEPHierarchy } from '../../APIsServices/ArchivedIEPService';
import { HierarchicalItem } from '../../types/HierarchicalItem';
import { SharePointIEP } from '../../types/SharePointIEP';
import { SidebarProps } from '../../types/SidebarProps';

export const Sidebar = ({
  sidebarOpen,
  activePage,
  searchTerm,
  onSearchChange,
  currentData,
  expandedSections,
  onToggleSection,
  selectedDepartment,
  selectedScorecard,
  selectedIEP,
  onDepartmentClick,
  onScorecardClick,
  onIEPClick,
  getSafeExpandedState,
  onPageChange,
  iepsData = [],
  archivedIEPs = [],
  onArchivedDocumentClick,
  onArchivedYearClick,
  selectedArchivedDocument,
  selectedArchivedYear,
  isMobile,
  isTablet,
  userRole
}: SidebarProps) => {
  console.log('Sidebar currentData:', currentData);
  console.log('Sidebar iepsData:', iepsData);
  const hasIEPs = iepsData && iepsData.length > 0;
  
  // Add state for archived search
  const [archivedSearchTerm, setArchivedSearchTerm] = React.useState('');

  const stripHtml = (html: string): string => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Exact match is always enabled
  const exactMatch = true;

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const sanitizeToPlain = (value: any): string => {
    if (value === null || value === undefined) return '';
    const div = document.createElement('div');
    div.innerHTML = String(value);
    return (div.textContent || div.innerText || '').trim();
  };

  const makeMatcher = (termRaw: string) => {
    const term = (termRaw || '').toLowerCase();
    const wordRegex = term
      ? new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i')
      : null;
    return (value: any) => {
      if (!term) return false;
      const plain = sanitizeToPlain(value).toLowerCase();
      if (!plain) return false;
      if (exactMatch) {
        if (term.includes(' ')) return plain.includes(term); // exact phrase
        return wordRegex ? wordRegex.test(plain) : false;    // whole word
      }
      return plain.includes(term); // substring
    };
  };

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return currentData;
    const match = makeMatcher(searchTerm);

    return currentData
      .map(section => {
        const matchedChildren = (section.children || [])
          .map(dept => {
            const matchedSubs = (dept.children || [])
              .map(sub => {
                const matchedSubSubs = (sub.children || []).filter(ss =>
                  match(ss.name) ||
                  (hasIEPs && iepsData.some((iep: any) =>
                    iep.SubDepartments?.Id === Number(sub.id.split('-')[1]) &&
                    iep.SubSubDepartments?.Id === Number(ss.id.split('-')[2]) &&
                    (
                      match(iep.OperationalGoal) ||
                      match(iep.OperationalTactic) ||
                      match(iep.PerformanceMeasure) ||
                      match(iep.Target) ||
                      match(iep.BudgetImpactDescription) ||
                      // Search in HLC Alignment
                      (iep.HLCAlignment && Array.isArray(iep.HLCAlignment) && iep.HLCAlignment.some((hlc: any) => 
                        match(hlc.HLCAlignment) ||
                        match(hlc.Description)
                      )) ||
                      // Search in Organization Goal Alignment
                      (iep.OrganizationGoalAlignment && Array.isArray(iep.OrganizationGoalAlignment) && iep.OrganizationGoalAlignment.some((org: any) => 
                        match(org.OrganizationalGoalAlignment) ||
                        match(org.Value) ||
                        match(org.Tag)
                      )) ||
                      // Search in Shared Service Campus Goal Alignment
                      (iep.SharedServiceCampusGoalAlignment && Array.isArray(iep.SharedServiceCampusGoalAlignment) && iep.SharedServiceCampusGoalAlignment.some((shared: any) => 
                        match(shared.ThreeYRSharedService)
                      ))
                    )
                  ))
                );

                return matchedSubSubs.length > 0 ? { ...sub, children: matchedSubSubs } : null;
              })
              .filter(Boolean);

            return matchedSubs.length > 0 || match(dept.name)
              ? { ...dept, children: matchedSubs }
              : null;
          })
          .filter(Boolean);

        return matchedChildren.length > 0 || match(section.name)
          ? { ...section, children: matchedChildren }
          : null;
      })
      .filter(Boolean) as HierarchicalItem[];
  }, [currentData, searchTerm, hasIEPs, iepsData, exactMatch]);

  // Global goal matches across all departments (independent of tree filtering)
  const globalGoalMatches = React.useMemo(() => {
    if (!hasIEPs || !searchTerm) return [] as Array<any>;
    const match = makeMatcher(searchTerm);

    const matchIEP = (iep: any) => (
      match(iep.OperationalGoal) ||
      match(iep.OperationalTactic) ||
      match(iep.PerformanceMeasure) ||
      match(iep.Target) ||
      match(iep.BudgetImpactDescription) ||
      // HLC criteria
      (Array.isArray(iep.HLCAlignment) && iep.HLCAlignment.some((hlc: any) =>
        match(hlc.HLCAlignment) || match(hlc.Description)
      )) ||
      // Org goal alignment
      (Array.isArray(iep.OrganizationGoalAlignment) && iep.OrganizationGoalAlignment.some((org: any) =>
        match(org.OrganizationalGoalAlignment) || match(org.Value) || match(org.Tag)
      )) ||
      // Shared services
      (Array.isArray(iep.SharedServiceCampusGoalAlignment) && iep.SharedServiceCampusGoalAlignment.some((shared: any) =>
        match(shared.ThreeYRSharedService)
      ))
    );

    const results = iepsData.filter(matchIEP)
      .map((iep: any) => {
        const scorecardId = iep.OrganizationalGoals?.Id ? `scorecard-${iep.OrganizationalGoals.Id}` : undefined;
        const deptId = iep.Departments?.Id ? `dept-${iep.Departments.Id}` : undefined;
        const subIdNum = iep.SubDepartments?.Id;
        const ssIdNum = iep.SubSubDepartments?.Id;
        const subId = subIdNum ? `sub-${subIdNum}` : undefined;
        const subsubId = (subIdNum && ssIdNum) ? `subsub-${subIdNum}-${ssIdNum}` : undefined;

        const departmentName = iep.Departments?.DepartmentName || iep.Departments?.DepartmentShortName || '';
        const subName = iep.SubDepartments?.SubDepartmentName || '';
        const ssName = iep.SubSubDepartments?.SubSubDepartmentName || '';
        const goalText = stripHtml(iep.OperationalGoal || '').trim();

        return {
          key: `${iep.Id}-${subIdNum || ''}-${ssIdNum || ''}`,
          iepId: iep.Id,
          scorecardId,
          deptId,
          targetId: subsubId || subId, // prefer deepest level available
          targetName: ssName || subName || departmentName,
          pathLabel: [departmentName, subName, ssName].filter(Boolean).join(' › '),
          goalText
        };
      });

    // Limit to avoid long lists in the sidebar
    return results.slice(0, 20);
  }, [iepsData, hasIEPs, searchTerm, exactMatch]);

  // Add filtered archived data
  const filteredArchivedData = React.useMemo(() => {
    if (!archivedSearchTerm || !archivedIEPs) return archivedIEPs;
    
    const term = archivedSearchTerm.toLowerCase();
    
    return archivedIEPs
      .map(yearFolder => {
        // Filter documents within the year
        const matchedDocuments = (yearFolder.children || []).filter(doc => 
          doc.name.toLowerCase().includes(term) ||
          (doc.type === 'document' && yearFolder.name.toLowerCase().includes(term))
        );
        
        // Return year if it matches or has matching documents
        return matchedDocuments.length > 0 || yearFolder.name.toLowerCase().includes(term)
          ? { ...yearFolder, children: matchedDocuments }
          : null;
      })
      .filter(Boolean) as ArchivedIEPHierarchy[];
  }, [archivedIEPs, archivedSearchTerm]);

  const getDepartmentsCount = () => {
    // If flat structure (no children)
    if (currentData.length && currentData[0].type === 'department') {
      return currentData.length;
    }

    // If hierarchical (scorecards → departments)
    return filteredData.reduce((count, section) => count + (section.children?.length || 0), 0);
  };

  const getScorecardsCount = () => {
    return filteredData.length;
  };

  const getIEPsCount = () => {
    if (hasIEPs) {
      return iepsData.length;
    }
    let count = 0;
    filteredData.forEach((scorecard) => {
      scorecard.children?.forEach((dept: any) => {
        dept.children?.forEach((sub: any) => {
          sub.children?.forEach((subsub: any) => {
            count += subsub.iepCount || 0;
          });
        });
      });
    });
    return count;
  };

  const getDepartmentIEPCount = (departmentName: string) => {
    if (!hasIEPs) return 0;
    return iepsData.filter((iep: any) => iep.Department?.DepartmentName === departmentName).length;
  };

  const getScorecardIEPCount = (scorecardName: string) => {
    if (!hasIEPs) return 0;
    return iepsData.filter((iep: any) => iep.OrganizationalGoal?.ScorecardName === scorecardName).length;
  };

  return (
    <div className={`bg-white border-end bgsidebarAll  ${sidebarOpen ? 'd-block' : 'd-none'} ${isMobile ? 'mobile-sidebar' : ''}`} style={{  width:'240px'}}>
      {/* Logo Header */}
      <div className="bg-white px-3 py-3 d-flex align-items-center gap-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div className="logoMMC">
            <img src={require("../../CustomAssets/MCCLogoPhotoroom.png")} alt="MCC Logo" className="logoImg" style={{ height: isMobile ? '40px' : '50px' }} />
          </div>
          <div className="logoName">
            <img src={require("../../CustomAssets/MCCNamePhotoroom.png")} alt="MCC Name" className="logoImg" style={{ height: isMobile ? '25px' : '30px' }} />
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="p-3 bg-white border-bottom">
        <div className="position-relative">
          <Search className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" style={{ width: isMobile ? '12px' : '14px', height: isMobile ? '12px' : '14px' }} />
          <input
            type="text"
            placeholder={
              activePage === 'dashboard' ? (isMobile ? "Search..." : "Global Search...") :
                activePage === 'scorecard' ? (hasIEPs ? (isMobile ? "Global Search..." : "Global Search...") : (isMobile ? "Global Search..." : "Global Search...")) :
                  activePage === 'archived' ? (isMobile ? "Search Archived..." : "Search Archived Goals...") :
                  "Global Search..."
            }
            value={activePage === 'archived' ? archivedSearchTerm : searchTerm}
             onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            onChange={(e) => activePage === 'archived' ? setArchivedSearchTerm(e.target.value) : onSearchChange(e.target.value)}
            className={`form-control form-control-sm ps-4 ${isMobile ? 'form-control-xs' : ''}`}
            style={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
          />
        </div>
        {/* {hasIEPs && activePage !== 'archived' && (
          <div className={`mt-2 ${isMobile ? 'text-xs' : 'small'} text-muted`}>
            <div>{getDepartmentsCount()} {getDepartmentsCount() === 1 ? 'Department' : 'Departments'}</div>
            <div>
              {iepsData.length === 1 ? `${iepsData.length} Goal` : `${iepsData.length} Goals`}
            </div>
          </div>
        )} */}
        {/* Global goal matches preview */}
        {hasIEPs && activePage === 'scorecard' && searchTerm && globalGoalMatches.length > 0 && (
          <div className="mt-2">
            <div className={`fw-semibold ${isMobile ? 'text-xs' : 'small'}`} style={{ color: '#0b4f86' }}>
              Global Matches ({globalGoalMatches.length <= 20 ? globalGoalMatches.length : '20+'})
            </div>
            <ul className="list-unstyled mb-0" style={{ maxHeight: '160px', overflowY: 'auto' }}>
              {globalGoalMatches.map(m => (
                <li key={m.key} className={`${isMobile ? 'text-xs' : 'small'} py-1`}>
                  <a
                    className="text-decoration-none"
                    style={{ color: '#337ab7', cursor: 'pointer' }}
                    onClick={() => {
                      if (m.scorecardId && m.deptId && m.targetId) {
                        onIEPClick(m.scorecardId, m.deptId, m.targetId, m.targetName);
                      } else if (m.scorecardId && m.deptId) {
                        onIEPClick(m.scorecardId, m.deptId, m.deptId, m.targetName);
                      }
                    }}
                    title={m.goalText}
                  >
                    {m.pathLabel}
                  </a>
                  {m.goalText && (
                    <div className="text-muted" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.goalText}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {activePage === 'archived' && archivedIEPs && (
          <div className={`mt-2 ${isMobile ? 'text-xs' : 'small'} text-muted`}>
            <span>{filteredArchivedData.length} {filteredArchivedData.length === 1 ? 'Year' : 'Years'}</span>
            {archivedSearchTerm && (
              <span className="ms-2">
                • {filteredArchivedData.reduce((sum, year) => sum + (year.children?.length || 0), 0)} Documents
              </span>
            )}
          </div>
        )}
      </div>

      {/* Navigation Header */}
      {(activePage === 'dashboard' || activePage === 'scorecard') && (
        <div className="bg-light px-3 py-2 d-flex align-items-center gap-2 border-bottom">
          <span className={`fw-semibold text-muted text-capitalize ${isMobile ? 'text-xs' : 'small'}`}>
            {activePage === 'dashboard' ? 'Departments' : 'Organizational Scorecards'}
          </span>
          {/* <span className="ms-auto badge bg-primary text-white rounded-pill" style={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
            {activePage === 'dashboard' ? getDepartmentsCount() : getScorecardsCount()}
          </span> */}
          {/* {hasIEPs && (
            <span className="badge bg-success text-white rounded-pill ms-1" style={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
             
              {getIEPsCount()===1 ?(<><span>{getIEPsCount()}  Goal</span></>) : (<><span>{getIEPsCount()}  Goals</span></>)}

            </span>
          )} */}
        </div>
      )}

      {/* Archived IEPs Navigation Header
      {activePage === 'archived' && (
        <div className="bg-light px-3 py-2 d-flex align-items-center gap-2 border-bottom">
          <Archive size={isMobile ? 14 : 16} className="text-warning" />
          <span className={`fw-semibold text-muted ${isMobile ? 'text-xs' : 'small'}`}>
            Archived IEPs
          </span>
          <span className="ms-auto badge bg-secondary text-white rounded-pill" style={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
            {archivedIEPs?.length || 0} Years
          </span>
        </div>
      )} */}

      {/* TREE VIEW - FULLY FIXED */}
      {(activePage === 'dashboard' || activePage === 'scorecard') && (
        <div className="flex-grow-1 overflow-auto bg-white p-2" 
        style={{maxHeight: 'calc(100vh - 250px)', overflowY: 'auto',width:'230px'}}>
          {filteredData.length === 0 && searchTerm ? (
            <div className="p-3 text-center text-muted" style={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
              {globalGoalMatches && globalGoalMatches.length > 0 ? (
                <>
                  <span>No matches within the tree.</span>
                  <small style={{ fontSize: isMobile ? '0.65rem' : '0.75rem', display: 'block', marginTop: '0.25rem' }}>
                    Found {globalGoalMatches.length <= 20 ? globalGoalMatches.length : '20+'} global match(es) above.
                  </small>
                </>
              ) : (
                <>
                  No results found for "<strong>{searchTerm}</strong>"
                  {hasIEPs && (
                    <small style={{ fontSize: isMobile ? '0.65rem' : '0.75rem', display: 'block', marginTop: '0.25rem' }}>
                      Searching through {iepsData.length} Goals
                    </small>
                  )}
                </>
              )}
            </div>
          ) : (
            filteredData.map((section) => (
              <div key={section.id} className="border-bottom">
                {/* Scorecard / Section */}
                <div
                  onClick={() => {
                    // Close all other scorecards when opening this one
                    if (!getSafeExpandedState(section.id)) {
                      currentData.forEach((s) => {
                        if (s.id !== section.id && getSafeExpandedState(s.id)) {
                          onToggleSection(s.id);
                        }
                      });
                    }
                    onToggleSection(section.id);
                    onScorecardClick(section.id, section.name);
                  }}
                  className="d-flex align-items-center gap-1 px-1 py-2 hover-bg-light cursor-pointer"
                  style={{cursor:'pointer'}}
                >
                  {getSafeExpandedState(section.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <span
                    className={`fw-semibold ${selectedScorecard === section.id ? 'text-primary' : 'text-dark'} ${isMobile ? 'text-xs' : 'small'}`}
                    style={{cursor:'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', display: 'block'}}
                    title={`${section.name} (${section.year})`}
                  >
                    {section.name} {section.name === "All Departments" ? "" : <small className="text-muted">({section.year})</small>}
                  </span>
                </div>

                {/* DEPARTMENTS */}
                {getSafeExpandedState(section.id) && section.children?.map((dept: any) => (
                  <div key={dept.id}>
                    <div
                      onClick={() => {
                        // Allow multiple departments to remain expanded simultaneously
                        onToggleSection(dept.id);
                        onDepartmentClick(dept.id, dept.name);
                      }}
                      className="d-flex align-items-center gap-1 ps-1 py-2 hover-bg-light cursor-pointer"
                      style={{cursor:'pointer'}}
                    >
                      {dept.children?.length ? (getSafeExpandedState(dept.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : <span style={{ width: 16 }} />}
                      <span
                        className={`${selectedDepartment === dept.id ? 'text-primary' : 'text-teal'} ${isMobile ? 'text-xs' : 'small'}`}
                        style={{cursor:'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1}}
                        title={dept.name}
                      >
                        {dept.name}
                      </span>
                    </div>

                    {/* SUB-DEPARTMENTS */}
                    {getSafeExpandedState(dept.id) && dept.children?.map((sub: any) => (
                      <div key={sub.id}>
                        <div
                          onClick={() => {
                            // Close all other sub-departments in this department when opening this one
                            if (!getSafeExpandedState(sub.id)) {
                              dept.children?.forEach((s: any) => {
                                if (s.id !== sub.id && getSafeExpandedState(s.id)) {
                                  onToggleSection(s.id);
                                }
                              });
                            }
                            onToggleSection(sub.id);
                            onIEPClick(section.id, dept.id, sub.id, sub.name);
                          }}
                          style={{cursor:'pointer'}}
                          className="d-flex align-items-center gap-1 ps-3 py-1 hover-bg-light cursor-pointer"
                        >
                          {sub.children?.length ? (getSafeExpandedState(sub.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />) : <span style={{ width: 16 }} />}
                          <span className={`${selectedIEP === sub.id ? 'text-primary fw-semibold' : 'text-muted'} ${isMobile ? 'text-xs' : 'small'}`}
                          style={{cursor:'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1}}
                          title={sub.name}>
                            {sub.name}
                          </span>
                          {/* <span className="badge bg-secondary text-white ms-auto small">
                            {sub.iepCount || 0}
                          </span> */}
                        </div>

                        {/* SUB-SUB-DEPARTMENTS - FIXED: Unique ID per parent */}
                        {getSafeExpandedState(sub.id) && sub.children && sub.children.length > 0 && sub.children
                          .filter((ss: any) => ss.name && ss.name.trim() !== '')
                          .map((ss: any) => {
                            // parse sub id and ss id robustly
                            console.log(sub.children, 'sub.children');
                            const subIdPart = sub.id && sub.id.includes('-') ? sub.id.split('-')[1] : sub.id;
                            const ssIdParts = ss.id ? ss.id.split('-') : [];
                            const ssIdPart = ssIdParts.length > 0 ? ssIdParts[ssIdParts.length - 1] : ss.id;
                            const compositeId = `subsub-${subIdPart}-${ssIdPart}`;

                            return (
                              <div
                                key={compositeId}
                                className="d-flex align-items-center gap-1 ps-5 py-1 hover-bg-light cursor-pointer"
                                onClick={() => {
                                  onIEPClick(section.id, dept.id, compositeId, ss.name);
                                }}
                                style={{cursor:'pointer'}}
                              >
                                <span className="text-primary" style={{ fontSize: isMobile ? '10px' : '12px' }}>•</span>
                                <span className={`${selectedIEP === compositeId ? 'text-primary fw-semibold' : 'text-muted'} ${isMobile ? 'text-xs' : 'small'}`}
                                style={{cursor:'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1}}
                                title={ss.name}>
                                  {ss.name}
                                </span>
                                <span className="badge bg-primary text-white ms-auto" style={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                                  {ss.iepCount || 0}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {/* ARCHIVED IEPs SECTION - Can be on scorecard page or dedicated archived page */}
      {( activePage === 'archived') && archivedIEPs && archivedIEPs.length > 0 && (
        <div className={`flex-grow-1 overflow-auto bg-white p-2
         ${activePage === 'archived' ? 'border-top' : ''}`} style={{maxHeight: 'calc(100vh - 250px)', overflowY: 'auto'}}>
          {/* Archived IEPs Header - only show on scorecard page, not on dedicated archived page */}
          {activePage === 'archived' && (
            <div className="bg-light px-3 py-2 d-flex align-items-center gap-2 border-bottom mb-2">
              <Archive size={isMobile ? 14 : 16} className="text-muted" />
              <span className={`fw-semibold text-muted ${isMobile ? 'text-xs' : 'small'}`}>
                Archived Goals
              </span>
              <span className="ms-auto badge bg-secondary text-white rounded-pill" style={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                {filteredArchivedData.length} Years
              </span>
            </div>
          )}

          {/* No Results Message */}
          {filteredArchivedData.length === 0 && archivedSearchTerm && (
            <div className="p-3 text-center text-muted" style={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
              No archived Goals found for "<strong>{archivedSearchTerm}</strong>"
            </div>
          )}

          {/* Archived IEPs Tree */}
          {filteredArchivedData.map((yearFolder) => (
            <div key={yearFolder.id} className="border-bottom">
              {/* Year Folder */}
              <div
                onClick={() => {
                  // Close all other year folders when opening this one
                  if (!getSafeExpandedState(yearFolder.id)) {
                    archivedIEPs.forEach((yf) => {
                      if (yf.id !== yearFolder.id && getSafeExpandedState(yf.id)) {
                        onToggleSection(yf.id);
                      }
                    });
                  }
                  onToggleSection(yearFolder.id);
                  if (onArchivedYearClick) {
                    onArchivedYearClick(yearFolder.id);
                  }
                }}
                className="d-flex align-items-center gap-1 px-1 py-2 hover-bg-light cursor-pointer"
                style={{ cursor: 'pointer' }}
              >
                {getSafeExpandedState(yearFolder.id) ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
                <Archive size={isMobile ? 12 : 14} className="text-warning" />
                <span className={`fw-semibold text-dark ${isMobile ? 'text-xs' : 'small'}`}
                  style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1}}
                  title={yearFolder.name}>
                  {yearFolder.name}
                </span>
                <span className="badge bg-secondary text-white ms-auto" style={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                  {yearFolder.children?.length || 0}
                </span>
              </div>

              {/* Department Folders - Only show when year is expanded */}
              {/* {getSafeExpandedState(yearFolder.id) && yearFolder.children?.filter(child => child.type === 'department').map((deptFolder) => (
                <div key={deptFolder.id} className="ps-3">
                  <div
                    onClick={() => onToggleSection(deptFolder.id)}
                    className="d-flex align-items-center gap-1 py-2 hover-bg-light cursor-pointer"
                    style={{ cursor: 'pointer' }}
                  >
                    {getSafeExpandedState(deptFolder.id) ? (
                      <ChevronDown size={isMobile ? 12 : 14} />
                    ) : (
                      <ChevronRight size={isMobile ? 12 : 14} />
                    )}
                    <FileText size={isMobile ? 12 : 14} className="text-info" />
                    <span className={`${isMobile ? 'text-xs' : 'small'} text-truncate`} style={{width:'200px'}}>
                      {deptFolder.name}hhhhh
                    </span>
                    <span className="badge bg-info text-white ms-auto" style={{ fontSize: isMobile ? '0.65rem' : '0.75rem' }}>
                      {deptFolder.children?.length || 0}
                    </span>
                  </div>

                 {getSafeExpandedState(deptFolder.id) && deptFolder.children?.map((doc) => (
                    <div
                      key={doc.id}
                      className="d-flex align-items-center gap-1 ps-4 py-1 hover-bg-light cursor-pointer"
                      onClick={() => {
                        if (onArchivedDocumentClick && doc.documentUrl) {
                          onArchivedDocumentClick(doc.id, doc.documentUrl);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <FileText size={isMobile ? 10 : 12} className="text-danger" />
                      <span 
                        className={`${selectedArchivedDocument === doc.id ? 'text-primary fw-semibold' : 'text-muted'} ${isMobile ? 'text-xs' : 'small'}`}
                        style={{ cursor: 'pointer' }}
                      >
                        {doc.name}hhhhvv
                      </span>
                    </div>
                  ))}
                </div>
              ))} */}

              {/* Documents directly under year (no department) - Only show when year is expanded */}
              {getSafeExpandedState(yearFolder.id) && yearFolder.children?.filter(child => child.type === 'document').map((doc) => (
                <div
                  key={doc.id}
                  className="d-flex align-items-center gap-1 ps-3 py-1 hover-bg-light cursor-pointer"
                  onClick={() => {
                    if (onArchivedDocumentClick && doc.documentUrl) {
                      onArchivedDocumentClick(doc.id, doc.documentUrl);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <FileText size={isMobile ? 10 : 12} className="text-danger" />
                  <span 
                    className={`${selectedArchivedDocument === doc.id ? 'text-primary fw-semibold' : 'text-muted'} ${isMobile ? 'text-xs' : 'small'} text-truncate pt-3 pb-3`} style={{width:'200px',cursor: 'pointer'}}
                  >
                    {doc.name}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {(activePage === 'users' || activePage === 'settings') && (
        <div className="flex-grow-1 bg-white p-3 d-flex align-items-center justify-content-center">
          <p className={`${isMobile ? 'text-xs' : 'small'} text-muted text-center mb-0`}>No navigation items available</p>
        </div>
      )}

      <style>{`
        /* Mobile specific sidebar styles */
        .mobile-sidebar {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          height: 100vh !important;
          width: 100% !important;
          max-width: 100% !important;
          z-index: 1050 !important;
          box-shadow: 0 0 10px rgba(0,0,0,0.2) !important;
        }
        
        .form-control-xs {
          font-size: 0.7rem !important;
          padding: 0.25rem 0.5rem !important;
          height: auto !important;
        }
        
        .text-xs {
          font-size: 0.7rem !important;
        }
        
        @media (max-width: 767.98px) {
          .bgsidebarAll {
            width: 100% !important;
            max-width: 100% !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            height: 100vh !important;
            z-index: 1050 !important;
            box-shadow: 0 0 10px rgba(0,0,0,0.2) !important;
          }
          
          .ps-3 {
            padding-left: 1rem !important;
          }
          
          .ps-2 {
            padding-left: 0.5rem !important;
          }
          
          .ps-1 {
            padding-left: 0.25rem !important;
          }
          
          .hover-bg-light:hover {
            background-color: rgba(248, 249, 250, 0.8) !important;
          }
        }
        
        @media (max-width: 575.98px) {
          .logoMMC {
            width: 35px !important;
            height: 35px !important;
          }
          
          .logoName {
            width: 80px !important;
            height: 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;