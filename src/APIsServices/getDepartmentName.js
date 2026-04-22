// src/components/settings/utils/getDepartmentName.js
export const getDepartmentName = (departments, id) => {
  return departments.find(d => d.id === id)?.departmentName || 'N/A';
};


