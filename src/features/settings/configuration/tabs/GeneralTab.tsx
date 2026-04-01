import React, { useState, useEffect } from 'react';
import { GeneralConfig } from '../types';
import { Select } from '@/components/ui/select/Select';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { Palette, Phone, Building2, Database, Globe, Monitor, Wrench, Sun, Moon } from 'lucide-react';

interface GeneralTabProps {
  config: GeneralConfig;
  onChange: (config: GeneralConfig) => void;
}

const SettingsCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
      <span className="text-emerald-600">{icon}</span>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

export const GeneralTab: React.FC<GeneralTabProps> = ({ config, onChange }) => {
  const [timeZones, setTimeZones] = useState<Array<{ label: string; value: string }>>([]);

  // Fetch time zones using Intl API
  useEffect(() => {
    try {
      // Get all supported time zones from browser
      const zones = Intl.supportedValuesOf('timeZone');
      
      // Format time zones with offset information
      const formatted = zones.map((zone) => {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: zone,
          timeZoneName: 'shortOffset',
        });
        
        // Get current time to calculate offset
        const parts = formatter.formatToParts(new Date());
        const offset = parts.find((part) => part.type === 'timeZoneName')?.value || '';
        
        return {
          label: `${zone.replace(/_/g, ' ')} ${offset}`,
          value: zone,
        };
      });

      // Sort by zone name
      formatted.sort((a, b) => a.value.localeCompare(b.value));

      setTimeZones(formatted);
    } catch (error) {
      console.error('Failed to load time zones:', error);
      // Fallback to basic options
      setTimeZones([
        { label: 'UTC', value: 'UTC' },
        { label: 'Asia/Bangkok (UTC+7)', value: 'Asia/Bangkok' },
        { label: 'Asia/Ho_Chi_Minh (UTC+7)', value: 'Asia/Ho_Chi_Minh' },
        { label: 'America/New_York (EST)', value: 'America/New_York' },
        { label: 'America/Los_Angeles (PST)', value: 'America/Los_Angeles' },
        { label: 'Europe/London (GMT)', value: 'Europe/London' },
      ]);
    }
  }, []);

  const handleChange = (key: keyof GeneralConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleCompanyInfoChange = (key: keyof GeneralConfig['companyInfo'], value: string) => {
    onChange({
      ...config,
      companyInfo: {
        ...config.companyInfo,
        [key]: value,
      },
    });
  };

  const handleBackupSettingsChange = (key: keyof GeneralConfig['backupSettings'], value: any) => {
    onChange({
      ...config,
      backupSettings: {
        ...config.backupSettings,
        [key]: value,
      },
    });
  };

  const handleLocaleChange = (key: keyof GeneralConfig['locale'], value: any) => {
    onChange({
      ...config,
      locale: {
        ...config.locale,
        [key]: value,
      },
    });
  };

  const handleAppearanceChange = (key: keyof GeneralConfig['appearance'], value: any) => {
    onChange({
      ...config,
      appearance: {
        ...config.appearance,
        [key]: value,
      },
    });
  };

  return (
    <div className="p-5 space-y-4">
      {/* Branding */}
      <SettingsCard title="Branding" icon={<Palette className="h-4 w-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              System Name (Internal)
            </label>
            <input
              type="text"
              value={config.systemName}
              onChange={(e) => handleChange('systemName', e.target.value)}
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="EQMS Enterprise"
            />
            <p className="text-xs text-slate-500 mt-1">
              Internal system identifier
            </p>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Display Name (Browser Tab)
            </label>
            <input
              type="text"
              value={config.systemDisplayName}
              onChange={(e) => handleChange('systemDisplayName', e.target.value)}
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="EQMS - Quality Management System"
            />
            <p className="text-xs text-slate-500 mt-1">
              Displayed in browser tab title
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* System Information */}
      <SettingsCard title="Contact Information" icon={<Phone className="h-4 w-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Admin Email
            </label>
            <input
              type="email"
              value={config.adminEmail}
              onChange={(e) => handleChange('adminEmail', e.target.value)}
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="admin@example.com"
            />
            <p className="text-xs text-slate-500 mt-1">
              Primary contact for system notifications
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Company Information */}
      <SettingsCard title="Company Information" icon={<Building2 className="h-4 w-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Company Name
            </label>
            <input
              type="text"
              value={config.companyInfo.companyName}
              onChange={(e) => handleCompanyInfoChange('companyName', e.target.value)}
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="ACME Corporation"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Tax ID / Registration Number
            </label>
            <input
              type="text"
              value={config.companyInfo.taxId}
              onChange={(e) => handleCompanyInfoChange('taxId', e.target.value)}
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="TAX-123456789"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Company Address
            </label>
            <input
              type="text"
              value={config.companyInfo.companyAddress}
              onChange={(e) => handleCompanyInfoChange('companyAddress', e.target.value)}
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="123 Business Street, Tech City, TC 12345"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Company Phone
            </label>
            <input
              type="tel"
              value={config.companyInfo.companyPhone}
              onChange={(e) => handleCompanyInfoChange('companyPhone', e.target.value)}
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="+1-555-0123"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Company Website
            </label>
            <input
              type="url"
              value={config.companyInfo.companyWebsite}
              onChange={(e) => handleCompanyInfoChange('companyWebsite', e.target.value)}
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="https://www.company.com"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Industry
            </label>
            <input
              type="text"
              value={config.companyInfo.industry}
              onChange={(e) => handleCompanyInfoChange('industry', e.target.value)}
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Pharmaceutical Manufacturing"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Regulatory Body / Standards
            </label>
            <input
              type="text"
              value={config.companyInfo.regulatoryBody}
              onChange={(e) => handleCompanyInfoChange('regulatoryBody', e.target.value)}
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="FDA, ISO 9001:2015"
            />
            <p className="text-xs text-slate-500 mt-1">
              e.g., FDA, ISO 9001, ISO 13485, GMP, etc.
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Backup & Data Management */}
      <SettingsCard title="Backup & Data Management" icon={<Database className="h-4 w-4" />}>
        <div className="space-y-4">
          <div>
            <Checkbox
              id="enableAutoBackup"
              label="Enable Automatic Backup"
              checked={config.backupSettings.enableAutoBackup}
              onChange={(checked) => handleBackupSettingsChange('enableAutoBackup', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              Automatically backup system data at scheduled intervals
            </p>
          </div>
          
          {config.backupSettings.enableAutoBackup && (
            <div className="ml-4 sm:ml-7 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Select
                  label="Backup Frequency"
                  value={config.backupSettings.backupFrequency}
                  onChange={(val) => handleBackupSettingsChange('backupFrequency', val as 'daily' | 'weekly' | 'monthly')}
                  options={[
                    { label: 'Daily', value: 'daily' },
                    { label: 'Weekly', value: 'weekly' },
                    { label: 'Monthly', value: 'monthly' },
                  ]}
                />
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Backup Time
                  </label>
                  <input
                    type="time"
                    value={config.backupSettings.backupTime}
                    onChange={(e) => handleBackupSettingsChange('backupTime', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    System local time (24-hour format)
                  </p>
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Retention Period (Days)
                  </label>
                  <input
                    type="number"
                    value={config.backupSettings.retentionDays}
                    onChange={(e) => handleBackupSettingsChange('retentionDays', parseInt(e.target.value))}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    min={7}
                    max={365}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Keep backups for {config.backupSettings.retentionDays} days
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Backup Location"
                  value={config.backupSettings.backupLocation}
                  onChange={(val) => handleBackupSettingsChange('backupLocation', val as 'local' | 'cloud' | 's3')}
                  options={[
                    { label: 'Local Server', value: 'local' },
                    { label: 'Cloud Storage', value: 'cloud' },
                    { label: 'Amazon S3', value: 's3' },
                  ]}
                />
                <div className="flex items-center sm:pt-8">
                  <Checkbox
                    id="notifyOnBackupFailure"
                    label="Notify on Backup Failure"
                    checked={config.backupSettings.notifyOnBackupFailure}
                    onChange={(checked) => handleBackupSettingsChange('notifyOnBackupFailure', checked)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Localization */}
      <SettingsCard title="Localization" icon={<Globe className="h-4 w-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Date & Time Format"
            value={config.dateTimeFormat}
            onChange={(val) => handleChange('dateTimeFormat', val)}
            options={[
              { label: 'DD/MM/YYYY HH:mm:ss', value: 'DD/MM/YYYY HH:mm:ss' },
              { label: 'DD/MM/YYYY HH:mm', value: 'DD/MM/YYYY HH:mm' },
              { label: 'MM/DD/YYYY HH:mm:ss', value: 'MM/DD/YYYY HH:mm:ss' },
              { label: 'MM/DD/YYYY HH:mm', value: 'MM/DD/YYYY HH:mm' },
              { label: 'YYYY-MM-DD HH:mm:ss', value: 'YYYY-MM-DD HH:mm:ss' },
              { label: 'YYYY-MM-DD HH:mm', value: 'YYYY-MM-DD HH:mm' },
              { label: 'DD-MMM-YYYY HH:mm:ss', value: 'DD-MMM-YYYY HH:mm:ss' },
              { label: 'DD-MMM-YYYY HH:mm', value: 'DD-MMM-YYYY HH:mm' },
              { label: 'MMMM DD, YYYY HH:mm:ss', value: 'MMMM DD, YYYY HH:mm:ss' },
              { label: 'MMMM DD, YYYY HH:mm', value: 'MMMM DD, YYYY HH:mm' },
            ]}
          />
          <Select
            label="Time Zone"
            value={config.timeZone}
            onChange={(val) => handleChange('timeZone', val)}
            options={timeZones}
            enableSearch
            placeholder="Select time zone..."
          />
          <Select
            label="Language"
            value={config.locale.language}
            onChange={(val) => handleLocaleChange('language', val)}
            options={[
              { label: 'English', value: 'en' },
              { label: 'Vietnamese (Tiếng Việt)', value: 'vi' },
              { label: 'Japanese (日本語)', value: 'ja' },
              { label: 'Korean (한국어)', value: 'ko' },
              { label: 'Chinese Simplified (简体中文)', value: 'zh-CN' },
              { label: 'French (Français)', value: 'fr' },
              { label: 'German (Deutsch)', value: 'de' },
              { label: 'Spanish (Español)', value: 'es' },
            ]}
          />
          <Select
            label="Number Format"
            value={config.locale.numberFormat}
            onChange={(val) => handleLocaleChange('numberFormat', val)}
            options={[
              { label: '1,234.56 (US/UK)', value: 'en-US' },
              { label: '1.234,56 (EU)', value: 'de-DE' },
              { label: '1 234,56 (FR)', value: 'fr-FR' },
              { label: '1,234.56 (JP)', value: 'ja-JP' },
            ]}
          />
          <Select
            label="Currency"
            value={config.locale.currencyCode}
            onChange={(val) => handleLocaleChange('currencyCode', val)}
            options={[
              { label: 'USD ($)', value: 'USD' },
              { label: 'EUR (€)', value: 'EUR' },
              { label: 'VND (₫)', value: 'VND' },
              { label: 'GBP (£)', value: 'GBP' },
              { label: 'JPY (¥)', value: 'JPY' },
              { label: 'KRW (₩)', value: 'KRW' },
              { label: 'CNY (¥)', value: 'CNY' },
            ]}
          />
          <Select
            label="First Day of Week"
            value={config.locale.firstDayOfWeek}
            onChange={(val) => handleLocaleChange('firstDayOfWeek', val as 'monday' | 'sunday')}
            options={[
              { label: 'Monday', value: 'monday' },
              { label: 'Sunday', value: 'sunday' },
            ]}
          />
        </div>
      </SettingsCard>

      {/* Appearance */}
      <SettingsCard title="Appearance & UI Preferences" icon={<Monitor className="h-4 w-4" />}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Theme"
              value={config.appearance.theme}
              onChange={(val) => handleAppearanceChange('theme', val as 'light' | 'dark' | 'auto')}
              options={[
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
                { label: 'System Default (Auto)', value: 'auto' },
              ]}
            />
            <Select
              label="Primary Color"
              value={config.appearance.primaryColor}
              onChange={(val) => handleAppearanceChange('primaryColor', val)}
              options={[
                { label: 'Emerald (Default)', value: 'emerald' },
                { label: 'Blue', value: 'blue' },
                { label: 'Violet', value: 'violet' },
                { label: 'Orange', value: 'orange' },
                { label: 'Rose', value: 'rose' },
                { label: 'Teal', value: 'teal' },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Checkbox
              id="compactMode"
              label="Compact Mode (Reduced spacing)"
              checked={config.appearance.compactMode}
              onChange={(checked) => handleAppearanceChange('compactMode', checked)}
            />
            <Checkbox
              id="showBreadcrumbs"
              label="Show Breadcrumb Navigation"
              checked={config.appearance.showBreadcrumbs}
              onChange={(checked) => handleAppearanceChange('showBreadcrumbs', checked)}
            />
            <Checkbox
              id="sidebarDefaultCollapsed"
              label="Sidebar Collapsed by Default"
              checked={config.appearance.sidebarDefaultCollapsed}
              onChange={(checked) => handleAppearanceChange('sidebarDefaultCollapsed', checked)}
            />
            <Checkbox
              id="animationsEnabled"
              label="Enable UI Animations"
              checked={config.appearance.animationsEnabled}
              onChange={(checked) => handleAppearanceChange('animationsEnabled', checked)}
            />
          </div>
        </div>
      </SettingsCard>

      {/* System Maintenance */}
      <SettingsCard title="System Maintenance" icon={<Wrench className="h-4 w-4" />}>
        <div className="space-y-3">
          <div>
            <Checkbox
              id="maintenanceMode"
              label="Enable Maintenance Mode"
              checked={config.maintenanceMode}
              onChange={(checked) => handleChange('maintenanceMode', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              When enabled, only administrators can access the system. Regular users will see a maintenance notice.
            </p>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};
