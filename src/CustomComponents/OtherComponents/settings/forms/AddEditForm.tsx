// src/components/settings/forms/AddEditForm.tsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Save } from "lucide-react";
import Select from "react-select"; // ADDED: For searchable dropdowns
import "react-quill/dist/quill.snow.css";
// import "react-select/dist/react-select.css"; // Optional: default styles

const AddEditForm = ({
  show,
  currentForm,
  editingId,
  formData,
  setFormData,
  lookupData,
  sp,
  onSave,
  onClose,
  isSubmitting,
}) => {
  const [lookupOptions, setLookupOptions] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const originalRef = useRef<any>({});

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["link", "clean"],
    ],
  };

  const quillFormats = [
    "header", "bold", "italic", "underline",
    "list", "bullet", "color", "background",
    "align", "link",
  ];

  // ─── Load lookup options into react-select format ─────────────────────
  useEffect(() => {
    if (!lookupData) return;

    setLookupOptions({
      Department: lookupData.departments?.map((d: any) => ({
        value: d.Id,
        label: d.DepartmentName || d.DepartmentName,
      })) || [],
      SubDepartment: lookupData.subdepartments?.map((d: any) => ({
        value: d.Id,
        label: d.SubDepartmentName,
      })) || [],
      SiteUsers: lookupData.siteUsers?.map((user: any) => ({
        value: user.id,
        label: user.title,
        email: user.email,
      })) || [],
    });
  }, [lookupData]);

  // Preserve original data
  useEffect(() => {
    if (show && editingId) {
      originalRef.current = { ...formData };
    } else {
      originalRef.current = {};
    }
  }, [show, editingId]);

  // ─── VALIDATION LOGIC ─────────────────────────────────────
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const requiredText = (field: string, label: string) => {
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = `${label} is required.`;
      }
    };

    const requiredQuill = (field: string, label: string) => {
      const value = formData[field] || "";
      const text = value.replace(/<[^>]*>/g, "").trim();
      if (!text) {
        newErrors[field] = `${label} is required.`;
      }
    };

    const requiredSelect = (field: string, label: string) => {
      if (!formData[field]) {
        newErrors[field] = `${label} is required.`;
      }
    };

    switch (currentForm) {
      case "departments":
        requiredText("DepartmentName", "Department Name");
        requiredText("DepartmentShortName", "Department Short Name");
        requiredQuill("Vision", "Vision");
        requiredQuill("Mission", "Mission");
        requiredSelect("HeadOfDepartmentId", "Head of Department");
        break;
      case "subdepartments":
        requiredText("SubDepartmentName", "Sub Department Name");
        requiredSelect("DepartmentId", "Parent Department");
        break;
      case "subsubdepartments":
        requiredText("SubSubDepartmentName", "Sub Sub Department Name");
        requiredSelect("SubDepartmentId", "Sub Department");
        break;
      case "orgGoalAlignment":
        requiredText("OrganizationalGoalAlignment", "Organizational Goal Alignment");
        requiredQuill("Value", "Value");
        break;
      case "hlcCriteria":
        requiredText("HLCAlignment", "HLC Alignment");
        requiredQuill("Description", "Description");
        break;
      case "users":
        requiredSelect("UserId", "User");
        requiredSelect("Role", "Role");
        // Department is only required if Role is NOT "Program Director" or "IEPEmployesGroup"
        if (formData.Role !== "Program Director" && formData.Role !== "IEPEmployesGroup") {
          requiredSelect("DepartmentsId", "Department");
        }
        break;
      case "sharedServices":
        requiredQuill("ThreeYRSharedService", "Three-Year Shared Service");
        requiredSelect("DepartmentsId", "Department");
        break;
          case "tags":
        requiredText("Tag", "Tag Name");
        break;
      case "definitions":
        requiredText("Term", "Term");
        requiredQuill("Definition", "Definition");
        requiredText("Section", "Section");
        break;
      case "globalGoals":
        // ScorecardName and Year are added by MS Flow
        // GlobalGoal is optional for updates
        requiredQuill("GlobalGoal", "Global Goal");
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (show) validateForm();
  }, [formData, show]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 && Object.keys(formData).some(key => formData[key]);
  }, [errors, formData]);

  // ─── SEARCHABLE SELECT COMPONENT (REUSABLE) ─────────────────────
  // ADDED: Reusable searchable select with error styling
  const SearchableSelect = ({
    field,
    label,
    options,
    required = false,
    placeholder = "Search...",
  }: {
    field: string;
    label: string;
    options: { value: any; label: string; email?: string }[];
    required?: boolean;
    placeholder?: string;
  }) => {
    const selected = options.find(opt => opt.value === formData[field]) || null;

    return (
      <div className="mb-3">
        <label className="form-label fw-medium">
          {label}{required && <span className="text-danger">*</span>}
        </label>
        <Select
          value={selected}
          onChange={(option: any) => {
            const newFormData = { ...formData, [field]: option ? option.value : "" };
            // If the field is UserId or HeadOfDepartmentId, also store the email
            if (option && option.email && (field === 'UserId' || field === 'HeadOfDepartmentId')) {
              newFormData[`${field}Email`] = option.email;
            }
            setFormData(newFormData);
          }}
           onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          options={options}
          isSearchable
          isClearable={!required} // Allow clear only if not required
          placeholder={placeholder}
          classNamePrefix="react-select"
          styles={{
            control: (base, state) => ({
              ...base,
              borderColor: errors[field] ? "#dc3545" : base.borderColor,
              boxShadow: errors[field] ? "0 0 0 0.2rem rgba(220, 53, 69, 0.25)" : base.boxShadow,
              "&:hover": { borderColor: errors[field] ? "#dc3545" : base.borderColor },
            }),
          }}
        />
        {errors[field] && <div className="text-danger small mt-1">{errors[field]}</div>}
      </div>
    );
  };


  // ─── RENDER FORM FIELDS (Now using SearchableSelect) ─────────────────
  const renderFormFields = () => {
    switch (currentForm) {
      case "departments":
        return (
          <>
            {renderText("DepartmentName", "Department Name", true)}
            {renderText("DepartmentShortName", "Department Short Name", true)}
            <SearchableSelect
              field="HeadOfDepartmentId"
              label="Head of Department"
              options={lookupOptions.SiteUsers || []}
              required
              placeholder="Search user..."
            />
            {renderQuill("Mission", "Mission", true)}
            {renderQuill("Vision", "Vision", true)}
          </>
        );

      case "subdepartments":
        return (
          <>
            {renderText("SubDepartmentName", "Sub Department Name", true)}
            <SearchableSelect
              field="DepartmentId"
              label="Parent Department"
              options={lookupOptions.Department || []}
              required
              placeholder="Search department..."
            />
            {renderQuill("Remark", "Remark", false)}
          </>
        );

      case "subsubdepartments":
        return (
          <>
            {renderText("SubSubDepartmentName", "Sub Sub Department Name", true)}
            <SearchableSelect
              field="SubDepartmentId"
              label="Sub Department"
              options={lookupOptions.SubDepartment || []}
              required
              placeholder="Search sub-department..."
            />
            {renderQuill("Remark", "Remark", false)}
          </>
        );

      case "orgGoalAlignment":
        return (
          <>
            {renderText("OrganizationalGoalAlignment", "Organizational Goal Alignment", true)}
            {renderQuill("Value", "Value", true)}
            {renderText("Tag", "Tag", false)}
          </>
        );

      case "hlcCriteria":
        return (
          <>
            {renderText("HLCAlignment", "HLC Alignment", true)}
            {renderQuill("Description", "Description", false)}
          </>
        );

      case "users":
        return (
          <>
            <SearchableSelect
              field="UserId"
              label="Select User"
              options={lookupOptions.SiteUsers || []}
              required
              placeholder="Search user..."
            />
            <SearchableSelect
              field="Role"
              label="Role"
              options={[
                { value: "Program Director", label: "Program Director" },
                { value: "Planning Unit Manager", label: "Planning Unit Manager" },
                // { value: "GoalEmployeeGroup", label: "Goal Employee (Read Only)" },
              ]}
              required
              placeholder="Select role..."
            />
            {formData.Role !== "Program Director" && formData.Role !== "IEPEmployesGroup" && (
              <SearchableSelect
                field="DepartmentsId"
                label="Department"
                options={lookupOptions.Department || []}
                required
                placeholder="Search department..."
              />
            )}
          </>
        );

      case "sharedServices":
        return (
          <>
            {renderQuill("ThreeYRSharedService", "Three-Year Shared Service", true)}
            <SearchableSelect
              field="DepartmentsId"
              label="Department"
              options={lookupOptions.Department || []}
              required
              placeholder="Search department..."
            />
          </>
        );

      case "tags":
        return (
          <>
            {renderText("Tag", "Tag Name", true)}
          </>
        );

      case "definitions":
        return (
          <>
            {renderText("Term", "Term", true)}
            {renderQuill("Definition", "Definition", true)}
            {renderText("Section", "Section", true)}
          </>
        );

      case "globalGoals":
        return (
          <>
            <div className="alert alert-info" style={{ fontSize: '12px' }}>
              <strong>Note:</strong> Scorecard Name and Year are automatically added by MS Flow every year and cannot be edited here.
            </div>

            <div className="mb-3">
              <label className="form-label fw-medium">Scorecard Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.ScorecardName || ""}
                disabled
                readOnly
                style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed', color: '#495057', opacity: 1 }}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-medium">Year</label>
              <input
                type="text"
                className="form-control"
                value={formData.Year || ""}
                disabled
                readOnly
                style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed', color: '#495057', opacity: 1 }}
              />
            </div>

            {renderQuill("GlobalGoal", "Global Goal", true)}
          </>
        );

      default:
        return <p>No form defined for this configuration.</p>;
    }
  };

  // ─── HELPER RENDERERS (Text & Quill - unchanged) ─────────────────────
  const renderText = (field: string, label: string, required = false) => (
    <div className="mb-3">
      <label className="form-label fw-medium">
        {label}{required && <span className="text-danger">*</span>}
      </label>
      <input
        type="text"
        className={`form-control ${errors[field] ? "is-invalid" : ""}`}
        value={formData[field] || ""}
        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
      {errors[field] && <div className="invalid-feedback">{errors[field]}</div>}
    </div>
  );

  const renderQuill = (field: string, label: string, required = false) => (
    <div className="mb-3">
      <label className="form-label fw-medium">
        {label}{required && <span className="text-danger">*</span>}
      </label>
      <div className={errors[field] ? "border border-danger rounded" : ""}>
        <textarea  
          className={`form-control ${errors[field] ? "is-invalid" : ""}`}
          value={formData[field] || ""}
          onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
          placeholder={`Enter ${label.toLowerCase()}...`}
          style={{ background: "#fff" }}
        />
      </div>
      {errors[field] && (
        <div className="text-danger small mt-1">{errors[field]}</div>
      )}
    </div>
  );

