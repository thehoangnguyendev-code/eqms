import React from 'react';
import { Moon, Sun, Monitor, LayoutPanelTop, Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/components/ui/utils';

const SettingsCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 uppercase tracking-wider">
      <span className="text-emerald-600">{icon}</span>
      <h3 className="text-xs font-bold text-slate-800">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

export const AppearanceTab: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const themes = [
        { id: 'light', label: 'Light', icon: Sun, description: 'Bright and clean interface' },
        { id: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes in low light' },
        { id: 'auto', label: 'System', icon: Monitor, description: 'Follow your system settings' },
    ];

    return (
        <div className="p-1 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Theme Selection */}
            <SettingsCard title="Interface Theme" icon={<Palette className="h-4 w-4" />}>
                <div>
                    <p className="text-xs text-slate-500 mb-4">Choose how the application looks for you.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {themes.map((t) => {
                            const Icon = t.icon;
                            const isActive = theme === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id as any)}
                                    className={cn(
                                        "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-center group",
                                        isActive
                                            ? "border-emerald-500 bg-emerald-50/30"
                                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                                        isActive ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                                    )}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className={cn("text-sm font-bold", isActive ? "text-emerald-700" : "text-slate-700")}>
                                            {t.label}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{t.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </SettingsCard>

            {/* Layout Preferences */}
            <SettingsCard title="Layout Density" icon={<Monitor className="h-4 w-4" />}>
                <div>
                    <p className="text-xs text-slate-500 mb-4">Adjust the information density of the interface.</p>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm font-bold">
                               <LayoutPanelTop className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900">Compact Mode</p>
                                <p className="text-xs text-slate-500">Show more content with less padding.</p>
                            </div>
                        </div>
                       <button
                            className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                            false ? "bg-emerald-500" : "bg-slate-300",
                            )}
                            role="switch"
                        >
                            <span
                            className={cn(
                                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200",
                                false ? "translate-x-6" : "translate-x-1",
                            )}
                            />
                        </button>
                    </div>
                </div>
            </SettingsCard>
        </div>
    );
};
