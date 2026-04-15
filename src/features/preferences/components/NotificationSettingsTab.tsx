import React, { useState } from 'react';
import { Bell, Mail, Smartphone, MousePointer2 } from 'lucide-react';
import { cn } from '@/components/ui/utils';

const SettingsCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}> = ({ title, icon, children }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 uppercase tracking-wider">
            <span className="text-emerald-600">{icon}</span>
            <h3 className="text-xs font-bold text-slate-900">{title}</h3>
        </div>
        <div className="p-5">{children}</div>
    </div>
);

export const NotificationSettingsTab: React.FC = () => {
    const [notifications, setNotifications] = useState({
        email_new_task: true,
        email_training_reminder: true,
        inapp_new_task: true,
        inapp_document_update: true,
    });

    const toggleNotification = (id: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="p-1 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Email Notifications */}
            <SettingsCard title="Email Notifications" icon={<Mail className="h-4 w-4" />}>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-slate-900">New Task Assigned</p>
                            <p className="text-xs text-slate-500">Receive an email when you are assigned a new task in DMS/Deviation/CAPA.</p>
                        </div>
                        <button
                            onClick={() => toggleNotification('email_new_task')}
                            className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                                notifications.email_new_task ? "bg-emerald-500" : "bg-slate-300",
                            )}
                            role="switch"
                        >
                            <span
                                className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
                                    notifications.email_new_task ? "translate-x-6" : "translate-x-1",
                                )}
                            />
                        </button>
                    </div>

                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-medium text-slate-900">Training Reminders</p>
                            <p className="text-xs text-slate-500">Receive an email before training deadlines and license renewals.</p>
                        </div>
                        <button
                            onClick={() => toggleNotification('email_training_reminder')}
                            className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                                notifications.email_training_reminder ? "bg-emerald-500" : "bg-slate-300",
                            )}
                            role="switch"
                        >
                            <span
                                className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
                                    notifications.email_training_reminder ? "translate-x-6" : "translate-x-1",
                                )}
                            />
                        </button>
                    </div>
                </div>
            </SettingsCard>

            {/* In-App Notifications */}
            <SettingsCard title="In-App Notifications" icon={<Bell className="h-4 w-4" />}>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shadow-sm">
                                <MousePointer2 className="h-4 w-4 text-slate-600" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium text-slate-900">New Task Assigned</p>
                                <p className="text-xs text-slate-500">Show a popup and update notification center for new tasks.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => toggleNotification('inapp_new_task')}
                            className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                                notifications.inapp_new_task ? "bg-emerald-500" : "bg-slate-300",
                            )}
                            role="switch"
                        >
                            <span
                                className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
                                    notifications.inapp_new_task ? "translate-x-6" : "translate-x-1",
                                )}
                            />
                        </button>
                    </div>

                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shadow-sm">
                                <Smartphone className="h-4 w-4 text-slate-600" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-medium text-slate-900">Document Updates</p>
                                <p className="text-xs text-slate-500">Notify when a document you follow is updated or archived.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => toggleNotification('inapp_document_update')}
                            className={cn(
                                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                                notifications.inapp_document_update ? "bg-emerald-500" : "bg-slate-300",
                            )}
                            role="switch"
                        >
                            <span
                                className={cn(
                                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
                                    notifications.inapp_document_update ? "translate-x-6" : "translate-x-1",
                                )}
                            />
                        </button>
                    </div>
                </div>
            </SettingsCard>
        </div>
    );
};

