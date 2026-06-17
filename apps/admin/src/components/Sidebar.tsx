import { 
  LayoutDashboard, 
  Users, 
  Egg, 
  MessageSquareCode, 
  ToggleLeft, 
  Settings, 
  Megaphone, 
  FileSpreadsheet, 
  LogOut,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { adminClient } from '../api/admin-client';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const currentUser = adminClient.getCurrentUser();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'foods', label: 'Foods Catalog', icon: Egg },
    { id: 'prompts', label: 'AI Prompts', icon: MessageSquareCode },
    { id: 'flags', label: 'Feature Flags', icon: ToggleLeft },
    { id: 'configs', label: 'Remote Config', icon: Settings },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'audits', label: 'Audit Logs', icon: FileSpreadsheet },
    { id: 'operations', label: 'System Operations', icon: Activity },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-text">
          <ShieldAlert size={24} />
          <span>FitMate Admin</span>
        </div>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className="sidebar-item">
              <button
                className={`sidebar-link w-full border-none bg-transparent ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                style={{ width: '100%', border: 'none', background: 'transparent', display: 'flex', textAlign: 'left' }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <div className="flex-row justify-between mb-20" style={{ padding: '0 8px' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>
              {currentUser?.fullName || 'Administrator'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
              {currentUser?.role || 'Super Admin'}
            </div>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="btn btn-secondary w-full"
          style={{ width: '100%', gap: '10px' }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
