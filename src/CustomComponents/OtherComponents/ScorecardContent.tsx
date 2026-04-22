import React, { useEffect, useState, useMemo, useRef } from 'react';
import { stripHtml } from '../HelperCustomComponents/Alluse';
import {
  getOrganizationalGoalsAlignment,
  getThreeYearGoalsAlignment,
  getHlcCriteria,
  createIEP,
  updateIEP,
  getSubDepartmentsByDepartment,
  getSubSubDepartmentsBySubDepartment,
  getDefinition,
  // new APIs - these functions should be implemented in your OrgnaizationAPI file
  updateOrganizationalGoal,
  updateDepartment,
  getTags
} from '../../APIsServices/OrgnaizationAPI';
import { deleteIEP } from '../../APIsServices/SharePointService';
import NoSelectionView from './NoSelectionView';
import IEPDetailsView from './IEPDetailsView';
import IEPTable from './IEPTable';
import IEPSidebarForm from './IEPSidebarForm';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DefinitionsTable from './DefinitionsTable';
import DOMPurify from 'dompurify';
import DonutChart from '../OtherComponents/DonutChartLegendDemo/DonutChartLegendDemo';
import OperationalGoalsList from './OperationalGoalsList';
import { Check, PencilLine } from 'lucide-react';
import ReactQuill from 'react-quill';

interface IEPFormData {
  OperationalGoal: string;
  OperationalTactic: string;
  PerformanceMeasure: string;
  PerformanceMeasureResults: string;
  ResultsMet: string;
  ContinuousImprovement: string;
  FutureBudgetImpact: string;
  IfYesPleaseDescribe: string;
  StartDate: string;
  EndDate: string;
  Priority: string;
  Target: string;
  // BudgetImpactDescription: string;
  OrganizationalGoals: string;
  Departments: string;
  DepartmentsId: number | null;
  SubDepartmentId: string;
  SubSubDepartmentId?: string;
  OrganizationGoalAlignment: string[];
  HLCAlignment: string[];
  SharedServiceCampusGoalAlignment: string[];
  TagId?: string;
  Tags?: string[];
}

const STATUS_SEGMENTS = [
  { key: 'Completed', label: 'Complete', color: '#28a745' },
  { key: 'Partially Completed', label: 'Partially Complete', color: '#ffc107' },
  { key: 'Not Completed', label: 'Not Complete', color: '#dc3545' },
  { key: 'Not Defined', label: 'Undefined', color: '#ffb3b3' },
];
const IGNORED_LABELS = ['uncategorized', 'unassigned', 'not aligned', 'untagged', 'untaged', 'none'];
const isMeaningfulLabel = (label?: string) => {
  const normalized = stripHtml(label || '').trim().toLowerCase();
  return normalized.length > 0 && !IGNORED_LABELS.includes(normalized);
};

