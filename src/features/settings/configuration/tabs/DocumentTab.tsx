import React from 'react';
import { DocumentConfig } from '../types';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { Select } from '@/components/ui/select/Select';
import { MultiSelect } from '@/components/ui/select/MultiSelect';
import { Archive, Shield, GitBranch, PenSquare } from 'lucide-react';

interface DocumentTabProps {
  config: DocumentConfig;
  onChange: (config: DocumentConfig) => void;
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

export const DocumentTab: React.FC<DocumentTabProps> = ({ config, onChange }) => {
  const handleChange = (key: keyof DocumentConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };

  const handleVersionControlChange = (key: keyof DocumentConfig['versionControl'], value: any) => {
    onChange({
      ...config,
      versionControl: {
        ...config.versionControl,
        [key]: value,
      },
    });
  };

  const handleESignatureChange = (key: keyof DocumentConfig['eSignature'], value: any) => {
    onChange({
      ...config,
      eSignature: {
        ...config.eSignature,
        [key]: value,
      },
    });
  };

  return (
    <div className="p-5 space-y-4">
      {/* Retention & Storage */}
      <SettingsCard title="Retention & Storage" icon={<Archive className="h-4 w-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Default Retention Period (Days)
            </label>
            <input
              type="number"
              value={config.defaultRetentionPeriodDays}
              onChange={(e) => handleChange('defaultRetentionPeriodDays', parseInt(e.target.value))}
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              min={0}
            />
            <p className="text-xs text-slate-500 mt-1">
              Number of days to retain documents after archiving
            </p>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Max File Size (MB)
            </label>
            <input
              type="number"
              value={config.maxFileSizeMB}
              onChange={(e) => handleChange('maxFileSizeMB', parseInt(e.target.value))}
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              min={1}
            />
            <p className="text-xs text-slate-500 mt-1">
              Maximum file size for document uploads
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Protection & Distribution */}
      <SettingsCard title="Protection & Distribution" icon={<Shield className="h-4 w-4" />}>
        <div className="space-y-4">
          <div>
            <Checkbox
              id="enableWatermark"
              label="Enable Watermarking"
              checked={config.enableWatermark}
              onChange={(checked) => handleChange('enableWatermark', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              Apply "Confidential" watermark to all document previews and downloads
            </p>
          </div>
          
          <div className="pt-2">
            <Checkbox
              id="allowDownload"
              label="Allow Document Download"
              checked={config.allowDownload}
              onChange={(checked) => handleChange('allowDownload', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              If disabled, documents can only be viewed within the system viewer
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Version Control */}
      <SettingsCard title="Version Control" icon={<GitBranch className="h-4 w-4" />}>
        <div className="space-y-4">
          <div>
            <Checkbox
              id="enableAutoVersioning"
              label="Enable Automatic Versioning"
              checked={config.versionControl.enableAutoVersioning}
              onChange={(checked) => handleVersionControlChange('enableAutoVersioning', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              Automatically create new versions when documents are modified
            </p>
          </div>

          {config.versionControl.enableAutoVersioning && (
            <div className="ml-7 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Maximum Versions to Keep
                  </label>
                  <input
                    type="number"
                    value={config.versionControl.maxVersionsToKeep}
                    onChange={(e) => handleVersionControlChange('maxVersionsToKeep', parseInt(e.target.value))}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    min={1}
                    max={50}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Older versions will be automatically archived
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <Checkbox
                  id="majorMinorVersioning"
                  label="Use Major.Minor Versioning (e.g., v1.0, v1.1, v2.0)"
                  checked={config.versionControl.majorMinorVersioning}
                  onChange={(checked) => handleVersionControlChange('majorMinorVersioning', checked)}
                />
                <div>
                  <Checkbox
                    id="requireVersionNotes"
                    label="Require Version Notes"
                    checked={config.versionControl.requireVersionNotes}
                    onChange={(checked) => handleVersionControlChange('requireVersionNotes', checked)}
                  />
                  <p className="text-xs text-slate-500 ml-7">
                    Users must provide a description when creating new versions
                  </p>
                </div>
                <div>
                  <Checkbox
                    id="compareVersionsEnabled"
                    label="Enable Version Comparison"
                    checked={config.versionControl.compareVersionsEnabled}
                    onChange={(checked) => handleVersionControlChange('compareVersionsEnabled', checked)}
                  />
                  <p className="text-xs text-slate-500 ml-7">
                    Allow users to view side-by-side comparison of different versions
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* E-Signature Settings */}
      <SettingsCard title="Electronic Signature (E-Signature)" icon={<PenSquare className="h-4 w-4" />}>
        <div className="space-y-4">
          <div>
            <Checkbox
              id="enableESignature"
              label="Enable Electronic Signatures"
              checked={config.eSignature.enableESignature}
              onChange={(checked) => handleESignatureChange('enableESignature', checked)}
            />
            <p className="text-xs text-slate-500 ml-7">
              Allow users to electronically sign documents for approval (21 CFR Part 11 compliant)
            </p>
          </div>

          {config.eSignature.enableESignature && (
            <div className="ml-7 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                    Signature Validity Period (Days)
                  </label>
                  <input
                    type="number"
                    value={config.eSignature.signatureValidityDays}
                    onChange={(e) => handleESignatureChange('signatureValidityDays', parseInt(e.target.value))}
                    className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    min={30}
                    max={3650}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    How long signatures remain valid before re-certification
                  </p>
                </div>
                <div>
                  <MultiSelect
                    label="Allowed Signing Methods"
                    value={config.eSignature.signingMethods}
                    onChange={(val) => handleESignatureChange('signingMethods', val)}
                    options={[
                      { label: 'Password Authentication', value: 'password' },
                      { label: 'OTP (One-Time Password)', value: 'otp' },
                      { label: 'Biometric (Fingerprint/Face ID)', value: 'biometric' },
                      { label: 'Digital Certificate (PKI)', value: 'certificate' },
                    ]}
                    placeholder="Select signing methods..."
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Users can sign using any of the enabled methods
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Checkbox
                    id="requirePasswordForSigning"
                    label="Require Password Confirmation for Signing"
                    checked={config.eSignature.requirePasswordForSigning}
                    onChange={(checked) => handleESignatureChange('requirePasswordForSigning', checked)}
                  />
                  <p className="text-xs text-slate-500 ml-7">
                    Users must re-enter their password when signing documents
                  </p>
                </div>
                <div>
                  <Checkbox
                    id="enforceSigningOrder"
                    label="Enforce Sequential Signing Order"
                    checked={config.eSignature.enforceSigningOrder}
                    onChange={(checked) => handleESignatureChange('enforceSigningOrder', checked)}
                  />
                  <p className="text-xs text-slate-500 ml-7">
                    Documents must be signed in a specific order (e.g., author → reviewer → approver)
                  </p>
                </div>
                <div>
                  <Checkbox
                    id="allowDigitalCertificates"
                    label="Allow Digital Certificates (X.509/PKI)"
                    checked={config.eSignature.allowDigitalCertificates}
                    onChange={(checked) => handleESignatureChange('allowDigitalCertificates', checked)}
                  />
                  <p className="text-xs text-slate-500 ml-7">
                    Enable signing with digital certificates for enhanced security
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
