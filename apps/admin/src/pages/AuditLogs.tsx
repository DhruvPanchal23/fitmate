import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminClient } from '../api/admin-client';
import type { AuditLogResponse } from '../../../../shared/contracts/admin';
import { Search, Shield, ChevronDown, ChevronUp, Clock, Monitor, Globe, FileDiff } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const { data: logs = [], isLoading, error } = useQuery<AuditLogResponse[]>({
    queryKey: ['adminAuditLogs'],
    queryFn: adminClient.getAuditLogs,
    refetchInterval: 15000, // Sync logs every 15 seconds
  });

  const toggleExpandLog = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const tryFormatJson = (val: string | null) => {
    if (!val) return 'None / Empty';
    try {
      const parsed = JSON.parse(val);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return val;
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (log.adminUserEmail && log.adminUserEmail.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      {/* Search Filter */}
      <div className="filter-bar">
        <div className="search-box" style={{ maxWidth: '450px' }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search audits by admin email, action key, or target ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Audit List items */}
      <div className="audit-list">
        {isLoading ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Querying audit registry...</div>
        ) : error ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--danger)' }}>Failed to load security audits. Confirm credentials.</div>
        ) : filteredLogs.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
            <Shield size={40} style={{ opacity: 0.5, marginBottom: '12px' }} />
            <div>No administrative events recorded.</div>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const hasDiff = log.beforeValue || log.afterValue;

            return (
              <div key={log.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="audit-item" style={{ cursor: hasDiff ? 'pointer' : 'default' }} onClick={() => hasDiff && toggleExpandLog(log.id)}>
                  <div className="audit-info">
                    <div className="flex-row" style={{ gap: '10px' }}>
                      <span className="badge badge-secondary" style={{ fontFamily: 'var(--mono)', fontSize: '11px', textTransform: 'uppercase' }}>
                        {log.action}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>
                        Target: {log.target}
                      </span>
                    </div>

                    <div className="audit-meta" style={{ marginTop: '8px' }}>
                      <div className="flex-row" style={{ gap: '4px' }}>
                        <Clock size={12} />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <div>•</div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        By: {log.adminUserEmail || 'System / Auto'}
                      </div>
                      {log.ipAddress && (
                        <>
                          <div>•</div>
                          <div className="flex-row" style={{ gap: '4px' }}>
                            <Globe size={12} />
                            <span>IP: {log.ipAddress}</span>
                          </div>
                        </>
                      )}
                      {log.userAgent && (
                        <>
                          <div>•</div>
                          <div className="flex-row" style={{ gap: '4px', maxWidth: '300px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={log.userAgent}>
                            <Monitor size={12} />
                            <span>UA: {log.userAgent}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {hasDiff && (
                    <button 
                      className="btn btn-secondary btn-sm flex-row" 
                      style={{ padding: '6px 12px', gap: '4px' }}
                    >
                      <FileDiff size={12} />
                      <span>Payload Diff</span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  )}
                </div>

                {/* Expanded Diff panel */}
                {isExpanded && hasDiff && (
                  <div 
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderInline: '1px solid var(--border-color)', 
                      borderBottom: '1px solid var(--border-color)', 
                      padding: '20px', 
                      borderBottomLeftRadius: 'var(--radius-md)', 
                      borderBottomRightRadius: 'var(--radius-md)',
                      marginTop: '-6px',
                      marginBottom: '10px'
                    }}
                  >
                    <div className="diff-box">
                      <div>
                        <div className="diff-title">State Before Action</div>
                        <pre className="code-preview" style={{ maxHeight: '200px' }}>
                          {tryFormatJson(log.beforeValue)}
                        </pre>
                      </div>
                      <div>
                        <div className="diff-title">State After Action</div>
                        <pre className="code-preview" style={{ maxHeight: '200px' }}>
                          {tryFormatJson(log.afterValue)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default AuditLogs;
