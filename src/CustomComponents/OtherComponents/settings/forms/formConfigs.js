// src/components/settings/forms/formConfigs.js
export const sectionOptions = [
  'A1', 'A2', 'A3', 'B1', 'B2', 'B3',
  'C1', 'C2', 'C3', 'D1', 'D2'
];

export const formFields = (departments) => ({
  departments: [
    { name: 'departmentName', label: 'Department Name', type: 'text' },
    { name: 'departmentShortName', label: 'Department Short Name', type: 'text' },
    { name: 'vision', label: 'Vision', type: 'textarea' }
  ],
  users: [
    { name: 'userName', label: 'User Name', type: 'text' },
    { name: 'userEmail', label: 'User Email', type: 'email' },
    { name: 'userAddress', label: 'User Address', type: 'text' },
    { name: 'userImage', label: 'User Image URL', type: 'text' },
    { name: 'role', label: 'Role', type: 'select', options: ['Admin', 'User', 'Manager', 'Viewer'] }
  ],
  orgGoals: [
    { name: 'organizationalGoalAlignment', label: 'Organizational Goal Alignment', type: 'textarea' },
    { name: 'section', label: 'Section', type: 'select', options: sectionOptions }
  ],
  sharedServices: [
    { name: 'threeYRSharedService', label: '3-YR Shared Service/Unit Goal', type: 'textarea' },
    {
      name: 'departmentId',
      label: 'Department',
      type: 'select',
      options: departments.map(d => ({ value: d.id, label: d.departmentName }))
    }
  ],
  hlcCriteria: [
    { name: 'hlcCriteria', label: 'HLC Criteria', type: 'textarea' },
    {
      name: 'departmentId',
      label: 'Department',
      type: 'select',
      options: departments.map(d => ({ value: d.id, label: d.departmentName }))
    }
  ],
  tableHeadings: [
    { name: 'organizationalGoal', label: 'Organizational Goal(s) Alignment', type: 'textarea' },
    { name: 'threeYRSharedService', label: '3-YR Shared Service/Unit Goal(s)', type: 'textarea' },
    { name: 'hlcCriteria', label: 'HLC Criteria Alignment', type: 'text' },
    { name: 'operationalTactic', label: 'Operational Tactic', type: 'textarea' },
    { name: 'performanceMeasure', label: 'Performance Measure', type: 'text' },
    { name: 'target', label: 'Target', type: 'text' },
    { name: 'performanceMeasureResults', label: 'Performance Measure Results', type: 'text' },
    { name: 'continuousImprovement', label: 'Continuous Improvement', type: 'textarea' },
    { name: 'resultsMet', label: 'Results Met', type: 'select', options: ['Yes', 'No', 'Partially'] },
    { name: 'futureBudgetImpact', label: 'Future Budget Impact?', type: 'select', options: ['Yes', 'No'] },
    { name: 'budgetDescription', label: 'If "yes", Please Describe?', type: 'textarea' }
  ]
});