import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Award, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Package, 
  Edit, 
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // inventory or redemptions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', point_cost: '', stock: -1, is_active: true });
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rewardRes, redemptionRes] = await Promise.all([
        api.get('/rewards'),
        api.get('/rewards/redemptions')
      ]);
      setRewards(rewardRes.data);
      setRedemptions(redemptionRes.data);
    } catch (error) {
      console.error('Error fetching rewards data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    try {
      if (isEditMode) {
        await api.put(`/rewards/${editingId}`, formData);
        setStatus({ type: 'success', message: 'Reward updated successfully!' });
      } else {
        await api.post('/rewards', formData);
        setStatus({ type: 'success', message: 'Reward created successfully!' });
      }
      setTimeout(() => {
        setIsModalOpen(false);
        fetchData();
      }, 1000);
    } catch (error) {
      setStatus({ type: 'error', message: `Failed to ${isEditMode ? 'update' : 'create'} reward` });
    }
  };

  const handleEdit = (reward) => {
    setFormData({
      name: reward.name,
      description: reward.description || '',
      point_cost: reward.point_cost,
      stock: reward.stock,
      is_active: reward.is_active
    });
    setEditingId(reward.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reward?')) return;
    try {
      // Note: Backend might need a delete route. If missing, we'll set is_active=false.
      await api.put(`/rewards/${id}`, { is_active: false });
      setStatus({ type: 'success', message: 'Reward deactivated successfully!' });
      fetchData();
    } catch (error) {
      console.error('Error deleting reward:', error);
    }
  };

  const handleProcessRedemption = async (id, statusType) => {
    try {
      await api.patch(`/rewards/redemptions/${id}`, { status: statusType });
      fetchData();
    } catch (error) {
      console.error('Error processing redemption:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center -mt-20">
        <Loader2 size={48} className="animate-spin text-primaryClr" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-primaryClr mb-2 uppercase tracking-wider">Rewards & Incentives</h1>
          <p className="text-secondaryClr">Manage physical and digital rewards for students.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ name: '', description: '', point_cost: '', stock: -1, is_active: true });
            setIsEditMode(false);
            setIsModalOpen(true);
          }}
          className="btn-primary px-6 py-3 flex items-center gap-2 self-start sm:self-auto shadow-xl"
        >
          <Plus size={20} />
          Create New Reward
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-bgDark/60 border border-white/5 rounded-2xl w-full sm:w-fit overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'bg-primaryClr text-white shadow-lg' : 'text-secondaryClr hover:text-white'}`}
        >
          <Package size={18} />
          Inventory ({rewards.length})
        </button>
        <button 
          onClick={() => setActiveTab('redemptions')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'redemptions' ? 'bg-primaryClr text-white shadow-lg' : 'text-secondaryClr hover:text-white'}`}
        >
          <Award size={18} />
          Redemptions ({redemptions.filter(r => r.status === 'pending').length})
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map(reward => (
            <div key={reward.id} className="glass-card p-6 flex flex-col group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Award size={80} />
              </div>
              
              <div className="mb-4">
                <h3 className="text-xl font-bold text-primaryClrText mb-1">{reward.name}</h3>
                <p className="text-sm text-secondaryClr line-clamp-2">{reward.description || 'No description provided.'}</p>
              </div>

              <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-secondaryClr uppercase tracking-widest font-bold">Cost</p>
                    <p className="text-2xl font-black text-accentClr">{reward.point_cost} pts</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-secondaryClr uppercase tracking-widest font-bold">Stock</p>
                    <p className={`text-lg font-bold ${reward.stock === 0 ? 'text-dangerClr' : 'text-white'}`}>
                      {reward.stock === -1 ? 'Unlimited' : reward.stock}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(reward)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(reward.id)}
                    className="p-2 bg-dangerClr/10 hover:bg-dangerClr/20 text-dangerClr rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {rewards.length === 0 && (
            <div className="col-span-full py-20 glass-card flex flex-col items-center opacity-30">
              <Package size={64} className="mb-4" />
              <p className="text-xl font-bold">No rewards defined yet</p>
              <p className="text-sm">Click the "Create New Reward" button to get started.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mobile Card View (Visible only on small screens) */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {redemptions.map(redemption => (
              <div key={redemption.id} className="glass-card p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primaryClr/10 flex items-center justify-center font-bold text-primaryClr border border-primaryClr/20">
                      {redemption.first_name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-primaryClrText">{redemption.first_name} {redemption.last_name}</p>
                      <p className="text-[10px] text-secondaryClr uppercase">{redemption.admission_number}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    redemption.status === 'pending' ? 'bg-warningClr/20 text-warningClr' :
                    redemption.status === 'approved' ? 'bg-accentClr/20 text-accentClr' :
                    redemption.status === 'collected' ? 'bg-primaryClr/20 text-primaryClr' :
                    'bg-dangerClr/20 text-dangerClr'
                  }`}>
                    {redemption.status}
                  </span>
                </div>
                
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-secondaryClr uppercase tracking-widest mb-1">Reward</p>
                    <p className="font-bold text-sm text-white">{redemption.reward_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-secondaryClr uppercase tracking-widest mb-1">Cost</p>
                    <p className="text-sm font-black text-accentClr">{redemption.point_cost} PTS</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                  <p className="text-[10px] text-secondaryClr italic">Requested: {new Date(redemption.redeemed_at).toLocaleDateString()}</p>
                  <div className="flex gap-2">
                    {redemption.status === 'pending' ? (
                      <>
                        <button onClick={() => handleProcessRedemption(redemption.id, 'approved')} className="p-2 bg-accentClr/10 text-accentClr rounded-lg"><CheckCircle size={16} /></button>
                        <button onClick={() => handleProcessRedemption(redemption.id, 'rejected')} className="p-2 bg-dangerClr/10 text-dangerClr rounded-lg"><XCircle size={16} /></button>
                      </>
                    ) : redemption.status === 'approved' && (
                      <button onClick={() => handleProcessRedemption(redemption.id, 'collected')} className="px-3 py-1.5 bg-primaryClr/10 text-primaryClr rounded-lg text-[10px] font-black uppercase">Collect</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (Hidden on small screens) */}
          <div className="glass-card overflow-hidden hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondaryClr text-shadow-sm">Student</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondaryClr text-shadow-sm">Reward</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondaryClr text-shadow-sm">Request Date</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondaryClr text-shadow-sm">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-secondaryClr text-shadow-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {redemptions.map(redemption => (
                    <tr key={redemption.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primaryClr/10 flex items-center justify-center font-bold text-primaryClr border border-primaryClr/20">
                            {redemption.first_name[0]}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-primaryClrText">{redemption.first_name} {redemption.last_name}</p>
                            <p className="text-[10px] text-secondaryClr uppercase">{redemption.admission_number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-sm text-white">{redemption.reward_name}</p>
                          <p className="text-[10px] text-accentClr font-black text-shadow-sm">{redemption.point_cost} PTS</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-secondaryClr">
                        {new Date(redemption.redeemed_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          redemption.status === 'pending' ? 'bg-warningClr/20 text-warningClr' :
                          redemption.status === 'approved' ? 'bg-accentClr/20 text-accentClr' :
                          redemption.status === 'collected' ? 'bg-primaryClr/20 text-primaryClr' :
                          'bg-dangerClr/20 text-dangerClr'
                        }`}>
                          {redemption.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {redemption.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleProcessRedemption(redemption.id, 'approved')}
                              className="p-2 bg-accentClr/10 hover:bg-accentClr/20 text-accentClr rounded-xl transition-all"
                              title="Approve"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              onClick={() => handleProcessRedemption(redemption.id, 'rejected')}
                              className="p-2 bg-dangerClr/10 hover:bg-dangerClr/20 text-dangerClr rounded-xl transition-all"
                              title="Reject"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        ) : redemption.status === 'approved' ? (
                          <button 
                            onClick={() => handleProcessRedemption(redemption.id, 'collected')}
                            className="px-4 py-2 bg-primaryClr/10 hover:bg-primaryClr/20 text-primaryClr rounded-xl text-[10px] font-black uppercase transition-all"
                          >
                            Mark as Collected
                          </button>
                        ) : (
                          <span className="text-[10px] text-secondaryClr opacity-30 font-black uppercase">Finalized</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {redemptions.length === 0 && (
            <div className="py-20 flex flex-col items-center opacity-30">
              <Clock size={48} className="mb-4" />
              <p className="text-xl font-bold">No redemption requests yet</p>
            </div>
          )}
        </div>
      )}

      {/* Create Reward Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card w-full max-w-lg p-8 space-y-6 relative border-t-4 border-primaryClr">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-secondaryClr hover:text-white"
            >
              <XCircle size={24} />
            </button>
            
            <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Reward' : 'New Reward'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {status.message && (
                <div className={`p-4 rounded-xl text-xs font-bold ${status.type === 'success' ? 'bg-accentClr/10 text-accentClr border border-accentClr/20' : 'bg-dangerClr/10 text-dangerClr border border-dangerClr/20'}`}>
                  {status.message}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs font-bold text-secondaryClr uppercase tracking-widest">Reward Name</label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-secondaryClr uppercase tracking-widest">Description</label>
                <textarea 
                  className="input-field min-h-[100px] py-3" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-secondaryClr uppercase tracking-widest">Point Cost</label>
                  <input 
                    type="number" 
                    required 
                    className="input-field" 
                    value={formData.point_cost}
                    onChange={e => setFormData({...formData, point_cost: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-secondaryClr uppercase tracking-widest">Stock (-1 for ∞)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
              </div>
              
              <button type="submit" className="btn-primary w-full py-4 mt-4 font-black uppercase tracking-widest shadow-xl">
                {isEditMode ? 'Update Reward Item' : 'Define Reward Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;
