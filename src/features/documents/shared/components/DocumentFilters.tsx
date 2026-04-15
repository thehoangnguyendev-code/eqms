import React from 'react';
import { Search, X } from 'lucide-react';
import { Select } from '@/components/ui/select/Select';
import { DateRangePicker } from '@/components/ui/datetime-picker/DateRangePicker';
import { Button } from '@/components/ui/button/Button';

import type { DocumentType, DocumentStatus } from "@/features/documents/types";

interface DocumentFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    statusFilter: DocumentStatus | "All";
    onStatusChange: (value: DocumentStatus | "All") => void;
    typeFilter: DocumentType | "All";
    onTypeChange: (value: DocumentType | "All") => void;
    departmentFilter: string;
    onDepartmentChange: (value: string) => void;
    authorFilter: string;
    onAuthorChange: (value: string) => void;
    createdFromDate: string;
    onCreatedFromDateChange: (value: string) => void;
    createdToDate: string;
    onCreatedToDateChange: (value: string) => void;
    effectiveFromDate: string;
    onEffectiveFromDateChange: (value: string) => void;
    effectiveToDate: string;
    onEffectiveToDateChange: (value: string) => void;
    validFromDate: string;
    onValidFromDateChange: (value: string) => void;
    validToDate: string;
    onValidToDateChange: (value: string) => void;

    showTypeFilter?: boolean;
    showBusinessUnitFilter?: boolean;
    showDepartmentFilter?: boolean;
    disableStatusFilter?: boolean;
    authorFilterDisabled?: boolean;
    allowedStatuses?: DocumentStatus[];

    businessUnitFilter?: string;
    onBusinessUnitChange?: (value: string) => void;

    relatedDocumentFilter?: string;
    onRelatedDocumentFilterChange?: (value: string) => void;
    correlatedDocumentFilter?: string;
    onCorrelatedDocumentFilterChange?: (value: string) => void;
    templateFilter?: string;
    onTemplateFilterChange?: (value: string) => void;
    onClearFilters?: () => void;
    hideSearch?: boolean;
    showCard?: boolean;
}

