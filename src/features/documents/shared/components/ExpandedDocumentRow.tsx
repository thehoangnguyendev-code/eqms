import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatusBadge, StatusType } from "@/components/ui/badge";
import type { RelatedDocument, CorrelatedDocument } from "@/features/documents/document-revisions/views/types";
import { mapStatusToStatusType } from "@/utils/status";

interface ExpandedDocumentRowProps {
  revision: {
    id: string;
    relatedDocuments?: RelatedDocument[];
    correlatedDocuments?: CorrelatedDocument[];
  };
  isExpanded: boolean;
  visibleColumnsLength: number;
  hasDocs: boolean;
  showCorrelationType?: boolean;
}

/**
 * Reusable expanded row component for displaying related and correlated documents
 * Used in RevisionListView, RevisionsOwnedByMeView, and PendingDocumentsView
 */
export const ExpandedDocumentRow: React.FC<ExpandedDocumentRowProps> = ({
  revision,
  isExpanded,
  visibleColumnsLength,
  hasDocs,
  showCorrelationType = false,
}) => {
  return (
    <AnimatePresence initial={false}>
      {isExpanded && hasDocs && (
        <tr className="bg-slate-50/50">
          <td colSpan={visibleColumnsLength} className="p-0 border-b border-slate-200">
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 md:p-5">
                <div className="ml-9 flex flex-wrap gap-6">
                  {revision.relatedDocuments && revision.relatedDocuments.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Related Documents ({revision.relatedDocuments.length})
                      </p>
                      <div className="rounded-lg border border-slate-200 overflow-hidden inline-block">
                        <table className="text-xs table-auto">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-200">
                              <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">
                                Document Number
                              </th>
                              <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">
                                Document Name
                              </th>
                              <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">
                                Revision
                              </th>
                              <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">
                                Type
                              </th>
                              <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">
                                State
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {revision.relatedDocuments.map((doc: RelatedDocument) => (
                              <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-1.5 px-2.5 font-medium text-emerald-600 whitespace-nowrap">
                                  {doc.documentNumber}
                                </td>
                                <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap">
                                  {doc.documentName}
                                </td>
                                <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">
                                  {doc.revisionNumber}
                                </td>
                                <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">
                                  {doc.type}
                                </td>
                                <td className="py-1.5 px-2.5 whitespace-nowrap">
                                  <StatusBadge
                                    status={mapStatusToStatusType(doc.state) as StatusType}
                                    size="sm"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {revision.correlatedDocuments && revision.correlatedDocuments.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Correlated Documents ({revision.correlatedDocuments.length})
                      </p>
                      <div className="rounded-lg border border-slate-200 overflow-hidden inline-block">
                        <table className="text-xs table-auto">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-200">
                              <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">
                                Document Number
                              </th>
                              <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">
                                Document Name
                              </th>
                              <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">
                                Revision
                              </th>
                              <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">
                                Type
                              </th>
                              <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">
                                State
                              </th>
                              {showCorrelationType && (
                                <th className="py-1.5 px-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">
                                  Correlation Type
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {revision.correlatedDocuments.map((doc: CorrelatedDocument) => (
                              <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-1.5 px-2.5 font-medium text-emerald-600 whitespace-nowrap">
                                  {doc.documentNumber}
                                </td>
                                <td className="py-1.5 px-2.5 text-slate-700 whitespace-nowrap">
                                  {doc.documentName}
                                </td>
                                <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">
                                  {doc.revisionNumber}
                                </td>
                                <td className="py-1.5 px-2.5 text-slate-600 whitespace-nowrap">
                                  {doc.type}
                                </td>
                                <td className="py-1.5 px-2.5 whitespace-nowrap">
                                  <StatusBadge
                                    status={mapStatusToStatusType(doc.state) as StatusType}
                                    size="sm"
                                  />
                                </td>
                                {showCorrelationType && (
                                  <td className="py-1.5 px-2.5 text-slate-500 whitespace-nowrap">
                                    {doc.correlationType ?? "—"}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </td>
          <td className="p-0 border-b border-slate-200 sticky right-0 z-10 bg-white before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)]"></td>
        </tr>
      )}
    </AnimatePresence>
  );
};
