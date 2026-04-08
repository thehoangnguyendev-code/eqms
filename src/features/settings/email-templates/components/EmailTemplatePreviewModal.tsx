import React from "react";
import { X, Mail, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { EMAIL_TEMPLATE_TYPES, EMAIL_VARIABLES } from "../constants";
import type { EmailTemplate } from "../types";

interface EmailTemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate | null;
}

export const EmailTemplatePreviewModal: React.FC<EmailTemplatePreviewModalProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  if (!isOpen || !template) return null;

  // Replace variables with example values for preview
  const getPreviewContent = () => {
    let content = template.content;
    template.variables.forEach(variableKey => {
      const variable = EMAIL_VARIABLES.find(v => v.key === variableKey);
      if (variable) {
        content = content.replace(new RegExp(`{{${variableKey}}}`, 'g'), variable.example);
      }
    });
    return content;
  };

  const getPreviewSubject = () => {
    let subject = template.subject;
    template.variables.forEach(variableKey => {
      const variable = EMAIL_VARIABLES.find(v => v.key === variableKey);
      if (variable) {
        subject = subject.replace(new RegExp(`{{${variableKey}}}`, 'g'), variable.example);
      }
    });
    return subject;
  };

  const templateType = EMAIL_TEMPLATE_TYPES[template.type];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Email Template Preview"
      size="xl"
      className="max-h-[60vh] overflow-hidden"
      cancelText="Close Preview"
      showCancel={true}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">


        {/* Template Info */}
        <div className="bg-slate-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">{template.name}</h3>
            <Badge
              color={
                template.status === "Active" ? "emerald" :
                template.status === "Inactive" ? "slate" : "amber"
              }
              size="sm"
            >
              {template.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="font-medium text-slate-700">Type:</span>
              <span className="ml-1">{templateType.icon}</span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Usage:</span>
              <span className="ml-1">{template.usageCount}</span>
            </div>
          </div>
        </div>

        {/* Email Preview */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          {/* Email Header */}
          <div className="bg-slate-100 px-3 py-2 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-xs font-medium text-slate-900">Email Preview</span>
            </div>
            <div className="space-y-0.5 text-xs">
              <div>
                <span className="font-medium text-slate-700">Subject:</span>
                <span className="ml-2 text-slate-900 line-clamp-1">{getPreviewSubject()}</span>
              </div>
            </div>
          </div>

          {/* Email Content */}
          <div className="bg-white p-3 max-h-40 overflow-y-auto">
            <div
              className="prose prose-xs max-w-none"
              dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
            />
          </div>
        </div>

        {/* Variables Used */}
        {template.variables.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-2">
            <h4 className="font-medium text-blue-900 text-xs mb-1.5">Variables Used:</h4>
            <div className="flex flex-wrap gap-1">
              {template.variables.map((variableKey) => {
                const variable = EMAIL_VARIABLES.find(v => v.key === variableKey);
                return variable ? (
                  <Badge key={variableKey} color="blue" size="sm">
                    {variable.label}
                  </Badge>
                ) : (
                  <Badge key={variableKey} color="slate" size="sm">
                    {variableKey}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        </div>
      </div>
    </FormModal>
  );
};