const titleOverrides: Record<string, string> = {
  hlc: "HLC Alignment",
  subdepartments: "Sub Department",
  subsubdepartments: "Sub Sub Department",
  orgGoalAlignment: "Org Goal Alignment",
  sharedServices: "Shared Service/Campus Goals"
};

const title = currentForm
  ? titleOverrides[currentForm] ||
    currentForm.replace(/([A-Z])/g, " $1").trim()
  : "Form";

  if (!show) return null;

  const handleSave = () => {
    if (validateForm()) {
      onSave();
    }
  };

  return (
    <>
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-25"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      />

      <div
        className="position-fixed top-0 end-0 h-100 bg-white shadow-lg d-flex flex-column"
        style={{ width: "600px", maxWidth: "90vw", zIndex: 1050 }}
      >
        <div className="border-bottom p-4 d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-semibold">
            {editingId ? "Edit" : "Add"} <span style={{textTransform:'capitalize'}}> {title}</span>
          </h5>
          <button type="button" className="btn-close" onClick={onClose} />
        </div>

        <div className="flex-grow-1 overflow-auto p-4">{renderFormFields()}</div>

        <div className="border-top p-4 d-flex justify-content-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline-secondary px-4"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary d-flex align-items-center gap-2 px-4"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? "Saving..." : <><Save size={16} /> Save</>}
          </button>
        </div>
      </div>
    </>
  );
};

export default AddEditForm;