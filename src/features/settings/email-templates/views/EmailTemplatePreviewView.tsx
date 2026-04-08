import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, Clock, User, Tag, ShieldCheck, Monitor, Reply } from "lucide-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EMAIL_TEMPLATE_TYPES, EMAIL_VARIABLES } from "../constants";
import { emailTemplates } from "@/components/ui/breadcrumb/breadcrumbs.config";
import type { EmailTemplate } from "../types";

export const EmailTemplatePreviewView: React.FC = () => {
  const navigate = useNavigate();
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
        <Button onClick={() => navigate(-1)} className="mt-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  // Replace variables with example values for preview
  const getPreviewContent = () => {
    let content = template.content;
    template.variables.forEach((variableKey) => {
      const variable = EMAIL_VARIABLES.find((v) => v.key === variableKey);
      if (variable) {
        content = content.replace(new RegExp(`{{${variableKey}}}`, "g"), `<span class="bg-blue-100 text-blue-800 px-1 rounded mx-0.5 border border-blue-200">${variable.example}</span>`);
      }
    });
    return content;
  };

  const getPreviewSubject = () => {
    let subject = template.subject;
    template.variables.forEach((variableKey) => {
      const variable = EMAIL_VARIABLES.find((v) => v.key === variableKey);
      if (variable) {
        subject = subject.replace(new RegExp(`{{${variableKey}}}`, "g"), variable.example);
      }
    });
    return subject;
  };

  const templateType = EMAIL_TEMPLATE_TYPES[template.type];

  // Helper date for preview
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col pb-8">
      {/* Header */}
      <PageHeader
        title={`Preview: ${template.name}`}
        breadcrumbItems={[
          ...emailTemplates(),
          { label: "Preview" },
        ]}
        actions={
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Metadata & Variables (1/3 width) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status & Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden group hover:border-emerald-200/60 transition-colors duration-300">
            <div className="relative p-5 overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-emerald-50/50 blur-2xl group-hover:bg-emerald-100/50 transition-colors duration-500" />

              <div className="flex justify-between items-start mb-6">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                  <Tag className="h-5 w-5 text-slate-600" />
                </div>
                <Badge
                  color={
                    template.status === "Active" ? "emerald" :
                      template.status === "Inactive" ? "slate" : "amber"
                  }
                  size="sm"
                  className="shadow-sm"
                  pill
                >
                  {template.status}
                </Badge>
              </div>

              <div className="space-y-1 z-10 relative">
                <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{template.name}</h2>
                {template.description && (
                  <p className="text-sm text-slate-600 leading-relaxed">{template.description}</p>
                )}
              </div>
            </div>

            <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-y-4 gap-x-2">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Monitor className="h-3 w-3" /> Type
                </p>
                <p className="text-sm text-slate-800 font-medium flex items-center gap-1.5">
                  <span className="text-slate-500">{templateType.icon}</span> {templateType.label}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="h-3 w-3" /> Author
                </p>
                <p className="text-sm text-slate-800 font-medium truncate" title={template.createdBy}>
                  {template.createdBy}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="h-3 w-3" /> Usage
                </p>
                <p className="text-sm text-slate-800 font-medium">
                  {template.usageCount} times
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Last Active
                </p>
                <p className="text-sm text-slate-800 font-medium truncate">
                  {template.lastUsed || "Never"}
                </p>
              </div>
            </div>
          </div>

          {/* Variables Card */}
          {template.variables.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    Dynamic Variables
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Replaced automatically during delivery</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50/30">
                <div className="flex flex-wrap gap-2">
                  {template.variables.map((variableKey) => {
                    const variable = EMAIL_VARIABLES.find((v) => v.key === variableKey);
                    return variable ? (
                      <div key={variableKey} className="group relative">
                        <Badge color="blue" size="sm" className="border-blue-200/50 shadow-sm cursor-help transition-all hover:bg-blue-100">
                          {variableKey}
                        </Badge>
                      </div>
                    ) : (
                      <Badge key={variableKey} color="slate" size="sm">
                        {variableKey}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Email Preview (2/3 width) */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Mail className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-700">Live Client Preview</h3>
          </div>

          {/* OS Window Frame */}
          <div className="bg-white rounded-2xl flex-1 border border-slate-200 shadow-xl overflow-hidden flex flex-col relative ring-1 ring-black/5">
            {/* Window Top Bar */}
            <div className="h-12 bg-gradient-to-b from-slate-50 to-slate-100/50 border-b border-slate-200/80 flex items-center px-4 justify-between select-none">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500 shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500 shadow-sm" />
              </div>
              <div className="font-medium text-xs text-slate-500 bg-white/60 px-3 py-1 rounded-md border border-slate-200/60 shadow-sm pointer-events-none">
                {getPreviewSubject()}
              </div>
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
                  <Reply className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

            {/* Email Header */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-100 relative">
              {/* Optional watermark or subtle bg logo can go here */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-md ring-4 ring-emerald-50">
                    S
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-900 leading-tight">System Notification</h4>
                    <p className="text-sm text-slate-500 mt-0.5">noreply@eqms.example.com</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-slate-500">{today}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-slate-400 w-12">To:</span>
                  <span className="text-sm font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    user@example.com
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-sm font-medium text-slate-400 w-12">Subject:</span>
                  <span className="text-[15px] font-bold text-slate-900 leading-snug">
                    {getPreviewSubject()}
                  </span>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 bg-white p-8 overflow-y-auto max-h-[600px] custom-scrollbar">
              <div className="max-w-3xl mx-auto">
                {/* Simulated Content Rendering */}
                <div
                  className="prose prose-sm md:prose-base prose-slate max-w-none 
                    prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline
                    prose-headings:font-semibold prose-headings:text-slate-800
                    prose-p:leading-relaxed prose-p:text-slate-600"
                  dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
                />
              </div>
            </div>

            {/* Disclaimer footer */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-xs text-center text-slate-400">
              This email is automatically generated by the EQMS System. Please do not reply.
            </div>
          </div>
        </div>
      </div>

      {/* Global styles for custom scrollbar if not in index.css */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
          border: 3px solid white;
        }
      `}} />
    </div>
  );
};
