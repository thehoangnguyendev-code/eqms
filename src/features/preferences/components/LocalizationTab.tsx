import React, { useState } from 'react';
import { Globe, Calendar, Clock } from 'lucide-react';
import { Select } from '@/components/ui/select/Select';

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

export const LocalizationTab: React.FC = () => {
    const [language, setLanguage] = useState('vi');
    const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
    const [timeFormat, setTimeFormat] = useState('24h');

    const languages = [
        { value: 'vi', label: 'Tiếng Việt (Vietnamese)' },
        { value: 'en', label: 'English (US)' },
    ];

    const dateFormats = [
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
    ];

    const timeFormats = [
        { value: '12h', label: '12-hour (AM/PM)' },
        { value: '24h', label: '24-hour' },
    ];

    return (
        <div className="p-1 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Language Selection */}
            <SettingsCard title="Platform Language" icon={<Globe className="h-4 w-4" />}>
                <div>
                    <p className="text-xs text-slate-500 mb-4">Select your preferred language for the interface.</p>
                    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">Interface Language</p>
                            <p className="text-xs text-slate-500 mt-0.5">Change the system display language.</p>
                        </div>
                        <div className="w-full sm:w-64">
                            <Select
                                options={languages}
                                value={language}
                                onChange={(val) => setLanguage(val as string)}
                            />
                        </div>
                    </div>
                </div>
            </SettingsCard>

            {/* DateTime Selection */}
            <SettingsCard title="Regional Formats" icon={<Calendar className="h-4 w-4" />}>
                <div>
                    <p className="text-xs text-slate-500 mb-4">How dates and times are displayed to you.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date Format */}
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <Calendar className="h-4 w-4 text-slate-600" />
                                </div>
                                <p className="text-sm font-medium text-slate-900">Date Format</p>
                            </div>
                            <Select
                                options={dateFormats}
                                value={dateFormat}
                                onChange={(val) => setDateFormat(val as string)}
                            />
                            <p className="text-[10px] text-slate-500">Today: 26/03/2026</p>
                        </div>

                        {/* Time Format */}
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-slate-600" />
                                </div>
                                <p className="text-sm font-medium text-slate-900">Time Format</p>
                            </div>
                            <Select
                                options={timeFormats}
                                value={timeFormat}
                                onChange={(val) => setTimeFormat(val as string)}
                            />
                            <p className="text-[10px] text-slate-500">Current Time: 16:33</p>
                        </div>
                    </div>
                </div>
            </SettingsCard>
        </div>
    );
};

