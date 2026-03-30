import React, { useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/app/routes.constants";
import {
  Search,
  Upload,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ZoomIn,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { courseResultEntry } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
import { AlertModal, AlertModalType } from "@/components/ui/modal/AlertModal";
import { ESignatureModal } from "@/components/ui/esign-modal";
import { FormModal } from "@/components/ui/modal/FormModal";
import { useToast } from "@/components/ui/toast";
import { useTableDragScroll } from "@/hooks";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { cn } from "@/components/ui/utils";
import { TrainingMethod } from "../../../types";
import { MOCK_CELLS, MOCK_SOPS } from "../../mockData";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ResultRow {
  userId: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  businessUnit: string;
  examDate: string;
  score: number | null;
  evidenceImage: File | null;
  evidencePreview: string | null;
  isReadonly?: boolean;
}

interface CourseInfo {
  id: string;
  trainingId: string;
  title: string;
  trainingMethod: TrainingMethod;
  passingGradeType: "pass_fail" | "score_10" | "percentage";
  passingScore: number;
  totalEnrolled: number;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_COURSE: CourseInfo = {
  id: "SOP-001",
  trainingId: "TRN-2026-001",
  title: "GMP Basic Principles",
  trainingMethod: "Quiz (Paper-based/Manual)",
  passingGradeType: "score_10",
  passingScore: 7,
  totalEnrolled: 20,
};

const generateMockRows = (count: number): ResultRow[] => {
  const names = [
    "Nguyen Van An", "Tran Thi Binh", "Le Van Cuong", "Pham Thi Dung",
    "Hoang Van Em", "Vo Thi Phuong", "Dang Van Gia", "Bui Thi Hanh",
    "Ngo Van Ich", "Trinh Thi Kim", "Do Van Lam", "Ly Thi Mai",
    "Truong Van Nam", "Huynh Thi Oanh", "Phan Van Phuc", "Duong Thi Quynh",
    "Cao Van Rang", "Ta Thi Son", "Mai Van Tuan", "Luu Thi Uyen",
    "Dinh Van Vinh", "Ha Thi Xuan", "Tong Van Yen", "Chu Thi Zen",
    "Lam Van Anh",
  ];
  const departments = ["QA", "QC Lab", "Production", "R&D", "Engineering", "Warehouse"];
  const jobTitles = ["QA Specialist", "Lab Technician", "Production Manager", "R&D Scientist", "Senior Engineer", "Warehouse Supervisor"];
  const businessUnits = ["Operation Unit", "Quality Unit"];
  const rows: ResultRow[] = Array.from({ length: count }, (_, i) => ({
    userId: `EMP-${String(i + 1001).padStart(4, "0")}`,
    name: names[i % names.length],
    email: `${names[i % names.length].toLowerCase().replace(/ /g, '.')}@company.com`,
    jobTitle: jobTitles[i % jobTitles.length],
    department: departments[i % departments.length],
    businessUnit: businessUnits[i % businessUnits.length],
    examDate: "2026-03-20", // Pre-filled for older rows
    score: 8, // Pre-filled for older rows
    evidenceImage: new File([""], "evidence.jpg", { type: "image/jpeg" }), // fake evidence
    evidencePreview: "https://via.placeholder.com/150",
    isReadonly: true,
  }));

  // Insert the new employee who needs result entry
  rows.unshift({
    userId: "EMP-NEW",
    name: "Alex Turner",
    email: "alex.turner@company.com",
    jobTitle: "QA Specialist",
    department: "Quality Assurance",
    businessUnit: "Quality Unit",
    examDate: "",
    score: null,
    evidenceImage: null,
    evidencePreview: null,
    isReadonly: false,
  });

  return rows;
};

/* ------------------------------------------------------------------ */
/*  Image Preview Modal                                                */
/* ------------------------------------------------------------------ */

const ImagePreviewModal: React.FC<{
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}> = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen || !imageUrl) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 h-8 w-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
          aria-label="Close preview"
        >
          <X className="h-5 w-5" />
        </button>
        <img
          src={imageUrl}
          alt="Evidence preview"
          className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl"
        />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export const ResultEntryView: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const course = MOCK_COURSE; // In real app, fetch by courseId

  // Data
  const [rows, setRows] = useState<ResultRow[]>(() =>
    generateMockRows(course.totalEnrolled)
  );

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "entered" | "not-entered">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Bulk Exam Date
  const [bulkExamDate, setBulkExamDate] = useState("");

  const { showToast } = useToast();

  // Request Change state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reasonForChange, setReasonForChange] = useState("");
  const [isEditingAllowed, setIsEditingAllowed] = useState(false);

  // esign logic
  const [esignType, setEsignType] = useState<"complete" | "request_change">("complete");

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<AlertModalType>("info");
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalAction, setModalAction] = useState<(() => void) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // E-Signature
  const [isESignOpen, setIsESignOpen] = useState(false);

  // Image Preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // File input refs
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { scrollerRef, isDragging, dragEvents } = useTableDragScroll();

  /* ------ Computed ------ */
  const uniqueDepartments = useMemo(() => {
    const depts = Array.from(new Set(rows.map((r) => r.department))).sort();
    return depts;
  }, [rows]);

  const filteredRows = useMemo(() => {
    let filtered = rows;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.userId.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.department.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter === "entered") {
      filtered = filtered.filter((r) => r.score !== null);
    } else if (statusFilter === "not-entered") {
      filtered = filtered.filter((r) => r.score === null);
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((r) => r.department === departmentFilter);
    }

    return filtered;
  }, [rows, searchQuery, statusFilter, departmentFilter]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRows.slice(start, start + itemsPerPage);
  }, [filteredRows, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);

  const resultsEntered = useMemo(
    () => rows.filter((r) => r.score !== null).length,
    [rows]
  );

  const progressPercent = Math.round(
    (resultsEntered / rows.length) * 100
  );

  /* ------ Status helpers ------ */
  const getScoreStatus = (row: ResultRow): "pass" | "fail" | "none" => {
    if (row.score === null) return "none";
    if (course.passingGradeType === "pass_fail") return row.score >= 1 ? "pass" : "fail";
    return row.score >= course.passingScore ? "pass" : "fail";
  };

  const getPassingLabel = () => {
    switch (course.passingGradeType) {
      case "pass_fail":
        return "Pass / Fail";
      case "score_10":
        return `≥ ${course.passingScore}/10`;
      case "percentage":
        return `≥ ${course.passingScore}%`;
    }
  };

  const getScoreMax = () => {
    switch (course.passingGradeType) {
      case "pass_fail": return 1;
      case "score_10": return 10;
      case "percentage": return 100;
    }
  };

  /* ------ Row helpers ------ */
  const hasValidationError = (row: ResultRow) => {
    // Red highlight if score entered but no evidence image
    return row.score !== null && !row.evidenceImage;
  };

  const updateRow = (userId: string, updates: Partial<ResultRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.userId === userId ? { ...r, ...updates } : r))
    );
  };

  const handleScoreChange = (userId: string, value: string) => {
    // Reset status filter to show all rows when entering scores
    if (statusFilter !== "all") {
      setStatusFilter("all");
    }

    if (value === "") {
      updateRow(userId, { score: null });
      return;
    }
    const num = parseFloat(value);
    if (!isNaN(num)) {
      updateRow(userId, { score: Math.min(getScoreMax(), Math.max(0, num)) });
    }
  };

  const handleImageUpload = (userId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      setModalType("error");
      setModalTitle("Invalid File");
      setModalDescription("Please upload an image file (JPG, PNG, etc.).");
      setModalAction(null);
      setIsModalOpen(true);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setModalType("error");
      setModalTitle("File Too Large");
      setModalDescription("Image must be less than 10MB.");
      setModalAction(null);
      setIsModalOpen(true);
      return;
    }
    const preview = URL.createObjectURL(file);
    updateRow(userId, { evidenceImage: file, evidencePreview: preview });
  };

  const handleRemoveImage = (userId: string) => {
    const row = rows.find((r) => r.userId === userId);
    if (row?.evidencePreview) URL.revokeObjectURL(row.evidencePreview);
    updateRow(userId, { evidenceImage: null, evidencePreview: null });
  };

  const handlePreviewImage = (preview: string) => {
    setPreviewImage(preview);
    setIsPreviewOpen(true);
  };

  const handleApplyBulkExamDate = () => {
    if (!bulkExamDate) return;
    setRows((prev) =>
      prev.map((r) => ({ ...r, examDate: bulkExamDate }))
    );
  };

  /* ------ Save Draft ------ */
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API save call
      await new Promise((r) => setTimeout(r, 800));
      setIsLoading(false);
      setModalType("success");
      setModalTitle("Draft Saved");
      setModalDescription(
        `Your progress has been saved. ${resultsEntered} of ${rows.length} results recorded. You can continue entering results later.`
      );
      setModalAction(() => () => {
        navigate(ROUTES.TRAINING.COURSES_LIST);
      });
      setIsModalOpen(true);
    } catch {
      setIsLoading(false);
      setModalType("error");
      setModalTitle("Save Failed");
      setModalDescription("An error occurred while saving. Please try again.");
      setModalAction(null);
      setIsModalOpen(true);
    }
  };

  /* ------ Submit ------ */
  const handleConfirmSubmit = () => {
    // Validate: all rows with scores must have images
    const invalidRows = rows.filter((r) => r.score !== null && !r.evidenceImage);
    if (invalidRows.length > 0) {
      setModalType("error");
      setModalTitle("Missing Evidence");
      setModalDescription(
        `${invalidRows.length} employee(s) have scores entered but no evidence image uploaded. Please upload evidence for all graded employees.`
      );
      setModalAction(null);
      setIsModalOpen(true);
      return;
    }

    if (resultsEntered === 0) {
      setModalType("warning");
      setModalTitle("No Results Entered");
      setModalDescription("You haven't entered any results yet. Please enter at least one result before submitting.");
      setModalAction(null);
      setIsModalOpen(true);
      return;
    }    // Open e-signature modal directly
    setEsignType("complete");
    setIsESignOpen(true);
  };

  const handleRequestChangeTrigger = () => {
    if (!reasonForChange.trim()) {
      showToast({ type: "error", title: "Validation Error", message: "Please provide a reason for the change." });
      return;
    }
    // Instead of immediate approval, trigger e-signature
    setEsignType("request_change");
    setIsRequestModalOpen(false);
    setIsESignOpen(true);
  };

  const handleESignConfirm = async (_reason: string) => {
    setIsESignOpen(false);
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));

      if (esignType === "complete") {
        // Log submission to audit trail
        console.log(`[AUDIT TRAIL] Results submitted for course ${course.trainingId} by User Admin. Reason: ${_reason}`);

        // Update mock cells for newly entered results to propagate to Training Matrix
        rows.forEach(row => {
          if ((!row.isReadonly || isEditingAllowed) && row.score !== null) {
            const status = getScoreStatus(row) === "pass" ? "Qualified" : "Required"; // Red to Green mapping
            const sopId = course.id;
            const key = `${row.userId}|${sopId}`;
            const existing = MOCK_CELLS.get(key);
            if (existing) {
              MOCK_CELLS.set(key, { ...existing, status, score: row.score, lastTrainedDate: row.examDate });
            } else {
              MOCK_CELLS.set(key, {
                employeeId: row.userId,
                sopId,
                status,
                score: row.score,
                lastTrainedDate: row.examDate,
                expiryDate: null,
                attempts: 1
              });
            }
          }
        });

        setIsLoading(false);
        setModalType("success");
        setModalTitle("Results Submitted");
        setModalDescription(`${resultsEntered} result(s) have been submitted and signed successfully. Your Training Matrix has been updated.`);
        setModalAction(() => () => {
          navigate(ROUTES.TRAINING.COURSES_LIST);
        });
        setIsModalOpen(true);
      } else {
        // Request Change approval
        console.log(`[AUDIT TRAIL] Change requested for course ${course.trainingId}. Reason: ${reasonForChange}. Signed by Admin.`);

        setIsEditingAllowed(true);
        setIsLoading(false);
        showToast({
          type: "success",
          title: "Request Approved",
          message: "The fields have been enabled for modification. All changes will be audited."
        });
      }
    } catch {
      setIsLoading(false);
      setModalType("error");
      setModalTitle("Submission Failed");
      setModalDescription("An error occurred. Please try again.");
      setModalAction(null);
      setIsModalOpen(true);
    }
  };

  /* ------ Render ------ */
  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* ===== Header ===== */}
      <PageHeader
        title="Result Entry"
        breadcrumbItems={courseResultEntry(navigate)}
        actions={
          <>
            <Button
              variant="outline-emerald"
              size="sm"
              onClick={() => { setIsNavigating(true); setTimeout(() => navigate(-1), 600); }}
              disabled={isNavigating}
              className="whitespace-nowrap"
            >
              Cancel
            </Button>
            <Button
              variant="outline-emerald"
              size="sm"
              onClick={() => setIsRequestModalOpen(true)}
              className="whitespace-nowrap gap-2"
            >
              Request Change
            </Button>
            <Button
              variant="outline-emerald"
              size="sm"
              onClick={handleSave}
              disabled={isLoading}
              className="whitespace-nowrap"
            >
              Save Draft
            </Button>
            <Button
              variant="outline-emerald"
              size="sm"
              onClick={handleConfirmSubmit}
              className="whitespace-nowrap"
            >
              Complete
            </Button>
          </>
        }
      />

      {/* ===== Course Info Card ===== */}
      <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 font-medium">{course.trainingId}</p>
            <h2 className="text-base lg:text-lg font-semibold text-slate-900 mt-0.5">
              {course.title}
            </h2>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-purple-50 text-purple-700 border-purple-200">
              Quiz (Manual)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Passing: {getPassingLabel()}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-3 border-t border-slate-100/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-2.5">
            <span className="text-xs sm:text-sm font-medium text-slate-700">
              Results: <span className="font-semibold">{resultsEntered}</span> / {rows.length}
            </span>
            <div className="flex items-center gap-2 sm:gap-3">
              {rows.some(hasValidationError) && (
                <div className="flex items-center gap-1 sm:gap-1.5 text-xs text-red-600 font-medium">
                  <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Missing evidence</span>
                  <span className="xs:hidden">No evidence</span>
                </div>
              )}
              <span className="text-sm sm:text-base font-bold text-emerald-700">
                {progressPercent}%
              </span>
            </div>
          </div>
          <div className="w-full h-2 sm:h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ===== Filters & Table Unified Card ===== */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden flex flex-col">
        {/* Section 2: Filters & Bulk Actions */}
        <div className="p-4 md:p-5 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 lg:gap-4 items-end">
            {/* Search - xl:col-span-4 */}
            <div className="xl:col-span-3">
              <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                Search
              </label>
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by Username, Name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 transition-colors bg-white"
                />
              </div>
            </div>

            {/* Status Filter - xl:col-span-2 */}
            <div className="xl:col-span-3">
              <Select
                label="Status"
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val as typeof statusFilter);
                  setCurrentPage(1);
                }}
                options={[
                  { label: "All", value: "all" },
                  { label: "Entered", value: "entered" },
                  { label: "Not Entered", value: "not-entered" },
                ]}
              />
            </div>

            {/* Department Filter - xl:col-span-3 */}
            <div className="xl:col-span-3">
              <Select
                label="Department"
                value={departmentFilter}
                onChange={(val) => {
                  setDepartmentFilter(val);
                  setCurrentPage(1);
                }}
                options={[
                  { label: "All Departments", value: "all" },
                  ...uniqueDepartments.map((dept) => ({ label: dept, value: dept })),
                ]}
              />
            </div>

            {/* Bulk Exam Date - xl:col-span-2 */}
            <div className="xl:col-span-2">
              <DateTimePicker
                label="Set Exam Date for All"
                value={bulkExamDate}
                onChange={setBulkExamDate}
                placeholder="Select date"
              />
            </div>

            {/* Apply Button - xl:col-span-1 */}
            <div className="xl:col-span-1">
              <Button
                variant="default"
                size="sm"
                onClick={handleApplyBulkExamDate}
                disabled={!bulkExamDate}
                className="w-full"
              >
                <span className="hidden lg:inline">Apply</span>
                <span className="lg:hidden">Apply to All</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ===== Table Section ===== */}
        <div className="px-4 md:px-5 pb-4 md:pb-5 flex-1 flex flex-col relative min-h-0 text-left">
          <div className={cn(
            "border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-white transition-all duration-300 min-h-0",
            isDragging && "select-none"
          )}>
            <div
              ref={scrollerRef}
              className={cn(
                "flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50 hover:scrollbar-thumb-slate-400 pb-1.5 transition-colors",
                isDragging ? "cursor-grabbing select-none" : "cursor-grab"
              )}
              {...dragEvents}
            >
              <table className="w-full border-separate border-spacing-0 text-left">
                <thead>
                  <tr>
                    <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-center text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap w-16">
                      No.
                    </th>
                    <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap">
                      Employee Code
                    </th>
                    <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap min-w-[180px]">
                      Name
                    </th>
                    <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap hidden lg:table-cell">
                      Email
                    </th>
                    <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap hidden xl:table-cell">
                      Job Title
                    </th>
                    <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap hidden md:table-cell">
                      Department
                    </th>
                    <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap min-w-[140px]">
                      Business Unit
                    </th>
                    <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap min-w-[150px]">
                      Exam Date
                    </th>
                    <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-left text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap min-w-[130px]">
                      {course.passingGradeType === "pass_fail" ? "Result" : "Score"}
                    </th>
                    <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-center text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap w-[100px]">
                      Status
                    </th>
                    <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3.5 md:px-4 text-center text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap w-[140px]">
                      Evidence
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={11}>
                        <TableEmptyState
                          icon={<Search className="h-8 w-8 text-slate-300" />}
                          title="No Results Found"
                          description="We couldn't find any employees matching your current search and filters. Try adjusting your criteria or clear the search."
                        />
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, index) => {
                      const status = getScoreStatus(row);
                      const hasError = hasValidationError(row);
                      const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                      const tdClass = "py-2.5 px-2 md:py-3.5 md:px-4 text-xs md:text-sm text-slate-700 border-b border-slate-200 whitespace-nowrap";

                      return (
                        <tr
                          key={row.userId}
                          className={cn(
                            "transition-colors hover:bg-slate-50/80 group",
                            hasError && "bg-red-50/50"
                          )}
                        >
                          <td className={cn(tdClass, "text-center text-slate-500 font-medium")}>
                            {rowNumber}
                          </td>
                          <td className={tdClass}>
                            <span className="font-semibold text-emerald-600">{row.userId}</span>
                          </td>
                          <td className={tdClass}>
                            <span className="font-bold text-slate-900">{row.name}</span>
                          </td>
                          <td className={cn(tdClass, "text-slate-600 hidden lg:table-cell")}>
                            {row.email}
                          </td>
                          <td className={cn(tdClass, "text-slate-600 hidden xl:table-cell")}>
                            {row.jobTitle}
                          </td>
                          <td className={cn(tdClass, "text-slate-600 hidden md:table-cell")}>
                            {row.department}
                          </td>
                          <td className={tdClass}>
                            {row.businessUnit}
                          </td>
                          <td className={cn(tdClass, "min-w-[150px]")}>
                            <div className={cn(row.isReadonly && !isEditingAllowed && "opacity-60 pointer-events-none")}>
                              <DateTimePicker
                                value={row.examDate}
                                onChange={(val) => updateRow(row.userId, { examDate: val })}
                                placeholder="Select date"
                              />
                            </div>
                          </td>
                          <td className={cn(tdClass, "min-w-[130px]")}>
                            {course.passingGradeType === "pass_fail" ? (
                              <div className={cn("flex items-center justify-start gap-1", row.isReadonly && !isEditingAllowed && "opacity-60 pointer-events-none")}>
                                <button
                                  onClick={() => {
                                    if (statusFilter !== "all") setStatusFilter("all");
                                    updateRow(row.userId, { score: 1 });
                                  }}
                                  className={cn(
                                    "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
                                    row.score === 1
                                      ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500"
                                      : "bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                                  )}
                                  aria-label="Pass"
                                >
                                  <CheckCircle2 className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (statusFilter !== "all") setStatusFilter("all");
                                    updateRow(row.userId, { score: 0 });
                                  }}
                                  className={cn(
                                    "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
                                    row.score === 0
                                      ? "bg-red-100 text-red-700 ring-2 ring-red-500"
                                      : "bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                  )}
                                  aria-label="Fail"
                                >
                                  <XCircle className="h-5 w-5" />
                                </button>
                              </div>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                max={getScoreMax()}
                                step={course.passingGradeType === "score_10" ? 0.5 : 1}
                                value={row.score ?? ""}
                                onChange={(e) => handleScoreChange(row.userId, e.target.value)}
                                disabled={row.isReadonly && !isEditingAllowed}
                                placeholder={course.passingGradeType === "score_10" ? "0-10" : "0-100"}
                                className={cn(
                                  "w-20 md:w-24 h-9 px-3 border rounded-lg text-sm text-center focus:outline-none focus:ring-1 transition-colors font-semibold",
                                  hasError
                                    ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                                    : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500",
                                  row.isReadonly && !isEditingAllowed && "bg-slate-50 text-slate-500 cursor-not-allowed pointer-events-none"
                                )}
                              />
                            )}
                          </td>
                          <td className={cn(tdClass, "text-center")}>
                            {status === "none" ? (
                              <span className="text-xs text-slate-400">—</span>
                            ) : status === "pass" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] md:text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                PASS
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] md:text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                                <XCircle className="h-3.5 w-3.5" />
                                FAIL
                              </span>
                            )}
                          </td>
                          <td className={tdClass}>
                            <input
                              ref={(el) => { fileInputRefs.current[row.userId] = el; }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(row.userId, file);
                                e.target.value = "";
                              }}
                            />
                            {row.evidencePreview ? (
                              <div className="flex items-center gap-2 justify-center">
                                <button
                                  onClick={() => handlePreviewImage(row.evidencePreview!)}
                                  className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-slate-200 hover:ring-2 hover:ring-emerald-400 transition-all group"
                                  aria-label="Preview evidence"
                                >
                                  <img
                                    src={row.evidencePreview}
                                    alt="Evidence"
                                    className="h-full w-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </button>
                                <button
                                  onClick={() => (!row.isReadonly || isEditingAllowed) && handleRemoveImage(row.userId)}
                                  disabled={row.isReadonly && !isEditingAllowed}
                                  className={cn("h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors", row.isReadonly && !isEditingAllowed && "opacity-50 cursor-not-allowed")}
                                  aria-label="Remove evidence"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => (!row.isReadonly || isEditingAllowed) && fileInputRefs.current[row.userId]?.click()}
                                disabled={row.isReadonly && !isEditingAllowed}
                                className={cn(
                                  "mx-auto flex items-center gap-1.5 h-9 px-3 rounded-lg border-2 border-dashed transition-colors text-xs font-bold",
                                  hasError
                                    ? "border-red-300 text-red-500 hover:bg-red-50 bg-red-50/50"
                                    : "border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300",
                                  row.isReadonly && !isEditingAllowed && "opacity-50 cursor-not-allowed bg-slate-50"
                                )}
                              >
                                <Upload className="h-4 w-4" />
                                UPLOAD
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredRows.length > 0 && (
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredRows.length}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                showItemCount={true}
              />
            )}
          </div>
        </div>
      </div>

      {/* ===== E-Signature Modal ===== */}
      <ESignatureModal
        isOpen={isESignOpen}
        onClose={() => setIsESignOpen(false)}
        onConfirm={handleESignConfirm}
        actionTitle={esignType === "complete" ? `Submit Results (${resultsEntered})` : "Approve Change Request"}
      />

      {/* ===== Change Request Modal ===== */}
      <FormModal
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false);
          setReasonForChange("");
        }}
        onConfirm={handleRequestChangeTrigger}
        title="Request Change"
        confirmText="Submit Request"
        confirmDisabled={!reasonForChange.trim()}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">
              Reason for Change <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reasonForChange}
              onChange={(e) => setReasonForChange(e.target.value)}
              placeholder="Explain why these results need to be corrected or updated (e.g., mis-entry, score correction, new evidence)..."
              className="w-full h-32 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm placeholder:text-slate-400 resize-none"
            />
          </div>
        </div>
      </FormModal>

      {/* ===== Image Preview Modal ===== */}
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        imageUrl={previewImage}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewImage(null);
        }}
      />

      {/* ===== Alert Modal ===== */}
      <AlertModal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isLoading && !isNavigating) setIsModalOpen(false);
        }}
        onConfirm={
          modalAction
            ? () => {
              setIsNavigating(true);
              setTimeout(() => {
                modalAction();
              }, 600);
            }
            : undefined
        }
        type={modalType}
        title={modalTitle}
        description={modalDescription}
        isLoading={isLoading}
        confirmText={
          modalType === "success"
            ? "Done"
            : modalType === "confirm"
              ? "Confirm & Sign"
              : undefined
        }
      />

      {(isLoading || isNavigating) && <FullPageLoading text="Processing..." />}
    </div>
  );
};


