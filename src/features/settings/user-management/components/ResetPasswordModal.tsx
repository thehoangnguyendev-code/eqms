import React from "react";
import { Info, Copy } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { FormModal } from "@/components/ui/modal/FormModal";
import { useToast } from "@/components/ui/toast";
import { IconRefresh } from "@tabler/icons-react";

interface ResetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    password: string;
    onRegeneratePassword: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
    isOpen,
    onClose,
    userName,
    password,
    onRegeneratePassword,
}) => {
    const { showToast } = useToast();


    const handleCopyPassword = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(password);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = password;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                textArea.remove();
                if (!successful) {
                    throw new Error('Fallback copy failed');
                }
            }

            showToast({
                type: "success",
                title: "Copied!",
                message: "Password copied to clipboard",
            });
        } catch (err) {
            console.error('Failed to copy password:', err);
            showToast({
                type: "error",
                title: "Copy Failed",
                message: "Failed to copy password",
            });
        }
    };

    const handleConfirmReset = () => {
        // TODO: Call API to reset password
        showToast({
            type: "success",
            title: "Password Reset!",
            message: `Password has been reset for ${userName}`,
        });
        onClose();
    };

    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirmReset}
            title="Reset Password"
            description={`New password generated for ${userName}`}
            confirmText="Confirm Reset"
            cancelText="Cancel"
            size="md"
        >
            <div className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <div className="text-sm text-amber-800">
                            <p className="font-medium mb-1">Important: Share this password securely</p>
                            <p>The user must change this temporary password on their next login.</p>
                        </div>
                    </div>
                </div>

                {/* New Password */}
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-2">
                        New Password
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={password}
                            readOnly
                            className="flex-1 h-9 px-4 border border-slate-200 rounded-lg text-sm bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 cursor-default"
                        />
                        <Button
                            onClick={onRegeneratePassword}
                            variant="outline"
                            size="icon-sm"
                            className="flex items-center justify-center h-10 w-11 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-600 transition-all duration-200"
                            title="Regenerate Password"
                        >
                            <IconRefresh className="h-4 w-4" />
                        </Button>
                        <Button
                            onClick={handleCopyPassword}
                            variant="outline"
                            size="icon-sm"
                            className="flex items-center justify-center h-10 w-11 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all duration-200"
                            title="Copy Password"
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">Click refresh icon to generate a new password</p>
                </div>
            </div>
        </FormModal>
    );
};
