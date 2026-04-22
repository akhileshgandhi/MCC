/**
 * Filter IEPs by scorecard ID
 */
export const filterIEPsByScorecard = (ieps: any[], scorecardId: number | null): any[] => {
  if (scorecardId === null) return ieps;
  return ieps.filter(iep => iep.OrganizationalGoals?.Id === scorecardId);
};

/**
 * Filter IEPs by department ID
 */
export const filterIEPsByDepartment = (ieps: any[], departmentId: number | null): any[] => {
  if (departmentId === null) return ieps;
  return ieps.filter(iep => iep.Departments?.Id === departmentId);
};

/**
 * Filter IEPs by both scorecard and department
 */
export const filterIEPsByScorecardAndDepartment = (ieps: any[], scorecardId: number | null, departmentId: number | null): any[] => {
  if (scorecardId === null && departmentId === null) return ieps;
  return ieps.filter(iep => {
    const matchesScorecard = scorecardId === null || iep.OrganizationalGoals?.Id === scorecardId;
    const matchesDepartment = departmentId === null || iep.Departments?.Id === departmentId;
    return matchesScorecard && matchesDepartment;
  });
};

/**
 * Filter IEPs by sub-department
 */
export const filterIEPsBySubDepartment = (ieps: any[], subDepartmentId: number | null): any[] => {
  if (subDepartmentId === null) return ieps;
  return ieps.filter(iep => iep.SubDepartments?.Id === subDepartmentId);
};

/**
 * Filter IEPs by sub-department and sub-sub-department
 */
export const filterIEPsBySubDepartments = (ieps: any[], subDepartmentId: number | null, subSubDepartmentId: number | null): any[] => {
  if (subDepartmentId === null) return ieps;
  return ieps.filter(iep => {
    const matchesSubDept = iep.SubDepartments?.Id === subDepartmentId;
    const matchesSubSubDept = subSubDepartmentId === null || !iep.SubSubDepartments?.Id || iep.SubSubDepartments?.Id === subSubDepartmentId;
    return matchesSubDept && matchesSubSubDept;
  });
};
