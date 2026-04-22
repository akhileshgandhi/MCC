import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AlertTriangle, Bell, Building, CheckCircle, ClipboardCheck, Target, Users, X, ChevronDown, LogOut, Settings, User, BookOpen } from 'lucide-react';
import IconNavigation from '../OtherComponents/IconNavigation';
import DashboardContent from '../OtherComponents/DashboardContent';
import ScorecardContent from '../OtherComponents/ScorecardContent';
import UsersContent from '../OtherComponents/UsersContent';
import SettingsContent from '../OtherComponents/settings/SettingsContent';
import ArchivedContent from '../OtherComponents/ArchivedContent';
import RecentIEPsContent from '../OtherComponents/RecentIEPsContent';
import DocumentViewer from '../OtherComponents/DocumentViewer';
import { Sidebar } from '../OtherComponents/Sidebar';
import "../CustomCss/Dashboard.scss";
import NewGoalModal from '../OtherComponents/AddEditFormComponent/NewGoalModal';
import { createOrganizationalGoal, fetchUsersListAs, getDepartments, getIEPs, getOrganizationalScorecards, RecentActivities, getAllSubDepartments, getAllSubSubDepartments } from "../../APIsServices/OrgnaizationAPI";
import { getArchivedIEPs, openArchivedDocument } from "../../APIsServices/ArchivedIEPService";
import { ArchivedIEPHierarchy } from "../../types/ArchivedIEPServiceTypes";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserProfileModal from '../OtherComponents/UserProfileModal';
import DOMPurify from 'dompurify';
import "../CustomCss/Main.scss"
import "../CustomCss/VerticalSidebar.scss"
import Swal from 'sweetalert2';
import DonutChart from '../OtherComponents/DonutChartLegendDemo/DonutChartLegendDemo';
import Stack from 'react-bootstrap/Stack';
// import "../CustomCss/newcss.scss";
debugger
declare global {
  interface Window {
    _spPageContextInfo?: {
      userId: number;
      userDisplayName: string;
      userEmail: string;
      userLoginName: string;
    };
  }
}

const getAcademicYearLabel = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const startYear = month >= 5 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
};

const normalizeYearLabel = (input?: string | number | null): string | null => {
  if (input === null || input === undefined) return null;
  const cleaned = String(input).trim();
  if (!cleaned) return null;
  const noSpaces = cleaned.replace(/\s+/g, '');
  if (/^\d{4}-\d{4}$/.test(noSpaces)) return noSpaces;
  if (/^\d{4}$/.test(noSpaces)) {
    const startYear = Number(noSpaces);
    return `${startYear}-${startYear + 1}`;
  }
  const match = noSpaces.match(/\d{4}/);
  if (match) {
    const startYear = Number(match[0]);
    return `${startYear}-${startYear + 1}`;
  }
  return null;
};

const DEFAULT_SCORECARD_KEYWORD = 'mcc';

const getDefaultScorecardKey = (scorecardsData: any[] = []) => {
  if (!scorecardsData.length) return null;
  const preferred = scorecardsData.find(
    (scorecard: any) => scorecard?.ScorecardName?.toLowerCase().includes(DEFAULT_SCORECARD_KEYWORD)
  );
  const target = preferred || scorecardsData[0];
  return target?.Id ? `scorecard-${target.Id}` : null;
};

