import React, { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, Tag, CheckCircle2, Wrench, Bug } from "lucide-react";
import { MOCK_CHANGELOG } from "../mockData";
import { formatDateLong } from "@/utils/format";

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
          <div className="text-xs text-slate-500 mt-0.5">Total Releases</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {MOCK_CHANGELOG.reduce((sum, e) => sum + (e.changes.features?.length ?? 0), 0)}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">New Features</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">
            {MOCK_CHANGELOG.reduce((sum, e) => sum + (e.changes.bugFixes?.length ?? 0), 0)}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Bug Fixes</div>
        </div>
      </div>

      {/* Changelog entries */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50/70 border-b border-slate-200">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-100 flex-shrink-0">
            <Tag className="h-4 w-4 text-emerald-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Version History</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {MOCK_CHANGELOG.map((entry) => {
            const isExpanded = expandedVersions.has(entry.version);
            const hasFeatures = entry.changes.features && entry.changes.features.length > 0;
            const hasImprovements =
              entry.changes.improvements && entry.changes.improvements.length > 0;
            const hasBugFixes = entry.changes.bugFixes && entry.changes.bugFixes.length > 0;

            return (
              <div key={entry.version} className="transition-colors hover:bg-slate-50/50">
                <button
                  onClick={() => toggleVersion(entry.version)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className=" font-semibold text-slate-900">
                      v{entry.version}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="text-sm">{formatDateLong(entry.releaseDate)}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      {hasFeatures && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          {entry.changes.features!.length} feature{entry.changes.features!.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      {hasImprovements && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <Wrench className="h-3 w-3" />
                          {entry.changes.improvements!.length} improvement{entry.changes.improvements!.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      {hasBugFixes && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Bug className="h-3 w-3" />
                          {entry.changes.bugFixes!.length} fix{entry.changes.bugFixes!.length !== 1 ? "es" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {hasFeatures && (
                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          New Features
                        </h4>
                        <ul className="space-y-1.5 ml-6">
                          {entry.changes.features!.map((feature, idx) => (
                            <li key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                              <span className="text-emerald-600 flex-shrink-0">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {hasImprovements && (
                      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-blue-600" />
                          Improvements
                        </h4>
                        <ul className="space-y-1.5 ml-6">
                          {entry.changes.improvements!.map((improvement, idx) => (
                            <li key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                              <span className="text-blue-600 flex-shrink-0">•</span>
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {hasBugFixes && (
                      <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          <Bug className="h-4 w-4 text-amber-600" />
                          Bug Fixes
                        </h4>
                        <ul className="space-y-1.5 ml-6">
                          {entry.changes.bugFixes!.map((fix, idx) => (
                            <li key={idx} className="text-sm text-slate-700 flex items-center gap-2">
                              <span className="text-amber-600 flex-shrink-0">•</span>
                              <span>{fix}</span>
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
      </div>
    </div>
  );
};
