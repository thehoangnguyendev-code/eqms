import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { FormModal } from "@/components/ui/modal/FormModal";
import { cn } from "@/components/ui/utils";
import { useToast } from "@/components/ui/toast";
import { IconRefresh } from "@tabler/icons-react";

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeCode: string;
  username: string;
  password: string;
  onRegeneratePassword: () => void;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({
  isOpen,
  onClose,
  employeeCode,
  username,
  password,
  onRegeneratePassword,
}) => {
  const { showToast } = useToast();

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Created Successfully"
      confirmText="Done"
      showCancel={false}
      size="md"
    >
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">
                Important: Save these credentials
              </p>
              <p>
                The password cannot be retrieved later. Please share these
                credentials with the user securely.
              </p>
            </div>
          </div>
        </div>

        {/* Employee Code */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
            Employee Code
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={employeeCode}
              readOnly
              className="flex-1 h-9 px-4 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
            />
            <CopyButton
              text={employeeCode}
              label="Employee Code"
              showToast={showToast}
            />
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
            Username
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={username}
              readOnly
              className="flex-1 h-9 px-4 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
            />
            <CopyButton
              text={username}
              label="Username"
              showToast={showToast}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
            Password
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={password}
              readOnly
              className="flex-1 h-9 px-4 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
            />
            <button
              onClick={onRegeneratePassword}
              title="Regenerate Password"
              className="flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-600 transition-all duration-200 flex-shrink-0"
            >
              <IconRefresh className="h-4 w-4" />
            </button>
            <CopyButton
              text={password}
              label="Password"
              showToast={showToast}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            Click refresh icon to generate a new password
          </p>
        </div>

        {/* Copy All Button */}
        <Button
          onClick={async () => {
            const credentials = `Employee Code: ${employeeCode}\nUsername: ${username}\nPassword: ${password}`;
            try {
              if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(credentials);
              } else {
                const textArea = document.createElement("textarea");
                textArea.value = credentials;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand("copy");
                textArea.remove();
                if (!successful) {
                  throw new Error("Fallback copy failed");
                }
              }

              showToast({
                type: "success",
                title: "Copied!",
                message: "All credentials copied to clipboard",
              });
            } catch (err) {
              console.error("Failed to copy credentials:", err);
              showToast({
                type: "error",
                title: "Copy Failed",
                message: "Failed to copy credentials to clipboard",
              });
            }
          }}
          className="w-full flex items-center justify-center gap-2 h-9 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-medium"
        >
          <Copy className="h-4 w-4" />
          Copy All Credentials
        </Button>
      </div>
    </FormModal>
  );
};

// Copy Button Component
const CopyButton: React.FC<{
  text: string;
  label: string;
  showToast: ReturnType<typeof useToast>["showToast"];
}> = ({ text, label, showToast }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        textArea.remove();
        if (!successful) {
          throw new Error("Fallback copy failed");
        }
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast({
        type: "success",
        title: "Copied!",
        message: `${label} copied to clipboard`,
      });
    } catch (err) {
      console.error("Failed to copy text:", err);
      showToast({
        type: "error",
        title: "Copy Failed",
        message: `Failed to copy ${label.toLowerCase()}`,
      });
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center justify-center h-9 w-9 rounded-lg border transition-all duration-200 flex-shrink-0",
        copied
          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
      )}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </button>
  );
};
