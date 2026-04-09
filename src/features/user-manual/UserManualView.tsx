import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  GraduationCap,
  FileBarChart,
  ChevronRight,
  Info,
  Lightbulb,
  ListChecks,
  Star,
  AlertCircle,
  CheckCircle2,
  LayoutGrid,
  PanelLeftOpen,
  RefreshCw,
  FileText,
  BarChart3,
  Truck,
  ShieldCheck,
  ClipboardList,
  Wrench,
  Settings,
  Scale,
  Package,
  Bell,
} from "lucide-react";
import {
  IconLayoutGrid,
  IconFileDescription,
  IconAlertTriangle,
  IconClipboardCheck,
  IconReplace,
  IconMessageReport,
  IconShieldExclamation,
  IconDeviceLaptop,
  IconBuildingStore,
  IconFilter2Search,
  IconSettings2,
  IconAdjustmentsHorizontal,
  IconMessageChatbot,
  IconChartHistogram,
  IconBrandAsana,
} from "@tabler/icons-react";
import { cn } from "@/components/ui/utils";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { userManual } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Select } from "@/components/ui/select/Select";
import manualContentData from "./userManualContent.json";

// ─── Icon Mapping ────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  // Tabler Icons
  IconLayoutGrid,
  IconFileDescription,
  IconAlertTriangle,
  IconClipboardCheck,
  IconReplace,
  IconMessageReport,
  IconShieldExclamation,
  IconDeviceLaptop,
  IconBuildingStore,
  IconFilter2Search,
  IconSettings2,
  // Lucide Icons
  BarChart3,
  ClipboardList,
  RefreshCw,
  AlertCircle,
  FileText,
  CheckCircle2,
  Truck,
  GraduationCap,
  FileBarChart,
  ListChecks,
  ShieldCheck,
  Wrench,
  Settings,
  Info,
  Search,
  Scale,
  IconAdjustmentsHorizontal,
  IconMessageChatbot,
  IconChartHistogram,
  IconBrandAsana,
  Package,
  Bell,
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface Step {
  step: number;
  title: string;
  description: string;
}

interface FeatureCard {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  iconColor: string;
}

interface TipItem {
  type: "tip" | "warning" | "info";
  text: string;
}

interface ManualSection {
  id: string;
  title: string;
  overview: string;
  features: FeatureCard[];
  steps: Step[];
  tips: TipItem[];
}

interface ManualTab {
  id: string;
  label: string;
  icon: React.ElementType;
  section: ManualSection;
}

// ─── Content ─────────────────────────────────────────────────────────────────

// Transform JSON data into ManualTab[] format with icon components
const MANUAL_TABS: ManualTab[] = Object.entries(manualContentData).map(([id, data]: [string, any]) => ({
  id,
  label: data.label,
  icon: ICON_MAP[data.iconName],
  section: {
    ...data.section,
    features: data.section.features.map((f: any) => ({
      ...f,
      icon: ICON_MAP[f.iconName],
    })),
  },
}));

// ─── Helper Components ────────────────────────────────────────────────────────

const TipBadge: React.FC<{ type: TipItem["type"] }> = ({ type }) => {
  if (type === "tip")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
        <Lightbulb className="h-3 w-3" />
        Tip
      </span>
    );
  if (type === "warning")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 flex-shrink-0">
        <AlertCircle className="h-3 w-3" />
        Warning
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
      <Info className="h-3 w-3" />
      Info
    </span>
  );
};

// ─── Section Content (shared between Tab and Split views) ─────────────────────

