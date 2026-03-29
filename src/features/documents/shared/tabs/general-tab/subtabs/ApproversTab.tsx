import React, { useState, useEffect } from "react";
import { CheckCircle, Plus, Trash2, Search, User, X, ShieldCheck, Check } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button/Button";
import { MOCK_USERS } from "../../../mockData";

interface Approver {
    id: string;
    name: string;
    username?: string;
    role: string;
    email: string;
    department: string;
}

interface ApproversTabProps {
    onCountChange?: (count: number) => void;
    isModalOpen?: boolean;
    onModalClose?: () => void;
    approvers?: Approver[];
    onApproversChange?: (approvers: Approver[]) => void;
}

interface UserSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (user: typeof MOCK_USERS[0]) => void;
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedId, setSelectedId] = useState<string>("");

    useEffect(() => {
        if (isOpen) {
            setSearchTerm("");
            setSelectedId("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredUsers = MOCK_USERS.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleUser = (userId: string) => {
        setSelectedId(prev => prev === userId ? "" : userId);
    };

    const handleSave = () => {
        if (selectedId) {
            const selectedUser = MOCK_USERS.find(u => u.id === selectedId);
            if (selectedUser) {
                onSelect(selectedUser);
                onClose();
            }
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-900">Setup Approver</h3>
                    <Button 
                        onClick={onClose}
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-full"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, role, or department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-9 pl-9 pr-4 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400 transition-colors"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[290px] px-4 py-2">
                    {filteredUsers.length > 0 ? (
                        <div className="space-y-0 divide-y divide-slate-100">
                            {filteredUsers.map((user, index) => {
                                const isAlreadyAdded = false; // ApproversTab has single approver, so check if already selected
                                const isSelected = selectedId === user.id;
                                
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => !isAlreadyAdded && handleToggleUser(user.id)}
                                        disabled={isAlreadyAdded}
                                        className={`w-full flex items-center gap-3 py-1.5 transition-all group text-left ${
                                            isSelected 
                                                ? "bg-emerald-50/80" 
                                                : isAlreadyAdded
                                                    ? "bg-slate-50 opacity-60 cursor-not-allowed"
                                                    : "hover:bg-slate-50/80"
                                        }`}
                                    >
                                        <div className={`w-8 flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${
                                            isSelected ? "text-emerald-600" : "text-slate-400"
                                        }`}>
                                            {isSelected ? <Check className="h-4 w-4" /> : (index + 1)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-slate-900 truncate text-sm">
                                                {user.name}
                                                {isAlreadyAdded && <span className="ml-2 text-xs text-slate-500 font-normal">(Already Added)</span>}
                                            </div>
                                            <div className="text-xs text-slate-500 truncate">{user.username} | {user.role} • {user.department}</div>
                                        </div>
                                        {isSelected && (
                                            <div className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg shrink-0">
                                                Selected
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                                <User className="h-6 w-6 text-slate-300" />
                            </div>
                            <p className="text-sm font-medium text-slate-900">No users found matching "{searchTerm}"</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        size="sm"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!selectedId}
                        size="sm"
                    >
                        Update Approvers
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const ApproversTab: React.FC<ApproversTabProps> = ({ 
    onCountChange,
    isModalOpen: externalModalOpen,
    onModalClose: externalModalClose,
    approvers: externalApprovers,
    onApproversChange: externalOnApproversChange,
}) => {
    const [internalApprovers, setInternalApprovers] = useState<Approver[]>([]);
    const [internalModalOpen, setInternalModalOpen] = useState(false);

    // Use external or internal state
    const approvers = externalApprovers ?? internalApprovers;
    const setApprovers = (newApprovers: Approver[]) => {
        if (externalOnApproversChange) {
            externalOnApproversChange(newApprovers);
        } else {
            setInternalApprovers(newApprovers);
        }
    };

    // Use external modal state if provided, otherwise use internal
    const isModalOpen = externalModalOpen !== undefined ? externalModalOpen : internalModalOpen;
    const handleModalClose = () => {
        if (externalModalClose) {
            externalModalClose();
        } else {
            setInternalModalOpen(false);
        }
    };
    const handleModalOpen = () => {
        if (externalModalClose) {
            // When using external control, we can't directly open the modal
            // The parent component should handle opening via button click
        } else {
            setInternalModalOpen(true);
        }
    };

    useEffect(() => {
        onCountChange?.(approvers.length);
    }, [approvers.length, onCountChange]);

    const handleSelectUser = (user: typeof MOCK_USERS[0]) => {
        const newApprover: Approver = {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
            email: user.email,
            department: user.department
        };
        // Since only 1 approver is allowed, we replace the existing one or add if empty
        setApprovers([newApprover]);
    };

    const removeApprover = () => {
        setApprovers([]);
    };

    return (
        <div className="space-y-4">
            {approvers.length > 0 ? (
                <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-10 sm:w-16">
                                        No.
                                    </th>
                                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                        User
                                    </th>
                                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                                        Email
                                    </th>
                                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                                        Position
                                    </th>
                                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                                        Department
                                    </th>
                                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                        Role
                                    </th>
                                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-16 sm:w-24">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {approvers.map((approver, index) => (
                                    <tr key={approver.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-500 whitespace-nowrap">
                                            {index + 1}
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <div>
                                                    <div className="font-medium text-slate-900">{approver.name}</div>
                                                    <div className="text-[10px] sm:text-xs text-slate-500">{approver.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap hidden md:table-cell">
                                            {approver.email}
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap hidden lg:table-cell">
                                            {approver.role}
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap hidden md:table-cell">
                                            {approver.department}
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                            <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                                Approver
                                            </span>
                                        </td>
                                        <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-center whitespace-nowrap">
                                            <Button
                                                onClick={removeApprover}
                                                variant="ghost"
                                                size="icon-sm"
                                                className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                title="Remove approver"
                                            >
                                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div 
                    onClick={handleModalOpen}
                    className="group relative flex flex-col items-center justify-center py-12 px-4 bg-slate-50 hover:bg-slate-50/80 border-2 border-dashed border-slate-200 hover:border-emerald-500/50 rounded-xl transition-all cursor-pointer"
                >
                    <div className="h-12 w-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                        <User className="h-6 w-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">No Approver Selected</p>
                    <p className="text-xs text-slate-500 mt-1 text-center max-w-xs">
                        This document requires a final approver. Click here to select a user from the list.
                    </p>
                </div>
            )}

            <UserSelectionModal 
                isOpen={isModalOpen} 
                onClose={handleModalClose}
                onSelect={handleSelectUser}
            />
        </div>
    );
};
