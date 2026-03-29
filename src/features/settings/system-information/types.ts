// Tab types
export type TabType = "application" | "server" | "database" | "api" | "features" | "license" | "storage" | "changelog";

// Application Information
export interface ApplicationInfo {
  name: string;
  version: string;
  environment: "development" | "staging" | "production";
  buildDate: string;
  buildNumber: string;
  description: string;
  frameworkVersion: string;
  typeScriptVersion: string;
  buildTool: string;
}

// Server Information
export interface ServerInfo {
  os: string;
  nodeVersion: string;
  memoryTotal: string;
  memoryUsed: string;
  memoryUsagePercent: number;
  cpuCores: number;
  cpuModel: string;
  cpuUsagePercent: number;
  uptime: string;
  diskTotal: string;
  diskUsed: string;
  diskUsagePercent: number;
  networkInterfaces: NetworkInterface[];
  processCount: number;
  loadAverage: string;
}

export interface NetworkInterface {
  name: string;
  ipAddress: string;
  type: 'IPv4' | 'IPv6';
  status: 'up' | 'down';
}

// Database Information
export interface DatabaseInfo {
  type: string;
  version: string;
  host: string;
  port: string;
  database: string;
  connectionStatus: "connected" | "disconnected";
  lastBackup: string;
  connectionPool: ConnectionPoolInfo;
  tableStats: TableStats[];
  totalSize: string;
  activeConnections: number;
  maxConnections: number;
}

export interface ConnectionPoolInfo {
  maxSize: number;
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  avgResponseTime: string;
}

export interface TableStats {
  name: string;
  rowCount: number;
  size: string;
  lastModified: string;
}

// API Information
export interface ApiInfo {
  baseUrl: string;
  version: string;
  status: "online" | "offline";
  lastHealthCheck: string;
  responseTime: string;
  endpoints: ApiEndpoint[];
  requestStats: RequestStats;
  rateLimiting: RateLimitInfo;
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  status: 'healthy' | 'degraded' | 'down';
  avgResponseTime: string;
}

export interface RequestStats {
  totalRequests24h: number;
  successRate: number;
  avgResponseTime: string;
  peakResponseTime: string;
  errorCount24h: number;
  topEndpoints: { path: string; count: number }[];
}

export interface RateLimitInfo {
  enabled: boolean;
  requestsPerMinute: number;
  burstLimit: number;
  currentUsage: number;
}

// Storage Information
export interface StorageInfo {
  provider: string;
  totalStorage: string;
  usedStorage: string;
  usagePercent: number;
  documentsCount: number;
  attachmentsCount: number;
  backupsCount: number;
  fileTypeBreakdown: FileTypeBreakdown[];
  recentUploads: RecentUpload[];
}

export interface FileTypeBreakdown {
  type: string;
  count: number;
  size: string;
  percentage: number;
}

export interface RecentUpload {
  fileName: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  type: string;
}

// Feature Flags
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category?: string;
}

// License Information
export interface LicenseInfo {
  licenseType: string;
  companyName: string;
  issuedDate: string;
  expiryDate: string;
  daysUntilExpiry: number;
  maxUsers: number;
  activeUsers: number;
  modules: string[];
  licenseKey: string;
  supportLevel: string;
  supportEmail: string;
}

// Changelog Entry
export interface ChangelogEntry {
  version: string;
  releaseDate: string;
  changes: {
    features?: string[];
    improvements?: string[];
    bugFixes?: string[];
  };
}

// System Information (combined)
export interface SystemInfo {
  application: ApplicationInfo;
  server: ServerInfo;
  database: DatabaseInfo;
  api: ApiInfo;
  features: FeatureFlag[];
  license: LicenseInfo;
  storage: StorageInfo;
}
