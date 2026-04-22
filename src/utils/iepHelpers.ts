export const getIEPStatus = (iep) => {
  const start = iep.StartDate ? new Date(iep.StartDate).getTime() : 0;
  const end = iep.EndDate ? new Date(iep.EndDate).getTime() : 0;
  const now = Date.now();

  // Check ResultsMet status first - it takes priority
  if (iep.ResultsMet === 'Completed') return 'Completed';
  if (iep.ResultsMet === 'Partially Completed') return 'Partially Completed';
  if (iep.ResultsMet === 'Not Defined') return 'Not Defined';
  if (iep.ResultsMet === 'Not Completed') return 'Not Completed';

  // Then check date-based status
  if (end && end < now && iep.ResultsMet !== 'Completed') return 'Overdue';
  if (start && start > now) return 'Upcoming';
  return 'Active';
};

export const getRecentIEPGoals = (masterAllIEPs) => {
  return masterAllIEPs
    .filter(iep => iep.OperationalGoal)
    .sort((a, b) => new Date(b.Modified || b.Created).getTime() - new Date(a.Modified || a.Created).getTime())
    .slice(0, 5)
    .map(iep => ({
      Id: iep.Id,
      Title: iep.OperationalGoal,
      Department: iep.Departments?.DepartmentName || 'General',
      Status: getIEPStatus(iep),
      Date: new Date(iep.Modified || iep.Created).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', }),
    }));
};
