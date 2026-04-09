import { useState } from 'react';
import {
  Clock,
  Users,
  Play,
  Pause,
  Trash2,
  Edit,
  MoreVertical,
  Settings,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortalDropdown } from '@/hooks/usePortalDropdown';
import { Button } from '@/components/ui/button/Button';
import { TablePagination } from '@/components/ui/table/TablePagination';
import { cn } from '@/components/ui/utils';
import { getTypeColor } from '../types';
import { MOCK_SCHEDULED_REPORTS } from '../mockData';

/**
 * Custom hook managing the Scheduled Reports tab.
 * Returns `filterElement` (renders inside the unified card) and `contentElement` (renders below).
 */
export function useScheduledTab() {
  const { openId: openDropdownId, position: dropdownPosition, getRef, toggle: handleDropdownToggle, close: closeDropdown } = usePortalDropdown();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(MOCK_SCHEDULED_REPORTS.length / itemsPerPage);
  const paginatedSchedules = MOCK_SCHEDULED_REPORTS.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const handleScheduleAction = (id: string, action: 'pause' | 'resume' | 'delete' | 'edit') => {
    console.log(`Schedule action ${action} for:`, id);
    closeDropdown();
    // TODO: Implement schedule actions
  };

  // --- Filter section (inside the unified card) ---
  const filterElement = (
    <div className="p-4 lg:p-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Automated Report Schedules</h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure automatic report generation and distribution
          </p>
        </div>
        <Button variant="default" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          New Schedule
        </Button>
      </div>
    </div>
  );

  // --- Content section (below the unified card) ---
  const contentElement = (
    <>
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
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                  Schedule
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                  Next Run
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                  Last Run
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                  Recipients
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
              {paginatedSchedules.map((schedule, index) => (
                <tr key={schedule.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-500">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <div className="font-medium text-slate-900">{schedule.reportName}</div>
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border',
                        getTypeColor(schedule.type)
                      )}
                    >
                      {schedule.type}
                    </span>
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                      {schedule.schedule}
                    </div>
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap hidden lg:table-cell">
                    {schedule.nextRun}
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap hidden lg:table-cell">
                    {schedule.lastRun}
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 whitespace-nowrap hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                      {schedule.recipients.length} recipient
                      {schedule.recipients.length > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border',
                        schedule.status === 'Active' &&
                        'bg-emerald-50 text-emerald-700 border-emerald-200',
                        schedule.status === 'Paused' &&
                        'bg-amber-50 text-amber-700 border-amber-200',
                        schedule.status === 'Expired' &&
                        'bg-slate-50 text-slate-700 border-slate-200'
                      )}
                    >
                      {schedule.status === 'Active' && <Play className="h-3 w-3" />}
                      {schedule.status === 'Paused' && <Pause className="h-3 w-3" />}
                      {schedule.status}
                    </span>
                  </td>
                  <td
                    onClick={(e) => e.stopPropagation()}
                    className="sticky right-0 bg-white py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center z-30 whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50"
                  >
                    <button
                      ref={getRef(schedule.id)}
                      onClick={(e) => handleDropdownToggle(schedule.id, e)}
                      className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-100 transition-colors"
                      aria-label="More actions"
                    >
                      <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {MOCK_SCHEDULED_REPORTS.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={MOCK_SCHEDULED_REPORTS.length}
            itemsPerPage={itemsPerPage}
            showItemsPerPageSelector={false}
          />
        )}
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {openDropdownId &&
          createPortal(
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  closeDropdown();
                }}
                aria-hidden="true"
              />
              {/* Menu */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 400
                }}
                className="fixed z-50 min-w-[160px] w-[200px] max-w-[90vw] rounded-lg border border-slate-200 bg-white shadow-xl overflow-hidden"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  transformOrigin: dropdownPosition.showAbove ? "bottom" : "top",
                }}
              >
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScheduleAction(openDropdownId, 'edit');
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 active:bg-slate-100 transition-colors text-slate-500"
                  >
                    <Edit className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">Edit Schedule</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const schedule = MOCK_SCHEDULED_REPORTS.find((s) => s.id === openDropdownId);
                      handleScheduleAction(
                        openDropdownId,
                        schedule?.status === 'Paused' ? 'resume' : 'pause'
                      );
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 active:bg-slate-100 transition-colors text-slate-500"
                  >
                    {MOCK_SCHEDULED_REPORTS.find((s) => s.id === openDropdownId)?.status ===
                      'Paused' ? (
                      <>
                        <Play className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">Resume Schedule</span>
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">Pause Schedule</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScheduleAction(openDropdownId, 'delete');
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-red-50 active:bg-red-100 transition-colors text-red-600"
                  >
                    <Trash2 className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">Delete Schedule</span>
                  </button>
                </div>
              </motion.div>
            </>,
            document.body
          )}
      </AnimatePresence>
    </>
  );

  return { filterElement, contentElement };
}
