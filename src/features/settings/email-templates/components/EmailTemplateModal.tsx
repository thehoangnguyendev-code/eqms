import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { IconEye, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { FormField, Input, Textarea } from "@/components/ui/form";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FormModal } from "@/components/ui/modal";
import { AlertModal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { EMAIL_TEMPLATE_TYPES, EMAIL_VARIABLES, LOGO_UPLOAD_CONFIG } from "../constants";
import type { EmailTemplate, EmailTemplatePayload, EmailTemplateType, EmailVariable } from "../types";

// CKEditor import
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface EmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: EmailTemplate | null;
  onSave: (payload: EmailTemplatePayload) => void;
  onDelete?: (id: string) => void;
  mode: "create" | "edit";
}

export const EmailTemplateModal: React.FC<EmailTemplateModalProps> = ({
  isOpen,
  onClose,
  template,
  onSave,
  onDelete,
  mode,
}) => {
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState<EmailTemplatePayload>({
    name: "",
    type: "custom",
    subject: "",
    content: "",
    status: "Draft",
    variables: [],
    logoUrl: "",
    logoFileName: "",
    description: "",
  });

  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });

  // Initialize form when template changes
  useEffect(() => {
    if (template && mode === "edit") {
      setFormData({
        name: template.name,
        type: template.type,
        subject: template.subject,
        content: template.content,
        status: template.status,
        variables: template.variables,
        logoUrl: template.logoUrl || "",
        logoFileName: template.logoFileName || "",
        description: template.description || "",
      });
      setSelectedVariables(template.variables);
      setLogoPreview(template.logoUrl || "");
    } else if (mode === "create") {
      setFormData({
        name: "",
        type: "custom",
        subject: "",
        content: "",
        status: "Draft",
        variables: [],
        logoUrl: "",
        logoFileName: "",
        description: "",
      });
      setSelectedVariables([]);
      setLogoPreview("");
    }
    setLogoFile(null);
    setIsPreviewMode(false);
  }, [template, mode, isOpen]);

  // Handle form changes
  const handleInputChange = (field: keyof EmailTemplatePayload, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle variable selection
  const handleVariableToggle = (variableKey: string) => {
    setSelectedVariables(prev => {
      const newSelected = prev.includes(variableKey)
        ? prev.filter(v => v !== variableKey)
        : [...prev, variableKey];

      handleInputChange("variables", newSelected);
      return newSelected;
    });
  };

  // Handle logo upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > LOGO_UPLOAD_CONFIG.maxSize) {
      showToast({
        type: "error",
        title: "File Too Large",
        message: "Logo file must be smaller than 2MB"
      });
      return;
    }

    if (!LOGO_UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
      showToast({
        type: "error",
        title: "Invalid File Type",
        message: "Please select a valid image file (JPEG, PNG, GIF, SVG)"
      });
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
      handleInputChange("logoUrl", e.target?.result as string);
      handleInputChange("logoFileName", file.name);
    };
    reader.readAsDataURL(file);
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
    handleInputChange("logoUrl", "");
    handleInputChange("logoFileName", "");
  };

  // Insert variable into content
  const insertVariable = (variable: EmailVariable) => {
    const variableText = `{{${variable.key}}}`;
    handleInputChange("content", formData.content + variableText);
  };

  // Preview template with variables replaced
  const getPreviewContent = () => {
    let content = formData.content;
    selectedVariables.forEach(variableKey => {
      const variable = EMAIL_VARIABLES.find(v => v.key === variableKey);
      if (variable) {
        content = content.replace(new RegExp(`{{${variableKey}}}`, 'g'), variable.example);
      }
    });
    return content;
  };

  // Handle save
  const handleSave = () => {
    if (!formData.name.trim()) {
      showToast({ type: "error", title: "Validation Error", message: "Template name is required" });
      return;
    }

    if (!formData.subject.trim()) {
      showToast({ type: "error", title: "Validation Error", message: "Email subject is required" });
      return;
    }

    if (!formData.content.trim()) {
      showToast({ type: "error", title: "Validation Error", message: "Email content is required" });
      return;
    }

    onSave(formData);
    onClose();
  };

  // Handle delete
  const handleDelete = () => {
    if (template && onDelete) {
      onDelete(template.id);
      setDeleteModal({ isOpen: false });
      onClose();
    }
  };

  // Group variables by category
  const variablesByCategory = EMAIL_VARIABLES.reduce((acc, variable) => {
    if (!acc[variable.category]) {
      acc[variable.category] = [];
    }
    acc[variable.category].push(variable);
    return acc;
  }, {} as Record<string, EmailVariable[]>);

  if (!isOpen) return null;

  return (
    <>
      <FormModal
        isOpen={isOpen}
        onClose={onClose}
        title={mode === "create" ? "Create Email Template" : "Edit Email Template"}
        size="xl"
        className="max-h-[90vh] overflow-hidden"
        confirmText="Save Template"
        cancelText="Cancel"
        onConfirm={handleSave}
        showCancel={true}
      >
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Template Name" required>
                <Input
                  value={formData.name}
                  onChange={(event) => handleInputChange("name", event.target.value)}
                  placeholder="Enter template name"
                  required
                />
              </FormField>

              <Select
                label="Template Type"
                value={formData.type}
                onChange={(value) => handleInputChange("type", value as EmailTemplateType)}
                options={[
                  { label: "Select Type", value: "" },
                  ...Object.entries(EMAIL_TEMPLATE_TYPES).map(([key, config]) => ({
                    label: `${config.icon} ${config.label}`,
                    value: key
                  }))
                ]}
              />
            </div>

            <FormField label="Email Subject" required>
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
                placeholder="Brief description of this template"
                rows={2}
              />
            </FormField>

            <FormField label="Status">
              <Select
                value={formData.status}
                onChange={(value) => handleInputChange("status", value)}
                options={[
                  { label: "Draft", value: "Draft" },
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
              />
            </FormField>
          </div>

          {/* Logo Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Logo</h3>

            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
              {logoPreview ? (
                <div className="text-center space-y-4">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="max-w-32 max-h-16 mx-auto object-contain"
                  />
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change Logo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveLogo}
                    >
                      <IconTrash className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">Upload a logo for your email template</p>
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              )}
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Variables Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Available Variables</h3>
            <p className="text-sm text-slate-600">
              Select variables to use in your template. Click on a variable to insert it into the content.
            </p>

            <div className="space-y-4">
              {Object.entries(variablesByCategory).map(([category, variables]) => (
                <div key={category} className="space-y-2">
                  <h4 className="font-medium text-slate-800 capitalize">{category} Variables</h4>
                  <div className="flex flex-wrap gap-2">
                    {variables.map((variable) => (
                      <Badge
                        key={variable.key}
                        color={selectedVariables.includes(variable.key) ? "emerald" : "slate"}
                        size="sm"
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => handleVariableToggle(variable.key)}
                      >
                        {variable.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Editor */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">Email Content</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                <IconEye className="h-4 w-4 mr-2" />
                {isPreviewMode ? "Edit" : "Preview"}
              </Button>
            </div>

            {isPreviewMode ? (
              <div className="border border-slate-200 rounded-lg p-4 bg-white min-h-96">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <CKEditor
                  editor={ClassicEditor as any}
                  data={formData.content}
                  onChange={(event: any, editor: any) => {
                    const data = editor.getData();
                    handleInputChange("content", data);
                  }}
                  config={{
                    toolbar: [
                      'heading',
                      '|',
                      'bold',
                      'italic',
                      'underline',
                      'strikethrough',
                      '|',
                      'fontSize',
                      'fontColor',
                      'fontBackgroundColor',
                      '|',
                      'alignment',
                      '|',
                      'numberedList',
                      'bulletedList',
                      '|',
                      'indent',
                      'outdent',
                      '|',
                      'link',
                      'blockQuote',
                      '|',
                      'insertTable',
                      '|',
                      'undo',
                      'redo'
                    ],
                    fontSize: {
                      options: [9, 11, 13, 'default', 17, 19, 21]
                    },
                    table: {
                      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
                    }
                  }}
                />
                <p className="text-xs text-slate-500">
                  Use {"{{variableName}}"} syntax to insert variables. Selected variables are highlighted above.
                </p>
              </div>
            )}
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={handleDelete}
        type="error"
        title="Delete Email Template"
        description={`Are you sure you want to delete "${template?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        showCancel
      />
    </>
  );
};