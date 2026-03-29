import React from "react";
import { ToggleLeft, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import type { FeatureFlag } from "../types";

interface FeaturesTabProps {
  features: FeatureFlag[];
}

export const FeaturesTab: React.FC<FeaturesTabProps> = ({ features }) => {
  const enabledFeatures = features.filter(f => f.enabled);
  const disabledFeatures = features.filter(f => !f.enabled);

  return (
    <div className="p-5 space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Total Features</p>
              <p className="text-2xl font-bold text-slate-900">{features.length}</p>
            </div>
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100">
              <ToggleLeft className="h-5 w-5 text-slate-500" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-600 mb-1">Enabled</p>
              <p className="text-2xl font-bold text-emerald-800">{enabledFeatures.length}</p>
            </div>
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-1">Disabled</p>
              <p className="text-2xl font-bold text-slate-700">{disabledFeatures.length}</p>
            </div>
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100">
              <XCircle className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Card: Enabled Features */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50/70 border-b border-slate-200">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-100 flex-shrink-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Enabled Features</h3>
            <p className="text-xs text-slate-500 mt-0.5">{enabledFeatures.length} features active</p>
          </div>
        </div>
        <div className="p-5">
          <div className="space-y-2.5">
            {enabledFeatures.map((feature) => (
              <div key={feature.id} className="flex items-start gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg">
                <Checkbox checked={feature.enabled} disabled id={`feature-${feature.id}`} className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <label htmlFor={`feature-${feature.id}`} className="block text-sm font-medium text-slate-900 mb-0.5 cursor-not-allowed">
                    {feature.name}
                  </label>
                  <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                  <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  On
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card: Disabled Features */}
      {disabledFeatures.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50/70 border-b border-slate-200">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-100 flex-shrink-0">
              <XCircle className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Disabled Features</h3>
              <p className="text-xs text-slate-500 mt-0.5">{disabledFeatures.length} features inactive</p>
            </div>
          </div>
          <div className="p-5">
            <div className="space-y-2.5">
              {disabledFeatures.map((feature) => (
                <div key={feature.id} className="flex items-start gap-3 px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-lg opacity-60">
                  <Checkbox checked={feature.enabled} disabled id={`feature-dis-${feature.id}`} className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <label htmlFor={`feature-dis-${feature.id}`} className="block text-xs sm:text-sm font-medium text-slate-700 mb-0.5 cursor-not-allowed">
                      {feature.name}
                    </label>
                    <p className="text-xs text-slate-500 leading-relaxed">{feature.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200 flex-shrink-0">
                    <span className="h-1 w-1 rounded-full bg-slate-400" />
                    Off
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notice Strip */}
      <div className="flex gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-900 mb-0.5">Feature Configuration</p>
          <p className="text-xs text-amber-700">Feature flags are managed by system administrators. To request changes, contact your IT department or submit a change request.</p>
        </div>
      </div>
    </div>
  );
};
