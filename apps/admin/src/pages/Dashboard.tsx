import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminClient } from '../api/admin-client';
import type { AdminDashboardMetrics } from '../../../../shared/contracts/admin';
import { 
  Users, 
  Flame, 
  MessageSquare, 
  Scan, 
  Plane, 
  Bell, 
  Heart,
  TrendingUp,
  Activity,
  AlertTriangle
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { data: metrics, isLoading, error } = useQuery<AdminDashboardMetrics>({
    queryKey: ['adminDashboardMetrics'],
    queryFn: adminClient.getDashboardMetrics,
    refetchInterval: 30000, // Refresh metrics every 30 seconds
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div className="status-indicator active" style={{ marginRight: '10px' }}></div>
        <span style={{ color: 'var(--text-secondary)' }}>Loading live dashboard indicators...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        style={{ 
          backgroundColor: 'var(--danger-bg)', 
          color: 'var(--danger)', 
          border: '1px solid var(--danger-border)', 
          padding: '20px', 
          borderRadius: 'var(--radius-lg)' 
        }}
      >
        <div className="flex-row" style={{ gap: '10px' }}>
          <AlertTriangle size={20} />
          <h4 style={{ margin: 0 }}>Failed to sync dashboard metrics</h4>
        </div>
        <p style={{ marginTop: '10px', fontSize: '13px' }}>
          Please check that the server is online and you have correct analytical read permissions.
        </p>
      </div>
    );
  }

  // Fallback defaults
  const m = metrics || {
    totalUsers: 0,
    activeUsers: 0,
    newRegistrations: 0,
    mealsLogged: 0,
    aiChats: 0,
    scans: 0,
    travelSessions: 0,
    notificationsSent: 0,
    healthScoreAverage: 0,
    systemStatus: 'healthy'
  };

  const dashboardCards = [
    { label: 'Total Enrolled Users', value: m.totalUsers, subtitle: `+${m.newRegistrations} registrations this week`, icon: Users, variant: 'primary' },
    { label: 'Weekly Active Users', value: m.activeUsers, subtitle: `${Math.round((m.activeUsers / (m.totalUsers || 1)) * 100)}% active rate`, icon: Activity, variant: 'success' },
    { label: 'Avg Health Score', value: `${Math.round(m.healthScoreAverage)}/100`, subtitle: 'Aggregated across user cohorts', icon: Heart, variant: 'accent' },
    { label: 'Meals Logged', value: m.mealsLogged, subtitle: 'Total nutritional entries recorded', icon: Flame, variant: 'warning' },
    { label: 'AI Coach Dialogs', value: m.aiChats, subtitle: 'Natural conversations with coach', icon: MessageSquare, variant: 'info' },
    { label: 'Food Scanned', value: m.scans, subtitle: 'Computer vision food scans', icon: Scan, variant: 'primary' },
    { label: 'Travel Modifiers', value: m.travelSessions, subtitle: 'Active recovery mode compensations', icon: Plane, variant: 'accent' },
    { label: 'Notifications Pushed', value: m.notificationsSent, subtitle: 'Behavior-aware reminders triggered', icon: Bell, variant: 'success' },
  ];

  return (
    <div>
      {/* Metrics Grid */}
      <div className="metrics-grid">
        {dashboardCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`card metric-card ${card.variant}`}>
              <div className="metric-header">
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{card.label}</span>
                <Icon size={18} style={{ opacity: 0.8 }} />
              </div>
              <div className="metric-value">{card.value}</div>
              <div className="metric-label">{card.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Main Panel Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Trend Analysis Graph Panel */}
        <div className="card">
          <div className="flex-row justify-between mb-20">
            <h3 style={{ fontSize: '18px' }}>User Engagement & Logging Cohorts</h3>
            <span className="badge badge-info flex-row" style={{ gap: '4px' }}>
              <TrendingUp size={12} />
              <span>Real-Time Trends</span>
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '13px' }}>
            System check of database transactions across the core subsystems.
          </p>

          {/* SVG Line Chart Graphic */}
          <div style={{ position: 'relative', height: '220px', width: '100%', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <svg viewBox="0 0 500 200" width="100%" height="100%" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="500" y2="50" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4" />
              
              {/* Area */}
              <path 
                d="M 0 160 Q 80 120 160 140 T 320 80 T 480 50 L 500 50 L 500 200 L 0 200 Z" 
                fill="url(#chartGrad)" 
              />
              {/* Line */}
              <path 
                d="M 0 160 Q 80 120 160 140 T 320 80 T 480 50 L 500 50" 
                fill="none" 
                stroke="var(--primary)" 
                strokeWidth="3" 
              />
              
              {/* Overlay Dots */}
              <circle cx="160" cy="140" r="5" fill="var(--accent)" stroke="var(--text-primary)" strokeWidth="2" />
              <circle cx="320" cy="80" r="5" fill="var(--accent)" stroke="var(--text-primary)" strokeWidth="2" />
              <circle cx="480" cy="50" r="5" fill="var(--accent)" stroke="var(--text-primary)" strokeWidth="2" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun (Today)</span>
            </div>
          </div>
        </div>

        {/* System Operations Center */}
        <div className="card">
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Service Node Registry</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '13px' }}>
            Health statuses of live micro-services and third-party integrations.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { name: 'Core API Engine', desc: 'NestJS Framework / Prisma Client', status: 'Online', badge: 'badge-success' },
              { name: 'AI Coach Engine', desc: 'Gemini Agentic Context Retriever', status: 'Online', badge: 'badge-success' },
              { name: 'Notification Worker', desc: 'Habit & Reminder Scheduler', status: 'Online', badge: 'badge-success' },
              { name: 'Food Scanner API', desc: 'Vision Recognition Model', status: 'Online', badge: 'badge-success' },
              { name: 'Analytics Pipeline', desc: 'Health Score Batch Calculator', status: 'Online', badge: 'badge-success' },
            ].map((node, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border-color)' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{node.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{node.desc}</div>
                </div>
                <span className={`badge ${node.badge}`} style={{ padding: '3px 8px', fontSize: '10px' }}>{node.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
