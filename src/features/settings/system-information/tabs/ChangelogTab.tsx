import React, { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, Tag, CheckCircle2, Wrench, Bug } from "lucide-react";
import { MOCK_CHANGELOG } from "../mockData";
import { formatDateLong } from "@/utils/format";

const SettingsCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
}> = ({ title, icon, children, noPadding = false }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
      <span className="text-emerald-600">{icon}</span>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    </div>
    <div className={noPadding ? "" : "p-5"}>{children}</div>
  </div>
);

export const ChangelogTab: React.FC = () => {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(
    new Set([MOCK_CHANGELOG[0]?.version])
  );

  const toggleVersion = (version: string) => {
    setExpandedVersions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(version)) {
        newSet.delete(version);
      } else {
        newSet.add(version);
      }
      return newSet;
    });
  };

  return (
    <div className="p-5 space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-slate-900">{MOCK_CHANGELOG.length}</div>
          <div className="text-[10px] sm:text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Total Releases</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {MOCK_CHANGELOG.reduce((sum, e) => sum + (e.changes.features?.length ?? 0), 0)}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-emerald-600/70 mt-1 uppercase tracking-wider">New Features</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">
            {MOCK_CHANGELOG.reduce((sum, e) => sum + (e.changes.bugFixes?.length ?? 0), 0)}
          </div>
          <div className="text-[10px] sm:text-xs font-bold text-amber-600/70 mt-1 uppercase tracking-wider">Bug Fixes</div>
        </div>
      </div>

      {/* Changelog entries */}
      <SettingsCard title="Version History" icon={<Tag className="h-4 w-4" />} noPadding>
        <div className="divide-y divide-slate-100">
          {MOCK_CHANGELOG.map((entry) => {
            const isExpanded = expandedVersions.has(entry.version);
            const hasFeatures = entry.changes.features && entry.changes.features.length > 0;
            const hasImprovements =
              entry.changes.improvements && entry.changes.improvements.length > 0;
            const hasBugFixes = entry.changes.bugFixes && entry.changes.bugFixes.length > 0;

            return (
              <div key={entry.version} className="transition-colors hover:bg-slate-50/30">
                <button
                  onClick={() => toggleVersion(entry.version)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="text-base font-bold text-slate-900">
                      v{entry.version}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-xs sm:text-sm">{formatDateLong(entry.releaseDate)}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      {hasFeatures && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-tighter">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          {entry.changes.features!.length} New
                        </span>
                      )}
                      {hasImprovements && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-tighter">
                          <Wrench className="h-2.5 w-2.5" />
                          {entry.changes.improvements!.length} Imp.
                        </span>
                      )}
                      {hasBugFixes && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-tighter">
                          <Bug className="h-2.5 w-2.5" />
                          {entry.changes.bugFixes!.length} Fix
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg border border-slate-100 bg-white shadow-sm flex items-center justify-center">
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {hasFeatures && (
                      <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-emerald-900 mb-2.5 flex items-center gap-2 uppercase tracking-tight">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          New Features
                        </h4>
                        <ul className="space-y-2 ml-1">
                          {entry.changes.features!.map((feature, idx) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                              <span className="leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {hasImprovements && (
                      <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-blue-900 mb-2.5 flex items-center gap-2 uppercase tracking-tight">
                          <Wrench className="h-3.5 w-3.5 text-blue-600" />
                          Improvements
                        </h4>
                        <ul className="space-y-2 ml-1">
                          {entry.changes.improvements!.map((improvement, idx) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                              <span className="leading-relaxed">{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {hasBugFixes && (
                      <div className="bg-amber-50/30 border border-amber-100 rounded-xl p-4">
                        <h4 className="text-xs font-bold text-amber-900 mb-2.5 flex items-center gap-2 uppercase tracking-tight">
                          <Bug className="h-3.5 w-3.5 text-amber-600" />
                          Bug Fixes
                        </h4>
                        <ul className="space-y-2 ml-1">
                          {entry.changes.bugFixes!.map((fix, idx) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                              <span className="leading-relaxed">{fix}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SettingsCard>
    </div>
  );
};
