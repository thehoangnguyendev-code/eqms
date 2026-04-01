import React from "react";
import { Server, Cpu, HardDrive, Clock, Network, Activity } from "lucide-react";
import type { ServerInfo } from "../types";

interface ServerTabProps {
  data: ServerInfo;
}

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

export const ServerTab: React.FC<ServerTabProps> = ({ data }) => {
  const getUsageColor = (percent: number) => {
    if (percent >= 80) return "bg-red-600";
    if (percent >= 60) return "bg-amber-500";
    return "bg-emerald-600";
  };

  const getUsageLabel = (percent: number) => {
    if (percent >= 80) return "High usage detected";
    if (percent >= 60) return "Moderate usage";
    return "Usage is normal";
  };

  return (
    <div className="p-5 space-y-4">
      {/* Card: Server Configuration */}
      <SettingsCard title="Server Configuration" icon={<Server className="h-4 w-4" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Operating System
            </label>
            <input
              type="text"
              value={data.os}
              disabled
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Node.js Version
            </label>
            <input
              type="text"
              value={data.nodeVersion}
              disabled
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed "
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              System Uptime
            </label>
            <input
              type="text"
              value={data.uptime}
              disabled
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
              Active Processes
            </label>
            <div className="flex items-center h-9 px-3.5 border border-slate-200 rounded-lg bg-slate-50">
              <span className="text-sm text-slate-700 font-semibold">{data.processCount}</span>
              <span className="ml-2 text-sm text-slate-500">processes</span>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Card: CPU */}
      <SettingsCard title="CPU Information" icon={<Cpu className="h-4 w-4" />}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                CPU Model
              </label>
              <input
                type="text"
                value={data.cpuModel}
                disabled
                className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                CPU Cores
              </label>
              <div className="flex items-center h-9 px-3.5 border border-slate-200 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-700 font-semibold">{data.cpuCores}</span>
                <span className="ml-2 text-sm text-slate-500">cores</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">CPU Usage</span>
              <span className="text-xs font-bold text-slate-700">{data.cpuUsagePercent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${getUsageColor(data.cpuUsagePercent)}`}
                style={{ width: `${data.cpuUsagePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-500">{getUsageLabel(data.cpuUsagePercent)}</p>
              {data.loadAverage && (
                <p className="text-xs text-slate-500">
                  Load: {data.loadAverage}
                </p>
              )}
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Card: Memory */}
      <SettingsCard title="Memory (RAM)" icon={<HardDrive className="h-4 w-4" />}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
            <p className="text-xs font-medium text-slate-500 mb-1">Total</p>
            <p className="text-xl font-bold text-slate-900">{data.memoryTotal}</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
            <p className="text-xs font-medium text-slate-500 mb-1">Used</p>
            <p className="text-xl font-bold text-slate-900">{data.memoryUsed}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600">Memory Usage</span>
          <span className="text-xs font-bold text-slate-700">{data.memoryUsagePercent}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${getUsageColor(data.memoryUsagePercent)}`}
            style={{ width: `${data.memoryUsagePercent}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">{getUsageLabel(data.memoryUsagePercent)}</p>
      </SettingsCard>

      {/* Card: Disk */}
      <SettingsCard title="Disk Storage" icon={<HardDrive className="h-4 w-4" />}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
            <p className="text-xs font-medium text-slate-500 mb-1">Total</p>
            <p className="text-xl font-bold text-slate-900">{data.diskTotal}</p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
            <p className="text-xs font-medium text-slate-500 mb-1">Used</p>
            <p className="text-xl font-bold text-slate-900">{data.diskUsed}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600">Disk Usage</span>
          <span className="text-xs font-bold text-slate-700">{data.diskUsagePercent}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${getUsageColor(data.diskUsagePercent)}`}
            style={{ width: `${data.diskUsagePercent}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">{getUsageLabel(data.diskUsagePercent)}</p>
      </SettingsCard>

      {/* Card: Network Interfaces */}
      {data.networkInterfaces && data.networkInterfaces.length > 0 && (
        <SettingsCard title="Network Interfaces" icon={<Network className="h-4 w-4" />} noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Interface</th>
                  <th className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                  <th className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                  <th className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.networkInterfaces.map((iface: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 sm:py-3.5 sm:px-4 text-xs sm:text-sm font-semibold text-slate-900">{iface.name}</td>
                    <td className="py-2 px-3 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-700 ">{iface.ip}</td>
                    <td className="py-2 px-3 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 hidden sm:table-cell">{iface.type}</td>
                    <td className="py-2 px-3 sm:py-3.5 sm:px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${iface.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${iface.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {iface.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsCard>
      )}
    </div>
  );
};
