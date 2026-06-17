import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { adminClient } from './api/admin-client';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import FoodManagement from './pages/FoodManagement';
import PromptManagement from './pages/PromptManagement';
import FeatureFlags from './pages/FeatureFlags';
import RemoteConfig from './pages/RemoteConfig';
import Announcements from './pages/Announcements';
import AuditLogs from './pages/AuditLogs';
import Operations from './pages/Operations';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  useEffect(() => {
    // Check local token validity on boot
    const token = localStorage.getItem('admin_token');
    const user = adminClient.getCurrentUser();
    if (token && user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    adminClient.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'foods':
        return <FoodManagement />;
      case 'prompts':
        return <PromptManagement />;
      case 'flags':
        return <FeatureFlags />;
      case 'configs':
        return <RemoteConfig />;
      case 'announcements':
        return <Announcements />;
      case 'audits':
        return <AuditLogs />;
      case 'operations':
        return <Operations />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
      />
      <div className="main-content">
        <Header activeTab={activeTab} />
        <main className="workspace">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
