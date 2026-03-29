import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Edit,
  Trash2,
  MoreVertical,
  FileType,
  Power,
  PowerOff,
  Search,
  AlertTriangle,
} from "lucide-react";
import { Select } from "@/components/ui/select/Select";
import { DateRangePicker } from "@/components/ui/datetime-picker/DateRangePicker";
import { cn } from "@/components/ui/utils";
import { AlertModal } from "@/components/ui/modal/AlertModal";
import { Badge } from "@/components/ui/badge/Badge";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";
import { TablePagination } from "@/components/ui/table/TablePagination";
import type { DocumentTypeItem } from "../types";
import { MOCK_DOCUMENT_TYPES } from "../mockData";
import { usePortalDropdown, useTableFilter } from "@/hooks";
import { FormModal } from "@/components/ui/modal/FormModal";

export const DocumentTypesTab = React.forwardRef<{ openAddModal: () => void }, {}>((_, ref) => {
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive"
  >("All");
  const [modifiedFromDate, setModifiedFromDate] = useState("");
  const [modifiedToDate, setModifiedToDate] = useState("");
  const { openId: openDropdownId, position: dropdownPosition, getRef: getButtonRef, toggle: handleDropdownToggle, close: closeDropdown } = usePortalDropdown();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<DocumentTypeItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mockData, setMockData] = useState<DocumentTypeItem[]>(MOCK_DOCUMENT_TYPES);

  // Expose methods to parent
  React.useImperativeHandle(ref, () => ({
    openAddModal: () => setShowAddModal(true),
  }));

  const {
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedItems,
    filteredItems,
  } = useTableFilter(mockData, {
    filterFn: (item, query) => {
      const matchesSearch = !query ||
        item.name.toLowerCase().includes(query) ||
        (item.description?.toLowerCase().includes(query) ?? false) ||
        item.shortCode.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && item.isActive) ||
        (statusFilter === "Inactive" && !item.isActive);

      // Date range filtering
      let matchesModifiedFrom = true;
      let matchesModifiedTo = true;
      if (modifiedFromDate) {
        const parts = modifiedFromDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const from = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 0, 0, 0);
          const itemDate = new Date(item.modifiedDate);
          matchesModifiedFrom = itemDate >= from;
        }
      }
      if (modifiedToDate) {
        const parts = modifiedToDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (parts) {
          const to = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]), 23, 59, 59);
          const itemDate = new Date(item.modifiedDate);
          matchesModifiedTo = itemDate <= to;
        }
      }

      return matchesSearch && matchesStatus && matchesModifiedFrom && matchesModifiedTo;
    }
  });

  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, modifiedFromDate, modifiedToDate, setCurrentPage]);


  const handleEdit = (item: DocumentTypeItem) => {
    setSelectedItem(item);
    setShowEditModal(true);
    closeDropdown();
  };

  const handleDelete = (item: DocumentTypeItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
    closeDropdown();
  };

  const handleToggleStatus = (item: DocumentTypeItem) => {
    setMockData((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isActive: !i.isActive } : i)),
    );
    closeDropdown();
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setMockData((prev) => prev.filter((i) => i.id !== selectedItem?.id));
    setIsSubmitting(false);
    setShowDeleteModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 min-h-0">
      {/* Filter Card */}
      <div className="bg-white w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
          <div className="sm:col-span-1 lg:col-span-4">
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search document types..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-9 pl-10 pr-4 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="sm:col-span-1 lg:col-span-4">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value as "All" | "Active" | "Inactive");
                setCurrentPage(1);
              }}
              options={[
                { label: "All Status", value: "All" },
                { label: "Active", value: "Active" },
                { label: "Inactive", value: "Inactive" },
              ]}
              placeholder="All Status"
            />
          </div>

          <div className="sm:col-span-1 lg:col-span-4">
            <DateRangePicker
              label="Modified Date Range"
              startDate={modifiedFromDate}
              endDate={modifiedToDate}
              onStartDateChange={(v) => {
                setModifiedFromDate(v);
                setCurrentPage(1);
              }}
              onEndDateChange={(v) => {
                setModifiedToDate(v);
                setCurrentPage(1);
              }}
              placeholder="Select range"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80 border-b-2 border-slate-200 sticky top-0 z-30">
              <tr>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  No.
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Name
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Short Code
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Current Sequence
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Description
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="py-2.5 px-2 sm:py-3.5 sm:px-4 text-left text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  Modified Date
                </th>
                <th className="sticky right-0 bg-slate-50 py-2.5 px-2 sm:py-3.5 sm:px-4 text-center text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider z-[1] whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredItems.length > 0 ? (
                paginatedItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-700">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                      <span className="font-medium text-slate-900">
                        {item.name}
                      </span>
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                      <Badge color="emerald" size="sm">
                        {item.shortCode}
                      </Badge>
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                      <div className="flex flex-col gap-0.5 sm:gap-1">
                        <span className="font-medium text-slate-900">
                          {item.currentSequence}
                        </span>
                        <span className=" text-[10px] sm:text-xs text-slate-500">
                          Next: {item.shortCode}-{String(item.currentSequence + 1).padStart(4, '0')}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-slate-600 max-w-md truncate">
                      {item.description || "-"}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
                      {item.isActive ? (
                        <Badge color="emerald" size="sm" showDot pill>Active</Badge>
                      ) : (
                        <Badge color="slate" size="sm" showDot pill>Inactive</Badge>
                      )}
                    </td>
                    <td className="py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm whitespace-nowrap text-slate-600">
                      {item.modifiedDate}
                    </td>
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="sticky right-0 bg-white py-2 px-2 sm:py-3.5 sm:px-4 text-xs sm:text-sm text-center z-30 whitespace-nowrap before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.05)] group-hover:bg-slate-50"
                    >
                      <button
                        ref={getButtonRef(item.id)}
                        onClick={(e) => handleDropdownToggle(item.id, e)}
                        className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg hover:bg-slate-100 transition-colors"
                        aria-label="More actions"
                      >
                        <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="bg-slate-50 p-4 rounded-full mb-3">
                        <FileType className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-base font-medium text-slate-900">
                        No items found
                      </p>
                      <p className="text-sm mt-1">Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredItems.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredItems.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </div>

      {openDropdownId &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40 animate-in fade-in duration-150"
              onClick={(e) => {
                e.stopPropagation();
                closeDropdown();
              }}
              aria-hidden="true"
            />
            <div
              className="fixed z-50 min-w-[180px] rounded-lg border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }}
            >
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const item = filteredItems.find(
                      (i) => i.id === openDropdownId,
                    )!;
                    handleEdit(item);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const item = filteredItems.find(
                      (i) => i.id === openDropdownId,
                    )!;
                    handleToggleStatus(item);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  {filteredItems.find((i) => i.id === openDropdownId)
                    ?.isActive ? (
                    <>
                      <PowerOff className="h-3.5 w-3.5" />
                      <span>Disable</span>
                    </>
                  ) : (
                    <>
                      <Power className="h-3.5 w-3.5" />
                      <span>Enable</span>
                    </>
                  )}
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const item = filteredItems.find(
                      (i) => i.id === openDropdownId,
                    )!;
                    handleDelete(item);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}

      <DocumentTypeModal
        isOpen={showAddModal || showEditModal}
        onClose={() => {
          setShowAddModal(false);
          setShowEditModal(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        isEdit={showEditModal}
        onSave={(data) => {
          if (showEditModal && selectedItem) {
            setMockData((prev) =>
              prev.map((i) =>
                i.id === selectedItem.id
                  ? {
                    ...i,
                    ...data,
                    modifiedDate: new Date().toISOString().split("T")[0],
                  }
                  : i,
              ),
            );
          } else {
            const newItem: DocumentTypeItem = {
              id: String(mockData.length + 1),
              ...data,
              modifiedDate: new Date().toISOString().split("T")[0],
            };
            setMockData((prev) => [...prev, newItem]);
          }
        }}
      />

      <AlertModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        type="warning"
        title="Delete Document Type?"
        description={
          <div className="space-y-3">
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedItem?.name}</strong>?
            </p>
            <div className="text-xs bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-amber-800">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 inline shrink-0" />{" "}
                <span className="font-semibold">Warning:</span> This action
                cannot be undone.
              </p>
            </div>
          </div>
        }
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isSubmitting}
        showCancel={true}
      />
    </div>
  );
});

