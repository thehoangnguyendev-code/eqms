import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { StatusBadge } from "@/components/ui" ;
import type { StatusType } from "@/components/ui" ;
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { ROUTES } from "@/app/routes.constants";

// Document-level statuses (not revision-level)
type DocumentState = "Draft" | "Active" | "Obsoleted" | "Closed - Cancelled";

export interface OriginalDocumentInfo {
  documentNumber: string;
  created: string;
  openedBy: string;
  documentName: string;
  state: DocumentState;
  author: string;
  validUntil: string;
}

interface OriginalDocumentTabProps {
  document?: OriginalDocumentInfo | null;
}

const mapDocumentStateToStatusType = (state: DocumentState): StatusType => {
  switch (state) {
    case "Active":
      return "active";
    case "Draft":
      return "draft";
    case "Obsoleted":
      return "obsolete";
    case "Closed - Cancelled":
      return "archived";
    default:
      return "draft";
  }
};

/**
 * Formats a date string to dd/MM/yyyy HH:mm:ss
 */
const formatDateTimeFull = (dateStr: string): string => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const OriginalDocumentTab: React.FC<OriginalDocumentTabProps> = ({ document }) => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const documents = useMemo(() => {
    if (!document) return [];
    return [document];
  }, [document]);

  const handleDocumentClick = (documentNumber: string) => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate(ROUTES.DOCUMENTS.DETAIL(documentNumber));
    }, 600);
  };

  return (
    <div className="space-y-4">
      {isNavigating && <FullPageLoading text="Loading..." />}

      {/* Table */}
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-10 sm:w-16">
                  No.
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Document Number
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                  Created
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                  Opened by
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Document Name
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  State
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                  Author
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                  Valid Until
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {documents.length > 0 ? (
                documents.map((doc, index) => (
                  <tr
                    key={doc.documentNumber}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm text-slate-500 whitespace-nowrap">
                      {index + 1}
                    </td>
                    <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap">
                      <button
                        onClick={() => handleDocumentClick(doc.documentNumber)}
                        className="font-medium text-emerald-600 hover:text-emerald-700 hover:underline underline-offset-2 transition-colors cursor-pointer"
                      >
                        {doc.documentNumber}
                      </button>
                    </td>
                    <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm text-slate-600 whitespace-nowrap hidden md:table-cell">
                      {formatDateTimeFull(doc.created)}
                    </td>
                    <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm text-slate-600 whitespace-nowrap hidden md:table-cell">
                      {doc.openedBy}
                    </td>
                    <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm text-slate-900 whitespace-nowrap">
                      {doc.documentName}
                    </td>
                    <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm whitespace-nowrap">
                      <StatusBadge status={mapDocumentStateToStatusType(doc.state)} />
                    </td>
                    <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm text-slate-600 whitespace-nowrap hidden lg:table-cell">
                      {doc.author}
                    </td>
                    <td className="py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm text-slate-600 whitespace-nowrap hidden lg:table-cell">
                      {formatDateTimeFull(doc.validUntil)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                        <Search className="h-5 w-5 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-slate-500">
                        No records to display
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
