import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Settings, Variable, Mail, Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FormSection } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { LexicalEditor } from "../components/LexicalEditor";
import { EmailLivePreview } from "../components/EmailLivePreview";
import { LogoUploader } from "../components/LogoUploader";
import { Badge } from "@/components/ui/badge";
import { AlertModal } from "@/components/ui/modal";
import { ESignatureModal } from "@/components/ui/esign-modal";
import { Loading } from "@/components/ui/loading";
import { useNavigateWithLoading } from "@/hooks/useNavigateWithLoading";
import { emailTemplateEdit } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { EMAIL_TEMPLATE_TYPES, EMAIL_VARIABLES } from "../constants";
import { useEmailTemplatesList } from "../hooks/useEmailTemplatesList";
import type { EmailTemplate, EmailTemplateType, EmailTemplateStatus } from "../types";


// Field wrapper matching DocumentFilters label style
const Field: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}> = ({ label, required, error, children, hint }) => (
  <div className="w-full">
    <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-slate-500 mt-1.5">{hint}</p>}
    {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
  </div>
);

type EmailTemplateFormData = {
  name: string;
  subject: string;
  type: EmailTemplateType;
  description: string;
  content: string;
  variables: string[];
  logoUrl: string;
  copyright: string;
  contactEmail: string;
  status: EmailTemplateStatus;
};

export const EmailTemplateEditView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { navigateTo, isNavigating } = useNavigateWithLoading();
  const { emailTemplates, updateEmailTemplate, deleteEmailTemplate } = useEmailTemplatesList();

  const [formData, setFormData] = useState<EmailTemplateFormData>({
    name: "",
    subject: "",
    type: "password-reset",
    description: "",
    content: "",
    variables: [],
    logoUrl: "",
    copyright: "",
    contactEmail: "",
    status: "Draft"
  });

  const templateTypeOptions = Object.entries(EMAIL_TEMPLATE_TYPES) as [
    EmailTemplateType,
    { label: string; description: string; icon: string }
  ][];

  const [originalData, setOriginalData] = useState<EmailTemplate | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showESign, setShowESign] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [pendingInsert, setPendingInsert] = useState<string | undefined>(undefined);

  // Load template data
  useEffect(() => {
    if (id) {
      const template = emailTemplates.find(t => t.id === id);
      if (template) {
        const data = {
          name: template.name,
          subject: template.subject,
          type: template.type,
          description: template.description || "",
          content: template.content,
          variables: template.variables || [],
          logoUrl: template.logoUrl || "",
          copyright: template.copyright || "",
          contactEmail: template.contactEmail || "",
          status: template.status
        };
        setFormData(data);
        setOriginalData(template);
      }
    }
  }, [id, emailTemplates]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: "" }));
    setUnsavedChanges(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Template name is required";
    if (!formData.subject.trim()) newErrors.subject = "Email subject is required";
    if (!formData.content.trim()) newErrors.content = "Email content is required";
    if (!formData.type) newErrors.type = "Template type is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !id) return;
    setShowSaveConfirm(true);
  };

  const handleESignConfirm = (_reason: string) => {
    setShowESign(false);
    setIsSubmitting(true);
    try {
      updateEmailTemplate(id!, formData);
      setUnsavedChanges(false);
      navigateTo("/settings/email-templates");
    } catch (error) {
      console.error("Failed to update template:", error);
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!originalData) return;
    deleteEmailTemplate(originalData.id, originalData.name);
    navigateTo("/settings/email-templates");
  };

  const handleBack = () => {
    if (unsavedChanges) {
      setShowCancelModal(true);
      return;
    }
    navigateTo("/settings/email-templates");
  };

  const handleCancelConfirm = () => {
    setShowCancelModal(false);
    navigateTo("/settings/email-templates");
  };

  if (!originalData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading text="Loading template..." />
      </div>
    );
  }

  return (
    <div className="space-y-5 w-full flex-1 flex flex-col">
      {/* Header */}
      <PageHeader
        title={`Edit: ${originalData.name}`}
        breadcrumbItems={emailTemplateEdit(undefined, originalData.name)}
        actions={
          <>
            <Button size="sm" variant="outline-emerald" className="whitespace-nowrap" onClick={handleBack}>
              Back
            </Button>
            <Button size="sm" variant="outline-emerald" className="whitespace-nowrap" onClick={() => setIsPreviewMode(p => !p)}>
              {isPreviewMode ? "Edit" : "Preview"}
            </Button>
            <Button size="sm" variant="outline-emerald" className="whitespace-nowrap" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      />

      {/* Card 1: Template Settings - Full Width */}
      <FormSection title="Template Settings" icon={<Settings className="h-4 w-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Logo */}
          <Field label="Logo">
            <LogoUploader
              value={formData.logoUrl}
              onChange={(url) => handleInputChange("logoUrl", url)}
            />
          </Field>

          {/* Right: Status, Copyright, Contact Email */}
          <div className="space-y-4">
            <Field label="Status">
              <Select
                value={formData.status}
                onChange={(value) => handleInputChange("status", value)}
                options={[
                  { label: "Draft", value: "Draft" },
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" }
                ]}
              />
            </Field>
            <Field label="Copyright" hint="e.g. © 2007 - 2026 Company Name">
              <Input
                value={formData.copyright}
                onChange={(e) => handleInputChange("copyright", e.target.value)}
                placeholder="© 2007 - 2026 Your Company Name"
              />
            </Field>
            <Field label="Contact Email" hint="Support email shown in footer">
              <Input
                value={formData.contactEmail}
                onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                placeholder="support@example.com"
                type="email"
              />
            </Field>
          </div>
        </div>
      </FormSection>

      {/* Cards 2 & 3: Variables (30%) + Email Content (70%) */}
      <div className="flex flex-col lg:flex-row gap-5 flex-1">
        {/* Card 2: Available Variables - 30% */}
        <div className="lg:w-[30%] flex flex-col">
          <FormSection title="Available Variables" icon={<Variable className="h-4 w-4" />}>
            <p className="text-xs text-slate-500 mb-4">Click on a variable to insert it into the content</p>
            <div className="flex flex-wrap gap-2">
              {EMAIL_VARIABLES.map((variable) => (
                <Badge
                  key={variable.key}
                  color="slate"
                  size="sm"
                  className="cursor-pointer hover:bg-slate-200 transition-colors"
                  onClick={() => setPendingInsert(`{{${variable.key}}}`)}
                >
                  {variable.label}
                </Badge>
              ))}
            </div>
          </FormSection>
        </div>

        {/* Card 3: Email Content / Live Preview - 70% */}
        <div className="lg:w-[70%] flex flex-col">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
              <span className="text-emerald-600">
                {isPreviewMode ? <Eye className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              </span>
              <h3 className="text-sm font-semibold text-slate-800">
                {isPreviewMode ? "Live Client Preview" : "Email Content"}
              </h3>
            </div>

            {/* Preview — always mounted, hidden when not in preview mode */}
            <div className={isPreviewMode ? "block p-4 md:p-5" : "hidden"}>
              <EmailLivePreview
                subject={formData.subject}
                content={formData.content}
                variables={formData.variables}
                copyright={formData.copyright}
                contactEmail={formData.contactEmail}
                logoUrl={formData.logoUrl}
              />
            </div>

            {/* Edit form — always mounted, hidden when in preview mode */}
            <div className={isPreviewMode ? "hidden" : "p-4 md:p-5 flex-1 flex flex-col gap-4"}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Template Name" required error={errors.name}>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter template name"
                    />
                  </Field>
                  <Field label="Template Type" required error={errors.type}>
                    <Select
                      value={formData.type}
                      onChange={(value) => handleInputChange("type", value)}
                      options={templateTypeOptions.map(([key, config]) => ({
                        label: `${config.icon} ${config.label}`,
                        value: key
                      }))}
                    />
                  </Field>
                </div>

                <Field label="Email Subject" required error={errors.subject}>
                  <Input
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    placeholder="Enter email subject line"
                  />
                </Field>

                <Field label="Description">
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe the purpose of this template"
                    rows={2}
                  />
                </Field>

                <div className="flex-1 flex flex-col">
                  <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <LexicalEditor
                    value={formData.content}
                    onChange={(value) => handleInputChange("content", value)}
                    placeholder="Enter email content with rich formatting..."
                    minHeight={480}
                    insertText={pendingInsert}
                    onInsertHandled={() => setPendingInsert(undefined)}
                    logoUrl={formData.logoUrl}
                  />
                  {errors.content && (
                    <p className="text-xs text-red-500 mt-1.5">{errors.content}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1.5">
                    {'Use variables like {{userName}}, {{companyName}} etc. in your content'}
                  </p>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      <AlertModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={() => { setShowSaveConfirm(false); setShowESign(true); }}
        type="confirm"
        title="Save Changes"
        description="Are you sure you want to save changes to this email template? You will need to sign electronically to confirm."
        confirmText="Continue"
        cancelText="Cancel"
        showCancel
      />

      {/* E-Signature Modal */}
      <ESignatureModal
        isOpen={showESign}
        onClose={() => setShowESign(false)}
        onConfirm={handleESignConfirm}
        actionTitle="Update Email Template"
      />

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        type="error"
        title="Delete Email Template"
        description={`Are you sure you want to delete "${originalData.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        showCancel
      />

      {/* Cancel Confirmation Modal */}
      <AlertModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        type="warning"
        title="Discard Changes"
        description="You have unsaved changes. Are you sure you want to discard them and leave this page?"
        confirmText="Discard"
        cancelText="Keep Editing"
        showCancel
      />

      {(isNavigating || isSubmitting) && (
        <Loading fullPage text={isSubmitting ? "Saving Changes..." : "Loading..."} />
      )}
    </div>
  );
};
