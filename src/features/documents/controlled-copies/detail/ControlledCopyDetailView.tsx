import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTES } from '@/app/routes.constants';
import {
  Calendar,
  MapPin,
  User,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Upload,
  ChevronLeft,
  AlertTriangle,
  Check,
  Info,
  Send,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { cn } from "@/components/ui/utils";
import { TabNav } from "@/components/ui/tabs/TabNav";
import { ESignatureModal } from "@/components/ui/esign-modal/ESignatureModal";
import { useToast } from "@/components/ui/toast/Toast";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { ControlledCopy, ControlledCopyStatus, CurrentStage } from "../types";
import {
  MOCK_CONTROLLED_COPY_DETAIL as MOCK_CONTROLLED_COPY,
  MOCK_TIMELINE,
  type TimelineEvent,
} from "../mockData";
import { DestructionTypeSelectionModal } from "../components/DestructionTypeSelectionModal";
import { IconFileShredder, IconShare3 } from "@tabler/icons-react";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { controlledCopyDetail } from "@/components/ui/breadcrumb/breadcrumbs.config";
import {
  DocumentInformationTab,
  DistributionInformationTab,
  SignaturesTab,
  AuditTrailTab,
} from "./tabs";

// Timeline Component
const Timeline: React.FC<{ events: TimelineEvent[] }> = ({ events }) => {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200" />

      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={event.id} className="relative flex gap-4">
            {/* Timeline dot */}
            <div className="relative z-10">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2",
                  event.status === "completed" &&
                    "bg-emerald-50 border-emerald-500",
                  event.status === "pending" && "bg-amber-50 border-amber-500",
                  event.status === "rejected" && "bg-red-50 border-red-500"
                )}
              >
                {event.status === "completed" && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                )}
                {event.status === "pending" && (
                  <Clock className="h-4 w-4 text-amber-600" />
                )}
                {event.status === "rejected" && (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>

            {/* Event content */}
            <div className="flex-1 pb-6">
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">
                      {event.action}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">
                      by {event.actor}
                    </p>
                    {event.comment && (
                      <p className="text-sm text-slate-500 mt-2 italic">
                        "{event.comment}"
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {event.timestamp}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Tab Type
type TabType = "document" | "distribution" | "signatures" | "audit";

// Main Component
interface ControlledCopyDetailViewProps {
  controlledCopyId: string;
  onBack: () => void;
  initialTab?: TabType;
}

export const ControlledCopyDetailView: React.FC<ControlledCopyDetailViewProps> = ({
  controlledCopyId,
  onBack,
  initialTab = "document",
}) => {
  const navigate = useNavigate();

  const [controlledCopy] = useState<ControlledCopy>(MOCK_CONTROLLED_COPY);
  const [timeline] = useState<TimelineEvent[]>(MOCK_TIMELINE);
  const [isDestructionModalOpen, setIsDestructionModalOpen] = useState(false);
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [isReportLostDamagedModalOpen, setIsReportLostDamagedModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab') as TabType;
  const [activeTab, setActiveTab] = useState<TabType>(urlTab || initialTab);
  const [isNavigating, setIsNavigating] = useState(false);
  const { showToast } = useToast();

  // Status workflow steps
  const statusSteps: ControlledCopyStatus[] = [
    "Ready for Distribution",
    "Distributed",
    "Obsolete",
    "Closed - Cancelled",
  ];
  // Tabs configuration
  const tabs = [
    { id: "document" as TabType, label: "Document Information" },
    { id: "distribution" as TabType, label: "Distribution Information" },
    { id: "signatures" as TabType, label: "Signatures" },
    { id: "audit" as TabType, label: "Audit Trail" },
  ];

  const currentStepIndex = statusSteps.indexOf(controlledCopy.status);

  const handleViewOriginalDocument = () => {
    // Navigate to original document detail view
    if (controlledCopy.documentId) {
      setIsNavigating(true);
      setTimeout(() => navigate(ROUTES.DOCUMENTS.DETAIL(controlledCopy.documentId!)), 600);
    }
  };

  const handleMarkAsDestroyed = (
    formData: any,
    reason: string
  ) => {
    // TODO: Call API to mark as destroyed with all form data
    // Update controlled copy with destruction info
    // Add timeline event
    alert(
      `Controlled copy marked as destroyed.\nMethod: ${formData.destructionMethod}\nExecutor: ${formData.destructedBy}\nSupervisor: ${formData.destructionSupervisor}`
    );
  };

  const handleDistribute = () => {
    // Mở modal ký điện tử để xác nhận phân phối
    setIsDistributeModalOpen(true);
  };

  const handleDistributeSuccess = (reason: string) => {
    // Đóng modal
    setIsDistributeModalOpen(false);
    
    // Hiển thị toast thành công
    showToast({
      type: "success",
      title: "Controlled Copy Distributed",
      message: "The controlled copy has been successfully distributed.",
      duration: 3500,
    });

    // Thực hiện distribute
    // TODO: Call API to distribute controlled copy
    // Update status to "Distributed"
    // Add audit trail entry
    // Send notification
  };

  const handleReportLostDamaged = () => {
    // Mở modal chọn type
    setIsReportLostDamagedModalOpen(true);
  };

  const handleReportLostDamagedConfirm = (type: "Lost" | "Damaged") => {
    // Đóng modal
    setIsReportLostDamagedModalOpen(false);
    
    // Navigate to destroy page với type parameter
    setIsNavigating(true);
    setTimeout(() => navigate(`${ROUTES.DOCUMENTS.CONTROLLED_COPIES.DESTROY(controlledCopy.id)}?type=${type}`), 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
              Controlled Copy Details
            </h1>
            <Breadcrumb items={controlledCopyDetail(navigate)} />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <Button onClick={() => { setIsNavigating(true); setTimeout(() => onBack(), 600); }} variant="outline-emerald" size="sm" className="whitespace-nowrap gap-1.5">
              Back
            </Button>
            <Button
              onClick={handleViewOriginalDocument}
              variant="outline-emerald"
              size="sm"
              className="whitespace-nowrap gap-1.5"
            >
              View Original
            </Button>
            {controlledCopy.status === "Ready for Distribution" && (
              <Button
                onClick={handleDistribute}
                variant="outline-emerald"
                size="sm"
                className="gap-1.5 shadow-sm"
              >
                Distribute
              </Button>
            )}
            {controlledCopy.status === "Distributed" && (
              <Button
                onClick={handleReportLostDamaged}
                variant="outline-emerald"
                size="sm"
                className="gap-1.5 shadow-sm"
              >
                <AlertCircle className="h-4 w-4" />
                Report Lost
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Status Stepper */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <div className="flex items-stretch min-w-full">
            {statusSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isFirst = index === 0;
              const isLast = index === statusSteps.length - 1;

              return (
                <div
                  key={step}
                  className="relative flex-1 flex items-center justify-center min-w-[150px]"
                  style={{ minHeight: "60px" }}
                >
                  {/* Arrow Shape Background */}
                  <div
                    className={cn(
                      "absolute inset-0 transition-all",
                      isCompleted
                        ? "bg-emerald-100"
                        : isCurrent
                        ? "bg-emerald-600"
                        : "bg-slate-100"
                    )}
                    style={{
                      clipPath: isFirst
                        ? "polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%)"
                        : isLast
                        ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 20px 50%)"
                        : "polygon(0% 0%, calc(100% - 20px) 0%, 100% 50%, calc(100% - 20px) 100%, 0% 100%, 20px 50%)",
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-2 px-6">
                    {isCompleted && (
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-xs md:text-sm font-medium text-center",
                        isCurrent
                          ? "text-white"
                          : isCompleted
                          ? "text-slate-700"
                          : "text-slate-400"
                      )}
                    >
                      {step}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TabNav tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as TabType)} />

        {/* Tab Content */}
        <div className="p-3 sm:p-4 md:p-6">
          <div className={cn(activeTab !== "document" && "hidden")}>
            <DocumentInformationTab controlledCopy={controlledCopy} />
          </div>
          <div className={cn(activeTab !== "distribution" && "hidden")}>
            <DistributionInformationTab controlledCopy={controlledCopy} />
          </div>
          <div className={cn(activeTab !== "signatures" && "hidden")}>
            <SignaturesTab />
          </div>
          <div className={cn(activeTab !== "audit" && "hidden")}>
            <AuditTrailTab />
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
        <Button onClick={() => { setIsNavigating(true); setTimeout(() => onBack(), 600); }} variant="outline-emerald" size="sm" className="whitespace-nowrap gap-1.5">
          Back
        </Button>
        <Button
          onClick={handleViewOriginalDocument}
          variant="outline-emerald"
          size="sm"
          className="whitespace-nowrap gap-1.5"
        >
          View Original
        </Button>
        {controlledCopy.status === "Ready for Distribution" && (
          <Button
            onClick={handleDistribute}
            variant="outline-emerald"
            size="sm"
            className="gap-1.5 shadow-sm"
          >
            Distribute
          </Button>
        )}
        {controlledCopy.status === "Distributed" && (
          <Button
            onClick={handleReportLostDamaged}
            variant="outline-emerald"
            size="sm"
            className="gap-1.5 shadow-sm"
          >
            <AlertCircle className="h-4 w-4" />
            Report Lost
          </Button>
        )}
      </div>

      {/* E-Signature Modal for Distribute */}
      <ESignatureModal
        isOpen={isDistributeModalOpen}
        onClose={() => setIsDistributeModalOpen(false)}
        onConfirm={handleDistributeSuccess}
        actionTitle="Distribute Controlled Copy"
      />

      {/* Destruction Type Selection Modal */}
      <DestructionTypeSelectionModal
        isOpen={isReportLostDamagedModalOpen}
        onClose={() => setIsReportLostDamagedModalOpen(false)}
        onConfirm={handleReportLostDamagedConfirm}
      />

      {isNavigating && <FullPageLoading text="Loading..." />}
    </div>
  );
};


