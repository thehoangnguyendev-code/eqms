import React, { useState, useEffect } from "react";
import { Users, Plus, Trash2, Search, User, X, ShieldCheck, Check, GripVertical, ArrowRight } from "lucide-react";
import { createPortal } from "react-dom";
import { IconListNumbers } from "@tabler/icons-react";
import { Button } from "@/components/ui/button/Button";
import { cn } from "@/components/ui/utils";
import { MOCK_USERS } from "../../../mockData";

interface Reviewer {
    id: string;
    name: string;
    username?: string;
    role: string;
    email: string;
    department: string;
    order: number;
}

interface ReviewersTabProps {
    onCountChange?: (count: number) => void;
    reviewers: Reviewer[];
    onReviewersChange: (reviewers: Reviewer[]) => void;
    reviewFlowType: ReviewFlowType;
    onReviewFlowTypeChange: (type: ReviewFlowType) => void;
    isModalOpen?: boolean;
    onModalClose?: () => void;
}

type ReviewFlowType = 'sequential' | 'parallel';

interface UserSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (users: typeof MOCK_USERS) => void;
    existingIds: string[];
}

const UserSelectionModal: React.FC<UserSelectionModalProps> = ({ isOpen, onClose, onConfirm, existingIds }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm("");
            setSelectedIds([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredUsers = MOCK_USERS.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleUser = (userId: string) => {
        setSelectedIds(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSave = () => {
        const selectedUsers = MOCK_USERS.filter(u => selectedIds.includes(u.id));
        onConfirm(selectedUsers);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-900">Setup Reviewers</h3>
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
                                const isAlreadyAdded = existingIds.includes(user.id);
                                const isSelected = selectedIds.includes(user.id);
                                
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
                        disabled={selectedIds.length === 0}
                        size="sm"
                    >
                        Update Reviewers ({selectedIds.length})
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const ReviewersTab: React.FC<ReviewersTabProps> = ({ 
    onCountChange,
    reviewers,
    onReviewersChange,
    reviewFlowType,
    onReviewFlowTypeChange,
    isModalOpen: externalModalOpen,
    onModalClose: externalModalClose
}) => {
    const [internalModalOpen, setInternalModalOpen] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
        onCountChange?.(reviewers.length);
    }, [reviewers.length, onCountChange]);

    const handleAddReviewers = (users: typeof MOCK_USERS) => {
        const maxOrder = reviewers.length > 0 ? Math.max(...reviewers.map(r => r.order)) : 0;
        const newReviewers = users.map((user, idx) => ({
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
            email: user.email,
            department: user.department,
            order: maxOrder + idx + 1
        }));
        onReviewersChange([...reviewers, ...newReviewers]);
    };

    const removeReviewer = (id: string) => {
        const updatedReviewers = reviewers.filter(r => r.id !== id);
        // Reorder after removal
        const reordered = updatedReviewers.map((r, idx) => ({ ...r, order: idx + 1 }));
        onReviewersChange(reordered);
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.4';
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
        setDraggedIndex(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        const reordered = [...reviewers];
        const [draggedItem] = reordered.splice(draggedIndex, 1);
        reordered.splice(dropIndex, 0, draggedItem);

        // Update order numbers
        const updatedReviewers = reordered.map((r, idx) => ({ ...r, order: idx + 1 }));
        onReviewersChange(updatedReviewers);
    };

    return (
        <div className="space-y-4">
            {reviewers.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="space-y-2">
                        <label className="text-xs sm:text-sm font-medium text-slate-700 block">
                            Review Flow Type:
                        </label>
                        <div className="py-2 flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-slate-500" />
                                <span className={cn(
                                    "text-sm font-medium transition-colors",
                                    reviewFlowType === "parallel" ? "text-slate-900" : "text-slate-400"
                                )}>
                                    Parallel
                                </span>
                            </div>
                            <button
                                onClick={() => onReviewFlowTypeChange(reviewFlowType === "parallel" ? "sequential" : "parallel")}
                                className={cn(
                                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                                    reviewFlowType === "sequential" ? "bg-emerald-500" : "bg-slate-300"
                                )}
                                role="switch"
                                aria-checked={reviewFlowType === "sequential"}
                                aria-label="Toggle review flow type"
                            >
                                <span
                                    className={cn(
                                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm",
                                        reviewFlowType === "sequential" ? "translate-x-6" : "translate-x-1"
                                    )}
                                />
                            </button>
                            <div className="flex items-center gap-2">
                                <IconListNumbers className="h-4 w-4 text-slate-500" />
                                <span className={cn(
                                    "text-sm font-medium transition-colors",
                                    reviewFlowType === "sequential" ? "text-emerald-700" : "text-slate-400"
                                )}>
                                    Sequential
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            {reviewFlowType === "parallel" 
                                ? "All reviewers receive notification at the same time" 
                                : "Reviewers notified one after another. Drag to reorder."}
                        </p>
                    </div>
                </div>
            )}

            {reviewers.length > 0 ? (
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
                                        Sequence
                                    </th>
                                    <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-16 sm:w-24">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {reviewers
                                    .sort((a, b) => a.order - b.order)
                                    .map((reviewer, index) => (
                                        <tr
                                            key={reviewer.id}
                                            draggable={reviewFlowType === 'sequential'}
                                            onDragStart={(e) => reviewFlowType === 'sequential' && handleDragStart(e, index)}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={(e) => reviewFlowType === 'sequential' && handleDragOver(e)}
                                            onDrop={(e) => reviewFlowType === 'sequential' && handleDrop(e, index)}
                                            className={`hover:bg-slate-50/80 transition-colors ${
                                                reviewFlowType === 'sequential' ? 'cursor-move' : ''
                                            } ${draggedIndex === index ? 'opacity-40' : ''}`}
                                        >
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-500 whitespace-nowrap">
                                                {index + 1}
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <div>
                                                        <div className="font-medium text-slate-900">{reviewer.name}</div>
                                                        <div className="text-[10px] sm:text-xs text-slate-500">{reviewer.username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap hidden md:table-cell">
                                                {reviewer.email}
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap hidden lg:table-cell">
                                                {reviewer.role}
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap hidden md:table-cell">
                                                {reviewer.department}
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                                                {reviewFlowType === 'sequential' ? (
                                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                                        <GripVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                                                        <span className="inline-flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-bold">
                                                            {reviewer.order}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-center whitespace-nowrap">
                                                <Button
                                                    onClick={() => removeReviewer(reviewer.id)}
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                    title="Remove reviewer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
                        <Users className="h-6 w-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">No Reviewers Selected</p>
                    <p className="text-xs text-slate-500 mt-1 text-center max-w-xs">
                        Add reviewers who will review this document. Click here to select users.
                    </p>
                </div>
            )}

            <UserSelectionModal 
                isOpen={isModalOpen} 
                onClose={handleModalClose}
                onConfirm={handleAddReviewers}
                existingIds={reviewers.map(r => r.id)}
            />
        </div>
    );
};
