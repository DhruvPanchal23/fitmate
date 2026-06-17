import React, { useState, useEffect } from 'react';
import { adminClient } from '../api/admin-client';
import { 
  Activity, 
  Cpu, 
  RefreshCw, 
  Play, 
  CheckCircle, 
  XCircle, 
  Search, 
  Trash2, 
  Download, 
  Upload
} from 'lucide-react';

export const Operations: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'health' | 'jobs' | 'sessions' | 'errors' | 'backups'>('health');
  
  // States
  const [healthData, setHealthData] = useState<any>(null);
  const [jobsData, setJobsData] = useState<any[]>([]);
  const [errorsData, setErrorsData] = useState<{ inMemory: any[]; critical: any[] }>({ inMemory: [], critical: [] });
  const [backupsData, setBackupsData] = useState<any[]>([]);
  
  // Sessions states
  const [sessionSearchId, setSessionSearchId] = useState<string>('');
  const [userSessions, setUserSessions] = useState<any[]>([]);
  
  // Loading & logs
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  const [backupType, setBackupType] = useState<string>('all');
  const [selectedError, setSelectedError] = useState<any>(null);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await adminClient.getSystemHealth();
      setHealthData(data);
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Failed to fetch system health', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await adminClient.getJobs();
      setJobsData(data);
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Failed to fetch background jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const runJob = async (name: string) => {
    try {
      await adminClient.runJob(name);
      showMessage(`Job ${name} triggered successfully`, 'success');
      fetchJobs();
    } catch (err: any) {
      showMessage(err.response?.data?.message || `Failed to run job ${name}`, 'error');
    }
  };

  const handleSearchSessions = async () => {
    if (!sessionSearchId) {
      showMessage('Please enter a User ID', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await adminClient.getUserSessions(sessionSearchId);
      setUserSessions(data);
      if (data.length === 0) {
        showMessage('No active sessions found for this user', 'error');
      }
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Failed to fetch user sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await adminClient.revokeUserSession(sessionId, sessionSearchId);
      showMessage('Session revoked successfully', 'success');
      handleSearchSessions();
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Failed to revoke session', 'error');
    }
  };

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const data = await adminClient.getErrors();
      setErrorsData(data);
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Failed to load error logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const data = await adminClient.getBackups();
      setBackupsData(data);
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Failed to load backups list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const triggerBackup = async () => {
    setLoading(true);
    try {
      const res = await adminClient.createBackup(backupType);
      showMessage(`Backup created: ${res.filename}`, 'success');
      fetchBackups();
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Failed to create backup', 'error');
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async (filename: string) => {
    if (!window.confirm(`Are you sure you want to restore the backup: ${filename}? This will overwrite existing data.`)) {
      return;
    }
    setLoading(true);
    try {
      await adminClient.restoreBackup(filename);
      showMessage(`Backup ${filename} restored successfully`, 'success');
    } catch (err: any) {
      showMessage(err.response?.data?.message || 'Failed to restore backup', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'health') fetchHealth();
    if (activeSubTab === 'jobs') fetchJobs();
    if (activeSubTab === 'errors') fetchErrors();
    if (activeSubTab === 'backups') fetchBackups();
  }, [activeSubTab]);

  return (
    <div className="operations-page">
      <div className="flex-row justify-between mb-20">
        <div>
          <h2>System Operations</h2>
          <p className="text-muted">Manage system health, background jobs, user sessions, error logs, and data backups.</p>
        </div>
        <button className="btn btn-secondary flex-row" onClick={() => {
          if (activeSubTab === 'health') fetchHealth();
          if (activeSubTab === 'jobs') fetchJobs();
          if (activeSubTab === 'errors') fetchErrors();
          if (activeSubTab === 'backups') fetchBackups();
        }} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} style={{ marginRight: '8px' }} />
          Refresh
        </button>
      </div>

      {message.text && (
        <div className={`banner ${message.type === 'success' ? 'banner-success' : 'banner-danger'} mb-20`} style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
          color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${message.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Tab Selectors */}
      <div className="tabs-container mb-20" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        <button className={`tab-btn ${activeSubTab === 'health' ? 'active' : ''}`} onClick={() => setActiveSubTab('health')} style={{
          padding: '8px 16px',
          border: 'none',
          background: activeSubTab === 'health' ? 'var(--primary-bg)' : 'transparent',
          color: activeSubTab === 'health' ? 'var(--primary)' : 'var(--text-secondary)',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          cursor: 'pointer'
        }}>Health & Metrics</button>
        <button className={`tab-btn ${activeSubTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveSubTab('jobs')} style={{
          padding: '8px 16px',
          border: 'none',
          background: activeSubTab === 'jobs' ? 'var(--primary-bg)' : 'transparent',
          color: activeSubTab === 'jobs' ? 'var(--primary)' : 'var(--text-secondary)',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          cursor: 'pointer'
        }}>Background Jobs</button>
        <button className={`tab-btn ${activeSubTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveSubTab('sessions')} style={{
          padding: '8px 16px',
          border: 'none',
          background: activeSubTab === 'sessions' ? 'var(--primary-bg)' : 'transparent',
          color: activeSubTab === 'sessions' ? 'var(--primary)' : 'var(--text-secondary)',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          cursor: 'pointer'
        }}>Session Viewer</button>
        <button className={`tab-btn ${activeSubTab === 'errors' ? 'active' : ''}`} onClick={() => setActiveSubTab('errors')} style={{
          padding: '8px 16px',
          border: 'none',
          background: activeSubTab === 'errors' ? 'var(--primary-bg)' : 'transparent',
          color: activeSubTab === 'errors' ? 'var(--primary)' : 'var(--text-secondary)',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          cursor: 'pointer'
        }}>Error Explorer</button>
        <button className={`tab-btn ${activeSubTab === 'backups' ? 'active' : ''}`} onClick={() => setActiveSubTab('backups')} style={{
          padding: '8px 16px',
          border: 'none',
          background: activeSubTab === 'backups' ? 'var(--primary-bg)' : 'transparent',
          color: activeSubTab === 'backups' ? 'var(--primary)' : 'var(--text-secondary)',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          cursor: 'pointer'
        }}>Backup Manager</button>
      </div>

      {/* Health & Metrics Tab */}
      {activeSubTab === 'health' && healthData && (
        <div>
          <div className="metrics-grid mb-20" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="card metric-card primary" style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                <span>System Status</span>
                <Activity size={18} />
              </div>
              <div className="metric-value" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>ONLINE</div>
              <div className="metric-label" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Uptime: {Math.round(healthData.uptime / 60)} minutes</div>
            </div>

            <div className="card metric-card success" style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                <span>Memory Utilization</span>
                <Cpu size={18} />
              </div>
              <div className="metric-value" style={{ fontSize: '24px', fontWeight: 700 }}>{healthData.memory?.rss || '0 MB'}</div>
              <div className="metric-label" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Heap Used: {healthData.memory?.heapUsed || '0 MB'}</div>
            </div>

            <div className="card metric-card accent" style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                <span>CPU Load (1m)</span>
                <Cpu size={18} />
              </div>
              <div className="metric-value" style={{ fontSize: '24px', fontWeight: 700 }}>{(healthData.cpu?.loadavg?.[0] || 0.0).toFixed(2)}</div>
              <div className="metric-label" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Available Cores: {healthData.cpu?.cores || 1}</div>
            </div>

            <div className="card metric-card warning" style={{ backgroundColor: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
              <div className="metric-header" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                <span>Avg API Latency</span>
                <Activity size={18} />
              </div>
              <div className="metric-value" style={{ fontSize: '24px', fontWeight: 700 }}>{Math.round(healthData.metrics?.avgLatencyMs || 0)} ms</div>
              <div className="metric-label" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Total Requests: {healthData.metrics?.totalRequests || 0}</div>
            </div>
          </div>

          <div className="card mb-20" style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h3>AI Provider Integrations</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px' }}>
              <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>Google Gemini API</strong>
                  <span className={`badge ${healthData.providers?.gemini === 'configured' ? 'badge-success' : 'badge-danger'}`} style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: healthData.providers?.gemini === 'configured' ? 'var(--success-bg)' : 'var(--danger-bg)',
                    color: healthData.providers?.gemini === 'configured' ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {healthData.providers?.gemini === 'configured' ? 'CONNECTED' : 'MISSING'}
                  </span>
                </div>
                <p className="text-muted" style={{ fontSize: '12px', marginTop: '8px' }}>Used for multimodal meal scanning, chat reasoning, and travel plans.</p>
              </div>

              <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>OpenAI GPT-4 API</strong>
                  <span className={`badge ${healthData.providers?.openai === 'configured' ? 'badge-success' : 'badge-danger'}`} style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: healthData.providers?.openai === 'configured' ? 'var(--success-bg)' : 'var(--danger-bg)',
                    color: healthData.providers?.openai === 'configured' ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {healthData.providers?.openai === 'configured' ? 'CONNECTED' : 'MISSING'}
                  </span>
                </div>
                <p className="text-muted" style={{ fontSize: '12px', marginTop: '8px' }}>Used as fallback model and complex nutritional calculations.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background Jobs Tab */}
      {activeSubTab === 'jobs' && (
        <div className="card" style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <h3>Background Automation Scheduler</h3>
          <p className="text-muted mb-20">Manages cleanup of temp files, expired caches, and database logs.</p>
          <table className="table w-full" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 8px' }}>Job Name</th>
                <th style={{ padding: '12px 8px' }}>Last Executed</th>
                <th style={{ padding: '12px 8px' }}>Duration</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
                <th style={{ padding: '12px 8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobsData.map((job) => (
                <tr key={job.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px 8px', fontWeight: 600 }}>{job.name}</td>
                  <td style={{ padding: '16px 8px' }}>{job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}</td>
                  <td style={{ padding: '16px 8px' }}>{job.durationMs ? `${job.durationMs}ms` : '-'}</td>
                  <td style={{ padding: '16px 8px' }}>
                    {job.status === 'SUCCESS' && (
                      <span className="flex-row" style={{ color: 'var(--success)', gap: '4px' }}>
                        <CheckCircle size={14} /> Success
                      </span>
                    )}
                    {job.status === 'FAILURE' && (
                      <span className="flex-row" style={{ color: 'var(--danger)', gap: '4px' }}>
                        <XCircle size={14} /> Failed
                      </span>
                    )}
                    {!job.status && <span style={{ color: 'var(--text-muted)' }}>Idle</span>}
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    <button className="btn btn-secondary flex-row" onClick={() => runJob(job.name)} style={{ padding: '6px 12px', gap: '6px' }}>
                      <Play size={12} /> Run Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Session Viewer Tab */}
      {activeSubTab === 'sessions' && (
        <div className="card" style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <h3>Device Session Explorer</h3>
          <p className="text-muted mb-20">Search and audit active user session tokens, fingerprints, and revoke device authorizations.</p>
          
          <div className="flex-row mb-20" style={{ gap: '10px' }}>
            <div className="search-input-container" style={{ position: 'relative', flex: 1 }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Enter User ID to view sessions..." 
                value={sessionSearchId} 
                onChange={(e) => setSessionSearchId(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)' }}
              />
            </div>
            <button className="btn btn-primary flex-row" onClick={handleSearchSessions} style={{ gap: '6px', height: '40px' }}>
              <Search size={16} /> Search Sessions
            </button>
          </div>

          {userSessions.length > 0 ? (
            <table className="table w-full" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 8px' }}>Session ID</th>
                  <th style={{ padding: '12px 8px' }}>Device Info</th>
                  <th style={{ padding: '12px 8px' }}>IP Address</th>
                  <th style={{ padding: '12px 8px' }}>Last Active</th>
                  <th style={{ padding: '12px 8px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {userSessions.map((session) => (
                  <tr key={session.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 8px', fontSize: '12px', color: 'var(--text-muted)' }}>{session.id}</td>
                    <td style={{ padding: '16px 8px', fontWeight: 600 }}>{session.deviceInfo}</td>
                    <td style={{ padding: '16px 8px' }}>{session.ipAddress}</td>
                    <td style={{ padding: '16px 8px' }}>{new Date(session.lastLoginAt).toLocaleString()}</td>
                    <td style={{ padding: '16px 8px' }}>
                      <button className="btn flex-row" onClick={() => handleRevokeSession(session.id)} style={{ color: 'var(--danger)', padding: '6px 12px', border: '1px solid var(--danger-border)', backgroundColor: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)', gap: '4px', cursor: 'pointer' }}>
                        <Trash2 size={12} /> Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No sessions queried yet. Enter a valid user ID to verify sessions.
            </div>
          )}
        </div>
      )}

      {/* Error Explorer Tab */}
      {activeSubTab === 'errors' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card" style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h3>Recent In-Memory Failures</h3>
            <p className="text-muted mb-20">Captured during current runtime application lifecycle.</p>
            {errorsData.inMemory.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {errorsData.inMemory.map((err) => (
                  <li key={err.id} onClick={() => setSelectedError(err)} style={{
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    backgroundColor: selectedError?.id === err.id ? 'var(--primary-bg)' : 'transparent'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--danger)' }}>[{err.category}]</span>
                      <span className="text-muted" style={{ fontSize: '11px' }}>{new Date(err.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{err.message}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ padding: '30px 0', color: 'var(--text-muted)', textAlign: 'center' }}>No runtime failures captured yet.</div>
            )}
          </div>

          <div className="card" style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h3>Critical Failures Log (Persisted)</h3>
            <p className="text-muted mb-20">Unexpected system logs loaded from file storage.</p>
            {errorsData.critical.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {errorsData.critical.map((err) => (
                  <li key={err.id} onClick={() => setSelectedError(err)} style={{
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    backgroundColor: selectedError?.id === err.id ? 'var(--primary-bg)' : 'transparent'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--danger)' }}>[{err.category}]</span>
                      <span className="text-muted" style={{ fontSize: '11px' }}>{new Date(err.timestamp).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{err.message}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ padding: '30px 0', color: 'var(--text-muted)', textAlign: 'center' }}>No critical error logs persisted.</div>
            )}
          </div>

          {selectedError && (
            <div className="card" style={{ gridColumn: 'span 2', backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                <h4 style={{ margin: 0 }}>Error Details: {selectedError.id}</h4>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedError(null)}>Clear Detail View</button>
              </div>
              <div>
                <p><strong>Category:</strong> {selectedError.category}</p>
                <p><strong>Message:</strong> {selectedError.message}</p>
                <p><strong>Timestamp:</strong> {new Date(selectedError.timestamp).toLocaleString()}</p>
                {selectedError.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      overflowX: 'auto',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      marginTop: '8px',
                      color: 'var(--danger)'
                    }}>{selectedError.stack}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backup Manager Tab */}
      {activeSubTab === 'backups' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card" style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h3>Create Snapshot Backup</h3>
            <p className="text-muted mb-20">Trigger exports of different system catalogs and models.</p>
            
            <div className="form-group mb-20">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Snapshot Target Type</label>
              <select className="input-field" value={backupType} onChange={(e) => setBackupType(e.target.value)} style={{
                width: '100%',
                padding: '10px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}>
                <option value="all">Full Database (All tables)</option>
                <option value="prompts">AI Prompt Templates & Versions</option>
                <option value="memory">AI Coach Long-term Memory Logs</option>
                <option value="food">System Food Catalog</option>
                <option value="config">Remote Configurations & Environment</option>
              </select>
            </div>

            <button className="btn btn-primary flex-row" onClick={triggerBackup} style={{ gap: '6px' }} disabled={loading}>
              <Download size={16} /> Generate Snapshot
            </button>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <h3>Available System Snapshots</h3>
            <p className="text-muted mb-20">List of backups stored locally in backup directory.</p>
            {backupsData.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {backupsData.map((backup) => (
                  <li key={backup.filename} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '10px'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{backup.filename}</div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>
                        Size: {Math.round(backup.sizeBytes / 1024)} KB | {new Date(backup.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button className="btn btn-secondary flex-row btn-sm" onClick={() => restoreBackup(backup.filename)} style={{ gap: '4px' }} disabled={loading}>
                      <Upload size={12} /> Restore
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ padding: '30px 0', color: 'var(--text-muted)', textAlign: 'center' }}>No snapshot files found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Operations;
