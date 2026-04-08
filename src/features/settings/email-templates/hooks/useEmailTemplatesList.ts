import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { MOCK_EMAIL_TEMPLATES } from "../mockData";
import type { EmailTemplate, EmailTemplateType, EmailTemplateStatus, TableColumn, EmailTemplatePayload } from "../types";
import { useTableFilter } from "@/hooks";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const parseDMY = (s: string): Date | null => {
  const p = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return p ? new Date(parseInt(p[3]), parseInt(p[2]) - 1, parseInt(p[1])) : null;
};

const inDateRange = (
  value: string | undefined,
  from: string,
  to: string
): boolean => {
  if (!from && !to) return true;
  if (!value) return false;
  const d = new Date(value);
  const f = from ? parseDMY(from) : null;
  const t = to ? parseDMY(to) : null;
  if (f && d < f) return false;
  if (t) { t.setHours(23, 59, 59); if (d > t) return false; }
  return true;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useEmailTemplatesList() {
  const { showToast } = useToast();

  // === Data ===
  // TODO: Replace with React Query when integrating API:
  //   const { data: emailTemplates = [], isLoading, refetch } = useQuery({
  //     queryKey: ["email-templates"],
  //     queryFn: () => emailTemplateApi.getEmailTemplates(),
  //   });
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([...MOCK_EMAIL_TEMPLATES]);

  // === Filters ===
  const [typeFilter, setTypeFilter] = useState<EmailTemplateType | "All">("All");
  const [statusFilter, setStatusFilter] = useState<EmailTemplateStatus | "All">("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [updatedFrom, setUpdatedFrom] = useState("");
  const [updatedTo, setUpdatedTo] = useState("");

  // === Sorting ===
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" }>({
    key: "name",
    direction: "asc",
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // === Use shared Table Filter hook ===
  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    filteredItems: filteredEmailTemplates,
    resetFilter: resetTableFilter,
  } = useTableFilter(emailTemplates, {
    filterFn: (template, q) => {
      // 1. Text Search
      const matchesSearch =
        !q ||
        template.name.toLowerCase().includes(q) ||
        template.subject.toLowerCase().includes(q) ||
        template.description?.toLowerCase().includes(q) ||
        template.createdBy.toLowerCase().includes(q);

      // 2. Other Filters
      const matchesType = typeFilter === "All" || template.type === typeFilter;
      const matchesStatus = statusFilter === "All" || template.status === statusFilter;
      const matchesDate = inDateRange(template.createdDate, dateFrom, dateTo);
      const matchesUpdated = inDateRange(template.updatedDate, updatedFrom, updatedTo);

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus &&
        matchesDate &&
        matchesUpdated
      );
    }
  });

  const sortedEmailTemplates = useMemo(() => {
    if (!sortConfig.key) return filteredEmailTemplates;

    return [...filteredEmailTemplates].sort((a, b) => {
      let aVal: any = (a as any)[sortConfig.key!];
      let bVal: any = (b as any)[sortConfig.key!];

      if (["createdDate", "updatedDate", "lastUsed"].includes(sortConfig.key!)) {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredEmailTemplates, sortConfig]);

  const currentEmailTemplates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedEmailTemplates.slice(start, start + itemsPerPage);
  }, [sortedEmailTemplates, currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;

  // Manual reset of page when custom filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    typeFilter, statusFilter, dateFrom, dateTo, updatedFrom, updatedTo, setCurrentPage
  ]);

  // === Derived ===
  const draftCount = useMemo(
    () => emailTemplates.filter((t) => t.status === "Draft").length,
    [emailTemplates]
  );

  const inactiveCount = useMemo(
    () => emailTemplates.filter((t) => t.status === "Inactive").length,
    [emailTemplates]
  );

  // === Actions ===
  // Each action shows toast feedback. Replace the setEmailTemplates mutation with the
  // corresponding emailTemplateApi call + refetch() when the API is ready.

  const createEmailTemplate = (payload: EmailTemplatePayload) => {
    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      ...payload,
      createdBy: "Current User", // TODO: Get from auth context
      createdDate: new Date().toISOString().split('T')[0],
      updatedBy: "Current User",
      updatedDate: new Date().toISOString().split('T')[0],
      lastUsed: undefined,
      usageCount: 0,
    };

    setEmailTemplates((prev) => [newTemplate, ...prev]);
    showToast({ type: "success", title: "Template Created", message: `${payload.name} has been created successfully` });
    return newTemplate;
  };

  const updateEmailTemplate = (id: string, payload: Partial<EmailTemplatePayload>) => {
    setEmailTemplates((prev) =>
      prev.map((template) =>
        template.id === id
          ? {
              ...template,
              ...payload,
              updatedBy: "Current User", // TODO: Get from auth context
              updatedDate: new Date().toISOString().split('T')[0]
            }
          : template
      )
    );
    showToast({ type: "success", title: "Template Updated", message: "Email template has been updated successfully" });
  };

  const deleteEmailTemplate = (id: string, templateName: string) => {
    setEmailTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast({ type: "success", title: "Template Deleted", message: `${templateName} has been deleted successfully` });
  };

  const duplicateEmailTemplate = (id: string) => {
    const template = emailTemplates.find((t) => t.id === id);
    if (!template) return;

    const duplicatedTemplate: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      status: "Draft",
      createdBy: "Current User", // TODO: Get from auth context
      createdDate: new Date().toISOString().split('T')[0],
      updatedBy: "Current User",
      updatedDate: new Date().toISOString().split('T')[0],
      lastUsed: undefined,
      usageCount: 0,
    };

    setEmailTemplates((prev) => [duplicatedTemplate, ...prev]);
    showToast({ type: "success", title: "Template Duplicated", message: `${duplicatedTemplate.name} has been created successfully` });
    return duplicatedTemplate;
  };

  const toggleTemplateStatus = (id: string) => {
    setEmailTemplates((prev) =>
      prev.map((template) =>
        template.id === id
          ? {
              ...template,
              status: template.status === "Active" ? "Inactive" : "Active",
              updatedBy: "Current User", // TODO: Get from auth context
              updatedDate: new Date().toISOString().split('T')[0]
            }
          : template
      )
    );
    showToast({ type: "success", title: "Status Updated", message: "Template status has been updated successfully" });
  };

  const clearFilters = () => {
    setTypeFilter("All");
    setStatusFilter("All");
    setDateFrom("");
    setDateTo("");
    setUpdatedFrom("");
    setUpdatedTo("");
    resetTableFilter();
  };

  return {
    // Data
    emailTemplates,
    filteredEmailTemplates,
    currentEmailTemplates,
    totalPages,
    startIndex,

    // Filters
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    updatedFrom,
    setUpdatedFrom,
    updatedTo,
    setUpdatedTo,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,

    // Sorting
    sortConfig,
    handleSort,

    // Derived
    draftCount,
    inactiveCount,

    // Actions
    createEmailTemplate,
    updateEmailTemplate,
    deleteEmailTemplate,
    duplicateEmailTemplate,
    toggleTemplateStatus,
    clearFilters,
  };
}