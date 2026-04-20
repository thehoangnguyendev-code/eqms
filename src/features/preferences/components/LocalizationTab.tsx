import React, { useState } from 'react';
import { Globe, Calendar, Clock } from 'lucide-react';
import { Select } from '@/components/ui/select/Select';

export const LocalizationTab: React.FC = () => {
    const [language, setLanguage] = useState('vi');
    const [dateFormat, setDateFormat] = useState('DD/MM/YYYY_HH:MM:SS');
    const [timeFormat, setTimeFormat] = useState('24h');

    const getDatePreview = (format: string): string => {
        const baseDate = '26/03/2026';
        const baseTime = '09:00:01';
        const shortTime = '09:00';
        const relativeTime = '5 min ago';

        switch (format) {
            case 'DD/MM/YYYY_HH:MM:SS':
                return `${baseDate} ${baseTime}`;
            case 'DD/MM/YYYY_HH:MM:SS_relative':
                return `${baseDate} ${baseTime} ${relativeTime}`;
            case 'DD/MM/YYYY_HH:MM_relative':
                return `${baseDate} ${shortTime} ${relativeTime}`;
            case 'DD/MM/YYYY_HH:MM':
                return `${baseDate} ${shortTime}`;
            case 'DD/MM/YYYY':
                return baseDate;
            case 'relative_only':
                return relativeTime;
            default:
                return baseDate;
        }
    };

    const languages = [
        { value: 'vi', label: 'Tiếng Việt (Vietnamese)' },
        { value: 'en', label: 'English (US)' },
    ];

    const dateFormats = [
        { value: 'DD/MM/YYYY_HH:MM:SS', label: 'DD/MM/YYYY 09:00:01' },
        { value: 'DD/MM/YYYY_HH:MM:SS_relative', label: 'DD/MM/YYYY 09:00:01 5 min ago' },
        { value: 'DD/MM/YYYY_HH:MM_relative', label: 'DD/MM/YYYY 09:00 5 min ago' },
        { value: 'DD/MM/YYYY_HH:MM', label: 'DD/MM/YYYY 09:00' },
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
        { value: 'relative_only', label: '5 min ago' },
    ];

    const timeFormats = [
        { value: '12h', label: '12-hour (AM/PM)' },
        { value: '24h', label: '24-hour' },
    ];

    return (
        <div className="p-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-8">
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-emerald-600" />
                        <h3 className="text-sm font-semibold text-slate-900">Platform Language</h3>
                    </div>
                    <p className="text-xs text-slate-500">Select your preferred language for the interface.</p>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-slate-900">Interface Language</p>
                            <p className="text-xs text-slate-500">Change the system display language.</p>
                        </div>
                        <div className="w-full sm:w-80">
                            <Select
                                options={languages}
                                value={language}
                                onChange={(val) => setLanguage(val as string)}
                            />
                        </div>
                    </div>
                </section>

                <div className="h-px bg-slate-200" />

                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        <h3 className="text-sm font-semibold text-slate-900">Regional Formats</h3>
                    </div>
                    <p className="text-xs text-slate-500">How dates and times are displayed to you.</p>

                    <div className="space-y-3">
                        <div className="flex flex-col gap-3 py-2 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100">
                                    <Calendar className="h-4 w-4 text-slate-600" />
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Date Format</p>
                                    <p className="text-xs text-slate-500">Preview: {getDatePreview(dateFormat)}</p>
                                </div>
                            </div>
                            <div className="w-full md:w-80">
                                <Select
                                    options={dateFormats}
                                    value={dateFormat}
                                    onChange={(val) => setDateFormat(val as string)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 py-2 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100">
                                    <Clock className="h-4 w-4 text-slate-600" />
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Time Format</p>
                                    <p className="text-xs text-slate-500">Preview: 16:33</p>
                                </div>
                            </div>
                            <div className="w-full md:w-80">
                                <Select
                                    options={timeFormats}
                                    value={timeFormat}
                                    onChange={(val) => setTimeFormat(val as string)}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

