import React from "react";
import { createPortal } from "react-dom";
import { Edit, Copy, Eye, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { PortalDropdownPosition } from "@/hooks/usePortalDropdown";
import type { EmailTemplate } from "../types";

interface EmailTemplateActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: PortalDropdownPosition;
  template: EmailTemplate | undefined;
  onEdit: (template: EmailTemplate) => void;
  onDuplicate: (template: EmailTemplate) => void;
  onPreview: (template: EmailTemplate) => void;
  onDelete: (template: EmailTemplate) => void;
  onToggleStatus: (template: EmailTemplate) => void;
}

export const EmailTemplateActionMenu: React.FC<EmailTemplateActionMenuProps> = ({
  isOpen,
  onClose,
  position,
  template,
  onEdit,
  onDuplicate,
  onPreview,
  onDelete,
  onToggleStatus,
}) => {
  if (!isOpen || !template) return null;

  const isActive = template.status === "Active";

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-40 animate-in fade-in duration-150"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-hidden="true"
      />
      <div
        className="absolute z-50 min-w-[180px] rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
        style={position.style}
      >
        <div className="py-1">
          <button
            onClick={() => {
              onClose();
              onEdit(template);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <Edit className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium text-slate-500">Edit Template</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onDuplicate(template);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <Copy className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium text-slate-500">Duplicate</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onPreview(template);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            <Eye className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium text-slate-500">Preview</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onToggleStatus(template);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
          >
            {isActive ? (
              <ToggleLeft className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ToggleRight className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="font-medium text-slate-500">
              {isActive ? "Deactivate" : "Activate"}
            </span>
          </button>

          <button
            onClick={() => {
              onClose();
              onDelete(template);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors font-medium border-t border-slate-50 mt-1 pt-2"
          >
            <Trash2 className="h-4 w-4 flex-shrink-0" />
            <span>Delete Template</span>
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};