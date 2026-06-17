import React, { useState } from 'react';
import { adminClient } from '../api/admin-client';
import { Lock, Mail, UserPlus, Info } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminClient.login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid administrative credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminClient.setup(email, password, fullName);
      setSuccessMsg('Super Admin account created successfully! You can now log in.');
      setIsSetupMode(false);
      setPassword('');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Initialization failed. Roles may already be seeded.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <h1>FITMATE Admin</h1>
          <p>{isSetupMode ? 'System Initialization Setup' : 'Ecosystem Management Control Center'}</p>
        </div>

        {error && (
          <div 
            style={{ 
              backgroundColor: 'var(--danger-bg)', 
              color: 'var(--danger)', 
              border: '1px solid var(--danger-border)', 
              padding: '12px', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '20px',
              fontSize: '13px'
            }}
          >
            {error}
          </div>
        )}

        {successMsg && (
          <div 
            style={{ 
              backgroundColor: 'var(--success-bg)', 
              color: 'var(--success)', 
              border: '1px solid var(--success-border)', 
              padding: '12px', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '20px',
              fontSize: '13px'
            }}
          >
            {successMsg}
          </div>
        )}

        {!isSetupMode ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@fitmate.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ width: '100%', padding: '12px' }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In as Admin'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsSetupMode(true);
                  setError('');
                  setSuccessMsg('');
                }}
                className="btn-secondary bg-transparent border-none"
                style={{ 
                  color: 'var(--primary)', 
                  border: 'none', 
                  background: 'none', 
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                New system? Boot Super Admin config
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSetup}>
            <div 
              className="flex-row" 
              style={{ 
                backgroundColor: 'var(--info-bg)', 
                padding: '12px', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--info-border)',
                marginBottom: '20px',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              <Info size={16} style={{ color: 'var(--info)', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Seeding will initialize database RBAC roles (Super Admin, Editor, Moderation) and register your user.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <UserPlus size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Master Admin"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Super Admin Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@fitmate.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label">Setup Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '15px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              style={{ width: '100%', padding: '12px' }}
              disabled={loading}
            >
              {loading ? 'Initializing...' : 'Seed RBAC & Save Admin'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsSetupMode(false);
                  setError('');
                }}
                className="btn-secondary bg-transparent border-none"
                style={{ 
                  color: 'var(--text-secondary)', 
                  border: 'none', 
                  background: 'none', 
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                Back to Admin Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default Login;
