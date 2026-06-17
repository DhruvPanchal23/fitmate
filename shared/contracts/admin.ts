export interface AdminUserResponse {
  id: string;
  email: string;
  fullName: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
  createdAt: string;
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  newRegistrations: number;
  mealsLogged: number;
  aiChats: number;
  scans: number;
  travelSessions: number;
  notificationsSent: number;
  healthScoreAverage: number;
  systemStatus: 'healthy' | 'degraded' | 'maintenance';
}

export interface AuditLogResponse {
  id: string;
  adminUserEmail: string | null;
  action: string;
  target: string;
  beforeValue: string | null;
  afterValue: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface FeatureFlagResponse {
  id: string;
  key: string;
  description: string | null;
  enabled: boolean;
  rules: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RemoteConfigResponse {
  id: string;
  key: string;
  value: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SystemAnnouncementResponse {
  id: string;
  title: string;
  body: string;
  targetGroup: string; // all, selected, premium, beta
  scheduledFor: string | null;
  expiresAt: string | null;
  sent: boolean;
  createdAt: string;
}

export interface PromptTemplateResponse {
  id: string;
  key: string;
  description: string | null;
  activeId: string | null;
  versions: ContentVersionResponse[];
  createdAt: string;
}

export interface ContentVersionResponse {
  id: string;
  promptTemplateId: string;
  version: number;
  content: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUserManagementResponse {
  id: string;
  email: string;
  fullName: string;
  isSuspended: boolean;
  isBanned: boolean;
  createdAt: string;
}
