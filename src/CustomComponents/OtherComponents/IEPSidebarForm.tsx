import React, { useEffect, useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import MultiSelectDropdown from './MultiSelectDropdown';
import ReactQuill from 'react-quill';


interface Props {
  selScorecard: any;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  editingIEP: any;
  isOperationalGoalLocked?: boolean;
  departments: any[];
  organizationalScorecards: any[];
  orgGoalOptions: any[];
  threeYrOptions: any[];
  hlcOptions: any[];
  tagOptions: Array<{ Id: number; Tag: string; TagType?: string }>;
  subDepartments: Array<{ Id: number; SubDepartmentName: string }>;
  subSubDepartments?: Array<{ Id: number; SubSubDepartmentName: string }>;
  selectedSubDeptId: string;
  setSelectedSubDeptId: (v: string) => void;
  selectedSubSubDeptId?: string;
  setSelectedSubSubDeptId?: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  userRole: string;
}

const IEPSidebarForm: React.FC<Props> = ({
  selScorecard,
  formData,
  setFormData,
  editingIEP,
  isOperationalGoalLocked = false,
  departments,
  organizationalScorecards,
  orgGoalOptions,
  threeYrOptions,
  hlcOptions,
  tagOptions,
  subDepartments,
  subSubDepartments = [],
  selectedSubDeptId,
  setSelectedSubDeptId,
  selectedSubSubDeptId,
  setSelectedSubSubDeptId,
  onSubmit,
  onClose,
  userRole
}) => {
  // State for expand/collapse sections
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    alignment: true,
    performanceMetrics: true,
    budgetImpact: true,
    operational: true
  });

  // Toggle section expand/collapse
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Determine the department short name (if any) to prefix certain labels.
  const selectedDept =
    (formData?.DepartmentsId != null &&
      departments.find((d) => Number(d.Id) === Number(formData.DepartmentsId))) ||
    departments.find((d) => d.DepartmentName === formData?.Departments);

  const departmentShortName = selectedDept?.DepartmentShortName || '';

  // Filter threeYrOptions based on selected department
  const filteredThreeYrOptions = React.useMemo(() => {
    if (!formData?.DepartmentsId) return threeYrOptions;
    return threeYrOptions.filter((option: any) => {
      const deptId = option?.Departments?.Id || option?.DepartmentsId;
      return deptId && Number(deptId) === Number(formData.DepartmentsId);
    });
  }, [threeYrOptions, formData?.DepartmentsId]);

  // Sort hlcOptions by number prefix
  const sortedHlcOptions = React.useMemo(() => {
    return [...hlcOptions].sort((a: any, b: any) => {
      const aMatch = a.HLCAlignment?.match(/^(\d+)/);
      const bMatch = b.HLCAlignment?.match(/^(\d+)/);
      const aNum = aMatch ? parseInt(aMatch[1]) : 999;
      const bNum = bMatch ? parseInt(bMatch[1]) : 999;
      return aNum - bNum;
    });
  }, [hlcOptions]);

  // Sync incoming selectedSubDeptId/selectedSubSubDeptId props into formData
  useEffect(() => {
    if (!selectedSubDeptId) return;
    if (String(formData.SubDepartmentId) !== String(selectedSubDeptId)) {
      setFormData((p: any) => ({
        ...p,
        SubDepartmentId: String(selectedSubDeptId),
        SubSubDepartmentId: selectedSubSubDeptId ? String(selectedSubSubDeptId) : ''
      }));
      if (!selectedSubSubDeptId && setSelectedSubSubDeptId) {
        setSelectedSubSubDeptId('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubDeptId]);

  useEffect(() => {
    if (!selectedSubSubDeptId) return;
    if (String(formData.SubSubDepartmentId) !== String(selectedSubSubDeptId)) {
      setFormData((p: any) => ({
        ...p,
        SubSubDepartmentId: String(selectedSubSubDeptId),
        SubDepartmentId: selectedSubDeptId ? String(selectedSubDeptId) : p.SubDepartmentId
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubSubDeptId]);

  useEffect(() => {
    if (!selectedSubSubDeptId) return;
    const found = subSubDepartments.some(s => String(s.Id) === String(selectedSubSubDeptId));
    if (found) {
      if (String(formData.SubSubDepartmentId) !== String(selectedSubSubDeptId)) {
        setFormData((p: any) => ({
          ...p,
          SubSubDepartmentId: String(selectedSubSubDeptId),
          SubDepartmentId: selectedSubDeptId ? String(selectedSubDeptId) : p.SubDepartmentId
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubSubDeptId, subSubDepartments]);

  /* ---------- Quill toolbar (with colour) ---------- */
  const quillModules = {
    toolbar: isOperationalGoalLocked ? false : [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };
  const quillFormats = [
    'header',
    'bold',
    'italic',
    'underline',
    'color',
    'background',
    'list',
    'bullet',
    'link',
  ];

  // Determine if department is editable (only PD can change, PUM and IEPEmployee cannot)
  const isDepartmentEditable = userRole === "Program Director";

  // Auto-populate department for Planning Unit Manager on mount if not already set
  useEffect(() => {
    if (userRole === "Planning Unit Manager" && departments.length > 0 && !formData.DepartmentsId) {
      // Find current user's department from usersList (passed via context or parent)
      // Since we don't have access to currentUser/usersList here, we rely on parent to pass correct dept
      // But for auto-fill, we assume parent has already set formData.DepartmentsId
      // So we do nothing extra — just prevent editing below.
    }
  }, [userRole, departments, formData.DepartmentsId]);

  return (
    <>
      <div
        className="position-fixed top-0 end-0 h-100 bg-white shadow-lg border-start"
        style={{ zIndex: 99999, overflowY: 'auto', width: '90%', maxWidth: '50rem' }}
      >
        <div className="p-3 p-md-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0">{editingIEP ? 'Edit' : 'New'} Operational Goal</h5>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onSubmit}>
            {/* Basic Information Section */}
            <section className="mb-4 border rounded">
              <div
                className="d-flex justify-content-between align-items-center p-3 bg-light rounded-top"
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSection('basicInfo')}
              >
                <h6 className="mb-0 text-primary fw-semibold">Planning Unit Information</h6>
                {expandedSections.basicInfo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expandedSections.basicInfo && (
                <div className="p-3">
                  <div className="row mb-3">
                    <div className="col-12">
                      <input
                        type="text"
                        className="form-control-plaintext fw-semibold text-dark p-2"
                        value={
                          selScorecard
                            ? `${selScorecard.ScorecardName || ''} - ${selScorecard.Year || ''}`
                            : ''
                        }
                        readOnly
                        disabled
                      />
                    </div>
                  </div>

                  {/* Display Global Goal for the selected scorecard */}
                  {/* {selScorecard?.GlobalGoal && (
                    <div className="row mb-3">
                      <div className="col-12">
                        <div 
                          className="p-3"
                          style={{
                            backgroundColor: '#e3f2fd',
                            borderLeft: '4px solid #0b4f86',
                            borderRadius: '4px'
                          }}
                        >
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span style={{ 
                              fontSize: '11px', 
                              fontWeight: 700, 
                              color: '#0b4f86',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              🌐 Global Goal for {selScorecard.Year}
                            </span>
                          </div>
                          <div
                            style={{ 
                              fontSize: '13px', 
                              color: '#1565c0',
                              lineHeight: '1.5'
                            }}
                            dangerouslySetInnerHTML={{ __html: selScorecard.GlobalGoal }}
                          />
                        </div>
                      </div>
                    </div>
                  )} */}

                  <div className="row">
                    <div className="col-12 ">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Department *</label>
                        {isDepartmentEditable ? (
                          <select
                            className="form-select"
                            value={formData.Departments || ''}
                            onChange={(e) => {
                              const selectedDept = departments.find(d => d.DepartmentName === e.target.value);
                              setFormData((p: any) => ({
                                ...p,
                                Departments: e.target.value,
                                DepartmentsId: selectedDept?.Id ?? null,
                                SubDepartmentId: '',
                                SubSubDepartmentId: ''
                              }));
                              setSelectedSubDeptId('');
                              setSelectedSubSubDeptId?.('');
                            }}
                            required={!editingIEP}
                          >
                            <option value="">Select Department</option>
                            {departments.map((d: any) => (
                              <option key={d.Id} value={d.DepartmentName}>{d.DepartmentName}</option>
                            ))}
                          </select>
                        ) : (
                          <>
                            <input
                              type="text"
                              className="form-control"
                              value={formData.Departments || ''}
                              readOnly
                              disabled
                              style={{ backgroundColor: '#f8f9fa' }}
                            />
                            <small className="text-muted mt-1 d-block">
                              Department is auto-assigned and cannot be changed.
                            </small>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Sub-Department </label>
                        <select
                          className="form-select"
                          value={formData.SubDepartmentId || ''}
                          onChange={(e) => {
                            const id = e.target.value;
                            setFormData((p: any) => ({ ...p, SubDepartmentId: id, SubSubDepartmentId: '' }));
                            setSelectedSubDeptId(id);
                            setSelectedSubSubDeptId?.('');
                          }}
                          disabled={!formData.DepartmentsId}
                        >
                          <option value="">
                            {formData.DepartmentsId ? 'Select Sub-Department' : 'Select Department first'}
                          </option>
                          {subDepartments.map((s) => (
                            <option key={s.Id} value={s.Id}>
                              {s.SubDepartmentName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label fw-bold">Sub-Sub-Department</label>
                        <select
                          className="form-select"
                          value={formData.SubSubDepartmentId || ''}
                          onChange={(e) => {
                            const id = e.target.value;
                            setFormData((p: any) => ({ ...p, SubSubDepartmentId: id }));
                            setSelectedSubSubDeptId?.(id);
                          }}
                          disabled={!formData.SubDepartmentId}
                        >
                          <option value="">
                            {formData.SubDepartmentId ? 'Select Sub-Sub-Department (optional)' : 'Select Sub-Department first'}
                          </option>
                          {subSubDepartments.map((s) => (
                            <option key={s.Id} value={s.Id}>
                              {s.SubSubDepartmentName}
                            </option>
                          ))}
                        </select>
                        {!formData.SubDepartmentId && (
                          <small className="text-muted">Please select a sub-department first</small>
                        )}
                        {formData.SubDepartmentId && subSubDepartments.length === 0 && (
                          <small className="text-muted">No sub-sub-departments available for this sub-department</small>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="mb-4 border rounded">
              <div
                className="d-flex justify-content-between align-items-center p-3 bg-light rounded-top"
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSection('operational')}
              >
                <h6 className="mb-0 text-primary fw-semibold">Operational Goal</h6>
                {expandedSections.operational ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              {expandedSections.operational && (
                <div className="p-3">
                  <div className="mb-3 d-flex flex-column">
                    <label className="form-label">
                      Operational Goal *
                      {isOperationalGoalLocked && (
                        <span className="badge bg-warning text-dark ms-2">Locked</span>
                      )}
                    </label>
                    <div style={{ opacity: isOperationalGoalLocked ? 0.6 : 1, pointerEvents: isOperationalGoalLocked ? 'none' : 'auto' }}>
                      <ReactQuill value={formData.OperationalGoal}
                        onChange={(v) => !isOperationalGoalLocked && setFormData((p: any) => ({ ...p, OperationalGoal: v }))}
                        theme="snow" modules={quillModules}
                        formats={quillFormats} />
                    </div>

                    {isOperationalGoalLocked && (
                      <small className="text-warning mt-2" style={{ display: 'block', fontWeight: 500 }}>
                        ℹ️ This is a Global Goal. Only Program Director can edit the Operational Goal. You can update other fields.
                      </small>
                    )}


                    {/* <textarea
                      value={formData.OperationalGoal || ""}
                      onChange={(e) =>
                        setFormData((p: any) => ({
                          ...p,
                          OperationalGoal: e.target.value,
                        }))
                      }
                      className="form-control"
                    /> */}

                  </div>
                </div>
              )}
            </section>



            {/* Alignment Section */}
            <section className="mb-4 border rounded">
              <div
                className="d-flex justify-content-between align-items-center p-3 bg-light rounded-top"
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSection('alignment')}
              >
                <h6 className="mb-0 text-primary fw-semibold">Open the loop</h6>
                {expandedSections.alignment ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expandedSections.alignment && (
                <>
                  <div className="p-3">
                    <MultiSelectDropdown
                      label="Org Goal Alignment"
                      options={orgGoalOptions}
                      selected={formData.OrganizationGoalAlignment}
                      onChange={(s: string[]) => {
                        // Auto-populate tags from selected OrganizationGoalAlignment
                        const selectedIds = s.map(Number);
                        const selectedOrgs = orgGoalOptions.filter((o: any) => selectedIds.includes(Number(o.Id)));
                        const tags = selectedOrgs
                          .map((o: any) => o.Tag)
                          .filter((tag: string) => tag && tag.trim() !== '');
                        const uniqueTags = Array.from(new Set(tags));
                        setFormData((p: any) => ({
                          ...p,
                          OrganizationGoalAlignment: s,
                          Tags: uniqueTags
                        }));
                      }}
                      getOptionLabel={(o: any) => o.Value} />
                    {/* Display Tags from selected Organization Goal Alignment */}
                    {formData.Tags && formData.Tags.length > 0 && (
                      <div className="mb-3">
                        <label className="form-label fw-bold">Tags</label>
                        <div className="d-flex flex-wrap gap-2">
                          {formData.Tags.map((tag: string, index: number) => (
                            <span key={index} className="badge bg-primary">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <small className="text-muted d-block mt-1">
                          Tags are automatically populated from selected Organization Goal Alignment.
                        </small>
                      </div>
                    )}
                    <MultiSelectDropdown
                      label={`${departmentShortName ? `${departmentShortName} - ` : ''}3-YR Plan Alignment`}
                      options={filteredThreeYrOptions}
                      selected={formData.SharedServiceCampusGoalAlignment}
                      onChange={(s: string[]) => setFormData((p: any) => ({ ...p, SharedServiceCampusGoalAlignment: s }))}
                      getOptionLabel={(o: any) => {
                        const deptShortName = o?.Departments?.DepartmentShortName || '';
                        const serviceText = o.ThreeYRSharedService || '';
                        return deptShortName ? `[${deptShortName}] ${serviceText}` : serviceText;
                      }} />
                    <MultiSelectDropdown
                      label="HLC Criteria"
                      options={sortedHlcOptions}
                      selected={formData.HLCAlignment}
                      onChange={(s: string[]) => setFormData((p: any) => ({ ...p, HLCAlignment: s }))}
                      getOptionLabel={(o: any) => o.HLCAlignment} />

                    <div className="mb-3 d-flex flex-column">
                      <label className="form-label">Operational Tactic</label>
                      <ReactQuill
                        value={formData.OperationalTactic || ""}
                        onChange={(v) => setFormData((p: any) => ({ ...p, OperationalTactic: v }))}
                        theme="snow"
                        modules={quillModules}
                        formats={quillFormats}
                      />
                    </div>
                    <div className="mb-3 d-flex flex-column">
                      <label className="form-label">Performance Measure</label>
                      <ReactQuill
                        value={formData.PerformanceMeasure || ""}
                        onChange={(v) => setFormData((p: any) => ({ ...p, PerformanceMeasure: v }))}
                        theme="snow"
                        modules={quillModules}
                        formats={quillFormats}
                      />
                    </div>
                    <div className="mb-3 d-flex flex-column">
                      <label className="form-label">Target</label>
                      <ReactQuill
                        value={formData.Target || ""}
                        onChange={(v) => setFormData((p: any) => ({ ...p, Target: v }))}
                        theme="snow"
                        modules={quillModules}
                        formats={quillFormats}
                      />
                    </div>
                  </div>
                </>
              )}
            </section>



            {/* Budget Impact Section */}
            <section className="mb-4 border rounded">
              <div
                className="d-flex justify-content-between align-items-center p-3 bg-light rounded-top"
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => toggleSection('budgetImpact')}
              >
                <h6 className="mb-0 text-primary fw-semibold">Close the loop</h6>
                {expandedSections.budgetImpact ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expandedSections.budgetImpact && (

                <div className="p-3">


                  <div className="mb-3 d-flex flex-column">
                    <label className="form-label">Performance Measure Results</label>
                    <ReactQuill
                      value={formData.PerformanceMeasureResults || ""}
                      onChange={(v) => setFormData((p: any) => ({ ...p, PerformanceMeasureResults: v }))}
                      theme="snow"
                      modules={quillModules}
                      formats={quillFormats}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Results Met</label>

                    <select
                      className="form-select"
                      value={formData.ResultsMet}
                      onChange={(e) => setFormData((p: any) => ({ ...p, ResultsMet: e.target.value }))}

                    >
                      <option value="Not Defined">Not Defined</option>
                      <option value="Completed">Completed</option>
                      <option value="Partially Completed">Partially Completed</option>
                      <option value="Not Completed">Not Completed</option>
                    </select>

                  </div>

                  <div className="mb-3 d-flex flex-column">
                    <label className="form-label">Continuous Improvement</label>
                    <ReactQuill
                      value={formData.ContinuousImprovement || ""}
                      onChange={(v) => setFormData((p: any) => ({ ...p, ContinuousImprovement: v }))}
                      theme="snow"
                      modules={quillModules}
                      formats={quillFormats}
                    />
                  </div>


                  {/* <div className="mb-3 d-flex flex-column">
                    <label className="form-label">Budget Impact Description</label>
                    <ReactQuill
                      value={formData.BudgetImpactDescription || ""}
                      onChange={(v) => setFormData((p: any) => ({ ...p, BudgetImpactDescription: v }))}
                      theme="snow"
                      modules={quillModules}
                      formats={quillFormats}
                    />
                  </div> */}
                  <div className="row">
                    {/* <div className="col-12 col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Future Budget Impact</label>
                        <select
                          className="form-select"
                          value={formData.FutureBudgetImpact || "No"}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              FutureBudgetImpact: e.target.value
                            }))
                          }
                        >
                          <option value="No">No</option>
                          <option value="Yes, budget request was submitted">Yes, budget request was submitted</option>
                          <option value="Yes, budget request will be accounted for with existing budget">Yes, budget request will be accounted for with existing budget</option>
                        </select>
                      </div>
                    </div> */}
                    <div className="col-12 col-md-12">
                      <div className="mb-3 d-flex flex-column">
                        <label className="form-label">
                          Describe future budget impact
                          {/* {(formData.FutureBudgetImpact && formData.FutureBudgetImpact !== "No") && <span className="text-danger ms-1">*</span>} */}
                        </label>
                        <ReactQuill
                          value={formData.IfYesPleaseDescribe || ""}
                          onChange={(v) => setFormData((p: any) => ({ ...p, IfYesPleaseDescribe: v }))}
                          theme="snow"
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Description"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <div className="d-flex flex-column flex-sm-row gap-2 pt-3 border-top">
              <button type="submit" className="btn btn-primary flex-fill">
                {editingIEP ? 'Update' : 'Create'} Goal
              </button>
              <button type="button" className="btn btn-outline-secondary flex-fill flex-sm-grow-0" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-25" style={{ zIndex: 1050 }} onClick={onClose} />
    </>
  );
};

export default IEPSidebarForm;