import { useState, useMemo } from 'react';
import {
  FileBarChart,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  FileX,
  Search,
  MoreVertical,
  Trash2,
  Filter,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { usePortalDropdown } from '@/hooks/usePortalDropdown';
import { Select } from '@/components/ui/select/Select';
import { DateRangePicker } from '@/components/ui/datetime-picker/DateRangePicker';
import { TablePagination } from '@/components/ui/table/TablePagination';
import { Button } from '@/components/ui/button/Button';
import { cn } from '@/components/ui/utils';
import type { ReportType, ReportStatus } from '../types';
import { getTypeColor } from '../types';
import { MOCK_REPORT_HISTORY } from '../mockData';
import { IconRefresh } from '@tabler/icons-react';

/**
 * Custom hook managing the History tab.
 * Returns `filterElement` (renders inside the unified card) and `contentElement` (renders below).
 */
export function useHistoryTab() {
  const [historySearch, setHistorySearch] = useState('');
  const [historyType, setHistoryType] = useState<ReportType | 'All'>('All');
  const [historyStatus, setHistoryStatus] = useState<ReportStatus | 'All'>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Action Dropdown
  const { openId: openDropdownId, position: dropdownPosition, getRef, toggle: handleDropdownToggle, close: closeDropdown } = usePortalDropdown();

  const filteredHistory = useMemo(() => {
    return MOCK_REPORT_HISTORY.filter((report) => {
      const matchesSearch = report.reportName.toLowerCase().includes(historySearch.toLowerCase());
      const matchesType = historyType === 'All' || report.type === historyType;
      const matchesStatus = historyStatus === 'All' || report.status === historyStatus;
      
      // Date range filtering
      let matchesDateFrom = true;
      let matchesDateTo = true;
      if (dateFrom) {
        const parts = dateFrom.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const from = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 0, 0, 0);
          const reportDate = new Date(report.generatedDate);
          matchesDateFrom = reportDate >= from;
        }
      }
      if (dateTo) {
        const parts = dateTo.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const to = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 23, 59, 59);
          const reportDate = new Date(report.generatedDate);
          matchesDateTo = reportDate <= to;
        }
      }
      
      return matchesSearch && matchesType && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [historySearch, historyType, historyStatus, dateFrom, dateTo]);

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistory, currentPage]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const handleDownloadReport = (id: string) => {
    console.log('Downloading report:', id);
    closeDropdown();
  };

  const handlePreviewReport = (id: string) => {
    console.log('Previewing report:', id);
    closeDropdown();
  };

  const handleRegenerateReport = (id: string) => {
    console.log('Regenerating report:', id);
    closeDropdown();
  };

  const handleDeleteReport = (id: string) => {
    console.log('Deleting report:', id);
    closeDropdown();
  };

  const handleClearFilters = () => {
    setHistorySearch('');
    setHistoryType('All');
    setHistoryStatus('All');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  // --- Filter section (inside the unified card) ---
  const filterElement = (
    <div className="p-4 lg:p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
        <div>
          <label className="text-xs sm:text-sm font-medium text-slate-700 mb-1.5 block">
            Search Reports
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search by report name..."
              className="w-full h-9 pl-10 pr-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder:text-slate-400 transition-colors"
            />
          </div>
        </div>

        <div>
          <Select
            label="Report Type"
            value={historyType}
            onChange={(value) => setHistoryType(value as ReportType | 'All')}
            options={[
              { label: 'All Types', value: 'All' },
              { label: 'Document', value: 'Document' },
              { label: 'Training', value: 'Training' },
              { label: 'Deviation', value: 'Deviation' },
              { label: 'CAPA', value: 'CAPA' },
              { label: 'Change Control', value: 'Change Control' },
              { label: 'Audit', value: 'Audit' },
              { label: 'Compliance', value: 'Compliance' },
            ]}
          />
        </div>

        <div>
          <Select
            label="Status"
            value={historyStatus}
            onChange={(value) => setHistoryStatus(value as ReportStatus | 'All')}
            options={[
              { label: 'All Status', value: 'All' },
              { label: 'Completed', value: 'Completed' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Failed', value: 'Failed' },
            ]}
          />
        </div>

        <div>
          <DateRangePicker
            label="Generated Date Range"
            startDate={dateFrom}
            endDate={dateTo}
            onStartDateChange={setDateFrom}
            onEndDateChange={setDateTo}
            placeholder="Select date range"
          />
        </div>
      </div>
    </div>
  );

  // --- Content section (below the unified card) ---
  const contentElement = (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap w-10 sm:w-[60px]">
                No.
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Report Name
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Type
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Format
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Generated Date
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                Generated By
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                Period
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                File Size
              </th>
              <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="sticky right-0 bg-slate-50 py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider z-[1] whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {paginatedHistory.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                      <FileBarChart className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">No reports found</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters</p>
                    <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-1 whitespace-nowrap">
                      Clear Filters
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedHistory.map((report, index) => (
                <tr key={report.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-500">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <div className="font-medium text-slate-900">{report.reportName}</div>
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border',
                        getTypeColor(report.type)
                      )}
                    >
                      {report.type}
                    </span>
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                    {report.format}
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap">
                    {report.generatedDate}
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap hidden lg:table-cell">
                    {report.generatedBy}
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap hidden lg:table-cell">
                    {report.period}
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap hidden md:table-cell">
                    {report.fileSize}
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border',
                        report.status === 'Completed' &&
                          'bg-emerald-50 text-emerald-700 border-emerald-200',
                        report.status === 'In Progress' &&
                          'bg-blue-50 text-blue-700 border-blue-200',
                        report.status === 'Failed' && 'bg-red-50 text-red-700 border-red-200'
                      )}
                    >
                      {report.status === 'Completed' && <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                      {report.status === 'In Progress' && <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                      {report.status === 'Failed' && <FileX className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                      {report.status}
                    </span>
                  </td>
                  <td
                    onClick={(e) => e.stopPropagation()}
                    className="sticky right-0 bg-white py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center z-30 whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50"
                  >
                    <button
                      ref={getRef(report.id)}
                      onClick={(e) => handleDropdownToggle(report.id, e)}
                      className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-100 transition-colors"
                      aria-label="More actions"
                    >
                      <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredHistory.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredHistory.length}
          itemsPerPage={itemsPerPage}
          showItemsPerPageSelector={false}
        />
      )}
    </div>
  );

  // --- Dropdown Portal ---
  const dropdownPortal = openDropdownId
    ? createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 animate-in fade-in duration-150"
            onClick={(e) => {
              e.stopPropagation();
              closeDropdown();
            }}
            aria-hidden="true"
          />
          {/* Menu */}
          <div
            className="fixed z-50 min-w-[160px] w-[200px] max-w-[90vw] max-h-[300px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              transform: dropdownPosition.showAbove ? 'translateY(-100%)' : 'none',
            }}
          >
            <div className="py-1">
              {(() => {
                const report = MOCK_REPORT_HISTORY.find((r) => r.id === openDropdownId);
                const isCompleted = report?.status === 'Completed';
                return (
                  <>
                    {isCompleted && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePreviewReport(openDropdownId);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 active:bg-slate-100 transition-colors text-slate-500"
                        >
                          <Eye className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium">Preview Report</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadReport(openDropdownId);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 active:bg-slate-100 transition-colors text-slate-500"
                        >
                          <Download className="h-4 w-4 flex-shrink-0" />
                          <span className="font-medium">Download</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegenerateReport(openDropdownId);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 active:bg-slate-100 transition-colors text-slate-500"
                    >
                      <IconRefresh className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">Regenerate</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReport(openDropdownId);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-red-50 active:bg-red-100 transition-colors text-red-600"
                    >
                      <Trash2 className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">Delete Report</span>
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </>,
        document.body
      )
    : null;

  return {
    filterElement,
    contentElement: (
      <>
        {contentElement}
        {dropdownPortal}
      </>
    ),
  };
}
