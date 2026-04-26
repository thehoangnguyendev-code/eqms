import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, User, CheckCheck, FileText, AlertTriangle, MessageCircle, UserPlus, CheckCircle, ThumbsUp, Reply, Settings, Pin } from 'lucide-react';
import { TabNav, type TabItem } from '../../ui/tabs/TabNav';
import { Button } from '../../ui/button/Button';
import { cn } from '../../ui/utils';
import { ROUTES } from '@/app/routes.constants';
import { MOCK_NOTIFICATIONS } from '@/features/notifications/mockData';
import type { Notification, NotificationType } from '@/features/notifications/types';
import { AlertModal } from '../../ui/modal/AlertModal';
import { FullPageLoading } from '../../ui/loading/Loading';
import logoNoBg from '@/assets/images/logo_nobg.png';
import { IconChevronLeft } from '@tabler/icons-react';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  onTogglePinnedDesktop?: () => void;
}

// Hook to detect mobile screen
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

type DropdownNotification = {
  id: string;
  status: Notification['status'];
  type: NotificationType;
  avatar: typeof Bell;
  avatarBg: string;
  avatarColor: string;
  badge: typeof Bell;
  badgeBg: string;
  title: React.ReactNode;
  time: string;
  actionUrl?: string;
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}/${month}`;
};

const TYPE_UI_MAP: Record<NotificationType, Omit<DropdownNotification, 'id' | 'status' | 'type' | 'title' | 'time' | 'actionUrl'>> = {
  'review-request': {
    avatar: User,
    avatarBg: 'bg-blue-100',
    avatarColor: 'text-blue-600',
    badge: MessageCircle,
    badgeBg: 'bg-blue-500',
  },
  approval: {
    avatar: User,
    avatarBg: 'bg-emerald-100',
    avatarColor: 'text-emerald-600',
    badge: CheckCircle,
    badgeBg: 'bg-emerald-500',
  },
  'capa-assignment': {
    avatar: AlertTriangle,
    avatarBg: 'bg-amber-100',
    avatarColor: 'text-amber-600',
    badge: UserPlus,
    badgeBg: 'bg-amber-500',
  },
  'training-completion': {
    avatar: User,
    avatarBg: 'bg-purple-100',
    avatarColor: 'text-purple-600',
    badge: ThumbsUp,
    badgeBg: 'bg-purple-500',
  },
  'document-update': {
    avatar: FileText,
    avatarBg: 'bg-cyan-100',
    avatarColor: 'text-cyan-600',
    badge: CheckCircle,
    badgeBg: 'bg-cyan-500',
  },
  'comment-reply': {
    avatar: User,
    avatarBg: 'bg-slate-100',
    avatarColor: 'text-slate-600',
    badge: Reply,
    badgeBg: 'bg-slate-500',
  },
  'deviation-assignment': {
    avatar: AlertTriangle,
    avatarBg: 'bg-red-100',
    avatarColor: 'text-red-600',
    badge: UserPlus,
    badgeBg: 'bg-red-500',
  },
  'change-control': {
    avatar: FileText,
    avatarBg: 'bg-indigo-100',
    avatarColor: 'text-indigo-600',
    badge: CheckCircle,
    badgeBg: 'bg-indigo-500',
  },
  system: {
    avatar: Bell,
    avatarBg: 'bg-slate-100',
    avatarColor: 'text-slate-600',
    badge: Bell,
    badgeBg: 'bg-slate-500',
  },
};

const NOTIFICATIONS: DropdownNotification[] = MOCK_NOTIFICATIONS.map((item) => ({
  id: item.id,
  status: item.status,
  type: item.type,
  ...TYPE_UI_MAP[item.type],
  title: <span className="font-medium">{item.description}</span>,
  time: formatTimeAgo(item.createdAt),
  actionUrl: item.actionUrl,
}));

const NotificationItem: React.FC<{
  notification: DropdownNotification;
  isLast: boolean;
  onClose: () => void;
}> = ({ notification, isLast, onClose }) => {
  const AvatarIcon = notification.avatar;
  const BadgeIcon = notification.badge;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => {
          onClose();
        }}
        className={cn(
          "w-full flex items-start gap-2.5 px-4 py-3 transition-all duration-200 text-left group",
          notification.status === 'unread' ? "bg-slate-50/80" : "bg-white",
          "hover:bg-slate-100",
          !isLast && "border-b border-slate-100"
        )}
      >
        <div className="relative shrink-0 mt-0.5">
          <div className={cn("h-9 w-9 rounded-full flex items-center justify-center transition-transform group-hover:scale-105", notification.avatarBg)}>
            <AvatarIcon className={cn("h-4.5 w-4.5", notification.avatarColor)} />
          </div>
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 h-4.5 w-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm",
            notification.badgeBg
          )}>
            <BadgeIcon className="h-2.5 w-2.5 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="text-[12px] text-slate-900 font-medium leading-tight line-clamp-2">
            {notification.title}
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200 group-hover:bg-emerald-50 group-hover:border-emerald-200 group-hover:text-emerald-700 transition-colors">
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                {notification.type === 'review-request' ? 'Review' :
                  notification.type === 'approval' ? 'Approval' :
                    notification.type === 'capa-assignment' ? 'CAPA' :
                      notification.type === 'training-completion' ? 'Training' :
                        'System'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">{notification.time}</p>
          </div>
        </div>

        {/* Unread indicator dot */}
        {notification.status === 'unread' && (
          <div className="shrink-0 mt-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
          </div>
        )}
      </button>
    </div>
  );
};

const NotificationSkeleton: React.FC<{ isLast?: boolean }> = ({ isLast }) => (
  <div className={cn("px-4 py-3 animate-pulse bg-white", !isLast && "border-b border-slate-100")}>
    <div className="w-full flex items-start gap-2.5">
      <div className="h-9 w-9 rounded-full bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-2.5 bg-slate-200 rounded w-3/4" />
        <div className="flex justify-between items-center text-left">
          <div className="h-4 bg-slate-200 rounded w-12" />
          <div className="h-2 bg-slate-200 rounded w-8" />
        </div>
      </div>
    </div>
  </div>
);

// Mobile Full-Screen Notifications Component
const MobileNotificationsScreen: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [mobileNotifications, setMobileNotifications] = useState(() => [...NOTIFICATIONS]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const counts = {
    all: mobileNotifications.length,
    me: mobileNotifications.filter(n => (n.type as any) !== 'system').length,
    system: mobileNotifications.filter(n => (n.type as any) === 'system').length,
  };

  const MOBILE_TABS: TabItem[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'me', label: 'For Me', count: counts.me },
    { id: 'system', label: 'System', count: counts.system },
  ];

  const filteredNotifications = mobileNotifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'me') return (n.type as any) !== 'system';
    if (activeTab === 'system') return (n.type as any) === 'system';
    return true;
  });

  const handleMarkAllRead = () => {
    setMobileNotifications(prev => prev.map(item => ({ ...item, status: 'read' })));
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-white md:hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex h-full flex-col"
      >
        {/* Top bar: Back + Logo */}
        <div className="grid grid-cols-[40px_1fr_40px] items-center border-b border-slate-200 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition-colors hover:bg-slate-100"
            aria-label="Back"
          >
            <IconChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex justify-center">
            <img src={logoNoBg} alt="Logo" className="h-8 w-auto object-contain" />
          </div>
          <div />
        </div>

        {/* Title + Action */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
            onClick={handleMarkAllRead}
          >
            <CheckCheck className="h-4 w-4 text-emerald-600" />
            <span>Mark All as Read</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-100 px-4 py-3">
          <TabNav
            tabs={MOBILE_TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="pill"
            layoutId="mobileNotificationTabIndicator"
            className="w-full bg-slate-100/80"
          />
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-base font-medium text-slate-900">No notifications</p>
              <p className="text-sm text-slate-500 mt-1">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                isLast={index === filteredNotifications.length - 1}
                onClose={onClose}
              />
            ))
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

// Desktop Dropdown Component
const DesktopDropdown: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLDivElement>;
  onViewAll: () => void;
  onOpenSettings: () => void;
  onTogglePinned: () => void;
}> = ({ isOpen, onClose, buttonRef, onViewAll, onOpenSettings, onTogglePinned }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleMarkAllRead = () => {
    setIsConfirmOpen(true);
  };

  const onConfirmMarkRead = () => {
    console.log("Marking all as read...");
    setIsConfirmOpen(false);
  };

  const counts = {
    all: NOTIFICATIONS.length,
    me: NOTIFICATIONS.filter(n => n.type !== 'system' as any).length,
    system: NOTIFICATIONS.filter(n => n.type === 'system' as any).length,
  };

  const DROPDOWN_TABS: TabItem[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'me', label: 'For Me', count: counts.me },
    { id: 'system', label: 'System', count: counts.system },
  ];

  const filteredNotifications = NOTIFICATIONS.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'me') return (n.type as any) !== 'system';
    if (activeTab === 'system') return (n.type as any) === 'system';
    return true;
  });

  useEffect(() => {
    if (!isOpen || isConfirmOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current && !buttonRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose, buttonRef, isConfirmOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-0 bg-transparent pointer-events-auto"
        onClick={() => {
          if (!isConfirmOpen) onClose();
        }}
        aria-hidden="true"
      />

      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, scale: 0.95, y: -10, transformOrigin: 'top right' }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.25 }}
        className="fixed w-[360px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-10 overflow-hidden pointer-events-auto flex flex-col"
        style={{
          top: `${buttonRef.current?.getBoundingClientRect().bottom! + window.scrollY + 8}px`,
          right: `${window.innerWidth - buttonRef.current?.getBoundingClientRect().right! - window.scrollX}px`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Notifications</h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-emerald-600 transition-colors"
              onClick={onOpenSettings}
              title="Notification settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-emerald-600 transition-colors"
              onClick={onTogglePinned}
              title="Pin notifications"
            >
              <Pin className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-2">
          <TabNav
            tabs={DROPDOWN_TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="pill"
            layoutId="notificationTabIndicator"
            className="w-full bg-slate-100/80"
          />
        </div>

        {/* Notifications List */}
        <div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 bg-white min-h-[300px]">
          {filteredNotifications.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-slate-400">No notifications here</p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                isLast={index === filteredNotifications.length - 1}
                onClose={onClose}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-white shrink-0">
          <button
            type="button"
            className="text-[13px] font-semibold text-slate-900 hover:text-emerald-600 underline underline-offset-4 decoration-slate-300 hover:decoration-emerald-500 transition-colors"
            onClick={handleMarkAllRead}
          >
            Mark All as Read
          </button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => {
              onViewAll();
              onClose();
            }}
            className="h-9 px-4 rounded-lg text-xs font-medium border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all font-semibold"
          >
            Open Notification Center
          </Button>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AlertModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onConfirmMarkRead}
        title="Mark All as Read"
        description="Are you sure you want to mark all notifications as read? This cannot be undone."
        type="confirm"
        confirmText="Yes, Mark All"
      />
    </div>,
    document.body
  );
};

const DesktopNotificationsPanelContent: React.FC<{
  onOpenSettings: () => void;
  onTogglePinned: () => void;
}> = ({ onOpenSettings, onTogglePinned }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const counts = {
    all: NOTIFICATIONS.length,
    me: NOTIFICATIONS.filter(n => n.type !== 'system' as any).length,
    system: NOTIFICATIONS.filter(n => n.type === 'system' as any).length,
  };

  const tabs: TabItem[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'me', label: 'For Me', count: counts.me },
    { id: 'system', label: 'System', count: counts.system },
  ];

  const filteredNotifications = NOTIFICATIONS.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'me') return (n.type as any) !== 'system';
    if (activeTab === 'system') return (n.type as any) === 'system';
    return true;
  });

  return (
    <>
      <div 
        className="flex items-center justify-between border-b border-slate-200 px-5"
        style={{
          minHeight: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <div>
          <div className="mb-1 h-1 w-10 rounded-full bg-emerald-400" />
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Notifications</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-emerald-600"
            onClick={onOpenSettings}
            title="Notification settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-full p-2 text-emerald-600 transition-colors hover:bg-emerald-50"
            onClick={onTogglePinned}
            title="Unpin notifications"
          >
            <Pin className="h-4 w-4 fill-current" />
          </button>
        </div>
      </div>

      <div className="border-b border-slate-100 px-4 py-3">
        <TabNav
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="pill"
          layoutId="pinnedNotificationTabIndicator"
          className="w-full bg-slate-100/80"
        />
      </div>

      <div className="flex-1 overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 scroll-smooth overscroll-contain">
        {filteredNotifications.length === 0 ? (
          <div className="flex h-full min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Bell className="h-5 w-5 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">You have no notifications</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              New alerts will appear here when something needs your attention.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification, index) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              isLast={index === filteredNotifications.length - 1}
              onClose={() => undefined}
            />
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 bg-white px-5 py-2.5 shrink-0">
        <button
          type="button"
          className="text-[13px] font-semibold text-slate-900 transition-colors hover:text-emerald-600 underline underline-offset-4 decoration-slate-300 hover:decoration-emerald-500"
          onClick={() => setIsConfirmOpen(true)}
        >
          Mark All as Read
        </button>
      </div>

      <AlertModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => setIsConfirmOpen(false)}
        title="Mark All as Read"
        description="Are you sure you want to mark all notifications as read? This cannot be undone."
        type="confirm"
        confirmText="Yes, Mark All"
      />
    </>
  );
};

export const PinnedNotificationsPanel: React.FC<{
  onTogglePinned: () => void;
}> = ({ onTogglePinned }) => {
  const navigate = useNavigate();
  const [isNavigatingSettings, setIsNavigatingSettings] = useState(false);

  const handleOpenSettings = () => {
    setIsNavigatingSettings(true);
    setTimeout(() => {
      navigate(`${ROUTES.SETTINGS.CONFIGURATION}?tab=notification`);
      setTimeout(() => {
        setIsNavigatingSettings(false);
      }, 800);
    }, 250);
  };

  return (
    <motion.aside
      className="hidden lg:flex h-full shrink-0 border-l border-slate-200 bg-white shadow-[-12px_0_32px_-24px_rgba(15,23,42,0.35)] overflow-hidden"
      initial={{ width: 0 }}
      animate={{ width: 380 }}
      exit={{ width: 0 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
    >
      <div className="flex h-full w-[380px] shrink-0 flex-col bg-white">
        <DesktopNotificationsPanelContent
          onOpenSettings={handleOpenSettings}
          onTogglePinned={onTogglePinned}
        />
      </div>
      {isNavigatingSettings && <FullPageLoading text="Loading..." />}
    </motion.aside>
  );
};

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ isOpen, onClose, onToggle, onTogglePinnedDesktop }) => {
  const notificationRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isNavigatingSettings, setIsNavigatingSettings] = useState(false);

  const handleViewAllNotifications = () => {
    navigate(ROUTES.NOTIFICATIONS);
  };

  const handleOpenSettings = () => {
    setIsNavigatingSettings(true);
    onClose();
    setTimeout(() => {
      navigate(`${ROUTES.SETTINGS.CONFIGURATION}?tab=notification`);
      setTimeout(() => {
        setIsNavigatingSettings(false);
      }, 800);
    }, 250);
  };

  return (
    <>
      {/* Notifications Button */}
      <div ref={notificationRef} className="inline-flex">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="relative text-slate-600 hover:bg-slate-100 hover:text-emerald-600 transition-colors"
        >
          <motion.div
            animate={isOpen ? { rotate: [0, -20, 20, -15, 15, -10, 10, 0] } : { rotate: 0 }}
            transition={{ duration: 0.5 }}
            className="origin-top flex items-center justify-center"
          >
            <Bell className="h-5 w-5 md:h-6 md:w-6" />
          </motion.div>
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white shadow-sm" />
        </Button>
      </div>

      {/* Mobile: Full-Screen Notifications */}
      {isMobile && (
        <AnimatePresence>
          {isOpen && <MobileNotificationsScreen onClose={onClose} />}
        </AnimatePresence>
      )}

      {/* Desktop: Dropdown */}
      {!isMobile && (
        <AnimatePresence>
          {isOpen && (
            <DesktopDropdown
              isOpen={isOpen}
              onClose={onClose}
              buttonRef={notificationRef as React.RefObject<HTMLDivElement>}
              onViewAll={handleViewAllNotifications}
              onOpenSettings={handleOpenSettings}
              onTogglePinned={() => {
                onClose();
                onTogglePinnedDesktop?.();
              }}
            />
          )}
        </AnimatePresence>
      )}

      {isNavigatingSettings && <FullPageLoading text="Loading..." />}
    </>
  );
};
