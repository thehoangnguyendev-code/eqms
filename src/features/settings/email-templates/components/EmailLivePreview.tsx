import React, { useMemo } from "react";
import { Reply } from "lucide-react";
import DOMPurify from "dompurify";
import { EMAIL_VARIABLES } from "../constants";
import defaultLogo from "@/assets/images/logo_nobg.png";

interface EmailLivePreviewProps {
  subject: string;
  content: string;
  variables?: string[];
  copyright?: string;
  contactEmail?: string;
  logoUrl?: string;
}

export const EmailLivePreview: React.FC<EmailLivePreviewProps> = ({
  subject,
  content,
  variables = [],
  copyright,
  contactEmail,
  logoUrl,
}) => {
  const effectiveLogo = logoUrl || defaultLogo;

  const previewContent = useMemo(() => {
    // Sanitize user input content first
    let html = DOMPurify.sanitize(content);
    
    variables.forEach((key) => {
      const variable = EMAIL_VARIABLES.find((v) => v.key === key);
      if (variable) {
        html = html.replace(
          new RegExp(`{{${key}}}`, "g"),
          `<span class="bg-blue-100 text-blue-800 px-1 rounded mx-0.5 border border-blue-200 text-xs">${variable.example}</span>`
        );
      }
    });
    return html;
  }, [content, variables]);

  const previewSubject = useMemo(() => {
    let s = subject;
    variables.forEach((key) => {
      const variable = EMAIL_VARIABLES.find((v) => v.key === key);
      if (variable) {
        s = s.replace(new RegExp(`{{${key}}}`, "g"), variable.example);
      }
    });
    return s || "No subject";
  }, [subject, variables]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long",
    day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Window Top Bar */}
      <div className="h-11 bg-gradient-to-b from-slate-50 to-slate-100/50 border-b border-slate-200 flex items-center px-4 justify-between select-none">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/50" />
          <div className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/50" />
        </div>
        <div className="text-xs text-slate-500 bg-white/70 px-3 py-1 rounded-md border border-slate-200/60 max-w-[50%] truncate">
          {previewSubject}
        </div>
        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
          <Reply className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Email Header */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-100 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-base shadow-sm ring-2 ring-emerald-50 flex-shrink-0">
              S
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">System Notification</p>
              <p className="text-xs text-slate-500">noreply@eqms.example.com</p>
            </div>
          </div>
          <span className="text-xs text-slate-400 whitespace-nowrap">{today}</span>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 w-14">To:</span>
            <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              user@example.com
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-medium text-slate-400 w-14">Subject:</span>
            <span className="text-sm font-bold text-slate-900">{previewSubject}</span>
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div className="bg-white overflow-y-auto max-h-[480px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50">
        {/* Logo */}
        <div className="flex justify-center pt-6 pb-2 px-6 border-b border-slate-100">
          <img
            src={effectiveLogo}
            alt="Logo"
            className="h-12 w-auto object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {content ? (
            <div
              className="prose prose-sm prose-slate max-w-none
                prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline
                prose-headings:font-semibold prose-headings:text-slate-800
                prose-p:leading-relaxed prose-p:text-slate-600"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">No content to preview</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 text-center space-y-2">
        {copyright && (
          <p className="text-xs text-slate-400">{copyright}</p>
        )}
        {contactEmail && (
          <p className="text-xs text-slate-400">
            If you have any questions, please contact us at
            <br />
            <a href={`mailto:${contactEmail}`} className="text-blue-500 hover:underline font-medium">
              {contactEmail}
            </a>
          </p>
        )}
        {!copyright && !contactEmail && (
          <p className="text-xs text-slate-400">
            This email is automatically generated by the EQMS System. Please do not reply.
          </p>
        )}
      </div>
    </div>
  );
};
