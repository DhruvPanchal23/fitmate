import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminClient } from '../api/admin-client';
import type { SystemAnnouncementResponse } from '../../../../shared/contracts/admin';
import { Plus, Megaphone, Calendar, Send, User, X } from 'lucide-react';

export const Announcements: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form states
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    body: '',
    targetGroup: 'all',
    scheduledFor: '',
    expiresAt: '',
  });

  const queryClient = useQueryClient();

  const { data: announcements = [], isLoading, error } = useQuery<SystemAnnouncementResponse[]>({
    queryKey: ['adminAnnouncements'],
    queryFn: adminClient.getAnnouncements,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminClient.createAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAnnouncements'] });
      setSuccessMsg('Announcement successfully created and scheduled.');
      setIsModalOpen(false);
      setAnnouncementForm({
        title: '',
        body: '',
        targetGroup: 'all',
        scheduledFor: '',
        expiresAt: '',
      });
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to create announcement'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Map dates to ISO strings if provided, else null
    const payload = {
      title: announcementForm.title,
      body: announcementForm.body,
      targetGroup: announcementForm.targetGroup,
      scheduledFor: announcementForm.scheduledFor ? new Date(announcementForm.scheduledFor).toISOString() : null,
      expiresAt: announcementForm.expiresAt ? new Date(announcementForm.expiresAt).toISOString() : null,
    };

    createMutation.mutate(payload);
  };

  return (
    <div>
      <div className="filter-bar" style={{ justifyContent: 'flex-end' }}>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
          <Plus size={14} />
          <span>New System Announcement</span>
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

      {/* List layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {isLoading ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading announcements...</div>
        ) : error ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--danger)' }}>Failed to query system announcements. Check permissions.</div>
        ) : announcements.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
            <Megaphone size={40} style={{ opacity: 0.5, marginBottom: '12px' }} />
            <div>No announcements found. Push a new update above.</div>
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className="flex-row justify-between mb-20">
                <h3 style={{ fontSize: '16px' }}>{ann.title}</h3>
                
                <div className="flex-row" style={{ gap: '8px' }}>
                  <span className="badge badge-info flex-row" style={{ fontSize: '11px', gap: '4px' }}>
                    <User size={12} />
                    <span>Audience: {ann.targetGroup.toUpperCase()}</span>
                  </span>
                  {ann.sent ? (
                    <span className="badge badge-success flex-row" style={{ fontSize: '11px', gap: '4px' }}>
                      <Send size={12} />
                      <span>Sent</span>
                    </span>
                  ) : (
                    <span className="badge badge-warning flex-row" style={{ fontSize: '11px', gap: '4px' }}>
                      <Calendar size={12} />
                      <span>Scheduled</span>
                    </span>
                  )}
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '14px' }}>
                {ann.body}
              </p>

              <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>Created: {new Date(ann.createdAt).toLocaleString()}</span>
                {ann.scheduledFor && (
                  <span>Scheduled For: {new Date(ann.scheduledFor).toLocaleString()}</span>
                )}
                {ann.expiresAt && (
                  <span>Expires: {new Date(ann.expiresAt).toLocaleString()}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Draft form */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Draft Announcement</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Announcement Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  placeholder="e.g. Server Maintenance Scheduled"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Body Message</label>
                <textarea
                  className="form-textarea"
                  value={announcementForm.body}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, body: e.target.value })}
                  placeholder="Enter details explaining the update to users..."
                  style={{ height: '100px' }}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Target Audience Group</label>
                  <select
                    className="form-select"
                    value={announcementForm.targetGroup}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, targetGroup: e.target.value })}
                  >
                    <option value="all">All Users</option>
                    <option value="premium">Premium Cohorts Only</option>
                    <option value="beta">Beta Access Group</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Scheduled For (Optional)</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={announcementForm.scheduledFor}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, scheduledFor: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={announcementForm.expiresAt}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, expiresAt: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
                  <Send size={14} />
                  <span>Publish Update</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
export default Announcements;
