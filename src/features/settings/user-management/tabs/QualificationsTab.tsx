import React, { useState } from "react";
import { createPortal } from "react-dom";
import { GraduationCap, Briefcase, Award, Plus, Eye, MoreVertical } from "lucide-react";
import { SectionCard, EditableField } from "../components/ProfileSectionCard";
import type { SectionKey } from "../components/ProfileSectionCard";
import { CertAddModal } from "../components/CertAddModal";
import { CertPreviewModal } from "../components/CertPreviewModal";
import { Button } from "@/components/ui/button/Button";
import { Badge } from "@/components/ui/badge/Badge";
import { AlertModal } from "@/components/ui/modal/AlertModal";
import { formatDate } from "@/utils/format";
import { cn } from "@/components/ui/utils";
import type { User, Certification } from "../types";
import { IconCertificate, IconPencilMinus, IconTrash } from "@tabler/icons-react";
import { usePortalDropdown } from "@/hooks";

interface QualificationsTabProps {
  user: User;
  draft: User;
  editingSection: SectionKey | null;
  isDraftDirty: boolean;
  certifications: Certification[];
  onSectionEdit: (section: SectionKey) => void;
  onSectionSave: (section: SectionKey) => void;
  onSectionCancel: () => void;
  onSectionReset: () => void;
  onDraftChange: (key: keyof User, value: string) => void;
  onCertSave: (data: Omit<Certification, "id">, editing: Certification | null) => void;
  onCertDelete: (id: string) => void;
}

