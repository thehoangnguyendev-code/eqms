import { ArchivedDocument, RetentionStatus } from './types';

export const calculateRetentionStatus = (retentionExpiry: string): RetentionStatus => {
    const today = new Date();
    const expiryDate = new Date(retentionExpiry);
    const diffTime = expiryDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
        return {
            status: 'expired',
            daysRemaining,
            message: `Expired ${Math.abs(daysRemaining)} days ago`
        };
    } else if (daysRemaining <= 30) {
        return {
            status: 'expiring-soon',
            daysRemaining,
            message: `${daysRemaining} days remaining`
        };
    } else {
        return {
            status: 'valid',
            daysRemaining,
            message: `${daysRemaining} days remaining`
        };
    }
};

export const getRetentionBadgeStyle = (status: RetentionStatus['status']) => {
    switch (status) {
        case 'expired':
            return 'bg-red-50 text-red-700 border-red-200';
        case 'expiring-soon':
            return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'valid':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        default:
            return 'bg-slate-50 text-slate-700 border-slate-200';
    }
};

export const formatRetentionPeriod = (months: number): string => {
    if (months < 12) {
        return `${months} month${months > 1 ? 's' : ''}`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
    }
    return `${years}y ${remainingMonths}m`;
};

export const canUserView = (userRole: string): boolean => {
    return ['Admin', 'QA Manager', 'Quality Assurance', 'Manager'].includes(userRole);
};

export const logAuditTrail = (
    documentId: string,
    documentCode: string,
    action: 'viewed' | 'downloaded' | 'deleted',
    performedBy: string,
    details?: string
) => {
    // In production, this would call an API endpoint
};
