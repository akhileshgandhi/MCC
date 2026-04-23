// ─────────────────────────────────────────────────────────────────────────────
//  NewGoalModal – Bootstrap right-side panel (no Tailwind changes to UI)
// ─────────────────────────────────────────────────────────────────────────────
import React, { useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import ReactQuill from 'react-quill';
import Swal from 'sweetalert2';
import 'react-quill/dist/quill.snow.css';
import { NewGoalModalProps } from '../../../types/NewGoalModalProps';
import Loader from '../../../Common/Loader';
import { getAcademicYearLabel, normalizeYearLabel } from '../../../utils/academicYearHelpers';



const NewGoalModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  existingGoals = [],
}: NewGoalModalProps) => {
  const [formData, setFormData] = useState({
    mission: '',
    scorecardName: 'MCC',
    year: getAcademicYearLabel(),
    description: '',
  });

  const [errors, setErrors] = useState<any>({});
  const yearSelectRef = useRef<HTMLSelectElement | null>(null);

  // Build a set of years that already have goals, normalized to the display format used in the dropdown
  const existingYearSet = useMemo(() => {
    const set = new Set<string>();
    for (const g of existingGoals) {
      const normalized = normalizeYearLabel(g?.year ?? g?.Year);
      if (normalized) set.add(normalized);
    }
    return set;
  }, [existingGoals]);

  const validateForm = () => {
    const newErrors: any = {};
    // if (!formData.mission.trim()) newErrors.mission = 'Mission is required';
    if (!formData.year.trim()) newErrors.year = 'Year is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // ────────────────────────────────────────────────
    // 🔍 Duplicate validation by year
    // ────────────────────────────────────────────────
    const normalizedSelectedYear = normalizeYearLabel(formData.year);
    const isDuplicateYear = normalizedSelectedYear ? existingYearSet.has(normalizedSelectedYear) : false;

    if (isDuplicateYear) {
      // Mark the dropdown invalid and show SweetAlert
      setErrors((prev: any) => ({
        ...prev,
        year: 'A goal has already been created for this year.',
      }));

      await Swal.fire({
        icon: 'warning',
        title: 'Goal Already Exists',
        text: `A goal has already been created for the year ${formData.year}.`,
        confirmButtonColor: '#0d6efd',
      });

      // Focus the Year select for immediate correction
      yearSelectRef.current?.focus();
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear specific field error on change
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  /* ---------- Quill toolbar (with colour) ---------- */
  const quillModules = {
    toolbar: [
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

  // -------------------------------------------------------------------------
  //  Bootstrap Off-canvas (right side)
  // -------------------------------------------------------------------------
  return (
    <>
      {/* Off-canvas backdrop */}
      {isOpen && (
        <div
          className="offcanvas-backdrop fade show"
          style={{ zIndex: 1040 }}
          onClick={loading ? undefined : onClose}
        />
      )}

      {/* Off-canvas panel */}
      <div
        className={`offcanvas offcanvas-end ${isOpen ? 'show' : ''}`}
        style={{
          visibility: isOpen ? 'visible' : 'hidden',
          width: '600px',
          zIndex: 1050,
        }}
        tabIndex={-1}
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title">New Organizational Goal</h5>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
             <X size={20} /> 
          </button>
        </div>

        <div className="offcanvas-body p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Scorecard Name (read-only MCC) */}
            <div>
              <label className="form-label">
                Scorecard Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={formData.scorecardName}
                readOnly
                placeholder="MCC"
                disabled={loading}
                onChange={(e) => handleChange('scorecardName', 'MCC')}
                style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
              />
            </div>

            {/* Year (Financial/Academic Year) */}
            <div>
              <label className="form-label">
                Year <span className="text-danger">*</span>
              </label>
              <select
                ref={yearSelectRef}
                className={`form-select ${errors.year ? 'is-invalid' : ''}`}
                value={formData.year}
                onChange={(e) => handleChange('year', e.target.value)}
                disabled={loading}
              >
                <option value="">Select Year</option>
                {Array.from({ length: 5 }, (_, i) => {
                  const startYear = new Date().getFullYear() + i;
                  const endYear = startYear + 1;
                  const displayYear = `${startYear}-${endYear}`;
                  const normalizedDisplay = normalizeYearLabel(displayYear);
                  const exists = normalizedDisplay ? existingYearSet.has(normalizedDisplay) : false;
                  return (
                    <option key={startYear} value={displayYear}>
                      {displayYear} {exists ? '(already exists)' : ''}
                    </option>
                  );
                })}
              </select>
              {errors.year && (
                <div className="invalid-feedback">{errors.year}</div>
              )}
            </div>

            {/* Mission – Rich Text */}
            {/* <div>
              <label className="form-label">
                Mission <span className="text-danger">*</span>
              </label>
              <div className={errors.mission ? 'border border-danger rounded' : ''}>
                <ReactQuill
                  theme="snow"
                  value={formData.mission}
                  onChange={(v) => handleChange('mission', v)}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Enter the mission statement"
                  readOnly={loading}
                  className={loading ? 'opacity-65' : ''}
                />
              </div>
              {errors.mission && (
                <div className="text-danger mt-1 small">{errors.mission}</div>
              )}
            </div> */}

            {/* Description – Rich Text */}
            <div>
              <label className="form-label">
                Description <span className="text-danger">*</span>
              </label>
              <div className={errors.description ? 'border border-danger rounded' : ''}>
                <textarea
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter detailed description"
                  readOnly={loading}
                  // className={loading ? 'opacity-65' : ''}
                />  
              </div>
              {errors.description && (
                <div className="text-danger mt-1 small">{errors.description}</div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="offcanvas-footer border-top bg-light p-3 d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && (
              <Loader size="small" />
            )}
            {loading ? 'Creating...' : 'Create Goal'}
          </button>
        </div>
      </div>
    </>
  );
};

export default NewGoalModal;