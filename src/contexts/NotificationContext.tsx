/**
 * Notification Context
 * Provides notification state and methods throughout the app
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Notification } from '@/types';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev]);

      // Auto-dismiss after 5 seconds for success/info notifications
      if (notification.type === 'success' || notification.type === 'info') {
        setTimeout(() => {
          removeNotification(newNotification.id);
        }, 5000);
      }
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  const value: NotificationContextType = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    unreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Convenience method for toast-like notifications (deprecated: use @/components/ui/toast instead)
export const useNotificationToast = () => {
  const { addNotification } = useNotifications();

  return {
    success: (message: string, title = 'Success') =>
      addNotification({ type: 'success', title, message }),
    error: (message: string, title = 'Error') =>
      addNotification({ type: 'error', title, message }),
    warning: (message: string, title = 'Warning') =>
      addNotification({ type: 'warning', title, message }),
    info: (message: string, title = 'Info') =>
      addNotification({ type: 'info', title, message }),
  };
};
