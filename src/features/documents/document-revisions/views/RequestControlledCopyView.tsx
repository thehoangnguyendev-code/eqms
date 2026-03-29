import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/app/routes.constants';
import { ChevronRight, Printer, AlertCircle, ArrowLeft, Home, CheckCircle2, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/select/Select';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { ESignatureModal } from '@/components/ui/esign-modal/ESignatureModal';
import { AlertModal } from '@/components/ui/modal/AlertModal';
import { useToast } from '@/components/ui/toast/Toast';
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { requestControlledCopy } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { useNavigateWithLoading } from "@/hooks";

// --- Types ---
interface DistributionLocation {
  id: string;
  code: string;
  name: string;
  department: string;
}

interface DocumentToPrint {
  id: string;
  documentId: string;
  title: string;
  version: string;
  status: 'Effective' | 'Draft' | 'Pending Review' | 'Pending Approval' | 'Approved' | 'Archive';
  isParent: boolean;
}

export interface ControlledCopyRequest {
  documentId: string;
  locationId: string;
  locationName: string;
  reason: string;
  quantity: number;
  signature: string;
  selectedDocuments: string[];
}

// --- Mock Data: Distribution Locations ---
const DISTRIBUTION_LOCATIONS: DistributionLocation[] = [
  { id: '1', code: 'LOC-QA-01', name: 'Quality Assurance Lab', department: 'Quality Assurance' },
  { id: '2', code: 'LOC-PROD-01', name: 'Production Floor A', department: 'Production' },
  { id: '3', code: 'LOC-PROD-02', name: 'Production Floor B', department: 'Production' },
  { id: '4', code: 'LOC-QC-01', name: 'Quality Control Lab', department: 'Quality Control' },
  { id: '5', code: 'LOC-WHS-01', name: 'Warehouse - Raw Material', department: 'Warehouse' },
  { id: '6', code: 'LOC-WHS-02', name: 'Warehouse - Finished Goods', department: 'Warehouse' },
  { id: '7', code: 'LOC-RD-01', name: 'R&D Laboratory', department: 'Research & Development' },
  { id: '8', code: 'LOC-ENG-01', name: 'Engineering Office', department: 'Engineering' },
  { id: '9', code: 'LOC-HSE-01', name: 'Health, Safety & Environment Office', department: 'HSE' },
  { id: '10', code: 'LOC-REG-01', name: 'Regulatory Affairs Office', department: 'Regulatory Affairs' },
];

// --- Main Component ---
export const RequestControlledCopyView: React.FC = () => {
  const { navigateTo, isNavigating } = useNavigateWithLoading();
  const location = useLocation();
  const { showToast } = useToast();

  // Get document data from navigation state
  const { documentId, documentTitle, documentVersion, relatedDocuments = [] } = location.state || {};

  // Form state
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [reason, setReason] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Document selection state (default: Select All)
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<Set<string>>(
    new Set(relatedDocuments.map((doc: DocumentToPrint) => doc.id))
  );

  // Modal states
  const [showesignModal, setShowesignModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Redirect if no document data
  useEffect(() => {
    if (!documentId) {
      navigateTo(ROUTES.DOCUMENTS.ALL);
    }
  }, [documentId, navigateTo]);

  if (!documentId) {
    return null;
  }

  // Determine if we have parent-child relationship
  const hasRelatedDocs = relatedDocuments.length > 0;
  const documentsToShow: DocumentToPrint[] = hasRelatedDocs ? relatedDocuments : [];

  // Check for non-Effective documents
  const hasNonEffectiveDocs = documentsToShow.some((doc: DocumentToPrint) => doc.status !== 'Effective');

  // Check if all documents selected
  const isAllSelected = selectedDocumentIds.size === documentsToShow.length && documentsToShow.length > 0;

  // Check if form is valid (for Submit button enable/disable)
  const isFormValid =
    selectedLocation !== '' &&
    (!hasRelatedDocs || selectedDocumentIds.size > 0) &&
    reason.trim().length >= 10 &&
    quantity >= 1 &&
    quantity <= 50;

  // Toggle Select All
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocumentIds(new Set(documentsToShow.map((doc: DocumentToPrint) => doc.id)));
    } else {
      setSelectedDocumentIds(new Set());
    }
  };

  // Toggle individual document
  const handleToggleDocument = (docId: string, checked: boolean) => {
    const newSet = new Set(selectedDocumentIds);
    if (checked) {
      newSet.add(docId);
    } else {
      newSet.delete(docId);
    }
    setSelectedDocumentIds(newSet);
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedLocation) {
      newErrors.location = 'Location is required';
    }

    if (hasRelatedDocs && selectedDocumentIds.size === 0) {
      newErrors.documents = 'Please select at least one document to print';
    }

    if (!reason.trim()) {
      newErrors.reason = 'Reason is required';
    } else if (reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters';
    }

    if (quantity < 1 || quantity > 50) {
      newErrors.quantity = 'Quantity must be between 1 and 50';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle cancel button click
  const handleCancel = () => {
    // Check if form has any data
    const hasFormData =
      selectedLocation !== '' ||
      reason.trim() !== '' ||
      quantity !== 1 ||
      (hasRelatedDocs && selectedDocumentIds.size !== documentsToShow.length);

    if (hasFormData) {
      // Show confirmation modal
      setShowCancelModal(true);
    } else {
      // No data, just go back
      navigateTo(-1);
    }
  };

  // Handle cancel confirmation
  const handleCancelConfirm = () => {
    setShowCancelModal(false);
    navigateTo(-1);
  };

  // Handle form submission (open e-signature modal)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setShowesignModal(true);
    }
  };

  // Handle e-signature confirmation
  const handleESignConfirm = (signatureReason: string) => {
    const location = DISTRIBUTION_LOCATIONS.find(loc => loc.id === selectedLocation);

    const request: ControlledCopyRequest = {
      documentId,
      locationId: selectedLocation,
      locationName: location?.name || '',
      reason,
      quantity,
      signature: signatureReason,
      selectedDocuments: Array.from(selectedDocumentIds),
    };

    // TODO: Call API to submit controlled copy request

    showToast({
      type: 'success',
      title: 'Request Submitted Successfully',
      message: 'Your request has been sent to the QA Manager for approval. You can monitor the status on the All Controlled Copies screen.',
      duration: 5000,
    });

    setShowesignModal(false);
    navigateTo(-1);
  };

  // Prepare location options for Select component
  const locationOptions = DISTRIBUTION_LOCATIONS.map(loc => ({
    value: loc.id,
    label: `${loc.code} - ${loc.name}`,
    description: loc.department,
  }));

  return (
    <div className="space-y-6">
      {/* Header: Title + Breadcrumb + Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
              Request Controlled Copy
            </h1>
            <Breadcrumb items={requestControlledCopy(navigateTo, documentId)} />
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <Button
              type="button"
              variant="outline-emerald"
              size="sm"
              onClick={handleCancel}
              className="whitespace-nowrap flex items-center gap-1.5 md:gap-2 touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outline-emerald"
              size="sm"
              disabled={!isFormValid}
              form="controlled-copy-form"
              className="flex items-center gap-1.5 md:gap-2 touch-manipulation"
            >
              Submit Request
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <form id="controlled-copy-form" onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        {/* Important Notice Banner */}
        <div className="bg-amber-50 border border-amber-400 rounded-lg p-3 lg:p-4 shadow-sm">
          <div className="flex items-start gap-2 lg:gap-3">
            <div className="flex-1">
              <h3 className="text-xs lg:text-sm font-semibold text-amber-900 mb-1.5 lg:mb-2">Important Notice</h3>
              <div className="space-y-1 lg:space-y-1.5 text-xs lg:text-sm text-amber-800">
                <p>• All printed copies will be individually numbered and must be recalled when a new version is available.</p>
                <p>• The issuance of controlled copies must comply with the organization's document management procedures.</p>
                <p>• This action will be recorded in the audit trail and requires electronic signature approval.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Info - Full Width */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 lg:p-6">
          <h2 className="text-base lg:text-lg font-semibold text-slate-900 mb-3 lg:mb-4">
            Document Information
          </h2>
          <div className="space-y-3 lg:space-y-4">
            {/* Document ID */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2 pb-3 lg:pb-4 border-b border-slate-200">
              <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Document ID</label>
              <p className="text-xs lg:text-sm text-slate-900 font-medium flex-1">
                {documentId}
              </p>
            </div>

            {/* Title */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2 pb-3 lg:pb-4 border-b border-slate-200">
              <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Title</label>
              <p className="text-xs lg:text-sm text-slate-900 flex-1" title={documentTitle}>
                {documentTitle}
              </p>
            </div>

            {/* Version */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2 pb-3 lg:pb-4 border-b border-slate-200">
              <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Version</label>
              <p className="text-xs lg:text-sm text-slate-900 font-medium flex-1">
                v{documentVersion}
              </p>
            </div>

            {/* Status */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-1.5 lg:gap-2">
              <label className="text-xs sm:text-sm font-medium text-slate-700 w-full lg:w-40 flex-shrink-0">Status</label>
              <div className="flex-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                  Effective
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Select Documents + Distribution Details OR Distribution Details + Summary */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Document Selection - Only show if has related documents */}
          {hasRelatedDocs && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 lg:p-6">
              <h2 className="text-base lg:text-lg font-semibold text-slate-900 mb-3 lg:mb-4">
                Select Documents to Print
              </h2>
              <div>
                {/* Select All */}
                <div className="flex items-center justify-between pb-2.5 lg:pb-3 mb-2.5 lg:mb-3 border-b border-slate-200">
                  <Checkbox
                    id="select-all"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    label={`Select All (${selectedDocumentIds.size} of ${documentsToShow.length} selected)`}
                    className="font-medium text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleSelectAll(!isAllSelected)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    {isAllSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {/* Document List */}
                <div className="space-y-2.5 lg:space-y-3 max-h-96 overflow-y-auto pr-1 lg:pr-2">
                  {documentsToShow.map((doc: DocumentToPrint) => (
                    <div
                      key={doc.id}
                      className="border border-slate-200 rounded-lg p-3 lg:p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start gap-2 lg:gap-3">
                        <Checkbox
                          id={`doc-${doc.id}`}
                          checked={selectedDocumentIds.has(doc.id)}
                          onChange={(checked) => handleToggleDocument(doc.id, checked)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 lg:gap-2 mb-1 flex-wrap">
                            <span className={`text-xs lg:text-sm font-medium ${doc.isParent ? 'text-slate-900' : 'text-slate-700'}`}>
                              {doc.documentId}
                            </span>
                            <span className="text-xs text-slate-500">v{doc.version}</span>
                            {doc.isParent && (
                              <span className="px-1.5 lg:px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Parent
                              </span>
                            )}
                            {doc.status !== 'Effective' && (
                              <span className="px-1.5 lg:px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                {doc.status}
                              </span>
                            )}
                          </div>
                          <p className="text-xs lg:text-sm text-slate-600">{doc.title}</p>
                          {doc.status !== 'Effective' && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                              <AlertCircle className="h-3.5 w-3.5" />
                              <span>This document is not yet Effective. Printing is not recommended.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Validation Error for Document Selection */}
                {errors.documents && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg mt-3">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-600">{errors.documents}</p>
                  </div>
                )}

                {/* Warning if non-Effective docs selected */}
                {hasNonEffectiveDocs && selectedDocumentIds.size > 0 && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg mt-3">
                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-800">
                      Note: Some selected documents are not in Effective status. Consider removing them from selection.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Distribution Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 lg:p-6">
            <h2 className="text-base lg:text-lg font-semibold text-slate-900 mb-3 lg:mb-4">
              Distribution Details
            </h2>
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Location Dropdown */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                    Location <span className="text-red-600">*</span>
                  </label>
                  <Select
                    value={selectedLocation}
                    onChange={(value) => {
                      setSelectedLocation(value);
                      if (errors.location) {
                        setErrors({ ...errors, location: '' });
                      }
                    }}
                    options={locationOptions}
                    placeholder="Select location"
                    enableSearch
                  />
                  {errors.location && (
                    <p className="text-xs lg:text-sm text-red-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.location}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 flex items-center gap-1">
                    Choose where the controlled copy will be distributed
                  </p>
                </div>

                {/* Quantity Input */}
                <div>
                  <label
                    htmlFor="quantity"
                    className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block"
                  >
                    Copies <span className="text-red-600">*</span>
                  </label>
                  <div className="flex items-center gap-2 lg:gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => {
                        if (quantity > 1) {
                          setQuantity(quantity - 1);
                          if (errors.quantity) {
                            setErrors({ ...errors, quantity: '' });
                          }
                        }
                      }}
                      disabled={quantity <= 1}
                      className="lg:h-9 lg:w-9"
                    >
                      <span className="text-base lg:text-xl font-medium text-slate-700">−</span>
                    </Button>

                    <input
                      type="number"
                      id="quantity"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setQuantity(Math.max(1, Math.min(50, val)));
                        if (errors.quantity) {
                          setErrors({ ...errors, quantity: '' });
                        }
                      }}
                      min={1}
                      max={50}
                      className={`h-9 lg:h-9 w-20 lg:w-24 px-2 lg:px-3 py-2 border rounded-lg text-xs lg:text-sm text-center font-medium focus:outline-none focus:ring-1 transition-colors ${errors.quantity
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500'
                        }`}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() => {
                        if (quantity < 50) {
                          setQuantity(quantity + 1);
                          if (errors.quantity) {
                            setErrors({ ...errors, quantity: '' });
                          }
                        }
                      }}
                      disabled={quantity >= 50}
                      className="lg:h-9 lg:w-9"
                    >
                      <span className="text-base lg:text-xl font-medium text-slate-700">+</span>
                    </Button>
                  </div>
                  {errors.quantity && (
                    <p className="text-xs lg:text-sm text-red-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.quantity}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 flex items-center gap-1">
                    Each copy will be assigned a unique control number (max: 50 copies)
                  </p>
                </div>

                {/* Reason Input - Full Width */}
                <div className="lg:col-span-2">
                  <label
                    htmlFor="reason"
                    className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block"
                  >
                    Reason <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      if (errors.reason) {
                        setErrors({ ...errors, reason: '' });
                      }
                    }}
                    placeholder="e.g., Replace damaged copy, New production line..."
                    rows={3}
                    className={`w-full px-3 py-2 lg:py-2.5 border rounded-lg text-xs lg:text-sm focus:outline-none focus:ring-1 transition-colors resize-none ${errors.reason
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500'
                      }`}
                  />
                  {errors.reason && (
                    <p className="text-xs lg:text-sm text-red-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.reason}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 flex items-center gap-1">
                    Minimum 10 characters. This will be recorded in the audit trail.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary - Show in same row with Distribution Details if no related docs */}
          {!hasRelatedDocs && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 lg:p-5">
              <h3 className="text-xs lg:text-sm font-semibold text-emerald-900 mb-2 lg:mb-3">Summary</h3>
              <div className="space-y-1.5 lg:space-y-2 text-xs lg:text-sm text-emerald-800">
                <div className="flex items-center gap-1.5 lg:gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                  <span>
                    <span className="font-medium">{quantity}</span> controlled {quantity === 1 ? 'copy' : 'copies'} will be printed
                  </span>
                </div>
                <div className="flex items-center gap-1.5 lg:gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                  <span>Each copy will receive a unique control number</span>
                </div>
                <div className="flex items-center gap-1.5 lg:gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                  <span>All copies must be returned when document is revised or obsolete</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary - Show below if has related docs */}
        {hasRelatedDocs && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 lg:p-5">
            <h3 className="text-xs lg:text-sm font-semibold text-emerald-900 mb-2 lg:mb-3">Summary</h3>
            <div className="space-y-1.5 lg:space-y-2 text-xs lg:text-sm text-emerald-800">
              <div className="flex items-center gap-1.5 lg:gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                <span>
                  <span className="font-medium">{selectedDocumentIds.size}</span> document{selectedDocumentIds.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-1.5 lg:gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                <span>
                  <span className="font-medium">{quantity}</span> {quantity === 1 ? 'copy' : 'copies'} per document = <span className="font-medium">{selectedDocumentIds.size * quantity}</span> total prints
                </span>
              </div>
              <div className="flex items-center gap-1.5 lg:gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                <span>Each copy will receive a unique control number</span>
              </div>
              <div className="flex items-center gap-1.5 lg:gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                <span>All copies must be returned when document is revised or obsolete</span>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Footer Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        <Button
          type="button"
          variant="outline-emerald"
          size="sm"
          onClick={handleCancel}
          className="whitespace-nowrap flex items-center gap-1.5 md:gap-2 touch-manipulation"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="outline-emerald"
          size="sm"
          disabled={!isFormValid}
          form="controlled-copy-form"
          className="flex items-center gap-1.5 md:gap-2 touch-manipulation"
        >
          Submit Request
        </Button>
      </div>

      {/* E-Signature Modal */}
      <ESignatureModal
        isOpen={showesignModal}
        onClose={() => setShowesignModal(false)}
        onConfirm={handleESignConfirm}
        actionTitle="Confirm Controlled Copy Request"
      />

      {/* Cancel Confirmation Modal */}
      <AlertModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        type="warning"
        title="Discard Changes?"
        description={
          <div className="space-y-2">
            <p>You have unsaved changes in this form.</p>
            <p>Are you sure you want to cancel? All entered data will be lost.</p>
          </div>
        }
        confirmText="Yes, Discard"
        cancelText="No, Keep Editing"
        showCancel={true}
      />

      {isNavigating && <FullPageLoading text="Loading..." />}
    </div>
  );
};



