import React, { useState } from "react";
import { Package, Server, Database, Globe, ToggleLeft, Download, HardDrive } from "lucide-react";
import { IconClockEdit, IconLicense, IconRefresh } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { systemInformation } from "@/components/ui/breadcrumb/breadcrumbs.config";
import { Button } from "@/components/ui/button/Button";
import { useToast } from "@/components/ui/toast/Toast";
import { cn } from "@/components/ui/utils";
import type { TabType } from "./types";
import { MOCK_SYSTEM_INFO } from "./mockData";
import { ApplicationTab } from "./tabs/ApplicationTab";
import { ServerTab } from "./tabs/ServerTab";
import { DatabaseTab } from "./tabs/DatabaseTab";
import { ApiTab } from "./tabs/ApiTab";
import { FeaturesTab } from "./tabs/FeaturesTab";
import { LicenseTab } from "./tabs/LicenseTab";
import { StorageTab } from "./tabs/StorageTab";
import { ChangelogTab } from "./tabs/ChangelogTab";

const TABS = [
  {
    id: "application" as TabType,
    label: "Application",
    icon: Package,
    description: "Application version, build information, and environment details",
  },
  {
    id: "server" as TabType,
    label: "Server",
    icon: Server,
    description: "Server configuration, system resources, and runtime environment",
  },
  {
    id: "database" as TabType,
    label: "Database",
    icon: Database,
    description: "Database connection details, version, and backup information",
  },
  {
    id: "api" as TabType,
    label: "API",
    icon: Globe,
    description: "API endpoints, version, health status, and performance metrics",
  },
  {
    id: "features" as TabType,
    label: "Features",
    icon: ToggleLeft,
    description: "Enabled and disabled feature flags for the application",
  },
  {
    id: "storage" as TabType,
    label: "Storage",
    icon: HardDrive,
    description: "File storage usage, file type breakdown, and recent uploads",
  },
  {
    id: "license" as TabType,
    label: "License",
    icon: IconLicense,
    description: "License details, expiration date, and user allocation",
  },
  {
    id: "changelog" as TabType,
    label: "Changelog",
    icon: IconClockEdit,
    description: "Version history and release notes for system updates",
  },
];

export const SystemInformationView: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("application");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleExport = () => {
    // TODO: Implement actual export functionality
    const dataStr = JSON.stringify(MOCK_SYSTEM_INFO, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `system-info-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      type: "success",
      message: "System information exported successfully",
      duration: 3000,
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      showToast({
        type: "success",
        message: "System information refreshed",
        duration: 2500,
      });
    }, 800);
  };

  const handleCopyAll = async () => {
    try {
      const textData = `
System Information Report
Generated: ${new Date().toLocaleString()}

APPLICATION
- Name: ${MOCK_SYSTEM_INFO.application.name}
- Version: ${MOCK_SYSTEM_INFO.application.version}
- Environment: ${MOCK_SYSTEM_INFO.application.environment}
- Build: ${MOCK_SYSTEM_INFO.application.buildNumber}

SERVER
- OS: ${MOCK_SYSTEM_INFO.server.os}
- Node: ${MOCK_SYSTEM_INFO.server.nodeVersion}
- Memory: ${MOCK_SYSTEM_INFO.server.memoryUsed} / ${MOCK_SYSTEM_INFO.server.memoryTotal} (${MOCK_SYSTEM_INFO.server.memoryUsagePercent}%)
- Uptime: ${MOCK_SYSTEM_INFO.server.uptime}

DATABASE
- Type: ${MOCK_SYSTEM_INFO.database.type} ${MOCK_SYSTEM_INFO.database.version}
- Status: ${MOCK_SYSTEM_INFO.database.connectionStatus}
- Database: ${MOCK_SYSTEM_INFO.database.database}

API
- URL: ${MOCK_SYSTEM_INFO.api.baseUrl}
- Status: ${MOCK_SYSTEM_INFO.api.status}
- Response Time: ${MOCK_SYSTEM_INFO.api.responseTime}

LICENSE
- Type: ${MOCK_SYSTEM_INFO.license.licenseType}
- Company: ${MOCK_SYSTEM_INFO.license.companyName}
- Expiry: ${MOCK_SYSTEM_INFO.license.expiryDate} (${MOCK_SYSTEM_INFO.license.daysUntilExpiry} days)
- Users: ${MOCK_SYSTEM_INFO.license.activeUsers} / ${MOCK_SYSTEM_INFO.license.maxUsers}
- Support: ${MOCK_SYSTEM_INFO.license.supportLevel}

STORAGE
- Provider: ${MOCK_SYSTEM_INFO.storage.provider}
- Usage: ${MOCK_SYSTEM_INFO.storage.usedStorage} / ${MOCK_SYSTEM_INFO.storage.totalStorage} (${MOCK_SYSTEM_INFO.storage.usagePercent}%)
- Total Files: ${MOCK_SYSTEM_INFO.storage.documentsCount}
      `.trim();

      await navigator.clipboard.writeText(textData);
      showToast({
        type: "success",
        message: "System information copied to clipboard",
        duration: 2500,
      });
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to copy system information",
        duration: 2500,
      });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "application":
        return <ApplicationTab data={MOCK_SYSTEM_INFO.application} />;
      case "server":
        return <ServerTab data={MOCK_SYSTEM_INFO.server} />;
      case "database":
        return <DatabaseTab data={MOCK_SYSTEM_INFO.database} />;
      case "api":
        return <ApiTab data={MOCK_SYSTEM_INFO.api} />;
      case "features":
        return <FeaturesTab features={MOCK_SYSTEM_INFO.features} />;
      case "storage":
        return <StorageTab data={MOCK_SYSTEM_INFO.storage} />;
      case "license":
        return <LicenseTab data={MOCK_SYSTEM_INFO.license} />;
      case "changelog":
        return <ChangelogTab />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full flex-1 flex flex-col">
      {/* Header */}
      <PageHeader
        title="System Information"
        breadcrumbItems={systemInformation()}
        actions={
          <>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={isRefreshing}
            >
              <IconRefresh className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        }
      />

      {/* Tabbed Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 sm:px-4 md:px-6 py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors border-r border-slate-200 last:border-r-0",
                    isActive
                      ? "border-b-emerald-600 text-emerald-700 bg-emerald-50/50"
                      : "border-b-transparent text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className={cn("animate-in fade-in duration-200")}>
          {renderTabContent()}
        </div>
      </div>

    </div>
  );
};
