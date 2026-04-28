import React, { useState } from 'react';
import { Bell, Mail, MonitorSmartphone, BellRing, ClipboardSignature, Plus, X, Building2 } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { Select } from '@/components/ui/select/Select';
import { IconBook } from '@tabler/icons-react';

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
    <button
        type="button"
        onClick={onChange}
        className={cn(
            'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
            checked ? 'bg-emerald-500' : 'bg-slate-300'
        )}
        role="switch"
        aria-checked={checked}
    >
        <span className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
            checked ? 'translate-x-6' : 'translate-x-1'
        )} />
    </button>
);

const DEPARTMENTS = ['QA', 'Production', 'R&D', 'Regulatory', 'Warehouse', 'Engineering', 'HR'];

export const NotificationSettingsTab: React.FC = () => {
    // Channels
    const [channelEmail, setChannelEmail] = useState(true);
    const [channelInApp, setChannelInApp] = useState(true);
    const [channelPush, setChannelPush] = useState(false);
    const [secondaryEmail, setSecondaryEmail] = useState('');
    const [showSecondaryEmail, setShowSecondaryEmail] = useState(false);

    // Event: Training Due
    const [trainingEnabled, setTrainingEnabled] = useState(true);
    const [trainingRemindDays, setTrainingRemindDays] = useState('7');

    // Event: Signature Request
    const [signatureEnabled, setSignatureEnabled] = useState(true);
    const [signatureMode, setSignatureMode] = useState<'immediate' | 'digest'>('immediate');

    // Event: SOP Changes
    const [sopEnabled, setSopEnabled] = useState(true);
    const [sopDepartments, setSopDepartments] = useState<string[]>(['QA']);

    const toggleDepartment = (dept: string) => {
        setSopDepartments(prev =>
            prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
        );
    };

    const trainingDaysOptions = [
        { value: '3', label: '3 days before' },
        { value: '7', label: '7 days before' },
        { value: '15', label: '15 days before' },
    ];

    return (
        <div className="p-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-8">

                {/* Section 1: Notification Channels */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <BellRing className="h-4 w-4 text-emerald-600" />
                        <h3 className="text-sm font-semibold text-slate-900">Notification Channels</h3>
                    </div>
                    <p className="text-xs text-slate-500">Choose how you want to receive notifications.</p>

                    <div className="space-y-1">
                        {/* Email */}
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
                                    <Mail className="h-4 w-4 text-slate-600" />
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Email</p>
                                    <p className="text-xs text-slate-500">Send to your account email: <span className="font-medium text-slate-700">admin@eqms.com</span></p>
                                </div>
                            </div>
                            <Toggle checked={channelEmail} onChange={() => setChannelEmail(p => !p)} />
                        </div>

                        {channelEmail && (
                            <div className="ml-11 pb-2">
                                {showSecondaryEmail ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="email"
                                            value={secondaryEmail}
                                            onChange={e => setSecondaryEmail(e.target.value)}
                                            placeholder="Additional email address"
                                            className="block h-9 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-colors placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { setShowSecondaryEmail(false); setSecondaryEmail(''); }}
                                            className="text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setShowSecondaryEmail(true)}
                                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Add secondary email
                                    </button>
                                )}
                            </div>
                        )}

                        {/* In-App */}
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
                                    <Bell className="h-4 w-4 text-slate-600" />
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">In-App Notifications</p>
                                    <p className="text-xs text-slate-500">Show alerts and badge count inside the application.</p>
                                </div>
                            </div>
                            <Toggle checked={channelInApp} onChange={() => setChannelInApp(p => !p)} />
                        </div>

                        {/* Push */}
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
                                    <MonitorSmartphone className="h-4 w-4 text-slate-600" />
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Browser Push Notifications</p>
                                    <p className="text-xs text-slate-500">Receive push alerts even when the tab is not active.</p>
                                </div>
                            </div>
                            <Toggle checked={channelPush} onChange={() => setChannelPush(p => !p)} />
                        </div>
                    </div>
                </section>

                <div className="h-px bg-slate-200" />

                {/* Section 2: Event Types */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-emerald-600" />
                        <h3 className="text-sm font-semibold text-slate-900">Event Types</h3>
                    </div>
                    <p className="text-xs text-slate-500">Configure how each type of event notifies you.</p>

                    <div className="space-y-1">
                        {/* Training Due */}
                        <div className="py-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
                                        <IconBook className="h-4 w-4 text-slate-600" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Training Due</p>
                                        <p className="text-xs text-slate-500">Remind before training deadlines and license renewals.</p>
                                    </div>
                                </div>
                                <Toggle checked={trainingEnabled} onChange={() => setTrainingEnabled(p => !p)} />
                            </div>
                            {trainingEnabled && (
                                <div className="mt-3 ml-11 flex items-center gap-3">
                                    <p className="text-xs text-slate-500 shrink-0">Remind me</p>
                                    <div className="w-48">
                                        <Select
                                            options={trainingDaysOptions}
                                            value={trainingRemindDays}
                                            onChange={val => setTrainingRemindDays(val as string)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-slate-100" />

                        {/* Signature Request */}
                        <div className="py-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
                                        <ClipboardSignature className="h-4 w-4 text-slate-600" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">Signature Request</p>
                                        <p className="text-xs text-slate-500">Notify when an electronic signature is required from you.</p>
                                    </div>
                                </div>
                                <Toggle checked={signatureEnabled} onChange={() => setSignatureEnabled(p => !p)} />
                            </div>
                            {signatureEnabled && (
                                <div className="mt-3 ml-11 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSignatureMode('immediate')}
                                        className={cn(
                                            'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                                            signatureMode === 'immediate'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                        )}
                                    >
                                        Immediate
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSignatureMode('digest')}
                                        className={cn(
                                            'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                                            signatureMode === 'digest'
                                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                        )}
                                    >
                                        Daily Digest
                                    </button>
                                    <span className="text-xs text-slate-400">
                                        {signatureMode === 'digest' ? '— sent at end of day' : '— sent instantly'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-slate-100" />

                        {/* SOP Changes */}
                        <div className="py-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
                                        <Building2 className="h-4 w-4 text-slate-600" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">SOP Changes</p>
                                        <p className="text-xs text-slate-500">Notify when a Standard Operating Procedure is updated or superseded.</p>
                                    </div>
                                </div>
                                <Toggle checked={sopEnabled} onChange={() => setSopEnabled(p => !p)} />
                            </div>
                            {sopEnabled && (
                                <div className="mt-3 ml-11 space-y-2">
                                    <p className="text-xs text-slate-500">Only notify for departments:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {DEPARTMENTS.map(dept => (
                                            <button
                                                key={dept}
                                                type="button"
                                                onClick={() => toggleDepartment(dept)}
                                                className={cn(
                                                    'rounded-md border px-3 py-1 text-xs font-medium transition-colors',
                                                    sopDepartments.includes(dept)
                                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                                                )}
                                            >
                                                {dept}
                                            </button>
                                        ))}
                                    </div>
                                    {sopDepartments.length === 0 && (
                                        <p className="text-xs text-amber-600">No departments selected — you won't receive SOP change notifications.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

