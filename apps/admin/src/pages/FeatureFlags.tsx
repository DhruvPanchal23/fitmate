import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminClient } from '../api/admin-client';
import type { FeatureFlagResponse } from '../../../../shared/contracts/admin';
import { Search, Plus, Edit, X, HelpCircle } from 'lucide-react';

export const FeatureFlags: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlagResponse | null>(null);

  // Form states
  const [flagForm, setFlagForm] = useState({
    key: '',
    description: '',
    enabled: false,
    rules: '',
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const queryClient = useQueryClient();

  const { data: flags = [], isLoading, error } = useQuery<FeatureFlagResponse[]>({
    queryKey: ['adminFlags'],
    queryFn: adminClient.getFeatureFlags,
  });

  // Mutations
  const createFlagMutation = useMutation({
    mutationFn: (data: any) => adminClient.createFeatureFlag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFlags'] });
      setSuccessMsg('Feature flag created successfully.');
      setIsModalOpen(false);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to create feature flag'),
  });

  const updateFlagMutation = useMutation({
    mutationFn: ({ key, data }: { key: string; data: any }) => adminClient.updateFeatureFlag(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFlags'] });
      setSuccessMsg('Feature flag updated successfully.');
      setIsModalOpen(false);
      setSelectedFlag(null);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to update feature flag'),
  });

  const toggleFlagMutation = useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) => 
      adminClient.updateFeatureFlag(key, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFlags'] });
      setSuccessMsg('Feature flag toggle applied and logged.');
    },
  });

  // Handlers
  const handleEditClick = (flag?: FeatureFlagResponse) => {
    setErrorMsg('');
    if (flag) {
      setSelectedFlag(flag);
      setFlagForm({
        key: flag.key,
        description: flag.description || '',
        enabled: flag.enabled,
        rules: flag.rules || '',
      });
    } else {
      setSelectedFlag(null);
      setFlagForm({
        key: '',
        description: '',
        enabled: false,
        rules: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveFlag = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Validate rules JSON if provided
    if (flagForm.rules.trim()) {
      try {
        JSON.parse(flagForm.rules);
      } catch (err: any) {
        setErrorMsg(`Invalid Rules JSON: ${err.message}`);
        return;
      }
    }

    if (selectedFlag) {
      updateFlagMutation.mutate({ key: selectedFlag.key, data: flagForm });
    } else {
      createFlagMutation.mutate(flagForm);
    }
  };

  const filteredFlags = flags.filter(flag => 
    flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (flag.description && flag.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      {/* Search & Actions */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Filter keys by flag identifier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button onClick={() => handleEditClick()} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
          <Plus size={14} />
          <span>New Feature Flag</span>
        </button>
      </div>

      {/* Messages */}
      {(successMsg || errorMsg) && (
        <div style={{ marginBottom: '20px', fontSize: '13px' }}>
          {successMsg && (
            <div style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', padding: '10px 14px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'between' }}>
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg('')} style={{ border: 'none', background: 'none', color: 'var(--success)', cursor: 'pointer', marginLeft: 'auto', fontWeight: 'bold' }}>X</button>
            </div>
          )}
          {errorMsg && (
            <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', padding: '10px 14px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'between', marginTop: '8px' }}>
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg('')} style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', marginLeft: 'auto', fontWeight: 'bold' }}>X</button>
            </div>
          )}
        </div>
      )}

      {/* Table grid */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Flag Key</th>
                <th>Description</th>
                <th>Target Rules</th>
                <th>Enabled Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Loading feature flags...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--danger)' }}>
                    Failed to query flags catalog. Ensure correct permissions.
                  </td>
                </tr>
              ) : filteredFlags.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No feature flags matched filter criteria.
                  </td>
                </tr>
              ) : (
                filteredFlags.map((flag) => (
                  <tr key={flag.id}>
                    <td>
                      <span style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: '13px' }}>
                        {flag.key}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '300px' }}>
                      {flag.description || <span style={{ color: 'var(--text-muted)' }}>No description.</span>}
                    </td>
                    <td>
                      {flag.rules ? (
                        <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', backgroundColor: 'var(--bg-primary)', padding: '4px 8px', borderRadius: '4px', maxWidth: '250px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {flag.rules}
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>All users (No rules)</span>
                      )}
                    </td>
                    <td>
                      <div className="flex-row">
                        <label className="switch">
                          <input 
                            type="checkbox" 
                            checked={flag.enabled} 
                            onChange={(e) => toggleFlagMutation.mutate({ key: flag.key, enabled: e.target.checked })}
                          />
                          <span className="slider"></span>
                        </label>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: flag.enabled ? 'var(--success)' : 'var(--text-muted)', marginLeft: '10px' }}>
                          {flag.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleEditClick(flag)}
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '4px' }}
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Form Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{selectedFlag ? 'Edit Feature Flag' : 'New Feature Flag'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFlag}>
              <div className="form-group">
                <label className="form-label">Flag Identifier Key (Unique)</label>
                <input
                  type="text"
                  className="form-input"
                  value={flagForm.key}
                  onChange={(e) => setFlagForm({ ...flagForm, key: e.target.value })}
                  placeholder="e.g. ENABLE_MEAL_REPLACEMENT"
                  style={{ fontFamily: 'var(--mono)' }}
                  disabled={!!selectedFlag}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={flagForm.description}
                  onChange={(e) => setFlagForm({ ...flagForm, description: e.target.value })}
                  placeholder="Describe the rollout purpose..."
                  style={{ height: '80px' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Segment Target Rules (JSON Format - Optional)</label>
                <textarea
                  className="form-textarea"
                  value={flagForm.rules}
                  onChange={(e) => setFlagForm({ ...flagForm, rules: e.target.value })}
                  placeholder={`{
  "user_cohorts": ["beta", "premium"],
  "min_app_version": "1.4.0"
}`}
                  style={{ height: '120px', fontFamily: 'var(--mono)', fontSize: '12px' }}
                />
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HelpCircle size={12} />
                  <span>Leave blank to evaluate globally based on the toggle.</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Initial Toggle Status</label>
                <div className="flex-row">
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={flagForm.enabled} 
                      onChange={(e) => setFlagForm({ ...flagForm, enabled: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: flagForm.enabled ? 'var(--success)' : 'var(--text-secondary)' }}>
                    {flagForm.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default FeatureFlags;
