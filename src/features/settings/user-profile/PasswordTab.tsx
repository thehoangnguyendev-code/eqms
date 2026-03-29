import React, { useState } from 'react';
import { AlertModal } from '@/components/ui/modal/AlertModal';
import { Eye, EyeOff, Check, X, AlertTriangle, Calendar, Wand2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { Button } from '@/components/ui/button/Button';
import { cn } from '@/components/ui/utils';
import { LAST_PASSWORD_CHANGE, PASSWORD_EXPIRY_DATE, ACTIVE_SESSIONS } from './mockData';

interface PasswordTabProps {
    passwordData: {
        newPassword: string;
        confirmPassword: string;
    };
    showPasswords: {
        new: boolean;
        confirm: boolean;
    };
    passwordErrors: {
        newPassword: string;
        confirmPassword: string;
    };
    logoutAllSessions: boolean;
    onPasswordChange: (field: 'newPassword' | 'confirmPassword', value: string) => void;
    onTogglePasswordVisibility: (field: 'new' | 'confirm') => void;
    onLogoutAllSessionsChange: (checked: boolean) => void;
}

// Mock data for last password change and active sessions is in ./mockData.ts

export const PasswordTab: React.FC<PasswordTabProps> = ({
    passwordData,
    showPasswords,
    passwordErrors,
    logoutAllSessions,
    onPasswordChange,
    onTogglePasswordVisibility,
    onLogoutAllSessionsChange,
}) => {
    const validatePassword = (password: string) => {
        return {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
    };

    const passwordRequirements = passwordData.newPassword ? validatePassword(passwordData.newPassword) : null;

    // Calculate days until password expiry
    const calculateDaysUntilExpiry = () => {
        const today = new Date();
        const expiry = new Date(PASSWORD_EXPIRY_DATE);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysUntilExpiry = calculateDaysUntilExpiry();
    const showExpiryWarning = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

    // Password generator function
    const generatePassword = () => {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const special = '!@#$%^&*()';
        
        const allChars = lowercase + uppercase + numbers + special;
        let password = '';
        
        // Ensure at least one character from each category
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += special[Math.floor(Math.random() * special.length)];
        
        // Fill the rest randomly (total 12 characters)
        for (let i = 4; i < 12; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        
        // Shuffle the password
        password = password.split('').sort(() => Math.random() - 0.5).join('');
        
        onPasswordChange('newPassword', password);
        onPasswordChange('confirmPassword', password);
    };

    // State for session logout confirm modal
    const [logoutModal, setLogoutModal] = useState<{ open: boolean; sessionId: number | null }>({ open: false, sessionId: null });

    const handleLogoutSession = (sessionId: number) => {
        setLogoutModal({ open: true, sessionId });
    };

    const handleConfirmLogout = () => {
        if (logoutModal.sessionId !== null) {
            // TODO: Call API to logout session here
        }
        setLogoutModal({ open: false, sessionId: null });
    };

    return (
        <div className="space-y-6">
            {/* Logout Session Confirm Modal */}
            <AlertModal
                isOpen={logoutModal.open}
                onClose={() => setLogoutModal({ open: false, sessionId: null })}
                onConfirm={handleConfirmLogout}
                type="confirm"
                title="Log out this session?"
                description="Are you sure you want to log out this session? This device will be signed out immediately."
                confirmText="Log Out"
                cancelText="Cancel"
                showCancel
            />
            {/* Password Expiry Warning */}
            {showExpiryWarning && (
                <div className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 sm:gap-3">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-amber-900">Password Expiration Warning</h4>
                        <p className="text-xs sm:text-sm text-amber-700 mt-1">
                            Your password will expire in <strong>{daysUntilExpiry} days</strong> (on {PASSWORD_EXPIRY_DATE}). 
                            Please change your password soon to avoid account access issues.
                        </p>
                    </div>
                </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Password Management */}
                <div className="space-y-6">
                    {/* Last Password Change Info */}
                    <div className="p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 sm:gap-3">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-medium text-slate-900">Last Password Change</h4>
                            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 truncate">{LAST_PASSWORD_CHANGE}</p>
                        </div>
                    </div>

                    {/* Change Password Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Change Password</h3>
                        <div className="space-y-4">
                            {/* New Password */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                                    New Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        value={passwordData.newPassword}
                                        onChange={(e) => onPasswordChange('newPassword', e.target.value)}
                                        className={cn(
                                            "w-full h-9 px-3.5 pr-24 text-sm border rounded-lg bg-white focus:outline-none focus:ring-1 transition-all",
                                            passwordErrors.newPassword
                                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                                : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                                        )}
                                        placeholder="Enter new password"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={generatePassword}
                                            className="text-emerald-600 hover:text-emerald-700 p-1"
                                            title="Generate strong password"
                                        >
                                            <Wand2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onTogglePasswordVisibility('new')}
                                            className="text-slate-400 hover:text-slate-600"
                                        >
                                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                {passwordErrors.newPassword && (
                                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                        <X className="h-3 w-3" />
                                        {passwordErrors.newPassword}
                                    </p>
                                )}
                            </div>

                            {/* Confirm New Password */}
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                                    Confirm New Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => onPasswordChange('confirmPassword', e.target.value)}
                                        className={cn(
                                            "w-full h-9 px-3.5 pr-10 text-sm border rounded-lg bg-white focus:outline-none focus:ring-1 transition-all",
                                            passwordErrors.confirmPassword
                                                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                                                : "border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
                                        )}
                                        placeholder="Confirm new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => onTogglePasswordVisibility('confirm')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && (
                                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                        <X className="h-3 w-3" />
                                        {passwordErrors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            {/* Password Strength */}
                            {passwordData.newPassword && (
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <p className="text-xs sm:text-sm font-medium text-slate-700 mb-2">Password Strength:</p>
                                    <div className="space-y-1.5">
                                        {[
                                            { key: 'minLength', label: 'At least 8 characters' },
                                            { key: 'hasUpperCase', label: 'One uppercase letter (A-Z)' },
                                            { key: 'hasLowerCase', label: 'One lowercase letter (a-z)' },
                                            { key: 'hasNumber', label: 'One number (0-9)' },
                                            { key: 'hasSpecialChar', label: 'One special character (!@#$%^&*)' },
                                        ].map((req) => (
                                            <div
                                                key={req.key}
                                                className={cn(
                                                    "flex items-center gap-2 text-xs",
                                                    passwordRequirements?.[req.key as keyof typeof passwordRequirements] ? "text-emerald-600" : "text-slate-500"
                                                )}
                                            >
                                                {passwordRequirements?.[req.key as keyof typeof passwordRequirements] ? (
                                                    <Check className="h-3.5 w-3.5" />
                                                ) : (
                                                    <X className="h-3.5 w-3.5" />
                                                )}
                                                <span>{req.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Password Options Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Password Options</h3>
                        <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <Checkbox
                                id="logoutAllSessions"
                                checked={logoutAllSessions}
                                onChange={onLogoutAllSessionsChange}
                            />
                            <div className="flex-1">
                                <label htmlFor="logoutAllSessions" className="text-xs sm:text-sm font-medium text-slate-700 cursor-pointer block">
                                    Log out from all sessions after password change
                                </label>
                                <p className="text-xs text-slate-600 mt-0.5">
                                    When enabled, you will be logged out from all devices and browsers after successfully changing your password.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Active Sessions */}
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Active Sessions</h3>
                    <div className="space-y-3">
                        {ACTIVE_SESSIONS.map((session) => (
                            <div key={session.id} className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex items-start gap-2 sm:gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                                            <h4 className="text-xs sm:text-sm font-semibold text-slate-900">{session.device}</h4>
                                            {session.current && (
                                                <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-medium rounded-full whitespace-nowrap">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] sm:text-xs text-slate-600 truncate">
                                            {session.location} • IP: {session.ip}
                                        </p>
                                        <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                                            Last active: {session.lastActive}
                                        </p>
                                    </div>
                                    {!session.current && (
                                        <Button
                                            size="xs"
                                            variant="outline"
                                            onClick={() => handleLogoutSession(session.id)}
                                            className="text-red-600 border-red-300 hover:bg-red-50 text-[11px] sm:text-xs px-2 sm:px-3 whitespace-nowrap flex-shrink-0"
                                        >
                                            Log Out
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
