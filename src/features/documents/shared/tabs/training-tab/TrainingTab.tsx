import React, { useState, useMemo } from "react";
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { Select } from '@/components/ui/select/Select';
import { Input, Textarea } from '@/components/ui/form/ResponsiveForm';
import { cn } from '@/components/ui/utils';
import { MOCK_COURSE_ASSIGNMENTS, MOCK_EMPLOYEES } from '@/features/training/compliance-tracking/mockData';
import { EmployeeRow } from "@/features/training/compliance-tracking/types";

const getInitials = (name: string) =>
    name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase();

interface TrainingConfig {
    isRequired: boolean;
    trainingPeriodDays: number;
    distributionList: string[];
    courseId: string;
    skipReason: string;
    skipReasonDetail: string;
}

interface TrainingTabProps {
    isReadOnly?: boolean;
    data?: Partial<TrainingConfig>;
    validationError?: {
        skipReason?: boolean;
        skipReasonDetail?: boolean;
    };
}

// Predefined reasons for skipping training
const SKIP_REASONS = [
    {
        label: "Correction of typos/formatting only",
        value: "typo_formatting"
    },
    {
        label: "Administrative update (No change in procedure)",
        value: "admin_update"
    },
    {
        label: "Urgent issuance for safety/quality incident",
        value: "urgent_safety"
    },
    {
        label: "External regulation update (No impact on operations)",
        value: "regulation_update"
    },
    {
        label: "Others (Specify reason)",
        value: "others"
    },
];

