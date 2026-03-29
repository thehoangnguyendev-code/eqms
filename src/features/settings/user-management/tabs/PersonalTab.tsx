import React from "react";
import { User as UserIcon, Briefcase, Shield } from "lucide-react";
import { InfoField, SectionCard, EditableField } from "../components/ProfileSectionCard";
import type { SectionKey } from "../components/ProfileSectionCard";
import { BUSINESS_UNIT_DEPARTMENTS } from "../constants";
import { formatDate } from "@/utils/format";
import type { User } from "../types";

interface PersonalTabProps {
  user: User;
  draft: User;
  editingSection: SectionKey | null;
  isDraftDirty: boolean;
  draftDepartments: string[];
  managerOptions: { label: string; value: string }[];
  yearsOfService: string | null;
  onSectionEdit: (section: SectionKey) => void;
  onSectionSave: (section: SectionKey) => void;
  onSectionCancel: () => void;
  onSectionReset: () => void;
  onDraftChange: (key: keyof User, value: string) => void;
}

export const PersonalTab: React.FC<PersonalTabProps> = ({
  user,
  draft,
  editingSection,
  isDraftDirty,
  draftDepartments,
  managerOptions,
  yearsOfService,
  onSectionEdit,
  onSectionSave,
  onSectionCancel,
  onSectionReset,
  onDraftChange,
}) => {
  const isPersonalEditing = editingSection === "personal";
  const isWorkEditing = editingSection === "work";
  const isAccountEditing = editingSection === "account";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {/* Left — Personal Information */}
      <SectionCard
        title="Personal Information"
        icon={<UserIcon className="h-4 w-4" />}
        isEditing={isPersonalEditing}
        onEdit={() => onSectionEdit("personal")}
        onSave={() => onSectionSave("personal")}
        onCancel={onSectionCancel}
        onReset={onSectionReset}
        isResetDisabled={!isDraftDirty}
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <EditableField
            label="Full Name" value={user.fullName} draftValue={draft.fullName}
            isEditing={isPersonalEditing}
            field={{ type: "text", fieldKey: "fullName" }}
            onChange={onDraftChange}
          />
          <EditableField
            label="Employee Code" value={user.employeeCode} draftValue={draft.employeeCode}
            isEditing={isPersonalEditing}
            field={{ type: "text", fieldKey: "employeeCode" }}
            onChange={onDraftChange}
          />
          <EditableField
            label="Phone Number" value={user.phone} draftValue={draft.phone}
            isEditing={isPersonalEditing}
            field={{ type: "tel", fieldKey: "phone" }}
            onChange={onDraftChange}
          />
          <EditableField
            label="Username" value={user.username} draftValue={draft.username}
            isEditing={isPersonalEditing}
            field={{ type: "text", fieldKey: "username" }}
            onChange={onDraftChange}
          />
          <EditableField
            label="Email" value={user.email} draftValue={draft.email}
            isEditing={isPersonalEditing}
            field={{ type: "email", fieldKey: "email" }}
            onChange={onDraftChange}
          />
          <EditableField
            label="Gender" value={user.gender} draftValue={draft.gender}
            isEditing={isPersonalEditing}
            field={{ type: "select", fieldKey: "gender", options: [
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
              { label: "Other", value: "Other" },
            ]}}
            onChange={onDraftChange}
          />
          <EditableField
            label="Date of Birth"
            value={user.dateOfBirth ? formatDate(user.dateOfBirth) : null}
            draftValue={draft.dateOfBirth}
            isEditing={isPersonalEditing}
            field={{ type: "date", fieldKey: "dateOfBirth" }}
            onChange={onDraftChange}
          />
          <EditableField
            label="Nationality" value={user.nationality} draftValue={draft.nationality}
            isEditing={isPersonalEditing}
            field={{ type: "text", fieldKey: "nationality" }}
            onChange={onDraftChange}
          />
          <EditableField
            label="Language(s)" value={user.language} draftValue={draft.language}
            isEditing={isPersonalEditing}
            field={{ type: "text", fieldKey: "language" }}
            onChange={onDraftChange}
          />
          <EditableField
            label="ID / Passport No." value={user.idNumber} draftValue={draft.idNumber}
            isEditing={isPersonalEditing}
            field={{ type: "text", fieldKey: "idNumber" }}
            onChange={onDraftChange}
          />
          <EditableField
            label="Permanent Address" value={user.address} draftValue={draft.address}
            isEditing={isPersonalEditing}
            field={{ type: "text", fieldKey: "address" }}
            onChange={onDraftChange}
            className="col-span-2"
          />
        </div>
      </SectionCard>

      {/* Right — stacked: Work Profile + Account */}
      <div className="flex flex-col gap-5">
        {/* Work & Professional Profile */}
        <SectionCard
          title="Work & Professional Profile"
          icon={<Briefcase className="h-4 w-4" />}
          isEditing={isWorkEditing}
          onEdit={() => onSectionEdit("work")}
          onSave={() => onSectionSave("work")}
          onCancel={onSectionCancel}
          onReset={onSectionReset}
          isResetDisabled={!isDraftDirty}
        >
          <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">{user.jobTitle || "—"}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {user.businessUnit}{user.department ? ` · ${user.department}` : ""}
              </p>
            </div>
            {yearsOfService && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                {yearsOfService}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <EditableField
              label="Job Title" value={user.jobTitle} draftValue={draft.jobTitle}
              isEditing={isWorkEditing}
              field={{ type: "text", fieldKey: "jobTitle" }}
              onChange={onDraftChange}
            />
            <EditableField
              label="Employment Type" value={user.employmentType} draftValue={draft.employmentType}
              isEditing={isWorkEditing}
              field={{ type: "select", fieldKey: "employmentType", options: [
                { label: "Full-time", value: "Full-time" },
                { label: "Part-time", value: "Part-time" },
                { label: "Contract", value: "Contract" },
                { label: "Intern", value: "Intern" },
              ]}}
              onChange={onDraftChange}
            />
            <EditableField
              label="Business Unit" value={user.businessUnit} draftValue={draft.businessUnit}
              isEditing={isWorkEditing}
              field={{ type: "select", fieldKey: "businessUnit", options:
                Object.keys(BUSINESS_UNIT_DEPARTMENTS).map((bu) => ({ label: bu, value: bu }))
              }}
              onChange={onDraftChange}
            />
            <EditableField
              label="Department" value={user.department} draftValue={draft.department}
              isEditing={isWorkEditing}
              field={{ type: "select", fieldKey: "department", options:
                draftDepartments.map((d) => ({ label: d, value: d })),
                disabled: !draft.businessUnit
              }}
              onChange={onDraftChange}
            />
            <EditableField
              label="Direct Manager" value={user.managerName} draftValue={draft.managerName}
              isEditing={isWorkEditing}
              field={{ type: "select", fieldKey: "managerName", options: managerOptions }}
              onChange={onDraftChange}
            />
            <EditableField
              label="Start Date"
              value={user.startDate ? formatDate(user.startDate) : null}
              draftValue={draft.startDate}
              isEditing={isWorkEditing}
              field={{ type: "date", fieldKey: "startDate" }}
              onChange={onDraftChange}
            />
          </div>
        </SectionCard>

        {/* Account & Access Control */}
        <SectionCard
          title="Account & Access Control"
          icon={<Shield className="h-4 w-4" />}
          isEditing={isAccountEditing}
          onEdit={() => onSectionEdit("account")}
          onSave={() => onSectionSave("account")}
          onCancel={onSectionCancel}
          onReset={onSectionReset}
          isResetDisabled={!isDraftDirty}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <EditableField
              label="System Role" value={user.role} draftValue={draft.role}
              isEditing={isAccountEditing}
              field={{ type: "select", fieldKey: "role", options: [
                { label: "Admin", value: "Admin" },
                { label: "QA Manager", value: "QA Manager" },
                { label: "Document Owner", value: "Document Owner" },
                { label: "Reviewer", value: "Reviewer" },
                { label: "Approver", value: "Approver" },
                { label: "Viewer", value: "Viewer" },
              ]}}
              onChange={onDraftChange}
            />
            <EditableField
              label="Account Status" value={user.status} draftValue={draft.status}
              isEditing={isAccountEditing}
              field={{ type: "select", fieldKey: "status", options: [
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
                { label: "Pending", value: "Pending" },
              ]}}
              onChange={onDraftChange}
            />
            <InfoField label="Account Created" value={formatDate(user.createdDate)} />
            <InfoField label="Last Login" value={user.lastLogin !== "Never" ? user.lastLogin : "Never logged in"} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
