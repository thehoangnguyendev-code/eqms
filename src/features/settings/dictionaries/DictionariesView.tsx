import React, { useState, useRef } from "react";
import {
  Building2,
  MapPin,
  Archive,
  Plus,
  Briefcase,
} from "lucide-react";
import { cn } from "@/components/ui/utils";
import { IconFileCode2 } from '@tabler/icons-react';
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page/PageHeader";
import { Button } from "@/components/ui/button/Button";
import { dictionaries } from "@/components/ui/breadcrumb/breadcrumbs.config";
import type { DictionaryType, Dictionary } from "./types";
import { DocumentTypesTab } from "./tabs/DocumentTypesTab";
import { BusinessUnitsTab } from "./tabs/BusinessUnitsTab";
import { DepartmentsTab } from "./tabs/DepartmentsTab";
import { StorageLocationsTab } from "./tabs/StorageLocationsTab";
import { RetentionPoliciesTab } from "./tabs/RetentionPoliciesTab";

// --- Tab Configuration ---
const DICTIONARIES: Dictionary[] = [
  {
    id: "document-types",
    label: "Document Types",
    icon: IconFileCode2,
  },
  {
    id: "business-units",
    label: "Business Units",
    icon: Briefcase,
  },
  {
    id: "departments",
    label: "Departments",
    icon: Building2,
  },
  {
    id: "storage-locations",
    label: "Storage Locations",
    icon: MapPin,
  },
  {
    id: "retention-policies",
    label: "Retention Policies",
    icon: Archive,
  },
];

export const DictionariesView: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDictionary, setSelectedDictionary] = useState<DictionaryType>("document-types");
  const tabRef = useRef<{ openAddModal: () => void }>(null);

  // Render active tab content
  const renderTabContent = () => {
    switch (selectedDictionary) {
      case "document-types":
        return <DocumentTypesTab ref={tabRef} />;
      case "business-units":
        return <BusinessUnitsTab ref={tabRef} />;
      case "departments":
        return <DepartmentsTab ref={tabRef} />;
      case "storage-locations":
        return <StorageLocationsTab ref={tabRef} />;
      case "retention-policies":
        return <RetentionPoliciesTab ref={tabRef} />;
      default:
        return null;
    }
  };

  const handleAddNew = () => {
    tabRef.current?.openAddModal();
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <PageHeader
        title="Dictionaries Management"
        breadcrumbItems={dictionaries(navigate, DICTIONARIES.find(d => d.id === selectedDictionary)?.label)}
        actions={
          <Button
            size="sm"
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        }
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Tabs & Content Combined */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto border-b border-slate-200">
            {DICTIONARIES.map((dict) => {
              const Icon = dict.icon;
              const isSelected = selectedDictionary === dict.id;
              return (
                <button
                  key={dict.id}
                  onClick={() => setSelectedDictionary(dict.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 sm:px-4 md:px-6 py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors border-r border-slate-200 last:border-r-0",
                    isSelected
                      ? "border-b-emerald-600 text-emerald-700 bg-emerald-50/50"
                      : "border-b-transparent text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span>{dict.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
