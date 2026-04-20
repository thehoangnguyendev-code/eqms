import React from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Select } from '@/components/ui/select/Select';

export const AppearanceTab: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const themeOptions = [
        { value: 'light', label: 'Light - Bright and clean interface' },
        { value: 'dark', label: 'Dark - Easy on the eyes in low light' },
        { value: 'auto', label: 'System - Follow your system settings' },
    ];

    return (
        <div className="p-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-8">
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4 text-emerald-600" />
                        <h3 className="text-sm font-semibold text-slate-900">Interface Theme</h3>
                    </div>
                    <p className="text-xs text-slate-500">Choose how the application looks for you.</p>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-slate-900">Select Theme</p>
                            <p className="text-xs text-slate-500">Change the visual appearance.</p>
                        </div>
                        <div className="w-full sm:w-80">
                            <Select
                                options={themeOptions}
                                value={theme}
                                onChange={(val) => setTheme(val as any)}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
