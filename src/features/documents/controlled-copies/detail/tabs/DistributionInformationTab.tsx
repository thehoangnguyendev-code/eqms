import React, { useState } from "react";
import { ControlledCopy } from "../../types";
import { Select } from "@/components/ui/select/Select";
import { MultiSelect } from "@/components/ui/select/MultiSelect";

interface DistributionInformationTabProps {
  controlledCopy: ControlledCopy;
}

export const DistributionInformationTab: React.FC<DistributionInformationTabProps> = ({
  controlledCopy,
}) => {
  const [distributionType, setDistributionType] = useState<string>("none");
  const [supplierCustomerType, setSupplierCustomerType] = useState<string>("none");
  const [externalUsersEmail, setExternalUsersEmail] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");

  // Internal distribution states
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedBusinessUnits, setSelectedBusinessUnits] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  // Mock data for suppliers and customers
  const suppliers = [
    { label: "ABC Pharma Suppliers Ltd.", value: "supplier-001" },
    { label: "Global API Solutions Inc.", value: "supplier-002" },
    { label: "ChemSource International", value: "supplier-003" },
    { label: "MedSupply Partners", value: "supplier-004" },
    { label: "Premium Materials Co.", value: "supplier-005" },
    { label: "Quality Raw Materials Ltd.", value: "supplier-006" },
    { label: "BioTech Suppliers Group", value: "supplier-007" },
    { label: "Advanced Chemical Supply", value: "supplier-008" },
  ];

  const customers = [
    { label: "HealthCare Distributors Inc.", value: "customer-001" },
    { label: "MediPro Wholesale", value: "customer-002" },
    { label: "PharmaCare Networks", value: "customer-003" },
    { label: "Global Health Solutions", value: "customer-004" },
    { label: "Regional Medical Supplies", value: "customer-005" },
    { label: "National Drug Distribution", value: "customer-006" },
    { label: "International Pharma Group", value: "customer-007" },
    { label: "Prime Medical Partners", value: "customer-008" },
  ];

  // Mock data for internal distribution
  const employees = [
    { label: "John Smith - QA Manager", value: "emp-001" },
    { label: "Sarah Johnson - Production Supervisor", value: "emp-002" },
    { label: "Michael Chen - Quality Engineer", value: "emp-003" },
    { label: "Emily Davis - Validation Specialist", value: "emp-004" },
    { label: "Robert Lee - Manufacturing Lead", value: "emp-005" },
    { label: "Lisa Anderson - QC Analyst", value: "emp-006" },
    { label: "David Wilson - Compliance Officer", value: "emp-007" },
    { label: "Jennifer White - Document Controller", value: "emp-008" },
    { label: "Thomas Brown - Operations Manager", value: "emp-009" },
    { label: "Maria Garcia - Technical Writer", value: "emp-010" },
  ];

  const groups = [
    { label: "Quality Assurance Team", value: "group-001" },
    { label: "Production Team", value: "group-002" },
    { label: "Quality Control Team", value: "group-003" },
    { label: "Validation Team", value: "group-004" },
    { label: "Engineering Team", value: "group-005" },
    { label: "Compliance Team", value: "group-006" },
    { label: "Document Control Team", value: "group-007" },
    { label: "Management Team", value: "group-008" },
  ];

  const businessUnits = [
    { label: "Manufacturing Operations", value: "bu-001" },
    { label: "Quality Management", value: "bu-002" },
    { label: "Research & Development", value: "bu-003" },
    { label: "Supply Chain Management", value: "bu-004" },
    { label: "Regulatory Affairs", value: "bu-005" },
    { label: "Technical Services", value: "bu-006" },
    { label: "Corporate Quality", value: "bu-007" },
    { label: "Production Planning", value: "bu-008" },
  ];

  const departments = [
    { label: "Quality Assurance", value: "dept-001" },
    { label: "Quality Control", value: "dept-002" },
    { label: "Manufacturing", value: "dept-003" },
    { label: "Engineering", value: "dept-004" },
    { label: "Validation", value: "dept-005" },
    { label: "Warehouse", value: "dept-006" },
    { label: "Maintenance", value: "dept-007" },
    { label: "Safety & Compliance", value: "dept-008" },
    { label: "Packaging", value: "dept-009" },
    { label: "Laboratory", value: "dept-010" },
  ];

  return (
    <div className="space-y-6">
      {/* Distribution Details Section */}
      <div className="space-y-4">
        {/* Distribution Type - Required Field */}
        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-medium text-slate-700">
            Distribution <span className="text-red-500">*</span>
          </label>
          <Select
            value={distributionType}
            onChange={setDistributionType}
            options={[
              { label: "-- None --", value: "none" },
              { label: "Internal", value: "internal" },
              { label: "External", value: "external" }
            ]}
            placeholder="Select distribution type"
          />
        </div>

        {/* Internal Distribution - Only shown when Internal is selected */}
        {distributionType === "internal" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Employees */}
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-medium text-slate-700">
                Employees
              </label>
              <MultiSelect
                value={selectedEmployees}
                onChange={(values) => setSelectedEmployees(values as string[])}
                options={employees}
                placeholder="Select employees"
                enableSearch
                maxVisibleTags={2}
              />
            </div>

            {/* Groups */}
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-medium text-slate-700">
                Groups
              </label>
              <MultiSelect
                value={selectedGroups}
                onChange={(values) => setSelectedGroups(values as string[])}
                options={groups}
                placeholder="Select groups"
                enableSearch
                maxVisibleTags={2}
              />
            </div>

            {/* Business Units */}
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-medium text-slate-700">
                Business Units
              </label>
              <MultiSelect
                value={selectedBusinessUnits}
                onChange={(values) => setSelectedBusinessUnits(values as string[])}
                options={businessUnits}
                placeholder="Select business units"
                enableSearch
                maxVisibleTags={2}
              />
            </div>

            {/* Departments */}
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-medium text-slate-700">
                Departments
              </label>
              <MultiSelect
                value={selectedDepartments}
                onChange={(values) => setSelectedDepartments(values as string[])}
                options={departments}
                placeholder="Select departments"
                enableSearch
                maxVisibleTags={2}
              />
            </div>
          </div>
        )}

        {/* External Type - Shown when External is selected */}
        {distributionType === "external" && (
          <div className="flex flex-col gap-2">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              External Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={supplierCustomerType}
              onChange={setSupplierCustomerType}
              options={[
                { label: "-- None --", value: "none" },
                { label: "External Users", value: "external-users" }
              ]}
              placeholder="Select external type"
            />
          </div>
        )}

        {/* External Users Input - Shown when External Users is selected */}
        {distributionType === "external" && supplierCustomerType === "external-users" && (
          <div className="flex flex-col gap-2">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              External Users <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={externalUsersEmail}
              onChange={(e) => setExternalUsersEmail(e.target.value)}
              placeholder="Enter email addresses (separated by commas)"
              className="w-full h-9 px-3.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <p className="text-xs text-slate-400 flex items-center gap-1">
              Enter email addresses of external recipients, separated by commas.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
