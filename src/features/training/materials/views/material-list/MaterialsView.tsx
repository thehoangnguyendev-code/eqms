import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import {
  Search,
  FileText,
  Video,
  FileImage,
  Download,
  Edit,
  Upload,
  FolderOpen,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  FilePlusCorner,
  Link2,
  Send,
  MoreVertical,
  History,
  X,
  SlidersHorizontal,
  ArrowDownAZ,
  ArrowDownZA,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MarkObsoleteModal, ObsoleteResult } from "../../components/MarkObsoleteModal";
import { IconChecks, IconInfoCircle, IconEyeCheck } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { trainingMaterials } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { DateRangePicker } from "@/components/ui/datetime-picker/DateRangePicker";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { StatusBadge, StatusType } from "@/components/ui";
import { cn } from "@/components/ui/utils";
import { TabNav } from "@/components/ui/tabs/TabNav";
import type { TabItem } from "@/components/ui/tabs/TabNav";
import { FullPageLoading, SectionLoading } from "@/components/ui/loading/Loading";
import { formatDateUS } from "@/utils/format";
import { MOCK_MATERIALS } from "../../mockData";
import type { TrainingMaterial, MaterialFilters } from "../../types";
import { VersionHistoryDrawer } from "../../components/VersionHistoryDrawer";
import { usePortalDropdown, useNavigateWithLoading, useTableDragScroll } from "@/hooks";

/* ─── Dashboard Stats Calculation ───────────────────────────────── */
const calcDashboardStats = (materials: TrainingMaterial[]) => {
  const totalMaterials = materials.length;
  const totalVideos = materials.filter((m) => m.type === "Video").length;
  const totalDocuments = materials.filter((m) => m.type === "PDF" || m.type === "Document").length;
  const totalImages = materials.filter((m) => m.type === "Image").length;
  const pendingReview = materials.filter((m) => m.status === "Pending Review").length;
  const pendingApproval = materials.filter((m) => m.status === "Pending Approval").length;
  const needsAction = pendingReview + pendingApproval;
  const obsoleted = materials.filter((m) => m.status === "Obsoleted").length;
  const totalUsage = materials.reduce((sum, m) => sum + m.usageCount, 0);
  const totalStorageBytes = materials.reduce((sum, m) => sum + m.fileSizeBytes, 0);
  const totalStorageGB = (totalStorageBytes / (1024 * 1024 * 1024)).toFixed(2);
  const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(0);
  return { totalMaterials, totalVideos, totalDocuments, totalImages, pendingReview, pendingApproval, needsAction, obsoleted, totalUsage, totalStorageMB, totalStorageGB };
};

// ── Local Dropdown ────────────────────────────────────────────────
interface MaterialDropdownMenuProps {
  material: TrainingMaterial;
  effectiveStatus: TrainingMaterial["status"];
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number; showAbove?: boolean };
  onNavigate: (path: string) => void;
  onMarkObsolete: (id: string) => void;
  onOpenHistory: (material: TrainingMaterial) => void;
}

