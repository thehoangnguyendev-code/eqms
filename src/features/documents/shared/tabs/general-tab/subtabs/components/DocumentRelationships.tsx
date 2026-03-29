import React, { useState, useMemo } from "react";
import {
  X,
  FileText,
  Check,
  AlertCircle,
  Search,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Select } from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";
import { FormModal } from "@/components/ui/modal/FormModal";
import { cn } from "@/components/ui/utils";
import { ParentDocument, RelatedDocument } from "../types";
import {
  MOCK_EFFECTIVE_DOCUMENTS,
  MOCK_ALL_DOCUMENTS,
} from "@/features/documents/shared/mockData";

interface DocumentRelationshipsProps {
  parentDocument: ParentDocument | null;
  onParentDocumentChange: (parent: ParentDocument | null) => void;
  relatedDocuments: RelatedDocument[];
  onRelatedDocumentsChange: (docs: RelatedDocument[]) => void;
  documentType?: string;
  onSuggestedCodeChange?: (code: string) => void;
  isRelatedModalOpen?: boolean;
  onRelatedModalClose?: () => void;
  isCorrelatedModalOpen?: boolean;
  onCorrelatedModalClose?: () => void;
}

export const DocumentRelationships: React.FC<DocumentRelationshipsProps> = ({
  parentDocument,
  onParentDocumentChange,
  relatedDocuments,
  onRelatedDocumentsChange,
  documentType,
  onSuggestedCodeChange,
  isRelatedModalOpen: externalRelatedModalOpen,
  onRelatedModalClose: externalRelatedModalClose,
  isCorrelatedModalOpen: externalCorrelatedModalOpen,
  onCorrelatedModalClose: externalCorrelatedModalClose,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAvailableIds, setSelectedAvailableIds] = useState<string[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [internalParentModalOpen, setInternalParentModalOpen] = useState(false);
  const [internalRelatedModalOpen, setInternalRelatedModalOpen] = useState(false);
  
  // Temporary state for modal editing
  const [tempParentDocument, setTempParentDocument] = useState<ParentDocument | null>(null);
  const [tempRelatedDocuments, setTempRelatedDocuments] = useState<RelatedDocument[]>([]);

  // Use external state if provided, otherwise use internal state
  const isParentModalOpen = externalCorrelatedModalOpen !== undefined ? externalCorrelatedModalOpen : internalParentModalOpen;
  const setIsParentModalOpen = externalCorrelatedModalClose || setInternalParentModalOpen;
  const isRelatedModalOpen = externalRelatedModalOpen !== undefined ? externalRelatedModalOpen : internalRelatedModalOpen;
  const setIsRelatedModalOpen = externalRelatedModalClose || setInternalRelatedModalOpen;

  // Initialize temp state when modal opens
  React.useEffect(() => {
    if (isParentModalOpen) {
      setTempParentDocument(parentDocument);
    }
  }, [isParentModalOpen, parentDocument]);

  React.useEffect(() => {
    if (isRelatedModalOpen) {
      setTempRelatedDocuments(relatedDocuments);
    }
  }, [isRelatedModalOpen, relatedDocuments]);

  // Prepare options for parent document select
  const parentOptions = useMemo(
    () => [
      { label: "-- None (This is a standalone document) --", value: "" },
      ...MOCK_EFFECTIVE_DOCUMENTS.map((doc) => ({
        label: `${doc.id} - ${doc.title}`,
        value: doc.id,
      })),
    ],
    [],
  );

  // Available documents (not selected and not parent)
  const availableDocuments = useMemo(() => {
    const excludedIds = [
      tempParentDocument?.id,
      ...tempRelatedDocuments.map((d) => d.id),
    ].filter(Boolean) as string[];

    return MOCK_ALL_DOCUMENTS.filter((doc) => !excludedIds.includes(doc.id));
  }, [tempParentDocument, tempRelatedDocuments]);

  // Filtered available documents based on search
  const filteredAvailableDocs = useMemo(() => {
    if (!searchQuery.trim()) return availableDocuments;
    const query = searchQuery.toLowerCase();
    return availableDocuments.filter(
      (doc) =>
        doc.id.toLowerCase().includes(query) ||
        doc.title.toLowerCase().includes(query),
    );
  }, [availableDocuments, searchQuery]);

  // Handle parent document selection (temp state)
  const handleParentChange = (value: string) => {
    if (value === "") {
      setTempParentDocument(null);
    } else {
      const selected = MOCK_EFFECTIVE_DOCUMENTS.find((doc) => doc.id === value);
      if (selected) {
        setTempParentDocument({
          id: selected.id,
          documentNumber: selected.id,
          created: "2024-01-10",
          openedBy: "John Doe",
          documentName: selected.title,
          state: "effective",
          documentType: selected.type,
          department: "Quality Assurance",
          authorCoAuthor: "John Doe",
          effectiveDate: "2024-02-01",
          validUntil: "2025-02-01"
        });
      }
    }
  };

  // Toggle selection in available list
  const handleToggleAvailable = (id: string) => {
    setSelectedAvailableIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Toggle selection in selected list
  const handleToggleSelected = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Move selected items from available to selected (temp state)
  const handleMoveToSelected = () => {
    const docsToAdd = availableDocuments.filter((doc) =>
      selectedAvailableIds.includes(doc.id),
    );
    const newRelatedDocs: RelatedDocument[] = docsToAdd.map((doc) => ({
      id: doc.id,
      documentNumber: doc.id,
      created: "2024-01-10",
      openedBy: "John Doe",
      documentName: doc.title,
      state: "effective" as const,
      documentType: doc.type,
      department: "Quality Assurance",
      authorCoAuthor: "John Doe",
      effectiveDate: "2024-02-01",
      validUntil: "2025-02-01"
    }));
    setTempRelatedDocuments([...tempRelatedDocuments, ...newRelatedDocs]);
    setSelectedAvailableIds([]);
  };

  // Move selected items from selected back to available (temp state)
  const handleMoveToAvailable = () => {
    setTempRelatedDocuments(
      tempRelatedDocuments.filter((doc) => !selectedDocIds.includes(doc.id)),
    );
    setSelectedDocIds([]);
  };

  // Double click to move single item (temp state)
  const handleDoubleClickAvailable = (id: string) => {
    const doc = availableDocuments.find((d) => d.id === id);
    if (doc) {
      setTempRelatedDocuments([
        ...tempRelatedDocuments,
        { 
          id: doc.id, 
          documentNumber: doc.id,
          created: "2024-01-10",
          openedBy: "John Doe",
          documentName: doc.title,
          state: "effective" as const,
          documentType: doc.type,
          department: "Quality Assurance",
          authorCoAuthor: "John Doe",
          effectiveDate: "2024-02-01",
          validUntil: "2025-02-01"
        },
      ]);
    }
  };

  const handleDoubleClickSelected = (id: string) => {
    setTempRelatedDocuments(tempRelatedDocuments.filter((doc) => doc.id !== id));
  };

  // Generate child document code based on parent and type
  const generateChildDocumentCode = (parentId: string, docType: string): string => {
    let suffix = "01";

    if (docType.toLowerCase().includes("form")) {
      suffix = "F01";
    } else if (docType.toLowerCase().includes("annex")) {
      suffix = "A01";
    } else if (docType.toLowerCase().includes("appendix")) {
      suffix = "AP01";
    } else {
      suffix = "01";
    }

    return `${parentId}-${suffix}`;
  };

  // Handle Save for Correlated Documents
  const handleSaveCorrelated = () => {
    onParentDocumentChange(tempParentDocument);
    
    if (tempParentDocument) {
      const suggestedCode = generateChildDocumentCode(
        tempParentDocument.id,
        documentType || "",
      );
      onSuggestedCodeChange?.(suggestedCode);
    } else {
      onSuggestedCodeChange?.("");
    }
    
    typeof setIsParentModalOpen === "function" && setIsParentModalOpen(false);
  };

  // Handle Cancel for Correlated Documents
  const handleCancelCorrelated = () => {
    setTempParentDocument(parentDocument);
    typeof setIsParentModalOpen === "function" && setIsParentModalOpen(false);
  };

  // Handle Save for Related Documents
  const handleSaveRelated = () => {
    onRelatedDocumentsChange(tempRelatedDocuments);
    setSearchQuery("");
    setSelectedAvailableIds([]);
    setSelectedDocIds([]);
    typeof setIsRelatedModalOpen === "function" && setIsRelatedModalOpen(false);
  };

  // Handle Cancel for Related Documents
  const handleCancelRelated = () => {
    setTempRelatedDocuments(relatedDocuments);
    setSearchQuery("");
    setSelectedAvailableIds([]);
    setSelectedDocIds([]);
    typeof setIsRelatedModalOpen === "function" && setIsRelatedModalOpen(false);
  };

  return (
    <>
      {/* Correlated Document Modal */}
      <FormModal
        isOpen={isParentModalOpen}
        onClose={handleCancelCorrelated}
        title="Select Correlated Documents"
        description="Link peer-level documents (e.g., Procurement SOP ↔ Inventory Control SOP)"
        size="md"
        showCancel={true}
        cancelText="Cancel"
        confirmText="Save"
        onConfirm={handleSaveCorrelated}
      >
        <div className="space-y-4">
          <div>
            <Select
              label="Correlated Document"
              value={tempParentDocument?.id || ""}
              onChange={handleParentChange}
              options={parentOptions}
              placeholder="-- None --"
              enableSearch={true}
              searchPlaceholder="Search correlated documents..."
            />
          </div>

          {tempParentDocument && (
            <div className="p-1.5 md:p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-sm font-bold text-blue-900">
                      {tempParentDocument.documentNumber}
                    </span>
                  </div>
                  <p className="text-sm text-blue-800 line-clamp-2">
                    {tempParentDocument.documentName}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-blue-700">
                    <Check className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="font-semibold">
                      Selected as correlated document
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleParentChange("")}
                  className="p-1 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                  title="Remove"
                >
                  <X className="h-3.5 w-3.5 text-blue-700" />
                </button>
              </div>
            </div>
          )}
        </div>
      </FormModal>

      {/* Related Documents Modal */}
      <FormModal
        isOpen={isRelatedModalOpen}
        onClose={handleCancelRelated}
        title="Select Related Documents"
        description="Link subordinate documents (Forms, Annexes, Work Instructions, etc.)"
        size="xl"
        showCancel={true}
        cancelText="Cancel"
        confirmText="Save"
        onConfirm={handleSaveRelated}
      >
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
          {/* Available Documents */}
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Available Documents
            </h3>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="border border-slate-200 rounded-lg bg-slate-50 flex-1 min-h-[320px] max-h-[320px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-slate-50 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
              {filteredAvailableDocs.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {filteredAvailableDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => handleToggleAvailable(doc.id)}
                      onDoubleClick={() => handleDoubleClickAvailable(doc.id)}
                      className={cn(
                        "px-3 py-2.5 cursor-pointer transition-colors text-xs hover:bg-slate-100",
                        selectedAvailableIds.includes(doc.id) &&
                          "bg-emerald-50 hover:bg-emerald-100",
                      )}
                    >
                      <div className="font-base text-slate-900">
                        {doc.id} - {doc.title}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-slate-500">
                  {searchQuery ? "No matching documents" : "No documents available"}
                </div>
              )}
            </div>
          </div>

          {/* Arrow Buttons */}
          <div className="flex flex-col items-center justify-center gap-2 pt-8">
            <button
              onClick={handleMoveToSelected}
              disabled={selectedAvailableIds.length === 0}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Move to selected"
            >
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
            <button
              onClick={handleMoveToAvailable}
              disabled={selectedDocIds.length === 0}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Move to available"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          {/* Selected Documents */}
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Selected Documents
            </h3>

            <div className="h-10 mb-3"></div>

            <div className="border border-slate-200 rounded-lg bg-slate-50 flex-1 min-h-[320px] max-h-[320px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-slate-50 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
              {tempRelatedDocuments.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {tempRelatedDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => handleToggleSelected(doc.id)}
                      onDoubleClick={() => handleDoubleClickSelected(doc.id)}
                      className={cn(
                        "px-3 py-2.5 cursor-pointer transition-colors text-xs hover:bg-slate-100",
                        selectedDocIds.includes(doc.id) &&
                          "bg-blue-50 hover:bg-blue-100",
                      )}
                    >
                      <div className="font-base text-slate-900">
                        {doc.documentNumber} - {doc.documentName}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="px-3 py-2.5 text-sm text-slate-500">
                    --None--
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </FormModal>
    </>
  );
};
