import React, { useState, useRef } from 'react';
import { Save, RotateCcw, Settings, Shield, FileText, Bell, Plug, Download, Upload } from 'lucide-react';
import { PageHeader } from "@/components/ui/page/PageHeader";
import { configuration } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from '@/components/ui/button/Button';
import { cn } from '@/components/ui/utils';
import { useToast } from '@/components/ui/toast/Toast';
import { AlertModal } from '@/components/ui/modal/AlertModal';
import { SystemConfig } from './types';
import { MOCK_SYSTEM_CONFIG } from './mockData';
import { GeneralTab } from './tabs/GeneralTab';
import { SecurityTab } from './tabs/SecurityTab';
import { DocumentTab } from './tabs/DocumentTab';
import { NotificationTab } from './tabs/NotificationTab';
import { IntegrationTab } from './tabs/IntegrationTab';

type TabId = 'general' | 'security' | 'document' | 'notification' | 'integration';

const TABS = [
  {
    id: 'general' as TabId,
    label: 'General',
    icon: Settings,
    description: 'Basic system settings, localization, and maintenance mode',
  },
  {
    id: 'security' as TabId,
    label: 'Security',
    icon: Shield,
    description: 'Password policies, session management, and authentication settings',
  },
  {
    id: 'document' as TabId,
    label: 'Documents',
    icon: FileText,
    description: 'Document retention, watermarking, and download policies',
  },
  {
    id: 'notification' as TabId,
    label: 'Notifications',
    icon: Bell,
    description: 'Email and in-app notification channels and triggers',
  },
  {
    id: 'integration' as TabId,
    label: 'Integrations',
    icon: Plug,
    description: 'SSO, LDAP, webhooks, storage, and API security settings',
  },
];

export const ConfigurationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [config, setConfig] = useState<SystemConfig>(MOCK_SYSTEM_CONFIG);
  const [isDirty, setIsDirty] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConfigChange = <K extends keyof SystemConfig>(section: K, value: SystemConfig[K]) => {
    setConfig((prev) => ({
      ...prev,
      [section]: value,
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    // In real app, API call here
    setIsDirty(false);
    showToast({
      type: "success",
      title: "Changes saved",
      message: "System configuration has been updated successfully.",
    });
  };

  const handleResetClick = () => {
    setShowResetModal(true);
  };

  const handleResetConfirm = () => {
    setConfig(MOCK_SYSTEM_CONFIG);
    setIsDirty(false);
    setShowResetModal(false);
    showToast({
      type: "info",
      title: "Changes discarded",
      message: "Configuration reset to last saved state.",
    });
  };

  const handleExportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eqms-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast({
      type: 'success',
      title: 'Configuration exported',
      message: 'Configuration file downloaded successfully.',
    });
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.general && imported.security && imported.documents && imported.notifications) {
          setConfig(imported as SystemConfig);
          setIsDirty(true);
          showToast({
            type: 'success',
            title: 'Configuration imported',
            message: 'Review changes and click "Save Changes" to apply.',
          });
        } else {
          showToast({
            type: 'error',
            title: 'Invalid file',
            message: 'The selected file is not a valid configuration file.',
          });
        }
      } catch {
        showToast({
          type: 'error',
          title: 'Import failed',
          message: 'Could not parse the selected JSON file.',
        });
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab config={config.general} onChange={(val) => handleConfigChange('general', val)} />;
      case 'security':
        return <SecurityTab config={config.security} onChange={(val) => handleConfigChange('security', val)} />;
      case 'document':
        return <DocumentTab config={config.documents} onChange={(val) => handleConfigChange('documents', val)} />;
      case 'notification':
        return <NotificationTab config={config.notifications} onChange={(val) => handleConfigChange('notifications', val)} />;
      case 'integration':
        return <IntegrationTab config={config.integrations} onChange={(val) => handleConfigChange('integrations', val)} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Header */}
      <PageHeader
        title="System Configuration"
        breadcrumbItems={configuration()}
        actions={
          <>
            <Button variant="outline" onClick={handleExportConfig} size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportConfig} className="hidden" />
            <Button variant="outline-emerald" onClick={handleResetClick} disabled={!isDirty} size="sm" className="gap-2">
              Reset
            </Button>
            <Button variant="outline-emerald" onClick={handleSave} disabled={!isDirty} size="sm" className="gap-2">
              Save Changes
            </Button>
          </>
        }
      />

      {/* Reset Confirmation Modal */}
      <AlertModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetConfirm}
        type="warning"
        title="Discard unsaved changes?"
        description={
          <div className="space-y-2">
            <p className="text-sm text-slate-600">
              All unsaved changes will be lost and the configuration will be reset to the last saved state.
            </p>
            <p className="text-sm font-medium text-amber-700">
              This action cannot be undone.
            </p>
          </div>
        }
        confirmText="Discard Changes"
        cancelText="Keep Editing"
      />

      {/* Tabbed Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 sm:px-4 md:px-6 py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors border-r border-slate-200 last:border-r-0",
                    isActive
                      ? "border-b-emerald-600 text-emerald-700 bg-emerald-50/50"
                      : "border-b-transparent text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className={cn("animate-in fade-in duration-200")}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