const ScorecardContent = ({
  selectedDepartment,
  selectedScorecard,
  selectedIEP,
  stats,
  loading,
  departments,
  organizationalScorecards,
  allIEPs,
  currentUser,
  usersList,
  sp,
  onIEPCreated,
  onSelectDepartment,
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
  onPageChange,
  chartMode,
  setChartMode,
  showDistrictCharts,
  setShowDistrictCharts,
  districtChartMode,
  setDistrictChartMode,
}: any) => {
  // ──────────────────────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────────────────────
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'asc' | 'desc' }>({ key: 'SubDepartment', direction: 'asc' });
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingIEP, setEditingIEP] = useState<any>(null);
  const [formData, setFormData] = useState<IEPFormData>(emptyForm());
  const exportContainerRef = useRef<HTMLDivElement | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const [orgGoalOptions, setOrgGoalOptions] = useState<Array<{ Id: number; Value: string; Tag?: string }>>([]);
  const [threeYrOptions, setThreeYrOptions] = useState<Array<{ Id: number; ThreeYRSharedService: string }>>([]);
  const [hlcOptions, setHlcOptions] = useState<Array<{ Id: number; HLCAlignment: string }>>([]);
  const [tagOptions, setTagOptions] = useState<Array<{ Id: number; Tag: string; TagType?: string }>>([]);
  const [definitions, setDefinition] = useState<any[]>([]);

  const [subDepartments, setSubDepartments] = useState<Array<{ Id: number; SubDepartmentName: string }>>([]);
  const [subSubDepartments, setSubSubDepartments] = useState<Array<{ Id: number; SubSubDepartmentName: string }>>([]);
  const [selectedSubDeptId, setSelectedSubDeptId] = useState<string>('');
  const [selectedSubSubDeptId, setSelectedSubSubDeptId] = useState<string>('');

  const prevSelectedDepartment = useRef(selectedDepartment);
  const prevSelectedScorecard = useRef(selectedScorecard);
  const prevSelectedIEP = useRef(selectedIEP);
  const expandedIEPAfterUpdate = useRef<number | null>(null);
  const autoCreatedKeysRef = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);
  const tableSectionRef = useRef<HTMLDivElement | null>(null);

  const mainlogo = require("../../CustomAssets/mcchighquality.png");
  const mediaImageDetails = require("../../CustomAssets/mediaImageDetails.png");
  const Reimagined = require("../../CustomAssets/StratMap2025.jpg");

  // Hero Block Images
  // const hero1 = require("../../CustomAssets/HeroImages/hero1.jpg");
  // const hero2 = require("../../CustomAssets/HeroImages/hero2.jpg");
  // const hero3 = require("../../CustomAssets/HeroImages/hero3.jpg");
  // const hero4 = require("../../CustomAssets/HeroImages/hero4.jpg");
  // const hero5 = require("../../CustomAssets/HeroImages/hero5.jpg");

  const selDept = departments.find((d: any) => `dept-${d.Id}` === selectedDepartment);
  const selScorecard = organizationalScorecards.find((s: any) => `scorecard-${s.Id}` === selectedScorecard);
  const selIEP = allIEPs.find((i: any) => `iep-${i.Id}` === selectedIEP);
  const selDeptShortName = selDept?.DepartmentShortName ?? '';

  // Editable Mission & Vision state
  const [isEditingMission, setIsEditingMission] = useState(false);
  const [missionText, setMissionText] = useState<string>('');
  const [missionSaving, setMissionSaving] = useState(false);

  const [isEditingVision, setIsEditingVision] = useState(false);
  const [visionText, setVisionText] = useState<string>('');
  const [visionSaving, setVisionSaving] = useState(false);

  // Editable DefaultDataTable texts
  const [isEditingLeftText, setIsEditingLeftText] = useState(false);
  const [leftText, setLeftText] = useState<string>('To open the annual Goal cycle, PUMs fill out the blue boxes in June.');
  const [leftTextSaving, setLeftTextSaving] = useState(false);

  const [isEditingRightText, setIsEditingRightText] = useState(false);
  const [rightText, setRightText] = useState<string>('To close the annual Goal Cycle, PUMs fill out the yellow boxes in May.');
  const [rightTextSaving, setRightTextSaving] = useState(false);

  // Global Goal state
  const [isEditingGlobalGoal, setIsEditingGlobalGoal] = useState(false);
  const [globalGoalText, setGlobalGoalText] = useState<string>('');
  const [globalGoalSaving, setGlobalGoalSaving] = useState(false);

  /* ---------- Quill toolbar configuration ---------- */
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

  // ──────────────────────────────────────────────────────────────
  // USER DEPARTMENT & VISION (NEW & FIXED)
  // ──────────────────────────────────────────────────────────────
  const userDepartmentId = () => {
    if (!currentUser || !usersList?.length) return null;
    const rec = usersList.find(
      (u: any) =>
        u.User?.Id === currentUser.Id ||
        u.User?.Email === currentUser.Email ||
        u.User?.LoginName === currentUser.LoginName
    );
    return rec?.Departments?.Id ?? rec?.Departments ?? null;
  };

  const getUserDepartment = () => {
    const deptId = userDepartmentId();
    if (!deptId) return null;
    return departments.find((d: any) => d.Id === Number(deptId)) ?? null;
  };

  const userDeptVision = useMemo(() => {
    const dept = getUserDepartment();
    return dept?.Vision ?? '';
  }, [departments, currentUser, usersList]);

  const userDeptMission = useMemo(() => {
    const dept = getUserDepartment();
    return dept?.Mission ?? '';
  }, [departments, currentUser, usersList]);

  // keep local visionText in sync with department data
  useEffect(() => {
    setVisionText(userDeptVision || '');
  }, [userDeptVision]);

  // keep local missionText in sync with department Mission instead of scorecard
  useEffect(() => {
    setMissionText(userDeptMission || '');
  }, [userDeptMission]);

  // Load saved LeftText and RightText from localStorage
  useEffect(() => {
    const savedLeftText = localStorage.getItem('iep-leftText');
    const savedRightText = localStorage.getItem('iep-rightText');
    if (savedLeftText) setLeftText(savedLeftText);
    if (savedRightText) setRightText(savedRightText);
  }, []);

  // keep local globalGoalText in sync with scorecard data
  useEffect(() => {
    setGlobalGoalText(selScorecard?.GlobalGoal || '');
  }, [selScorecard]);

  // ──────────────────────────────────────────────────────────────
  // NAVIGATION CHANGE DETECTION
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const deptChanged = prevSelectedDepartment.current !== selectedDepartment;
    const scorecardChanged = prevSelectedScorecard.current !== selectedScorecard;
    const iepChanged = prevSelectedIEP.current !== selectedIEP;

    if (deptChanged || scorecardChanged || iepChanged) {
      setSelectedIEPDetail(null);
      setShowCharts(false);
      setShowOperationalGoalsList(false);
      setChartDeptId(null);

      const shouldFocusTable = Boolean(selectedDepartment || selectedIEP);
      if (shouldFocusTable && tableSectionRef.current) {
        setTimeout(() => {
          tableSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    prevSelectedDepartment.current = selectedDepartment;
    prevSelectedScorecard.current = selectedScorecard;
    prevSelectedIEP.current = selectedIEP;
  }, [selectedDepartment, selectedScorecard, selectedIEP]);

  // Restore expanded state after IEP update
  useEffect(() => {
    // Check both ref and localStorage for the expanded IEP ID
    const expandedIdFromRef = expandedIEPAfterUpdate.current;
    const expandedIdFromStorage = localStorage.getItem('expandedIEPAfterUpdate');
    const expandedId = expandedIdFromRef || (expandedIdFromStorage ? Number(expandedIdFromStorage) : null);

    if (expandedId !== null && allIEPs?.length > 0) {
      // Use setTimeout to ensure the state is set after any other state updates
      setTimeout(() => {
        setExpandedRows(prev => ({ ...prev, [expandedId]: true }));
      }, 100);

      // Clear both ref and localStorage
      expandedIEPAfterUpdate.current = null;
      localStorage.removeItem('expandedIEPAfterUpdate');
    }
  }, [allIEPs]);

  // ──────────────────────────────────────────────────────────────
  // COLUMNS
  // ──────────────────────────────────────────────────────────────
  const [columns, setColumns] = useState({
    department: { label: 'Department', visible: false, sortKey: 'Department', bgColor: '#004C8E' },
    subDepartment: { label: 'Sub-Department', visible: false, sortKey: 'SubDepartment', bgColor: '#004C8E' },
    organizationalGoal: { label: 'Organizational Goal(s) Alignment', visible: true, sortKey: 'OrganizationGoalAlignment', bgColor: '#004C8E' },
    threeYearGoal: { label: '3-YR Shared Service/Unit Goal(S)', visible: true, sortKey: 'SharedServiceCampusGoalAlignment', bgColor: '#004C8E' },
    hlcCriteria: { label: 'HLC Criteria Alignment', visible: true, sortKey: 'HLCAlignment', bgColor: '#004C8E' },
    operationalTactic: { label: 'Operational Tactic', visible: true, sortKey: 'OperationalTactic', bgColor: '#004C8E' },
    performanceMeasure: { label: 'Performance Measure', visible: true, sortKey: 'PerformanceMeasure', bgColor: '#004C8E' },
    target: { label: 'Target', visible: true, sortKey: 'Target', bgColor: '#004C8E' },
    performanceMeasureResults: { label: 'Performance Measure Results', visible: true, sortKey: 'PerformanceMeasureResults', responsiveClass: 'd-none d-md-table-cell', bgColor: '#FFBF32' },
    continuousImprovement: { label: 'Continuous Improvement', visible: true, sortKey: 'ContinuousImprovement', responsiveClass: 'd-none d-md-table-cell', bgColor: '#FFBF32' },
    resultsMet: { label: 'Results Met', visible: true, sortKey: 'ResultsMet', bgColor: '#FFBF32' },
    // futureBudgetImpact: { label: 'Future Budget Impact', visible: true, sortKey: 'FutureBudgetImpact', responsiveClass: 'd-none d-md-table-cell', bgColor: '#FFBF32' },
    ifYesPleaseDescribe: { label: 'Describe future budget impact', visible: true, sortKey: 'IfYesPleaseDescribe', responsiveClass: 'd-none d-md-table-cell', bgColor: '#FFBF32' },
    // budgetImpact: { label: 'Budget Impact Description', visible: false, sortKey: 'BudgetImpactDescription', responsiveClass: 'd-none d-md-table-cell', bgColor: '#FFBF32' },
  });

  function emptyForm(): IEPFormData {
    return {
      OperationalGoal: '',
      OperationalTactic: '',
      PerformanceMeasure: '',
      PerformanceMeasureResults: '',
      ResultsMet: '',
      ContinuousImprovement: '',
      FutureBudgetImpact: 'No',
      IfYesPleaseDescribe: '',
      StartDate: '',
      EndDate: '',
      Priority: 'Medium',
      Target: '',
      // BudgetImpactDescription: '',
      OrganizationalGoals: '',
      Departments: '',
      DepartmentsId: null,
      SubDepartmentId: '',
      SubSubDepartmentId: '',
      OrganizationGoalAlignment: [],
      HLCAlignment: [],
      SharedServiceCampusGoalAlignment: [],
      TagId: '',
      Tags: [],
    };
  }

  // ──────────────────────────────────────────────────────────────
  // PERMISSIONS
  // ──────────────────────────────────────────────────────────────
  const isProgramDirector = userRole === 'Program Director';
  const isPlanningUnitManager = userRole === 'Planning Unit Manager';
  const isIEPEmployee = userRole === 'IEPEmployesGroup';
  const userDeptId = userDepartmentId();

  const canEditDepartment = (deptId: number | null) => {
    if (isIEPEmployee) return false; // IEPEmployesGroup has read-only access
    if (isProgramDirector) return true;
    if (!deptId) return false;
    return Number(deptId) === Number(userDeptId);
  };

  const canEditIEP = (iep?: any) => {
    if (isIEPEmployee) return false; // IEPEmployesGroup has read-only access
    if (isProgramDirector) return true;
    // Planning Unit Manager can only edit their own department's IEPs
    if (isPlanningUnitManager) {
      const deptId = iep?.Departments?.Id ?? formData.DepartmentsId;
      return canEditDepartment(deptId);
    }
    const deptId = iep?.Departments?.Id ?? formData.DepartmentsId;
    return canEditDepartment(deptId);
  };

  // ──────────────────────────────────────────────────────────────
  // LOAD DATA
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadAlignments = async () => {
      if (!sp) return;
      const [org, three, hlc, def, tagsList] = await Promise.all([
        getOrganizationalGoalsAlignment("SharePoint", sp),
        getThreeYearGoalsAlignment("SharePoint", sp),
        getHlcCriteria("SharePoint", sp),
        getDefinition("SharePoint", sp),
        getTags("SharePoint", sp),
      ]);
      // Sort org goal options alphabetically by Value field
      const sortedOrgGoals = (org || []).sort((a: any, b: any) => {
        const valueA = a.Value?.toLowerCase() || '';
        const valueB = b.Value?.toLowerCase() || '';
        return valueA.localeCompare(valueB);
      });
      setOrgGoalOptions(sortedOrgGoals);
      setThreeYrOptions(three || []);
      setHlcOptions(hlc || []);
      setDefinition(def || []);
      setTagOptions(tagsList || []);
    };
    loadAlignments();
  }, [sp]);

  useEffect(() => {
    const loadSubDepts = async () => {
      if (!sp || !formData.DepartmentsId) {
        setSubDepartments([]);
        setSelectedSubDeptId('');
        setFormData(p => ({ ...p, SubDepartmentId: '', SubSubDepartmentId: '' }));
        return;
      }
      const subs = await getSubDepartmentsByDepartment("SharePoint", sp, formData.DepartmentsId);
      setSubDepartments(subs || []);
      setSubSubDepartments([]);
      setSelectedSubSubDeptId('');
      setFormData(p => ({ ...p, SubSubDepartmentId: '' }));
      if (selectedSubDeptId && !subs?.some(s => s.Id.toString() === selectedSubDeptId)) {
        setSelectedSubDeptId('');
        setFormData(p => ({ ...p, SubDepartmentId: '' }));
      }
    };
    loadSubDepts();
  }, [formData.DepartmentsId, sp]);

  useEffect(() => {
    const loadSubSubDepts = async () => {
      if (!sp || !formData.SubDepartmentId) {
        setSubSubDepartments([]);
        setSelectedSubSubDeptId('');
        setFormData(p => ({ ...p, SubSubDepartmentId: '' }));
        return;
      }
      const subs = await getSubSubDepartmentsBySubDepartment("SharePoint", sp, Number(formData.SubDepartmentId));
      setSubSubDepartments(subs || []);
      if (selectedSubSubDeptId && !subs?.some(s => s.Id.toString() === selectedSubSubDeptId)) {
        setSelectedSubSubDeptId('');
        setFormData(p => ({ ...p, SubSubDepartmentId: '' }));
      }
    };
    loadSubSubDepts();
  }, [formData.SubDepartmentId, sp]);

  // ──────────────────────────────────────────────────────────────
  // CHART HELPERS
  // ──────────────────────────────────────────────────────────────
  const getResultsMetData = (ieps: any[]) => {
    const counts = { Completed: 0, "Partially Completed": 0, "Not Completed": 0, "Not Defined": 0 };
    ieps.forEach(i => {
      const val = i.ResultsMet?.trim() || "Not Defined";
      if (counts.hasOwnProperty(val)) (counts as any)[val]++;
    });
    return [
      { name: "Completed", value: counts.Completed, color: "#28a745" },
      { name: "Partially Completed", value: counts["Partially Completed"], color: "#ffc107" },
      { name: "Not Completed", value: counts["Not Completed"], color: "#dc3545" },
      { name: "Not Defined", value: counts["Not Defined"], color: "#bac0c5ff" }
    ].filter(d => d.value > 0);
  };

  const buildStatusSummary = (records: any[]) => {
    const total = records.length;
    const breakdown = STATUS_SEGMENTS.map(segment => {
      const value = records.filter(
        (iep: any) => (iep.ResultsMet?.trim() || "Not Defined") === segment.key
      ).length;
      const percentage = total ? ((value / total) * 100).toFixed(1) : "0.0";
      return { ...segment, value, percentage };
    });

    const chartData = breakdown
      .filter(item => item.value > 0)
      .map(item => ({
        name: item.label,
        value: item.value,
        color: item.color
      }));

    return { total, breakdown, chartData };
  };

  // Enhanced footer rendering with better formatting
  const renderSummaryFooter = (cardId: string, breakdown: any[], total: number) => (
    <div className="mt-3">
      {breakdown.map(row => (
        <div
          key={`${cardId}-${row.key}`}
          className="d-flex align-items-center justify-content-between text-muted small mb-2"
        >
          <div className="d-flex align-items-center gap-2">
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                display: 'inline-block',
                backgroundColor: row.color,
                border: '1px solid rgba(0,0,0,0.1)'
              }}
            />
            <span style={{ fontWeight: 500 }}>{row.label}</span>
          </div>
          <span className="fw-bold text-dark">
            {row.value} ({row.percentage}%)
          </span>
        </div>
      ))}
      <div className="mt-3 pt-2 border-top">
        <div className="d-flex justify-content-between">
          <span className="text-muted small">Total operational goals:</span>
          <span className="fw-bold text-primary">{total}</span>
        </div>
      </div>
    </div>
  );


  // ──────────────────────────────────────────────────────────────
  // CHARTS VIEW
  // ──────────────────────────────────────────────────────────────
  const ChartsView = ({
    ieps,
    titlePrefix,
    breakdownMode,
    onBack,
  }: {
    ieps: any[];
    titlePrefix: string;
    breakdownMode: 'subDepartment' | 'tag' | 'executiveCabinet';
    onBack: () => void;
  }) => {
    const dataset = ieps ?? [];

    const subDeptMap = dataset.reduce((acc: Record<string, any[]>, i: any) => {
      const sub = i.SubDepartments?.SubDepartmentName?.trim();
      // Only add if sub exists and is not "Uncategorized"
      if (sub && sub.toLowerCase() !== 'uncategorized') {
        if (!acc[sub]) acc[sub] = [];
        acc[sub].push(i);
      }
      return acc;
    }, {});

    const tagMap = dataset.reduce((acc: Record<string, { records: any[], deptName: string }>, i: any) => {
      // Get tags from OrganizationGoalAlignment instead of Tag field
      const orgAlignments = i.OrganizationGoalAlignment || [];
      if (orgAlignments.length > 0) {
        orgAlignments.forEach((org: any) => {
          const tagName = org.Tag?.trim();
          // Only add if tagName exists and is not "Uncategorized"
          if (tagName && tagName.toLowerCase() !== 'uncategorized') {
            if (!acc[tagName]) {
              // For district-wide, don't store department name
              const deptName = titlePrefix?.toLowerCase().includes("district-wide")
                ? ''
                : (i.Departments?.DepartmentName || i.Departments?.DepartmentShortName || '');
              acc[tagName] = { records: [], deptName };
            }
            acc[tagName].records.push(i);
          }
        });
      }
      // Remove the else block that adds to 'Uncategorized'
      return acc;
    }, {});

    const executiveMap = dataset.reduce((acc: Record<string, any[]>, i: any) => {
      const exec = i.ExecutiveCabinet?.Title?.trim();
      // Only add if exec exists and is not "Uncategorized"
      if (exec && exec.toLowerCase() !== 'uncategorized') {
        if (!acc[exec]) acc[exec] = [];
        acc[exec].push(i);
      }
      return acc;
    }, {});

    const departmentMap = dataset.reduce((acc: Record<string, any[]>, i: any) => {
      const deptName = i.Departments?.DepartmentName?.trim();
      // Only add if deptName exists and is not "Uncategorized"
      if (deptName && deptName.toLowerCase() !== 'uncategorized') {
        if (!acc[deptName]) acc[deptName] = [];
        acc[deptName].push(i);
      }
      return acc;
    }, {});

    const isTagMode = breakdownMode === 'tag';
    const isExecMode = breakdownMode === 'executiveCabinet';
    const isDistrictWideExec =
      isExecMode && titlePrefix?.toLowerCase().includes("district-wide");
    const breakdownTitle = isTagMode
      ? "Goal Count by Organizational Goal Tags"
      : isExecMode
        ? isDistrictWideExec
          ? "Goal Count by Department (District-Wide)"
          : "Goal Count by Executive Cabinet Jurisdiction (ECJ)"
        : "Goal Count by District Offices' Planning Units";
    const breakdownMap = isTagMode
      ? tagMap
      : isExecMode
        ? isDistrictWideExec
          ? departmentMap
          : executiveMap
        : subDeptMap;
    const overallData = getResultsMetData(dataset);
    const hasOverallData = overallData.length > 0;
    // Sort breakdown entries alphabetically by label
    let breakdownEntries = Object.entries(breakdownMap);
    if (!isTagMode) {
      const preferredOrder = [
        'District Office of Budget',
        'District Office of Facilities',
        'District Office of Campus Police'
      ];
      const orderMap = new Map(preferredOrder.map((n, i) => [n.toLowerCase(), i]));
      breakdownEntries = breakdownEntries.sort((a, b) => {
        const ra = orderMap.has(a[0].toLowerCase()) ? (orderMap.get(a[0].toLowerCase()) as number) : Number.POSITIVE_INFINITY;
        const rb = orderMap.has(b[0].toLowerCase()) ? (orderMap.get(b[0].toLowerCase()) as number) : Number.POSITIVE_INFINITY;
        if (ra === rb) return a[0].localeCompare(b[0]);
        return ra - rb;
      });
    } else {
      breakdownEntries = breakdownEntries.sort((a, b) => a[0].localeCompare(b[0]));
    }

    console.log(breakdownEntries, 'breakdownEntries');

    return (
      <div className="container-fluid pbbbb bg-light">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={onBack}
          >
            Back to Cards
          </button>
          <h4 className={`${isMobile ? 'h5' : 'h4'} text-dark`}>
            {titlePrefix}
          </h4>
        </div>

        <div className="row g-4">
          <div className="col-12 col-lg-6">
            {hasOverallData ? (
              <DonutChart
                title={
                  (titlePrefix || '').toLowerCase().includes('administrative services')
                    ? 'Overall Average of Status Across Entire Planning Unit'
                    : 'Overall Average of Status Across Entire Planning Unit'
                }
                subTitle="Aggregate Status - Overall"
                data={overallData}
                height={325}
              />
            ) : (
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column justify-content-center align-items-center text-center text-muted">
                  <p className="mb-0">No goal data available for this selection.</p>
                </div>
              </div>
            )}
          </div>

          <div className="col-12">
            {/* <h5 className="text-muted mb-3">{breakdownTitle}</h5> */}
            {breakdownEntries.length > 0 ? (
              <div className="row g-3">
                {breakdownEntries.map(([label, data]: [string, any]) => {
                  const records = isTagMode ? data.records : data;
                  const deptName = isTagMode ? data.deptName : '';
                  const isDistrictWide = titlePrefix?.toLowerCase().includes("district-wide");
                  const displayTitle = isTagMode
                    ? isDistrictWide
                      ? `Summary Chart - ${label}`
                      : `Summary Chart - ${label}${deptName ? ` - ${deptName}` : ''}`
                    : `${label} (${records.length} Goal${records.length !== 1 ? 's' : ''})`;

                  return (
                    <div key={label} className="col-12 col-md-6 col-lg-4">
                      <DonutChart
                        title={displayTitle}
                        subTitle={isTagMode ? undefined : `Aggregate Status - ${label}`}
                        data={getResultsMetData(records)}
                        height={303}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card shadow-sm">
                <div className="card-body text-center text-muted">
                  No breakdown data available for this view.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────────────────────────
  const handleRowClick = (iep: any) => setSelectedIEPDetail(iep);
  const handleBackToTable = () => setSelectedIEPDetail(null);
  const openDistrictSummary = (mode: 'tag' | 'executiveCabinet') => {
    setDistrictChartMode(mode);
    setShowDistrictCharts(true);
    setShowCharts(false);
    setShowOperationalGoalsList(false);
    setSelectedIEPDetail(null);
    setChartDeptId(null);
  };

  const openNewGoal = async () => {
    let deptIdNumber: number | null = null;
    if (selectedDepartment) {
      deptIdNumber = Number(selectedDepartment.replace('dept-', ''));
    } else {
      const userDept = userDepartmentId();
      deptIdNumber = userDept ?? null;
    }

    if (!canEditDepartment(deptIdNumber)) {
      toast.warn('You can only create goals for your own department.');
      return;
    }

    let subDeptId = '';
    let subSubDeptId = '';
    if (selectedIEP?.startsWith('subsub-')) {
      const parts = selectedIEP.replace('subsub-', '').split('-');
      if (parts.length >= 2) {
        subDeptId = parts[0];
        subSubDeptId = parts[1];
      }
    } else if (selectedIEP?.startsWith('sub-')) {
      subDeptId = selectedIEP.replace('sub-', '');
    }

    const deptObj = departments.find((d: any) => d.Id === deptIdNumber);
    setFormData({
      ...emptyForm(),
      Departments: deptObj?.DepartmentName ?? '',
      DepartmentsId: deptObj?.Id ?? null,
      OrganizationalGoals: selectedScorecard ? selectedScorecard.split('-')[1] : '',
    });

    setSelectedSubDeptId('');
    setSelectedSubSubDeptId('');

    if (deptIdNumber) {
      try {
        const subs = await getSubDepartmentsByDepartment("SharePoint", sp, deptIdNumber);
        setSubDepartments(subs || []);
        if (subDeptId) {
          const subIdStr = String(subDeptId);
          setSelectedSubDeptId(subIdStr);
          setFormData(p => ({ ...p, SubDepartmentId: subIdStr }));

          try {
            const ss = await getSubSubDepartmentsBySubDepartment("SharePoint", sp, Number(subIdStr));
            setSubSubDepartments(ss || []);
            if (subSubDeptId) {
              const ssIdStr = String(subSubDeptId);
              setSelectedSubSubDeptId(ssIdStr);
              setFormData(p => ({ ...p, SubSubDepartmentId: ssIdStr }));
            }
          } catch (err) {
            console.warn("Failed loading sub-sub departments:", err);
            setSubSubDepartments([]);
          }
        }
      } catch (err) {
        console.warn("Failed loading sub-departments:", err);
        setSubDepartments([]);
      }
    }

    setEditingIEP(null);
    setShowSidebar(true);
  };

  const openEditGoal = (iep: any) => {
    if (!canEditIEP(iep)) {
      toast.warn('You are not allowed to edit Goals from other departments.');
      return;
    }

    // Decode any HTML entities saved from previous renders so ReactQuill shows formatted content
    const decodeHtmlEntities = (html: string | undefined | null): string => {
      if (!html) return '';
      const textarea = document.createElement('textarea');
      textarea.innerHTML = String(html);
      return textarea.value;
    };

    // Keep the row expanded when editing
    setExpandedRows(prev => ({ ...prev, [iep.Id]: true }));

    setEditingIEP(iep);
    setFormData({
      OperationalGoal: iep.OperationalGoal ?? '',
      OperationalTactic: decodeHtmlEntities(iep.OperationalTactic),
      PerformanceMeasure: decodeHtmlEntities(iep.PerformanceMeasure),
      PerformanceMeasureResults: decodeHtmlEntities(iep.PerformanceMeasureResults),
      ResultsMet: iep.ResultsMet ?? '',
      ContinuousImprovement: decodeHtmlEntities(iep.ContinuousImprovement),
      FutureBudgetImpact: iep.FutureBudgetImpact ?? 'No',
      IfYesPleaseDescribe: decodeHtmlEntities(iep.IfYesPleaseDescribe),
      StartDate: iep.StartDate ? new Date(iep.StartDate).toISOString().split('T')[0] : '',
      EndDate: iep.EndDate ? new Date(iep.EndDate).toISOString().split('T')[0] : '',
      Priority: iep.Priority ?? 'Medium',
      Target: decodeHtmlEntities(iep.Target),
      // BudgetImpactDescription: decodeHtmlEntities(iep.BudgetImpactDescription),
      Departments: iep.Departments?.DepartmentName ?? '',
      DepartmentsId: iep.Departments?.Id ?? null,
      SubDepartmentId: iep.SubDepartments?.Id?.toString() ?? '',
      SubSubDepartmentId: iep.SubSubDepartments?.Id?.toString() ?? '',
      OrganizationalGoals: iep.OrganizationalGoals?.Id?.toString() ?? '',
      OrganizationGoalAlignment: iep.OrganizationGoalAlignment?.map((x: any) => x.Id.toString()) ?? [],
      HLCAlignment: iep.HLCAlignment?.map((x: any) => x.Id.toString()) ?? [],
      SharedServiceCampusGoalAlignment: iep.SharedServiceCampusGoalAlignment?.map((x: any) => x.Id.toString()) ?? [],
      TagId: iep.Tag?.Id ? iep.Tag.Id.toString() : '',
      Tags: (() => {
        // Extract tags from selected OrganizationGoalAlignment
        const selectedIds = iep.OrganizationGoalAlignment?.map((x: any) => x.Id) ?? [];
        const selectedOrgs = orgGoalOptions.filter((o: any) => selectedIds.includes(Number(o.Id)));
        const tags = selectedOrgs
          .map((o: any) => o.Tag)
          .filter((tag: string) => tag && tag.trim() !== '');
        return Array.from(new Set(tags));
      })(),
    });
    setSelectedSubDeptId(iep.SubDepartments?.Id?.toString() ?? '');
    setSelectedSubSubDeptId(iep.SubSubDepartments?.Id?.toString() ?? '');
    setShowSidebar(true);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
    setEditingIEP(null);
    setFormData(emptyForm());
    setSelectedSubDeptId('');
    setSelectedSubSubDeptId('');
  };

  const handleDeleteIEP = async (iep: any) => {
    if (!canEditIEP(iep)) {
      toast.warn('You are not allowed to delete Goals from other departments.');
      return;
    }

    try {
      await deleteIEP(sp, iep.Id);
      toast.success('Goal deleted successfully');
      setTimeout(() => onIEPCreated?.(), 500);
    } catch (error: any) {
      console.error("Delete Goal Error:", error);
      toast.error(`Failed to delete Goal: ${error.message || error}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {

    e.preventDefault();
    const isGlobalGoalLocked = !!(editingIEP?.IsGlobalGoal && isPlanningUnitManager);
    // Strip HTML and validate the operational goal
    const cleanedGoal = stripHtml(formData.OperationalGoal || '').trim();
    if (!cleanedGoal) return toast.warn("Operational Goal is required.");
    if (!formData.DepartmentsId) return toast.warn("Please select a Department.");

    // Validate that if Future Budget Impact is Yes, description is required
    if (formData.FutureBudgetImpact !== 'No' && !formData.IfYesPleaseDescribe?.trim()) {
      return toast.warn("Please provide a description when Future Budget Impact is Yes.");
    }

    if (!canEditDepartment(formData.DepartmentsId)) {
      toast.error('You do not have permission to save this Goal.');
      return;
    }

    try {
      // Strip HTML from text fields to prevent SharePoint validation errors
      const cleanOperationalGoal = stripHtml(formData.OperationalGoal || '').trim();
      const lockedOperationalGoal = stripHtml(editingIEP?.OperationalGoal || '').trim();

      // Clean text fields - return empty string instead of null for SharePoint compatibility
      const cleanTextField = (value: string | undefined | null) => {
        if (!value || value.trim() === '') return '';

        const cleaned = stripHtml(value).trim();

        // Block only single "%"
        if (cleaned === '%') return '';

        return cleaned;
      };

      const payload = {
        // Title: cleanOperationalGoal,
        OperationalGoal: isGlobalGoalLocked ? lockedOperationalGoal : cleanOperationalGoal,
        OperationalTactic: formData.OperationalTactic,
        PerformanceMeasure: formData.PerformanceMeasure || '',
        PerformanceMeasureResults: formData.PerformanceMeasureResults || '',
        ResultsMet: formData.ResultsMet || '',
        ContinuousImprovement: formData.ContinuousImprovement || '',
        FutureBudgetImpact: formData.FutureBudgetImpact || 'No',
        IfYesPleaseDescribe: formData.IfYesPleaseDescribe || '',
        StartDate: formData.StartDate || null,
        EndDate: formData.EndDate || null,
        Priority: formData.Priority,
        Target: formData.Target || '',
        // BudgetImpactDescription: formData.BudgetImpactDescription || '',
        OrganizationalGoalsId: Number(selScorecard.Id),
        DepartmentsId: Number(formData.DepartmentsId),
        SubDepartmentsId: Number(formData.SubDepartmentId) || null,
        SubSubDepartmentsId: formData.SubSubDepartmentId ? Number(formData.SubSubDepartmentId) : null,
        OrganizationGoalAlignmentId: formData.OrganizationGoalAlignment.map(Number),
        HLCAlignmentId: formData.HLCAlignment.map(Number),
        SharedServiceCampusGoalAlignmentId: formData.SharedServiceCampusGoalAlignment.map(Number),
        TagId: formData.TagId ? Number(formData.TagId) : null,
      };

      if (editingIEP) {
        if (isGlobalGoalLocked && cleanOperationalGoal !== lockedOperationalGoal) {
          toast.info('Operational Goal is locked for Global Goals. Other fields will be saved.');
        }
        await updateIEP("SharePoint", sp, editingIEP.Id, payload, departments);
        toast.success('Goal Updated successfully');
        // Store the IEP ID to keep it expanded after data refresh
        expandedIEPAfterUpdate.current = editingIEP.Id;
        localStorage.setItem('expandedIEPAfterUpdate', String(editingIEP.Id));
        setExpandedRows(prev => ({ ...prev, [editingIEP.Id]: true }));
        closeSidebar();
        // Call data refresh immediately - the useEffect will restore the expanded state
        onIEPCreated?.();
      } else {
        await createIEP("SharePoint", sp, payload, departments);
        toast.success('Goal Created successfully');
        closeSidebar();
        setTimeout(() => onIEPCreated?.(), 1000);
      }
    } catch (error: any) {
      console.error("Save Goal Error:", error);
      const is401 = String(error?.message || error).includes('401');
      if (is401) {
        window.location.reload();
        return;
      }
      toast.error(`Failed to save: ${error.message || 'An unexpected error occurred.'}`);
    }
  };

  // Mission save handler
  const handleSaveMission = async () => {
    const dept = getUserDepartment();
    if (!dept) {
      toast.warn('User department not found.');
      return;
    }
    if (!canEditDepartment(dept.Id)) {
      toast.warn('You do not have permission to update this department mission.');
      return;
    }
    if (missionSaving) return;
    if ((missionText ?? '').trim() === (dept.Mission ?? '').trim()) {
      setIsEditingMission(false);
      return;
    }

    setMissionSaving(true);
    try {
      // updateDepartment is already implemented in OrgnaizationAPI
      await updateDepartment("SharePoint", sp, dept.Id, { Mission: missionText });
      toast.success('Mission updated for your department');
      setIsEditingMission(false);
      // ask parent to refresh data
      setTimeout(() => onIEPCreated?.(), 500);
    } catch (err: any) {
      console.error("Failed updating mission:", err);
      toast.error(`Failed to update mission: ${err?.message || err}`);
    } finally {
      setMissionSaving(false);
    }
  };

  // Vision save handler
  const handleSaveVision = async () => {
    const dept = getUserDepartment();
    if (!dept) {
      toast.warn('User department not found.');
      return;
    }
    if (!canEditDepartment(dept.Id)) {
      toast.warn('You do not have permission to update this department vision.');
      return;
    }
    if (visionSaving) return;
    if ((visionText ?? '').trim() === (dept.Vision ?? '').trim()) {
      setIsEditingVision(false);
      return;
    }

    setVisionSaving(true);
    try {
      // updateDepartment should be implemented in your OrgnaizationAPI
      await updateDepartment("SharePoint", sp, dept.Id, { Vision: visionText });
      toast.success('Vision updated for your department');
      setIsEditingVision(false);
      // refresh parent data
      setTimeout(() => onIEPCreated?.(), 500);
    } catch (err: any) {
      console.error("Failed updating vision:", err);
      toast.error(`Failed to update vision: ${err?.message || err}`);
    } finally {
      setVisionSaving(false);
    }
  };

  // LeftText save handler
  const handleSaveLeftText = async () => {
    if (leftTextSaving) return;
    setLeftTextSaving(true);
    try {
      // Store in localStorage or update in SharePoint list
      localStorage.setItem('iep-leftText', leftText);
      toast.success('Left text updated successfully');
      setIsEditingLeftText(false);
    } catch (err: any) {
      console.error('Failed updating left text:', err);
      toast.error(`Failed to update left text: ${err?.message || err}`);
    } finally {
      setLeftTextSaving(false);
    }
  };

  // RightText save handler
  const handleSaveRightText = async () => {
    if (rightTextSaving) return;
    setRightTextSaving(true);
    try {
      // Store in localStorage or update in SharePoint list
      localStorage.setItem('iep-rightText', rightText);
      toast.success('Right text updated successfully');
      setIsEditingRightText(false);
    } catch (err: any) {
      console.error('Failed updating right text:', err);
      toast.error(`Failed to update right text: ${err?.message || err}`);
    } finally {
      setRightTextSaving(false);
    }
  };

  const handleSaveGlobalGoal = async () => {
    if (!selScorecard) return;
    if (!isProgramDirector) {
      toast.warn('Only Program Directors can edit Global Goals.');
      return;
    }
    if (globalGoalSaving) return;

    setGlobalGoalSaving(true);
    try {
      await updateOrganizationalGoal("SharePoint", sp, selScorecard.Id, { GlobalGoal: globalGoalText });
      toast.success('Global Goal updated successfully');
      setIsEditingGlobalGoal(false);
      onIEPCreated?.(); // Refresh data
    } catch (err: any) {
      console.error('Failed to update Global Goal:', err);
      toast.error(`Failed to update Global Goal: ${err?.message || err}`);
    } finally {
      setGlobalGoalSaving(false);
    }
  };

  const handleSort = (key: string | null) => {
    if (!key) return;
    setSortConfig(p => ({
      key,
      direction: p.key === key && p.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getAlignmentText = (arr: any[] | undefined, field: string) =>
    !arr?.length ? '' : stripHtml(arr[0][field] ?? '');

  // ──────────────────────────────────────────────────────────────
  // FILTERED / SORTED IEPS
  // ──────────────────────────────────────────────────────────────
  const ieps = useMemo(() => {
    let list = [...allIEPs];

    if (selectedScorecard) {
      const id = Number(selectedScorecard.replace('scorecard-', ''));
      list = list.filter(i => i.OrganizationalGoals?.Id === id);
    }
    if (selectedDepartment) {
      const id = Number(selectedDepartment.replace('dept-', ''));
      list = list.filter(i => i.Departments?.Id === id);
    }

    if (selectedIEP?.startsWith('subsub-')) {
      const parts = selectedIEP.replace('subsub-', '').split('-');
      const subId = Number(parts[0]);
      const ssId = Number(parts[1]);
      list = list.filter(i =>
        i.SubDepartments?.Id === subId && i.SubSubDepartments?.Id === ssId
      );
    } else if (selectedIEP?.startsWith('sub-')) {
      const id = Number(selectedIEP.replace('sub-', ''));
      list = list.filter(i => i.SubDepartments?.Id === id);
    }

    return list;
  }, [allIEPs, selectedScorecard, selectedDepartment, selectedIEP]);

  useEffect(() => {
    if (!selScorecard?.Id || !selectedDepartment || loading) return;

    const deptId = Number(selectedDepartment.replace('dept-', ''));
    if (!deptId || !canEditDepartment(deptId)) return;

    let subDeptId: number | null = null;
    let subSubDeptId: number | null = null;

    if (selectedIEP?.startsWith('subsub-')) {
      const parts = selectedIEP.replace('subsub-', '').split('-');
      subDeptId = Number(parts[0]);
      subSubDeptId = Number(parts[1]);
    } else if (selectedIEP?.startsWith('sub-')) {
      subDeptId = Number(selectedIEP.replace('sub-', ''));
    }

    const hasMatch = allIEPs.some((iep: any) => {
      if (iep.OrganizationalGoals?.Id !== selScorecard.Id) return false;
      if (iep.Departments?.Id !== deptId) return false;
      if (subDeptId && iep.SubDepartments?.Id !== subDeptId) return false;
      if (subSubDeptId && iep.SubSubDepartments?.Id !== subSubDeptId) return false;
      return true;
    });

    if (hasMatch) return;

    const key = `${selScorecard.Id}-${deptId}-${subDeptId ?? 'none'}-${subSubDeptId ?? 'none'}`;
    if (autoCreatedKeysRef.current.has(key)) return;
    autoCreatedKeysRef.current.add(key);

    const createDefaultIEP = async () => {
      try {
        const payload = {
          OperationalGoal: '',
          OperationalTactic: '',
          PerformanceMeasure: '',
          PerformanceMeasureResults: '',
          ResultsMet: '',
          ContinuousImprovement: '',
          FutureBudgetImpact: 'No',
          IfYesPleaseDescribe: '',
          StartDate: null,
          EndDate: null,
          Priority: 'Medium',
          Target: '',
          OrganizationalGoalsId: Number(selScorecard.Id),
          DepartmentsId: deptId,
          SubDepartmentsId: subDeptId || null,
          SubSubDepartmentsId: subSubDeptId || null,
          OrganizationGoalAlignmentId: [],
          HLCAlignmentId: [],
          SharedServiceCampusGoalAlignmentId: [],
          TagId: null,
        };

        await createIEP("SharePoint", sp, payload, departments);
        onIEPCreated?.();
      } catch (err: any) {
        autoCreatedKeysRef.current.delete(key);
        console.error('Failed to auto-create default IEP:', err);
        toast.error(`Failed to auto-create default goal: ${err?.message || err}`);
      }
    };

    createDefaultIEP();
  }, [selScorecard?.Id, selectedDepartment, selectedIEP, allIEPs, loading, sp, departments, onIEPCreated]);

  const filtered = ieps.filter((iep: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return [
      iep.OperationalGoal,
      iep.OperationalTactic,
      iep.PerformanceMeasure,
      iep.Target,
      iep.BudgetImpactDescription,
      getAlignmentText(iep.OrganizationGoalAlignment, 'Value'),
      getAlignmentText(iep.SharedServiceCampusGoalAlignment, 'ThreeYRSharedService'),
      getAlignmentText(iep.HLCAlignment, 'HLCAlignment'),
      iep.ResultsMet,
      iep.PerformanceMeasureResults,
      iep.ContinuousImprovement,
      iep.IfYesPleaseDescribe,
      iep.FutureBudgetImpact,
    ].some(t => t && stripHtml(t).toLowerCase().includes(q));
  });

  const getSortValue = (item: any, key: string | null) => {
    if (!key) return '';
    if (key === 'OrganizationGoalAlignment')
      return stripHtml(item.OrganizationGoalAlignment?.[0]?.Value ?? '').toLowerCase();
    if (key === 'SharedServiceCampusGoalAlignment')
      return stripHtml(item.SharedServiceCampusGoalAlignment?.[0]?.ThreeYRSharedService ?? '').toLowerCase();
    if (key === 'HLCAlignment')
      return stripHtml(item.HLCAlignment?.[0]?.HLCAlignment ?? '').toLowerCase();
    if (key === 'SubDepartment')
      return stripHtml(item.SubDepartments?.SubDepartmentName ?? item.Departments?.DepartmentName ?? '').toLowerCase();
    return stripHtml(item[key] ?? '').toLowerCase();
  };

  const sorted = [...filtered].sort((a: any, b: any) => {
    if (!sortConfig.key) return 0;
    const aVal = getSortValue(a, sortConfig.key);
    const bVal = getSortValue(b, sortConfig.key);
    return (aVal < bVal ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1);
  });

  const scorecardIEPs = useMemo(() => {
    if (!selScorecard?.Id) return [];
    return allIEPs.filter((iep: any) => iep.OrganizationalGoals?.Id === selScorecard.Id);
  }, [allIEPs, selScorecard?.Id]);

  // Enhanced orgGoalSummaryCards with better tag extraction

  const orgGoalSummaryCards = useMemo(() => {
    if (!scorecardIEPs.length) return [];
    const map = new Map<string, { id: string; label: string; records: any[] }>();

    const addRecord = (key: string, label: string, iep: any) => {
      if (!map.has(key)) {
        map.set(key, { id: key, label, records: [] });
      }
      map.get(key)!.records.push(iep);
    };

    scorecardIEPs.forEach((iep: any) => {
      const alignments = Array.isArray(iep.OrganizationGoalAlignment) ? iep.OrganizationGoalAlignment : [];

      if (!alignments.length) return;

      alignments.forEach((org: any) => {
        const label = stripHtml(org.Value || org.OrganizationalGoalAlignment || '');
        if (!isMeaningfulLabel(label)) return;
        const key = `org-${org.Id ?? label}`;
        addRecord(key, label, iep);
      });
    });

    return Array.from(map.values())
      .map(group => ({
        id: group.id,
        label: group.label,
        ...buildStatusSummary(group.records)
      }))
      .sort((a, b) => b.total - a.total); // Sort by total count descending
  }, [scorecardIEPs]);


  const executiveSummaryCards = useMemo(() => {
    if (!allIEPs.length) return [];
    const map = new Map<string, { id: string; label: string; records: any[] }>();

    const addRecord = (key: string, label: string, iep: any) => {
      if (!map.has(key)) {
        map.set(key, { id: key, label, records: [] });
      }
      map.get(key)!.records.push(iep);
    };

    allIEPs.forEach((iep: any) => {
      const rawLabel = iep.ExecutiveCabinet?.Title
        || iep.ExecutiveCabinet?.DepartmentName
        || '';
      const label = stripHtml(rawLabel);
      if (!isMeaningfulLabel(label)) return;

      const normalizedKey = label.toLowerCase().replace(/\s+/g, '-');
      const key = `ec-${normalizedKey || 'unassigned'}`;
      addRecord(key, label, iep);
    });

    return Array.from(map.values())
      .map(group => ({
        id: group.id,
        label: group.label,
        ...buildStatusSummary(group.records)
      }))
      .sort((a, b) => b.total - a.total); // Sort by total count descending
  }, [allIEPs]);

  console.log(executiveSummaryCards, 'executiveSummaryCards');


  const showFiltered = selectedScorecard || selectedDepartment || selectedIEP;

  // ──────────────────────────────────────────────────────────────
  // DEPARTMENT CARDS (with sub-sub)
  // ──────────────────────────────────────────────────────────────
  if (
    selScorecard &&
    !selDept &&
    !selIEP &&
    !showCharts &&
    !showOperationalGoalsList &&
    !showDistrictCharts
  ) {
    const deptMap = new Map<number, { dept: any; count: number; ieps: any[] }>();
    allIEPs.forEach((i: any) => {
      if (i.OrganizationalGoals?.Id === selScorecard.Id && i.Departments?.Id) {
        const dId = i.Departments.Id;
        if (!deptMap.has(dId)) {
          const d = departments.find((x: any) => x.Id === dId);
          deptMap.set(dId, { dept: d, count: 0, ieps: [] });
        }
        const rec = deptMap.get(dId)!;
        rec.count++;
        rec.ieps.push(i);
      }
    });

    const deptList = Array.from(deptMap.values()).sort((a, b) =>
      (a.dept?.DepartmentName || '').localeCompare(b.dept?.DepartmentName || '')
    );

    const renderIepNestedList = (iepsForDept, dept) => {
      if (!iepsForDept?.length) return null;

      const subMap = new Map<string, any[]>();
      iepsForDept.forEach(iep => {
        const subName = iep.SubDepartments?.SubDepartmentName?.trim() || '';
        if (!subMap.has(subName)) subMap.set(subName, []);
        subMap.get(subName)!.push(iep);
      });

      // Sort sub-departments alphabetically
      const sortedSubEntries = Array.from(subMap.entries()).sort((a, b) => {
        const nameA = a[0].toLowerCase();
        const nameB = b[0].toLowerCase();
        return nameA.localeCompare(nameB);
      });

      return (
        <ul className="mb-0" style={{ paddingLeft: '1rem' }}>
          {sortedSubEntries.map(([subName, iepsInSub]) => {
            if (subName === '') return null;
            const subDeptId = iepsInSub[0]?.SubDepartments?.Id;
            if (!subDeptId) return null;

            const ssMap = new Map<string, any[]>();
            iepsInSub.forEach((iep: any) => {
              const ssName = iep.SubSubDepartments?.SubSubDepartmentName?.trim() || '';
              if (!ssMap.has(ssName)) ssMap.set(ssName, []);
              ssMap.get(ssName)!.push(iep);
            });

            return (
              <li
                key={subName}
                className="mt-2"
                style={{ cursor: 'pointer' }}
                onClick={() => handleIEPClick(selectedScorecard, `dept-${dept.Id}`, `sub-${subDeptId}`, subName)}
              >
                <strong
                  style={{
                    color: '#337ab7',
                    fontWeight: '500',
                    fontSize: isMobile ? '12px' : '14px',
                  }}
                >
                  {subName}
                </strong>
              </li>
            );
          })}
        </ul>
      );
    };

    return (
      <div className="container-fluid pbbbb bg-light">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h1 className={`${isMobile ? 'h4' : 'h2'} text-dark mb-0`}>
            {selScorecard?.ScorecardName}
            <small className="text-muted ms-2"> - {selScorecard?.Year}</small>
          </h1>
          <button
            type="button"
            className={`btn btn-primary ${isMobile ? 'btn-xs' : 'btn-sm'}`}
            onClick={openNewGoal}
          >
            + {isMobile ? 'New Operational Goal' : 'New Operational Goal'}
          </button>
        </div>

        <div className="row g-3">
          <div className={isMobile ? 'col-12' : 'col-12 col-md-6 col-lg-4'}>
            <div className="card h-100 shadow-sm">
              <div style={{ backgroundColor: 'rgb(11, 79, 134)', color: 'white', borderTopLeftRadius: '0.25rem', borderTopRightRadius: '0.25rem' }}>
                <div style={{ fontWeight: 700, padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem', fontSize: isMobile ? '0.875rem' : '1rem' }}>
                  District-Wide
                </div>
                <div style={{ height: 6, background: '#f2b21b', marginTop: 8 }}></div>
              </div>
              <div className="card-body">
                <div className="d-flex flex-column gap-2" style={{ height: '260px' }}>
                  <a
                    style={{ color: '#337ab7', fontWeight: '500', fontSize: isMobile ? "12px" : "14px", cursor: 'pointer' }}
                    onClick={() => openDistrictSummary('tag')}
                  >
                    Summary Dashboard by Organizational Goal
                  </a>
                  <a
                    style={{ color: '#337ab7', fontWeight: '500', fontSize: isMobile ? "12px" : "14px", cursor: 'pointer' }}
                    onClick={() => openDistrictSummary('executiveCabinet')}
                  >
                    Summary Dashboard by Executive Cabinet Jurisdiction (ECJ)
                  </a>
                  <a
                    style={{ color: '#337ab7', fontWeight: '500', fontSize: isMobile ? "12px" : "14px", cursor: 'pointer' }}
                    onClick={() => {
                      setShowOperationalGoalsList(true);
                      setChartDeptId(null); // ensures district-wide list
                      setShowCharts(false);
                      setShowDistrictCharts(false);
                    }}
                  >
                    Operational Goal List by Organizational Goal
                  </a>
                </div>

              </div>
              <div className="card-footer" style={{ background: 'transparent', border: 'none' }}>
                <div className="">
                  <span className="badge bg-primary">
                    {allIEPs.filter(i => i.OrganizationalGoals?.Id === selScorecard?.Id).length} Goals
                  </span>
                </div>
              </div>
            </div>
          </div>

          {deptList.length === 0 ? (
            <div className="col-12">
              <div className="alert alert-info">No departments found for this scorecard.</div>
            </div>
          ) : deptList.map(({ dept, count, ieps: iepsForDept }) => (
            <div key={dept.Id} className={isMobile ? 'col-12' : 'col-12 col-md-6 col-lg-4'}>
              <div className="card h-100 shadow-sm">
                <div style={{ backgroundColor: '#0b4f86', color: 'white', borderTopLeftRadius: '0.25rem', borderTopRightRadius: '0.25rem' }}>
                  <div style={{ fontWeight: 700, padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem', fontSize: isMobile ? '0.875rem' : '1rem' }}>
                    {dept.DepartmentName || dept.Title}
                  </div>
                  <div style={{ height: 6, background: '#f2b21b', marginTop: 8 }}></div>
                </div>

                <div className="card-body">
                  <div className="d-flex flex-column gap-2" style={{ height: '260px' }}>
                    <a
                      style={{ color: '#337ab7', fontWeight: '500', fontSize: isMobile ? "12px" : "14px", cursor: 'pointer' }}
                      onClick={() => {
                        setChartDeptId(dept.Id);
                        setChartMode('subDepartment');
                        setShowCharts(true);
                      }}
                    >
                      Summary Dashboard by District Offices' Planning Units
                    </a>

                    <a
                      style={{ color: '#337ab7', fontWeight: '500', fontSize: isMobile ? "12px" : "14px", cursor: 'pointer' }}
                      onClick={() => {
                        setChartDeptId(dept.Id);
                        setChartMode('tag');
                        setShowCharts(true);
                      }}
                    >
                      Summary Dashboard by Organizational Goal ({dept.DepartmentName})
                    </a>

                    <a
                      style={{ color: '#337ab7', fontWeight: '500', fontSize: isMobile ? "12px" : "14px", cursor: 'pointer' }}
                      onClick={() => {
                        setShowCharts(false);
                        setShowDistrictCharts(false);
                        setShowOperationalGoalsList(true);
                        setChartDeptId(dept.Id);
                      }}
                    >
                      Operational Goal List by Organizational Goal
                    </a>
                    <div style={{ marginTop: '0.5rem', maxHeight: isMobile ? "200px" : "250px", overflowY: 'auto' }}>
                      <ul className="mb-0" style={{ paddingLeft: '1rem' }}>
                        <li>
                          <strong
                            style={{ color: '#337ab7', fontWeight: '500', fontSize: isMobile ? "12px" : "14px", cursor: 'pointer' }}
                            onClick={() => onSelectDepartment?.(`dept-${dept.Id}`)}
                          >
                            {dept.DepartmentName || dept.DepartmentName}
                          </strong>
                        </li>
                        {renderIepNestedList(iepsForDept, dept)}
                      </ul>
                    </div>
                  </div>

                </div>
                <div className="card-footer" style={{ background: 'transparent', border: 'none' }}>

                  <div className="d-flex align-items-center justify-content-between">
                    <span className="badge bg-primary">{count} Goal{count !== 1 ? 's' : ''}</span>
                    <button
                      type="button"
                      className={`btn ${isMobile ? 'btn-xs' : 'btn-sm'} btn-outline-primary`}
                      onClick={() => onSelectDepartment?.(`dept-${dept.Id}`)}
                      style={{
                        height: '22px',
                        padding: '0',
                        minWidth: '1rem',
                        width: '50px'
                      }}
                    >
                      More
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showSidebar && (
          <IEPSidebarForm
            selScorecard={selScorecard}
            formData={formData}
            setFormData={setFormData}
            editingIEP={editingIEP}
            isOperationalGoalLocked={!!(editingIEP?.IsGlobalGoal && isPlanningUnitManager)}
            departments={departments}
            organizationalScorecards={organizationalScorecards}
            orgGoalOptions={orgGoalOptions}
            threeYrOptions={threeYrOptions}
            hlcOptions={hlcOptions}
            tagOptions={tagOptions}
            subDepartments={subDepartments}
            subSubDepartments={subSubDepartments}
            selectedSubDeptId={selectedSubDeptId}
            setSelectedSubDeptId={setSelectedSubDeptId}
            selectedSubSubDeptId={selectedSubSubDeptId}
            setSelectedSubSubDeptId={setSelectedSubSubDeptId}
            onSubmit={handleSave}
            onClose={closeSidebar}
            userRole={userRole}
          />
        )}

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    );
  }

  // Rest of the component continues with existing code...
  // All remaining render methods (OPERATIONAL GOALS LIST VIEW, CHARTS, etc.) remain unchanged

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!selScorecard && !selectedDepartment && !selectedIEP) {
    return <NoSelectionView stats={stats} organizationalScorecards={organizationalScorecards} />;
  }

  if (!showFiltered) {
    return <NoSelectionView stats={stats} organizationalScorecards={organizationalScorecards} />;
  }

  // ──────────────────────────────────────────────────────────────
  // OPERATIONAL GOALS LIST VIEW
  // ──────────────────────────────────────────────────────────────
  if (showOperationalGoalsList) {
    const listIEPs = chartDeptId
      ? allIEPs.filter(
        (x: any) =>
          x.Departments?.Id === chartDeptId &&
          x.OrganizationalGoals?.Id === selScorecard?.Id
      )
      : allIEPs.filter((x: any) => x.OrganizationalGoals?.Id === selScorecard?.Id);
    const districtMode = !chartDeptId;

    return (
      <OperationalGoalsList
        selectedDepartment={selectedDepartment}
        selectedScorecard={selectedScorecard}
        selectedIEP={selectedIEP}
        ieps={listIEPs}
        stats={stats}
        loading={loading}
        departments={departments}
        organizationalScorecards={organizationalScorecards}
        allIEPs={listIEPs}
        sp={sp}
        currentUser={currentUser}
        usersList={usersList}
        onIEPCreated={onIEPCreated}
        onSelectDepartment={onSelectDepartment}
        isMobile={isMobile}
        isTablet={isTablet}
        userRole={userRole}
        handleIEPClick={handleIEPClick}
        searchTerm={searchQuery}
        chartDeptId={chartDeptId}
        onSearchChange={setSearchQuery}
        onBack={() => {
          setShowOperationalGoalsList(false);
          setSearchQuery('');
        }}
        districtMode={districtMode}
        onEditIEP={openEditGoal}
      />
    );
  }

  // ──────────────────────────────────────────────────────────────
  // CHARTS
  // ──────────────────────────────────────────────────────────────
  if (showCharts && chartDeptId) {
    const dept = departments.find((d: any) => d.Id === chartDeptId);
    const deptIeps = allIEPs.filter((i: any) =>
      i.Departments?.Id === chartDeptId && i.OrganizationalGoals?.Id === selScorecard.Id
    );
    return (
      <ChartsView
        ieps={deptIeps}
        titlePrefix={
          chartMode === 'tag'
            ? `Summary Dashboard by Organizational Goal – ${dept?.DepartmentName}`
            : chartMode === 'executiveCabinet'
              ? `Summary Dashboard by Executive Cabinet Jurisdiction (ECJ) – ${dept?.DepartmentName}`
              : `Summary Dashboard by District Offices' Planning Units – ${dept?.DepartmentName}`
        }
        breakdownMode={chartMode}
        onBack={() => {
          setShowCharts(false);
          setChartDeptId(null);
          setChartMode('subDepartment');
        }}
      />
    );
  }

  if (showDistrictCharts) {
    const districtIeps = allIEPs.filter(i => i.OrganizationalGoals?.Id === selScorecard?.Id);
    return (
      <ChartsView
        ieps={districtIeps}
        titlePrefix={
          districtChartMode === 'tag'
            ? "Summary Dashboard by Organizational Goal – District-Wide"
            : "Summary Dashboard by Executive Cabinet Jurisdiction (ECJ) – District-Wide"
        }
        breakdownMode={districtChartMode}
        onBack={() => setShowDistrictCharts(false)}
      />
    );
  }

  // ──────────────────────────────────────────────────────────────
  // DETAIL VIEW
  // ──────────────────────────────────────────────────────────────
  const handleExportIEPTable = async () => {
    if (!sorted.length) {
      toast.info('There are no Goal records to export yet.');
      return;
    }
    const containerEl = exportContainerRef.current;
    if (!containerEl) {
      toast.error('Unable to locate the scorecard view. Please try again.');
      return;
    }
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      toast.error('PDF export is only available in the browser.');
      return;
    }

    const prevExpandedRows = { ...expandedRows };
    const pxToPt = (px: number) => (px / 96) * 72;
    const containerWidth = Math.max(
      document.documentElement.scrollWidth,
      containerEl.scrollWidth || 0,
      containerEl.clientWidth || 0,
    );
    const containerHeight = Math.max(
      document.documentElement.scrollHeight,
      containerEl.scrollHeight || 0,
      containerEl.clientHeight || 0,
    );
    const dynamicPageWidth = pxToPt(containerWidth + 32); // include left/right margins
    const dynamicPageHeight = pxToPt(containerHeight + 32); // include top/bottom margins
    const expandedForExport = sorted.reduce((acc: Record<string, boolean>, iep: any) => {
      acc[iep.Id] = true;
      return acc;
    }, {});

    try {
      setIsExportingPdf(true);
      setExpandedRows(expandedForExport);

      // allow layout to update with expanded rows and export styles
      await new Promise(resolve => setTimeout(resolve, 150));

      const html2pdfModule = (await import('html2pdf.js')) as any;
      const html2pdfInstance = html2pdfModule?.default ?? html2pdfModule;
      const sanitizeForFilename = (value?: string) =>
        (value ?? '')
          .toString()
          .trim()
          .replace(/[\\/:*?"<>|]/g, '')
          .replace(/\s+/g, '-');

      const filenameParts = [
        sanitizeForFilename(selScorecard?.ScorecardName),
        sanitizeForFilename(selDeptShortName),
        sanitizeForFilename(selScorecard?.Year),
      ].filter(Boolean);

      await html2pdfInstance()
        .set({
          margin: [20, 16, 20, 16],
          filename: `Goal-scorecard-${filenameParts.join('-') || 'export'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: window.devicePixelRatio > 1 ? window.devicePixelRatio : 2,
            useCORS: true,
            scrollY: 0,
            backgroundColor: '#ffffff',
            windowWidth: containerWidth,
            windowHeight: containerHeight,
          },
          pagebreak: { mode: ['css', 'legacy'], avoid: ['.pdf-avoid-break', '.card'] },
          jsPDF: {
            unit: 'pt',
            format: [dynamicPageWidth, dynamicPageHeight],
            orientation: containerWidth >= containerHeight ? 'landscape' : 'portrait',
          },
        })
        .from(containerEl)
        .save();
    } catch (error) {
      console.error('Scorecard PDF export failed', error);
      toast.error('Unable to export the scorecard view right now.');
    } finally {
      setExpandedRows(prevExpandedRows);
      setIsExportingPdf(false);
    }
  };

  const handleExportToExcel = () => {
    if (!sorted.length) {
      toast.info('There are no Goal records to export yet.');
      return;
    }

    try {
      // Prepare data for Excel export
      const excelData = sorted.map((iep: any) => {
        const getAlignmentText = (arr: any[], field: string) => {
          if (!arr?.length) return '';
          return arr.map((item: any) => stripHtml(item[field] ?? '')).join('; ');
        };

        return {
          'Operational Goal': stripHtml(iep.OperationalGoal || ''),
          'Department': iep.Departments?.DepartmentName || '',
          'Sub-Department': iep.SubDepartments?.SubDepartmentName || '',
          'Organizational Goal Alignment': getAlignmentText(iep.OrganizationGoalAlignment, 'Value'),
          '3-YR Shared Service Goal': getAlignmentText(iep.SharedServiceCampusGoalAlignment, 'ThreeYRSharedService'),
          'HLC Criteria': getAlignmentText(iep.HLCAlignment, 'HLCAlignment'),
          'Operational Tactic': stripHtml(iep.OperationalTactic || ''),
          'Performance Measure': stripHtml(iep.PerformanceMeasure || ''),
          'Target': stripHtml(iep.Target || ''),
          // 'Budget Impact Description': stripHtml(iep.BudgetImpactDescription || ''),
          'Performance Measure Results': stripHtml(iep.PerformanceMeasureResults || ''),
          'Continuous Improvement': stripHtml(iep.ContinuousImprovement || ''),
          'Results Met': iep.ResultsMet || '',
          'Future Budget Impact': iep.FutureBudgetImpact ? 'Yes' : 'No',
          'Describe future budget impact': stripHtml(iep.IfYesPleaseDescribe || ''),
          'Priority': iep.Priority || '',
          'Start Date': iep.StartDate ? new Date(iep.StartDate).toLocaleDateString() : '',
          'End Date': iep.EndDate ? new Date(iep.EndDate).toLocaleDateString() : '',
        };
      });

      // Convert to CSV format with proper encoding
      const headers = Object.keys(excelData[0]);

      // Create CSV rows
      const csvRows = [
        headers.join(','), // Header row
        ...excelData.map(row =>
          headers.map(header => {
            const value = String(row[header] || '');
            // Replace newlines with spaces and escape quotes
            const cleaned = value.replace(/\r?\n|\r/g, ' ').replace(/"/g, '""');
            return `"${cleaned}"`;
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');

      // Add BOM for proper UTF-8 encoding in Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      const sanitizeForFilename = (value?: string) =>
        (value ?? '')
          .toString()
          .trim()
          .replace(/[\\/:*?"<>|]/g, '')
          .replace(/\s+/g, '-');

      const filenameParts = [
        'Goal-Table',
        sanitizeForFilename(selScorecard?.ScorecardName),
        sanitizeForFilename(selDeptShortName),
        sanitizeForFilename(selScorecard?.Year),
      ].filter(Boolean);

      link.href = url;
      link.download = `${filenameParts.join('-') || 'Goal-export'}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Table exported to Excel successfully!');
    } catch (error) {
      console.error('Excel export failed', error);
      toast.error('Failed to export table to Excel.');
    }
  };

  // ──────────────────────────────────────────────────────────────
  // MAIN RENDER (Table or Detail)
  // ──────────────────────────────────────────────────────────────
  return (
    <div
      ref={exportContainerRef}
      className={`container-fluid pbbbb bg-light${isExportingPdf ? ' pdf-exporting' : ''}`}
    >
      <style>{`
        @media (max-width: 992px) {
          .scorecard-header { flex-direction: column !important; text-align: center !important; align-items: center !important; }
          .scorecard-header img { width: 80% !important; height: auto !important; }
          .btn-sm { padding: 5px 10px !important; font-size: 0.85rem !important; }
          .card-body { padding: 0.75rem !important; }
          .d-flex.justify-content-between { flex-wrap: wrap !important; }
        }
        @media (max-width: 576px) {
          .card-title { font-size: 1rem !important; }
          h1, h2, h3 { font-size: 1.1rem !important; }
          .card { margin-bottom: 1rem !important; }
        }
      `}</style>
      {isExportingPdf && (
        <style>{`
          .pdf-exporting .card,
          .pdf-exporting .card-body,
          .pdf-exporting .table-responsive,
          .pdf-exporting table,
          .pdf-exporting tr,
          .pdf-exporting .pdf-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .pdf-exporting .pdf-force-break {
            page-break-after: always !important;
            break-after: page !important;
          }
          .pdf-exporting .definitions-page-break {
            page-break-before: always !important;
            break-before: page !important;
          }
        `}</style>
      )}

      <div className="d-flex justify-content-center">
        {
          !selectedIEPDetail ? (<div
            style={{
              width: '100%',
              maxWidth: isMobile ? '320px' : '520px',
              padding: isMobile ? '0 16px' : '0 24px',
            }}
          >

            <img
              src={mainlogo}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
            />

          </div>) : (
            <div
              style={{
                width: '100%',
                maxWidth: isMobile ? '320px' : '200px',
                padding: isMobile ? '0 16px' : '0',
              }}
            >

              <img
                src={mediaImageDetails}
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />

            </div>)
        }

      </div>

      {!selectedIEPDetail ? (
        <>
          {selScorecard && selectedDepartment && (
            <div className=" py-4">
              <div className="row justify-content-center">
                <div className="col-lg-12 col-xxl-12">

                  {/* Glassmorphism Card - Pure Bootstrap */}
                  <div
                    className="card border-0 shadow-md rounded-4 "
                    style={{
                      background: "rgba(255, 255, 255, 0.75)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)"
                    }}
                  >
                    <div className="card-body p-5 p-md-8">

                      {!selectedIEP ? (
                        <div className="row g-5 align-items-start">

                          {/* Left Column - Mission + Academic Year */}
                          <div className="col-md-6">
                            <div className="d-flex gap-3 mb-5">
                              <div className="flex-shrink-0">
                                <div className="bg-primary rounded-pill" style={{ width: "6px", height: "60px" }}></div>
                              </div>
                              <div>
                                <div className="d-flex align-items-start justify-content-between">
                                  <div>
                                    <h5 className="fw-semibold text-dark mb-2">Mission</h5>
                                  </div>

                                  {/* Mission edit controls - only Program Directors can edit */}
                                  <div>
                                    {isEditingMission ? (
                                      <>
                                        <button type='button' className=" me-2" onClick={() => { setIsEditingMission(false); setMissionText(userDeptMission ?? ''); }} disabled={missionSaving}
                                          style={{ minWidth: '1px' }}>X</button>
                                        <button
                                          type="button"
                                          className=""
                                          onClick={handleSaveMission}
                                          disabled={missionSaving}
                                          style={{ minWidth: '1px' }}>
                                          {missionSaving ? 'Saving...' : <Check size={16} />}
                                        </button>
                                      </>
                                    ) : (
                                      isProgramDirector && (
                                        <button type='button' className="" onClick={() => setIsEditingMission(true)}
                                          style={{ minWidth: '1px' }}>
                                          <PencilLine size={16} />
                                        </button>
                                      )
                                    )}
                                  </div>
                                </div>

                                {isEditingMission ? (
                                  <ReactQuill
                                    theme="snow"
                                    value={missionText}
                                    onChange={(value) => setMissionText(value)}
                                    className="mt-2"
                                    style={{ background: "#fff", borderRadius: "8px" }}
                                  />
                                ) : (
                                  <p className="text-muted lh-lg mt-2">
                                    <span dangerouslySetInnerHTML={{ __html: userDeptMission || "" }} />
                                  </p>
                                )}
                              </div>
                            </div>

                          </div>

                          {/* Right Column - Vision + Button */}
                          <div className="col-md-6">
                            <div className="d-flex gap-3 mb-5">
                              <div className="flex-shrink-0">
                                <div className="bg-primary rounded-pill" style={{ width: "6px", height: "60px" }}></div>
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-start justify-content-between">
                                  <div>
                                    <h5 className="fw-semibold text-dark mb-2">Vision</h5>
                                  </div>
                                  <div>
                                    {/* allow editing vision only for Program Directors */}
                                    {isEditingVision ? (
                                      <>
                                        <button
                                          type='button'
                                          className="me-2"
                                          onClick={() => { setIsEditingVision(false); setVisionText(userDeptVision ?? ''); }}
                                          disabled={visionSaving}
                                          style={{ minWidth: '1px' }}
                                        >
                                          X
                                        </button>
                                        <button
                                          type="button"
                                          className=""
                                          onClick={handleSaveVision}
                                          disabled={visionSaving}
                                          style={{ minWidth: '1px' }}
                                        >
                                          {visionSaving ? 'Saving...' : <Check size={16} />}
                                        </button>
                                      </>
                                    ) : (
                                      isProgramDirector && (
                                        <button
                                          type='button'
                                          className=""
                                          onClick={() => setIsEditingVision(true)}
                                          style={{ minWidth: '1px' }}
                                        >
                                          <PencilLine size={16} />
                                        </button>
                                      )
                                    )}
                                  </div>
                                </div>

                                {isEditingVision ? (
                                  <ReactQuill
                                    theme="snow"
                                    value={visionText}
                                    onChange={(value) => setVisionText(value)}
                                    className="mt-2"
                                    style={{ background: "#fff", borderRadius: "8px" }}
                                  />
                                ) : (
                                  <p className="text-muted lh-lg mt-2">
                                    <span dangerouslySetInnerHTML={{ __html: userDeptVision || "" }} />
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="row g-3 align-items-center">
                          <div className="col-md-6">
                            <div className="d-flex gap-3">
                              <div className="flex-shrink-0">
                                <div className="bg-primary rounded-pill" style={{ width: "6px", height: "60px" }}></div>
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-start justify-content-between">
                                  <div>
                                    <h5 className="fw-semibold text-dark mb-2">Blue boxes in June</h5>
                                  </div>
                                  {isProgramDirector && (
                                    <div>
                                      {isEditingLeftText ? (
                                        <>
                                          <button type='button' className="me-2" onClick={() => { setIsEditingLeftText(false); setLeftText(localStorage.getItem('iep-leftText') || 'To open the annual IEP cycle, PUMs fill out the blue boxes in June.'); }} disabled={leftTextSaving}
                                            style={{ minWidth: '1px' }}>X</button>
                                          <button
                                            type="button"
                                            className=""
                                            onClick={handleSaveLeftText}
                                            disabled={leftTextSaving}
                                            style={{ minWidth: '1px' }}>
                                            {leftTextSaving ? 'Saving...' : <Check size={16} />}
                                          </button>
                                        </>
                                      ) : (
                                        <button type='button' className="" onClick={() => setIsEditingLeftText(true)}
                                          style={{ minWidth: '1px' }}>
                                          <PencilLine size={16} />
                                        </button>
                                      )}

                                    </div>

                                  )}
                                </div>
                                {isEditingLeftText ? (
                                  <ReactQuill
                                    value={leftText}
                                    onChange={(v) => setLeftText(v)}
                                    theme="snow"
                                    modules={quillModules}
                                    formats={quillFormats}
                                    style={{ borderRadius: "8px" }}
                                  />
                                ) : (
                                  <p className="text-muted lh-lg mt-2">
                                    <span dangerouslySetInnerHTML={{ __html: leftText || "" }} />
                                  </p>
                                )}
                              </div>


                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="d-flex gap-3">
                              <div className="flex-shrink-0">
                                <div className="bg-primary rounded-pill" style={{ width: "6px", height: "60px" }}></div>
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-start justify-content-between">
                                  <div>
                                    <h5 className="fw-semibold text-dark mb-2">Yellow boxes in May</h5>
                                  </div>
                                  {isProgramDirector && (
                                    <div>
                                      {isEditingRightText ? (
                                        <>
                                          <button type='button' className="me-2" onClick={() => { setIsEditingRightText(false); setRightText(localStorage.getItem('iep-rightText') || 'To close the annual Goal Cycle, PUMs fill out the yellow boxes in May.'); }} disabled={rightTextSaving}
                                            style={{ minWidth: '1px' }}>X</button>
                                          <button
                                            type="button"
                                            className=""
                                            onClick={handleSaveRightText}
                                            disabled={rightTextSaving}
                                            style={{ minWidth: '1px' }}>
                                            {rightTextSaving ? 'Saving...' : <Check size={16} />}
                                          </button>
                                        </>
                                      ) : (
                                        <button type='button' className="" onClick={() => setIsEditingRightText(true)}
                                          style={{ minWidth: '1px' }}>
                                          <PencilLine size={16} />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {isEditingRightText ? (
                                  <ReactQuill
                                    value={rightText}
                                    onChange={(v) => setRightText(v)}
                                    theme="snow"
                                    modules={quillModules}
                                    formats={quillFormats}
                                    style={{ borderRadius: "8px" }}
                                  />
                                ) : (
                                  <p className="text-muted lh-lg mt-2">
                                    <span dangerouslySetInnerHTML={{ __html: rightText || "" }} />
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Flex Row - Academic Year, Global Goal, and New Button */}
                      {!selectedIEP && (
                        <div className="d-flex flex-column flex-lg-row align-items-start gap-4 p-4 rounded-4" style={{ background: "rgba(11, 79, 134, 0.05)", borderLeft: "5px solid #0b4f86" }}>
                          {/* Academic Year */}
                          <div className="flex-shrink-0" style={{ minWidth: '140px' }}>
                            <span className="text-secondary text-uppercase small tracking-wider fw-bold">Academic Year</span>
                            <h5 className="fw-bold text-primary mt-1 mb-0">
                              {selScorecard.Year}
                            </h5>
                          </div>

                          {/* New Operational Goal Button */}
                          {!isIEPEmployee && (
                            <div className="flex-shrink-0 ms-lg-auto align-self-lg-center">
                              <button
                                type="button"
                                className="btn btn-primary rounded-pill px-4 shadow-sm"
                                onClick={openNewGoal}
                                disabled={!canEditDepartment(selDept?.Id ?? userDeptId)}
                                style={{
                                  background: "linear-gradient(135deg, #0b4f86 0%, #003366 100%)",
                                  border: "none",
                                  fontWeight: '600'
                                }}
                              >
                                + New Operational Goal
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Fallback button if IEP is selected (since the flex row above only shows when !selectedIEP) */}
                      {selectedIEP && !isIEPEmployee && (
                        <div className="text-md-end mt-4">
                          <button
                            type="button"
                            className="btn btn-primary rounded-pill px-4 shadow-sm"
                            onClick={openNewGoal}
                            disabled={!canEditDepartment(selDept?.Id ?? userDeptId)}
                            style={{
                              background: "linear-gradient(135deg, #0b4f86 0%, #003366 100%)",
                              border: "none",
                              fontWeight: '600'
                            }}
                          >
                            + New Operational Goal
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* {orgGoalSummaryCards.length > 0 && (
            <section className="mb-5">
              <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between mb-4">
                <div>
                  <h4 className="mb-1 text-dark fw-bold">Summary Dashboard by Organizational Goal</h4>
                  <small className="text-muted">
                    IEP Result Met status grouped by Organizational Goal Alignment
                  </small>
                </div>
                <div className="text-md-end mt-2 mt-md-0">
                  <span className="badge bg-primary px-3 py-2">
                    {scorecardIEPs.length} Total IEPs
                  </span>
                </div>
              </div>
              <div className="row g-4">
                {orgGoalSummaryCards.map(card => (
                  <div key={card.id} className="col-12 col-md-6 col-xl-4">
                    <DonutChart
                      title={`${card.label}`}
                      data={card.chartData}
                      height={320}
                      footer={renderSummaryFooter(card.id, card.breakdown, card.total)}
                    />
                  </div>
                ))}
              </div>
            </section>
          )} */}

          {
            executiveSummaryCards.length > 0 && (
              <section className="mb-5">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between mb-4">
                  <div>
                    <h4 className="mb-1 text-dark fw-bold">
                      Summary Dashboard by Executive Cabinet Jurisdiction (ECJ)
                    </h4>
                    <small className="text-muted">
                      District-wide Result Met distribution by ECJ department
                    </small>
                  </div>
                  <div className="text-md-end mt-2 mt-md-0">
                    <span className="badge bg-info px-3 py-2">
                      {allIEPs.length} Total Goals
                    </span>
                  </div>
                </div>
                <div className="row g-4">
                  {executiveSummaryCards.map(card => (
                    <div key={card.id} className="col-12 col-md-6 col-xl-4">
                      <DonutChart
                        title={`${card.label}`}
                        data={card.chartData}
                        height={320}
                        footer={renderSummaryFooter(card.id, card.breakdown, card.total)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )
          }

          {
            selIEP ? (
              <IEPDetailsView iep={selIEP} onEdit={openEditGoal} sp={sp} currentUser={currentUser} userRole={userRole} />
            ) : (
              <>
                <div ref={tableSectionRef}>
                  <IEPTable
                    ieps={sorted}
                    columns={columns}
                    searchQuery={searchQuery}
                    sortConfig={sortConfig}
                    expandedRows={expandedRows}
                    onToggleRow={id => setExpandedRows(p => ({ ...p, [id]: !p[id] }))}
                    onSort={handleSort}
                    onToggleColumn={key => setColumns(p => ({ ...p, [key]: { ...p[key], visible: !p[key].visible } }))}
                    onRowClick={handleRowClick}
                    departmentShortName={selDeptShortName}
                    Reimagined={Reimagined}
                    onSearch={setSearchQuery}
                    isMobile={isMobile}
                    isTablet={isTablet}
                    exportMode={isExportingPdf}
                    onExportPdf={handleExportIEPTable}
                    onExportExcel={handleExportToExcel}
                    isExportingPdf={isExportingPdf}
                    onEditIEP={openEditGoal}
                    onViewIEP={handleRowClick}
                    onDeleteIEP={handleDeleteIEP}
                    canEditIEP={canEditIEP}
                    canDeleteIEP={canEditIEP}
                    selScorecard={selScorecard}
                  />
                </div>
                {/* Budget Impact Static Text */}
                <div className="row justify-content-center mt-4">
                  <div className="col-lg-12 col-xxl-12">
                    <div className="alert alert-info" style={{
                      background: "rgba(13, 110, 253, 0.1)",
                      border: "1px solid rgba(13, 110, 253, 0.2)",
                      borderRadius: "12px",
                      padding: "1.5rem"
                    }}>
                      <h6 className="text-dark mb-2"> * Budget Impact Information</h6>
                      <p className="text-dark mb-0" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                        Total budget impact based on continuous improvement learnings for future initiatives to support performance improvement.<br />
                        Provide a dollar amount and explanation of your course of action.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )
          }
        </>
      ) : (
        <>
          <div
            className="d-flex"
            style={{
              margin: '20px 14px',
              width: isMobile ? '100%' : '98.4%',
              justifyContent: 'space-between',
              flexDirection: isMobile ? 'column' : 'row'
            }}
          >
            <button
              type="button"
              className={`btn btn-outline-secondary ${isMobile ? 'btn-sm mb-2' : 'btn-sm mb-3'}`}
              onClick={handleBackToTable}
            >
              Back to Table
            </button>

            {!isIEPEmployee && (
              <button
                type="button"
                className={`btn ${isMobile ? 'btn-sm' : 'btn-sm'} btn-primary`}
                onClick={() => openEditGoal(selectedIEPDetail)}
                disabled={!canEditIEP(selectedIEPDetail)}
              >
                Edit
              </button>
            )}
          </div>

          <div className="p-3">
            <p
              className={`text-dark ${isMobile ? 'small' : ''}`}
              style={{ textTransform: 'capitalize', fontWeight: 600, color: 'blueviolet' }}
            >
              {stripHtml(selectedIEPDetail.OperationalGoal || 'Goal Details')}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {selectedIEPDetail.OrganizationGoalAlignment.map((x, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e0d4ff',
                    boxShadow: '0px 1px 4px rgba(0,0,0,0.1)',
                    padding: '6px 14px',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    color: '#5a30b5',
                    fontWeight: 500
                  }}
                >
                  {x.Tag}
                </div>
              ))}
            </div>
          </div>

          <IEPDetailsView iep={selectedIEPDetail} onEdit={openEditGoal} isMobile={isMobile} isTablet={isTablet} sp={sp} currentUser={currentUser} userRole={userRole} />
        </>
      )}

      <div
        className='card mb-4'
        style={{
          padding: isMobile ? '0.75rem' : '1rem',
          borderRadius: '0.5rem',
          boxShadow: 'rgba(0,0,0,0.5) 1px 1px 9px -6px',
          border: '3px solid rgb(255,191,50)'
        }}
      >
        <img src={Reimagined} style={{ width: '100%', height: 'auto' }} />
      </div>

      <div className={isExportingPdf ? 'definitions-page-break' : ''}>
        <DefinitionsTable sp={sp} exportMode={isExportingPdf} />
      </div>

      {/* Hero Block Section - Only show when subdepartment is selected */}
      {
        selectedIEP && selectedIEP.startsWith('sub-') && (
          <div style={{
            marginTop: '40px',
            marginBottom: '40px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div style={{
                gridColumn: 'span 1',
                overflow: 'hidden',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                <img src={require('../../CustomAssets/HeroImages/media_imageone.png')} alt="Campus construction" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{
                gridColumn: 'span 1',
                overflow: 'hidden',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                <img src={require('../../CustomAssets/HeroImages/media_imagetwo.png')} alt="Campus building" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{
                gridColumn: 'span 1',
                overflow: 'hidden',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}>
                <img src={require('../../CustomAssets/HeroImages/media_imagethree.png')} alt="Basketball players" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            {/* <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px'
          }}>
            <div style={{
              gridColumn: 'span 1',
              overflow: 'hidden',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <img src={require('../../CustomAssets/HeroImages/media_imagefour.png')} alt="Students collaborating" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{
              gridColumn: 'span 2',
              overflow: 'hidden',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <img src={require('../../CustomAssets/HeroImages/media_imagefive.png')} alt="Math Science building" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div> */}
          </div>
        )
      }

      {
        showSidebar && (
          <IEPSidebarForm
            selScorecard={selScorecard}
            formData={formData}
            setFormData={setFormData}
            editingIEP={editingIEP}
            isOperationalGoalLocked={!!(editingIEP?.IsGlobalGoal && isPlanningUnitManager)}
            departments={departments}
            organizationalScorecards={organizationalScorecards}
            orgGoalOptions={orgGoalOptions}
            threeYrOptions={threeYrOptions}
            hlcOptions={hlcOptions}
            tagOptions={tagOptions}
            subDepartments={subDepartments}
            subSubDepartments={subSubDepartments}
            selectedSubDeptId={selectedSubDeptId}
            setSelectedSubDeptId={setSelectedSubDeptId}
            selectedSubSubDeptId={selectedSubSubDeptId}
            setSelectedSubSubDeptId={setSelectedSubSubDeptId}
            onSubmit={handleSave}
            onClose={closeSidebar}
            userRole={userRole}
          />
        )
      }

      <ToastContainer position="top-right" autoClose={3000} />
    </div >
  );
};

export default ScorecardContent;