const SectionContent: React.FC<{ section: ManualSection }> = ({ section }) => (
  <div className="p-5 space-y-5 animate-in fade-in duration-200">
    {/* Overview */}
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
        <span className="text-emerald-600"><BookOpen className="h-4 w-4" /></span>
        <h3 className="text-sm font-semibold text-slate-800">Overview</h3>
      </div>
      <div className="p-5">
        <p className="text-sm text-slate-700 leading-relaxed">{section.overview}</p>
      </div>
    </div>

    {/* Key Features */}
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
        <span className="text-emerald-600"><Star className="h-4 w-4" /></span>
        <h3 className="text-sm font-semibold text-slate-800">Key Features</h3>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {section.features.map((feature, idx) => {
            const FeatureIcon = feature.icon;
            return (
              <div
                key={idx}
                className="flex flex-col gap-3 p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className={cn("flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0", feature.color)}>
                  <FeatureIcon className={cn("h-4 w-4", feature.iconColor)} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{feature.title}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* Step-by-step Guide */}
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
        <span className="text-emerald-600"><ListChecks className="h-4 w-4" /></span>
        <h3 className="text-sm font-semibold text-slate-800">Step-by-Step Guide</h3>
      </div>
      <div className="p-5">
        <div className="space-y-3">
          {section.steps.map((step) => (
            <div key={step.step} className="flex gap-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex-shrink-0">
                  {step.step}
                </div>
                {step.step < section.steps.length && (
                  <div className="w-px flex-1 bg-slate-200 mt-1" style={{ minHeight: "1rem" }} />
                )}
              </div>
              <div className="flex-1 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Tips & Notes */}
    {section.tips.length > 0 && (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
          <span className="text-emerald-600"><Lightbulb className="h-4 w-4" /></span>
          <h3 className="text-sm font-semibold text-slate-800">Tips & Notes</h3>
        </div>
        <div className="p-5 space-y-3">
          {section.tips.map((tip, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border",
                tip.type === "tip" && "bg-emerald-50/50 border-emerald-100",
                tip.type === "warning" && "bg-amber-50/50 border-amber-100",
                tip.type === "info" && "bg-blue-50/50 border-blue-100"
              )}
            >
              <TipBadge type={tip.type} />
              <p className="text-sm text-slate-700 leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// ─── Main View ────────────────────────────────────────────────────────────────

export const UserManualView: React.FC = () => {
  const [activeTab, setActiveTab] = useState(MANUAL_TABS[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  const currentSection = MANUAL_TABS.find((t) => t.id === activeTab)!.section;

  const filteredTabs = useMemo(() => {
    if (!searchQuery.trim()) return MANUAL_TABS;
    const q = searchQuery.toLowerCase();
    return MANUAL_TABS.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.section.title.toLowerCase().includes(q) ||
        t.section.overview.toLowerCase().includes(q) ||
        t.section.features.some(
          (f) =>
            f.title.toLowerCase().includes(q) ||
            f.description.toLowerCase().includes(q)
        ) ||
        t.section.steps.some(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q)
        )
    );
  }, [searchQuery]);

  const visibleTabs = searchQuery ? filteredTabs : MANUAL_TABS;

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* ── Header ── */}
      <PageHeader
        title="User Manual"
        breadcrumbItems={userManual()}
        actions={
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400 bg-white"
            />
          </div>
        }
      />

      {/* ── Search Results Notice ── */}
      {searchQuery && (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
          Found <span className="font-semibold text-slate-900">{filteredTabs.length}</span> module
          {filteredTabs.length !== 1 ? "s" : ""} matching&nbsp;
          &ldquo;<span className="text-emerald-700">{searchQuery}</span>&rdquo;
          <button
            onClick={() => setSearchQuery("")}
            className="ml-2 text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MOBILE SELECT — Mobile only
      ══════════════════════════════════════════ */}
      <div className="lg:hidden">
        <Select
          label="Select Module"
          value={activeTab}
          onChange={(value) => setActiveTab(value)}
          options={visibleTabs.map((tab) => ({
            label: tab.label,
            value: tab.id,
          }))}
          placeholder="Choose a module..."
          enableSearch
        />
      </div>

      {/* ══════════════════════════════════════════
          SPLIT VIEW — Desktop & Tablet
      ══════════════════════════════════════════ */}

      {/* Mobile-only sticky module title bar */}
      <div className="lg:hidden border-b-2 sticky top-0 z-20 -mx-4 px-4 -mt-2 pt-2 pb-2 bg-slate-50">
        <div className="flex items-center gap-3 px-4 py-2.5 border border-slate-200 rounded-xl bg-white shadow-sm">
          {(() => {
            const tab = MANUAL_TABS.find((t) => t.id === activeTab)!;
            const Icon = tab.icon;
            return (
              <>
                <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-100 flex-shrink-0">
                  <Icon className="h-4 w-4 text-emerald-600" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">{currentSection.title}</h2>
              </>
            );
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left — Module List (col-2) — Hidden on mobile */}
        <div className="hidden lg:block lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Modules List</h3>
          </div>
          <div>
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex items-center gap-3 w-full px-4 py-3.5 text-sm border-b border-slate-100 transition-colors text-left",
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-600 rounded-r-full" />
                  )}
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">{tab.label}</span>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right — Content (col-10 on desktop, full width on mobile) */}
        <div className="lg:col-span-9 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:max-h-[calc(100vh-220px)]">
          {/* Module title bar — desktop only (mobile has sticky version above) */}
          <div className="hidden lg:flex items-center gap-3 px-5 py-3 border-b border-slate-100 flex-shrink-0">
            {(() => {
              const tab = MANUAL_TABS.find((t) => t.id === activeTab)!;
              const Icon = tab.icon;
              return (
                <>
                  <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-emerald-100 flex-shrink-0">
                    <Icon className="h-4 w-4 text-emerald-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-900">{currentSection.title}</h2>
                </>
              );
            })()}
          </div>
          <div className="lg:overflow-y-auto flex-1">
            <SectionContent section={currentSection} />
          </div>
        </div>
      </div>
    </div>
  );
};