const MaterialDropdownMenu: React.FC<MaterialDropdownMenuProps> = ({
  material,
  effectiveStatus,
  isOpen,
  onClose,
  position,
  onNavigate,
  onMarkObsolete,
  onOpenHistory,
}) => {
  if (!isOpen) return null;

  type MenuItem =
    | { isDivider: true }
    | { isDivider?: false; icon: React.ElementType; label: string; onClick: () => void; color?: string };

  const menuItems: MenuItem[] = [
    { icon: IconInfoCircle, label: "View Details", onClick: () => { onNavigate(ROUTES.TRAINING.MATERIAL_DETAIL(material.id)); onClose(); }, color: "text-slate-500" },
    ...(effectiveStatus === "Draft" ? [
      { icon: Edit, label: "Edit Material", onClick: () => { onNavigate(ROUTES.TRAINING.MATERIAL_EDIT(material.id)); onClose(); }, color: "text-slate-500" } as MenuItem,
      { icon: Send, label: "Submit for Review", onClick: () => { onNavigate(ROUTES.TRAINING.MATERIAL_REVIEW(material.id)); onClose(); }, color: "text-slate-500" } as MenuItem,
    ] : []),
    ...(effectiveStatus === "Pending Review" ? [
      { icon: IconEyeCheck, label: "Review Material", onClick: () => { onNavigate(ROUTES.TRAINING.MATERIAL_REVIEW(material.id)); onClose(); }, color: "text-slate-500" } as MenuItem,
    ] : []),
    ...(effectiveStatus === "Pending Approval" ? [
      { icon: IconChecks, label: "Approve Material", onClick: () => { onNavigate(ROUTES.TRAINING.MATERIAL_APPROVAL(material.id)); onClose(); }, color: "text-slate-500" } as MenuItem,
    ] : []),
    ...(effectiveStatus === "Effective" ? [
      { icon: FilePlusCorner, label: "Upgrade Revision", onClick: () => { onNavigate(ROUTES.TRAINING.MATERIAL_NEW_REVISION(material.id)); onClose(); }, color: "text-slate-500" } as MenuItem,
    ] : []),
    { icon: BarChart3, label: "Usage Report", onClick: () => { onNavigate(ROUTES.TRAINING.MATERIAL_USAGE_REPORT(material.id)); onClose(); }, color: "text-slate-500" },
    { icon: History, label: "Version History", onClick: () => { onOpenHistory(material); onClose(); }, color: "text-slate-500" },
    ...(effectiveStatus === "Effective" ? [
      { isDivider: true } as MenuItem,
      { icon: XCircle, label: "Mark as Obsoleted", onClick: () => { onMarkObsolete(material.id); onClose(); }, color: "text-slate-500" } as MenuItem,
    ] : []),
  ];

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-40 animate-in fade-in duration-150"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-hidden="true"
      />
      <div
        className="fixed z-50 min-w-[160px] w-[200px] max-w-[90vw] max-h-[300px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
        style={{ top: `${position.top}px`, left: `${position.left}px`, transform: position.showAbove ? "translateY(-100%)" : "none" }}
      >
        <div className="py-1">
          {menuItems.map((item, i) => {
            if ("isDivider" in item && item.isDivider) {
              return <div key={i} className="my-1 border-t border-slate-100" />;
            }
            const mi = item as Exclude<MenuItem, { isDivider: true }>;
            const Icon = mi.icon;
            return (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); mi.onClick(); }}
                className={cn("flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 active:bg-slate-100 transition-colors", mi.color)}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{mi.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>,
    window.document.body
  );
};

const MATERIAL_TABS: TabItem[] = [
  { id: "overview", label: "Overview" },
  { id: "all", label: "All Materials" },
  { id: "pending-review", label: "Pending Review" },
  { id: "pending-approval", label: "Pending Approval" },
];

export const MaterialsView: React.FC = () => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();
  const stats = useMemo(() => calcDashboardStats(MOCK_MATERIALS), []);

  // Overview progress ratios for animated bars
  const totalForRatio = stats.totalMaterials || 1;
  const videosPct = Math.round((stats.totalVideos / totalForRatio) * 100);
  const documentsPct = Math.round((stats.totalDocuments / totalForRatio) * 100);
  const imagesPct = Math.round((stats.totalImages / totalForRatio) * 100);
  const needsActionPct = Math.round((stats.needsAction / totalForRatio) * 100);


  // Filters
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [filters, setFilters] = useState<MaterialFilters>({
    searchQuery: "",
    typeFilter: "All",
    departmentFilter: "All",
    statusFilter: "All",
    uploadedByFilter: "All",
    dateFrom: "",
    dateTo: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Obsolete overrides (local state — persists for session)
  const [obsoleteOverrides, setObsoleteOverrides] = useState<Record<string, { replacedBy: string }>>({});

  // Mark Obsolete modal
  const [obsoleteModalOpen, setObsoleteModalOpen] = useState(false);
  const [obsoleteTargetId, setObsoleteTargetId] = useState<string | null>(null);

  // Version History Drawer
  const [historyDrawerMaterial, setHistoryDrawerMaterial] = useState<TrainingMaterial | null>(null);

  const { openId: openDropdownId, position: dropdownPosition, getRef, toggle: handleDropdownToggle, close: closeDropdown } = usePortalDropdown();
  const { scrollerRef, isDragging, dragEvents } = useTableDragScroll();


  const typeOptions = [
    { label: "All Types", value: "All" },
    { label: "Video", value: "Video" },
    { label: "PDF", value: "PDF" },
    { label: "Image", value: "Image" },
    { label: "Document", value: "Document" },
  ];

  const departmentOptions = [
    { label: "All Departments", value: "All" },
    { label: "Quality Assurance", value: "Quality Assurance" },
    { label: "Quality Control", value: "Quality Control" },
    { label: "Production", value: "Production" },
    { label: "Engineering", value: "Engineering" },
    { label: "HSE", value: "HSE" },
  ];

  const statusOptions = [
    { label: "All Status", value: "All" },
    { label: "Draft", value: "Draft" },
    { label: "Pending Review", value: "Pending Review" },
    { label: "Pending Approval", value: "Pending Approval" },
    { label: "Effective", value: "Effective" },
    { label: "Obsoleted", value: "Obsoleted" },
  ];

  const uploadedByOptions = useMemo(() => {
    const users = Array.from(new Set(MOCK_MATERIALS.map((m) => m.uploadedBy))).sort();
    return [
      { label: "All Users", value: "All" },
      ...users.map((u) => ({ label: u, value: u })),
    ];
  }, []);

  // Effective status helper
  const getEffectiveStatus = (m: TrainingMaterial) =>
    obsoleteOverrides[m.id] !== undefined ? "Obsoleted" as const : m.status;

  // Map material status to StatusBadge type
  const mapMaterialStatusToStatusType = (status: TrainingMaterial["status"]): StatusType => {
    switch (status) {
      case "Draft":
        return "draft";
      case "Pending Review":
        return "pendingReview";
      case "Pending Approval":
        return "pendingApproval";
      case "Effective":
        return "effective";
      case "Obsoleted":
        return "obsolete";
      default:
        return "draft";
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = useMemo(() => {
    // 1. Try URL
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl === "all" || tabFromUrl === "pending-review" || tabFromUrl === "pending-approval" || tabFromUrl === "overview") {
      return tabFromUrl as "overview" | "all" | "pending-review" | "pending-approval";
    }
    // 2. Try localStorage
    const savedTab = localStorage.getItem("training_materials_active_tab");
    if (savedTab === "all" || savedTab === "pending-review" || savedTab === "pending-approval" || savedTab === "overview") {
      return savedTab as "overview" | "all" | "pending-review" | "pending-approval";
    }
    return "overview";
  }, [searchParams]);

  // Sync state to filters and ensure URL is aligned if coming from localStorage
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (!tabFromUrl && activeTab !== "overview") {
      // Sync URL to localStorage value if missing
      setSearchParams({ tab: activeTab }, { replace: true });
    }

    // Update filters based on the effective tab
    if (activeTab === "pending-review") {
      setFilters((prev) => prev.statusFilter === "Pending Review" ? prev : { ...prev, statusFilter: "Pending Review" });
    } else if (activeTab === "pending-approval") {
      setFilters((prev) => prev.statusFilter === "Pending Approval" ? prev : { ...prev, statusFilter: "Pending Approval" });
    } else if (activeTab === "all" || activeTab === "overview") {
      // If we switch to 'all' or 'overview', we might want to keep the current filters or reset status to 'All'
      // Only reset to 'All' if it was one of the specialized filters
      setFilters((prev) => {
        if (prev.statusFilter === "Pending Review" || prev.statusFilter === "Pending Approval") {
          return { ...prev, statusFilter: "All" };
        }
        return prev;
      });
    }
  }, [activeTab, searchParams, setSearchParams]);

  const setActiveTab = (tab: "overview" | "all" | "pending-review" | "pending-approval") => {
    localStorage.setItem("training_materials_active_tab", tab);
    const newParams = new URLSearchParams(searchParams);
    if (tab === "overview") {
      newParams.delete("tab");
    } else {
      newParams.set("tab", tab);
    }
    setSearchParams(newParams); // Removed replace: true to ensure history works for 'back'
  };

  const statusFilterEffective: MaterialFilters["statusFilter"] =
    activeTab === "pending-review"
      ? "Pending Review"
      : activeTab === "pending-approval"
        ? "Pending Approval"
        : filters.statusFilter;

  // Filtered & Paginated
  const filteredData = useMemo(() => {

    const filtered = MOCK_MATERIALS.filter((m) => {
      const effectiveStatus = obsoleteOverrides[m.id] !== undefined ? "Obsoleted" : m.status;
      const matchesSearch =
        m.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        m.materialId.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(filters.searchQuery.toLowerCase());
      const matchesType = filters.typeFilter === "All" || m.type === filters.typeFilter;
      const matchesDepartment = filters.departmentFilter === "All" || m.department === filters.departmentFilter;
      const matchesStatus = statusFilterEffective === "All" || effectiveStatus === statusFilterEffective;
      const matchesUploadedBy = filters.uploadedByFilter === "All" || m.uploadedBy === filters.uploadedByFilter;

      // Date filtering
      let matchesDate = true;
      if (filters.dateFrom || filters.dateTo) {
        // m.uploadedAt is in dd/MM/yyyy format according to mockData.ts
        const [day, month, year] = m.uploadedAt.split("/").map(Number);
        const materialDate = new Date(year, month - 1, day).getTime();

        if (filters.dateFrom) {
          const [fDay, fMonth, fYear] = filters.dateFrom.split("/").map(Number);
          const fromDate = new Date(fYear, fMonth - 1, fDay).getTime();
          if (materialDate < fromDate) matchesDate = false;
        }
        if (filters.dateTo) {
          const [tDay, tMonth, tYear] = filters.dateTo.split("/").map(Number);
          const toDate = new Date(tYear, tMonth - 1, tDay).getTime();
          if (materialDate > toDate) matchesDate = false;
        }
      }

      return matchesSearch && matchesType && matchesDepartment && matchesStatus && matchesUploadedBy && matchesDate;
    });

    return [...filtered].sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      if (sortOrder === "asc") return titleA.localeCompare(titleB);
      return titleB.localeCompare(titleA);
    });
  }, [filters, obsoleteOverrides, statusFilterEffective, sortOrder]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Sort materials by usage count for "Most Used"
  const topUsedMaterials = useMemo(
    () => [...MOCK_MATERIALS].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5),
    []
  );

  // Pending/Obsolete materials
  const pendingObsoleteMaterials = useMemo(
    () => MOCK_MATERIALS.filter(
      (m) => m.status === "Pending Review" || m.status === "Pending Approval" || m.status === "Obsoleted"
    ).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    []
  );

  // Type distribution for mini chart
  const typeDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    MOCK_MATERIALS.forEach((m) => { dist[m.type] = (dist[m.type] || 0) + 1; });
    return Object.entries(dist).map(([type, count]) => ({ type, count, pct: Math.round((count / MOCK_MATERIALS.length) * 100) }));
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Video": return <Video className="h-4 w-4 text-purple-600" />;
      case "PDF": return <FileText className="h-4 w-4 text-red-600" />;
      case "Image": return <FileImage className="h-4 w-4 text-blue-600" />;
      default: return <FileText className="h-4 w-4 text-slate-600" />;
    }
  };

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case "Video": return "bg-purple-500";
      case "PDF": return "bg-red-500";
      case "Image": return "bg-blue-500";
      default: return "bg-slate-500";
    }
  };



  const handleObsoleteConfirm = (result: ObsoleteResult) => {
    if (obsoleteTargetId) {
      setObsoleteOverrides((prev) => ({
        ...prev,
        [obsoleteTargetId]: { replacedBy: result.replacedByCode },
      }));
    }
    setObsoleteModalOpen(false);
    setObsoleteTargetId(null);
  };

  const handleTabChange = (tabId: string) => {
    const next = tabId as "overview" | "all" | "pending-review" | "pending-approval";
    setActiveTab(next);

    // Keep Status filter aligned for consistency
    if (next === "pending-review") {
      setFilters((prev) => ({ ...prev, statusFilter: "Pending Review" }));
      setCurrentPage(1);
    } else if (next === "pending-approval") {
      setFilters((prev) => ({ ...prev, statusFilter: "Pending Approval" }));
      setCurrentPage(1);
    } else if (next === "all") {
      setFilters((prev) => ({ ...prev, statusFilter: "All" }));
      setCurrentPage(1);
    }
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      typeFilter: "All",
      departmentFilter: "All",
      statusFilter: "All",
      uploadedByFilter: "All",
      dateFrom: "",
      dateTo: "",
    });
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <PageHeader
        title="Training Materials"
        breadcrumbItems={trainingMaterials(navigateTo)}
        actions={
          <>
            <Button
              onClick={() => console.log("Export materials")}
              size="sm"
              variant="outline"
              className="whitespace-nowrap gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => navigateTo(ROUTES.TRAINING.UPLOAD_MATERIAL)} size="sm" className="whitespace-nowrap gap-2">
              <Upload className="h-4 w-4" />
              Upload Material
            </Button>
          </>
        }
      />

      {/* ─── Main Card: Tabs + Content ─────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <TabNav tabs={MATERIAL_TABS} activeTab={activeTab} onChange={handleTabChange} variant="underline" />

        {activeTab === "overview" ? (
          <div className="p-4 lg:p-5 space-y-5">
            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
              {/* Total Materials */}
              <div className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <FolderOpen className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 font-medium">Total Materials</p>
                    <p className="text-xl font-bold text-slate-900">{stats.totalMaterials}</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out group-hover:bg-emerald-600"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              {/* Videos */}
              <div className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Video className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 font-medium">Videos</p>
                    <p className="text-xl font-bold text-slate-900">{stats.totalVideos}</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-700 ease-out group-hover:bg-purple-600"
                    style={{ width: `${videosPct}%` }}
                  />
                </div>
              </div>

              {/* Documents (PDF + Document) */}
              <div className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 font-medium">Documents</p>
                    <p className="text-xl font-bold text-slate-900">{stats.totalDocuments}</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-700 ease-out group-hover:bg-red-600"
                    style={{ width: `${documentsPct}%` }}
                  />
                </div>
              </div>

              {/* Images */}
              <div className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileImage className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 font-medium">Images</p>
                    <p className="text-xl font-bold text-slate-900">{stats.totalImages}</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out group-hover:bg-blue-600"
                    style={{ width: `${imagesPct}%` }}
                  />
                </div>
              </div>

              {/* Needs Action (Pending Review + Pending Approval) */}
              <div className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-amber-600 font-medium">Needs Action</p>
                    <p className="text-xl font-bold text-amber-700">{stats.needsAction}</p>
                    <p className="text-xs text-slate-400 leading-tight">
                      {stats.pendingReview}R · {stats.pendingApproval}A
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-700 ease-out group-hover:bg-amber-600"
                    style={{ width: `${needsActionPct}%` }}
                  />
                </div>
              </div>

              {/* Total Storage */}
              <div className="group bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 delay-250 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-cyan-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 font-medium">Total Storage</p>
                    <p className="text-xl font-bold text-slate-900">
                      {stats.totalStorageMB} <span className="text-xs font-medium text-slate-500">MB</span>
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-700 ease-out group-hover:bg-cyan-600"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>

            {/* Dashboard Panels */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-5">
              {/* Most Used Materials */}
              <div className="xl:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 delay-150">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-sm font-semibold text-slate-900">Most Used Materials</h3>
                  </div>
                  <span className="text-xs text-slate-500">Top 5 by course usage</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {topUsedMaterials.map((material, idx) => (
                    <div
                      key={material.id}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => navigateTo(ROUTES.TRAINING.MATERIAL_DETAIL(material.id))}
                    >
                      <span
                        className={cn(
                          "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                          idx === 0
                            ? "bg-amber-100 text-amber-700"
                            : idx === 1
                              ? "bg-slate-200 text-slate-700"
                              : idx === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex-shrink-0">{getTypeIcon(material.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{material.title}</p>
                        <p className="text-xs text-slate-500">{material.materialId}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-sm font-bold text-emerald-600">{material.usageCount}</span>
                        <span className="text-xs text-slate-500">courses</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending & Obsolete Materials */}
              <div className="xl:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 delay-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <h3 className="text-sm font-semibold text-slate-900">Needs Action & Obsoleted</h3>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                      pendingObsoleteMaterials.length > 0
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    {pendingObsoleteMaterials.length} item
                    {pendingObsoleteMaterials.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {pendingObsoleteMaterials.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center px-5">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">All materials effective</p>
                    <p className="text-xs text-slate-500 mt-1">
                      No materials pending review or marked obsolete.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {pendingObsoleteMaterials.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => navigateTo(ROUTES.TRAINING.MATERIAL_DETAIL(material.id))}
                      >
                        <div
                          className={cn(
                            "flex-shrink-0 w-2 h-2 rounded-full",
                            material.status === "Obsoleted"
                              ? "bg-red-500"
                              : material.status === "Pending Approval"
                                ? "bg-blue-500"
                                : "bg-amber-500"
                          )}
                        />
                        <div className="flex-shrink-0">{getTypeIcon(material.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {material.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {material.materialId} · {material.version}
                          </p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <StatusBadge status={mapMaterialStatusToStatusType(material.status)} />
                          <span className="text-xs text-slate-500 mt-0.5">
                            {formatDateUS(material.uploadedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Type Distribution */}
              <div className="xl:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 delay-250">
                <div className="px-5 py-4 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-slate-600" />
                    <h3 className="text-sm font-semibold text-slate-900">Type Distribution</h3>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {typeDistribution.map(({ type, count, pct }) => (
                    <div key={type} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(type)}
                          <span className="text-xs sm:text-sm font-medium text-slate-700">
                            {type}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {count}{" "}
                          <span className="text-xs font-normal text-slate-500">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            getTypeBgColor(type)
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Category breakdown */}
                  <div className="pt-3 mt-1 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      By Department
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {departmentOptions
                        .filter((d) => d.value !== "All")
                        .map((dept) => {
                          const count = MOCK_MATERIALS.filter(
                            (m) => m.department === dept.value
                          ).length;
                          return count > 0 ? (
                            <span
                              key={dept.value}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {dept.label}
                              <span className="bg-slate-200 text-slate-600 px-1.5 py-0 rounded-full text-xs font-bold">
                                {count}
                              </span>
                            </span>
                          ) : null;
                        })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 lg:p-6 flex-1 flex flex-col">
            <div className="pb-4 md:pb-5">
              {/* Search Row + Primary Actions */}
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="w-full flex-1 group">
                  <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block transition-colors group-focus-within:text-emerald-600">
                    Search
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                      <Search className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by title, ID, or description..."
                      value={filters.searchQuery}
                      onChange={(e) => {
                        setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
                        setCurrentPage(1);
                      }}
                      className="block w-full pl-10 pr-10 h-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all placeholder:text-slate-400"
                    />
                    {filters.searchQuery && (
                      <button
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, searchQuery: "" }));
                          setCurrentPage(1);
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant={isFilterVisible ? "default" : "outline"}
                    onClick={() => setIsFilterVisible(!isFilterVisible)}
                    className="h-9 px-4 gap-2 whitespace-nowrap rounded-lg"
                    size="sm"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                    className="h-9 px-4 gap-2 whitespace-nowrap border-slate-200 rounded-lg"
                    size="sm"
                  >
                    {sortOrder === "asc" ? (
                      <ArrowDownAZ className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <ArrowDownZA className="h-4 w-4 text-emerald-600" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Conditional Filters Tray: Accordion Effect */}
              <AnimatePresence>
                {isFilterVisible && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, y: -10, marginTop: 0 }}
                    animate={{ height: "auto", opacity: 1, y: 0, marginTop: 16 }}
                    exit={{ height: 0, opacity: 0, y: -10, marginTop: 0 }}
                    transition={{
                      height: { type: "spring", bounce: 0, duration: 0.4 },
                      marginTop: { type: "spring", bounce: 0, duration: 0.4 },
                      opacity: { duration: 0.25 },
                      y: { duration: 0.3 }
                    }}
                    className="overflow-hidden px-1.5 -mx-1.5 pb-1.5 -mb-1.5"
                  >
                    <div className="pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
                        {/* Type */}
                        <div className="w-full">
                          <Select
                            label="Material Type"
                            value={filters.typeFilter}
                            onChange={(val) => {
                              setFilters((prev) => ({ ...prev, typeFilter: val }));
                              setCurrentPage(1);
                            }}
                            options={typeOptions}
                          />
                        </div>

                        {/* Department */}
                        <div className="w-full">
                          <Select
                            label="Department"
                            value={filters.departmentFilter}
                            onChange={(val) => {
                              setFilters((prev) => ({ ...prev, departmentFilter: val }));
                              setCurrentPage(1);
                            }}
                            options={departmentOptions}
                          />
                        </div>

                        {/* Status */}
                        <div className="w-full">
                          <Select
                            label="Status"
                            value={statusFilterEffective}
                            onChange={(val) => {
                              setFilters((prev) => ({ ...prev, statusFilter: val }));
                              setCurrentPage(1);
                            }}
                            options={statusOptions}
                            disabled={
                              activeTab === "pending-review" || activeTab === "pending-approval"
                            }
                          />
                        </div>

                        {/* Uploaded By */}
                        <div className="w-full">
                          <Select
                            label="Uploaded By"
                            value={filters.uploadedByFilter}
                            onChange={(val) => {
                              setFilters((prev) => ({ ...prev, uploadedByFilter: val }));
                              setCurrentPage(1);
                            }}
                            options={uploadedByOptions}
                          />
                        </div>

                        {/* Last Updated Date Range */}
                        <div className="w-full">
                          <DateRangePicker
                            label="Last Updated Date Range"
                            startDate={filters.dateFrom}
                            endDate={filters.dateTo}
                            onStartDateChange={(val) => { setFilters((prev) => ({ ...prev, dateFrom: val })); setCurrentPage(1); }}
                            onEndDateChange={(val) => { setFilters((prev) => ({ ...prev, dateTo: val })); setCurrentPage(1); }}
                            placeholder="Select Date Range"
                          />
                        </div>

                        {/* Clear Filters Button */}
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="h-9 px-4 gap-2 font-medium transition-all duration-200 hover:bg-red-600 hover:text-white hover:border-red-600 whitespace-nowrap"
                          >
                            Clear Filters
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Table Section */}
            <div className="flex-1 flex flex-col relative">
              {isTableLoading && (
                <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-[4px] flex items-center justify-center transition-all duration-300 rounded-xl">
                  <SectionLoading text="Searching..." minHeight="150px" />
                </div>
              )}

              <div className={cn(
                "border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-slate-50/10 transition-all duration-300",
                isTableLoading && "blur-[2px] opacity-80"
              )}>
                {/* Table wrapper — Scrollable */}
                <div 
                  ref={scrollerRef}
                  className={cn(
                    "overflow-x-auto overflow-y-hidden flex-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full transition-colors",
                    isDragging ? "cursor-grabbing select-none" : "cursor-grab"
                  )}
                  {...dragEvents}
                >
                  <table className="w-full">
                    <thead className="bg-slate-50/80 border-b-2 border-slate-200 sticky top-0 z-30">
                      <tr>
                        <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-10 sm:w-16">No.</th>
                        <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Material ID</th>
                        <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Material Title</th>
                        <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">File Type</th>
                        <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">File Size</th>
                        <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Version</th>
                        <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Department</th>
                        <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Courses Using</th>
                        <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Last Updated</th>
                        <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Uploaded By</th>
                        <th className="sticky right-0 bg-slate-50 px-2 py-2.5 sm:px-4 sm:py-3.5 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider z-40 whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {paginatedData.map((m, index) => (
                        <tr
                          key={m.id}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                          onClick={() => navigateTo(ROUTES.TRAINING.MATERIAL_DETAIL(m.id))}
                        >
                          {/* No. */}
                          <td className="px-2 py-2 sm:px-4 sm:py-4 whitespace-nowrap text-center">
                            <div className="text-xs sm:text-sm text-slate-500">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </div>
                          </td>
                          {/* Material ID */}
                          <td className="px-2 py-2 sm:px-4 sm:py-4 whitespace-nowrap">
                            <span className="text-xs sm:text-sm font-medium text-emerald-600">{m.materialId}</span>
                          </td>
                          {/* Material Title */}
                          <td className="px-2 py-2 sm:px-4 sm:py-4 whitespace-nowrap">
                            <div>
                              <p
                                className={cn(
                                  "font-medium whitespace-nowrap text-xs sm:text-sm",
                                  getEffectiveStatus(m) === "Obsoleted"
                                    ? "text-slate-400 line-through"
                                    : "text-slate-900"
                                )}
                              >
                                {m.title}
                              </p>
                              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                                {m.description}
                              </p>
                              {obsoleteOverrides[m.id]?.replacedBy && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Link2 className="h-3 w-3 text-emerald-600 flex-shrink-0" />
                                  <span className="text-xs text-emerald-700 font-medium">
                                    Replaced by{" "}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); }}
                                      className="underline hover:text-emerald-800 transition-colors"
                                    >
                                      {obsoleteOverrides[m.id].replacedBy}
                                    </button>
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          {/* File Type (Text with icon) */}
                          <td className="px-2 py-2 sm:px-4 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              {getTypeIcon(m.type)}
                              <span className="text-xs sm:text-sm text-slate-700 font-medium">{m.type}</span>
                            </div>
                          </td>
                          {/* File Size */}
                          <td className="px-2 py-2 sm:px-4 sm:py-4 text-center whitespace-nowrap">
                            <span className="text-xs sm:text-sm text-slate-700 font-medium">{m.fileSize}</span>
                          </td>
                          {/* Version */}
                          <td className="px-2 py-2 sm:px-4 sm:py-4 text-xs sm:text-sm text-center whitespace-nowrap text-slate-700">
                            {m.version}
                          </td>
                          {/* Department */}
                          <td className="px-2 py-2 sm:px-4 sm:py-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">
                            {m.department}
                          </td>
                          {/* Status */}
                          <td className="px-2 py-2 sm:px-4 sm:py-4 text-xs sm:text-sm whitespace-nowrap text-center">
                            <StatusBadge status={mapMaterialStatusToStatusType(getEffectiveStatus(m) as TrainingMaterial["status"])} />
                          </td>
                          {/* Courses Using */}
                          <td className="px-2 py-2 sm:px-4 sm:py-4 text-xs sm:text-sm text-center whitespace-nowrap">
                            <span className="text-slate-700 font-medium">{m.usageCount}</span>
                          </td>
                          {/* Last Updated */}
                          <td className="px-2 py-2 sm:px-4 sm:py-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">
                            {formatDateUS(m.uploadedAt)}
                          </td>
                          {/* Uploaded By */}
                          <td className="px-2 py-2 sm:px-4 sm:py-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">
                            {m.uploadedBy}
                          </td>
                          {/* Action */}
                          <td
                            onClick={(e) => e.stopPropagation()}
                            className="sticky right-0 bg-white px-2 py-2 sm:px-4 sm:py-4 text-center z-20 whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 group-hover:bg-slate-50"
                          >
                            <button
                              ref={getRef(m.id)}
                              onClick={(e) => handleDropdownToggle(m.id, e)}
                              className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-100 transition-colors"
                              aria-label="More actions"
                            >
                              <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                            </button>
                            <MaterialDropdownMenu
                              material={m}
                              effectiveStatus={getEffectiveStatus(m)}
                              isOpen={openDropdownId === m.id}
                              onClose={closeDropdown}
                              position={dropdownPosition}
                              onNavigate={navigateTo}
                              onMarkObsolete={(id) => {
                                setObsoleteTargetId(id);
                                setObsoleteModalOpen(true);
                              }}
                              onOpenHistory={setHistoryDrawerMaterial}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredData.length > 0 && (
                  <div className="hidden sm:block border-t border-slate-200 bg-white">
                    <TablePagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      totalItems={filteredData.length}
                      itemsPerPage={itemsPerPage}
                      onItemsPerPageChange={setItemsPerPage}
                      showItemCount={true}
                    />
                  </div>
                )}

                {filteredData.length === 0 && (
                  <TableEmptyState
                    title="No Training Materials Found"
                    description="We couldn't find any training materials matching your filters. Try adjusting your search criteria or clear filters."
                    actionLabel="Clear Filters"
                    onAction={() => {
                      setFilters({
                        searchQuery: "",
                        typeFilter: "All",
                        departmentFilter: "All",
                        statusFilter: "All",
                        uploadedByFilter: "All",
                        dateFrom: "",
                        dateTo: "",
                      });
                      setCurrentPage(1);
                    }}
                  />
                )}
              </div>

              {/* Pagination for mobile */}
              {filteredData.length > 0 && (
                <div className="mt-4 sm:mt-5 bg-white border border-slate-200 rounded-xl shadow-sm p-3 sm:hidden">
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={filteredData.length}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={setItemsPerPage}
                    showItemCount={false}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>


      <MarkObsoleteModal
        isOpen={obsoleteModalOpen}
        material={(() => {
          const m = MOCK_MATERIALS.find((mat) => mat.id === obsoleteTargetId) ?? null;
          if (!m) return null;
          return {
            id: m.id,
            materialId: m.materialId,
            title: m.title,
            version: m.version,
            type: m.type,
            linkedCourses: m.linkedCourses,
          };
        })()}
        onClose={() => {
          setObsoleteModalOpen(false);
          setObsoleteTargetId(null);
        }}
        onConfirm={handleObsoleteConfirm}
      />

      {/* ─── Loading Overlay ──────────────────────────────────── */}
      {isNavigating && <FullPageLoading text="Loading..." />}

      {/* ─── Version History Drawer ───────────────────────────── */}
      {historyDrawerMaterial && (
        <VersionHistoryDrawer
          material={historyDrawerMaterial}
          onClose={() => setHistoryDrawerMaterial(null)}
        />
      )}
    </div>
  );
};






