import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";
import { notifications as notificationsBreadcrumb } from "@/components/ui/breadcrumb/breadcrumbs.config";
import {
  Search,
  Bell,
  CheckCheck,
  Trash2,
  User,
  FileText,
  AlertTriangle,
  MessageCircle,
  UserPlus,
  CheckCircle,
  ThumbsUp,
  Reply,
  Settings,
  MoreVertical,
  Eye,
  ExternalLink,
  Download,
  X,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { usePortalDropdown, useTableDragScroll } from "@/hooks";
import { Button } from "@/components/ui/button/Button";
import { Select } from "@/components/ui/select/Select";
import { DateRangePicker } from "@/components/ui/datetime-picker/DateRangePicker";
import { TablePagination } from "@/components/ui/table/TablePagination";
import { TableEmptyState } from "@/components/ui/table/TableEmptyState";
import { FilterCard } from "@/components/ui/card/FilterCard";
import { cn } from "@/components/ui/utils";
import { StatusBadge } from "@/components/ui/badge";
import type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationFilterTab,
} from "./types";
import { IconInfoCircle } from "@tabler/icons-react";
import { MOCK_NOTIFICATIONS } from "./mockData";

// Helper functions
const getTypeIcon = (type: NotificationType) => {
  const icons: Record<NotificationType, typeof Bell> = {
    "review-request": MessageCircle,
    approval: CheckCircle,
    "capa-assignment": UserPlus,
    "training-completion": ThumbsUp,
    "document-update": FileText,
    "comment-reply": Reply,
    "deviation-assignment": AlertTriangle,
    "change-control": Settings,
    system: Bell,
  };
  return icons[type] || Bell;
};

const getTypeColor = (type: NotificationType) => {
  const colors: Record<
    NotificationType,
    { bg: string; text: string; badge: string }
  > = {
    "review-request": {
      bg: "bg-blue-100",
      text: "text-blue-600",
      badge: "bg-blue-500",
    },
    approval: {
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      badge: "bg-emerald-500",
    },
    "capa-assignment": {
      bg: "bg-amber-100",
      text: "text-amber-600",
      badge: "bg-amber-500",
    },
    "training-completion": {
      bg: "bg-purple-100",
      text: "text-purple-600",
      badge: "bg-purple-500",
    },
    "document-update": {
      bg: "bg-cyan-100",
      text: "text-cyan-600",
      badge: "bg-cyan-500",
    },
    "comment-reply": {
      bg: "bg-slate-100",
      text: "text-slate-600",
      badge: "bg-slate-500",
    },
    "deviation-assignment": {
      bg: "bg-red-100",
      text: "text-red-600",
      badge: "bg-red-500",
    },
    "change-control": {
      bg: "bg-indigo-100",
      text: "text-indigo-600",
      badge: "bg-indigo-500",
    },
    system: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      badge: "bg-slate-500",
    },
  };
  return colors[type] || colors.system;
};

