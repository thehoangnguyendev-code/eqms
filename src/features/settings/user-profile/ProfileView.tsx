import React, { useState } from 'react';
import { User, KeyRound, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button/Button';
import { cn } from '@/components/ui/utils';
import { useToast } from '@/components/ui/toast';
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { AccountInfoTab } from "./AccountInfoTab";
import { PasswordTab } from "./PasswordTab";

interface ProfileViewProps {
    onBack?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onBack }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('account');
    const { showToast } = useToast();
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [hasAvatarChanged, setHasAvatarChanged] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    // Password state
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        new: false,
        confirm: false,
    });
    const [passwordErrors, setPasswordErrors] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [logoutAllSessions, setLogoutAllSessions] = useState(true);

    // Mock user data
    const originalFormData = {
        fullName: 'admin hệ thống 1',
        username: 'adminhethong',
        employeeCode: 'EMP-2025-001',
        jobTitle: 'Quality Assurance Manager',
        department: 'Quality Assurance',
        systemRole: 'Admin',
        nationality: 'Việt Nam',
        userGroup: 'Admin',
        email: 'uyenntt.0703@gmail.com',
        phone: '0911263575',
    };

    const [formData, setFormData] = useState(originalFormData);

    // Editing state for contact fields
    const [editingFields, setEditingFields] = useState({
        email: false,
        phone: false,
    });

    // Check if there are any changes (email, phone, password, or avatar)
    const hasChanges =
        formData.email !== originalFormData.email ||
        formData.phone !== originalFormData.phone ||
        passwordData.newPassword !== '' ||
        passwordData.confirmPassword !== '' ||
        hasAvatarChanged ||
        editingFields.email ||
        editingFields.phone;

    // Permissions state
    const [permissions] = useState({
        printControlledCopy: true,
        viewAuditTrail: true,
        createTrainingTest: true,
        manageUsers: true,
        approveDocuments: false,
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAvatarChange = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
            setHasAvatarChanged(true);
        };
        reader.readAsDataURL(file);
    };

    const handleToggleEdit = (field: 'email' | 'phone') => {
        setEditingFields(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handlePasswordChange = (field: 'newPassword' | 'confirmPassword', value: string) => {
        setPasswordData(prev => ({ ...prev, [field]: value }));
        setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    };

    const togglePasswordVisibility = (field: 'new' | 'confirm') => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const validatePassword = (password: string) => {
        const requirements = {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
        return requirements;
    };

    const handleSubmit = () => {
        let hasError = false;
        const newErrors = {
            newPassword: '',
            confirmPassword: '',
        };

        // If user is changing password, validate it
        if (passwordData.newPassword || passwordData.confirmPassword) {
            if (!passwordData.newPassword) {
                newErrors.newPassword = 'New password is required';
                hasError = true;
            } else {
                const requirements = validatePassword(passwordData.newPassword);
                if (!Object.values(requirements).every(Boolean)) {
                    newErrors.newPassword = 'Password does not meet all requirements';
                    hasError = true;
                }
            }

            if (!passwordData.confirmPassword) {
                newErrors.confirmPassword = 'Please confirm your new password';
                hasError = true;
            } else if (passwordData.newPassword !== passwordData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
                hasError = true;
            }

            setPasswordErrors(newErrors);
        }

        if (!hasError) {
            if (hasAvatarChanged) {
            }
            showToast({ type: 'success', message: 'Changes saved successfully.' });
            if (passwordData.newPassword) {
                setPasswordData({
                    newPassword: '',
                    confirmPassword: '',
                });
            }
            setHasAvatarChanged(false);
            setEditingFields({ email: false, phone: false });
        }
    };

    const handleCancel = () => {
        // Reset form data to original
        setFormData(originalFormData);
        // Reset editing states
        setEditingFields({ email: false, phone: false });
        // Reset password fields
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setPasswordErrors({ newPassword: '', confirmPassword: '' });
        // Reset avatar
        setAvatarPreview('');
        setHasAvatarChanged(false);
    };

    const handleBack = () => {
        setIsNavigating(true);
        setTimeout(() => {
            if (onBack) {
                onBack();
            } else {
                navigate(-1);
            }
            setIsNavigating(false);
        }, 600);
    };

    return (
        <div className="space-y-6 w-full flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">My Profile</h1>
                </div>
                <Button onClick={handleBack} variant="outline-emerald" size="sm" className="gap-2 whitespace-nowrap">
                    Back
                </Button>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Tab Navigation */}
                <div className="border-b border-slate-200 bg-slate-50/50">
                    <div className="flex">
                        <button
                            className={cn(
                                "flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors relative flex items-center justify-center sm:justify-start gap-2 border-b-2 border-r border-slate-200",
                                activeTab === 'account'
                                    ? "text-emerald-600 border-b-emerald-600 bg-white"
                                    : "text-slate-600 border-b-transparent hover:text-slate-900 hover:bg-slate-50"
                            )}
                            onClick={() => setActiveTab('account')}
                        >
                            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">Account</span>
                            <span className="xs:hidden">Account</span>
                        </button>
                        <button
                            className={cn(
                                "flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors relative flex items-center justify-center sm:justify-start gap-2 border-b-2",
                                activeTab === 'password'
                                    ? "text-emerald-600 border-b-emerald-600 bg-white"
                                    : "text-slate-600 border-b-transparent hover:text-slate-900 hover:bg-slate-50"
                            )}
                            onClick={() => setActiveTab('password')}
                        >
                            <KeyRound className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>Password</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-5">
                    {activeTab === 'account' && (
                        <AccountInfoTab
                            formData={formData}
                            permissions={permissions}
                            avatarPreview={avatarPreview}
                            editingFields={editingFields}
                            onInputChange={handleInputChange}
                            onAvatarChange={handleAvatarChange}
                            onToggleEdit={handleToggleEdit}
                        />
                    )}

                    {activeTab === 'password' && (
                        <PasswordTab
                            passwordData={passwordData}
                            showPasswords={showPasswords}
                            passwordErrors={passwordErrors}
                            logoutAllSessions={logoutAllSessions}
                            onPasswordChange={handlePasswordChange}
                            onTogglePasswordVisibility={togglePasswordVisibility}
                            onLogoutAllSessionsChange={setLogoutAllSessions}
                        />
                    )}
                </div>
                {/* Action Buttons Footer */}
                <div className="flex flex-row items-center justify-end gap-2 md:gap-3 px-5 py-4 bg-slate-50 border-t border-slate-200">
                    <Button
                        size='sm'
                        variant="outline-emerald"
                        onClick={handleCancel}
                        className="whitespace-nowrap"
                    >
                        Cancel
                    </Button>
                    <Button
                        size='sm'
                        onClick={handleSubmit}
                        variant="outline-emerald"
                        disabled={!hasChanges}
                        className="px-3 sm:px-4 md:px-5 py-2 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
            {isNavigating && <FullPageLoading text="Loading..." />}
        </div>
    );
};
