import React, { useState } from "react";
import { Globe, CheckCircle2, XCircle, Clock, Copy, Check, BarChart3, Shield, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { useToast } from "@/components/ui/toast/Toast";
import type { ApiInfo } from "../types";
import { formatDateTimeLong } from "@/utils/format";

interface ApiTabProps {
  data: ApiInfo;
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

export const ApiTab: React.FC<ApiTabProps> = ({ data }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(data.baseUrl);
      setCopied(true);
      showToast({
        type: "success",
        message: "API URL copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to copy URL",
        duration: 2000,
      });
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "POST":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "PUT":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "PATCH":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "DELETE":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "healthy":
        return { color: "bg-emerald-600", label: "Healthy" };
      case "degraded":
        return { color: "bg-amber-500", label: "Degraded" };
      case "down":
        return { color: "bg-red-600", label: "Down" };
      default:
        return { color: "bg-slate-400", label: "Unknown" };
    }
  };

  return (
    <div className="p-5 space-y-4">
      {/* Status Banner */}
      <div className={`flex items-center justify-between px-5 py-4 rounded-xl border ${data.status === "online" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
        }`}>
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center h-9 w-9 rounded-lg flex-shrink-0 ${data.status === "online" ? "bg-emerald-100" : "bg-red-100"
            }`}>
            {data.status === "online"
              ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              : <XCircle className="h-5 w-5 text-red-600" />
            }
          </div>
          <div>
            <p className={`text-sm font-semibold ${data.status === "online" ? "text-emerald-900" : "text-red-900"}`}>
              API Status
            </p>
            <p className={`text-xs mt-0.5 ${data.status === "online" ? "text-emerald-700" : "text-red-700"}`}>
              {data.status === "online" ? "All services operational" : "API services unavailable"}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${data.status === "online"
          ? "bg-emerald-100 text-emerald-700 border-emerald-300"
          : "bg-red-100 text-red-700 border-red-300"
          }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${data.status === "online" ? "bg-emerald-500" : "bg-red-500"}`} />
          {data.status === "online" ? "Online" : "Offline"}
        </span>
      </div>

      {/* Card: API Configuration */}
      <SettingsCard title="API Configuration" icon={<Globe className="h-4 w-4" />}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Base URL</label>
            <div className="flex gap-2">
              <input type="text" value={data.baseUrl} readOnly className="flex-1 h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default focus:outline-none " />
              <Button onClick={handleCopyUrl} variant="outline" size="sm" className="gap-2">
                {copied ? <><Check className="h-4 w-4 text-emerald-600" />Copied</> : <><Copy className="h-4 w-4" />Copy</>}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">API Version</label>
              <input type="text" value={data.version} readOnly className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-default focus:outline-none  font-semibold" />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Average Response Time</label>
              <div className="flex items-center h-9 px-3.5 border border-slate-200 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-700 font-semibold">{data.responseTime}</span>
              </div>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Card: Request Statistics */}
      {data.requestStats && (
        <SettingsCard title="Request Statistics" icon={<BarChart3 className="h-4 w-4" />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-center">
              <p className="text-xl font-bold text-blue-700">{data.requestStats.totalRequests24h.toLocaleString()}</p>
              <p className="text-xs font-medium text-blue-600 mt-1">Total Requests</p>
            </div>
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
              <p className="text-xl font-bold text-emerald-700">{data.requestStats.successRate}%</p>
              <p className="text-xs font-medium text-emerald-600 mt-1">Success Rate</p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
              <p className="text-xl font-bold text-amber-700">{data.requestStats.avgResponseTime}</p>
              <p className="text-xs font-medium text-amber-600 mt-1">Avg Response</p>
            </div>
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center">
              <p className="text-xl font-bold text-red-700">{data.requestStats.errorCount24h.toLocaleString()}</p>
              <p className="text-xs font-medium text-red-600 mt-1">Errors (24h)</p>
            </div>
          </div>
        </SettingsCard>
      )}

      {/* Card: API Endpoints */}
      {data.endpoints && data.endpoints.length > 0 && (
        <SettingsCard title="API Endpoints" icon={<Zap className="h-4 w-4" />} noPadding>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Method</th>
                  <th className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Path</th>
                  <th className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-right text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Resp. Time</th>
                  <th className="py-2.5 px-3 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {data.endpoints.map((endpoint, idx) => {
                  const statusInfo = getStatusIndicator(endpoint.status);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 sm:py-3.5 sm:px-4">
                        <span className={`inline-flex items-center px-1.5 py-0.5 sm:px-2 rounded text-[10px] sm:text-xs font-bold border ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                      </td>
                      <td className="py-2 px-3 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-900 ">{endpoint.path}</td>
                      <td className="py-2 px-3 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 text-right hidden sm:table-cell">{endpoint.avgResponseTime}</td>
                      <td className="py-2 px-3 sm:py-3.5 sm:px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-medium">
                          <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.color}`} />
                          <span className="text-slate-600">{statusInfo.label}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SettingsCard>
      )}

      {/* Card: Rate Limiting */}
      {data.rateLimiting && (
        <SettingsCard title="Rate Limiting" icon={<Shield className="h-4 w-4" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Rate Limit</label>
              <div className="flex items-center h-9 px-3.5 border border-slate-200 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-700 font-semibold">{data.rateLimiting.requestsPerMinute}</span>
                <span className="ml-2 text-sm text-slate-500">req/min</span>
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Current Usage</label>
              <div className="flex items-center h-9 px-3.5 border border-slate-200 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-700 font-semibold">{data.rateLimiting.currentUsage}</span>
                <span className="ml-2 text-sm text-slate-500">requests</span>
              </div>
            </div>
          </div>
        </SettingsCard>
      )}

      {/* Card: Health Check */}
      <SettingsCard title="Health Check Information" icon={<Clock className="h-4 w-4" />}>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Last Health Check</label>
          <p className="text-sm text-slate-900 font-semibold">{formatDateTimeLong(data.lastHealthCheck)}</p>
          <p className="text-xs text-slate-500 mt-1.5">Health checks run automatically every 5 minutes</p>
        </div>
      </SettingsCard>

      {/* Notice Strip */}
      <div className="flex gap-3 px-4 py-3.5 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-blue-900 mb-0.5">API Documentation</p>
          <p className="text-xs text-blue-700">For detailed API endpoint documentation, authentication methods, and integration guides, refer to the developer documentation portal or contact the NTP Dev Team.</p>
        </div>
      </div>
    </div>
  );
};
