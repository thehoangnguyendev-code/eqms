/**
 * Notification Types and Interfaces
 */

export type NotificationType = 
  | 'review-request'
  | 'approval'
  | 'capa-assignment'
  | 'training-completion'
  | 'document-update'
  | 'comment-reply'
  | 'deviation-assignment'
  | 'change-control'
  | 'system';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export type NotificationStatus = 'unread' | 'read';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  module: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  createdAt: string;
  readAt?: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  relatedItem?: {
    id: string;
    type: string;
    code: string;
    title: string;
  };
  actionUrl?: string;
}

export type NotificationFilterTab = 'all' | 'unread' | 'read';

export interface NotificationFilters {
  search: string;
  type: NotificationType | 'all';
  module: string;
  priority: NotificationPriority | 'all';
  dateFrom: string;
  dateTo: string;
}
