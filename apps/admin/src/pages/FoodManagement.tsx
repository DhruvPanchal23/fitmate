import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminClient } from '../api/admin-client';
import { Search, Plus, Download, Upload, GitMerge, Trash, Edit, Check, X, AlertTriangle } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

export const FoodManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<any>(null);
  
  // Modals visibility toggles
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Form states
  const [foodForm, setFoodForm] = useState({
    name: '',
    brandName: '',
    servingSize: 100,
    servingUnit: 'g',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const [mergeForm, setMergeForm] = useState({
    sourceId: '',
    targetId: '',
  });

  const [importJson, setImportJson] = useState('');
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const queryClient = useQueryClient();

  const { data: foods = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['adminFoods', searchQuery],
    queryFn: () => adminClient.getFoods(searchQuery),
  });

  // Mutations
  const createFoodMutation = useMutation({
    mutationFn: (data: any) => adminClient.createFood(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFoods'] });
      setSuccessMsg('Catalog item created successfully.');
      setIsEditModalOpen(false);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to create food entry'),
  });

  const updateFoodMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminClient.updateFood(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFoods'] });
      setSuccessMsg('Catalog item updated successfully.');
      setIsEditModalOpen(false);
      setSelectedFood(null);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to update food entry'),
  });

  const deleteFoodMutation = useMutation({
    mutationFn: (id: string) => adminClient.deleteFood(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFoods'] });
      setSuccessMsg('Catalog item deleted successfully.');
      setIsDeleteModalOpen(false);
      setSelectedFood(null);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to delete food entry'),
  });

  const approveFoodMutation = useMutation({
    mutationFn: (id: string) => adminClient.approveFood(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFoods'] });
      setSuccessMsg('User-submitted food approved and added to system catalog.');
    },
  });

  const rejectFoodMutation = useMutation({
    mutationFn: (id: string) => adminClient.rejectFood(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFoods'] });
      setSuccessMsg('User-submitted food rejected and deleted.');
    },
  });

  const mergeFoodsMutation = useMutation({
    mutationFn: (data: typeof mergeForm) => adminClient.mergeFoods(data.sourceId, data.targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminFoods'] });
      setSuccessMsg('Duplicate items successfully merged.');
      setIsMergeModalOpen(false);
      setMergeForm({ sourceId: '', targetId: '' });
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Merge failed. Please check IDs.'),
  });

  const importMutation = useMutation({
    mutationFn: (data: any[]) => adminClient.bulkImportFoods(data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['adminFoods'] });
      setSuccessMsg(`Imported ${res.count || 'batch'} foods successfully.`);
      setIsImportModalOpen(false);
      setImportJson('');
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Bulk import failed. Validate JSON format.'),
  });

  // Handlers
  const handleEditClick = (food?: any) => {
    setErrorMsg('');
    if (food) {
      setSelectedFood(food);
      setFoodForm({
        name: food.name,
        brandName: food.brandName || '',
        servingSize: food.servingSize || 100,
        servingUnit: food.servingUnit || 'g',
        calories: food.calories || 0,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fat: food.fat || 0,
      });
    } else {
      setSelectedFood(null);
      setFoodForm({
        name: '',
        brandName: '',
        servingSize: 100,
        servingUnit: 'g',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
    }
    setIsEditModalOpen(true);
  };

  const handleSaveFood = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (selectedFood) {
      updateFoodMutation.mutate({ id: selectedFood.id, data: foodForm });
    } else {
      createFoodMutation.mutate(foodForm);
    }
  };

  const handleExport = async () => {
    try {
      const data = await adminClient.bulkExportFoods();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `fitmate_foods_export_${Date.now()}.json`;
      link.click();
      setSuccessMsg('Foods export downloaded successfully.');
    } catch (err) {
      setErrorMsg('Failed to export catalog data.');
    }
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const parsed = JSON.parse(importJson);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON root must be an array of foods');
      }
      importMutation.mutate(parsed);
    } catch (err: any) {
      setErrorMsg(`JSON Parse Error: ${err.message}`);
    }
  };

  return (
    <div>
      {/* Top FilterBar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search catalog by food name or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-row" style={{ gap: '10px' }}>
          <button onClick={() => handleEditClick()} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
            <Plus size={14} />
            <span>Create Item</span>
          </button>
          
          <button onClick={() => setIsMergeModalOpen(true)} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <GitMerge size={14} />
            <span>Merge Duplicates</span>
          </button>

          <button onClick={() => setIsImportModalOpen(true)} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <Upload size={14} />
            <span>Import JSON</span>
          </button>

          <button onClick={handleExport} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
            <Download size={14} />
            <span>Export Catalog</span>
          </button>
        </div>
      </div>

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

      {/* Main Table listing */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Food Item</th>
                <th>Brand / Source</th>
                <th>Serving Info</th>
                <th>Nutrients (Cals/P/C/F)</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Querying food index...</span>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--danger)' }}>
                    Failed to query catalog database. Check your API permissions.
                  </td>
                </tr>
              ) : foods.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No foods catalog items found.
                  </td>
                </tr>
              ) : (
                foods.map((food: any) => {
                  const isSystem = food.source === 'system' || !food.source;
                  const isApproved = food.isApproved;
                  
                  return (
                    <tr key={food.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600 }}>{food.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {food.id}</div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '13px' }}>{food.brandName || 'Generic'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Type: <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{food.source || 'system'}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {food.servingSize} {food.servingUnit}
                      </td>
                      <td style={{ fontSize: '13px' }}>
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{Math.round(food.calories)}</span> kcal • 
                          P: <span style={{ color: 'var(--success)', fontWeight: 500 }}>{food.protein}g</span> • 
                          C: <span style={{ color: 'var(--info)', fontWeight: 500 }}>{food.carbs}g</span> • 
                          F: <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{food.fat}g</span>
                        </div>
                      </td>
                      <td>
                        {isApproved ? (
                          <span className="badge badge-success">Approved</span>
                        ) : (
                          <span className="badge badge-warning">Pending Review</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex-row" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                          {/* Approve/Reject triggers for user foods */}
                          {!isSystem && !isApproved && (
                            <>
                              <button
                                onClick={() => approveFoodMutation.mutate(food.id)}
                                className="btn btn-secondary btn-sm"
                                style={{ color: 'var(--success)', borderColor: 'var(--success-border)', padding: '5px' }}
                                title="Approve Food into Public Catalog"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => rejectFoodMutation.mutate(food.id)}
                                className="btn btn-secondary btn-sm"
                                style={{ color: 'var(--danger)', borderColor: 'var(--danger-border)', padding: '5px' }}
                                title="Reject & Delete Submission"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleEditClick(food)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px' }}
                            title="Edit Values"
                          >
                            <Edit size={14} />
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedFood(food);
                              setIsDeleteModalOpen(true);
                            }}
                            className="btn btn-secondary btn-sm text-danger"
                            style={{ padding: '5px' }}
                            title="Delete Item"
                          >
                            <Trash size={14} />
                          </button>
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

      {/* Edit/Create Form Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{selectedFood ? 'Modify Catalog Item' : 'New Catalog Item'}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveFood}>
              <div className="form-group">
                <label className="form-label">Food Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={foodForm.name}
                  onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                  placeholder="e.g. Greek Yogurt 2%"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Brand Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={foodForm.brandName}
                    onChange={(e) => setFoodForm({ ...foodForm, brandName: e.target.value })}
                    placeholder="e.g. Chobani (Leave generic blank)"
                  />
                </div>
                <div className="form-group">
                  <div className="form-row">
                    <div>
                      <label className="form-label">Serving Size</label>
                      <input
                        type="number"
                        className="form-input"
                        value={foodForm.servingSize}
                        onChange={(e) => setFoodForm({ ...foodForm, servingSize: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Serving Unit</label>
                      <input
                        type="text"
                        className="form-input"
                        value={foodForm.servingUnit}
                        onChange={(e) => setFoodForm({ ...foodForm, servingUnit: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="form-group">
                  <label className="form-label">Calories</label>
                  <input
                    type="number"
                    className="form-input"
                    value={foodForm.calories}
                    onChange={(e) => setFoodForm({ ...foodForm, calories: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={foodForm.protein}
                    onChange={(e) => setFoodForm({ ...foodForm, protein: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={foodForm.carbs}
                    onChange={(e) => setFoodForm({ ...foodForm, carbs: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={foodForm.fat}
                    onChange={(e) => setFoodForm({ ...foodForm, fat: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Merge duplicates Form Modal */}
      {isMergeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Merge Duplicate Foods</h3>
              <button onClick={() => setIsMergeModalOpen(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); mergeFoodsMutation.mutate(mergeForm); }}>
              <div 
                className="flex-row" 
                style={{ 
                  backgroundColor: 'var(--warning-bg)', 
                  padding: '12px', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--warning-border)',
                  marginBottom: '20px',
                  gap: '10px'
                }}
              >
                <AlertTriangle size={18} className="text-warning" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  This operation deletes the source duplicate food and maps any existing logged meal links to the target public food.
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Source Duplicate Food ID (To Delete)</label>
                <input
                  type="text"
                  className="form-input"
                  value={mergeForm.sourceId}
                  onChange={(e) => setMergeForm({ ...mergeForm, sourceId: e.target.value })}
                  placeholder="e.g. cjwl818z..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Main Food ID (To Keep)</label>
                <input
                  type="text"
                  className="form-input"
                  value={mergeForm.targetId}
                  onChange={(e) => setMergeForm({ ...mergeForm, targetId: e.target.value })}
                  placeholder="e.g. cjwl929a..."
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsMergeModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
                  <GitMerge size={14} />
                  <span>Execute Merge</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Form Modal */}
      {isImportModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Bulk Import Foods Catalog</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleImportSubmit}>
              <div className="form-group">
                <label className="form-label">JSON Food Array Array</label>
                <textarea
                  className="form-textarea"
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  placeholder={`[
  {
    "name": "Organic Almond Milk",
    "brandName": "Silk",
    "servingSize": 240,
    "servingUnit": "ml",
    "calories": 30,
    "protein": 1.0,
    "carbs": 1.0,
    "fat": 2.5
  }
]`}
                  style={{ height: '280px', fontFamily: 'var(--mono)', fontSize: '12px' }}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsImportModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ gap: '6px' }}>
                  <Upload size={14} />
                  <span>Upload Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setSelectedFood(null);
          setIsDeleteModalOpen(false);
        }}
        onConfirm={() => selectedFood && deleteFoodMutation.mutate(selectedFood.id)}
        title="Delete Food Item"
        message={`Are you sure you want to permanently delete "${selectedFood?.name}"? Any users referencing this item will see it removed.`}
        isDanger={true}
      />
    </div>
  );
};
export default FoodManagement;
