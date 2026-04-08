import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Eye, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { CKEditorEditor } from "../components/CKEditorEditor";
import { Badge } from "@/components/ui/badge";
import { AlertModal } from "@/components/ui/modal";
import { useNavigateWithLoading } from "@/hooks/useNavigateWithLoading";
import { emailTemplateEdit } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { EMAIL_TEMPLATE_TYPES, EMAIL_VARIABLES } from "../constants";
import { useEmailTemplatesList } from "../hooks/useEmailTemplatesList";
import type { EmailTemplate, EmailTemplateType, EmailTemplateStatus } from "../types";

type EmailTemplateFormData = {
  name: string;
  subject: string;
  type: EmailTemplateType;
  description: string;
  content: string;
  variables: string[];
  logoUrl: string;
  status: EmailTemplateStatus;
};

export const EmailTemplateEditView: React.FC = () => {
  const navigate = useNavigate();
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
    status: "Draft"
  });

  const templateTypeOptions = Object.entries(EMAIL_TEMPLATE_TYPES) as [
    EmailTemplateType,
    { label: string; description: string; icon: string }
  ][];

  const [originalData, setOriginalData] = useState<EmailTemplate | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

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

    if (!formData.name.trim()) {
      newErrors.name = "Template name is required";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Email subject is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Email content is required";
    }

    if (!formData.type) {
      newErrors.type = "Template type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !id) return;

    setIsSubmitting(true);
    try {
      await updateEmailTemplate(id, formData);
      setUnsavedChanges(false);
      navigate("/settings/email-templates");
    } catch (error) {
      console.error("Failed to update template:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!originalData) return;

    try {
      await deleteEmailTemplate(originalData.id, originalData.name);
      navigate("/settings/email-templates");
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  };

  const handleBack = () => {
    if (unsavedChanges) {
      // Show confirmation modal
      return;
    }
    navigate("/settings/email-templates");
  };

  if (!originalData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-500">Loading template...</div>
      </div>
    );
  }

  const availableVariables = EMAIL_VARIABLES;

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Header */}
      <PageHeader
        title={`Edit Email Template: ${originalData.name}`}
        breadcrumbItems={emailTemplateEdit(undefined, originalData.name)}
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2 whitespace-nowrap"
              onClick={handlePreview}
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex items-center gap-2 whitespace-nowrap"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex items-center gap-2 whitespace-nowrap"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              size="sm"
              className="flex items-center gap-2 whitespace-nowrap"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      />

      {/* Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Template Name" required error={errors.name}>
                <Input
                  value={formData.name}
                  onChange={(event) => handleInputChange("name", event.target.value)}
                  placeholder="Enter template name"
                  required
                />
              </FormField>

              <FormField label="Template Type" required error={errors.type}>
                <Select
                  value={formData.type}
                  onChange={(value) => handleInputChange("type", value)}
                  options={templateTypeOptions.map(([key, config]) => ({
                    label: `${config.icon} ${config.label}`,
                    value: key
                  }))}
                />
              </FormField>
            </div>

            <FormField label="Email Subject" required error={errors.subject}>
              <Input
                value={formData.subject}
                onChange={(event) => handleInputChange("subject", event.target.value)}
                placeholder="Enter email subject line"
                required
              />
            </FormField>

            <FormField label="Description">
              <Textarea
                value={formData.description}
                onChange={(event) => handleInputChange("description", event.target.value)}
                placeholder="Describe the purpose of this template"
                rows={3}
              />
            </FormField>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Email Content</h3>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Content <span className="text-red-500">*</span>
              </label>
              <CKEditorEditor
                value={formData.content}
                onChange={(value) => handleInputChange("content", value)}
                placeholder="Enter email content with rich formatting..."
              />
              <p className="text-xs text-slate-500 mt-1">
                {'Use variables like {{userName}}, {{companyName}} etc. in your content'}
              </p>
            </div>
          </div>

          {/* Variables */}
          {availableVariables.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Available Variables</h3>
              <div className="flex flex-wrap gap-2">
                {availableVariables.map((variable) => (
                  <Badge
                    key={variable.key}
                    color="slate"
                    size="sm"
                    className="cursor-pointer hover:bg-slate-200"
                    onClick={() => {
                      // Insert variable into CKEditor content
                      const variableText = `{{${variable.key}}}`;
                      handleInputChange("content", formData.content + variableText);
                    }}
                  >
                    {variable.label}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Click on variables to insert them into the content
              </p>
            </div>
          )}

          {/* Logo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Logo</h3>

            <FormField label="Logo URL">
              <Input
                value={formData.logoUrl}
                onChange={(event) => handleInputChange("logoUrl", event.target.value)}
                placeholder="https://example.com/logo.png"
                type="url"
              />
            </FormField>
            <p className="text-xs text-slate-500 mt-1">
              Optional: URL to company logo image
            </p>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Status</h3>

            <FormField label="Status">
              <Select
                value={formData.status}
                onChange={(value) => handleInputChange("status", value)}
                options={[
                  { label: "Draft", value: "Draft" },
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" }
                ]}
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <AlertModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title="Email Preview"
          description={
            <div className="space-y-4">
              <div>
                <strong>Subject:</strong> {formData.subject}
              </div>
              <div>
                <strong>Content:</strong>
                <div className="mt-2 p-4 bg-slate-50 rounded border">
                  <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                </div>
              </div>
            </div>
          }
          confirmText="Close"
          showCancel={false}
        />
      )}

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

      {isNavigating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-white">Loading...</div>
        </div>
      )}
    </div>
  );
};