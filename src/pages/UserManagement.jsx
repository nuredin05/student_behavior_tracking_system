import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  UserPlus, 
  Search, 
  Filter, 
  Shield, 
  UserCheck, 
  UserX, 
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Loader2,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'teacher'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await api.post('/auth/register', newUser);
      setStatus({ type: 'success', message: 'User registered successfully!' });
      setNewUser({ first_name: '', last_name: '', email: '', phone: '', password: '', role: 'teacher' });
      setTimeout(() => {
        setIsModalOpen(false);
        setStatus({ type: '', message: '' });
      }, 1500);
      fetchUsers();
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/auth/users/${userId}`, { is_active: !currentStatus });
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const filteredUsers = users.filter(u => 
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone.includes(searchTerm) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && users.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center -mt-20">
        <Loader2 size={48} className="animate-spin text-primaryClr" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-primaryClr mb-2">User Management</h1>
          <p className="text-secondaryClr">Manage staff accounts, roles, and administrative permissions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
        >
          <UserPlus size={20} />
          Register New Staff
        </button>
      </div>

      {/* Search & Filter */}
      <div className="glass-card flex flex-col lg:flex-row items-center gap-4 !p-4">
        <div className="relative flex-1 w-full text-secondaryClr">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
          <input 
            type="text"
            placeholder="Search by name, phone, or role..."
            className="input-field pl-12 py-3 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 bg-bgDark rounded-xl border border-white/5 px-4 py-2 text-sm text-secondaryClr">
          <Filter size={18} />
          <span>Showing {filteredUsers.length} Users</span>
        </div>
      </div>

      {/* Staff Table */}
      <div className="glass-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bgDark border-b border-white/5">
                <th className="px-6 py-4 text-xs font-bold text-secondaryClr uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-secondaryClr uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-secondaryClr uppercase tracking-widest">Phone / Email</th>
                <th className="px-6 py-4 text-xs font-bold text-secondaryClr uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-secondaryClr uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primaryClrLight/20 flex items-center justify-center text-primaryClr font-bold">
                        {u.first_name[0]}{u.last_name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-primaryClrText">{u.first_name} {u.last_name}</p>
                        <p className="text-[10px] text-secondaryClr uppercase tracking-tighter">Joined {new Date(u.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2 text-sm text-secondaryClr capitalize">
                      <Shield size={14} className="text-primaryClr" />
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-mono text-secondaryClr">{u.phone}</p>
                    <p className="text-[10px] text-secondaryClr opacity-60 underline">{u.email || 'No email provided'}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.is_active ? 'bg-accentClr/10 text-accentClr' : 'bg-dangerClr/10 text-dangerClr'}`}>
                      {u.is_active ? <UserCheck size={12} /> : <UserX size={12} />}
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => toggleUserStatus(u.id, u.is_active)}
                        className={`p-2 rounded-lg transition-all ${u.is_active ? 'hover:bg-dangerClr/10 text-secondaryClr hover:text-dangerClr' : 'hover:bg-accentClr/10 text-secondaryClr hover:text-accentClr'}`}
                        title={u.is_active ? 'Deactivate Account' : 'Activate Account'}
                      >
                        {u.is_active ? <UserX size={18} /> : <UserCheck size={18} />}
                      </button>
                      <button className="p-2 rounded-lg hover:bg-white/5 text-secondaryClr transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-bgDarkAll/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="glass-card !p-0 w-full max-w-xl relative z-60 animate-scaleIn">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold">Register New Staff</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/5 text-secondaryClr transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleRegister} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondaryClr">First Name</label>
                  <input 
                    type="text" 
                    required 
                    className="input-field" 
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondaryClr">Last Name</label>
                  <input 
                    type="text" 
                    required 
                    className="input-field" 
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondaryClr">Phone Number</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="0911..."
                    className="input-field" 
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondaryClr">Email (Optional)</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondaryClr">Assign Role</label>
                  <select 
                    className="input-field"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="teacher">Teacher</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="officer">Officer</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondaryClr">Password</label>
                  <input 
                    type="password" 
                    required 
                    className="input-field" 
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
              </div>

              {status.message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                  status.type === 'success' ? 'bg-accentClr/10 text-accentClr border border-accentClr/20' : 'bg-dangerClr/10 text-dangerClr border border-dangerClr/20'
                }`}>
                  {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                  <span>{status.message}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="btn-primary w-full py-4 flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : 'Complete Registration'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