export const TrainingTab: React.FC<TrainingTabProps> = ({
    isReadOnly = false,
    data,
    validationError
}) => {
    const [config, setConfig] = useState<TrainingConfig>({
        isRequired: data?.isRequired ?? false,
        trainingPeriodDays: data?.trainingPeriodDays ?? 7,
        distributionList: data?.distributionList ?? [],
        courseId: data?.courseId ?? "",
        skipReason: data?.skipReason ?? "",
        skipReasonDetail: data?.skipReasonDetail ?? ""
    });

    // Mock courses - in production, this would come from API
    const availableCourses = [
        { label: "GMP Basic Training (course-1)", value: "course-1" },
        { label: "Safety & Environment Training (course-2)", value: "course-2" },
        { label: "HPLC Operation Advanced (course-3)", value: "course-3" },
        { label: "Cleanroom Behavior & Hygiene (course-4)", value: "course-4" },
        { label: "GMP Basic Principles (V2.0) (TRN-2026-001)", value: "TRN-2026-001" },
        { label: "Emergency Response Procedures (TRN-2026-003)", value: "TRN-2026-003" },
    ];

    const DIST_OPTIONS = [
        // Business Units
        { label: "Quality Unit (BU)", value: "Quality Unit" },
        { label: "Operation Unit (BU)", value: "Operation Unit" },
        { label: "Support Unit (BU)", value: "Support Unit" },
        // Departments
        { label: "Quality Assurance (QA)", value: "qa" },
        { label: "Quality Control (QC)", value: "qc" },
        { label: "Production", value: "production" },
        { label: "Research & Development (R&D)", value: "rnd" },
        { label: "Regulatory Affairs", value: "regulatory" },
        { label: "Warehouse", value: "warehouse" },
        { label: "Maintenance", value: "maintenance" },
        { label: "Engineering", value: "engineering" },
        { label: "HSE", value: "HSE" },
        { label: "Human Resources (HR)", value: "hr" },
        // Individuals (Sample)
        { label: "Dr. Anna Smith", value: "EMP-001" },
        { label: "James Carter", value: "EMP-002" },
        { label: "Maria Lopez", value: "EMP-003" },
    ];

    const handleCheckboxChange = (checked: boolean) => {
        setConfig({
            ...config,
            isRequired: checked,
            // Reset skip reason when enabling training
            skipReason: checked ? "" : config.skipReason,
            skipReasonDetail: checked ? "" : config.skipReasonDetail
        });
    };

    const handleCourseChange = (courseId: string) => {
        const autoDistList = MOCK_COURSE_ASSIGNMENTS[courseId] || [];
        setConfig({
            ...config,
            courseId: courseId,
            distributionList: autoDistList.length > 0 ? autoDistList : config.distributionList
        });
    };

    const handleSkipReasonChange = (value: string) => {
        setConfig({
            ...config,
            skipReason: value,
            // Clear detail if not "others"
            skipReasonDetail: value !== "others" ? "" : config.skipReasonDetail
        });
    };

    const resolvedEmployees = useMemo(() => {
        if (!config.distributionList.length) return [];

        const slugsToQuality = {
            'qa': 'Quality Assurance',
            'qc': 'Quality Control',
            'safety': 'HSE',
            'production': 'Production',
            'engineering': 'Engineering'
        };

        const list = new Set<string>(); // Set of IDs to avoid duplicates

        config.distributionList.forEach(input => {
            const val = input.toLowerCase();

            // 1. By ID
            if (val.startsWith('emp-')) {
                list.add(input);
            }
            // 2. By Business Unit
            else if (val.includes('unit')) {
                MOCK_EMPLOYEES.filter(e => e.businessUnit?.toLowerCase().includes(val))
                    .forEach(e => list.add(e.id));
            }
            // 3. By Department
            else {
                const targetDept = slugsToQuality[val as keyof typeof slugsToQuality] || input;
                MOCK_EMPLOYEES.filter(e => e.department.toLowerCase() === targetDept.toLowerCase())
                    .forEach(e => list.add(e.id));
            }
        });

        return MOCK_EMPLOYEES.filter(e => list.has(e.id));
    }, [config.distributionList]);

    return (
        <div className="space-y-4 lg:space-y-5">
            <div className="flex items-center justify-between font-semibold text-slate-900">
                <Checkbox
                    id="requires-training"
                    label="Requires Training?"
                    checked={config.isRequired}
                    onChange={handleCheckboxChange}
                    disabled={isReadOnly}
                />
            </div>

            {/* Training Required: Show course selection */}
            {config.isRequired && (
                <div className="space-y-4">
                    {/* Course Selection & Training Period */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Course Selection */}
                        <div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs sm:text-sm font-medium text-slate-700">
                                    Course Name/ID {!isReadOnly && <span className="text-red-500">*</span>}
                                </label>
                                <Select
                                    value={config.courseId}
                                    onChange={(value) => handleCourseChange(value as string)}
                                    options={availableCourses}
                                    placeholder="Select a training course..."
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>

                        {/* Training Period */}
                        <div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs sm:text-sm font-medium text-slate-700">
                                    Training Period (Days) {!isReadOnly && <span className="text-red-500">*</span>}
                                </label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={config.trainingPeriodDays}
                                    disabled={isReadOnly}
                                    onChange={(e) => setConfig({ ...config, trainingPeriodDays: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Distribution List as Card */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-sm font-semibold text-slate-700">Distribution List</label>
                            {resolvedEmployees.length > 0 && (
                                <span className="text-xs bg-emerald-100 text-emerald-700 font-medium px-2.5 py-1 rounded-full border border-emerald-200">
                                    {resolvedEmployees.length} employees
                                </span>
                            )}
                        </div>

                        <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
                            {resolvedEmployees.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-6 text-slate-400">
                                    <p className="text-xs md:text-sm">No assignees selected for this course</p>
                                </div>
                            ) : (
                                <div className="overflow-auto max-h-[265px]">
                                    <table className="w-full text-left relative">
                                        <thead className="bg-slate-50 sticky top-0 z-10 shadow-[inset_0_-1px_0_#e2e8f0]">
                                            <tr>
                                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-10 sm:w-16">
                                                    No.
                                                </th>
                                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                                    User
                                                </th>
                                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                                    Business Unit
                                                </th>
                                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                                    Department
                                                </th>
                                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                                    Position
                                                </th>
                                                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                                    Email
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 bg-white">
                                            {resolvedEmployees.map((e, index) => (
                                                <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="py-1.5 px-2 sm:py-2.5 sm:px-3 text-xs sm:text-sm text-slate-500 whitespace-nowrap">
                                                        {index + 1}
                                                    </td>
                                                    <td className="py-1.5 px-2 sm:py-2.5 sm:px-3 text-xs sm:text-sm whitespace-nowrap">
                                                        <div className="flex items-center gap-2 sm:gap-2.5">
                                                            <div>
                                                                <div className="font-medium text-slate-900 leading-tight">{e.name}</div>
                                                                <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{e.employeeCode}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-1.5 px-2 sm:py-2.5 sm:px-3 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                                                        {e.businessUnit || "Operation Unit"}
                                                    </td>
                                                    <td className="py-1.5 px-2 sm:py-2.5 sm:px-3 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                                                        {e.department}
                                                    </td>
                                                    <td className="py-1.5 px-2 sm:py-2.5 sm:px-3 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                                                        {e.jobTitle}
                                                    </td>
                                                    <td className="py-1.5 px-2 sm:py-2.5 sm:px-3 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                                                        {e.email}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 px-1">
                            Calculated dynamically based on course assignment rules.
                        </p>
                    </div>
                </div>
            )}

            {/* Training NOT Required: Show reason for skipping */}
            {!config.isRequired && (
                <div className="space-y-4">
                    {/* Reason Dropdown */}
                    <div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs sm:text-sm font-medium text-slate-700">
                                Reason for skipping training {!isReadOnly && <span className="text-red-500">*</span>}
                            </label>
                            <div className={cn(isReadOnly && "pointer-events-none")}>
                                <Select
                                    value={config.skipReason}
                                    onChange={handleSkipReasonChange}
                                    options={SKIP_REASONS}
                                    placeholder="Select a reason..."
                                />
                            </div>
                        </div>
                        {validationError?.skipReason && !config.skipReason && (
                            <p className="text-xs text-red-600 mt-1.5 font-medium">
                                Please select a reason for skipping training
                            </p>
                        )}
                    </div>

                    {/* Detail textarea when "Others" is selected */}
                    {config.skipReason === "others" && (
                        <div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs sm:text-sm font-medium text-slate-700">
                                    Specify reason {!isReadOnly && <span className="text-red-500">*</span>}
                                </label>
                                {isReadOnly ? (
                                    <p className={cn(
                                        "text-sm px-3 py-2.5 bg-slate-50 border rounded-lg leading-relaxed whitespace-pre-wrap min-h-[4rem]",
                                        validationError?.skipReasonDetail && !config.skipReasonDetail
                                            ? "border-red-300 bg-red-50"
                                            : "border-slate-200"
                                    )}>
                                        {config.skipReasonDetail || <span className="text-slate-400">—</span>}
                                    </p>
                                ) : (
                                    <Textarea
                                        value={config.skipReasonDetail}
                                        onChange={(e) => setConfig({ ...config, skipReasonDetail: e.target.value })}
                                        rows={3}
                                        placeholder="Please provide detailed reason for skipping training..."
                                        className={cn(
                                            validationError?.skipReasonDetail && !config.skipReasonDetail.trim() &&
                                            "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                                        )}
                                    />
                                )}
                            </div>
                            {validationError?.skipReasonDetail && !config.skipReasonDetail.trim() && (
                                <p className="text-xs text-red-600 mt-1.5 font-medium">
                                    Please specify the reason in detail
                                </p>
                            )}
                        </div>
                    )}

                    {!isReadOnly && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs text-amber-800 leading-relaxed">
                                <strong>Note:</strong> If training is not required, you must provide a valid reason. This will be recorded in the document history for audit purposes.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Validation helper function for parent component
export const validateTrainingTab = (config: TrainingConfig): { isValid: boolean; errors: { skipReason?: boolean; skipReasonDetail?: boolean } } => {
    const errors: { skipReason?: boolean; skipReasonDetail?: boolean } = {};

    if (!config.isRequired) {
        // If training not required, must have skip reason
        if (!config.skipReason) {
            errors.skipReason = true;
        }
        // If skip reason is "others", must have detail
        if (config.skipReason === "others" && !config.skipReasonDetail.trim()) {
            errors.skipReasonDetail = true;
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Export types
export type { TrainingConfig };
