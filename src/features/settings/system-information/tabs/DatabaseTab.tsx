import React from "react";
import { Database, CheckCircle2, XCircle, Clock, Layers, BarChart3, ShieldAlert, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge/Badge";
import type { DatabaseInfo } from "../types";
import { formatDateTimeLong, formatDateUS } from "@/utils/format";
import { IconNetwork } from "@tabler/icons-react";

interface DatabaseTabProps {
  data: DatabaseInfo;
}

const SettingsCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
}> = ({ title, icon, children, noPadding = false }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2.5 px-4 md:px-5 py-4 border-b border-slate-100">
      <span className="text-emerald-600">{icon}</span>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
    </div>
    <div className={noPadding ? "" : "p-4 md:p-5"}>{children}</div>
  </div>
);

export const DatabaseTab: React.FC<DatabaseTabProps> = ({ data }) => {
  const getPoolUsagePercent = () => {
    if (!data.connectionPool) return 0;
    return Math.round((data.connectionPool.activeConnections / data.connectionPool.maxSize) * 100);
  };

  return (
    <div className="p-4 md:p-5 space-y-4">
      {/* Status Banner */}
      <div className={`flex items-center justify-between px-4 md:px-5 py-4 rounded-xl border ${data.connectionStatus === "connected"
        ? "bg-emerald-50 border-emerald-200"
        : "bg-red-50 border-red-200"
        }`}>
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0 ${data.connectionStatus === "connected" ? "bg-emerald-100" : "bg-red-100"
            }`}>
            {data.connectionStatus === "connected"
              ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              : <XCircle className="h-5 w-5 text-red-600" />
            }
          </div>
          <div>
            <p className={`text-sm font-semibold ${data.connectionStatus === "connected" ? "text-emerald-900" : "text-red-900"}`}>
              Database Connection
            </p>
            <p className={`text-xs mt-0.5 ${data.connectionStatus === "connected" ? "text-emerald-700" : "text-red-700"}`}>
              {data.connectionStatus === "connected" ? "Connection established successfully" : "Unable to connect to database"}
            </p>
          </div>
        </div>
        <Badge
          color={data.connectionStatus === "connected" ? "emerald" : "red"}
          showDot
          pill
        >
          {data.connectionStatus === "connected" ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      {/* Card: Database Configuration */}
      <SettingsCard title="Database Configuration" icon={<Database className="h-4 w-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Database Type</label>
            <input type="text" value={data.type} readOnly className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default focus:outline-none font-semibold" />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Version</label>
            <input type="text" value={data.version} readOnly className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default focus:outline-none " />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Host</label>
            <input type="text" value={data.host} readOnly className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default focus:outline-none " />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Port</label>
            <input type="text" value={data.port} readOnly className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default focus:outline-none " />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Database Name</label>
            <input type="text" value={data.database} readOnly className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default focus:outline-none " />
          </div>
          {data.totalSize && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Total Database Size</label>
              <div className="flex items-center h-9 px-3.5 border border-slate-200 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-700 font-semibold">{data.totalSize}</span>
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      {/* Card: Connection Pool */}
      {data.connectionPool && (
        <SettingsCard title="Connection Pool" icon={<IconNetwork className="h-4 w-4" />}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-700">{data.connectionPool.activeConnections}</p>
                <p className="text-xs font-medium text-emerald-600 mt-1">Active</p>
              </div>
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">{data.connectionPool.idleConnections}</p>
                <p className="text-xs font-medium text-blue-600 mt-1">Idle</p>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
                <p className="text-2xl font-bold text-amber-700">{data.connectionPool.waitingRequests}</p>
                <p className="text-xs font-medium text-amber-600 mt-1">Waiting</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
                <p className="text-2xl font-bold text-slate-700">{data.connectionPool.maxSize}</p>
                <p className="text-xs font-medium text-slate-600 mt-1">Max Size</p>
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-600">Pool Utilization</span>
                <span className="text-xs font-bold text-slate-700">{getPoolUsagePercent()}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${getPoolUsagePercent() >= 80 ? "bg-red-600" : getPoolUsagePercent() >= 60 ? "bg-amber-500" : "bg-emerald-600"
                    }`}
                  style={{ width: `${getPoolUsagePercent()}%` }}
                />
              </div>
            </div>
          </div>
        </SettingsCard>
      )}

      {/* Card: Table Statistics */}
      {data.tableStats && data.tableStats.length > 0 && (
        <SettingsCard title="Table Statistics" icon={<BarChart3 className="h-4 w-4" />} noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Table Name</th>
                  <th className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-right text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Rows</th>
                  <th className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-right text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Size</th>
                  <th className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.tableStats.map((table) => (
                  <tr key={table.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-semibold text-slate-900 ">{table.name}</td>
                    <td className="py-2 px-3 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-700 text-right font-semibold">{table.rowCount.toLocaleString()}</td>
                    <td className="py-2 px-3 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 text-right hidden sm:table-cell">{table.size}</td>
                    <td className="py-2 px-3 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">
                      {formatDateUS(table.lastModified)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsCard>
      )}

      {/* Card: Backup Information */}
      <SettingsCard title="Backup Information" icon={<Clock className="h-4 w-4" />}>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Last Backup</label>
          <p className="text-sm text-slate-900 font-semibold">{formatDateTimeLong(data.lastBackup)}</p>
        </div>
      </SettingsCard>

      {/* Notice Strip */}
      <div className="flex gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl">
        <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-amber-900 mb-0.5">Sensitive Information</p>
          <p className="text-xs text-amber-700">Database credentials and connection strings are not displayed for security reasons. Contact system administrators for database access.</p>
        </div>
      </div>
    </div>
  );
};
