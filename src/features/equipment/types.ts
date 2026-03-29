/**
 * Equipment Management Types
 * EU-GMP Annex 15 / 11 compliant equipment qualification
 */

export type EquipmentType =
  | "Manufacturing"
  | "Laboratory"
  | "Packaging"
  | "Storage"
  | "Utility"
  | "HVAC"
  | "Water System";

export type EquipmentStatus =
  | "Active"
  | "Under Maintenance"
  | "Calibration Due"
  | "Qualification Due"
  | "Out of Service"
  | "Retired"
  | "Pending Installation";

export type QualificationStatus =
  | "IQ Completed"
  | "OQ Completed"
  | "PQ Completed"
  | "Fully Qualified"
  | "Re-qualification Required"
  | "Not Qualified";

export interface Equipment {
  id: string;
  equipmentId: string;
  name: string;
  description: string;
  type: EquipmentType;
  status: EquipmentStatus;
  qualificationStatus: QualificationStatus;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  department: string;
  installationDate: string;
  lastCalibrationDate?: string;
  nextCalibrationDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  responsiblePerson: string;
  sopReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentFilters {
  searchQuery: string;
  typeFilter: EquipmentType | "All";
  statusFilter: EquipmentStatus | "All";
  locationFilter: string;
  dateFrom: string;
  dateTo: string;
}
