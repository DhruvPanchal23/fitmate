import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminClient } from '../api/admin-client';
import type { AdminUserManagementResponse } from '../../../../shared/contracts/admin';
import { Search, ShieldAlert, ShieldCheck, RefreshCw, Eye } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

export const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserManagementResponse | null>(null);
  const [modalAction, setModalAction] = useState<'suspend' | 'ban' | 'restore' | 'reset' | 'impersonate' | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery<AdminUserManagementResponse[]>({
    queryKey: ['adminUsers', searchQuery],
    queryFn: () => adminClient.getUsers(searchQuery),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => adminClient.suspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setSuccessMsg(`User account suspended successfully.`);
    },
  });

  const banMutation = useMutation({
    mutationFn: (id: string) => adminClient.banUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setSuccessMsg(`User account banned successfully.`);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => adminClient.restoreUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setSuccessMsg(`User status restored to active.`);
    },
  });

  const resetProfileMutation = useMutation({
    mutationFn: (id: string) => adminClient.resetUserProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setSuccessMsg(`User profile wizard was reset. They can re-configure on next login.`);
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: (id: string) => adminClient.impersonateUser(id),
    onSuccess: (data: any) => {
      setSuccessMsg(`Simulation link generated: Impersonating ${selectedUser?.fullName}. Dev token saved.`);
      console.log('Impersonation payload:', data);
    },
  });

  const handleActionClick = (user: AdminUserManagementResponse, action: 'suspend' | 'ban' | 'restore' | 'reset' | 'impersonate') => {
    setSelectedUser(user);
    setModalAction(action);
  };

  const executeModalAction = () => {
    if (!selectedUser || !modalAction) return;

    if (modalAction === 'suspend') {
      suspendMutation.mutate(selectedUser.id);
    } else if (modalAction === 'ban') {
      banMutation.mutate(selectedUser.id);
    } else if (modalAction === 'restore') {
      restoreMutation.mutate(selectedUser.id);
    } else if (modalAction === 'reset') {
      resetProfileMutation.mutate(selectedUser.id);
    } else if (modalAction === 'impersonate') {
      impersonateMutation.mutate(selectedUser.id);
    }

    setModalAction(null);
  };

  const getModalDetails = () => {
    if (!selectedUser || !modalAction) return { title: '', message: '', isDanger: false };
    
    switch (modalAction) {
      case 'suspend':
        return {
          title: 'Suspend Account',
          message: `Are you sure you want to temporarily suspend ${selectedUser.fullName}'s access? The user will be blocked from logging into the mobile application.`,
          isDanger: true,
        };
      case 'ban':
        return {
          title: 'Permanent Ban',
          message: `Are you sure you want to permanently ban ${selectedUser.fullName}? This will block all access to FitMate.`,
          isDanger: true,
        };
      case 'restore':
        return {
          title: 'Restore Status',
          message: `Are you sure you want to restore ${selectedUser.fullName}'s account status? This will lift any suspensions or bans.`,
          isDanger: false,
        };
      case 'reset':
        return {
          title: 'Reset Profile Wizard',
          message: `Are you sure you want to reset ${selectedUser.fullName}'s profile parameters? This will require them to re-run the Mifflin-St Jeor calculators and target goals wizard.`,
          isDanger: false,
        };
      case 'impersonate':
        return {
          title: 'Trigger Impersonation Simulator',
          message: `Are you sure you want to impersonate ${selectedUser.fullName}? This creates a temporary dev session token to verify their calculators & active travel recovery buffers.`,
          isDanger: false,
        };
      default:
        return { title: '', message: '', isDanger: false };
    }
  };

  const modalDetails = getModalDetails();

  return (
    <div>
      {/* Filters & Actions */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by username, full name, or email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {successMsg && (
        <div 
          style={{ 
            backgroundColor: 'var(--success-bg)', 
            color: 'var(--success)', 
            border: '1px solid var(--success-border)', 
            padding: '12px 18px', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '20px',
            fontSize: '13px',
            display: 'flex',
            justifyContent: 'between'
          }}
        >
          <span>{successMsg}</span>
          <button 
            onClick={() => setSuccessMsg('')} 
            style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer', fontWeight: 'bold', marginLeft: 'auto' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User Account</th>
                <th>Registered Date</th>
                <th>Account Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Loading user list...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--danger)' }}>
                    Failed to query user database. Ensure you have 'users:read' permissions.
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No users found matching query filter.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const initials = user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
                  const isSuspended = user.isSuspended;
                  const isBanned = user.isBanned;
                  
                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="flex-row" style={{ gap: '12px' }}>
                          <div className="user-avatar">{initials}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{user.fullName || 'Unnamed User'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        {isBanned ? (
                          <span className="badge badge-danger">Banned</span>
                        ) : isSuspended ? (
                          <span className="badge badge-warning">Suspended</span>
                        ) : (
                          <span className="badge badge-success">Active</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex-row" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                          {/* Impersonate */}
                          <button
                            onClick={() => handleActionClick(user, 'impersonate')}
                            className="btn btn-secondary btn-sm"
                            title="Impersonate User Session"
                          >
                            <Eye size={14} />
                            <span>Impersonate</span>
                          </button>

                          {/* Reset Wizard */}
                          <button
                            onClick={() => handleActionClick(user, 'reset')}
                            className="btn btn-secondary btn-sm"
                            title="Reset Onboarding Wizard"
                          >
                            <RefreshCw size={14} />
                            <span>Reset Wizard</span>
                          </button>

                          {/* Suspend / Ban Toggles */}
                          {isBanned || isSuspended ? (
                            <button
                              onClick={() => handleActionClick(user, 'restore')}
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--success)', borderColor: 'var(--success-border)' }}
                            >
                              <ShieldCheck size={14} />
                              <span>Restore</span>
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleActionClick(user, 'suspend')}
                                className="btn btn-secondary btn-sm"
                                style={{ color: 'var(--warning)', borderColor: 'var(--warning-border)' }}
                              >
                                <ShieldAlert size={14} />
                                <span>Suspend</span>
                              </button>
                              <button
                                onClick={() => handleActionClick(user, 'ban')}
                                className="btn btn-danger btn-sm"
                              >
                                <ShieldAlert size={14} />
                                <span>Ban</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal overlay */}
      <ConfirmationModal
        isOpen={modalAction !== null}
        onClose={() => {
          setSelectedUser(null);
          setModalAction(null);
        }}
        onConfirm={executeModalAction}
        title={modalDetails.title}
        message={modalDetails.message}
        isDanger={modalDetails.isDanger}
      />
    </div>
  );
};
export default UserManagement;
