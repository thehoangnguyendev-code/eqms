/**
 * My Tasks Feature
 *
 * Task management interface for QMS application.
 */

// Main View
export { MyTasksView } from './MyTasksView';

// Types
export type {
  Task,
  Priority,
  TaskStatus,
  ModuleType,
  TimelineEvent,
  TableColumn,
} from './types';

// Components (for reuse in other features)
export {
  TaskTable,
  TaskDetailDrawer,
} from './components';

// Utils (for reuse in other features)
export {
  getPriorityColor,
  getStatusBadgeStyle,
  getModuleIcon,
  getModuleBadgeStyle,
  isOverdue,
  daysUntil,
  calculateDaysLeft,
  getPriorityBadgeStyle,
} from './utils';


