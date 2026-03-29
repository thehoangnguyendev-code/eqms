export interface ArchivedDocument {
    id: string;
    code: string;
    documentName: string;
    version: string;
    effectiveDate: string;
    archivedDate: string;
    archivedBy: string;
    lastApprover: string;
    retentionPeriod: number; // in months
    retentionExpiry: string;
    department: string;
    category: string;
    reason: string; // Reason for archiving
    fileUrl?: string;
    filePath?: string;
    fileSize?: string;
    replacedBy?: string; // Document ID that replaced this one
}

export interface RetentionStatus {
    status: 'valid' | 'expiring-soon' | 'expired';
    daysRemaining: number;
    message: string;
}

export interface RestoreRequest {
    documentId: string;
    reason: string;
    requestedBy: string;
    timestamp: string;
}

export interface AuditLogEntry {
    id: string;
    documentId: string;
    documentCode: string;
    action: 'viewed' | 'downloaded' | 'restored' | 'deleted';
    performedBy: string;
    timestamp: string;
    details?: string;
}

export type RetentionFilter = 'all' | 'valid' | 'expiring-soon' | 'expired';
