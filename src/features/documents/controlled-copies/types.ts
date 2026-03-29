export type ControlledCopyStatus = 
  | "Ready for Distribution" 
  | "Distributed" 
  | "Obsolete" 
  | "Closed - Cancelled";

export type CurrentStage = 
  | "Waiting for QM" 
  | "Ready for Print" 
  | "Ready for Distribution" 
  | "In Use" 
  | "Distributed";

export interface TableColumn {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  locked?: boolean;
}

export interface ControlledCopy {
  id: string;
  documentNumber: string; // Số hiệu controlled copy
  createdDate: string; // Ngày tạo (dd/MM/yyyy)
  createdTime: string; // Giờ tạo (HH:mm:ss)
  openedBy: string; // Người mở/tạo
  name: string; // Tên document
  status: ControlledCopyStatus; // Trạng thái
  validUntil: string; // Hiệu lực đến (dd/MM/yyyy)
  document: string; // Document ID gốc
  distributionList?: string; // Danh sách phân phối
  
  // Additional fields
  version: string;
  location?: string;
  locationCode?: string;
  department?: string;
  reason?: string;
  
  // Distribution tracking
  distributedDate?: string;
  distributedBy?: string;
  recipientName?: string;
  recipientSignature?: string;
  recipientDate?: string;
  
  // Legacy fields (for compatibility)
  controlNumber?: string;
  documentId?: string;
  documentTitle?: string;
  copyNumber?: number;
  totalCopies?: number;
  requestDate?: string;
  requestedBy?: string;
  currentStage?: CurrentStage;
  effectiveDate?: string;
}
