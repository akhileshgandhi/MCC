/**
 * Clear all view states to show IEP table
 */
export const clearViewStates = (
  setShowCharts: (value: boolean) => void,
  setShowOperationalGoalsList: (value: boolean) => void,
  setSelectedIEPDetail: (value: any) => void,
  setChartDeptId: (value: number | null) => void,
  setShowDistrictCharts: (value: boolean) => void
) => {
  setShowCharts(false);
  setShowOperationalGoalsList(false);
  setSelectedIEPDetail(null);
  setChartDeptId(null);
  setShowDistrictCharts(false);
};

/**
 * Close sidebar on mobile
 */
export const closeSidebarOnMobile = (isMobile: boolean, setSidebarOpen: (value: boolean) => void) => {
  if (isMobile) {
    setSidebarOpen(false);
  }
};

/**
 * Reset selection states
 */
export const resetSelectionStates = (
  setSelectedDepartment: (value: any) => void,
  setSelectedIEP: (value: any) => void,
  setSelectedIEPName: (value: string) => void
) => {
  setSelectedDepartment(null);
  setSelectedIEP(null);
  setSelectedIEPName('');
};
