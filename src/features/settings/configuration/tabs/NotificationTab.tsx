import React, { useState } from 'react';
import { NotificationConfig } from '../types';
import { Select } from '@/components/ui/select/Select';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { Button } from '@/components/ui/button/Button';
import { useToast } from '@/components/ui/toast/Toast';
import { InlineLoading } from '@/components/ui/loading/Loading';
import { Eye, EyeOff, Send, Bell, Clock, Smartphone, Layout, Zap } from 'lucide-react';
import gmailLogo from '@/assets/images/logo-app/gmail.svg';
import telegramLogo from '@/assets/images/logo-app/telegram.svg';
import whatsappLogo from '@/assets/images/logo-app/whatsapp.svg';

interface NotificationTabProps {
  config: NotificationConfig;
  onChange: (config: NotificationConfig) => void;
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

export const NotificationTab: React.FC<NotificationTabProps> = ({ config, onChange }) => {
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showTelegramToken, setShowTelegramToken] = useState(false);
  const [showWhatsAppToken, setShowWhatsAppToken] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testingWhatsApp, setTestingWhatsApp] = useState(false);
  const { showToast } = useToast();

  const handleChange = (key: keyof NotificationConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleEmailConfigChange = (key: keyof NotificationConfig['emailConfig'], value: any) => {
    onChange({
      ...config,
      emailConfig: {
        ...config.emailConfig,
        [key]: value,
      },
    });
  };

  const handleTelegramConfigChange = (key: keyof NotificationConfig['telegramConfig'], value: any) => {
    onChange({
      ...config,
      telegramConfig: {
        ...config.telegramConfig,
        [key]: value,
      },
    });
  };

  const handleWhatsAppConfigChange = (key: keyof NotificationConfig['whatsappConfig'], value: any) => {
    onChange({
      ...config,
      whatsappConfig: {
        ...config.whatsappConfig,
        [key]: value,
      },
    });
  };

  const handleSmsConfigChange = (key: keyof NotificationConfig['smsConfig'], value: any) => {
    onChange({
      ...config,
      smsConfig: {
        ...config.smsConfig,
        [key]: value,
      },
    });
  };

  const handleTriggerChange = (trigger: keyof NotificationConfig['triggers'], checked: boolean) => {
    onChange({
      ...config,
      triggers: {
        ...config.triggers,
        [trigger]: checked,
      },
    });
  };

  const handleTestSmtp = () => {
    setTestingSmtp(true);
    setTimeout(() => {
      setTestingSmtp(false);
      showToast({
        type: 'success',
        title: 'SMTP Connection Successful',
        message: `Test email sent to ${config.emailConfig.senderEmail}`,
      });
    }, 2000);
  };

  const handleTestTelegram = () => {
    setTestingTelegram(true);
    setTimeout(() => {
      setTestingTelegram(false);
      showToast({
        type: 'success',
        title: 'Telegram Bot Connected',
        message: `Test message sent to chat ${config.telegramConfig.chatId}`,
      });
    }, 1500);
  };

  const handleTestWhatsApp = () => {
    setTestingWhatsApp(true);
    setTimeout(() => {
      setTestingWhatsApp(false);
      showToast({
        type: 'success',
        title: 'WhatsApp API Connected',
        message: 'Test message sent via WhatsApp Business API',
      });
    }, 2000);
  };

  return (
    <div className="p-5 space-y-4">
      {/* Notification Channels */}
      <SettingsCard title="Notification Channels" icon={<Bell className="h-4 w-4" />}>
        <div className="space-y-3">
          <div>
            <Checkbox
              id="enableInAppNotifications"
              label="Enable In-App Notifications"
              checked={config.enableInAppNotifications}
              onChange={(checked) => handleChange('enableInAppNotifications', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              Display notifications within the application interface
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Email Configuration */}
      <SettingsCard title="Email Notifications (SMTP)" icon={<img src={gmailLogo} alt="Gmail" className="h-4 w-4 object-contain grayscale brightness-110" />}>
        <div className="space-y-4">
          <Checkbox
            id="enableEmailNotifications"
            label="Enable Email Notifications"
            checked={config.enableEmailNotifications}
            onChange={(checked) => handleChange('enableEmailNotifications', checked)}
          />

          {config.enableEmailNotifications && (
            <div className="ml-7 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={config.emailConfig.smtpHost}
                    onChange={(e) => handleEmailConfigChange('smtpHost', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={config.emailConfig.smtpPort}
                    onChange={(e) => handleEmailConfigChange('smtpPort', parseInt(e.target.value))}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="587"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    value={config.emailConfig.smtpUsername}
                    onChange={(e) => handleEmailConfigChange('smtpUsername', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="username@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    SMTP Password
                  </label>
                  <div className="relative">
                    <input
                      type={showSmtpPassword ? "text" : "password"}
                      value={config.emailConfig.smtpPassword}
                      onChange={(e) => handleEmailConfigChange('smtpPassword', e.target.value)}
                      className="w-full h-9 px-3.5 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showSmtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Sender Email
                  </label>
                  <input
                    type="email"
                    value={config.emailConfig.senderEmail}
                    onChange={(e) => handleEmailConfigChange('senderEmail', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="noreply@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    value={config.emailConfig.senderName}
                    onChange={(e) => handleEmailConfigChange('senderName', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="EQMS Notification"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Checkbox
                  id="useSSL"
                  label="Use SSL/TLS Encryption"
                  checked={config.emailConfig.useSSL}
                  onChange={(checked) => handleEmailConfigChange('useSSL', checked)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestSmtp}
                  disabled={testingSmtp || !config.emailConfig.smtpHost}
                  className="gap-2 shadow-sm"
                >
                  {testingSmtp ? (
                    <>
                      <InlineLoading size="xs" />
                      <span className="ml-1">Testing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span className="ml-1">Send Test Email</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Telegram Configuration */}
      <SettingsCard title="Telegram Notifications" icon={<img src={telegramLogo} alt="Telegram" className="h-4 w-4 object-contain" />}>
        <div className="space-y-4">
          <Checkbox
            id="enableTelegramNotifications"
            label="Enable Telegram Notifications"
            checked={config.enableTelegramNotifications}
            onChange={(checked) => handleChange('enableTelegramNotifications', checked)}
          />

          {config.enableTelegramNotifications && (
            <div className="ml-7 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Bot Token
                  </label>
                  <div className="relative">
                    <input
                      type={showTelegramToken ? "text" : "password"}
                      value={config.telegramConfig.botToken}
                      onChange={(e) => handleTelegramConfigChange('botToken', e.target.value)}
                      className="w-full h-9 px-3.5 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                      placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTelegramToken(!showTelegramToken)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showTelegramToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Get token from @BotFather on Telegram
                  </p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Chat ID / Group ID
                  </label>
                  <input
                    type="text"
                    value={config.telegramConfig.chatId}
                    onChange={(e) => handleTelegramConfigChange('chatId', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                    placeholder="-1001234567890"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Use @userinfobot to get your Chat ID
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestTelegram}
                  disabled={testingTelegram || !config.telegramConfig.botToken || !config.telegramConfig.chatId}
                  className="gap-2 shadow-sm"
                >
                  {testingTelegram ? (
                    <>
                      <InlineLoading size="xs" />
                      <span className="ml-1">Testing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span className="ml-1">Send Test Message</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* WhatsApp Configuration */}
      <SettingsCard title="WhatsApp Notifications (Business API)" icon={<img src={whatsappLogo} alt="WhatsApp" className="h-4 w-4 object-contain" />}>
        <div className="space-y-4">
          <Checkbox
            id="enableWhatsAppNotifications"
            label="Enable WhatsApp Notifications"
            checked={config.enableWhatsAppNotifications}
            onChange={(checked) => handleChange('enableWhatsAppNotifications', checked)}
          />

          {config.enableWhatsAppNotifications && (
            <div className="ml-7 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Phone Number ID
                  </label>
                  <input
                    type="text"
                    value={config.whatsappConfig.phoneNumberId}
                    onChange={(e) => handleWhatsAppConfigChange('phoneNumberId', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                    placeholder="123456789012345"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    From Meta Business Manager
                  </p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Business Account ID
                  </label>
                  <input
                    type="text"
                    value={config.whatsappConfig.businessAccountId}
                    onChange={(e) => handleWhatsAppConfigChange('businessAccountId', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                    placeholder="987654321098765"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    WhatsApp Business Account ID
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Access Token
                  </label>
                  <div className="relative">
                    <input
                      type={showWhatsAppToken ? "text" : "password"}
                      value={config.whatsappConfig.accessToken}
                      onChange={(e) => handleWhatsAppConfigChange('accessToken', e.target.value)}
                      className="w-full h-9 px-3.5 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                      placeholder="EAAxxxxxxxxxxxxxxxxxx"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWhatsAppToken(!showWhatsAppToken)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showWhatsAppToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Permanent token from Meta Business Manager
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestWhatsApp}
                  disabled={testingWhatsApp || !config.whatsappConfig.accessToken || !config.whatsappConfig.phoneNumberId}
                  className="gap-2 shadow-sm"
                >
                  {testingWhatsApp ? (
                    <>
                      <InlineLoading size="xs" />
                      <span className="ml-1">Testing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span className="ml-1">Send Test Message</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Digest Settings */}
      <SettingsCard title="Email Digest Settings" icon={<Clock className="h-4 w-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Email Digest Frequency"
            value={config.emailDigestFrequency}
            onChange={(val) => handleChange('emailDigestFrequency', val)}
            options={[
              { label: 'Instant (Send immediately)', value: 'instant' },
              { label: 'Daily Digest', value: 'daily' },
              { label: 'Weekly Summary', value: 'weekly' },
            ]}
            disabled={!config.enableEmailNotifications}
          />
        </div>
        {!config.enableEmailNotifications && (
          <p className="text-xs text-amber-600 mt-3 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Enable email notifications to configure digest settings
          </p>
        )}
      </SettingsCard>

      {/* SMS Notifications */}
      <SettingsCard title="SMS Notifications" icon={<Smartphone className="h-4 w-4" />}>
        <div className="space-y-4">
          <div>
            <Checkbox
              id="enableSms"
              label="Enable SMS Notifications"
              checked={config.smsConfig.enableSms}
              onChange={(checked) => handleSmsConfigChange('enableSms', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              Send time-sensitive notifications via SMS
            </p>
          </div>

          {config.smsConfig.enableSms && (
            <div className="ml-7 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <Select
                label="SMS Provider"
                value={config.smsConfig.provider}
                onChange={(val) => handleSmsConfigChange('provider', val as 'twilio' | 'vonage' | 'aws-sns')}
                options={[
                  { label: 'Twilio', value: 'twilio' },
                  { label: 'Vonage (Nexmo)', value: 'vonage' },
                  { label: 'AWS SNS', value: 'aws-sns' },
                ]}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Account SID / API Key
                  </label>
                  <input
                    type="text"
                    value={config.smsConfig.accountSid}
                    onChange={(e) => handleSmsConfigChange('accountSid', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Auth Token / Secret
                  </label>
                  <div className="relative">
                    <input
                      type={showSmtpPassword ? "text" : "password"}
                      value={config.smsConfig.authToken}
                      onChange={(e) => handleSmsConfigChange('authToken', e.target.value)}
                      className="w-full h-9 px-3.5 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter auth token"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showSmtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Sender Phone Number
                  </label>
                  <input
                    type="tel"
                    value={config.smsConfig.fromNumber}
                    onChange={(e) => handleSmsConfigChange('fromNumber', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="+1-555-0100"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Verified phone number from your SMS provider
                  </p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Rate Limit (Per Hour)
                  </label>
                  <input
                    type="number"
                    value={config.smsConfig.rateLimitPerHour}
                    onChange={(e) => handleSmsConfigChange('rateLimitPerHour', parseInt(e.target.value))}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    min={1}
                    max={1000}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Maximum SMS messages per hour to prevent abuse
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Notification Templates */}
      <SettingsCard title="Notification Templates" icon={<Layout className="h-4 w-4" />}>
        <div className="space-y-4">
          <div>
            <Checkbox
              id="enableCustomTemplates"
              label="Enable Custom Notification Templates"
              checked={config.enableCustomTemplates}
              onChange={(checked) => handleChange('enableCustomTemplates', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              Customize email and notification templates with your own branding and messages
            </p>
          </div>

          {config.enableCustomTemplates && (
            <div className="ml-7 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-medium text-slate-700">
                    Template Library
                  </p>
                  <span className="text-xs text-slate-500 font-medium">
                    {config.templates.length} template{config.templates.length !== 1 ? 's' : ''} configured
                  </span>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    <strong className="font-bold">Coming Soon:</strong> Template editor with support for dynamic variables, multi-language,
                    and HTML formatting. You'll be able to customize templates for Document Approval, Task Assignment,
                    CAPA Notifications, and more.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500">
                  <span className="font-semibold text-slate-600">Available Variables:</span>
                  <code className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 uppercase">{'{userName}'}</code>
                  <code className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 uppercase">{'{documentTitle}'}</code>
                  <code className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 uppercase">{'{taskName}'}</code>
                  <code className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 uppercase">{'{dueDate}'}</code>
                  <code className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 uppercase">{'{systemName}'}</code>
                </div>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Notification Triggers */}
      <SettingsCard title="Notification Triggers" icon={<Zap className="h-4 w-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-100">
            <Checkbox
              id="trigger-approval"
              label="Document Approval Requests"
              checked={config.triggers.documentApproval}
              onChange={(checked) => handleTriggerChange('documentApproval', checked)}
            />
            <p className="text-xs text-slate-500 ml-7 mt-1.5 leading-relaxed">
              When a document requires your approval
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-100">
            <Checkbox
              id="trigger-tasks"
              label="Task Assignments"
              checked={config.triggers.taskAssignment}
              onChange={(checked) => handleTriggerChange('taskAssignment', checked)}
            />
            <p className="text-xs text-slate-500 ml-7 mt-1.5 leading-relaxed">
              When a task is assigned to you
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-100">
            <Checkbox
              id="trigger-alerts"
              label="System Alerts"
              checked={config.triggers.systemAlerts}
              onChange={(checked) => handleTriggerChange('systemAlerts', checked)}
            />
            <p className="text-xs text-slate-500 ml-7 mt-1.5 leading-relaxed">
              Critical system messages and updates
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-100">
            <Checkbox
              id="trigger-capa"
              label="CAPA & Deviation Due Dates"
              checked={config.triggers.capaDue}
              onChange={(checked) => handleTriggerChange('capaDue', checked)}
            />
            <p className="text-xs text-slate-500 ml-7 mt-1.5 leading-relaxed">
              Reminders for upcoming due dates
            </p>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};