const getPriorityStyles = (priority: NotificationPriority) => {
  const styles: Record<NotificationPriority, string> = {
    critical: "bg-red-50 text-red-700 border-red-200",
    high: "bg-amber-50 text-amber-700 border-amber-200",
    medium: "bg-blue-50 text-blue-700 border-blue-200",
    low: "bg-slate-50 text-slate-700 border-slate-200",
  };
  return styles[priority];
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}/${month}`;
};

// --- Components ---

// Tab Component
const NotificationTabs: React.FC<{
  activeTab: NotificationFilterTab;
  setActiveTab: (tab: NotificationFilterTab) => void;
  counts: { all: number; unread: number; read: number };
}> = ({ activeTab, setActiveTab, counts }) => {
  const tabs: { id: NotificationFilterTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "unread", label: "Unread", count: counts.unread },
    { id: "read", label: "Read", count: counts.read },
  ];

  return (
    <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 flex-1 sm:flex-initial relative z-10",
            activeTab === tab.id
              ? "text-slate-900"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50",
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeNotificationTab"
              className="absolute inset-0 bg-white rounded-lg shadow-sm pointer-events-none"
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            />
          )}
          <span className="relative z-20 flex items-center gap-2">
            {tab.label}
            <span
              className={cn(
                "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full transition-colors",
                activeTab === tab.id
                  ? tab.id === "unread"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-700"
                  : "bg-slate-200/60 text-slate-500",
              )}
            >
              {tab.count}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
};

const NotificationActionsDropdown: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  position: { top: number; left: number; showAbove?: boolean };
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
  onView: () => void;
}> = ({
  isOpen,
  onClose,
  position,
  notification,
  onMarkAsRead,
  onDelete,
  onView,
}) => {
    if (!isOpen) return null;

    return createPortal(
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-hidden="true"
          style={{
            // Allow scroll on touch devices
            touchAction: "auto",
            // Make backdrop invisible but still clickable
            backgroundColor: "transparent",
          }}
        />
        <div
          className="fixed z-50 min-w-[160px] w-[200px] max-w-[90vw] max-h-[300px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: position.showAbove ? "translateY(-100%)" : "none",
          }}
        >
          <div className="py-1">
            {notification.status === "unread" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead();
                  onClose();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
              >
                <Eye className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">Mark as Read</span>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                onClose();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <Trash2 className="h-4 w-4 flex-shrink-0" />
              <span className="font-medium">Delete</span>
            </button>
          </div>
        </div>
      </>,
      document.body,
    );
  };

const NotificationRow: React.FC<{
  notification: Notification;
  index: number;
  onView: (notification: Notification) => void;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  getRef: (id: string) => React.RefObject<HTMLButtonElement | null>;
  onToggle: (id: string, e: React.MouseEvent<HTMLButtonElement>) => void;
}> = ({
  notification,
  index,
  onView,
  onMarkAsRead,
  onDelete,
  getRef,
  onToggle,
}) => {
    const Icon = getTypeIcon(notification.type);
    const colors = getTypeColor(notification.type);
    const tdClass = "py-2.5 px-2 md:py-3 md:px-4 text-xs md:text-sm text-slate-700 border-b border-slate-200 whitespace-nowrap";

    return (
      <tr
        className={cn(
          "group transition-colors",
          notification.status === "unread"
            ? "bg-emerald-50/30 hover:bg-emerald-50/50"
            : "hover:bg-slate-50/80",
        )}
      >
        <td className={cn(tdClass, "text-center text-slate-500 w-14")}>
          {index}
        </td>

        <td
          className={cn(tdClass, "cursor-pointer")}
          onClick={() => onView(notification)}
        >
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <div
                className={cn(
                  "h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center",
                  colors.bg,
                )}
              >
                <Icon className={cn("h-4 w-4 md:h-5 md:w-5", colors.text)} />
              </div>
              {notification.status === "unread" && (
                <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 md:h-3 md:w-3 bg-emerald-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm hover:underline",
                  notification.status === "unread"
                    ? "font-semibold text-slate-900"
                    : "font-medium text-slate-700",
                )}
              >
                {notification.title}
              </p>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5 max-w-md truncate">
                {notification.description}
              </p>
            </div>
          </div>
        </td>

        <td className={tdClass}>
          <StatusBadge
            status="draft"
            label={notification.module}
            className="text-slate-700 bg-slate-100 border-slate-200"
            size="sm"
          />
        </td>

        <td className={tdClass}>
          {notification.relatedItem ? (
            <span className="font-medium text-emerald-600">
              {notification.relatedItem.code}
            </span>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </td>

        <td className={tdClass}>
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium border capitalize",
              getPriorityStyles(notification.priority),
            )}
          >
            {notification.priority}
          </span>
        </td>

        <td className={cn(tdClass, "text-slate-500")}>
          {formatTimeAgo(notification.createdAt)}
        </td>

        <td
          onClick={(e) => e.stopPropagation()}
          className="sticky right-0 z-10 bg-white border-b border-slate-200 py-2.5 px-2 md:py-3 md:px-4 text-center whitespace-nowrap before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50 transition-colors"
        >
          <button
            ref={getRef(notification.id)}
            onClick={(e) => onToggle(notification.id, e)}
            className="inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
            aria-label="More actions"
          >
            <MoreVertical className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
        </td>
      </tr>
    );
  };

// Empty State Component
const EmptyState: React.FC<{
  type: NotificationFilterTab;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}> = ({ type, hasActiveFilters, onClearFilters }) => {
  const messages = {
    all: {
      title: "No notifications",
      description: hasActiveFilters
        ? "We couldn't find any notifications matching your filters. Try adjusting your search criteria or clear filters."
        : "You're all caught up!",
    },
    unread: {
      title: "No unread notifications",
      description: hasActiveFilters
        ? "We couldn't find any unread notifications matching your filters. Try adjusting your search criteria or clear filters."
        : "All notifications have been read",
    },
    read: {
      title: "No read notifications",
      description: hasActiveFilters
        ? "We couldn't find any read notifications matching your filters. Try adjusting your search criteria or clear filters."
        : "Notifications you've read will appear here",
    },
  };

  return (
    <TableEmptyState
      icon={<Bell className="h-7 w-7 md:h-8 md:w-8 text-slate-300" />}
      title={messages[type].title}
      description={messages[type].description}
      actionLabel="Clear Filters"
      onAction={hasActiveFilters ? onClearFilters : undefined}
    />
  );
};

// --- Main View ---
export const NotificationsView: React.FC = () => {
  const navigate = useNavigate();
  const {
    openId: openDropdownId,
    position: dropdownPosition,
    getRef,
    toggle: handleDropdownToggle,
    close: closeDropdown,
  } = usePortalDropdown();
  const { scrollerRef, isDragging, dragEvents } = useTableDragScroll();

  // Filter states
  const [activeTab, setActiveTab] = useState<NotificationFilterTab>("all");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [module, setModule] = useState("all");
  const [priority, setPriority] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });
  const [sortConfig, setSortConfig] = useState<{ key: keyof Notification | null; direction: "asc" | "desc" }>({
    key: "createdAt",
    direction: "desc",
  });
  const [isTableLoading, setIsTableLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Notification data (in real app, this would come from API)
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter((n) => n.status === "unread").length,
      read: notifications.filter((n) => n.status === "read").length,
    };
  }, [notifications]);

  // Sorting Handler
  const handleSort = (key: keyof Notification) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Date parser for DD/MM/YYYY if needed but createdAt is ISO for sorting usually
  const parseDate = (dateStr: string) => {
    if (!dateStr) return 0;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])).getTime();
      }
    }
    const d = new Date(dateStr).getTime();
    return isNaN(d) ? 0 : d;
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications.filter((notification) => {
      // Tab filter
      if (activeTab === "unread" && notification.status !== "unread")
        return false;
      if (activeTab === "read" && notification.status !== "read") return false;

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          notification.title.toLowerCase().includes(searchLower) ||
          notification.description.toLowerCase().includes(searchLower) ||
          notification.relatedItem?.code.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (type !== "all" && notification.type !== type) return false;

      // Module filter
      if (module !== "all" && notification.module !== module) return false;

      // Priority filter
      if (priority !== "all" && notification.priority !== priority)
        return false;

      // Date filters
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        const notificationDate = new Date(notification.createdAt);
        if (notificationDate < fromDate) return false;
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        const notificationDate = new Date(notification.createdAt);
        if (notificationDate > toDate) return false;
      }

      return true;
    });

    // Sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const key = sortConfig.key!;
        let aValue: any = a[key];
        let bValue: any = b[key];

        // Handle nested relatedItem.code
        if (key === "relatedItem") {
          aValue = a.relatedItem?.code || "";
          bValue = b.relatedItem?.code || "";
        }

        // Date sorting for createdAt
        if (key === "createdAt") {
          aValue = parseDate(aValue);
          bValue = parseDate(bValue);
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    notifications,
    activeTab,
    search,
    type,
    module,
    priority,
    dateFrom,
    dateTo,
    sortConfig,
    parseDate,
  ]);

  // Paginated notifications
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNotifications.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNotifications, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  // Handlers
  const handleViewNotification = (notification: Notification) => {
    // Mark as read
    if (notification.status === "unread") {
      handleMarkAsRead(notification.id);
    }
    // Navigate to related item
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, status: "read" as const, readAt: new Date().toISOString() }
          : n,
      ),
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.status === "unread"
          ? { ...n, status: "read" as const, readAt: new Date().toISOString() }
          : n,
      ),
    );
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Clear Filters
  const handleClearFilters = () => {
    setSearch("");
    setType("all");
    setModule("all");
    setPriority("all");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters =
    search !== "" ||
    type !== "all" ||
    module !== "all" ||
    priority !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  return (
    <div className="flex flex-col h-full gap-4 md:gap-6">
      {/* Header: Title + Action Button */}
      <div className="flex flex-row flex-wrap items-end justify-between gap-3 md:gap-4">
        <div className="min-w-[200px] flex-1">
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-slate-900">
            Notifications
          </h1>
          <Breadcrumb items={notificationsBreadcrumb(navigate)} />
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0 flex-wrap">
          <Button
            onClick={() => console.log("Export notifications")}
            variant="outline"
            size="sm"
            className="whitespace-nowrap gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={counts.unread === 0}
            className="whitespace-nowrap gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <CheckCheck className="h-4 w-4" />
            <span className="inline">Mark all as read</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <NotificationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={counts}
        />
      </div>

      {/* Unified Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full overflow-hidden flex flex-col">
        {/* Filter Section */}
        <div className="p-4 md:p-5 flex flex-col">
          {/* Search Row + Primary Actions */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs sm:text-sm font-medium text-slate-700 block transition-colors group-focus-within:text-emerald-600 px-0.5">
              Search
            </label>
            <div className="flex gap-2 items-center w-full">
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors">
                  <Search className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="block w-full pl-10 pr-10 h-9 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all placeholder:text-slate-400"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex-shrink-0">
                <Button
                  variant={isFilterVisible ? "default" : "outline"}
                  onClick={() => setIsFilterVisible(!isFilterVisible)}
                  className="h-9 px-3 sm:px-4 gap-2 whitespace-nowrap rounded-lg"
                  size="sm"
                  aria-label="Toggle filters"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Conditional Filters Tray: Accordion Effect */}
          <AnimatePresence>
            {isFilterVisible && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, y: 0, marginTop: 16 }}
                exit={{ height: 0, opacity: 0, y: -10, marginTop: 0 }}
                transition={{
                  height: { type: "spring", bounce: 0, duration: 0.4 },
                  marginTop: { type: "spring", bounce: 0, duration: 0.4 },
                  opacity: { duration: 0.25 },
                  y: { duration: 0.3 },
                }}
                className="overflow-hidden px-1.5 -mx-1.5 pb-1.5 -mb-1.5"
              >
                <div className="pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="w-full">
                      <Select
                        label="Notification Type"
                        value={type}
                        onChange={(val) => {
                          setType(val as string);
                          setCurrentPage(1);
                        }}
                        options={[
                          { label: "All Types", value: "all" },
                          { label: "Review Request", value: "review-request" },
                          { label: "Approval", value: "approval" },
                          {
                            label: "CAPA Assignment",
                            value: "capa-assignment",
                          },
                          {
                            label: "Training Completion",
                            value: "training-completion",
                          },
                          {
                            label: "Document Update",
                            value: "document-update",
                          },
                          { label: "Comment Reply", value: "comment-reply" },
                          {
                            label: "Deviation Assignment",
                            value: "deviation-assignment",
                          },
                          { label: "Change Control", value: "change-control" },
                        ]}
                      />
                    </div>

                    <div className="w-full">
                      <Select
                        label="Module"
                        value={module}
                        onChange={(val) => {
                          setModule(val as string);
                          setCurrentPage(1);
                        }}
                        options={[
                          { label: "All Modules", value: "all" },
                          { label: "Document", value: "Document" },
                          { label: "Deviation", value: "Deviation" },
                          { label: "CAPA", value: "CAPA" },
                          { label: "Training", value: "Training" },
                          { label: "Change Control", value: "Change Control" },
                        ]}
                      />
                    </div>

                    <div className="w-full">
                      <Select
                        label="Priority"
                        value={priority}
                        onChange={(val) => {
                          setPriority(val as string);
                          setCurrentPage(1);
                        }}
                        options={[
                          { label: "All Priorities", value: "all" },
                          { label: "Critical", value: "critical" },
                          { label: "High", value: "high" },
                          { label: "Medium", value: "medium" },
                          { label: "Low", value: "low" },
                        ]}
                      />
                    </div>

                    <div className="w-full">
                      <DateRangePicker
                        label="Time Range"
                        startDate={dateFrom}
                        endDate={dateTo}
                        onStartDateChange={(val) => {
                          setDateFrom(val);
                          setCurrentPage(1);
                        }}
                        onEndDateChange={(val) => {
                          setDateTo(val);
                          setCurrentPage(1);
                        }}
                        placeholder="Select date range"
                      />
                    </div>
                    <div className="col-span-full flex justify-start">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                        className="h-9 px-4 gap-2 font-medium transition-all duration-200 hover:bg-red-600 hover:text-white hover:border-red-600 whitespace-nowrap"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Table Section */}
        <div className="px-4 md:px-5 pb-4 md:pb-5 flex-1 flex flex-col relative">
          <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col flex-1 bg-white transition-all duration-300">
            <div
              ref={scrollerRef}
              className={cn(
                "flex-1 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50 hover:scrollbar-thumb-slate-400",
                isDragging ? "cursor-grabbing select-none" : "cursor-grab"
              )}
              {...dragEvents}
            >
              <table className="w-full min-w-max border-separate border-spacing-0 text-left">
                <thead>
                  <tr>
                    <th className="sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3 md:px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap w-14 text-center">
                      No.
                    </th>
                    {[
                      { label: "Notification", id: "title", sortable: true },
                      { label: "Module", id: "module", sortable: true },
                      { label: "Related Item", id: "relatedItem", sortable: true },
                      { label: "Priority", id: "priority", sortable: true },
                      { label: "Time", id: "createdAt", sortable: true }
                    ].map((col, idx) => {
                      const isSorted = sortConfig.key === col.id;
                      const canSort = col.sortable;
                      return (
                        <th
                          key={idx}
                          onClick={canSort ? () => handleSort(col.id as keyof Notification) : undefined}
                          className={cn(
                            "sticky top-0 z-20 bg-slate-50 py-2.5 px-2 md:py-3 md:px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200 whitespace-nowrap transition-colors",
                            canSort && "cursor-pointer hover:bg-slate-100 hover:text-slate-700 group",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 w-full">
                            <span className="truncate">{col.label}</span>
                            {canSort && (
                              <div className="flex flex-col text-slate-500 flex-shrink-0 group-hover:text-slate-700 transition-colors">
                                <ChevronUp className={cn("h-3 w-3 -mb-1", isSorted && sortConfig.direction === 'asc' ? "text-emerald-600" : "")} />
                                <ChevronDown className={cn("h-3 w-3", isSorted && sortConfig.direction === 'desc' ? "text-emerald-600" : "")} />
                              </div>
                            )}
                          </div>
                        </th>
                      );
                    })}
                    <th className="sticky top-0 right-0 z-30 bg-slate-50 py-2.5 px-2 md:py-3 md:px-4 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap border-b-2 border-slate-200 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-slate-200 shadow-[-6px_0_10px_-4px_rgba(0,0,0,0.05)]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {paginatedNotifications.length > 0 ? (
                    paginatedNotifications.map((notification, idx) => (
                      <NotificationRow
                        key={notification.id}
                        notification={notification}
                        index={(currentPage - 1) * itemsPerPage + idx + 1}
                        onView={handleViewNotification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDeleteNotification}
                        getRef={getRef}
                        onToggle={handleDropdownToggle}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="border-b border-slate-200">
                        <EmptyState
                          type={activeTab}
                          hasActiveFilters={hasActiveFilters}
                          onClearFilters={handleClearFilters}
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredNotifications.length}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        </div>
      </div>

      {/* Shared Dropdown Portal */}
      {openDropdownId &&
        filteredNotifications.find((n) => n.id === openDropdownId) && (
          <NotificationActionsDropdown
            isOpen={true}
            onClose={closeDropdown}
            position={dropdownPosition}
            notification={
              filteredNotifications.find((n) => n.id === openDropdownId)!
            }
            onMarkAsRead={() => {
              handleMarkAsRead(openDropdownId);
              closeDropdown();
            }}
            onDelete={() => {
              handleDeleteNotification(openDropdownId);
              closeDropdown();
            }}
            onView={() => {
              const n = filteredNotifications.find(
                (n) => n.id === openDropdownId,
              );
              if (n) handleViewNotification(n);
              closeDropdown();
            }}
          />
        )}
    </div>
  );
};