export const QualificationsTab: React.FC<QualificationsTabProps> = ({
  user,
  draft,
  editingSection,
  isDraftDirty,
  certifications,
  onSectionEdit,
  onSectionSave,
  onSectionCancel,
  onSectionReset,
  onDraftChange,
  onCertSave,
  onCertDelete,
}) => {
  const isEducationEditing = editingSection === "education";
  const isExpertiseEditing = editingSection === "expertise";

  const [certAddOpen, setCertAddOpen] = useState(false);
  const [certEditing, setCertEditing] = useState<Certification | null>(null);
  const [certPreview, setCertPreview] = useState<Certification | null>(null);
  const [certDeleteId, setCertDeleteId] = useState<string | null>(null);

  const { openId: openDropdownId, position: dropdownPosition, getRef, toggle: handleDropdownToggle, close: closeDropdown } = usePortalDropdown();


  const handleOpenAdd = () => {
    setCertEditing(null);
    setCertAddOpen(true);
  };

  const handleOpenEdit = (cert: Certification) => {
    setCertEditing(cert);
    setCertAddOpen(true);
  };

  const handleCertSave = (data: Omit<Certification, "id">) => {
    onCertSave(data, certEditing);
    setCertAddOpen(false);
    setCertEditing(null);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {/* Education */}
      <SectionCard
        title="Education"
        icon={<GraduationCap className="h-4 w-4" />}
        isEditing={isEducationEditing}
        onEdit={() => onSectionEdit("education")}
        onSave={() => onSectionSave("education")}
        onCancel={onSectionCancel}
        onReset={onSectionReset}
        isResetDisabled={!isDraftDirty}
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <EditableField
            label="Highest Degree" value={user.degree} draftValue={draft.degree}
            isEditing={isEducationEditing}
            field={{ type: "text", fieldKey: "degree" }}
            onChange={onDraftChange}
          />
          <EditableField
            label="Field of Study" value={user.fieldOfStudy} draftValue={draft.fieldOfStudy}
            isEditing={isEducationEditing}
            field={{ type: "text", fieldKey: "fieldOfStudy" }}
            onChange={onDraftChange}
          />
          <EditableField
            label="Institution" value={user.institution} draftValue={draft.institution}
            isEditing={isEducationEditing}
            field={{ type: "text", fieldKey: "institution" }}
            onChange={onDraftChange}
            className="col-span-2"
          />
          <EditableField
            label="Graduation Year" value={user.graduationYear} draftValue={draft.graduationYear}
            isEditing={isEducationEditing}
            field={{ type: "text", fieldKey: "graduationYear" }}
            onChange={onDraftChange}
          />
          <EditableField
            label="GPA / Grade" value={user.gpa} draftValue={draft.gpa}
            isEditing={isEducationEditing}
            field={{ type: "text", fieldKey: "gpa" }}
            onChange={onDraftChange}
          />
        </div>
      </SectionCard>

      {/* Professional Expertise */}
      <SectionCard
        title="Professional Expertise"
        icon={<Briefcase className="h-4 w-4" />}
        isEditing={isExpertiseEditing}
        onEdit={() => onSectionEdit("expertise")}
        onSave={() => onSectionSave("expertise")}
        onCancel={onSectionCancel}
        onReset={onSectionReset}
        isResetDisabled={!isDraftDirty}
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-5">
          <EditableField
            label="Professional Level" value={user.professionalLevel} draftValue={draft.professionalLevel}
            isEditing={isExpertiseEditing}
            field={{ type: "text", fieldKey: "professionalLevel" }}
            onChange={onDraftChange}
            className="col-span-2"
          />
          <EditableField
            label="Area of Expertise" value={user.areaOfExpertise} draftValue={draft.areaOfExpertise}
            isEditing={isExpertiseEditing}
            field={{ type: "text", fieldKey: "areaOfExpertise" }}
            onChange={onDraftChange}
            className="col-span-2"
          />
          <EditableField
            label="Years of Experience" value={user.yearsOfExperience} draftValue={draft.yearsOfExperience}
            isEditing={isExpertiseEditing}
            field={{ type: "text", fieldKey: "yearsOfExperience" }}
            onChange={onDraftChange}
          />
          <EditableField
            label="Previous Employer" value={user.previousEmployer} draftValue={draft.previousEmployer}
            isEditing={isExpertiseEditing}
            field={{ type: "text", fieldKey: "previousEmployer" }}
            onChange={onDraftChange}
          />
        </div>
      </SectionCard>

      {/* External Certifications — full width */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden xl:col-span-2">
        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-emerald-600 flex-shrink-0"><IconCertificate className="h-4 w-4" /></span>
            <h3 className="text-sm font-semibold text-slate-800 truncate">External Certifications</h3>
            {certifications.length > 0 && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full flex-shrink-0">
                {certifications.length}
              </span>
            )}
          </div>
          <Button variant="default" size="sm" onClick={handleOpenAdd} className="flex-shrink-0 gap-2 sm:h-9 sm:px-4 sm:text-sm">
            <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Add Certificate
          </Button>
        </div>

        {/* Card Body */}
        <div className="p-0">
          {certifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <IconCertificate className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-500">No certifications recorded</p>
              <p className="text-xs mt-1">External certifications and licenses will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Certificate
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                      Issuing Org
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">
                      Issue Date
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                      Expiry Date
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden xs:table-cell">
                      Status
                    </th>
                    <th className="sticky right-0 bg-slate-50 py-3 px-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider z-40 backdrop-blur-sm whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {certifications.map((cert) => {
                    const isExpired = cert.expiryDate ? new Date(cert.expiryDate) < new Date() : false;
                    return (
                      <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                              <IconCertificate className="h-3.5 w-3.5 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate max-w-[140px] sm:max-w-[200px]">
                                {cert.name}
                              </p>
                              <p className="text-xs text-slate-400 md:hidden truncate max-w-[140px]">
                                {cert.issuingOrg}
                              </p>
                              {/* Show status inline on mobile */}
                              <Badge
                                color={isExpired ? "red" : "emerald"}
                                size="sm"
                                pill
                                className="mt-0.5 xs:hidden"
                              >
                                {isExpired ? "Expired" : "Valid"}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 hidden md:table-cell whitespace-nowrap">
                          {cert.issuingOrg}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600 hidden sm:table-cell whitespace-nowrap">
                          {cert.issueDate ? formatDate(cert.issueDate) : "—"}
                        </td>
                        <td className="py-3 px-4 text-sm hidden lg:table-cell whitespace-nowrap">
                          {cert.expiryDate ? (
                            <span className={cn(isExpired ? "text-red-600 font-medium" : "text-slate-600")}>
                              {formatDate(cert.expiryDate)}
                            </span>
                          ) : (
                            <span className="text-slate-400">No expiry</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center hidden xs:table-cell">
                          {isExpired ? (
                            <Badge color="red" size="sm" pill className="whitespace-nowrap">Expired</Badge>
                          ) : (
                            <Badge color="emerald" size="sm" pill className="whitespace-nowrap">Valid</Badge>
                          )}
                        </td>
                        <td
                          onClick={(e) => e.stopPropagation()}
                          className="sticky right-0 bg-white py-3 px-4 text-center z-30 whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50/80"
                        >
                          <button
                            ref={getRef(cert.id)}
                            onClick={(e) => handleDropdownToggle(cert.id, e)}
                            className="inline-flex items-center justify-center h-7 w-7 rounded-lg hover:bg-slate-100 transition-colors"
                            aria-label="More actions"
                          >
                            <MoreVertical className="h-3.5 w-3.5 text-slate-600" />
                          </button>
                          {openDropdownId === cert.id && createPortal(
                            <>
                              <div
                                className="fixed inset-0 z-40 animate-in fade-in duration-150"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  closeDropdown();
                                }}
                                aria-hidden="true"
                              />
                              <div
                                className="fixed z-50 min-w-[160px] w-[180px] rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
                                style={{
                                  top: `${dropdownPosition.top}px`,
                                  left: `${dropdownPosition.left}px`,
                                  transform: dropdownPosition.showAbove ? "translateY(-100%)" : "none",
                                }}
                              >
                                <div className="py-1">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setCertPreview(cert); closeDropdown(); }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                                    Preview
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenEdit(cert); closeDropdown(); }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                  >
                                    <IconPencilMinus className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                                    Edit Certificate
                                  </button>
                                  <div className="my-1 h-px bg-slate-100" />
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setCertDeleteId(cert.id); closeDropdown(); }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <IconTrash className="h-3.5 w-3.5 flex-shrink-0" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </>,
                            window.document.body
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Cert modals managed locally */}
      {certAddOpen && (
        <CertAddModal
          onClose={() => { setCertAddOpen(false); setCertEditing(null); }}
          onSave={handleCertSave}
          editing={certEditing}
        />
      )}
      {certPreview && (
        <CertPreviewModal
          cert={certPreview}
          onClose={() => setCertPreview(null)}
        />
      )}

      <AlertModal
        isOpen={certDeleteId !== null}
        onClose={() => setCertDeleteId(null)}
        onConfirm={() => { onCertDelete(certDeleteId!); setCertDeleteId(null); }}
        type="confirm"
        title="Delete Certificate"
        description="Are you sure you want to delete this certificate? This action cannot be undone."
      />
    </div>
  );
};
