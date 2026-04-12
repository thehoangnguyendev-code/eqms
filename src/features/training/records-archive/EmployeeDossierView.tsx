import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Briefcase,
  Clock,
  CheckCircle2,
  ShieldCheck,
  History,
  Award,
  BookOpen,
  Calendar,
  Printer,
  FileSignature,
  UserCircle,
  FileText,
  Stamp,
  Verified,
  MoreVertical,
  Check,
  AlertTriangle,
  GraduationCap,
  Mail,
  Smartphone,
  Info,
  ArrowRight,
  Plus,
  Pickaxe
} from "lucide-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { Button } from "@/components/ui/button/Button";
import { Card } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { ESignatureModal } from "@/components/ui/esign-modal/ESignatureModal";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { FormSection } from "@/components/ui/form";
import { TabNav, TabItem } from "@/components/ui/tabs/TabNav";
import { MOCK_EMPLOYEE_TRAINING_FILES } from "./mockData";
import { ROUTES } from "@/app/routes.constants";
import { employeeDossier } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { cn } from "@/components/ui/utils";
import { IconHandClick } from "@tabler/icons-react";

// Tab types
type TabType = "overview" | "sops" | "ojt" | "auth";

export const EmployeeDossierView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isNavigating, setIsNavigating] = useState(false);
  const [showESign, setShowESign] = useState(false);
  const [selectedOJT, setSelectedOJT] = useState<any>(null);

  const handleNavigate = (path: string | number) => {
    setIsNavigating(true);
    setTimeout(() => {
      if (typeof path === "number") navigate(path);
      else navigate(path);
    }, 600);
  };

  // Find employee data
  const employee = useMemo(() =>
    MOCK_EMPLOYEE_TRAINING_FILES.find(e => e.id === id),
    [id]);

  if (!employee) {
    return (
      <div className="space-y-6 w-full flex-1 flex flex-col">
        <PageHeader title="Not Found" breadcrumbItems={[{ label: 'Record Archive' }, { label: 'Dossier' }]} />
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <p className="text-lg font-bold text-slate-900">Employee dossier not found</p>
          <p className="text-sm text-slate-500 mt-1">
            The requested employee record does not exist in our archives.
          </p>
          <Button variant="outline" className="mt-6 border-slate-200" onClick={() => handleNavigate(-1)}>Back to list</Button>
        </div>
      </div>
    );
  }

  const dossierTabs: TabItem[] = [
    { id: "overview", label: "General Overview", icon: UserCircle },
    { id: "sops", label: "SOP Training", icon: FileText, count: 5 },
    { id: "ojt", label: "OJT Verification", icon: Pickaxe, count: employee.ojtRecords?.length },
    { id: "auth", label: "Authorizations", icon: ShieldCheck, count: employee.authorizations?.length },
  ];

  const handleVerifyOJT = (ojt: any) => {
    setSelectedOJT(ojt);
    setShowESign(true);
  };

  const onSignConfirm = (reason: string) => {
    console.log(`Signed OJT: ${selectedOJT?.taskName} with reason: ${reason}`);
    setShowESign(false);
    setSelectedOJT(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-8">
                {/* Employment Information */}
                <FormSection title="Employment Information" icon={<Briefcase className="h-4 w-4" />}>
                  <div className="space-y-0">
                    {[
                      { label: "Position", value: employee.jobPosition, bold: true },
                      { label: "Department", value: employee.department },
                      { label: "Manager", value: "Hoang Nguyen (QA Director)", underline: true },
                      { label: "Business Unit", value: employee.businessUnit || "N/A" },
                      { label: "Join Date", value: "15 Jan 2024 (2.5 Years Service)" },
                    ].map((row, i, arr) => (
                      <div key={i} className={cn(
                        "flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2 py-3 lg:py-4",
                        i !== arr.length - 1 && "border-b border-slate-100"
                      )}>
                        <label className="text-xs sm:text-sm font-medium text-slate-500 w-full lg:w-40 flex-shrink-0">{row.label}</label>
                        <p className={cn(
                          "text-xs lg:text-sm text-slate-900 flex-1",
                          row.bold && "font-bold",
                          row.underline && "underline decoration-slate-200 cursor-pointer"
                        )}>
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </FormSection>

                {/* Contact & System Info */}
                <FormSection title="Contact & Access Info" icon={<Mail className="h-4 w-4" />}>
                  <div className="space-y-0">
                    {[
                      { label: "Email Address", value: employee.email || "N/A", bold: true },
                      { label: "Phone Number", value: "+84 908 *** 123" },
                      { label: "Last System Login", value: "Today, 08:45 AM (IP: 192.168.1.5)" },
                      { label: "Auth Level", value: "Internal Personnel - Level 2" },
                    ].map((row, i, arr) => (
                      <div key={i} className={cn(
                        "flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2 py-3 lg:py-4",
                        i !== arr.length - 1 && "border-b border-slate-100"
                      )}>
                        <label className="text-xs sm:text-sm font-medium text-slate-500 w-full lg:w-40 flex-shrink-0">{row.label}</label>
                        <p className={cn(
                          "text-xs lg:text-sm text-slate-900 flex-1",
                          row.bold && "font-bold"
                        )}>
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </FormSection>
              </div>

              <div className="space-y-8">
                {/* Training & Compliance Summary */}
                <FormSection title="Compliance Status" icon={<ShieldCheck className="h-4 w-4" />}>
                  <div className="space-y-5">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Audit Status</p>
                        <p className="text-sm font-bold text-emerald-900">GMP COMPLIANT - AUDIT READY</p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 opacity-50" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500 uppercase tracking-tight">Overall SOP Progress</span>
                        <span className="text-slate-900">{Math.round((employee.coursesCompleted / employee.totalCoursesRequired) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div
                          className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                          style={{ width: `${(employee.coursesCompleted / employee.totalCoursesRequired) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-3.5 w-3.5 text-red-500" />
                          <span className="text-[10px] font-black text-red-700 uppercase">Alert</span>
                        </div>
                        <p className="text-xs text-red-600 font-bold leading-tight">Refresher Due in 12 days</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Info className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-[10px] font-black text-amber-700 uppercase">Remark</span>
                        </div>
                        <p className="text-xs text-amber-600 font-bold leading-tight">OJT Signature Required</p>
                      </div>
                    </div>
                  </div>
                </FormSection>

                {/* Assignment & Qualifications */}
                <FormSection title="Assignment & Qualifications" icon={<Award className="h-4 w-4" />}>
                  <div className="space-y-6">
                    {/* Active JD Card */}
                    <div className="p-4 rounded-xl bg-slate-900 text-white relative overflow-hidden shadow-lg group cursor-pointer">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-3xl -mr-12 -mt-12 transition-colors group-hover:bg-emerald-500/20" />
                      <div className="relative z-10">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5 lead">Primary Assignment</p>
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-bold text-white tracking-tight leading-tight">JD-QA-MGR-01</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">QA Manager (Revision 2.0)</p>
                          </div>
                          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                            <ArrowRight className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Core Credentials</label>
                        <div className="flex flex-wrap gap-2">
                          <Badge color="emerald" variant="soft" size="xs" showDot className="font-bold">Master of Science</Badge>
                          <Badge color="blue" variant="soft" size="xs" showDot className="font-bold">Lean Six Sigma</Badge>
                          <Badge color="purple" variant="soft" size="xs" showDot className="font-bold">Internal Auditor</Badge>
                        </div>
                      </div>

                      <div className="pt-5 border-t border-slate-100">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <History className="h-3 w-3" /> Recent Verification Logs
                        </label>
                        <div className="space-y-4">
                          {[
                            { event: "Assessment passed: SOP-QA-001", time: "Today, 10:30 AM", user: "Hoang Nguyen" },
                            { event: "OJT Verified: Aseptic Gowning", time: "Yesterday, 02:45 PM", user: "System" },
                          ].map((l, i) => (
                            <div key={i} className="flex gap-3 pl-0.5 group">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1.5 shrink-0 transition-colors group-hover:bg-emerald-500" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 leading-tight truncate">{l.event}</p>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-medium">
                                  <span>{l.time}</span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                                  <span>by {l.user}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </FormSection>
              </div>
            </div>
          </div>
        );
      case "sops":
        return (
          <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  Mandatory SOP Training Records
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Requirements for {employee.jobPosition} role</p>
              </div>
              <Badge color="slate" variant="soft" size="xs" className="font-bold">EU-GMP Annex 1</Badge>
            </div>

            <div className="max-h-[460px] overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300">
              <div className="grid grid-cols-1 gap-2.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center group-hover:text-emerald-600 group-hover:border-emerald-100 transition-colors shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate leading-tight group-hover:text-slate-900">
                          SOP-QA-00{i}: Implementation of Environmental Monitoring Program
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[10px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            <History className="h-3 w-3" /> Ver 2.0
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" /> Date: 15/03/2026
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Score: 95/100
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCircle className="h-3 w-3 text-slate-400" /> Trainer: Nguyen An
                          </span>
                          <span className="flex items-center gap-1 text-emerald-600">
                            <ShieldCheck className="h-3 w-3" /> Recurring: 12M
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 ml-4">
                      <StatusBadge status="effective" size="xs" label="COMPLIANT" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <p>Showing 8 records based on active matrices</p>
              <Button variant="link" size="xs" className="font-bold -px-2">View All Full History</Button>
            </div>
          </div>
        );
      case "ojt":
        return (
          <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Pickaxe className="h-4 w-4 text-emerald-600" />
                  Practical Competence (OJT)
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Hands-on skill verification records</p>
              </div>
              <Button size="sm" variant="default" className="h-8 shadow-sm gap-2">
                <Plus className="h-3.5 w-3.5" /> Add Record
              </Button>
            </div>

            <div className="max-h-[460px] overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300">
              <div className="grid grid-cols-1 gap-2.5">
                {employee.ojtRecords?.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all group">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                        record.status === 'Completed' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-white border-slate-200 text-slate-400 group-hover:border-amber-100 group-hover:text-amber-600"
                      )}>
                        {record.status === 'Completed' ? <Verified className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate leading-tight group-hover:text-slate-900">
                          {record.taskName}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500 font-medium whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <UserCircle className="h-3 w-3 text-slate-400" /> Trainer: {record.trainerName}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" /> {record.dateCompleted ? `Verified: ${record.dateCompleted}` : "Pending Verification"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-4">
                      {record.status === 'Pending' ? (
                        <Button
                          size="xs"
                          variant="outline-emerald"
                          className="h-7 text-xs gap-1.5 px-3"
                          onClick={() => handleVerifyOJT(record)}
                        >
                          <FileSignature className="h-3 w-3" /> Verify
                        </Button>
                      ) : (
                        <Badge color="emerald" variant="soft" size="xs" icon={<Check className="h-3.5 w-3.5" />}>
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              <p>Total {employee.ojtRecords?.length || 0} practical competencies recorded for this dossier.</p>
            </div>
          </div>
        );
      case "auth":
        return (
          <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 gap-4">
              {employee.authorizations?.map((auth) => (
                <Card key={auth.id} className="p-6 flex flex-col sm:flex-row items-center justify-between border-slate-200 shadow-none hover:border-emerald-200 transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ShieldCheck className="h-8 w-8 text-emerald-400" />
                    </div>
                    <div>
                      <h5 className="text-base font-bold text-slate-900">{auth.taskTitle}</h5>
                      <p className="text-xs text-slate-500 font-medium">Signing Authority Level: **Level 2**</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">Verified by: {auth.signedBy}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center sm:items-end gap-2">
                    <Badge color="emerald" variant="soft" className="font-extrabold uppercase tracking-tight">Active Authorization</Badge>
                    <p className="text-[10px] text-slate-400 font-medium">Expires: {auth.expiryDate}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col pb-10">
      {/* Header */}
      <PageHeader
        title="Employee Dossier"
        breadcrumbItems={employeeDossier(navigate)}
        actions={
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <Button
              variant="outline-emerald"
              size="sm"
              onClick={() => handleNavigate(-1)}
              className="whitespace-nowrap"
            >
              Back
            </Button>
            <Button
              variant="outline-emerald"
              size="sm"
              onClick={() => window.print()}
              className="whitespace-nowrap gap-2"
            >
              Export Dossier
            </Button>
          </div>
        }
      />

      {/* Personnel Summary Card - FormSection Style */}
      <div className="space-y-6">
        <FormSection
          title="Personnel Summary"
          icon={<UserCircle className="h-4 w-4 text-emerald-600" />}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold text-emerald-600">{employee.employeeId}</span>
            <div className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-[10px] font-semibold text-slate-600 uppercase leading-none">Record Archive</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight">
                {employee.employeeName}
              </h2>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  <Briefcase className="h-3.5 w-3.5 text-emerald-500" /> {employee.jobPosition}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" /> {employee.department}
                </div>
                <StatusBadge status="effective" label="GMP COMPLIANT" size="xs" className="h-5" />
              </div>
            </div>
            <div className="flex items-center gap-4 bg-emerald-50/40 p-3 rounded-xl border border-emerald-100 border-dashed">
              <div className="h-10 w-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-emerald-100">
                <Award className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-[9px] font-black text-emerald-700/60 uppercase tracking-widest mb-0.5">Qualification Rank</p>
                <p className="text-sm font-bold text-slate-900 uppercase">Expert Level Personnel</p>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Tab Container using Central TabNav */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
          <TabNav tabs={dossierTabs} activeTab={activeTab} onChange={setActiveTab} />

          <div className="flex-1 bg-white min-h-[400px]">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* E-Signature Modal */}
      {selectedOJT && (
        <ESignatureModal
          isOpen={showESign}
          onClose={() => setShowESign(false)}
          onConfirm={onSignConfirm}
          actionTitle="Practical Skill Verification"
          documentDetails={{
            code: selectedOJT.id,
            title: selectedOJT.taskName,
            revision: "OJT-RECORD"
          }}
        />
      )}

      {isNavigating && <FullPageLoading text="Updating dossier..." />}
    </div>
  );
};
