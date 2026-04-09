import React from "react";
import { useLocation } from "react-router-dom";
import { Mail, Info, Variable } from "lucide-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormSection } from "@/components/ui/form";
import { Loading } from "@/components/ui/loading";
import { useNavigateWithLoading } from "@/hooks/useNavigateWithLoading";
import { EMAIL_TEMPLATE_TYPES, EMAIL_VARIABLES } from "../constants";
import { emailTemplates } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { EmailLivePreview } from "../components/EmailLivePreview";
import type { EmailTemplate } from "../types";


export const EmailTemplatePreviewView: React.FC = () => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();
  const location = useLocation();
  const template = location.state?.template as EmailTemplate | null;

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-[60vh]">
        <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Mail className="h-10 w-10 text-slate-300" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">No template selected</h3>
        <p className="text-slate-500 mt-1">Please select a template from the list to preview.</p>
        <Button onClick={() => navigateTo(-1 as any)} className="mt-6">Go Back</Button>
      </div>
    );
  }

  const templateType = EMAIL_TEMPLATE_TYPES[template.type];

  return (
    <div className="space-y-5 w-full flex-1 flex flex-col pb-8">
      {/* Header */}
      <PageHeader
        title={`Preview: ${template.name}`}
        breadcrumbItems={[...emailTemplates(), { label: "Preview" }]}
        actions={
          <Button size="sm" variant="outline-emerald" className="whitespace-nowrap" onClick={() => navigateTo(-1 as any)}>
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Metadata & Variables */}
        <div className="lg:col-span-4 space-y-5">
          {/* Template Info Card */}
          <FormSection title="Template Info" icon={<Info className="h-4 w-4" />}>
            <div className="space-y-3 lg:space-y-4">
              {/* Name */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2 pb-3 lg:pb-4 border-b border-slate-200">
                <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Name</label>
                <p className="text-xs lg:text-sm text-slate-900 font-medium flex-1">{template.name}</p>
              </div>

              {/* Status */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2 pb-3 lg:pb-4 border-b border-slate-200">
                <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Status</label>
                <div className="flex-1">
                  <Badge
                    color={template.status === "Active" ? "emerald" : template.status === "Inactive" ? "slate" : "amber"}
                    size="sm"
                    pill
                  >
                    {template.status}
                  </Badge>
                </div>
              </div>

              {/* Type */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2 pb-3 lg:pb-4 border-b border-slate-200">
                <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Type</label>
                <p className="text-xs lg:text-sm text-slate-900 flex-1">
                  {templateType.icon} {templateType.label}
                </p>
              </div>

              {/* Author */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2 pb-3 lg:pb-4 border-b border-slate-200">
                <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Author</label>
                <p className="text-xs lg:text-sm text-slate-900 flex-1 truncate" title={template.createdBy}>
                  {template.createdBy}
                </p>
              </div>

              {/* Usage */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2 pb-3 lg:pb-4 border-b border-slate-200">
                <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Usage</label>
                <p className="text-xs lg:text-sm text-slate-900 flex-1">{template.usageCount} times</p>
              </div>

              {/* Last Used */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2 pb-3 lg:pb-4 border-b border-slate-200">
                <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Last Used</label>
                <p className="text-xs lg:text-sm text-slate-900 flex-1">{template.lastUsed || "Never"}</p>
              </div>

              {/* Description */}
              <div className="flex flex-col lg:flex-row lg:items-start gap-1.5 lg:gap-2">
                <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Description</label>
                <p className="text-xs lg:text-sm text-slate-900 flex-1 leading-relaxed">
                  {template.description || "—"}
                </p>
              </div>
            </div>
          </FormSection>

          {/* Variables Card */}
          {template.variables.length > 0 && (
            <FormSection title="Dynamic Variables" icon={<Variable className="h-4 w-4" />}>
              <p className="text-xs text-slate-500 mb-3">Replaced automatically during delivery</p>
              <div className="flex flex-wrap gap-2">
                {template.variables.map((variableKey) => {
                  const variable = EMAIL_VARIABLES.find((v) => v.key === variableKey);
                  return variable ? (
                    <Badge key={variableKey} color="blue" size="sm" className="cursor-help">
                      {variableKey}
                    </Badge>
                  ) : (
                    <Badge key={variableKey} color="slate" size="sm">{variableKey}</Badge>
                  );
                })}
              </div>
            </FormSection>
          )}
        </div>

        {/* Right Column: Email Preview */}
        <div className="lg:col-span-8 flex flex-col">
          <FormSection title="Live Client Preview" icon={<Mail className="h-4 w-4" />}>
            <EmailLivePreview
              subject={template.subject}
              content={template.content}
              variables={template.variables}
              copyright={template.copyright}
              contactEmail={template.contactEmail}
              logoUrl={template.logoUrl}
            />
          </FormSection>
        </div>
      </div>

      {isNavigating && <Loading fullPage text="Loading..." />}
    </div>
  );
};