export const DocumentFilters: React.FC<DocumentFiltersProps> = ({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    typeFilter,
    onTypeChange,
    departmentFilter,
    onDepartmentChange,
    authorFilter,
    onAuthorChange,
    createdFromDate,
    onCreatedFromDateChange,
    createdToDate,
    onCreatedToDateChange,
    effectiveFromDate,
    onEffectiveFromDateChange,
    effectiveToDate,
    onEffectiveToDateChange,
    validFromDate,
    onValidFromDateChange,
    validToDate,
    onValidToDateChange,
    showTypeFilter = true,
    showBusinessUnitFilter = true,
    showDepartmentFilter = true,
    disableStatusFilter = false,
    authorFilterDisabled = false,
    allowedStatuses,
    businessUnitFilter = "All",
    onBusinessUnitChange = () => { },
    relatedDocumentFilter = "All",
    onRelatedDocumentFilterChange = () => { },
    correlatedDocumentFilter = "All",
    onCorrelatedDocumentFilterChange = () => { },
    templateFilter = "All",
    onTemplateFilterChange = () => { },
    onClearFilters = () => { },
    hideSearch = false,
    showCard = true,
}) => {
    // Default status options for All Revisions view
    const defaultStatusOptions = [
        { label: "All", value: "All" },
        { label: "Draft", value: "Draft" },
        { label: "Pending Review", value: "Pending Review" },
        { label: "Pending Approval", value: "Pending Approval" },
        { label: "Approved", value: "Approved" },
        { label: "Pending Training", value: "Pending Training" },
        { label: "Ready for Publishing", value: "Ready for Publishing" },
        { label: "Published", value: "Published" },
        { label: "Effective", value: "Effective" },
        { label: "Archive", value: "Archive" },
        { label: "Obsoleted", value: "Obsoleted" },
        { label: "Closed - Cancelled", value: "Closed - Cancelled" },
    ];

    // Filter status options based on allowedStatuses prop
    const statusOptions = allowedStatuses
        ? [
            { label: "All", value: "All" },
            ...allowedStatuses.map(status => ({ label: status, value: status }))
        ]
        : defaultStatusOptions;

    const content = (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
            {/* Search */}
            {!hideSearch && (
                <div className="w-full">
                    <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
                        Search
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by document name, ID, author, department..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="block w-full pl-10 pr-3 h-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-colors placeholder:text-slate-400"
                        />
                    </div>
                </div>
            )}

                {/* Status Filter */}
                <div className="w-full">
                    <Select
                        label="Status"
                        value={statusFilter}
                        onChange={(value) => !disableStatusFilter && onStatusChange(value as DocumentStatus | "All")}
                        options={statusOptions}
                        placeholder="Select status"
                        searchPlaceholder="Search status..."
                        disabled={disableStatusFilter}
                    />
                </div>

                {/* Type Filter */}
                {showTypeFilter && (
                    <div className="w-full">
                        <Select
                            label="Document Type"
                            value={typeFilter}
                            onChange={(value) => onTypeChange(value as DocumentType | "All")}
                            options={[
                                { label: "All", value: "All" },
                                { label: "SOP", value: "SOP" },
                                { label: "Policy", value: "Policy" },
                                { label: "Form", value: "Form" },
                                { label: "Report", value: "Report" },
                                { label: "Specification", value: "Specification" },
                                { label: "Protocol", value: "Protocol" },
                            ]}
                            placeholder="Select type"
                            searchPlaceholder="Search type..."
                        />
                    </div>
                )}

                {/* Business Unit Filter */}
                {showBusinessUnitFilter && (
                    <div className="w-full">
                        <Select
                            label="Business Unit"
                            value={businessUnitFilter}
                            onChange={(value) => onBusinessUnitChange(value)}
                            options={[
                                { label: "All", value: "All" },
                                { label: "Corporate", value: "Corporate" },
                                { label: "Operations", value: "Operations" },
                                { label: "Quality", value: "Quality" },
                                { label: "Research", value: "Research" },
                            ]}
                            placeholder="Select business unit"
                            searchPlaceholder="Search business unit..."
                        />
                    </div>
                )}

                {/* Department Filter */}
                {showDepartmentFilter && (
                    <div className="w-full">
                        <Select
                            label="Department"
                            value={departmentFilter}
                            onChange={(value) => onDepartmentChange(value)}
                            options={[
                                { label: "All", value: "All" },
                                { label: "Quality Assurance", value: "Quality Assurance" },
                                { label: "Quality Management", value: "Quality Management" },
                                { label: "Quality Control", value: "Quality Control" },
                                { label: "Production", value: "Production" },
                                { label: "Engineering", value: "Engineering" },
                                { label: "Human Resources", value: "Human Resources" },
                                { label: "Validation", value: "Validation" },
                            ]}
                            placeholder="Select department"
                            searchPlaceholder="Search department..."
                        />
                    </div>
                )}

                {/* Author Filter */}
                <div className="w-full">
                    <Select
                        label="Author"
                        value={authorFilter}
                        onChange={(value) => !authorFilterDisabled && onAuthorChange(value)}
                        options={[
                            { label: "All", value: "All" },
                            { label: "Dr. Sarah Johnson", value: "Dr. Sarah Johnson" },
                            { label: "Michael Chen", value: "Michael Chen" },
                            { label: "Emma Williams", value: "Emma Williams" },
                            { label: "John Davis", value: "John Davis" },
                            { label: "Dr. Lisa Park", value: "Dr. Lisa Park" },
                            { label: "Robert Taylor", value: "Robert Taylor" },
                            { label: "Amanda Martinez", value: "Amanda Martinez" },
                            { label: "David Brown", value: "David Brown" },
                            { label: "Jessica Lee", value: "Jessica Lee" },
                        ]}
                        placeholder="Select author"
                        searchPlaceholder="Search author..."
                        disabled={authorFilterDisabled}
                    />
                </div>

                {/* Related Document Filter */}
                <div className="w-full">
                    <Select
                        label="Related Document"
                        value={relatedDocumentFilter}
                        onChange={(value) => onRelatedDocumentFilterChange(value)}
                        options={[
                            { label: "All", value: "All" },
                            { label: "Yes", value: "yes" },
                            { label: "No", value: "no" },
                        ]}
                        placeholder="Select option"
                    />
                </div>

                {/* Correlated Document Filter */}
                <div className="w-full">
                    <Select
                        label="Correlated Document"
                        value={correlatedDocumentFilter}
                        onChange={(value) => onCorrelatedDocumentFilterChange(value)}
                        options={[
                            { label: "All", value: "All" },
                            { label: "Yes", value: "yes" },
                            { label: "No", value: "no" },
                        ]}
                        placeholder="Select option"
                    />
                </div>

                {/* Is Template Filter */}
                <div className="w-full">
                    <Select
                        label="Is Template"
                        value={templateFilter}
                        onChange={(value) => onTemplateFilterChange(value)}
                        options={[
                            { label: "All", value: "All" },
                            { label: "Yes", value: "yes" },
                            { label: "No", value: "no" },
                        ]}
                        placeholder="Select option"
                    />
                </div>

                {/* Created Date Range */}
                <div className="w-full">
                    <DateRangePicker
                        label="Created Date Range"
                        startDate={createdFromDate}
                        endDate={createdToDate}
                        onStartDateChange={onCreatedFromDateChange}
                        onEndDateChange={onCreatedToDateChange}
                        placeholder="Select date range"
                    />
                </div>

                {/* Effective Date Range */}
                <div className="w-full">
                    <DateRangePicker
                        label="Effective Date Range"
                        startDate={effectiveFromDate}
                        endDate={effectiveToDate}
                        onStartDateChange={onEffectiveFromDateChange}
                        onEndDateChange={onEffectiveToDateChange}
                        placeholder="Select date range"
                    />
                </div>

                {/* Valid Until Date Range */}
                <div className="w-full">
                    <DateRangePicker
                        label="Valid Date Range"
                        startDate={validFromDate}
                        endDate={validToDate}
                        onStartDateChange={onValidFromDateChange}
                        onEndDateChange={onValidToDateChange}
                        placeholder="Select date range"
                    />
                </div>

            {/* Clear Filters Button */}
            <div className="flex items-center">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                    className="h-9 px-4 gap-2 font-medium transition-all duration-200 hover:bg-red-600 hover:text-white hover:border-red-600 whitespace-nowrap"
                >
                    Clear Filters
                </Button>
            </div>
        </div>
    );

    return hideSearch || !showCard ? content : (
        <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm w-full">
            {content}
        </div>
    );
};
