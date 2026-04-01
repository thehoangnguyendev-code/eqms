import React, { useState } from 'react';
import { IntegrationConfig } from '../types';
import { Select } from '@/components/ui/select/Select';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { Button } from '@/components/ui/button/Button';
import { useToast } from '@/components/ui/toast/Toast';
import { AlertModal } from '@/components/ui/modal/AlertModal';
import { formatDateTime } from '@/utils/format';
import {
  Plus,
  X,
  Eye,
  EyeOff,
  Webhook,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Link2,
  Globe,
  Key,
  Cloud,
  Shield,
} from 'lucide-react';

interface IntegrationTabProps {
  config: IntegrationConfig;
  onChange: (config: IntegrationConfig) => void;
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

export const IntegrationTab: React.FC<IntegrationTabProps> = ({ config, onChange }) => {
  const { showToast } = useToast();
  const [showSsoPassword, setShowSsoPassword] = useState(false);
  const [showLdapPassword, setShowLdapPassword] = useState(false);
  const [showStorageKey, setShowStorageKey] = useState(false);
  const [newOrigin, setNewOrigin] = useState('');
  const [deleteWebhookId, setDeleteWebhookId] = useState<string | null>(null);

  const handleSsoChange = (key: keyof IntegrationConfig['sso'], value: any) => {
    onChange({
      ...config,
      sso: { ...config.sso, [key]: value },
    });
  };

  const handleLdapChange = (key: keyof IntegrationConfig['ldap'], value: any) => {
    onChange({
      ...config,
      ldap: { ...config.ldap, [key]: value },
    });
  };

  const handleStorageChange = (key: keyof IntegrationConfig['storage'], value: any) => {
    onChange({
      ...config,
      storage: { ...config.storage, [key]: value },
    });
  };

  const handleChange = (key: keyof IntegrationConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const toggleWebhook = (id: string) => {
    onChange({
      ...config,
      webhooks: config.webhooks.map((wh) =>
        wh.id === id ? { ...wh, enabled: !wh.enabled } : wh
      ),
    });
  };

  const confirmDeleteWebhook = () => {
    if (deleteWebhookId) {
      onChange({
        ...config,
        webhooks: config.webhooks.filter((wh) => wh.id !== deleteWebhookId),
      });
      showToast({ type: 'success', message: 'Webhook removed successfully' });
      setDeleteWebhookId(null);
    }
  };

  const addCorsOrigin = () => {
    const trimmed = newOrigin.trim();
    if (trimmed && !config.corsAllowedOrigins.includes(trimmed)) {
      handleChange('corsAllowedOrigins', [...config.corsAllowedOrigins, trimmed]);
      setNewOrigin('');
    }
  };

  const removeCorsOrigin = (origin: string) => {
    handleChange(
      'corsAllowedOrigins',
      config.corsAllowedOrigins.filter((o) => o !== origin)
    );
  };

  const handleTestSso = () => {
    showToast({ type: 'info', message: 'SSO connection test initiated...' });
    setTimeout(() => {
      showToast({ type: 'success', message: 'SSO connection test successful' });
    }, 1500);
  };

  const handleTestLdap = () => {
    showToast({ type: 'info', message: 'LDAP connection test initiated...' });
    setTimeout(() => {
      showToast({ type: 'success', message: 'LDAP connection successful — 142 users found' });
    }, 2000);
  };

  return (
    <div className="p-5 space-y-4">
      {/* Delete Webhook Confirmation */}
      <AlertModal
        isOpen={!!deleteWebhookId}
        onClose={() => setDeleteWebhookId(null)}
        onConfirm={confirmDeleteWebhook}
        type="warning"
        title="Delete Webhook?"
        description={
          <p className="text-sm text-slate-600">
            This webhook will be permanently removed. Any integrations relying on it will stop receiving events.
          </p>
        }
        confirmText="Delete Webhook"
        cancelText="Cancel"
      />

      {/* SSO Configuration */}
      <SettingsCard title="Single Sign-On (SSO)" icon={<Shield className="h-4 w-4" />}>
        <div className="space-y-4">
          <div>
            <Checkbox
              id="enableSso"
              label="Enable Single Sign-On"
              checked={config.sso.enableSso}
              onChange={(checked) => handleSsoChange('enableSso', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              Allow users to authenticate using your organization's identity provider
            </p>
          </div>

          {config.sso.enableSso && (
            <div className="ml-4 sm:ml-7 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="SSO Provider"
                  value={config.sso.provider}
                  onChange={(val) => handleSsoChange('provider', val as any)}
                  options={[
                    { label: 'Azure Active Directory', value: 'azure-ad' },
                    { label: 'SAML 2.0', value: 'saml' },
                    { label: 'OpenID Connect (OIDC)', value: 'oidc' },
                    { label: 'LDAP', value: 'ldap' },
                  ]}
                />
                <Select
                  label="Default Role for New SSO Users"
                  value={config.sso.defaultRole}
                  onChange={(val) => handleSsoChange('defaultRole', val)}
                  options={[
                    { label: 'Viewer', value: 'viewer' },
                    { label: 'User', value: 'user' },
                    { label: 'Editor', value: 'editor' },
                    { label: 'Reviewer', value: 'reviewer' },
                  ]}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Entity ID / Client ID
                  </label>
                  <input
                    type="text"
                    value={config.sso.entityId}
                    onChange={(e) => handleSsoChange('entityId', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                    placeholder="https://eqms.company.com/sso"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    SSO Login URL
                  </label>
                  <input
                    type="url"
                    value={config.sso.ssoUrl}
                    onChange={(e) => handleSsoChange('ssoUrl', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                    placeholder="https://login.company.com/saml/sso"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                  X.509 Certificate (PEM)
                </label>
                <textarea
                  value={config.sso.certificate}
                  onChange={(e) => handleSsoChange('certificate', e.target.value)}
                  className="w-full h-24 px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500  resize-none"
                  placeholder="-----BEGIN CERTIFICATE-----&#10;MIIDxxxxxx...&#10;-----END CERTIFICATE-----"
                />
              </div>
              <div className="flex items-center justify-between">
                <Checkbox
                  id="autoProvisionUsers"
                  label="Auto-provision users on first SSO login"
                  checked={config.sso.autoProvisionUsers}
                  onChange={(checked) => handleSsoChange('autoProvisionUsers', checked)}
                />
                <Button variant="outline" size="sm" onClick={handleTestSso} className="gap-2 shadow-sm">
                  <Link2 className="h-3.5 w-3.5" />
                  Test Connection
                </Button>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* LDAP Directory */}
      <SettingsCard title="LDAP / Active Directory" icon={<Key className="h-4 w-4" />}>
        <div className="space-y-4">
          <div>
            <Checkbox
              id="enableLdap"
              label="Enable LDAP Integration"
              checked={config.ldap.enableLdap}
              onChange={(checked) => handleLdapChange('enableLdap', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              Synchronize users and groups from your LDAP/AD directory
            </p>
          </div>

          {config.ldap.enableLdap && (
            <div className="ml-4 sm:ml-7 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    LDAP Server URL
                  </label>
                  <input
                    type="url"
                    value={config.ldap.serverUrl}
                    onChange={(e) => handleLdapChange('serverUrl', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                    placeholder="ldaps://ldap.company.com:636"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Base DN
                  </label>
                  <input
                    type="text"
                    value={config.ldap.baseDn}
                    onChange={(e) => handleLdapChange('baseDn', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                    placeholder="dc=company,dc=com"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Bind DN (Service Account)
                  </label>
                  <input
                    type="text"
                    value={config.ldap.bindDn}
                    onChange={(e) => handleLdapChange('bindDn', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                    placeholder="cn=admin,dc=company,dc=com"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Bind Password
                  </label>
                  <div className="relative">
                    <input
                      type={showLdapPassword ? 'text' : 'password'}
                      value={config.ldap.bindPassword}
                      onChange={(e) => handleLdapChange('bindPassword', e.target.value)}
                      className="w-full h-9 px-3.5 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter bind password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLdapPassword(!showLdapPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showLdapPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    User Search Filter
                  </label>
                  <input
                    type="text"
                    value={config.ldap.userSearchFilter}
                    onChange={(e) => handleLdapChange('userSearchFilter', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                    placeholder="(sAMAccountName={username})"
                  />
                </div>
                <Select
                  label="Sync Schedule"
                  value={config.ldap.syncSchedule}
                  onChange={(val) => handleLdapChange('syncSchedule', val as any)}
                  options={[
                    { label: 'Hourly', value: 'hourly' },
                    { label: 'Daily', value: 'daily' },
                    { label: 'Manual Only', value: 'manual' },
                  ]}
                />
              </div>
              <div className="flex items-center justify-between">
                {config.ldap.lastSyncDate && (
                  <p className="text-xs text-slate-500 font-medium">
                    Last synchronized: {formatDateTime(config.ldap.lastSyncDate)}
                  </p>
                )}
                <div className="flex-1" />
                <Button variant="outline" size="sm" onClick={handleTestLdap} className="gap-2 shadow-sm">
                  <Link2 className="h-3.5 w-3.5" />
                  Test Connection
                </Button>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Webhooks */}
      <SettingsCard title={`Webhooks (${config.webhooks.length})`} icon={<Webhook className="h-4 w-4" />}>
        <div className="space-y-4">
          {config.webhooks.length === 0 ? (
            <div className="p-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-300 text-center">
              <div className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:border-emerald-200 transition-colors">
                <Webhook className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No webhooks configured</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[240px] mx-auto">Add a webhook to send real-time event data to external services</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {config.webhooks.map((webhook) => (
                <div
                  key={webhook.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-200 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="text-sm font-bold text-slate-900 truncate">{webhook.name}</h4>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${webhook.enabled
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                        >
                          {webhook.enabled ? (
                            <CheckCircle2 className="h-2.5 w-2.5" />
                          ) : (
                            <XCircle className="h-2.5 w-2.5" />
                          )}
                          {webhook.enabled ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                        {webhook.failureCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            {webhook.failureCount} FAILURES
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate mb-2.5">{webhook.url}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {webhook.events.map((event) => (
                          <span
                            key={event}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase border border-slate-200"
                          >
                            {event}
                          </span>
                        ))}
                      </div>
                      {webhook.lastTriggered && (
                        <p className="text-[10px] text-slate-400 mt-2.5 font-medium">
                          Last triggered: {formatDateTime(webhook.lastTriggered)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        onClick={() => toggleWebhook(webhook.id)}
                        aria-label={webhook.enabled ? 'Disable webhook' : 'Enable webhook'}
                      >
                        {webhook.enabled ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => setDeleteWebhookId(webhook.id)}
                        aria-label="Delete webhook"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Cloud Storage */}
      <SettingsCard title="Cloud Storage Integration" icon={<Cloud className="h-4 w-4" />}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Storage Provider"
              value={config.storage.provider}
              onChange={(val) => handleStorageChange('provider', val as any)}
              options={[
                { label: 'Local Server', value: 'local' },
                { label: 'Amazon S3', value: 'aws-s3' },
                { label: 'Azure Blob Storage', value: 'azure-blob' },
                { label: 'Google Cloud Storage', value: 'google-cloud' },
              ]}
            />
            {config.storage.provider !== 'local' && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                  Bucket / Container Name
                </label>
                <input
                  type="text"
                  value={config.storage.bucketName}
                  onChange={(e) => handleStorageChange('bucketName', e.target.value)}
                  className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                  placeholder="my-eqms-bucket"
                />
              </div>
            )}
          </div>
          {config.storage.provider !== 'local' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Region
                  </label>
                  <input
                    type="text"
                    value={config.storage.region}
                    onChange={(e) => handleStorageChange('region', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                    placeholder="ap-southeast-1"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Base Path
                  </label>
                  <input
                    type="text"
                    value={config.storage.basePath}
                    onChange={(e) => handleStorageChange('basePath', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                    placeholder="/documents"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Access Key ID
                  </label>
                  <input
                    type="text"
                    value={config.storage.accessKeyId}
                    onChange={(e) => handleStorageChange('accessKeyId', e.target.value)}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                    placeholder="AKIA..."
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Secret Access Key
                  </label>
                  <div className="relative">
                    <input
                      type={showStorageKey ? 'text' : 'password'}
                      value={config.storage.secretAccessKey}
                      onChange={(e) => handleStorageChange('secretAccessKey', e.target.value)}
                      className="w-full h-9 px-3.5 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter secret key"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStorageKey(!showStorageKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showStorageKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <Checkbox
                  id="enableCdn"
                  label="Enable CDN (Content Delivery Network)"
                  checked={config.storage.enableCdn}
                  onChange={(checked) => handleStorageChange('enableCdn', checked)}
                />
                {config.storage.enableCdn && (
                  <div className="mt-3">
                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                      CDN URL
                    </label>
                    <input
                      type="url"
                      value={config.storage.cdnUrl}
                      onChange={(e) => handleStorageChange('cdnUrl', e.target.value)}
                      className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                      placeholder="https://cdn.example.com"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* API Security & CORS */}
      <SettingsCard title="API Security & CORS" icon={<Globe className="h-4 w-4" />}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
              <Checkbox
                id="enableApiKeyAuth"
                label="Enable API Key Authentication"
                checked={config.enableApiKeyAuth}
                onChange={(checked) => handleChange('enableApiKeyAuth', checked)}
              />
              <p className="text-xs text-slate-500 ml-7 mt-1.5 leading-relaxed">
                Require API keys for external API access
              </p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                Rate Limit (Requests/Min)
              </label>
              <input
                type="number"
                value={config.apiRateLimitPerMinute}
                onChange={(e) => handleChange('apiRateLimitPerMinute', parseInt(e.target.value))}
                className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                min={10}
                max={1000}
              />
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium uppercase tracking-wider">
                Max API requests per minute per client
              </p>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-3 uppercase tracking-tight">
              CORS Allowed Origins
            </label>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newOrigin}
                onChange={(e) => setNewOrigin(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCorsOrigin()}
                placeholder="https://app.example.com"
                className="flex-1 h-10 px-4 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <Button variant="default" size="sm" onClick={addCorsOrigin} className="h-10 px-6 shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Origin
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {config.corsAllowedOrigins.map((origin) => (
                <div
                  key={origin}
                  className="flex items-center justify-between p-2.5 pl-4 bg-slate-50/50 rounded-xl border border-slate-200 group hover:border-emerald-200 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-700 truncate">{origin}</span>
                  <button
                    onClick={() => removeCorsOrigin(origin)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {config.corsAllowedOrigins.length === 0 && (
                <div className="col-span-full p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-300 text-center">
                  <p className="text-xs text-slate-500 font-medium italic">
                    No origins configured — all cross-origin requests will be blocked
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};