interface DocumentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DocumentTypeItem | null;
  isEdit: boolean;
  onSave: (data: any) => void;
}

const DocumentTypeModal: React.FC<DocumentTypeModalProps> = ({
  isOpen,
  onClose,
  item,
  isEdit,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    shortCode: item?.shortCode || "",
    currentSequence: item?.currentSequence || 0,
    isActive: item?.isActive ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || "",
        shortCode: item.shortCode,
        currentSequence: item.currentSequence,
        isActive: item.isActive,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        shortCode: "",
        currentSequence: 0,
        isActive: true,
      });
    }
  }, [item, isOpen]);

  const handleSubmit = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSave(formData);
    setIsSaving(false);
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleSubmit}
      title={`${isEdit ? "Edit" : "Add New"} Document Type`}
      isLoading={isSaving}
      size="xl"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
            Name<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Enter name"
            required
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
            Short Code (3-4 characters)
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={formData.shortCode}
            onChange={(e) =>
              setFormData({
                ...formData,
                shortCode: e.target.value.toUpperCase(),
              })
            }
            maxLength={4}
            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm uppercase focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="e.g., SOP, POL"
            required
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
            Current Sequence<span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="number"
            value={formData.currentSequence}
            onChange={(e) =>
              setFormData({
                ...formData,
                currentSequence: parseInt(e.target.value) || 0,
              })
            }
            min={0}
            max={9999}
            className="w-full h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            required
            disabled={isSaving}
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Enter description (optional)"
            disabled={isSaving}
          />
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="isActive doc-type"
            checked={formData.isActive}
            onChange={(checked) =>
              setFormData({ ...formData, isActive: checked })
            }
            label="Active"
            disabled={isSaving}
          />
        </div>
      </div>
    </FormModal>
  );
};
