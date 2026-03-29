import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Send, CheckCircle2, Clock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { cn } from '@/components/ui/utils';

export const ContactSupport: React.FC = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        priority: 'Medium'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        // Reset after 3 seconds
        setTimeout(() => setIsSubmitted(false), 3000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Contact Form */}
            <div className="lg:col-span-12 xl:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
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
                    <>
                        <div className="mb-6 flex items-center gap-2">
                            <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Get in Touch</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Subject</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Briefly describe your issue..."
                                    value={formData.subject}
                                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Priority</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Low', 'Medium', 'High'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                                            className={cn(
                                                "py-2 px-3 rounded-xl border text-xs font-medium transition-all duration-200",
                                                formData.priority === p
                                                    ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                            )}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Message</label>
                                <textarea
                                    required
                                    rows={5}
                                    placeholder="Tell us more about the problem you're experiencing..."
                                    value={formData.message}
                                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                                />
                            </div>

                            <Button type="submit" className="w-full gap-2 shadow-sm">
                                <Send className="h-4 w-4" />
                                Send Message
                            </Button>
                        </form>
                    </>
                )}
            </div>

            {/* Support Info */}
            <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group">
                    {/* Decorative background element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500" />

                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-emerald-400" />
                        Support Hours
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm py-2 border-b border-white/10">
                            <span className="text-slate-400">Monday — Friday</span>
                            <span className="font-semibold text-emerald-400  tracking-tight">08:00 – 18:00 (GMT+7)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm py-2 border-b border-white/10">
                            <span className="text-slate-400">Saturday</span>
                            <span className="font-semibold text-emerald-400  tracking-tight">09:00 – 12:00 (GMT+7)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm py-2 border-b border-white/10">
                            <span className="text-slate-400">Sunday</span>
                            <span className="font-semibold text-slate-500  tracking-tight">Closed</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-2">Alternative Ways</h3>

                    <a href="mailto:support@ntp-eqms.com" className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Email Support</p>
                            <p className="text-xs text-slate-500">support@ntp-eqms.com</p>
                        </div>
                    </a>

                    <a href="tel:+84123456789" className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Phone Support</p>
                            <p className="text-xs text-slate-500">(+84) 123 456 789</p>
                        </div>
                    </a>

                    <div className="p-3 bg-indigo-50/50 rounded-xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                            <Globe className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">Knowledge Base</p>
                            <p className="text-xs text-slate-500">Read our detailed guides and help articles anytime.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
