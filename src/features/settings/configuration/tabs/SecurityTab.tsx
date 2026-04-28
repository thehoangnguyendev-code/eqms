import React, { useState } from 'react';
import { SecurityConfig } from '../types';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { Select } from '@/components/ui/select/Select';
import { Button } from '@/components/ui/button/Button';
import { Plus, X, Lock, CheckCircle2, Clock, Shield, Globe, ClipboardList } from 'lucide-react';
import { IconFilter2Search, IconKey, IconLock } from '@tabler/icons-react';

interface SecurityTabProps {
  config: SecurityConfig;
  onChange: (config: SecurityConfig) => void;
}

const SettingsCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-4 md:px-5 py-4 border-b border-slate-100">
      <span className="text-emerald-600">{icon}</span>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    </div>
    <div className="p-4 md:p-5">{children}</div>
  </div>
);

export const SecurityTab: React.FC<SecurityTabProps> = ({ config, onChange }) => {
  const [newIp, setNewIp] = useState('');
  const [newCountry, setNewCountry] = useState('');

  const handleChange = (key: keyof SecurityConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleIpSecurityChange = (key: keyof SecurityConfig['ipSecurity'], value: any) => {
    onChange({
      ...config,
      ipSecurity: {
        ...config.ipSecurity,
        [key]: value,
      },
    });
  };

  const handleAuditSettingsChange = (key: keyof SecurityConfig['auditSettings'], value: any) => {
    onChange({
      ...config,
      auditSettings: {
        ...config.auditSettings,
        [key]: value,
      },
    });
  };

  const addWhitelistedIp = () => {
    if (newIp.trim()) {
      handleIpSecurityChange('whitelistedIps', [...config.ipSecurity.whitelistedIps, newIp.trim()]);
      setNewIp('');
    }
  };

  const removeWhitelistedIp = (ip: string) => {
    handleIpSecurityChange(
      'whitelistedIps',
      config.ipSecurity.whitelistedIps.filter((i) => i !== ip)
    );
  };

  const addBlockedCountry = () => {
    if (newCountry.trim()) {
      handleIpSecurityChange('blockedCountries', [...config.ipSecurity.blockedCountries, newCountry.trim()]);
      setNewCountry('');
    }
  };

  const removeBlockedCountry = (country: string) => {
    handleIpSecurityChange(
      'blockedCountries',
      config.ipSecurity.blockedCountries.filter((c) => c !== country)
    );
  };

  return (
    <div className="p-4 md:p-5 space-y-4">
      {/* Password Policies */}
      <SettingsCard title="Password Policies" icon={<Lock className="h-4 w-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Minimum Password Length
            </label>
            <input
              type="number"
              value={config.passwordMinLength}
              onChange={(e) => handleChange('passwordMinLength', parseInt(e.target.value))}
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              min={8}
            />
            <p className="text-xs text-slate-500 mt-1">
              Minimum: 8 characters
            </p>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Session Timeout (Minutes)
            </label>
            <input
              type="number"
              value={config.sessionTimeoutMinutes}
              onChange={(e) => handleChange('sessionTimeoutMinutes', parseInt(e.target.value))}
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Idle time before automatic logout
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Password Requirements */}
      <SettingsCard title="Password Requirements" icon={<IconKey className="h-4 w-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Checkbox
            id="requireUppercase"
            label="Require Uppercase Letters (A-Z)"
            checked={config.requireUppercase}
            onChange={(checked) => handleChange('requireUppercase', checked)}
          />
          <Checkbox
            id="requireLowercase"
            label="Require Lowercase Letters (a-z)"
            checked={config.requireLowercase}
            onChange={(checked) => handleChange('requireLowercase', checked)}
          />
          <Checkbox
            id="requireSpecialChars"
            label="Require Special Characters (@, #, $, etc.)"
            checked={config.requireSpecialChars}
            onChange={(checked) => handleChange('requireSpecialChars', checked)}
          />
          <Checkbox
            id="requireNumbers"
            label="Require Numbers (0-9)"
            checked={config.requireNumbers}
            onChange={(checked) => handleChange('requireNumbers', checked)}
          />
        </div>
      </SettingsCard>

      {/* Password Expiry & History */}
      <SettingsCard title="Password Expiry & History" icon={<Clock className="h-4 w-4" />}>
        <div className="space-y-4">
          <div>
            <Checkbox
              id="enablePasswordExpiry"
              label="Enable Password Expiration"
              checked={config.enablePasswordExpiry}
              onChange={(checked) => handleChange('enablePasswordExpiry', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              Force users to change their password periodically
            </p>
          </div>
          {config.enablePasswordExpiry && (
            <div className="ml-7">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                Password Expiry Period (Days)
              </label>
              <input
                type="number"
                value={config.passwordExpiryDays}
                onChange={(e) => handleChange('passwordExpiryDays', parseInt(e.target.value))}
                className="w-full md:w-64 h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                min={30}
                max={365}
              />
              <p className="text-xs text-slate-500 mt-1">
                Users must change password every {config.passwordExpiryDays} days
              </p>
            </div>
          )}

          <div className="pt-2">
            <Checkbox
              id="preventPasswordReuse"
              label="Prevent Password Reuse"
              checked={config.preventPasswordReuse}
              onChange={(checked) => handleChange('preventPasswordReuse', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              Prevent users from reusing recent passwords
            </p>
            {config.preventPasswordReuse && (
              <div className="ml-7 mt-3">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                  Password History Count
                </label>
                <input
                  type="number"
                  value={config.passwordHistoryCount}
                  onChange={(e) => handleChange('passwordHistoryCount', parseInt(e.target.value))}
                  className="w-full md:w-64 h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  min={3}
                  max={24}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Remember last {config.passwordHistoryCount} passwords and prevent reuse
                </p>
              </div>
            )}
          </div>
        </div>
      </SettingsCard>

      {/* Session & Account Security */}
      <SettingsCard title="Session & Account Security" icon={<Shield className="h-4 w-4" />}>
        <div className="space-y-4">
          <div>
            <Checkbox
              id="enable2FA"
              label="Enforce Two-Factor Authentication (2FA)"
              checked={config.enable2FA}
              onChange={(checked) => handleChange('enable2FA', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              All users must set up 2FA using an authenticator app (Google Authenticator, Authy, etc.)
            </p>
          </div>

          <div className="pt-2">
            <Checkbox
              id="enableAutoLogout"
              label="Enable Automatic Logout"
              checked={config.enableAutoLogout}
              onChange={(checked) => handleChange('enableAutoLogout', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              Automatically log out users after a period of inactivity
            </p>
            {config.enableAutoLogout && (
              <div className="ml-7 mt-3">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                  Auto Logout After (Minutes)
                </label>
                <input
                  type="number"
                  value={config.autoLogoutMinutes}
                  onChange={(e) => handleChange('autoLogoutMinutes', parseInt(e.target.value))}
                  className="w-full md:w-64 h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  min={1}
                  max={120}
                />
                <p className="text-xs text-slate-500 mt-1">
                  System will automatically logout after {config.autoLogoutMinutes} minutes of inactivity
                </p>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Checkbox
              id="enableAccountLockout"
              label="Enable Account Lockout"
              checked={config.enableAccountLockout}
              onChange={(checked) => handleChange('enableAccountLockout', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              Lock user accounts after multiple failed login attempts
            </p>
            {config.enableAccountLockout && (
              <div className="ml-7 mt-3">
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                  Maximum Login Attempts
                </label>
                <input
                  type="number"
                  value={config.maxLoginAttempts}
                  onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full md:w-64 h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  min={3}
                  max={10}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Account will be locked after {config.maxLoginAttempts} consecutive failed login attempts. Only administrators can unlock the account.
                </p>
              </div>
            )}
          </div>
        </div>
      </SettingsCard>

      {/* IP Access Control */}
      <SettingsCard title="IP Access Control & Geo-blocking" icon={<Globe className="h-4 w-4" />}>
        <div className="space-y-4">
          <div>
            <Checkbox
              id="enableIpWhitelisting"
              label="Enable IP Whitelisting"
              checked={config.ipSecurity.enableIpWhitelisting}
              onChange={(checked) => handleIpSecurityChange('enableIpWhitelisting', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              Only allow access from specified IP addresses or ranges
            </p>
          </div>

          {config.ipSecurity.enableIpWhitelisting && (
            <div className="ml-7 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                  Whitelisted IPs / CIDR Ranges
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addWhitelistedIp()}
                    placeholder="192.168.1.1 or 10.0.0.0/24"
                    className="flex-1 h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 "
                  />
                  <Button variant="default" size="sm" onClick={addWhitelistedIp}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {config.ipSecurity.whitelistedIps.map((ip) => (
                    <div key={ip} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <span className="text-sm font-medium text-slate-700">{ip}</span>
                      <button
                        onClick={() => removeWhitelistedIp(ip)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {config.ipSecurity.whitelistedIps.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No whitelisted IPs configured</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <Checkbox
              id="enableGeoBlocking"
              label="Enable Geographic Blocking"
              checked={config.ipSecurity.enableGeoBlocking}
              onChange={(checked) => handleIpSecurityChange('enableGeoBlocking', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              Block access from specific countries or regions
            </p>

            {config.ipSecurity.enableGeoBlocking && (
              <div className="ml-7 mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                    Blocked Countries (ISO 2-letter codes)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && addBlockedCountry()}
                      placeholder="e.g., CN, RU, KP"
                      className="flex-1 h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500  uppercase"
                      maxLength={2}
                    />
                    <Button variant="default" size="sm" onClick={addBlockedCountry}>
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {config.ipSecurity.blockedCountries.map((country) => (
                      <div key={country} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <span className="text-sm font-medium text-slate-700">{country}</span>
                        <button
                          onClick={() => removeBlockedCountry(country)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {config.ipSecurity.blockedCountries.length === 0 && (
                      <p className="text-xs text-slate-500 italic">No blocked countries configured</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Checkbox
              id="allowVpnConnections"
              label="Allow VPN Connections"
              checked={config.ipSecurity.allowVpnConnections}
              onChange={(checked) => handleIpSecurityChange('allowVpnConnections', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              If disabled, connections from VPN/proxy servers will be blocked
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Audit & Logging */}
      <SettingsCard title="Audit & Logging" icon={<IconFilter2Search className="h-4 w-4" />}>
        <div className="space-y-4">
          <div>
            <Checkbox
              id="enableDetailedAuditLog"
              label="Enable Detailed Audit Logging"
              checked={config.auditSettings.enableDetailedAuditLog}
              onChange={(checked) => handleAuditSettingsChange('enableDetailedAuditLog', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              Log all user actions, changes, and system events for compliance
            </p>
          </div>

          {config.auditSettings.enableDetailedAuditLog && (
            <div className="ml-7 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Log Level"
                  value={config.auditSettings.logLevel}
                  onChange={(val) => handleAuditSettingsChange('logLevel', val as 'minimal' | 'standard' | 'detailed')}
                  options={[
                    { label: 'Minimal (Critical events only)', value: 'minimal' },
                    { label: 'Standard (Important actions)', value: 'standard' },
                    { label: 'Detailed (All user activities)', value: 'detailed' },
                  ]}
                />
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Retain Logs For (Days)
                  </label>
                  <input
                    type="number"
                    value={config.auditSettings.retainLogsForDays}
                    onChange={(e) => handleAuditSettingsChange('retainLogsForDays', parseInt(e.target.value))}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    min={30}
                    max={3650}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Logs older than {config.auditSettings.retainLogsForDays} days will be archived
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Checkbox
                    id="logSensitiveData"
                    label="Log Sensitive Data Actions"
                    checked={config.auditSettings.logSensitiveData}
                    onChange={(checked) => handleAuditSettingsChange('logSensitiveData', checked)}
                  />
                  <p className="text-xs text-slate-500 ml-7">
                    Include PHI/PII modifications in audit logs (may require encryption)
                  </p>
                </div>
                <div>
                  <Checkbox
                    id="enableRealTimeAlerts"
                    label="Enable Real-Time Alerts"
                    checked={config.auditSettings.enableRealTimeAlerts}
                    onChange={(checked) => handleAuditSettingsChange('enableRealTimeAlerts', checked)}
                  />
                  <p className="text-xs text-slate-500 ml-7">
                    Send immediate notifications for critical security events
                  </p>
                </div>
                <div>
                  <Checkbox
                    id="alertOnSuspiciousActivity"
                    label="Alert on Suspicious Activity"
                    checked={config.auditSettings.alertOnSuspiciousActivity}
                    onChange={(checked) => handleAuditSettingsChange('alertOnSuspiciousActivity', checked)}
                  />
                  <p className="text-xs text-slate-500 ml-7">
                    Detect and alert on unusual patterns (e.g., multiple failed logins, after-hours access)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>
    </div>
  );
};