const extractScorecardId = (scorecardKey: string | null) => {
  if (!scorecardKey) return null;
  const numeric = scorecardKey.replace('scorecard-', '');
  const parsed = parseInt(numeric, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

import { SPFI } from '@pnp/sp';
import { GraphFI } from '@pnp/graph';
import { isUserInADGroup } from '../../APIsServices/GraphService';
import { ICustomMetropolitanCollegeDirectoryProps } from '../../types/CustomMetropolitanCollegeDirectoryProps';

const CustomMetropolitanCollegeDirectory: React.FC<ICustomMetropolitanCollegeDirectoryProps> = ({ sp, graph, role, context }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('scorecard');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedScorecard, setSelectedScorecard] = useState(null);
  const [selectedIEP, setSelectedIEP] = useState(null);
  const [selectedIEPName, setSelectedIEPName] = useState<string>('');
  const [expandedSections, setExpandedSections] = useState({});
  const [organizationalScorecards, setOrganizationalScorecards] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allSubDepartments, setAllSubDepartments] = useState<any[]>([]);
  const [allSubSubDepartments, setAllSubSubDepartments] = useState<any[]>([]);
  const [masterAllIEPs, setMasterAllIEPs] = useState<any[]>([]);
  const [displayedIEPs, setDisplayedIEPs] = useState<any[]>([]);
  const [recentactivity, setRecentActivity] = useState<any[]>([]);
  const [IsalreayHaveOrgGoal, setIsalreayHaveOrgGoal] = useState(false)
  const [loading, setLoading] = useState(true);
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<any>({ show: false, type: '', message: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const elementRef = React.useRef<HTMLDivElement>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const expandedStateLoadedFromStorage = useRef(false);
  const selectedScorecardLoadedFromStorage = useRef(false);
  const userRoleFilterApplied = useRef(false);

  // Archived IEPs state
  const [archivedIEPs, setArchivedIEPs] = useState<ArchivedIEPHierarchy[]>([]);
  const [selectedArchivedDocument, setSelectedArchivedDocument] = useState<string | null>(null);
  const [selectedArchivedYear, setSelectedArchivedYear] = useState<string | null>(null);
  const [documentViewerUrl, setDocumentViewerUrl] = useState<string | null>(null);
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);

  // View state management moved to parent
  const [showCharts, setShowCharts] = useState(false);
  const [chartDeptId, setChartDeptId] = useState<number | null>(null);
  const [showOperationalGoalsList, setShowOperationalGoalsList] = useState(false);
  const [selectedIEPDetail, setSelectedIEPDetail] = useState<any>(null);
  const [chartMode, setChartMode] = useState<'subDepartment' | 'tag' | 'executiveCabinet'>('subDepartment');
  const [showDistrictCharts, setShowDistrictCharts] = useState(false);
  const [districtChartMode, setDistrictChartMode] = useState<'tag' | 'executiveCabinet'>('tag');

  // NEW: Add navigation queue to handle sidebar clicks while in detail views
  const navigationQueue = useRef<{ type: string;[key: string]: any } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 767.98);
      setIsTablet(width > 767.98 && width <= 991.98);
      if (width <= 767.98) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Restore persisted view first to avoid default overrides
    loadPersistedState();
    getUserRole();
    fetchCurrentUser();
    loadAllData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // NEW: Process navigation queue when detail views close
  useEffect(() => {
    if (!showCharts && !showOperationalGoalsList && !selectedIEPDetail && navigationQueue.current) {
      const { type, ...params } = navigationQueue.current;
      navigationQueue.current = null;

      // Execute the queued navigation
      if (type === 'department') {
        handleDepartmentClickImmediate(params.deptId, params.deptName);
      } else if (type === 'scorecard') {
        handleScorecardClickImmediate(params.scoreId);
      } else if (type === 'iep') {
        handleIEPClickImmediate(params.scorecardId, params.deptId, params.tagId, params.tagName);
      }
    }
  }, [showCharts, showOperationalGoalsList, selectedIEPDetail]);

  const fetchCurrentUser = async () => {
    const currentUser: any = await sp.web.currentUser();
    setCurrentUser(currentUser);
    fetchUsersList(currentUser.Id);
  };

  const fetchUsersList = async (Id) => {
    setUsersList(await fetchUsersListAs(sp, "SharePoint", Id));
  };

  const getUserDepartmentId = () => {
    if (!currentUser || !usersList?.length) return null;
    const rec = usersList.find(
      (u: any) =>
        u.User?.Id === currentUser.Id ||
        u.User?.Email === currentUser.Email ||
        u.User?.LoginName === currentUser.LoginName
    );
    return rec?.Departments?.Id ?? rec?.Departments ?? null;
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      userRoleFilterApplied.current = false; // Reset filter flag when reloading data
      const [scorecardsData, deptsData, iepsData, recentActivities, archivedData, subDepts, subSubDepts] = await Promise.all([
        getOrganizationalScorecards(sp),
        getDepartments(sp),
        getIEPs(sp),
        RecentActivities(sp),
        getArchivedIEPs(sp, "ArchiveIEPs"), // Fetch from ArchiveIEPs library
        getAllSubDepartments(sp), // Fetch ALL subdepartments
        getAllSubSubDepartments(sp) // Fetch ALL sub-subdepartments
      ]);

      const normalizedIEPs = iepsData || [];

      setMasterAllIEPs(normalizedIEPs);
      setRecentActivity(recentActivities || []);
      setOrganizationalScorecards(scorecardsData || []);
      setDepartments(deptsData || []);
      setAllSubDepartments(subDepts || []);
      setAllSubSubDepartments(subSubDepts || []);
      setArchivedIEPs(archivedData || []);

      // Set displayed IEPs based on selected scorecard or all IEPs
      const currentScorecardId = selectedScorecard ? extractScorecardId(selectedScorecard) : null;
      if (currentScorecardId !== null) {
        const filteredByScorecard = normalizedIEPs.filter(
          (iep: any) => iep.OrganizationalGoals?.Id === currentScorecardId
        );
        setDisplayedIEPs(filteredByScorecard.length > 0 ? filteredByScorecard : normalizedIEPs);
      } else {
        setDisplayedIEPs(normalizedIEPs);
      }

      // Auto-select default scorecard if none is selected and we're on scorecard page
      const defaultScorecardKey = getDefaultScorecardKey(scorecardsData || []);
      if (!selectedScorecardLoadedFromStorage.current && activePage === 'scorecard' && defaultScorecardKey && !selectedScorecard) {
        selectedScorecardLoadedFromStorage.current = true;
        setSelectedScorecard(defaultScorecardKey);
        const defaultScorecardId = extractScorecardId(defaultScorecardKey);
        if (defaultScorecardId !== null) {
          const filteredByScorecard = normalizedIEPs.filter(
            (iep: any) => iep.OrganizationalGoals?.Id === defaultScorecardId
          );
          setDisplayedIEPs(filteredByScorecard.length > 0 ? filteredByScorecard : normalizedIEPs);
        }
      }

      // Auto-expand default scorecard in sidebar if no expanded state was loaded
      if (!expandedStateLoadedFromStorage.current && activePage === 'scorecard' && defaultScorecardKey) {
        setExpandedSections(prev => {
          if (prev && Object.keys(prev).length > 0) {
            return prev;
          }
          expandedStateLoadedFromStorage.current = true;
          return { [defaultScorecardKey]: true };
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPersistedState = () => {
    const savedActivePage = localStorage.getItem('metropolitan-college-activePage');
    const savedExpandedSections = localStorage.getItem('metropolitan-college-expandedSections');
    const savedSelectedDepartment = localStorage.getItem('metropolitan-college-selectedDepartment');
    const savedSelectedScorecard = localStorage.getItem('metropolitan-college-selectedScorecard');
    const savedSelectedIEP = localStorage.getItem('metropolitan-college-selectedIEP');
    const savedShowCharts = localStorage.getItem('metropolitan-college-showCharts');
    const savedChartDeptId = localStorage.getItem('metropolitan-college-chartDeptId');
    const savedShowOperationalGoalsList = localStorage.getItem('metropolitan-college-showOperationalGoalsList');
    const savedChartMode = localStorage.getItem('metropolitan-college-chartMode');
    const savedShowDistrictCharts = localStorage.getItem('metropolitan-college-showDistrictCharts');
    const savedDistrictChartMode = localStorage.getItem('metropolitan-college-districtChartMode');
    const resolvedActivePage = savedActivePage || 'scorecard';

    if (savedActivePage) {
      setActivePage(savedActivePage);
    } else {
      setActivePage(resolvedActivePage);
    }
    if (savedSelectedDepartment) setSelectedDepartment(savedSelectedDepartment);
    if (savedSelectedScorecard) {
      selectedScorecardLoadedFromStorage.current = true;
      setSelectedScorecard(savedSelectedScorecard);
    } else {
      selectedScorecardLoadedFromStorage.current = false;
    }
    if (savedSelectedIEP) setSelectedIEP(savedSelectedIEP);
    if (savedShowCharts) setShowCharts(savedShowCharts === 'true');
    if (savedChartDeptId) setChartDeptId(Number(savedChartDeptId));
    if (savedShowOperationalGoalsList) setShowOperationalGoalsList(savedShowOperationalGoalsList === 'true');
    if (savedChartMode) setChartMode(savedChartMode as 'subDepartment' | 'tag' | 'executiveCabinet');
    if (savedShowDistrictCharts) setShowDistrictCharts(savedShowDistrictCharts === 'true');
    if (savedDistrictChartMode) setDistrictChartMode(savedDistrictChartMode as 'tag' | 'executiveCabinet');
    if (savedExpandedSections) {
      expandedStateLoadedFromStorage.current = true;
      try {
        setExpandedSections(JSON.parse(savedExpandedSections));
      } catch {
        expandedStateLoadedFromStorage.current = false;
        initializeExpandedSections(resolvedActivePage);
      }
    } else {
      expandedStateLoadedFromStorage.current = false;
      initializeExpandedSections(resolvedActivePage);
    }
  };

  const initializeExpandedSections = (page, scorecardsData = organizationalScorecards) => {
    if (page === 'dashboard') {
      setExpandedSections({ 'all-departments': true });
      return;
    }
    if (page === 'scorecard') {
      const defaultScorecardKey = getDefaultScorecardKey(scorecardsData || []);
      setExpandedSections(defaultScorecardKey ? { [defaultScorecardKey]: true } : {});
      return;
    }
    setExpandedSections({});
  };

  useEffect(() => {
    localStorage.setItem('metropolitan-college-activePage', activePage);
  }, [activePage]);

  useEffect(() => {
    localStorage.setItem('metropolitan-college-expandedSections', JSON.stringify(expandedSections));
  }, [expandedSections]);

  useEffect(() => {
    if (selectedDepartment) {
      localStorage.setItem('metropolitan-college-selectedDepartment', selectedDepartment);
    } else {
      localStorage.removeItem('metropolitan-college-selectedDepartment');
    }
  }, [selectedDepartment]);

  useEffect(() => {
    if (selectedScorecard) {
      localStorage.setItem('metropolitan-college-selectedScorecard', selectedScorecard);
    } else {
      localStorage.removeItem('metropolitan-college-selectedScorecard');
    }
  }, [selectedScorecard]);

  useEffect(() => {
    if (selectedIEP) {
      localStorage.setItem('metropolitan-college-selectedIEP', selectedIEP);
    } else {
      localStorage.removeItem('metropolitan-college-selectedIEP');
    }
  }, [selectedIEP]);

  useEffect(() => {
    localStorage.setItem('metropolitan-college-showCharts', String(showCharts));
  }, [showCharts]);

  useEffect(() => {
    if (chartDeptId !== null) {
      localStorage.setItem('metropolitan-college-chartDeptId', String(chartDeptId));
    } else {
      localStorage.removeItem('metropolitan-college-chartDeptId');
    }
  }, [chartDeptId]);

  useEffect(() => {
    localStorage.setItem('metropolitan-college-showOperationalGoalsList', String(showOperationalGoalsList));
  }, [showOperationalGoalsList]);

  useEffect(() => {
    localStorage.setItem('metropolitan-college-chartMode', chartMode);
  }, [chartMode]);

  useEffect(() => {
    localStorage.setItem('metropolitan-college-showDistrictCharts', String(showDistrictCharts));
  }, [showDistrictCharts]);

  useEffect(() => {
    localStorage.setItem('metropolitan-college-districtChartMode', districtChartMode);
  }, [districtChartMode]);

  // Planning Unit Managers can see all IEPs but can only edit their own department's data
  // No filtering of masterAllIEPs needed here

  // Update displayedIEPs when selectedScorecard changes
  useEffect(() => {
    if (masterAllIEPs.length > 0 && selectedScorecard) {
      const scorecardId = extractScorecardId(selectedScorecard);
      if (scorecardId !== null) {
        const filtered = masterAllIEPs.filter(
          (iep: any) => iep.OrganizationalGoals?.Id === scorecardId
        );
        setDisplayedIEPs(filtered.length > 0 ? filtered : masterAllIEPs);
      }
    } else if (masterAllIEPs.length > 0 && !selectedScorecard && activePage === 'scorecard') {
      setDisplayedIEPs(masterAllIEPs);
    }
  }, [selectedScorecard, masterAllIEPs, activePage]);

  const getHierarchicalData = () => {
    if (activePage === 'dashboard') return getDashboardData();
    if (activePage === 'scorecard') return getScorecardData();
    return [];
  };

  const getDashboardData = () => {
    return [{
      id: 'all-departments',
      name: 'All Departments',
      type: 'section',
      children: departments.map(dept => ({
        id: `dept-${dept.Id}`,
        name: dept.DepartmentName || dept.Title,
        type: 'department',
        description: dept.Description,
        head: dept.HeadOfDepartment?.Title
      }))
    }];
  };

  const getScorecardData = () => {
    console.log('[getScorecardData] organizationalScorecards:', organizationalScorecards);
    console.log('[getScorecardData] masterAllIEPs:', masterAllIEPs);
    console.log('[getScorecardData] departments:', departments);
    console.log('[getScorecardData] allSubDepartments:', allSubDepartments);
    console.log('[getScorecardData] allSubSubDepartments:', allSubSubDepartments);

    // Sort scorecards by year in descending order (latest first)
    const sortedScorecards = [...(organizationalScorecards || [])].sort((a: any, b: any) => {
      const yearA = parseInt(String(a.Year).split('-')[0]) || 0;
      const yearB = parseInt(String(b.Year).split('-')[0]) || 0;
      return yearB - yearA; // Descending order (latest first)
    });

    return sortedScorecards.map((scorecard: any) => {
      const scorecardIEPs = masterAllIEPs.filter(iep => iep.OrganizationalGoals?.Id === scorecard.Id);
      console.log(`[getScorecardData] Scorecard ${scorecard.ScorecardName} (${scorecard.Year}) has ${scorecardIEPs.length} IEPs`);

      // Build complete hierarchy for ALL departments, regardless of IEPs
      const departmentsGrouped = departments.map((dept: any) => {
        const deptIEPs = scorecardIEPs.filter(iep => iep.Departments?.Id === dept.Id);
        console.log(`[getScorecardData] Dept ${dept.DepartmentName} has ${deptIEPs.length} IEPs`);

        // Get ALL subdepartments for this department
        const deptSubDepts = allSubDepartments.filter(sub => sub.DepartmentId === dept.Id);

        // Build subdepartment hierarchy
        const subDepts = deptSubDepts
          .sort((a, b) => (a.SubDepartmentName || '').localeCompare(b.SubDepartmentName || ''))
          .map(subDept => {
            // Get ALL sub-subdepartments for this subdepartment
            const subSubDepts = allSubSubDepartments
              .filter(ss => ss.SubDepartmentId === subDept.Id)
              .sort((a, b) => (a.SubSubDepartmentName || '').localeCompare(b.SubSubDepartmentName || ''))
              .map(ss => {
                // Count IEPs for this sub-subdepartment
                const ssIEPs = deptIEPs.filter(iep =>
                  iep.SubDepartments?.Id === subDept.Id &&
                  iep.SubSubDepartments?.Id === ss.Id
                );
                return {
                  id: `subsub-${subDept.Id}-${ss.Id}`,
                  name: ss.SubSubDepartmentName,
                  iepCount: ssIEPs.length,
                };
              });

            // Count direct IEPs for subdepartment (without sub-subdepartment)
            const directIEPs = deptIEPs.filter(iep =>
              iep.SubDepartments?.Id === subDept.Id &&
              !iep.SubSubDepartments?.Id
            );

            return {
              id: `sub-${subDept.Id}`,
              name: subDept.SubDepartmentName,
              directIepCount: directIEPs.length,
              children: subSubDepts,
            };
          });

        return {
          id: `dept-${dept.Id}`,
          name: dept.DepartmentName || dept.Title,
          children: subDepts,
        };
      });

      return {
        id: `scorecard-${scorecard.Id}`,
        name: scorecard.ScorecardName,
        year: scorecard.Year,
        children: departmentsGrouped,
      };
    });
  };

  const getIEPStatus = (iep) => {
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

  const getCurrentIEPs = () => {
    let filtered = [...displayedIEPs];
    if (selectedScorecard) {
      const scId = parseInt(selectedScorecard.replace('scorecard-', ''));
      filtered = filtered.filter(iep => iep.OrganizationalGoals?.Id === scId);
    }
    if (selectedDepartment) {
      const deptId = parseInt(selectedDepartment.replace('dept-', ''));
      filtered = filtered.filter(iep => iep.Departments?.Id === deptId);
    }
    // Handle tag selection (from OrganizationGoalAlignment)
    if (selectedIEP?.startsWith('tag-')) {
      const tagNameFromId = selectedIEP.replace('tag-', '');
      filtered = filtered.filter(iep => {
        const orgAlignments = iep.OrganizationGoalAlignment || [];
        return orgAlignments.some((org: any) => org.Tag?.trim() === tagNameFromId);
      });
    } else if (selectedIEP?.startsWith('subsub-')) {
      const parts = selectedIEP.replace('subsub-', '').split('-');
      const subId = parseInt(parts[0]);
      const ssId = parseInt(parts[1]);
      filtered = filtered.filter(iep => iep.SubDepartments?.Id === subId && iep.SubSubDepartments?.Id === ssId);
    } else if (selectedIEP?.startsWith('sub-')) {
      const subId = parseInt(selectedIEP.replace('sub-', ''));
      filtered = filtered.filter(iep => iep.SubDepartments?.Id === subId);
    }
    return filtered;
  };

  const getDepartmentStats = () => {
    const departmentIEPs = getCurrentIEPs();
    const now = Date.now();

    return {
      totalIEPs: departmentIEPs.length,
      completedIEPs: departmentIEPs.filter(iep => getIEPStatus(iep) === 'Completed').length,
      activeIEPs: departmentIEPs.filter(iep => getIEPStatus(iep) === 'Active').length,
      overdueIEPs: departmentIEPs.filter(iep => getIEPStatus(iep) === 'Partially Completed').length,
      pendingIEPs: departmentIEPs.filter(iep => getIEPStatus(iep) === 'Not Completed').length,
      notdefinedIEPs: departmentIEPs.filter(iep => getIEPStatus(iep) === 'Not Defined').length
      // totalDepartments: 1,
      // highPriorityIEPs: departmentIEPs.filter(iep => getIEPStatus(iep) === 'High').length,
      // totalUsers: [...new Set(departmentIEPs.map(iep => iep.CreatedBy?.Id).filter(Boolean))].length
    };
  };

  const getAllStats = (selectedDept = null) => {
    const filteredIEPs = selectedDept
      ? masterAllIEPs.filter(iep => iep.Departments?.DepartmentName === selectedDept.DepartmentName)
      : masterAllIEPs;
    const finalIEPs = filteredIEPs;
    const now = Date.now();
    return {
      totalDepartments: selectedDept ? 1 : departments.length,
      totalIEPs: finalIEPs.length,
      completedIEPs: finalIEPs.filter(iep => getIEPStatus(iep) === 'Completed').length,
      activeIEPs: finalIEPs.filter(iep => getIEPStatus(iep) === 'Active').length,
      overdueIEPs: finalIEPs.filter(iep => getIEPStatus(iep) === 'Partially Completed').length,
      pendingIEPs: finalIEPs.filter(iep => getIEPStatus(iep) === 'Not Completed').length,
      notdefinedIEPs: finalIEPs.filter(iep => getIEPStatus(iep) === 'Not Defined').length
      // totalIEPs: finalIEPs.length,
      // activeIEPs: finalIEPs.filter(iep => getIEPStatus(iep) === 'Active').length,
      // completedIEPs: finalIEPs.filter(iep => getIEPStatus(iep) === 'Completed').length,
      // overdueIEPs: finalIEPs.filter(iep => {
      //   const end = iep.EndDate ? new Date(iep.EndDate).getTime() : 0;
      //   return end && end < now && getIEPStatus(iep) !== 'Completed';
      // }).length,
      // pendingIEPs: finalIEPs.filter(iep => !iep.StartDate || !iep.EndDate).length,
      // totalUsers: [...new Set(finalIEPs.map(iep => iep.CreatedBy?.Id).filter(Boolean))].length,
      // highPriorityIEPs: finalIEPs.filter(iep => iep.Priority === 'High').length
    };
  };

  const getScorecardStats = () => {
    const scoreId = selectedScorecard ? parseInt(selectedScorecard.replace('scorecard-', '')) : null;
    const scorecardIEPs = scoreId ? displayedIEPs.filter(iep => iep.OrganizationalGoals?.Id === scoreId) : displayedIEPs;
    const final = scorecardIEPs;
    return {
      // totalIEPs: final.length,
      // highPriorityIEPs: final.filter(iep => iep.Priority === 'High').length,
      // completedIEPs: final.filter(iep => getIEPStatus(iep) === 'Completed').length,
      // activeIEPs: final.filter(iep => getIEPStatus(iep) === 'Active').length,
      // participatingDepartments: [...new Set(final.map(iep => iep.Departments?.Id))].filter(Boolean).length

       totalIEPs: final.length,
      completedIEPs: final.filter(iep => getIEPStatus(iep) === 'Completed').length,
      activeIEPs: final.filter(iep => getIEPStatus(iep) === 'Active').length,
      overdueIEPs: final.filter(iep => getIEPStatus(iep) === 'Partially Completed').length,
      pendingIEPs: final.filter(iep => getIEPStatus(iep) === 'Not Completed').length,
      notdefinedIEPs: final.filter(iep => getIEPStatus(iep) === 'Not Defined').length
    };
  };

  const toggleSection = (id) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // NEW: Check if any detail view is open
  const isDetailViewOpen = () => {
    return showCharts || showOperationalGoalsList || selectedIEPDetail !== null;
  };

  // NEW: Immediate navigation without checking detail views
  const handleDepartmentClickImmediate = (deptId, deptName) => {
    setSelectedDepartment(deptId);
    setSelectedIEP(null);
    setSelectedIEPName('');
    // Clear all view states to show IEP table
    setShowCharts(false);
    setShowOperationalGoalsList(false);
    setSelectedIEPDetail(null);
    setChartDeptId(null);
    setShowDistrictCharts(false);

    if (activePage === 'scorecard' && selectedScorecard) {
      const scId = parseInt(selectedScorecard.replace('scorecard-', ''));
      const deptNumeric = parseInt(deptId.replace('dept-', ''));
      const filtered = masterAllIEPs.filter(iep => iep.OrganizationalGoals?.Id === scId && iep.Departments?.Id === deptNumeric);
      setDisplayedIEPs(filtered);
    } else {
      const deptNumeric = parseInt(deptId.replace('dept-', ''));
      const filtered = masterAllIEPs.filter(iep => iep.Departments?.Id === deptNumeric);
      setDisplayedIEPs(filtered);
      if (activePage !== 'scorecard') setSelectedScorecard(null);
    }
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // NEW: Wrapper that handles queueing
  const handleDepartmentClick = (deptId, deptName) => {
    if (isDetailViewOpen()) {
      // Queue the navigation and close detail views
      navigationQueue.current = { type: 'department', deptId, deptName };
      setShowCharts(false);
      setShowOperationalGoalsList(false);
      setSelectedIEPDetail(null);
      setChartDeptId(null);
    } else {
      handleDepartmentClickImmediate(deptId, deptName);
    }
  };

  // NEW: Immediate navigation
  const handleScorecardClickImmediate = (scoreId) => {
    setSelectedScorecard(scoreId);
    setSelectedDepartment(null);
    setSelectedIEP(null);
    setSelectedIEPName('');
    // Clear all view states to show IEP table
    setShowCharts(false);
    setShowOperationalGoalsList(false);
    setSelectedIEPDetail(null);
    setChartDeptId(null);
    setShowDistrictCharts(false);
    const scId = parseInt(scoreId.replace('scorecard-', ''));
    const filtered = masterAllIEPs.filter(iep => iep.OrganizationalGoals?.Id === scId);
    setDisplayedIEPs(filtered);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // NEW: Wrapper with queueing
  const handleScorecardClick = (scoreId) => {
    if (isDetailViewOpen()) {
      navigationQueue.current = { type: 'scorecard', scoreId };
      setShowCharts(false);
      setShowOperationalGoalsList(false);
      setSelectedIEPDetail(null);
      setChartDeptId(null);
    } else {
      handleScorecardClickImmediate(scoreId);
    }
  };

  // NEW: Immediate navigation
  const handleIEPClickImmediate = (scorecardId: string, deptId: string, tagId: string, tagName: string) => {
    setSelectedScorecard(scorecardId);
    setSelectedDepartment(deptId);
    setSelectedIEP(tagId);
    setSelectedIEPName(tagName);
    // Clear all view states to show IEP table
    setShowCharts(false);
    setShowOperationalGoalsList(false);
    setSelectedIEPDetail(null);
    setChartDeptId(null);
    setShowDistrictCharts(false);

    const newExpandedSections = { ...expandedSections };
    newExpandedSections[scorecardId] = true;
    newExpandedSections[deptId] = true;

    if (tagId?.startsWith('sub-')) {
      newExpandedSections[tagId] = true;
    }

    if (tagId?.startsWith('subsub-')) {
      const parts = tagId.replace('subsub-', '').split('-');
      const subId = `sub-${parts[0]}`;
      newExpandedSections[subId] = true;
      newExpandedSections[tagId] = true;
    }

    if (tagId?.startsWith('tag-')) {
      newExpandedSections[tagId] = true;
    }

    setExpandedSections(newExpandedSections);

    const scId = scorecardId ? parseInt(scorecardId.replace('scorecard-', '')) : null;
    const deptNumeric = deptId ? parseInt(deptId.replace('dept-', '')) : null;
    let filtered = masterAllIEPs;
    if (scId) filtered = filtered.filter(iep => iep.OrganizationalGoals?.Id === scId);
    if (deptNumeric) filtered = filtered.filter(iep => iep.Departments?.Id === deptNumeric);

    // Handle tag clicks (from OrganizationGoalAlignment)
    if (tagId?.startsWith('tag-')) {
      const tagNameFromId = tagId.replace('tag-', '');
      filtered = filtered.filter(iep => {
        const orgAlignments = iep.OrganizationGoalAlignment || [];
        return orgAlignments.some((org: any) => org.Tag?.trim() === tagNameFromId);
      });
    } else if (tagId?.startsWith('subsub-')) {
      const parts = tagId.replace('subsub-', '').split('-');
      const subId = Number(parts[0]);
      const ssId = Number(parts[1]);
      filtered = filtered.filter(iep => iep.SubDepartments?.Id === subId && iep.SubSubDepartments?.Id === ssId);
    } else if (tagId?.startsWith('sub-')) {
      const subId = Number(tagId.replace('sub-', ''));
      filtered = filtered.filter(iep => iep.SubDepartments?.Id === subId);
    }
    setDisplayedIEPs(filtered);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // NEW: Wrapper with queueing
  const handleIEPClick = (scorecardId: string, deptId: string, tagId: string, tagName: string) => {
    if (isDetailViewOpen()) {
      navigationQueue.current = { type: 'iep', scorecardId, deptId, tagId, tagName };
      setShowCharts(false);
      setShowOperationalGoalsList(false);
      setSelectedIEPDetail(null);
      setChartDeptId(null);
    } else {
      handleIEPClickImmediate(scorecardId, deptId, tagId, tagName);
    }
  };

  // Handler for archived document clicks
  const handleArchivedDocumentClick = (documentId: string, documentUrl: string) => {
    console.log('Archived document clicked:', documentId, documentUrl);
    setSelectedArchivedDocument(documentId);
    // Open the document in the viewer modal
    setDocumentViewerUrl(documentUrl);
    setIsDocumentViewerOpen(true);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Handler for archived year selection
  const handleArchivedYearClick = (yearId: string) => {
    console.log('Archived year clicked:', yearId);
    setSelectedArchivedYear(yearId);
  };

  // Handler for Recent IEPs page - click on individual IEP
  const handleRecentIEPClick = (iep: any) => {
    // Navigate to scorecard view and select the IEP's scorecard and department
    const scorecardId = iep.OrganizationalGoals?.Id;
    const deptId = iep.Departments?.Id;

    if (scorecardId && deptId) {
      setActivePage('scorecard');
      const scorecardKey = `scorecard-${scorecardId}`;
      const deptKey = `dept-${deptId}`;

      setSelectedScorecard(scorecardKey);
      setSelectedDepartment(deptKey);

      // Expand the relevant sections
      setExpandedSections(prev => ({
        ...prev,
        [scorecardKey]: true,
        [deptKey]: true
      }));

      // Filter and display IEPs for this department
      const filtered = masterAllIEPs.filter(
        item => item.OrganizationalGoals?.Id === scorecardId && item.Departments?.Id === deptId
      );
      setDisplayedIEPs(filtered);

      if (isMobile) {
        setSidebarOpen(false);
      }
    }
  };

  const handlePageChange = (page) => {
    // NEW: Clear any queued navigation
    navigationQueue.current = null;

    setShowCharts(false);
    setShowOperationalGoalsList(false);
    setSelectedIEPDetail(null);
    setChartDeptId(null);

    setActivePage(page);
    setSelectedDepartment(null);
    setSelectedScorecard(null);
    setSelectedIEP(null);
    setSelectedIEPName('');
    initializeExpandedSections(page);
    setDisplayedIEPs(masterAllIEPs);
    if (page === 'scorecard' && organizationalScorecards.length > 0) {
      const mccScorecard = organizationalScorecards.find(s => s.ScorecardName?.toLowerCase().includes('mcc')) || organizationalScorecards[0];
      const mccId = `scorecard-${mccScorecard.Id}`;
      setSelectedScorecard(mccId);
      setExpandedSections(prev => ({ ...prev, [mccId]: true }));
      const filtered = masterAllIEPs.filter(iep => iep.OrganizationalGoal?.Id === mccScorecard.Id);
      setDisplayedIEPs(filtered);
    }
    // Auto-select first archived year when navigating to archived page
    if (page === 'archived' && archivedIEPs.length > 0) {
      const firstYear = archivedIEPs[0];
      setSelectedArchivedYear(firstYear.id);
      setExpandedSections(prev => ({ ...prev, [firstYear.id]: true }));
    }
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleSelectDepartmentFromScorecard = (deptId: string) => {
    const dept = departments.find(d => `dept-${d.Id}` === deptId);
    handleDepartmentClick(deptId, dept?.DepartmentName || dept?.Title || '');
  };

  const getSafeExpandedState = (id) => expandedSections[id] || false;

  const getDepartmentName = () => {
    if (!selectedDepartment) return 'All Departments';
    const deptId = parseInt(selectedDepartment.replace('dept-', ''));
    const dept = departments.find(d => d.Id === deptId);
    return dept?.DepartmentName || dept?.DepartmentName;
  };

  const getRecentGoals = () => {
    return displayedIEPs
      .filter((iep) => {
        const goalText = DOMPurify.sanitize(iep.OperationalGoal || '', { ALLOWED_TAGS: [] }).trim();
        return goalText.length > 0;
      })
      .sort((a, b) => new Date(b.Modified || b.Created).getTime() - new Date(a.Modified || a.Created).getTime())
      .map(iep => {
        return {
          Id: iep.Id,
          OperationalGoal: iep.OperationalGoal,
          departmentName: iep.Departments?.DepartmentName,
        };
      });
  };

  const parseSharePointDate = (value: any): Date | null => {
    if (!value) return null;
    if (typeof value === 'string' && value.startsWith('/Date(')) {
      const match = value.match(/\/Date\((\d+)\)\//);
      if (match) {
        const ms = parseInt(match[1], 10);
        return new Date(ms);
      }
    }
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const getRecentActivities = () => {
    return recentactivity
      .sort((a, b) => new Date(b.Modified || b.Created).getTime() - new Date(a.Modified || a.Created).getTime())
      .map(iep => {
        const dateValue = parseSharePointDate(iep.Modified || iep.Created);
        const user = iep.Actor?.Title;
        const action = iep.Activity;
        const entity = iep.Entity;
        return {
          Id: iep.Id,
          user,
          action,
          description: "",
          entity,
          formattedDate: dateValue ? dateValue.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
        };
      });
  };

  const currentAcademicYear = useMemo(() => getAcademicYearLabel(), []);
  const normalizedGoalYears = useMemo(() => {
    return organizationalScorecards
      .map((goal: any) => normalizeYearLabel(goal?.Year ?? goal?.year))
      .filter(Boolean) as string[];
  }, [organizationalScorecards]);
  const hasCurrentYearGoal = useMemo(() => {
    if (!currentAcademicYear) return false;
    return normalizedGoalYears.includes(currentAcademicYear);
  }, [normalizedGoalYears, currentAcademicYear]);

  const getResultsMetData = (ieps: any[]) => {
    const counts = { Completed: 0, "Partially Completed": 0, "Not Completed": 0, "Not Defined": 0 };
    ieps.forEach(i => {
      const val = i.ResultsMet?.trim() || "Not Defined";
      if (counts.hasOwnProperty(val)) counts[val as keyof typeof counts]++;
    });
    return [
      { name: "Completed", value: counts.Completed, color: "#28a745" },
      { name: "Partially Completed", value: counts["Partially Completed"], color: "#ffc107" },
      { name: "Not Completed", value: counts["Not Completed"], color: "#dc3545" },
      { name: "Not Defined", value: counts["Not Defined"], color: "#b7bdc2ff" }
    ].filter(d => d.value > 0);
  };

  const getSubDeptData = (ieps: any[]) => {
    const map = new Map();
    ieps.forEach(i => {
      const name = i.SubDepartments?.SubDepartmentName?.trim();
      map.set(name, (map.get(name) || 0) + 1);
    });
    const colors = ["#007bff", "#17a2b8", "#6f42c1", "#e83e8c", "#fd7e14", "#20c997"];
    return Array.from(map.entries()).map(([name, value], i) => ({
      name, value, color: colors[i % colors.length]
    }));
  };

  const DashboardWithCharts = () => {
    const deptId = selectedDepartment ? Number(selectedDepartment.replace('dept-', '')) : null;
    const deptIEPs = deptId ? masterAllIEPs.filter(i => i.Departments?.Id === deptId) : masterAllIEPs;
    const stats = selectedDepartment ? getDepartmentStats() : getAllStats();

    return (
      <div className="container-fluid pbbbb bg-light">
        <div className="row align-items-center mb-3">
          <div className={`${isMobile ? 'col-12' : 'col-md-10'}`}>
            <h4 className={`${isMobile ? 'h5' : 'h4'} mb-1 text-dark`}>
              {selectedDepartment
                ? `${departments.find(d => `dept-${d.Id}` === selectedDepartment)?.DepartmentName} Dashboard`
                : 'Institutional Dashboard'}
            </h4>
            <p className={`text-muted mb-0 ${isMobile ? 'small' : ''}`}>
              Overview of organizational goals, assessments, and employee development
            </p>
          </div>
          <div className={`${isMobile ? 'col-12 text-start mt-2' : 'col-md-2 text-end'}`}>
            {userRole === 'Program Director' && (
              <button type='button' className={`btn btn-primary ${isMobile ? 'btn-sm' : 'btn-sm'}`} onClick={NewPrgGoalModelOpen}>
                + {isMobile ? 'Goal' : 'New Organizational Goal'}
              </button>
            )}
          </div>
        </div>

        <div className="goals-cards-container">
          {[
            { label: 'Active Goals', value: stats.totalIEPs, icon: <Target stroke="white" />, color: 'Active' },
            { label: 'Completed Goals', value: stats.completedIEPs, icon: <CheckCircle stroke="white" />, color: 'Completed' },
            { label: 'Partially Completed Goals', value: stats.overdueIEPs, icon: <AlertTriangle stroke="white" />, color: 'Overdue' },
            { label: 'Not Completed Goals', value: stats.pendingIEPs, icon: <ClipboardCheck stroke="white" />, color: 'Pending' },
            { label: 'Not Defined Goals', value: stats.notdefinedIEPs, icon: <BookOpen stroke="white" />, color: 'NotDefined' }
            ].map((stat, i) => 
              (
              <div key={i} className="goals-card-wrapper">
                <div className={`goals-card${stat.color}`}>
                  <div className="card-header-custom">
                    <span className={`header-text ${isMobile ? 'small' : ''}`}>{stat.label}</span>
                    <button type='button' className={`icon-buttoncard${stat.color}`}>{stat.icon}</button>
                  </div>
                  <div className="goals-number">{stat.value}</div>
                  <div className={`status-text ${isMobile ? 'small' : ''}`}>{stat.label}</div>
                </div>
              </div>
            )
            )
            }
        </div>

        <div className={`row g-3 ${isMobile ? '' : 'd-flex'}`}>
          <div className={`${isMobile ? 'col-12' : 'col-12 col-lg-6'}`}>
            <div className="card border-0 shadow-sm">
              <div className="card-header" style={{
                background: '#0b4f86', color: 'white', borderTopLeftRadius: 20,
                borderTopRightRadius: 20, paddingTop: '1rem'
              }}>
                <h6 className="mb-3">Recent Goals</h6>
              </div>
              <div className="card-body">

                <div style={{ overflowY: 'auto', height: isMobile ? "250px" : "320px" }}>
                  {getRecentGoals().length > 0 ? getRecentGoals().map(goal => (
                    <div key={goal.Id} className="mb-4 pb-3 border-bottom">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span
                          className={`fw-normal text-dark ${isMobile ? 'small' : ''}`}
                          dangerouslySetInnerHTML={{ __html: goal.OperationalGoal }}
                        />
                      </div>
                      <small className="text-muted">{goal.departmentName} • department</small>
                    </div>
                  )) : <p className="text-muted text-center">No recent goals</p>}
                </div>
              </div>
            </div>
          </div>

          <div className={`${isMobile ? 'col-12' : 'col-12 col-lg-6'}`}>
            <div className="card border-0 shadow-sm">
              <div className="card-header" style={{
                background: '#0b4f86', color: 'white', borderTopLeftRadius: 20,
                borderTopRightRadius: 20, paddingTop: '1rem'
              }}>
                <h6 className=" mb-3"
                >Recent Activity</h6>
              </div>
              <div className="card-body">

                <div style={{ overflowY: 'auto', height: isMobile ? "250px" : "320px" }}>
                  {getRecentActivities().length > 0 ? getRecentActivities().map(act => (
                    <div key={act.Id} className="mb-3 pb-3 border-bottom">
                      <div className="mb-2">
                        <span className={`fw-semibold text-dark ${isMobile ? 'small' : ''}`}>{act.user}</span>{' '}
                        <span className="text-muted mx-1">{act.entity} {act.action}</span>{' '}
                        <span className="text-dark">{act.description}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-light text-dark border-0 px-2 py-1" style={{ fontSize: '0.75rem' }}>
                          {act.entity}
                        </span>
                        <small className="text-muted">{act.formattedDate}</small>
                      </div>
                    </div>
                  )) : <p className="text-muted">No recent activity</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const commonProps = {
      selectedDepartment,
      selectedScorecard,
      selectedIEP,
      ieps: getCurrentIEPs(),
      stats: selectedScorecard ? getScorecardStats() : (selectedDepartment ? getDepartmentStats() : getAllStats()),
      loading,
      departments,
      organizationalScorecards,
      allIEPs: masterAllIEPs,
      sp,
      currentUser,
      usersList,
      onIEPCreated: loadAllData,
      onSelectDepartment: handleSelectDepartmentFromScorecard,
      isMobile,
      isTablet,
      userRole,
      handleIEPClick,
      showCharts,
      setShowCharts,
      chartDeptId,
      setChartDeptId,
      showOperationalGoalsList,
      setShowOperationalGoalsList,
      selectedIEPDetail,
      setSelectedIEPDetail,
      onPageChange: handlePageChange,
      chartMode,
      setChartMode,
      showDistrictCharts,
      setShowDistrictCharts,
      districtChartMode,
      setDistrictChartMode,
    };

    switch (activePage) {
      case 'dashboard':
        return <DashboardWithCharts />;
      case 'scorecard':
        return <ScorecardContent {...commonProps} />;
      case 'recentIEPs':
        return (
          <RecentIEPsContent
            allIEPs={masterAllIEPs}
            onIEPClick={handleRecentIEPClick}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        );
      case 'archived':
        return (
          <ArchivedContent
            archivedIEPs={archivedIEPs}
            selectedArchivedYear={selectedArchivedYear}
            onDocumentClick={handleArchivedDocumentClick}
            isMobile={isMobile}
          />
        );
      case 'users':
        return <UsersContent />;
      case 'settings':
        return <SettingsContent sp={sp} graph={graph} context={context} />;
      default:
        return <DashboardWithCharts />;
    }
  };

  const currentData = getHierarchicalData();
  const selectedDept = selectedDepartment ? departments.find(d => `dept-${d.Id}` === selectedDepartment) : null;

  const NewPrgGoalModelOpen = () => {
    if (hasCurrentYearGoal) {
      toast.warning(`An organizational goal already exists for ${currentAcademicYear}. Please edit the existing goal instead of creating a new one.`);
      return;
    }
    setIsNewGoalModalOpen(true);
  };

  const handleCloseModal = () => !isSubmitting && setIsNewGoalModalOpen(false);

  const handleCreateGoal = async (goalData) => {
    // Prevent duplicate submissions by disabling immediately
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const normalizedSelectedYear = normalizeYearLabel(goalData?.year);
      if (normalizedSelectedYear && normalizedGoalYears.includes(normalizedSelectedYear)) {
        toast.warning(`An organizational goal already exists for ${normalizedSelectedYear}.`);
        return;
      }
      if (normalizedSelectedYear === currentAcademicYear && hasCurrentYearGoal) {
        toast.warning(`An organizational goal already exists for ${currentAcademicYear}.`);
        return;
      }

      await createOrganizationalGoal(sp, goalData);
      toast.success('Operational Goal created successfully!');
      setIsNewGoalModalOpen(false);
      setTimeout(async () => {
        await loadAllData();

        // NEW CYCLE LOGIC: Automatically load department structure sidebar for new year cycle
        // Reload scorecards to get the newly created one
        const updatedScorecards = await getOrganizationalScorecards(sp);
        const newScorecard = updatedScorecards.find(
          (scorecard: any) => normalizeYearLabel(scorecard?.Year ?? scorecard?.year) === normalizedSelectedYear
        );

        if (newScorecard) {
          const newScorecardKey = `scorecard-${newScorecard.Id}`;

          // Auto-select the new scorecard
          setSelectedScorecard(newScorecardKey);

          // Auto-expand the new scorecard in sidebar to show department structure
          setExpandedSections(prev => ({
            ...prev,
            [newScorecardKey]: true
          }));

          // Navigate to scorecard page if not already there
          if (activePage !== 'scorecard') {
            setActivePage('scorecard');
          }

          // Filter IEPs for the new scorecard
          const filteredByNewScorecard = masterAllIEPs.filter(
            (iep: any) => iep.OrganizationalGoals?.Id === newScorecard.Id
          );
          setDisplayedIEPs(filteredByNewScorecard.length > 0 ? filteredByNewScorecard : masterAllIEPs);

          // Open sidebar if it's closed (especially on mobile)
          if (!sidebarOpen) {
            setSidebarOpen(true);
          }

          console.log(`[NewCycleLogic] Automatically loaded department structure for new cycle: ${normalizedSelectedYear}`);
        }
      }, 1000);
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // const getUserRole = async () => {
  //   try {
  //     const currentUser = await sp.web.currentUser();
  //     const items = await sp.web.lists
  //       .getByTitle("Users")
  //       .items.select("ID", "Role", "User/Id", "User/Title", "User/EMail")
  //       .expand("User")
  //       .filter(`User/Id eq ${currentUser.Id}`)();
  //     if (items.length > 0) {
  //       const roleValue = items[0].Role;
  //       setUserRole(roleValue);
  //     } else {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Access Denied",
  //         text: "You do not have access! Contact system administrator.",
  //         timer: 4000,
  //         timerProgressBar: true,
  //         allowOutsideClick: false,
  //         allowEscapeKey: false,
  //       }).then(() => {
  //         window.location.href = "https://mcckc.sharepoint.com/sites/IEPManagement"
  //       });
  //     }
  //   } catch (err) {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Access Denied",
  //       text: "You do not have access! Contact system administrator.",
  //       timer: 4000,
  //       timerProgressBar: true,
  //       allowOutsideClick: false,
  //       allowEscapeKey: false,
  //     }).then(() => {
  //       window.location.href = "https://mcckc.sharepoint.com/sites/IEPManagement"
  //     });
  //   }
  // };

  const getUserRole = async () => {
    try {
      const currentUser = await sp.web.currentUser();
      console.log("👤 Current User:", currentUser.Title, currentUser.LoginName);

      // First, check if user has a specific role in Users list
      const items = await sp.web.lists
        .getByTitle("Users")
        .items
        .select("ID", "Role", "User/Title", "User/EMail")
        .expand("User")
        .filter(`User/EMail eq '${currentUser.Email}'`)();

      if (items.length > 0) {
        // User has a role assigned in Users list - use that role (highest priority)
        const assignedRole = items[0].Role;
        setUserRole(assignedRole);
        console.log("🎯 Role Set from Users list:", assignedRole);
        return;
      }

      // If no role in Users list, check AD group membership
      const isMember = await isUserInADGroup(graph, "MCC Employees");

      if (isMember) {
        // User is in AD group but not in Users list - default to IEPEmployesGroup
        console.log("✅ User IS member of AD group via Graph!");
        setUserRole("IEPEmployesGroup");
        console.log("🎯 Role Set: IEPEmployesGroup (default from AD group)");
      }
      else {
        // User is neither in Users list nor in AD group - deny access
        console.log("❌ User is NOT member of the required AD group and not in Users list");

        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "You do not have access! Contact system administrator.",
          timer: 4000,
          timerProgressBar: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          window.location.href = "https://mcckc.sharepoint.com/sites/IEPManagement";
        });
      }
    } catch (err) {
      console.error("❌ Error in getUserRole:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred during security check. Contact system administrator.",
        timer: 4000,
        timerProgressBar: true,
      }).then(() => {
        window.location.href = "https://mcckc.sharepoint.com/sites/IEPManagement";
      });
    }
  };



  const handleLogout = async () => {
    // 1. Clear your app's local state / persisted data
    localStorage.removeItem('metropolitan-college-activePage');
    localStorage.removeItem('metropolitan-college-expandedSections');
    localStorage.removeItem('metropolitan-college-selectedDepartment');
    localStorage.removeItem('metropolitan-college-selectedScorecard');
    localStorage.removeItem('metropolitan-college-selectedIEP');
    localStorage.removeItem('metropolitan-college-showCharts');
    localStorage.removeItem('metropolitan-college-chartDeptId');
    localStorage.removeItem('metropolitan-college-showOperationalGoalsList');
    localStorage.removeItem('metropolitan-college-chartMode');
    localStorage.removeItem('metropolitan-college-showDistrictCharts');
    localStorage.removeItem('metropolitan-college-districtChartMode');
    localStorage.clear();
    // 2. Optional nice feedback
    toast.info('Signing you out securely...', { autoClose: 2000 });
    localStorage.clear();
    window.location.href = "/_layouts/15/SignOut.aspx";
  };

  if (loading) {
    return (
      <div className="d-flex vh-100 bg-white justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const getRecentIEPGoals = () => {
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

  return (
    <>
      <div id="wrapper" ref={elementRef} className="bg-light">
        <div className="app-menu" id="myHeader">
          <div className="sidebar">
            <IconNavigation
              activePage={activePage}
              onPageChange={handlePageChange}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              isMobile={isMobile}
              userRole={userRole}
            />
            <Sidebar
              sidebarOpen={sidebarOpen}
              activePage={activePage}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              currentData={currentData}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
              selectedDepartment={selectedDepartment}
              selectedScorecard={selectedScorecard}
              selectedIEP={selectedIEP}
              onDepartmentClick={handleDepartmentClick}
              onScorecardClick={handleScorecardClick}
              onIEPClick={handleIEPClick}
              getSafeExpandedState={getSafeExpandedState}
              onPageChange={handlePageChange}
              iepsData={masterAllIEPs}
              archivedIEPs={archivedIEPs}
              onArchivedDocumentClick={handleArchivedDocumentClick}
              onArchivedYearClick={handleArchivedYearClick}
              selectedArchivedDocument={selectedArchivedDocument}
              selectedArchivedYear={selectedArchivedYear}
              isMobile={isMobile}
              isTablet={isTablet}
              userRole={userRole}
            />
          </div>
        </div>
        <div className="content-page">
          <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)}
            user={{ name: currentUser?.Title, email: currentUser?.Email, contactNumber: 'N/A', }}
            usersList={usersList} />
          <DocumentViewer
            isOpen={isDocumentViewerOpen}
            onClose={() => {
              setIsDocumentViewerOpen(false);
              setDocumentViewerUrl(null);
            }}
            documentUrl={documentViewerUrl}
            isMobile={isMobile}
          />
          <NewGoalModal
            isOpen={isNewGoalModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleCreateGoal}
            loading={isSubmitting}
            existingGoals={organizationalScorecards}
          />
          {alert.show && (
            <div className={`alert alert-${alert.type} alert-dismissible fade show position-fixed`} style={{ top: 70, right: 20, zIndex: 1080 }}>
              {alert.message}
              <button type="button" className="btn-close" onClick={() => setAlert({ show: false })}></button>
            </div>
          )}
          <div className=" bg-light content" style={{ marginLeft: sidebarOpen ? '295px' : '65px' }} >
            <Stack direction="horizontal" gap={3} className="stack-header"
              style={{
                position: 'sticky',
                background: 'white',
                height: isMobile ? '80px' : '100px',
                top: 0,
                padding: isMobile ? '0.75rem' : '10px',
                zIndex: 100,
                borderBottom: '1px solid #e9ecef',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'center',
                flexWrap: isMobile ? 'wrap' : 'nowrap'
              }}
            >
              <div className="p-2" style={{ flex: isMobile ? '1 1 100%' : '1 1 auto' }}>
                {isMobile && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle sidebar"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
                    </svg>
                  </button>
                )}
                {(selectedDepartment || selectedScorecard || selectedIEP) && (
                  <h6 className={`mb-0 text-muted d-inline-block ${isMobile ? 'small' : ''}`}>
                    {activePage === 'dashboard' ? 'Department View' : 'Scorecard View'}
                    {activePage !== 'dashboard' && selectedScorecard && ` | ${organizationalScorecards.find(s => `scorecard-${s.Id}` === selectedScorecard)?.ScorecardName} ${organizationalScorecards.find(s => `scorecard-${s.Id}` === selectedScorecard)?.Year}`}
                    {activePage !== 'dashboard' && selectedIEPName && ` | ${selectedIEPName}`}
                  </h6>
                )}
              </div>
              <div className={`p-2 ${isMobile ? '' : 'ms-auto'}`} style={{ flex: isMobile ? '1 1 100%' : '0 0 auto' }}>
                <div className="d-flex align-items-center gap-3 justify-content-end">
                  <div className="position-relative" ref={notifDropdownRef}>
                    <div className="position-relative cursor-pointer" onClick={() => setShowNotifications(!showNotifications)} style={{ cursor: 'pointer' }} >
                      <Bell style={{ width: isMobile ? '18px' : '20px', height: isMobile ? '18px' : '20px', color: '#6c757d' }} />
                      {getRecentIEPGoals().length > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger" style={{ fontSize: '0.65rem', minWidth: isMobile ? '16px' : '18px' }} >
                          {getRecentIEPGoals().length}
                        </span>
                      )}
                    </div>
                    {showNotifications && (
                      <div className="position-absolute bg-white border rounded shadow-lg notification-dropdown" style={{ top: '45px', right: 0, minWidth: isMobile ? '250px' : '300px', maxWidth: isMobile ? '90vw' : '350px', zIndex: 9999999, animation: 'slideDown 0.2s ease', }} >
                        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                          <h6 className={`mb-0 fw-semibold text-dark ${isMobile ? 'small' : ''}`}>Recent Goals</h6>
                          <span className="badge bg-light text-dark small"> {getRecentIEPGoals().length} </span>
                        </div>
                        <div className="p-2" style={{ maxHeight: isMobile ? '200px' : '250px', overflowY: 'auto' }}>
                          {getRecentIEPGoals().length > 0 ? (
                            getRecentIEPGoals().map((iep) => (
                              <div key={iep.Id} className="d-flex align-items-start p-2 rounded hover-bg-light" style={{ cursor: 'pointer', transition: 'background-color 0.2s', }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')} >
                                <div className={`rounded-circle me-2 d-flex align-items-center justify-content-center ${iep.Status === 'Completed' ? 'bg-success text-white' : iep.Status === 'Active' ? 'bg-primary text-white' : 'bg-warning text-dark'}`}
                                  style={{ width: isMobile ? '24px' : '28px', height: isMobile ? '24px' : '28px', fontSize: '0.75rem' }} >
                                  {iep.Title[0]}
                                </div>
                                <div className="flex-grow-1">
                                  <div className={`fw-semibold text-dark ${isMobile ? 'small' : ''}`} dangerouslySetInnerHTML={{ __html: iep.Title.length > (isMobile ? 25 : 35) ? `${iep.Title.substring(0, (isMobile ? 25 : 35))}...` : iep.Title || '' }}>
                                  </div>
                                  <div className={`text-muted ${isMobile ? 'small' : ''}`}>
                                    {iep.Department} • {iep.Status}
                                  </div>
                                  <div className="text-secondary" style={{ fontSize: isMobile ? '0.65rem' : '0.7rem' }} >
                                    {iep.Date}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted small text-center my-3">No recent goals</p>
                          )}
                        </div>
                        <div className="border-top text-center p-2">
                          <button type="button" className="btn btn-link text-decoration-none small" onClick={() => { handlePageChange('recentIEPs'); setShowNotifications(false); }} >
                            View All
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="position-relative" ref={dropdownRef}>
                    <div className="d-flex align-items-center gap-2 cursor-pointer" onClick={() => setShowProfileDropdown(!showProfileDropdown)} style={{ cursor: 'pointer' }} >
                      <div className="rounded-circle bg-gradient bg-warning d-flex align-items-center justify-content-center" style={{ width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px' }}>
                        <span className="text-white small fw-semibold">
                          {currentUser ? getUserInitials(currentUser.Title) : 'U'}
                        </span>
                      </div>
                      {!isMobile && (
                        <div className="d-flex flex-column">
                          <span className="small fw-semibold text-dark">
                            {currentUser?.Title || 'Loading...'}
                          </span>
                          <span className="small text-muted">{userRole}</span>
                        </div>
                      )}
                      <ChevronDown className="text-muted" style={{ width: '16px', height: '16px', transform: showProfileDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                    </div>
                    {showProfileDropdown && (
                      <div className="position-absolute bg-white border rounded shadow-lg profile-dropdown" style={{ top: '45px', right: '0', minWidth: isMobile ? '200px' : '220px', maxWidth: isMobile ? '90vw' : '250px', zIndex: 1000, animation: 'slideDown 0.2s ease' }} >
                        <div className="p-3 border-bottom">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <div className="rounded-circle bg-gradient bg-warning d-flex align-items-center justify-content-center" style={{ width: isMobile ? '35px' : '40px', height: isMobile ? '35px' : '40px' }}>
                              <span className="text-white fw-semibold">
                                {currentUser ? getUserInitials(currentUser.Title) : 'U'}
                              </span>
                            </div>
                            <div>
                              <div className={`fw-semibold text-dark ${isMobile ? 'small' : ''}`}>
                                {currentUser?.Title || 'User'}
                              </div>
                              <div className="text-muted" style={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                                {currentUser?.Email || 'user@example.com'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="py-1">
                          <button type="button" className="btn btn-link text-decoration-none w-100 text-start d-flex align-items-center gap-2 px-3 py-2 text-dark"
                            onClick={() => setIsProfileModalOpen(true)}
                            style={{ border: 'none', background: 'transparent', transition: 'background-color 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} >
                            <User style={{ width: '16px', height: '16px' }} />
                            <span className="small" >View Profile</span>
                          </button>
                          {
                            userRole == "Program Director" && (<button type="button" className="btn btn-link text-decoration-none w-100 text-start d-flex align-items-center gap-2 px-3 py-2 text-dark"
                              onClick={() => { setShowProfileDropdown(false); setActivePage('settings'); }}
                              style={{ border: 'none', background: 'transparent', transition: 'background-color 0.2s' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'} >
                              <Settings style={{ width: '16px', height: '16px' }} />
                              <span className="small">Settings</span>
                            </button>)

                          }
                          {/* LOGOUT BUTTON */}
                          <button type="button"
                            className="btn btn-link text-decoration-none w-100 text-start d-flex align-items-center gap-2 px-3 py-2 text-danger"
                            onClick={handleLogout}
                            style={{ border: 'none', background: 'transparent', transition: 'background-color 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8d7da'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <LogOut style={{ width: '16px', height: '16px' }} />
                            <span className="small fw-semibold">Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div></div>
              {/* <div className="vr" />
            <div className="p-2">Third item</div> */}
            </Stack>
            {renderContent()}
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={3000} newestOnTop />
      </div>
    </>
  );
};

export default CustomMetropolitanCollegeDirectory;