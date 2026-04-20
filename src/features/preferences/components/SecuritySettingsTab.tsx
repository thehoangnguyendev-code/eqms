import React, { useMemo, useState } from 'react';
import { ShieldCheck, KeyRound, Mail, Clock3, CheckCircle2, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button/Button';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { cn } from '@/components/ui/utils';
import { AlertModal } from '@/components/ui/modal/AlertModal';

const OTP_LENGTH = 6;

const ToggleSwitch: React.FC<{ checked: boolean; disabled?: boolean; onChange: () => void }> = ({
  checked,
  disabled,
  onChange,
}) => {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
        checked ? 'bg-emerald-500' : 'bg-slate-300',
        disabled && 'cursor-not-allowed opacity-60'
      )}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
};

export const SecuritySettingsTab: React.FC = () => {
  const [appMfaEnabled, setAppMfaEnabled] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [setupCode, setSetupCode] = useState('');
  const [setupError, setSetupError] = useState('');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [emailFallbackEnabled, setEmailFallbackEnabled] = useState(true);
  const [rememberDeviceEnabled, setRememberDeviceEnabled] = useState(true);

  const enrollmentUri = useMemo(() => {
    return 'otpauth://totp/EQMS:admin%40eqms.com?secret=JBSWY3DPEHPK3PXP&issuer=EQMS';
  }, []);

  const handleSetupCodeChange = (value: string) => {
    const numericOnly = value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setSetupCode(numericOnly);
    setSetupError('');
  };

  const handleEnableAppMfa = () => {
    if (setupCode.length < OTP_LENGTH) {
      setSetupError('Please enter a valid 6-digit authenticator code.');
      return;
    }

    setAppMfaEnabled(true);
    setEnrollOpen(false);
    setSetupCode('');
    setSetupError('');
  };

  const handleDisableAppMfa = () => {
    setAppMfaEnabled(false);
    setResetConfirmOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-semibold">2FA Policy: Required</p>
        <p className="mt-1 text-xs text-amber-800">
          Multi-factor authentication is mandatory for all users. You can choose verification method at sign-in.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-slate-900">Authenticator App</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3 py-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">App MFA status</p>
              <p className="mt-1 text-xs text-slate-500">
                Recommended primary method for secure and reliable verification.
              </p>
            </div>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                appMfaEnabled
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              )}
            >
              {appMfaEnabled ? 'Enabled' : 'Not enabled'}
            </span>
          </div>

          {!appMfaEnabled ? (
            <div className="space-y-3">
              <Button type="button" size="sm" onClick={() => setEnrollOpen((prev) => !prev)}>
                {enrollOpen ? 'Hide Setup' : 'Setup Authenticator App'}
              </Button>

              {enrollOpen && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[120px_1fr] md:items-start">
                    <div className="flex justify-center rounded-lg border border-emerald-100 bg-white p-2">
                      <QRCodeSVG value={enrollmentUri} size={96} />
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-900">
                        1. Scan QR with Google Authenticator, Microsoft Authenticator, or Authy.
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        2. Enter the 6-digit code to complete setup.
                      </p>

                      <div className="space-y-2">
                        <label htmlFor="setup-otp" className="block text-xs font-semibold text-slate-700">
                          Verification Code
                        </label>
                        <input
                          id="setup-otp"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          value={setupCode}
                          onChange={(e) => handleSetupCodeChange(e.target.value)}
                          className={cn(
                            'h-11 w-full rounded-md border bg-white px-3 text-sm text-slate-700 outline-none transition-all',
                            'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                            setupError ? 'border-red-300' : 'border-slate-300'
                          )}
                          placeholder="Enter 6-digit code"
                        />
                        {setupError && <p className="text-xs font-medium text-red-600">{setupError}</p>}
                      </div>

                      <Button type="button" size="sm" onClick={handleEnableAppMfa}>
                        Confirm and Enable
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Authenticator app is active
              </div>
              <Button type="button" size="sm" variant="outline-emerald" onClick={() => setResetConfirmOpen(true)}>
                Reset Setup
              </Button>
            </div>
          )}
        </div>
      </section>

      <div className="h-px bg-slate-200" />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-slate-900">Fallback and Session</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Mail className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Email OTP fallback</p>
                <p className="text-xs text-slate-500">Used when authenticator app is unavailable.</p>
              </div>
            </div>
            <ToggleSwitch
              checked={emailFallbackEnabled}
              onChange={() => setEmailFallbackEnabled((prev) => !prev)}
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Clock3 className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Remember this device</p>
                <p className="text-xs text-slate-500">Skip MFA on trusted device for 8 hours.</p>
              </div>
            </div>
            <Checkbox
              id="rememberDevicePref"
              checked={rememberDeviceEnabled}
              onChange={setRememberDeviceEnabled}
              label="Enabled"
              labelClassName="text-xs text-slate-600"
            />
          </div>
        </div>
      </section>

      <AlertModal
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleDisableAppMfa}
        type="warning"
        title="Reset Authenticator App?"
        description="This will remove your current authenticator app setup. You will need to re-enroll to use it for MFA. Your email OTP fallback will remain active."
        confirmText="Reset"
        cancelText="Cancel"
      />
    </div>
  );
};
