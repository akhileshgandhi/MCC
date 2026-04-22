import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DOMPurify from 'dompurify';
import { getDefaultDataTable, updateDefaultDataTable } from '../../APIsServices/SharePointService';
import DiscussionSidebar from './DiscussionSidebar';

// Helper function to decode HTML entities and sanitize
const decodeAndSanitizeHtml = (html: string): string => {
  if (!html) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = html;
  const decoded = textarea.value;
  return DOMPurify.sanitize(decoded);
};

const IEPDetailsView = ({ iep, onEdit, isMobile, isTablet, setShowCharts, setShowOperationalGoalsList, sp, currentUser, userRole }: any) => {
  const [isExpanded, setIsExpanded] = useState({});
  const [defaultData, setDefaultData] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // Responsive state
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchDefaultData = async () => {
      try {
        const data = await getDefaultDataTable(sp);
        setDefaultData(data);
      } catch (error) {
        console.error("Error fetching default data:", error);
      }
    };

    if (sp) {
      fetchDefaultData();
    }
  }, [sp]);

  const toggleExpanded = (section: string) => {
    setIsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleEditClick = () => {
    if (defaultData.length > 0) {
      // Strip HTML tags when entering edit mode for cleaner editing
      setEditedData({
        ...defaultData[0],
        LeftText: stripHtmlTags(defaultData[0].LeftText || ''),
        RightText: stripHtmlTags(defaultData[0].RightText || ''),
        DefaultValueHeaderIEP: stripHtmlTags(defaultData[0].DefaultValueHeaderIEP || '')
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData({});
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateDefaultDataTable(sp, editedData.Id, {
        LeftText: convertTextToHtml(editedData.LeftText),
        RightText: convertTextToHtml(editedData.RightText),
        DefaultValueHeaderIEP: convertTextToHtml(editedData.DefaultValueHeaderIEP)
      });

      // Refresh the data
      const data = await getDefaultDataTable(sp);
      setDefaultData(data);
      setIsEditing(false);
      setEditedData({});
    } catch (error: any) {
      console.error("Error saving default data:", error);
      const is401 = String(error?.message || error).includes('401');
      if (is401) {
        window.location.reload();
        return;
      }
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setEditedData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const stripHtmlTags = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const convertTextToHtml = (text: string) => {
    // Convert plain text to HTML with proper paragraph formatting
    return text
      .split('\n\n')
      .map(para => para.trim())
      .filter(para => para)
      .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('');
  };

  const InfoCard = ({ title, content, headerColor = '#004C8E', sectionKey }: any) => {
    const contentStr = content || 'N/A';
    const shouldTruncate = isMobile && contentStr.length > 200;
    const isSectionExpanded = isExpanded[sectionKey];

    // Decode and sanitize HTML content from ReactQuill
    const htmlContent = contentStr === 'N/A' ? '<p>N/A</p>' : decodeAndSanitizeHtml(contentStr);

    const displayContent = shouldTruncate && !isSectionExpanded
      ? htmlContent.substring(0, 200) + '...'
      : htmlContent;

    return (
      <div className="mb-3" style={{ marginBottom: isMobile ? '0.75rem' : '1rem' }}>
        <div
          className="p-2 text-white fw-bold d-flex justify-content-between align-items-center"
          style={{
            backgroundColor: headerColor,
            fontSize: isMobile ? '0.875rem' : '1rem',
            minHeight: isMobile ? '40px' : 'auto'
          }}
        >
          <span style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
            {title}
          </span>
          {shouldTruncate && (
            <button
              type="button"
              className="btn btn-link text-white p-0"
              onClick={() => toggleExpanded(sectionKey)}
              style={{
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                textDecoration: 'none'
              }}
            >
              {isSectionExpanded ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
        <div
          className="p-3 border border-top-0"
          style={{
            backgroundColor: '#f9f9f9',
            fontSize: isMobile ? '0.875rem' : '1rem',
            lineHeight: isMobile ? 1.4 : 1.5
          }}
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
      </div>
    );
  };

  const getAlignmentText = (arr: any[] | undefined, field: string) => {
    if (!arr?.length) return 'N/A';
    return arr.map((item: any) => item[field]).join(', ');
  };

  return (
    <div className="container-fluid">
      <style>
        {`
          @media (max-width: 768px) {
            .iep-details-container {
              padding: 0.5rem !important;
            }
            
            .iep-details-card {
              margin-bottom: 0.75rem !important;
            }
            
            .iep-details-header {
              font-size: 0.875rem !important;
              min-height: 40px !important;
            }
            
            .iep-details-content {
              font-size: 0.875rem !important;
              padding: 0.75rem !important;
            }
            
            .iep-row {
              margin-bottom: 0 !important;
            }
            
            .iep-col {
              padding-left: 0.5rem !important;
              padding-right: 0.5rem !important;
            }
          }
          
          @media (max-width: 576px) {
            .iep-details-container {
              padding: 0.25rem !important;
            }
            
            .iep-details-content {
              font-size: 0.8rem !important;
              padding: 0.5rem !important;
            }
            
            .iep-details-header {
              font-size: 0.8rem !important;
              padding: 0.5rem !important;
            }
          }
          
          @media (max-width: 480px) {
            .iep-col {
              padding-left: 0.25rem !important;
              padding-right: 0.25rem !important;
            }
          }
        `}
      </style>

      <div className="iep-details-container" style={{ padding: isMobile ? '0.5rem' : '1rem' }}>

        {/* Department/Sub-Department Header */}
        <div className="mb-4 p-3" style={{
          backgroundColor: '#0b4f86',
          color: 'white',
          borderRadius: '0.5rem',
          fontSize: isMobile ? '1rem' : '1.25rem',
          fontWeight: '600'
        }}>
          {iep.SubSubDepartments?.SubSubDepartmentName ||
            iep.SubDepartments?.SubDepartmentName ||
            iep.Departments?.DepartmentName ||
            'Operational Goal Details'}
        </div>

        {/* Header Information Section */}
        {defaultData.length > 0 && (
          <div className="mb-4" style={{ marginBottom: isMobile ? '1rem' : '1.5rem' }}>
            {/* Edit/Save Buttons - Only for Program Director */}
            {userRole === 'Program Director' && (
              <div className="mb-3 d-flex justify-content-end gap-2">
                {!isEditing ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleEditClick}
                    style={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                  >
                    Edit Header
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      style={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-success btn-sm"
                      onClick={handleSave}
                      disabled={isSaving}
                      style={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            )}

            {defaultData.map((item, index) => (
              <div key={item.Id || index} className="mb-3">
                {!isEditing ? (
                  <>
                    <div className="row" style={{ margin: '0 -0.5rem' }}>
                      <div className="col-12 col-md-6" style={{ padding: '0 0.5rem', marginBottom: isMobile ? '0.5rem' : '0' }}>
                        <div
                          style={{
                            fontSize: isMobile ? '0.875rem' : '1rem',
                            lineHeight: 1.6,
                            color: '#333'
                          }}
                          dangerouslySetInnerHTML={{ __html: item.LeftText || '' }}
                        />
                      </div>
                      <div className="col-12 col-md-6" style={{ padding: '0 0.5rem' }}>
                        <div
                          style={{
                            fontSize: isMobile ? '0.875rem' : '1rem',
                            lineHeight: 1.6,
                            color: '#333'
                          }}
                          dangerouslySetInnerHTML={{ __html: item.RightText || '' }}
                        />
                      </div>
                    </div>
                    {item.DefaultValueHeaderIEP && (
                      <div
                        className="mt-3 p-3"
                        style={{
                          backgroundColor: '#f8f9fa',
                          borderLeft: '4px solid #004C8E',
                          fontSize: isMobile ? '0.875rem' : '1rem',
                          lineHeight: 1.6
                        }}
                        dangerouslySetInnerHTML={{ __html: item.DefaultValueHeaderIEP || '' }}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <div className="row" style={{ margin: '0 -0.5rem' }}>
                      <div className="col-12 col-md-6" style={{ padding: '0 0.5rem', marginBottom: '1rem' }}>
                        <label className="form-label fw-bold" style={{ fontSize: '0.875rem' }}>Left Text</label>
                        <textarea
                          className="form-control"
                          rows={6}
                          value={editedData.LeftText || ''}
                          onChange={(e) => handleFieldChange('LeftText', e.target.value)}
                          style={{ fontSize: isMobile ? '0.875rem' : '1rem', lineHeight: 1.5 }}
                          placeholder="Enter plain text. Paragraphs will be separated by double line breaks."
                        />
                        <small className="text-muted">Edit as plain text. HTML formatting will be applied automatically.</small>
                      </div>
                      <div className="col-12 col-md-6" style={{ padding: '0 0.5rem', marginBottom: '1rem' }}>
                        <label className="form-label fw-bold" style={{ fontSize: '0.875rem' }}>Right Text</label>
                        <textarea
                          className="form-control"
                          rows={6}
                          value={editedData.RightText || ''}
                          onChange={(e) => handleFieldChange('RightText', e.target.value)}
                          style={{ fontSize: isMobile ? '0.875rem' : '1rem', lineHeight: 1.5 }}
                          placeholder="Enter plain text. Paragraphs will be separated by double line breaks."
                        />
                        <small className="text-muted">Edit as plain text. HTML formatting will be applied automatically.</small>
                      </div>
                    </div>
                    <div className="row" style={{ margin: '0 -0.5rem' }}>
                      <div className="col-12" style={{ padding: '0 0.5rem' }}>
                        <label className="form-label fw-bold" style={{ fontSize: '0.875rem' }}>Default Value Header</label>
                        <textarea
                          className="form-control"
                          rows={5}
                          value={editedData.DefaultValueHeaderIEP || ''}
                          onChange={(e) => handleFieldChange('DefaultValueHeaderIEP', e.target.value)}
                          style={{ fontSize: isMobile ? '0.875rem' : '1rem', lineHeight: 1.5 }}
                          placeholder="Enter plain text. Paragraphs will be separated by double line breaks."
                        />
                        <small className="text-muted">Edit as plain text. HTML formatting will be applied automatically.</small>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            <hr style={{ margin: isMobile ? '1rem 0' : '1.5rem 0', borderTop: '2px solid #dee2e6' }} />
          </div>
        )}

        <div className="row iep-row" style={{ margin: isMobile ? '0 -0.5rem' : '0 -1rem' }}>
          {/* Left Column */}
          <div className={`iep-col ${isMobile ? 'col-12' : 'col-12 col-lg-6'}`}
            style={{
              paddingLeft: isMobile ? '0.5rem' : '1rem',
              paddingRight: isMobile ? '0.5rem' : '1rem'
            }}>
            
            <InfoCard
              title="Operational Goal"
              content={iep.OperationalGoal || 'N/A'}
              sectionKey="operationalGoal"
            />

            <InfoCard
              title="Organizational Goal(s) Alignment"
              content={getAlignmentText(iep.OrganizationGoalAlignment, 'Value')}
              sectionKey="orgAlignment"
            />
            <InfoCard
              title={`${iep.Departments?.DepartmentShortName} Shared Service Campus Goal Alignment`}
              content={getAlignmentText(iep.SharedServiceCampusGoalAlignment, 'ThreeYRSharedService')}
              sectionKey="SharedServiceCampusGoalAlignment"
            />
            <InfoCard
              title="HLC Criteria Alignment"
              content={getAlignmentText(iep.HLCAlignment, 'Description')}
              sectionKey="hlcAlignment"
            />
            <InfoCard
              title="Operational Tactic"
              content={iep.OperationalTactic || 'N/A'}
              sectionKey="operationalTactic"
            />

            <InfoCard
              title="Performance Measure"
              content={iep.PerformanceMeasure || 'N/A'}
              sectionKey="performanceMeasure"
            />

            <InfoCard
              title="Target"
              content={iep.Target || 'N/A'}
              sectionKey="target"
            />


          </div>

          {/* Right Column */}
          <div className={`iep-col ${isMobile ? 'col-12' : 'col-12 col-lg-6'}`}
            style={{
              paddingLeft: isMobile ? '0.5rem' : '1rem',
              paddingRight: isMobile ? '0.5rem' : '1rem',
              marginTop: isMobile ? '0' : '0'
            }}>
            <InfoCard
              title="Performance Measure Results"
              content={iep.PerformanceMeasureResults || ''}
              headerColor="#FFBF32"
              sectionKey="results"
            />


            <InfoCard
              title="Continuous Improvement"
              content={iep.ContinuousImprovement || ''}
              headerColor="#FFBF32"
              sectionKey="continuousImprovement"
            />

            <InfoCard
              title="Results Met"
              content={iep.ResultsMet || ''}
              headerColor="#FFBF32"
              sectionKey="resultsMet"
            />

            {/* <InfoCard
              title="Future Budget Impact?"
              content={iep.FutureBudgetImpact || ''}
              headerColor="#FFBF32"
              sectionKey="budgetImpact"
            /> */}

            <InfoCard
              title='If "Yes", please describe'
              content={iep.IfYesPleaseDescribe || ''}
              headerColor="#FFBF32"
              sectionKey="budgetDescription"
            />

            <InfoCard
              title="Budget Explainer"
              content={
                iep.BudgetImpactDescription ||
                '*Total budget impact based on continuous improvement learnings for future initiatives to support performance improvement. Provide a dollar amount and explanation of your course of action.'
              }
              headerColor="#FFBF32"
              sectionKey="budgetExplainer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        {/* <div className="row mt-3">
          <div className="col-12">
            <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-end'} gap-2`}
              style={{
                paddingTop: isMobile ? '1rem' : '1.5rem',
                marginTop: isMobile ? '1rem' : '1.5rem',
                borderTop: '1px solid #e9ecef'
              }}>
              <button
                type="button"
                className={`btn btn-primary ${isMobile ? 'btn-sm' : ''}`}
                onClick={() => onEdit && onEdit(iep)}
                style={{
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  padding: isMobile ? '6px 12px' : '8px 16px',
                  minWidth: isMobile ? '120px' : '150px'
                }}
              >
                {isMobile ? 'Edit IEP' : 'Edit IEP'}
              </button>
            </div>
          </div>
        </div> */}
      </div>

      {/* Discussion Sidebar */}
      {iep && sp && currentUser && (
        <DiscussionSidebar
          sp={sp}
          iepId={iep.ID}
          departmentId={iep.Departments?.Id || iep.DepartmentId}
          currentUser={currentUser}
          isMobile={isMobile}
        />
      )}
    </div>
  );
};

export default IEPDetailsView;