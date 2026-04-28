import React, { useState, useRef } from 'react';
import { Mail, Phone, MessageSquare, Send, CheckCircle2, Clock, Globe, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { cn } from '@/components/ui/utils';

import { Select } from '@/components/ui/select/Select';
import { IconMessage } from '@tabler/icons-react';

// --- Constants ---
const PRIORITY_OPTIONS = [
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' }
];

// --- Internal Components ---
const CardSection: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}> = ({ title, icon, children, className }) => (
    <div className={cn("bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full", className)}>
        <div className="flex items-center gap-2.5 px-4 md:px-5 py-4 border-b border-slate-100">
            <span className="text-emerald-600">{icon}</span>
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        </div>
        <div className="p-4 md:p-5">{children}</div>
    </div>
);

export const ContactSupport: React.FC = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        priority: 'Medium',
        attachments: [] as string[]
    });
    const [errors, setErrors] = useState<{ subject?: string; message?: string }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setFormData(prev => ({
                            ...prev,
                            attachments: [...prev.attachments, reader.result as string]
                        }));
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setFormData(prev => ({
                            ...prev,
                            attachments: [...prev.attachments, reader.result as string]
                        }));
                    };
                    reader.readAsDataURL(blob);
                }
            }
        }
    };

    const removeAttachment = (index: number) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newErrors: { subject?: string; message?: string } = {};
        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        }
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitted(true);
        // Reset after 3 seconds
        setTimeout(() => {
            setIsSubmitted(false);
            setFormData({ subject: '', message: '', priority: 'Medium', attachments: [] });
            setErrors({});
        }, 3000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-10">
            {/* Contact Form */}
            <div className="lg:col-span-12 xl:col-span-12">
                <CardSection
                    title="Get in Touch"
                    icon={<IconMessage className="h-4 w-4" />}
                >
                    {isSubmitted ? (
                        <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Message Sent!</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                Thank you for reaching out. Our support team will get back to you within 24 hours.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs sm:text-sm font-medium text-slate-700">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Briefly describe your issue..."
                                        value={formData.subject}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, subject: e.target.value }));
                                            if (errors.subject) setErrors(prev => ({ ...prev, subject: undefined }));
                                        }}
                                        className={cn(
                                            "w-full px-4 py-2 text-sm bg-slate-50 border rounded-lg focus:outline-none focus:ring-1 transition-all font-medium h-9",
                                            errors.subject ? "border-red-300 focus:ring-red-500" : "border-slate-200 focus:ring-emerald-500"
                                        )}
                                    />
                                    {errors.subject && <p className="text-xs text-red-500 font-medium">{errors.subject}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs sm:text-sm font-medium text-slate-700">
                                        Priority Level
                                    </label>
                                    <Select
                                        value={formData.priority}
                                        onChange={(val) => setFormData(prev => ({ ...prev, priority: val }))}
                                        options={PRIORITY_OPTIONS}
                                        placeholder="Select priority..."
                                        enableSearch={false}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs sm:text-sm font-medium text-slate-700">
                                    Detailed Message <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <textarea
                                        rows={5}
                                        placeholder="Tell us more about the problem you're experiencing... (You can also paste images here)"
                                        value={formData.message}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, message: e.target.value }));
                                            if (errors.message) setErrors(prev => ({ ...prev, message: undefined }));
                                        }}
                                        onPaste={handlePaste}
                                        className={cn(
                                            "w-full px-4 py-3 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-1 transition-all resize-none font-medium h-48 pb-12",
                                            errors.message ? "border-red-300 focus:ring-red-500" : "border-slate-200 focus:ring-emerald-500"
                                        )}
                                    />

                                    {/* Attachment Actions */}
                                    <div className="absolute bottom-4 left-3 flex items-center gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            id="image-upload"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex items-center gap-1.5 h-8 md:h-8 text-[11px] text-slate-600 hover:text-emerald-600 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50 shadow-sm transition-all"
                                        >
                                            <ImageIcon className="h-3.5 w-3.5" />
                                            Attach Image
                                        </Button>
                                        {formData.attachments.length > 0 && (
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase">
                                                {formData.attachments.length} attached
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Previews */}
                                {formData.attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                        {formData.attachments.map((src, index) => (
                                            <div key={index} className="relative group/item w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                                                <img src={src} alt={`Attachment ${index + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttachment(index)}
                                                    className="absolute top-1 right-1 p-1 bg-white/90 text-red-500 rounded-full shadow-sm opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-red-50"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {errors.message && <p className="text-xs text-red-500 font-medium">{errors.message}</p>}
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    variant="default"
                                    size="sm"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Message
                                </Button>
                            </div>
                        </form>
                    )}
                </CardSection>
            </div>

            {/* Support Info Grid */}
            <div className="lg:col-span-12 xl:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <CardSection
                    title="Support Hours"
                    icon={<Clock className="h-4 w-4" />}
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm py-3 border-b border-slate-100">
                            <span className="text-slate-500 font-medium">Monday — Friday</span>
                            <span className="font-bold text-slate-800 tracking-tight bg-slate-50 px-3 py-1 rounded-full border border-slate-100">08:00 – 18:00 (GMT+7)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm py-3 border-b border-slate-100">
                            <span className="text-slate-500 font-medium">Saturday</span>
                            <span className="font-bold text-slate-800 tracking-tight bg-slate-50 px-3 py-1 rounded-full border border-slate-100">09:00 – 12:00 (GMT+7)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm py-3">
                            <span className="text-slate-500 font-medium">Sunday</span>
                            <span className="font-bold text-slate-400 tracking-tight px-3 py-1">Closed</span>
                        </div>
                    </div>
                </CardSection>

                <CardSection
                    title="Alternative Support Channels"
                    icon={<Globe className="h-4 w-4" />}
                >
                    <div className="space-y-3">
                        <a href="mailto:support@ntp-eqms.com" className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group">
                            <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Email Support</p>
                                <p className="text-xs text-slate-500 font-medium">support@ntp-eqms.com</p>
                            </div>
                        </a>

                        <a href="tel:+84123456789" className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group">
                            <div className="w-11 h-11 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Phone Support</p>
                                <p className="text-xs text-slate-500 font-medium">(+84) 123 456 789</p>
                            </div>
                        </a>

                        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                            <div className="w-11 h-11 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                                <Globe className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Knowledge Base</p>
                                <p className="text-xs text-slate-500 font-medium">Access detailed guides and help articles anytime.</p>
                            </div>
                        </div>
                    </div>
                </CardSection>
            </div>
        </div>
    );
};

