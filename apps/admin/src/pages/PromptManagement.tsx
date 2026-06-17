import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminClient } from '../api/admin-client';
import type { PromptTemplateResponse } from '../../../../shared/contracts/admin';
import { Plus, Check, Play, Info, Eye, X, ChevronRight, MessageSquareCode } from 'lucide-react';

export const PromptManagement: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  
  // Modals visibility toggles
  const [isCreateKeyOpen, setIsCreateKeyOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Form states
  const [newKey, setNewKey] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newVersionContent, setNewVersionContent] = useState('');
  
  const [previewContent, setPreviewContent] = useState<{ raw: string; parsed: any } | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery<PromptTemplateResponse[]>({
    queryKey: ['adminPrompts'],
    queryFn: adminClient.getPrompts,
  });

  // Mutations
  const createKeyMutation = useMutation({
    mutationFn: (data: { key: string; description: string }) => 
      adminClient.createPromptTemplate(data.key, data.description),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['adminPrompts'] });
      setSuccessMsg(`Prompt key '${data.key || newKey}' created successfully.`);
      setIsCreateKeyOpen(false);
      setNewKey('');
      setNewDescription('');
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to create prompt key'),
  });

  const addVersionMutation = useMutation({
    mutationFn: ({ key, content }: { key: string; content: string }) => 
      adminClient.addPromptVersion(key, content),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['adminPrompts'] });
      setSuccessMsg(`Version v${data.version || ''} created successfully.`);
      setNewVersionContent('');
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to add version'),
  });

  const activateVersionMutation = useMutation({
    mutationFn: ({ key, versionId }: { key: string; versionId: string }) => 
      adminClient.activatePromptVersion(key, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPrompts'] });
      setSuccessMsg('Prompt version successfully set as active.');
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to activate version'),
  });

  // Handlers
  const handlePreview = async (key: string, versionId: string) => {
    setErrorMsg('');
    try {
      const data = await adminClient.previewPrompt(key, versionId);
      setPreviewContent(data);
      setIsPreviewOpen(true);
    } catch (err) {
      setErrorMsg('Failed to generate prompt variable mapping preview.');
    }
  };

  const selectedTemplate = templates.find(t => t.key === selectedKey);

  return (
    <div>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Side: Keys List */}
        <div className="card" style={{ padding: '20px' }}>
          <div className="flex-row justify-between mb-20">
            <h3 style={{ fontSize: '16px' }}>AI Prompts Registry</h3>
            <button 
              onClick={() => setIsCreateKeyOpen(true)} 
              className="btn btn-primary btn-sm"
              style={{ padding: '6px 10px', gap: '4px' }}
            >
              <Plus size={14} />
              <span>Add Key</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isLoading ? (
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Loading templates...</span>
            ) : templates.length === 0 ? (
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No prompt template keys defined.</span>
            ) : (
              templates.map((t) => {
                const isActive = selectedKey === t.key;
                const activeVersion = t.versions.find(v => v.id === t.activeId);
                
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedKey(t.key)}
                    style={{
                      border: '1px solid var(--border-color)',
                      backgroundColor: isActive ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                      borderLeft: isActive ? '3px solid var(--primary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div className="flex-row justify-between" style={{ width: '100%' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px', fontFamily: 'var(--mono)', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {t.key}
                      </span>
                      <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    {t.description && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {t.description}
                      </div>
                    )}
                    {activeVersion && (
                      <div style={{ marginTop: '8px' }}>
                        <span className="badge badge-success" style={{ fontSize: '9px', padding: '1px 6px' }}>
                          Active: v{activeVersion.version}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Selected Details */}
        <div>
          {selectedTemplate ? (
            <div className="card" style={{ padding: '24px' }}>
              <div className="flex-row justify-between mb-20" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontFamily: 'var(--mono)', color: 'var(--primary)' }}>{selectedTemplate.key}</h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>
                    {selectedTemplate.description || 'No description provided.'}
                  </div>
                </div>
              </div>

              {/* Version History List */}
              <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Prompt Versions</h4>
              <div className="table-container" style={{ borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ padding: '10px 16px' }}>Ver</th>
                      <th style={{ padding: '10px 16px' }}>Author</th>
                      <th style={{ padding: '10px 16px' }}>Created Date</th>
                      <th style={{ padding: '10px 16px' }}>Status</th>
                      <th className="text-right" style={{ padding: '10px 16px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTemplate.versions.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          No version logs found. Create the first version below.
                        </td>
                      </tr>
                    ) : (
                      [...selectedTemplate.versions]
                        .sort((a, b) => b.version - a.version)
                        .map((v) => (
                          <tr key={v.id}>
                            <td style={{ fontWeight: 600, padding: '10px 16px' }}>v{v.version}</td>
                            <td style={{ fontSize: '12px', padding: '10px 16px' }}>{v.createdBy}</td>
                            <td style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '10px 16px' }}>
                              {new Date(v.createdAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '10px 16px' }}>
                              {v.isActive ? (
                                <span className="badge badge-success" style={{ fontSize: '10px' }}>Active</span>
                              ) : (
                                <span className="badge badge-secondary" style={{ fontSize: '10px' }}>Draft</span>
                              )}
                            </td>
                            <td className="text-right" style={{ padding: '10px 16px' }}>
                              <div className="flex-row" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                                <button
                                  onClick={() => handlePreview(selectedTemplate.key, v.id)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '4px 8px', gap: '4px' }}
                                >
                                  <Eye size={12} />
                                  <span>Preview</span>
                                </button>
                                
                                {!v.isActive && (
                                  <button
                                    onClick={() => activateVersionMutation.mutate({ key: selectedTemplate.key, versionId: v.id })}
                                    className="btn btn-secondary btn-sm"
                                    style={{ color: 'var(--success)', borderColor: 'var(--success-border)', padding: '4px 8px', gap: '4px' }}
                                  >
                                    <Check size={12} />
                                    <span>Activate</span>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add New Version Form */}
              <h4 style={{ fontSize: '14px', marginBottom: '12px' }}>Publish New Version</h4>
              <form onSubmit={(e) => {
                e.preventDefault();
                addVersionMutation.mutate({ key: selectedTemplate.key, content: newVersionContent });
              }}>
                <div 
                  className="flex-row" 
                  style={{ 
                    backgroundColor: 'var(--info-bg)', 
                    padding: '10px 14px', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--info-border)',
                    marginBottom: '16px',
                    gap: '10px',
                    fontSize: '12px'
                  }}
                >
                  <Info size={16} className="text-info" style={{ flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Support variables injection like <code>{"{{userProfile}}"}</code>, <code>{"{{macros}}"}</code>, <code>{"{{healthScore}}"}</code>.
                  </span>
                </div>

                <div className="form-group">
                  <textarea
                    className="form-textarea"
                    placeholder="Enter prompt content template..."
                    value={newVersionContent}
                    onChange={(e) => setNewVersionContent(e.target.value)}
                    style={{ height: '220px', fontFamily: 'var(--font-sans)', fontSize: '13px' }}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
                  <Play size={14} />
                  <span>Publish Version</span>
                </button>
              </form>

            </div>
          ) : (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <MessageSquareCode size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
              <div>Please select an AI prompt template from the registry panel.</div>
            </div>
          )}
        </div>

      </div>

      {/* Modal: Create Key */}
      {isCreateKeyOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Define New Prompt Key</h3>
              <button onClick={() => setIsCreateKeyOpen(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); createKeyMutation.mutate({ key: newKey, description: newDescription }); }}>
              <div className="form-group">
                <label className="form-label">Key ID Name (Uppercase / Unique)</label>
                <input
                  type="text"
                  className="form-input"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g. COACH_MEAL_PLANNER_SYSTEM"
                  style={{ fontFamily: 'var(--mono)' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Core Purpose</label>
                <textarea
                  className="form-textarea"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g. System guidelines for calculating calorie compensations during travel"
                  style={{ height: '80px' }}
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsCreateKeyOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Preview Variable Mapping */}
      {isPreviewOpen && previewContent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Context Variables Preview</h3>
              <button onClick={() => setIsPreviewOpen(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', overflowY: 'auto', maxHeight: '450px' }}>
              <div>
                <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--primary)' }}>Raw Template Content</h4>
                <div className="code-preview" style={{ maxHeight: '380px' }}>
                  {previewContent.raw}
                </div>
              </div>
              <div>
                <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--success)' }}>Simulated Variable Context Payload</h4>
                <div className="code-preview" style={{ maxHeight: '380px' }}>
                  {JSON.stringify(previewContent.parsed, null, 2)}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setIsPreviewOpen(false)} className="btn btn-secondary">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default PromptManagement;
