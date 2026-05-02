import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User as UserIcon, GraduationCap, ShieldCheck, AlertTriangle } from "lucide-react";
import { TabNav } from "@/components/ui/tabs/TabNav";
import type { TabItem } from "@/components/ui/tabs/TabNav";
import { Button } from "@/components/ui/button/Button";
import { cn } from "@/components/ui/utils";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { Badge } from "@/components/ui/badge/Badge";
import { userProfile as userProfileBreadcrumb } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { AlertModal } from "@/components/ui/modal/AlertModal";
import { ResetPasswordModal } from "../components/ResetPasswordModal";
import { SuspendModal } from "../components/SuspendModal";
import { TerminateModal } from "../components/TerminateModal";
import { PersonalTab } from "../tabs/PersonalTab";
import { QualificationsTab } from "../tabs/QualificationsTab";
import { PermissionsTab } from "../tabs/PermissionsTab";
import { USER_MANAGEMENT_ROUTES } from "../constants";
import { formatDate } from "@/utils/format";
import { useUserProfile } from "../hooks/useUserProfile";

export const UserProfileView: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const {
    user,
    draft,
    editingSection,
    isDraftDirty,
    certifications,
    draftDepartments,
    managerOptions,
    initials,
    yearsOfService,
    startSectionEdit,
    saveSection,
    cancelSection,
    resetSection,
    updateField,
    saveCert,
    deleteCert,
    suspendUser,
    terminateUser,
    reinstateUser,
    generateResetPassword,
    educationList,
    saveEdu,
    deleteEdu,
  } = useUserProfile(userId);

  const [resetPasswordModal, setResetPasswordModal] = useState({ isOpen: false, password: "" });
  const [suspendModal, setSuspendModal] = useState(false);
  const [terminateModal, setTerminateModal] = useState(false);
  const [reinstateModal, setReinstateModal] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  type MainTab = "personal" | "qualifications" | "permissions";
  const [activeTab, setActiveTab] = useState<MainTab>("personal");

  const handleBack = () => {
    setIsNavigating(true);
    setTimeout(() => navigate(-1), 600);
  };

  const handleConfirmSuspend = (reason: string, suspendedUntil: string) => {
    suspendUser(reason, suspendedUntil);
    setSuspendModal(false);
  };

  const handleConfirmTerminate = (reason: string, terminationDate: string) => {
    terminateUser(reason, terminationDate);
    setTerminateModal(false);
  };

  const handleConfirmReinstate = () => {
    reinstateUser();
    setReinstateModal(false);
  };

  const tabs: TabItem[] = [
    { id: "personal", label: "Personal Information", icon: UserIcon },
    { id: "qualifications", label: "Professional Qualifications", icon: GraduationCap },
    { id: "permissions", label: "Permission List", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      <PageHeader
        title="User Profile"
        breadcrumbItems={userProfileBreadcrumb(navigate, user.fullName)}
        actions={
          <>
            <Button onClick={handleBack} variant="outline-emerald" size="sm" className="gap-2 whitespace-nowrap">Back</Button>
            {user.status !== "Terminated" && (
              <Button onClick={() => setResetPasswordModal({ isOpen: true, password: generateResetPassword() })} variant="outline-emerald" size="sm" className="gap-2 whitespace-nowrap">
                Reset Password
              </Button>
            )}
            {(user.status === "Active" || user.status === "Inactive" || user.status === "Pending") && (
              <Button onClick={() => setSuspendModal(true)} size="sm" variant="outline-emerald" className="gap-2 whitespace-nowrap">Suspend</Button>
            )}
            {(user.status === "Active" || user.status === "Inactive" || user.status === "Pending" || user.status === "Suspended") && (
              <Button onClick={() => setTerminateModal(true)} variant="outline-emerald" size="sm" className="gap-2 whitespace-nowrap">Terminate</Button>
            )}
            {(user.status === "Suspended" || user.status === "Terminated") && (
              <Button onClick={() => setReinstateModal(true)} size="sm" variant="outline-emerald" className="gap-2 whitespace-nowrap">Reinstate</Button>
            )}
          </>
        }
      />

      <div className="bg-gradient-to-br from-emerald-50 via-white to-slate-50 rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
        {/* Suspended / Terminated Banner */}
        {(user.status === "Suspended" || user.status === "Terminated") && (
          <div className={cn(
            "flex items-start gap-2.5 px-5 py-3 border-b text-xs",
            user.status === "Suspended"
              ? "bg-amber-50 border-amber-200"
              : "bg-rose-50 border-rose-200"
          )}>
            <AlertTriangle className={cn("h-4 w-4 mt-0.5 flex-shrink-0", user.status === "Suspended" ? "text-amber-600" : "text-rose-600")} />
            <div>
              <p className={cn("font-semibold", user.status === "Suspended" ? "text-amber-700" : "text-rose-700")}>
                {user.status === "Suspended" ? "Account Suspended" : "Employee Terminated"}
              </p>
              <p className={cn("mt-0.5", user.status === "Suspended" ? "text-amber-600" : "text-rose-600")}>
                {user.status === "Suspended"
                  ? `Reason: ${user.suspendReason || "—"} · ${user.suspendedUntil ? `Until: ${formatDate(user.suspendedUntil)}` : "Indefinite"}`
                  : `Reason: ${user.terminationReason || "—"} · Date: ${user.terminationDate ? formatDate(user.terminationDate) : "—"}`}
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row">
          <div className="flex items-center gap-4 p-4 md:p-5 sm:border-r border-b sm:border-b-0 border-emerald-100/70 sm:min-w-[320px] sm:max-w-[44%] bg-gradient-to-b from-emerald-50/50 to-transparent">
            <div className="h-16 w-16 rounded-full bg-emerald-600 shadow-md flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-medium text-white">{initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-slate-900 leading-tight">{user.fullName}</h2>
              <p className="text-sm mt-0.5">
                <span className="text-emerald-600 font-medium">{user.position || user.role}</span>
                <span className="text-slate-400"> &middot; </span>
                <span className="text-slate-500">{user.department}</span>
              </p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <Badge
                  color={
                    user.status === "Active" ? "emerald" :
                      user.status === "Inactive" ? "slate" :
                        user.status === "Pending" ? "amber" :
                          user.status === "Suspended" ? "orange" : "red"
                  }
                  size="sm"
                  showDot
                  pill
                >
                  {user.status}
                </Badge>
                <Badge
                  color={
                    user.role === "Admin" ? "purple" :
                      user.role === "QA Manager" ? "emerald" :
                        user.role === "Approver" ? "blue" :
                          user.role === "Reviewer" ? "cyan" :
                            user.role === "Document Owner" ? "indigo" : "slate"
                  }
                  size="sm"
                >
                  {user.role}
                </Badge>
                {user.employmentType && (
                  <Badge color="slate" size="sm">{user.employmentType}</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex-1 p-4 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 content-center">
            <div>
              <p className="text-xs font-medium text-slate-400 mb-0.5">Employee Code</p>
              <p className="text-sm font-medium text-slate-800">{user.employeeCode}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 mb-0.5">Phone Number</p>
              <p className="text-sm font-medium text-slate-800">{user.phone || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 mb-0.5">Username</p>
              <p className="text-sm font-medium text-slate-800">{user.username}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400 mb-0.5">Email</p>
              <p className="text-sm font-medium text-slate-800 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <TabNav
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as MainTab)}
        />
        <div className="p-4 md:p-5 animate-in fade-in duration-200">
          {activeTab === "personal" && (
            <PersonalTab
              user={user}
              draft={draft}
              editingSection={editingSection}
              isDraftDirty={isDraftDirty}
              draftDepartments={draftDepartments}
              managerOptions={managerOptions}
              yearsOfService={yearsOfService}
              onSectionEdit={startSectionEdit}
              onSectionSave={saveSection}
              onSectionCancel={cancelSection}
              onSectionReset={resetSection}
              onDraftChange={updateField}
            />
          )}
          {activeTab === "qualifications" && (
            <QualificationsTab
              user={user}
              draft={draft}
              editingSection={editingSection}
              isDraftDirty={isDraftDirty}
              certifications={certifications}
              educationList={educationList}
              onSectionEdit={startSectionEdit}
              onSectionSave={saveSection}
              onSectionCancel={cancelSection}
              onSectionReset={resetSection}
              onDraftChange={updateField}
              onCertSave={saveCert}
              onCertDelete={deleteCert}
              onEduSave={saveEdu}
              onEduDelete={deleteEdu}
            />
          )}
          {activeTab === "permissions" && (
            <PermissionsTab user={user} />
          )}
        </div>
      </div>

      <ResetPasswordModal
        isOpen={resetPasswordModal.isOpen}
        onClose={() => setResetPasswordModal({ ...resetPasswordModal, isOpen: false })}
        userName={user.fullName}
        password={resetPasswordModal.password}
        onRegeneratePassword={() =>
          setResetPasswordModal((prev) => ({ ...prev, password: generateResetPassword() }))
        }
      />

      <SuspendModal
        isOpen={suspendModal}
        onClose={() => setSuspendModal(false)}
        onConfirm={handleConfirmSuspend}
        userName={user.fullName}
      />

      <TerminateModal
        isOpen={terminateModal}
        onClose={() => setTerminateModal(false)}
        onConfirm={handleConfirmTerminate}
        userName={user.fullName}
      />

      <AlertModal
        isOpen={reinstateModal}
        onClose={() => setReinstateModal(false)}
        onConfirm={handleConfirmReinstate}
        type="confirm"
        title="Reinstate User"
        description={`Are you sure you want to reinstate ${user.fullName}? Their account will be set to Active and they will regain full access.`}
        confirmText="Yes, Reinstate"
        cancelText="Cancel"
        showCancel
      />

      {isNavigating && <FullPageLoading text="Loading..." />}
    </div>
  );
};
