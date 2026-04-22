import React, { useEffect, useState } from 'react';
import { Palette, Globe, BellRing, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button/Button';
import { TabNav, TabItem } from '@/components/ui/tabs/TabNav';
import { PageHeader } from '@/components/ui/page/PageHeader';
import breadcrumbs from '@/components/ui/breadcrumb/breadcrumbs.config';
import { useToast } from '@/components/ui/toast';
import { FullPageLoading } from "@/components/ui/loading/Loading";
import { AppearanceTab } from "./components/AppearanceTab";
import { LocalizationTab } from "./components/LocalizationTab";
import { NotificationSettingsTab } from "./components/NotificationSettingsTab";
import { SecuritySettingsTab } from "./components/SecuritySettingsTab";
import { PreferenceTabId } from "./types";

export const PreferencesView: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const getTabFromSearchParams = (): PreferenceTabId => {
        const tab = searchParams.get('tab');
        return tab === 'appearance' || tab === 'localization' || tab === 'notifications' || tab === 'security'
            ? tab
            : 'appearance';
    };
    const [activeTab, setActiveTab] = useState<PreferenceTabId>(getTabFromSearchParams);
    const { showToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setActiveTab(getTabFromSearchParams());
    }, [searchParams]);

    const TABS: TabItem[] = [
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'localization', label: 'Localization', icon: Globe },
        { id: 'notifications', label: 'Notifications', icon: BellRing },
        { id: 'security', label: 'Security', icon: ShieldCheck },
    ];

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            showToast({ type: 'success', message: 'Preferences updated successfully.' });
        }, 800);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'appearance':
                return <AppearanceTab />;
            case 'localization':
                return <LocalizationTab />;
            case 'notifications':
                return <NotificationSettingsTab />;
            case 'security':
                return <SecuritySettingsTab />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6 w-full flex-1 flex flex-col">
            {/* Header */}
            <PageHeader
                title="Preferences"
                breadcrumbItems={breadcrumbs.preferences(navigate)}
                actions={
                    <>
                        <Button
                            variant="outline-emerald"
                            size="sm"
                            onClick={() => window.location.reload()}
                        >
                            Reset to Default
                        </Button>
                        <Button
                            variant="outline-emerald"
                            size="sm"
                            onClick={handleSave}
                            className="min-w-[120px]"
                        >
                            Save Preferences
                        </Button>
                    </>
                }
            />

            {/* Main Content Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                {/* Tab Navigation */}
                <TabNav
                    tabs={TABS}
                    activeTab={activeTab}
                    onChange={(id) => {
                        const nextTab = id as PreferenceTabId;
                        setActiveTab(nextTab);
                        setSearchParams(nextTab === 'appearance' ? {} : { tab: nextTab }, { replace: true });
                    }}
                />

                {/* Content Area */}
                <div className="p-4 sm:p-6 md:p-8 flex-1 overflow-y-auto">
                    {renderTabContent()}
                </div>
            </div>

            {isSaving && <FullPageLoading text="Saving changes..." />}
        </div>
    );
};
