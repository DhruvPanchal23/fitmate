import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminClient } from '../api/admin-client';
import type { RemoteConfigResponse } from '../../../../shared/contracts/admin';
import { Search, Plus, Edit, X } from 'lucide-react';

export const RemoteConfig: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<RemoteConfigResponse | null>(null);

  // Form states
  const [configForm, setConfigForm] = useState({
    key: '',
    value: '',
    description: '',
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const queryClient = useQueryClient();

  const { data: configs = [], isLoading, error } = useQuery<RemoteConfigResponse[]>({
    queryKey: ['adminConfigs'],
    queryFn: adminClient.getRemoteConfigs,
  });

  // Mutations
  const createConfigMutation = useMutation({
    mutationFn: (data: any) => adminClient.createRemoteConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminConfigs'] });
      setSuccessMsg('Remote configuration parameter created successfully.');
      setIsModalOpen(false);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to create config'),
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({ key, data }: { key: string; data: any }) => adminClient.updateRemoteConfig(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminConfigs'] });
      setSuccessMsg('Remote configuration parameter updated successfully.');
      setIsModalOpen(false);
      setSelectedConfig(null);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to update config'),
  });

  // Handlers
  const handleEditClick = (config?: RemoteConfigResponse) => {
    setErrorMsg('');
    if (config) {
      setSelectedConfig(config);
      setConfigForm({
        key: config.key,
        value: config.value,
        description: config.description || '',
      });
    } else {
      setSelectedConfig(null);
      setConfigForm({
        key: '',
        value: '',
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (selectedConfig) {
      updateConfigMutation.mutate({ key: selectedConfig.key, data: configForm });
    } else {
      createConfigMutation.mutate(configForm);
    }
  };

  const filteredConfigs = configs.filter(config => 
    config.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (config.description && config.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
            placeholder="Filter keys by config parameter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button onClick={() => handleEditClick()} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
          <Plus size={14} />
          <span>Add Config Parameter</span>
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
                <th>Config Key</th>
                <th>Description</th>
                <th>Parameter Value</th>
                <th>Last Updated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Loading parameters...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--danger)' }}>
                    Failed to query remote configs. Ensure correct permissions.
                  </td>
                </tr>
              ) : filteredConfigs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No remote configs matched filter criteria.
                  </td>
                </tr>
              ) : (
                filteredConfigs.map((config) => (
                  <tr key={config.id}>
                    <td>
                      <span style={{ fontWeight: 600, fontFamily: 'var(--mono)', fontSize: '13px' }}>
                        {config.key}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '300px' }}>
                      {config.description || <span style={{ color: 'var(--text-muted)' }}>No description.</span>}
                    </td>
                    <td>
                      <div className="code-preview" style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '280px' }}>
                        {config.value}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {new Date(config.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleEditClick(config)}
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
              <h3 className="modal-title">{selectedConfig ? 'Edit Config Parameter' : 'New Config Parameter'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveConfig}>
              <div className="form-group">
                <label className="form-label">Parameter Key Name (Unique)</label>
                <input
                  type="text"
                  className="form-input"
                  value={configForm.key}
                  onChange={(e) => setConfigForm({ ...configForm, key: e.target.value })}
                  placeholder="e.g. AI_COACH_TEMPERATURE"
                  style={{ fontFamily: 'var(--mono)' }}
                  disabled={!!selectedConfig}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Parameter Value (String or JSON Stringified)</label>
                <input
                  type="text"
                  className="form-input"
                  value={configForm.value}
                  onChange={(e) => setConfigForm({ ...configForm, value: e.target.value })}
                  placeholder="e.g. 0.7 or a stringified JSON"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Purpose</label>
                <textarea
                  className="form-textarea"
                  value={configForm.description}
                  onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })}
                  placeholder="e.g. Sets the temperature parameter for coach responses (valid: 0.0 to 1.0)"
                  style={{ height: '80px' }}
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Config
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default RemoteConfig;
