import React from 'react';
import { Search, Calendar, User, Clock } from 'lucide-react';
import { Select } from '@/components/ui/select/Select';
import { DateRangePicker } from '@/components/ui/datetime-picker/DateRangePicker';
import { FilterCard } from '@/components/ui/card/FilterCard';
import { RetentionFilter } from '../types';

interface ArchivedDocumentFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    lastApproverFilter: string;
    onLastApproverChange: (value: string) => void;
    retentionFilter: RetentionFilter;
    onRetentionFilterChange: (value: RetentionFilter) => void;
    startDate: string;
    onStartDateChange: (value: string) => void;
    endDate: string;
    onEndDateChange: (value: string) => void;
}

export const ArchivedDocumentFilters: React.FC<ArchivedDocumentFiltersProps> = ({
    searchQuery,
    onSearchChange,
    lastApproverFilter,
    onLastApproverChange,
    retentionFilter,
    onRetentionFilterChange,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
}) => {
    const approverOptions = [
        { label: 'All Approvers', value: 'all' },
        { label: 'John Smith', value: 'John Smith' },
        { label: 'Sarah Johnson', value: 'Sarah Johnson' },
        { label: 'Michael Chen', value: 'Michael Chen' },
    ];

    const retentionOptions = [
        { label: 'All Documents', value: 'all' },
        { label: 'Valid Retention', value: 'valid' },
        { label: 'Expiring Soon (≤30 days)', value: 'expiring-soon' },
        { label: 'Expired - Needs Destruction', value: 'expired' },
    ];

    return (
        <div className="p-4 md:p-5 border-b border-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
                {/* Search Input */}
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                        Search
                    </label>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by code, document name..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 h-9 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Archive Date Range */}
                <div>
                    <DateRangePicker
                        label="Archived Date Range"
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={onStartDateChange}
                        onEndDateChange={onEndDateChange}
                        placeholder="Select date range"
                    />
                </div>

                {/* Last Approver Filter */}
                <div>
                    <Select
                        label="Last Approver"
                        value={lastApproverFilter}
                        onChange={onLastApproverChange}
                        options={approverOptions}
                    />
                </div>

                {/* Retention Status Filter */}
                <div>
                    <Select
                        label="Retention Status"
                        value={retentionFilter}
                        onChange={onRetentionFilterChange}
                        options={retentionOptions}
                    />
                </div>
            </div>
        </div>
    );
};
