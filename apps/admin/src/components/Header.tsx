import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Administrative Dashboard';
      case 'users':
        return 'User Accounts Moderation';
      case 'foods':
        return 'Food Catalog Content Management';
      case 'prompts':
        return 'AI Prompt Version Control';
      case 'flags':
        return 'Feature Flag Configurations';
      case 'configs':
        return 'Remote Runtime Configs';
      case 'announcements':
        return 'System-Wide Announcements';
      case 'audits':
        return 'Security & Audit Logs';
      default:
        return 'Control Center';
    }
  };

  return (
    <header className="header">
      <div className="flex-row" style={{ gap: '12px' }}>
        <h2 className="header-title">{getTitle()}</h2>
      </div>

      <div className="header-actions">
        {/* System Health Status Indicator */}
        <div 
          className="flex-row" 
          style={{ 
            backgroundColor: 'var(--bg-tertiary)', 
            padding: '6px 14px', 
            borderRadius: '50px',
            border: '1px solid var(--border-color)',
            fontSize: '12px',
            gap: '8px'
          }}
        >
          <span className="status-indicator active"></span>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>System: Healthy</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-sm"
          style={{ padding: '8px', borderRadius: '50%' }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};
export default Header;
