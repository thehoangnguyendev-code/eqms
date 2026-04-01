import React from "react";
import { Shield, Calendar, Users, Package, AlertTriangle, Info, Check } from "lucide-react";
import type { LicenseInfo } from "../types";
import { formatDateLong } from "@/utils/format";

interface LicenseTabProps {
  data: LicenseInfo;
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

export const LicenseTab: React.FC<LicenseTabProps> = ({ data }) => {
  const isExpiringSoon = data.daysUntilExpiry <= 90;
  const userUsagePercent = (data.activeUsers / data.maxUsers) * 100;

  return (
    <div className="p-5 space-y-4">
      {/* Expiry Warning Banner */}
      {isExpiringSoon && (
        <div className="flex gap-3 px-4 py-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900 mb-0.5">License Expiring Soon</p>
            <p className="text-sm text-amber-700">
              Your license will expire in <strong>{data.daysUntilExpiry} days</strong> on{" "}
              <strong>{formatDateLong(data.expiryDate)}</strong>. Please contact your account manager to renew.
            </p>
          </div>
        </div>
      )}

      {/* Card: License Details */}
      <SettingsCard title="License Details" icon={<Shield className="h-4 w-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">License Type</label>
            <input type="text" value={data.licenseType} readOnly className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default focus:outline-none font-semibold" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
            <input type="text" value={data.companyName} readOnly className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default focus:outline-none" />
          </div>
        </div>
      </SettingsCard>

      {/* Card: Validity Period */}
      <SettingsCard title="Validity Period" icon={<Calendar className="h-4 w-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Issued Date</label>
            <input type="text" value={formatDateLong(data.issuedDate)} readOnly className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Expiry Date</label>
            <input type="text" value={formatDateLong(data.expiryDate)} readOnly className={`w-full h-9 px-3.5 text-sm border rounded-lg cursor-default focus:outline-none font-semibold ${isExpiringSoon ? "border-amber-300 bg-amber-50 text-amber-900" : "border-slate-200 bg-slate-50 text-slate-700"
              }`} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Days Until Expiry</label>
            <div className={`flex items-center h-9 px-3.5 border rounded-lg ${isExpiringSoon ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50"
              }`}>
              <span className={`text-sm font-semibold ${isExpiringSoon ? "text-amber-900" : "text-slate-700"}`}>
                {data.daysUntilExpiry} days remaining
              </span>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Card: User Licenses */}
      <SettingsCard title="User Licenses" icon={<Users className="h-4 w-4" />}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <p className="text-xs font-medium text-slate-500 mb-1">Active Users</p>
              <p className="text-2xl font-bold text-slate-900">{data.activeUsers}</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <p className="text-xs font-medium text-slate-500 mb-1">Maximum Users</p>
              <p className="text-2xl font-bold text-slate-900">{data.maxUsers}</p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">License Utilization</span>
              <span className="text-xs font-bold text-slate-700">{userUsagePercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${userUsagePercent >= 90 ? "bg-red-600" : userUsagePercent >= 75 ? "bg-amber-500" : "bg-emerald-600"
                  }`}
                style={{ width: `${userUsagePercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {userUsagePercent >= 90 && <><AlertTriangle className="h-3.5 w-3.5 text-red-600 inline shrink-0" /> License limit approaching</>}
              {userUsagePercent >= 75 && userUsagePercent < 90 && <><AlertTriangle className="h-3.5 w-3.5 text-amber-600 inline shrink-0" /> High license usage</>}
              {userUsagePercent < 75 && `${data.maxUsers - data.activeUsers} licenses available`}
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Card: Licensed Modules */}
      <SettingsCard title="Licensed Modules" icon={<Package className="h-4 w-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {data.modules.map((module, index) => (
            <div key={index} className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-50/80 transition-colors">
              <div className="flex items-center justify-center h-6 w-6 rounded-lg bg-emerald-100 flex-shrink-0">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-slate-800">{module}</span>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Notice Strip */}
      <div className="flex gap-3 px-4 py-3.5 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-blue-900 mb-0.5">License Support</p>
          <p className="text-xs text-blue-700">For license renewal, upgrade inquiries, or additional user licenses, contact your account manager or email: licensing@eqms.company.com</p>
        </div>
      </div>
    </div>
  );
};
