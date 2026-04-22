import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, ArrowUp, ArrowDown, PencilLine, Eye, Trash2, ArrowUpZA, ArrowUpAZ, ArrowDownZA, Inbox } from 'lucide-react';
import DOMPurify from 'dompurify';
import { stripHtml } from '../HelperCustomComponents/Alluse';
import Swal from 'sweetalert2';
import { IEPTableProps } from '../../types/IEPTableProps';

// Helper function to decode HTML entities and sanitize
const decodeAndSanitizeHtml = (html: string): string => {
  if (!html) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  const decoded = textarea.value;
  return DOMPurify.sanitize(decoded);
};

const IEPTable = ({
  ieps = [],
  columns,
  searchQuery,
  sortConfig,
  expandedRows,
  onToggleRow,
  onSort,
  onToggleColumn,
  onRowClick,
  departmentShortName,
  Reimagined,
  onSearch,
  isMobile,
  isTablet,
  exportMode = false,
  onExportPdf,
  onExportExcel,
  isExportingPdf = false,
  onEditIEP,
  onViewIEP,
  onDeleteIEP,
  canEditIEP,
  canDeleteIEP,
  selScorecard
}: IEPTableProps) => {
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [internalSearch, setInternalSearch] = useState('');
  console.log(selScorecard, "selScorecard");

  const activeSearch = (typeof searchQuery === 'string' ? searchQuery : internalSearch) ?? '';
  const handleSearchChange = (value: string) => {
    if (onSearch) {
      onSearch(value);
    } else {
      setInternalSearch(value);
    }
  };

  const visibleCount = Math.max(1, Object.values(columns).filter((c: any) => c.visible).length);

  const filteredIeps = useMemo(() => {
    const query = activeSearch.trim().toLowerCase();
    if (!query) return ieps;

    const searchableKeys = [
      'OperationalGoal',
      'OperationalTactic',
      'Target',
      'PerformanceMeasure',
      'PerformanceMeasureResults',
      'ContinuousImprovement',
      'ResultsMet',
      'BudgetImpactDescription',
      'IfYesPleaseDescribe',
    ];

    return ieps.filter((iep: any) => {
      const departmentText =
        iep?.Departments?.DepartmentName ||
        iep?.Departments?.DepartmentName ||
        '';

      const subDepartmentText = iep?.SubDepartments?.SubDepartmentName || '';

      const normalizedDepartment = typeof departmentText === 'string'
        ? departmentText
        : departmentText === null || departmentText === undefined
          ? ''
          : String(departmentText);

      const normalizedSubDepartment = typeof subDepartmentText === 'string'
        ? subDepartmentText
        : subDepartmentText === null || subDepartmentText === undefined
          ? ''
          : String(subDepartmentText);

      if (normalizedDepartment.toLowerCase().includes(query)) return true;
      if (normalizedSubDepartment.toLowerCase().includes(query)) return true;

      return searchableKeys.some((key) => {
        const value = stripHtml(iep?.[key] ?? '');
        const normalizedValue =
          typeof value === 'string'
            ? value
            : value === null || value === undefined
              ? ''
              : String(value);
        return normalizedValue.toLowerCase().includes(query);
      });
    });
  }, [activeSearch, ieps]);

  const sortIcon = (key: string) => {
    if (!sortConfig?.key || sortConfig.key !== key) return <ArrowUpAZ size={isMobile ? 14 : 16} className="opacity-25" />;
    return sortConfig.direction === 'asc' ? <ArrowUpAZ size={isMobile ? 14 : 16} /> : <ArrowDownZA size={isMobile ? 14 : 16} />;
  };

  const getAlignmentText = (arr: any[] | undefined, field: 'Value' | 'HLCAlignment' | 'ThreeYRSharedService' = 'Value') => {
    if (!arr?.length) return 'N/A';
    return arr.map(item => item[field] ?? 'N/A').join('<br />');
  };
  // Responsive styles
  const styles: Record<string, React.CSSProperties> = {
    wrapperCard: {
      borderRadius: 8,
      overflow: exportMode ? 'visible' : 'hidden',
      border: '1px solid #e6e9ec',
      background: '#ffffff',
      height: exportMode ? 'auto' : 'auto'
    },
    controlsBar: {
      padding: isMobile ? '8px' : '15px 15px',
      gap: '8px',
      alignItems: 'center',
      display: 'flex',
      flexWrap: 'wrap',
      borderBottom: '1px solid #ebedf0',
      background: '#fbfcfd',
    },
    dropdownPanel: {
      zIndex: 12000,
      minWidth: isMobile ? 200 : 250,
      maxHeight: isMobile ? 300 : 420,
      overflowY: 'auto',
      right: 0,
      left: 'auto'
    },
    tableContainer: {
      overflowX: exportMode ? 'visible' : 'auto',
      overflowY: exportMode ? 'visible' : 'auto',
      maxHeight: exportMode ? 'none' : (isMobile ? '50vh' : '100vh'),
      background: '#fff',
      WebkitOverflowScrolling: exportMode ? 'auto' : 'touch',
    },
    table: {
      width: '100%',
      tableLayout: 'fixed' as const,
      borderCollapse: 'separate' as const,
      // fontSize: isMobile ? '0.75rem' : '0.92rem',
      // minWidth: isMobile ? '600px' : 'auto'
    },
    thBase: {
      position: exportMode ? ('relative' as const) : ('sticky' as const),
      top: 0,
      zIndex: 98,
      verticalAlign: 'middle',
      // whiteSpace: 'nowrap' as const,
      // wordBreak: 'break-word' as const,
      textAlign: isMobile ? 'center' : 'center' as const,
      lineHeight: 1.1,
      fontSize: '9px',
      padding: '0.1rem',

      // alignItems: 'center',
      // justifyContent: 'center',
      // flexDirection: 'column' as const,
      // gap: '4px',

      // height: isMobile ? 50 : 76,
      // width: 200,
      // padding: isMobile ? '6px 8px' : '12px 10px',
    },
    thBlue: {
      backgroundColor: '#004C8E',
      color: '#ffffff',
    },
    thOrange: {
      backgroundColor: '#FFBF32',
      color: '#fff',
    },
    firstCol: {
      // width: isMobile ? 45 : 56,
      padding: 0,
      textAlign: 'center' as const,
      position: exportMode ? ('relative' as const) : ('sticky' as const),
      left: exportMode ? undefined : 0,
      zIndex: 98,
      background: '#004C8E',
      fontSize: isMobile ? '12px' : '12px',
    },
    actionBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      background: 'transparent',
      padding: 0,
      cursor: 'pointer',
      minWidth: '1.5rem',
      color: '#0d6efd',
    },
    expandBtn: {
      color: '#9b2f72',
    },
    actionStack: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '6px',
    },
    opRowCell: {
      padding: isMobile ? '8px 12px' : '14px 18px',
      background: '#ffdff0',
      color: '#9b2f72',
      fontWeight: 700,
      fontSize: isMobile ? '12px' : '12px',
      verticalAlign: 'middle',
      whiteSpace: 'normal' as const,
      wordBreak: 'break-word' as const,
    },
    opSubtext: {
      fontSize: isMobile ? '12px' : '12px',
      color: '#527da3ff',
      marginTop: isMobile ? 4 : 6,
    },
    tdCell: {
      padding: isMobile ? '6px 8px' : '10px 12px',
      verticalAlign: 'top',
      whiteSpace: 'normal' as const,
      wordBreak: 'break-word' as const,
      overflowWrap: 'anywhere' as const,
      fontSize: isMobile ? '12px' : '12px',
      cursor: 'pointer'
    },
    thinSeparator: {
      borderLeft: '1px solid rgba(0,0,0,0.05)',
    },
    badgeLight: {
      display: 'inline-block',
      background: '#f8f9fa',
      color: '#212529',
      padding: isMobile ? '2px 6px' : '4px 8px',
      borderRadius: 6,
      fontWeight: 600,
      fontSize: isMobile ? '12px' : '12px'
    },
  };

  return (
    <>
      {/* Column Selector Panel - Outside Table */}
      {showColumnDropdown && (
        <div
          className="card shadow-sm mb-3"
          style={{
            borderRadius: 8,
            border: '1px solid #004C8E',
            background: '#ffffff',
          }}
        >
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0 fw-bold" style={{ color: '#004C8E' }}>
                Select Columns
              </h6>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowColumnDropdown(false)}
                aria-label="Close"
              />
            </div>
            <div className="row g-2">
              {Object.entries(columns).map(([k, c]: [string, any]) => (
                <div key={k} className={`col-${isMobile ? '12' : '6'} col-md-4 col-lg-3`}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`col-${k}`}
                      checked={c.visible}
                      onChange={() => onToggleColumn(k)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`col-${k}`}
                      style={{ fontSize: isMobile ? '0.875rem' : '0.95rem' }}
                    >
                      {c.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        className={`card shadow-sm mb-3${exportMode ? ' pdf-avoid-break' : ''}`}
        style={{ ...styles.wrapperCard, ...(exportMode ? { pageBreakInside: 'avoid', breakInside: 'avoid' } : {}) }}
      >
        {/* Enhanced responsive CSS */}
        <div style={styles.controlsBar}>
          <div style={{ width: '250px', flex: '0 0 auto' }}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search Goals..."
              value={activeSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              style={{
                boxShadow: 'none',
                fontSize: isMobile ? '0.75rem' : '0.875rem',
              }}
            />
          </div>
          {onExportPdf && (
            <button
              type="button"
              className={`btn btn-outline-primary ${isMobile ? 'btn-sm mt-2' : 'btn-sm ms-2'}`}
              onClick={onExportPdf}
              disabled={isExportingPdf || !filteredIeps.length}
              style={{ whiteSpace: 'nowrap' }}
            >
              {isExportingPdf ? 'Preparing PDF…' : 'Export Scorecard View to PDF'}
            </button>
          )}
          {onExportExcel && (
            <button
              type="button"
              className={`btn btn-outline-success ${isMobile ? 'btn-sm mt-2' : 'btn-sm ms-2'}`}
              onClick={onExportExcel}
              disabled={!filteredIeps.length}
              style={{ whiteSpace: 'nowrap' }}
            >
              Export Table to Excel
            </button>
          )}

          {/* <h6>
            {departmentShortName}
          </h6> */}
          <div className="ms-auto">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowColumnDropdown(!showColumnDropdown)}
              style={{
                boxShadow: 'none',
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                padding: isMobile ? '4px 8px' : '6px 12px'
              }}
            >
              {isMobile ? 'Columns' : 'Hide/Show Columns'}
            </button>
          </div>
        </div>

        <div
          className={`table-responsive${exportMode ? ' pdf-avoid-break' : ''}`}
          style={{
            ...styles.tableContainer,
            ...(exportMode ? { pageBreakInside: 'avoid', breakInside: 'avoid' } : {}),
          }}
        >
          <table className="table table-borderless mb-0" style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.thBase, ...styles.firstCol, zIndex: 99 }}>
                  <div style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '2px' : '0',
                    padding: '5px'
                  }}>
                    <small style={{
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: isMobile ? '12px' : '12px',
                    }}>
                      Expand
                    </small>
                  </div>
                </th>

                {Object.entries(columns).map(([k, c]: [string, any]) =>
                  c.visible ? (
                    <th
                      key={k}
                      className={c.responsiveClass || ''}
                      onClick={() => onSort && onSort(c.sortKey)}
                      style={{
                        ...styles.thBase,
                        ...(k === 'performanceMeasureResults' ||
                          k === 'continuousImprovement' ||
                          k === 'resultsMet' ||
                          // k === 'futureBudgetImpact' ||
                          k === 'ifYesPleaseDescribe' ||
                          k === 'budgetImpact'
                          ? styles.thOrange
                          : styles.thBlue),
                        textAlign: 'left',
                      }}
                    >
                      <div style={{
                        // display: 'flex', 
                        alignItems: isMobile ? 'flex-start' : 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? '2px' : '2px',
                        display: 'flex',
                        padding: '4px 0'
                      }}>
                        <div style={{
                          fontWeight: 700,
                          fontSize: isMobile ? '12px' : '12px',
                          color: '#fff',
                          lineHeight: isMobile ? 1.2 : 1.1,
                          whiteSpace: 'normal',
                          overflowWrap: 'initial',
                          wordBreak: 'keep-all',
                          textAlign: isMobile ? 'center' : 'left',
                         
                        }}>
                          {k === 'threeYearGoal' && departmentShortName ?
                            (isMobile ?
                              `${departmentShortName.length > 8 ? departmentShortName.substring(0, 8) + '...' : departmentShortName} - ${c.label.length > 20 ? c.label.substring(0, 20) + '...' : c.label}`
                              : `${departmentShortName} - ${c.label}`)
                            : (isMobile && c.label.length > 25 ? c.label.substring(0, 25) + '...' : c.label)}
                        </div>
                        <div style={{
                          // marginLeft: isMobile ? 0 : 8,
                          alignSelf: isMobile ? 'flex-end' : 'center'
                        }}>
                          {sortIcon(c.sortKey)}
                        </div>
                      </div>
                    </th>
                  ) : null
                )}
              </tr>
            </thead>

            <tbody>
              {filteredIeps.length === 0 && (
                <tr>
                  <td colSpan={visibleCount + 1} style={{ textAlign: 'center', padding: '48px 12px' }}>
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      gap: '12px',
                      color: '#6c757d'
                    }}>
                      <Inbox size={48} strokeWidth={1.5} style={{ opacity: 0.5 }} />
                      <div style={{ fontSize: '14px' }}>
                        {activeSearch ? (
                          <>No Goals match "<strong>{activeSearch}</strong>"</>
                        ) : (
                          'No Goals available'
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {filteredIeps.map((iep: any, iepIndex: number) => (
                <React.Fragment key={iep.Id}>
                  <tr
                    className={`iep-row${exportMode ? ' pdf-avoid-break' : ''}`}
                    onClick={() => onToggleRow(iep.Id)}
                    style={{
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ ...styles.firstCol, background: '#ffdff0', verticalAlign: 'middle' }}>
                      <div style={styles.actionStack}>
                        <button
                          type="button"
                          className="btn p-0"
                          style={{ ...styles.actionBtn, ...styles.expandBtn }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleRow(iep.Id);
                          }}
                          title={expandedRows[iep.Id] ? 'Collapse details' : 'Expand details'}
                          aria-label={expandedRows[iep.Id] ? 'Collapse row' : 'Expand row'}
                        >
                          {expandedRows[iep.Id] ? (
                            <ChevronDown size={isMobile ? 16 : 18} />
                          ) : (
                            <ChevronRight size={isMobile ? 16 : 18} />
                          )}
                        </button>

                      </div>
                    </td>

                    <td colSpan={visibleCount} style={styles.opRowCell}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                      
                       
                        <div style={{
                          lineHeight: 1.05,
                          fontSize: isMobile ? '0.9rem' : '14px'
                        }}>
                          {stripHtml(iep.OperationalGoal)}
                          <br />
                          {
                            iep.OrganizationGoalAlignment.length > 0 &&
                            iep.OrganizationGoalAlignment.map((x, idx) => (
                              <span
                                key={idx}
                                className="badge bg-secondary"
                                style={{ marginRight: '6px', fontSize: '0.75rem', marginTop: "5px" }}
                              >
                                {x?.Tag}
                              </span>
                            ))
                          }
                        </div>
                        <div style={styles.opSubtext}>
                          <small>
                            {departmentShortName ? (
                              // When viewing a specific department, show subdepartment
                              iep.SubDepartments?.SubDepartmentName || iep.Departments?.DepartmentName || ''
                            ) : (
                              // When viewing district-wide or no department selected, show department
                              iep.Departments?.DepartmentName || ''
                            )}
                          </small>
                          <small className="ms-3">{selScorecard.Year}</small>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {expandedRows[iep.Id] && (
                    <tr className={exportMode ? 'pdf-avoid-break' : ''}>
                      <td style={{ backgroundColor: '#f5f5f5' }}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px 0'
                        }}>
                          {onViewIEP && (
                            <button
                              type="button"
                              className="btn p-0"
                              style={styles.actionBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewIEP(iep);
                              }}
                              title="View details"
                              aria-label="View details"
                            >
                              <Eye size={isMobile ? 16 : 18} />
                            </button>
                          )}
                          {onEditIEP && (!canEditIEP || canEditIEP(iep)) && (
                            <button
                              type="button"
                              className="btn p-0 me-2"
                              style={styles.actionBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditIEP(iep);
                              }}
                              title="Edit Goal"
                              aria-label="Edit Goal"
                            >
                              <PencilLine size={isMobile ? 16 : 18} />
                            </button>
                          )}
                          {onDeleteIEP && (!canDeleteIEP || canDeleteIEP(iep)) && (
                            <button
                              type="button"
                              className="btn p-0"
                              style={{ ...styles.actionBtn, color: '#dc3545' }}
                              onClick={async (e) => {
                                e.stopPropagation();
                                const result = await Swal.fire({
                                  title: 'Delete Goal',
                                  html: `Are you sure you want to delete this Goal?<br/><br/><strong>"${stripHtml(iep.OperationalGoal)}"</strong>`,
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonColor: '#dc3545',
                                  cancelButtonColor: '#6c757d',
                                  confirmButtonText: 'Yes, delete it!',
                                  cancelButtonText: 'Cancel'
                                });

                                if (result.isConfirmed) {
                                  onDeleteIEP(iep);
                                }
                              }}
                              title="Delete Goal"
                              aria-label="Delete Goal"
                            >
                              <Trash2 size={isMobile ? 16 : 18} />
                            </button>
                          )}
                        </div>

                      </td>

                      {columns.department?.visible && (
                        <td
                          style={{ ...styles.tdCell }}
                          onClick={() => (onRowClick ? onRowClick(iep) : onToggleRow(iep.Id))}
                        >
                          {iep.Departments?.DepartmentName || '—'}
                        </td>
                      )}

                      {columns.subDepartment?.visible && (
                        <td
                          style={{ ...styles.tdCell }}
                          onClick={() => (onRowClick ? onRowClick(iep) : onToggleRow(iep.Id))}
                        >
                          {iep.SubDepartments?.SubDepartmentName || '—'}
                        </td>
                      )}

                      {columns.organizationalGoal?.visible && (
                        <td
                          dangerouslySetInnerHTML={{ __html: getAlignmentText(iep.OrganizationGoalAlignment, 'Value') }}
                          style={{ ...styles.tdCell }}
                          onClick={() => (onRowClick ? onRowClick(iep) : onToggleRow(iep.Id))}
                        />
                      )}

                      {columns.threeYearGoal?.visible && (
                        <td
                          dangerouslySetInnerHTML={{ __html: getAlignmentText(iep.SharedServiceCampusGoalAlignment, 'ThreeYRSharedService') }}
                          style={{ ...styles.tdCell, ...styles.thinSeparator }}
                          onClick={() => (onRowClick ? onRowClick(iep) : onToggleRow(iep.Id))}
                        />
                      )}

                      {columns.hlcCriteria?.visible && (
                        <td
                          dangerouslySetInnerHTML={{ __html: getAlignmentText(iep.HLCAlignment, 'HLCAlignment') }}
                          style={{ ...styles.tdCell }}
                          onClick={() => (onRowClick ? onRowClick(iep) : onToggleRow(iep.Id))}
                        />
                      )}

                      {columns.operationalTactic?.visible && (
                        <td
                          dangerouslySetInnerHTML={{ __html: decodeAndSanitizeHtml(iep.OperationalTactic || '') }}
                          style={{ ...styles.tdCell }}
                          onClick={() => (onRowClick ? onRowClick(iep) : onToggleRow(iep.Id))}
                        />
                      )}



                      {columns.performanceMeasure?.visible && (
                        <td
                          dangerouslySetInnerHTML={{ __html: decodeAndSanitizeHtml(iep.PerformanceMeasure || '') }}
                          style={{ ...styles.tdCell }}
                          onClick={() => (onRowClick ? onRowClick(iep) : onToggleRow(iep.Id))}
                        >

                        </td>
                      )}
                      {columns.target?.visible && (
                        <td style={{ ...styles.tdCell }}>
                          <div
                            dangerouslySetInnerHTML={{ __html: decodeAndSanitizeHtml(iep.Target || '') }}
                            style={{ ...styles.tdCell }}
                            onClick={() => (onRowClick ? onRowClick(iep) : onToggleRow(iep.Id))}>

                          </div>
                        </td>
                      )}
                      {columns.budgetImpact?.visible && (
                        <td
                          dangerouslySetInnerHTML={{ __html: decodeAndSanitizeHtml(iep.BudgetImpactDescription || '') }}

                          style={{ ...styles.tdCell }}
                          onClick={() => (onRowClick ? onRowClick(iep) : onToggleRow(iep.Id))}
                        >

                        </td>
                      )}

                      {columns.performanceMeasureResults?.visible && (
                        <td className={columns.performanceMeasureResults.responsiveClass || ''} style={styles.tdCell}>
                          <div
                            style={styles.badgeLight}
                            onClick={() => (onRowClick ? onRowClick(iep) : onToggleRow(iep.Id))}
                            dangerouslySetInnerHTML={{
                              __html: decodeAndSanitizeHtml(iep.PerformanceMeasureResults || '—')
                            }}
                          />
                        </td>
                      )}

                      {columns.continuousImprovement?.visible && (
                        <td
                          className={columns.continuousImprovement.responsiveClass || ''}
                          style={styles.tdCell}
                          dangerouslySetInnerHTML={{
                            __html: decodeAndSanitizeHtml(iep.ContinuousImprovement || '—'),
                          }}
                          onClick={() => (onRowClick ? onRowClick(iep) : onToggleRow(iep.Id))}
                        />
                      )}

                      {columns.resultsMet?.visible && (
                        <td className={columns.resultsMet.responsiveClass || ''} style={styles.tdCell}>
                          <div style={{
                            fontWeight: 700,
                            fontSize: isMobile ? '0.8rem' : 'inherit'
                          }} onClick={() => (onRowClick ? onRowClick(iep) : onToggleRow(iep.Id))}>
                            {stripHtml(iep.ResultsMet ?? '—')}
                          </div>
                        </td>
                      )}
                      {/* {columns.futureBudgetImpact?.visible && (
                        <td className={columns.futureBudgetImpact.responsiveClass || ''} style={styles.tdCell}>
                          <div style={{
                            fontWeight: 700,
                            fontSize: isMobile ? '0.75rem' : '0.85rem'
                          }} onClick={() => (onRowClick ? onRowClick(iep) : onToggleRow(iep.Id))}>
                            {iep.FutureBudgetImpact && iep.FutureBudgetImpact !== 'No' ? iep.FutureBudgetImpact : 'No'}
                          </div>
                        </td>
                      )} */}

                      {columns.ifYesPleaseDescribe?.visible && (
                        <td
                          className={columns.ifYesPleaseDescribe.responsiveClass || ''}
                          style={styles.tdCell}
                          dangerouslySetInnerHTML={{
                            __html: iep.IfYesPleaseDescribe || '—',
                          }}
                          onClick={() => (onRowClick ? onRowClick(iep) : onToggleRow(iep.Id))}
                        />
                      )}


                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default IEPTable;