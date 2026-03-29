import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Send, Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { MultiSelect } from "@/components/ui/select/MultiSelect";
import { DateTimePicker } from "@/components/ui/datetime-picker/DateTimePicker";
import { useToast } from "@/components/ui/toast/Toast";
import { ESignatureModal } from "@/components/ui/esign-modal/ESignatureModal";
import { MOCK_USER_OPTIONS as MOCK_USERS, MOCK_DEPARTMENTS } from "../mockData";

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
}

type RecipientType = "users" | "department";

export const CreateLinkModal: React.FC<CreateLinkModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentTitle,
}) => {
  const { showToast } = useToast();
  const [recipientType, setRecipientType] = useState<RecipientType>("users");
  const [selectedUsers, setSelectedUsers] = useState<(string | number)[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<
    (string | number)[]
  >([]);
  const [expiryDate, setExpiryDate] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isesignModalOpen, setIsesignModalOpen] = useState(false);

  if (!isOpen) return null;

  // Generate shareable link
  const handleGenerateLink = () => {
    // Validation based on recipient type
    if (recipientType === "users" && selectedUsers.length === 0) {
      showToast({
        type: "error",
        title: "Users Required",
        message: "Please select at least one user to share the document with.",
        duration: 3000,
      });
      return;
    }

    if (recipientType === "department" && selectedDepartments.length === 0) {
      showToast({
        type: "error",
        title: "Departments Required",
        message:
          "Please select at least one department to share the document with.",
        duration: 3000,
      });
      return;
    }

    // Generate link with token based on recipient type
    const recipients =
      recipientType === "users"
        ? selectedUsers.join(",")
        : selectedDepartments.join(",");

    const token = `${documentId}-${recipientType}-${recipients}-${Date.now()}`;
    const encodedToken = btoa(token);
    const link = `${window.location.origin}/documents/shared/${encodedToken}`;
    setGeneratedLink(link);
    setIsCopied(false);
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    if (!generatedLink) return;

    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(generatedLink);
      } else {
        // Fallback method for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = generatedLink;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        textArea.remove();

        if (!successful) {
          throw new Error("Copy command failed");
        }
      }

      setIsCopied(true);
      showToast({
        type: "success",
        title: "Link Copied",
        message: "Shareable link has been copied to clipboard.",
        duration: 3000,
      });

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Copy error:", error);
      showToast({
        type: "error",
        title: "Copy Failed",
        message: "Failed to copy link to clipboard. Please copy manually.",
        duration: 3000,
      });
    }
  };

  // Handle send link via email
  const handleSendLink = () => {
    // Validation based on recipient type
    if (recipientType === "users" && selectedUsers.length === 0) {
      showToast({
        type: "error",
        title: "Users Required",
        message: "Please select at least one user to send the link to.",
        duration: 3000,
      });
      return;
    }

    if (recipientType === "department" && selectedDepartments.length === 0) {
      showToast({
        type: "error",
        title: "Departments Required",
        message: "Please select at least one department to send the link to.",
        duration: 3000,
      });
      return;
    }

    if (!generatedLink) {
      showToast({
        type: "error",
        title: "Generate Link First",
        message: "Please generate the link before sending.",
        duration: 3000,
      });
      return;
    }

    // Open e-signature modal
    setIsesignModalOpen(true);
  };

  // Handle e-signature confirmation
  const handleESignSuccess = (reason: string) => {
    setIsesignModalOpen(false);

    showToast({
      type: "success",
      title: "Link Sent",
      message: "Shareable link has been sent via email successfully.",
      duration: 3500,
    });

    // TODO: Call API to send email
    // Close modal after success
    handleClose();
  };

  // Reset and close modal
  const handleClose = () => {
    setRecipientType("users");
    setSelectedUsers([]);
    setSelectedDepartments([]);
    setExpiryDate("");
    setGeneratedLink("");
    setIsCopied(false);
    onClose();
  };

  return createPortal(
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Create Shareable Link
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Share document access with specific users
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Document Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 flex-shrink-0">
                <Link2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Document
                </p>
                <p className="text-sm font-semibold text-slate-900 mt-1 truncate">
                  {documentTitle}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  ID: {documentId}
                </p>
              </div>
            </div>
          </div>

          {/* Recipient Type Selection */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-slate-700 block mb-2">
              Share With
            </label>
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => {
                  setRecipientType("users");
                  setGeneratedLink("");
                }}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${recipientType === "users"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Users
              </button>
              <button
                onClick={() => {
                  setRecipientType("department");
                  setGeneratedLink("");
                }}
                className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${recipientType === "department"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                Department
              </button>
            </div>
          </div>

          {/* Users Selection with Chips */}
          {recipientType === "users" && (
            <div className="space-y-2">
              <MultiSelect
                label="Select Users"
                value={selectedUsers}
                onChange={(values) => {
                  setSelectedUsers(values);
                  setGeneratedLink("");
                }}
                options={MOCK_USERS}
                placeholder="Search and select users..."
                searchPlaceholder="Search users..."
                enableSearch={true}
                maxVisibleTags={3}
              />
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                Search and select users to share this document. You can select
                one or multiple users.
              </p>
            </div>
          )}

          {/* Department Selection with Chips */}
          {recipientType === "department" && (
            <div className="space-y-2">
              <MultiSelect
                label="Select Departments"
                value={selectedDepartments}
                onChange={(values) => {
                  setSelectedDepartments(values);
                  setGeneratedLink("");
                }}
                options={MOCK_DEPARTMENTS}
                placeholder="Search and select departments..."
                searchPlaceholder="Search departments..."
                enableSearch={true}
                maxVisibleTags={3}
              />
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                Search and select departments to share this document. You can
                select one or multiple departments.
              </p>
            </div>
          )}

          {/* Expiry Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700">
              Link Expiry Date (Optional)
            </label>
            <DateTimePicker
              value={expiryDate}
              onChange={setExpiryDate}
              placeholder="Select expiry date for the link..."
            />
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              Leave empty for permanent access or set an expiry date
            </p>
          </div>

          {/* Generate Link Button */}
          {!generatedLink && (
            <Button
              onClick={handleGenerateLink}
              variant="outline"
              size="sm"
              className="w-full"
              disabled={
                (recipientType === "users" && selectedUsers.length === 0) ||
                (recipientType === "department" &&
                  selectedDepartments.length === 0)
              }
            >
              <Link2 className="h-4 w-4 mr-2" />
              Generate Shareable Link
            </Button>
          )}

          {/* Generated Link Display */}
          {generatedLink && (
            <div className="space-y-3 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-emerald-900">
                  Generated Link
                </label>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <Check className="h-3 w-3" />
                  Ready to Share
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="flex-1 h-9 px-3 bg-white border border-emerald-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <Button
                  onClick={handleCopyLink}
                  variant={isCopied ? "default" : "outline"}
                  size="sm"
                  className={
                    isCopied
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  }
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-1.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              {expiryDate && (
                <p className="text-xs text-emerald-700">
                  Link expires on:{" "}
                  <span className="font-medium">
                    {new Date(expiryDate).toLocaleString()}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex-shrink-0">
          <Button onClick={handleClose} variant="outline" size="sm">
            Cancel
          </Button>
          <Button
            onClick={handleSendLink}
            variant="default"
            size="sm"
            disabled={!generatedLink}
          >
            Send via Email
          </Button>
        </div>
      </div>

      {/* E-Signature Modal */}
      <ESignatureModal
        isOpen={isesignModalOpen}
        onClose={() => setIsesignModalOpen(false)}
        onConfirm={handleESignSuccess}
        actionTitle="Send Shareable Link"
      />
    </>,
    document.body,
  );
};



