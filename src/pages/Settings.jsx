import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  LogOut, 
  Bell, 
  Moon, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'notifications', 'security'
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Profile Form State
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Preference State (Local Persistence)
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') !== 'light');
  const [emailNotifs, setEmailNotifs] = useState(localStorage.getItem('emailNotifs') === 'true');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const response = await api.patch('/auth/me', {
        first_name: firstName,
        last_name: lastName,
        email: email
      });
      updateUser(response.data.user);
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await api.patch('/auth/change-password', { currentPassword, newPassword });
      setStatus({ type: 'success', message: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setStatus({ type: 'error', message: error.response?.data?.error || 'Failed to change password' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure? This will deactivate your account and you will be logged out immediately.')) return;
    try {
      await api.delete('/auth/me');
      logout();
    } catch (error) {
      alert('Failed to deactivate account');
    }
  };

  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    localStorage.setItem('theme', newVal ? 'dark' : 'light');
  };

  const toggleNotifs = () => {
    const newVal = !emailNotifs;
    setEmailNotifs(newVal);
    localStorage.setItem('emailNotifs', newVal.toString());
  };

  return (
    <div className="space-y-8 animate-fadeInUp max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-black text-primaryClr mb-2 tracking-tighter uppercase">
            Account Center
          </h1>
          <p className="text-secondaryClr font-medium">Manage your personal presence and security at Amana Model.</p>
        </div>
        <div className="px-6 py-2 rounded-2xl bg-bgDark border border-white/5 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accentClr animate-pulse"></div>
          <span className="text-[10px] uppercase font-black tracking-widest text-secondaryClr">Global System Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-2 flex flex-col gap-1">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left p-4 rounded-2xl font-bold flex items-center justify-between transition-all group ${
                activeTab === 'profile' ? 'bg-primaryClr text-white shadow-xl translate-x-1' : 'text-secondaryClr hover:bg-white/5 hover:text-primaryClr'
              }`}
            >
              <div className="flex items-center gap-3">
                <User size={18} /> Profile
              </div>
              <ChevronRight size={14} className={activeTab === 'profile' ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'} />
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`w-full text-left p-4 rounded-2xl font-bold flex items-center justify-between transition-all group ${
                activeTab === 'notifications' ? 'bg-primaryClr text-white shadow-xl translate-x-1' : 'text-secondaryClr hover:bg-white/5 hover:text-primaryClr'
              }`}
            >
              <div className="flex items-center gap-3">
                <Bell size={18} /> Notifications
              </div>
              <ChevronRight size={14} className={activeTab === 'notifications' ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'} />
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full text-left p-4 rounded-2xl font-bold flex items-center justify-between transition-all group ${
                activeTab === 'security' ? 'bg-primaryClr text-white shadow-xl translate-x-1' : 'text-secondaryClr hover:bg-white/5 hover:text-primaryClr'
              }`}
            >
              <div className="flex items-center gap-3">
                <Shield size={18} /> Security
              </div>
              <ChevronRight size={14} className={activeTab === 'security' ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'} />
            </button>
          </div>

          <button 
            onClick={logout}
            className="w-full p-5 rounded-3xl bg-dangerClr/10 border border-dangerClr/20 text-dangerClr hover:bg-dangerClr transition-all hover:text-white flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest"
          >
            <LogOut size={18} /> Sign Out Account
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="animate-fadeIn space-y-8">
              <div className="glass-card">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                  <User className="text-primaryClr" /> Personal Details
                </h3>
                
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondaryClr uppercase tracking-widest pl-1">First Name</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondaryClr uppercase tracking-widest pl-1">Last Name</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondaryClr uppercase tracking-widest pl-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-secondaryClr" size={16} />
                        <input 
                          type="email" 
                          className="input-field pl-12" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-secondaryClr uppercase tracking-widest pl-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-secondaryClr" size={16} />
                        <input type="text" className="input-field pl-12 opacity-60" defaultValue={user?.phone || ''} readOnly />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="btn-primary px-10 py-4 flex items-center justify-center gap-2 group shadow-xl"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
                  </button>
                </form>
              </div>

              <div className="p-8 rounded-[2rem] border-2 border-dangerClr/10 bg-dangerClr/5 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-10 opacity-5 -mr-10 -mt-10">
                  <Trash2 size={120} className="text-dangerClr" />
                </div>
                <div className="relative z-10">
                  <h4 className="text-xl font-bold text-dangerClr mb-1">Deactivate Account</h4>
                  <p className="text-sm text-secondaryClr max-w-sm">This is a soft-delete—your account will be hidden from reports but data will remain for auditing.</p>
                </div>
                <button 
                  onClick={handleDeleteAccount}
                  className="relative z-10 px-8 py-4 rounded-2xl border border-dangerClr/30 text-dangerClr hover:bg-dangerClr hover:text-white transition-all font-black text-xs uppercase tracking-widest"
                >
                  Proceed to Delete
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-fadeIn glass-card">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <Bell className="text-primaryClr" /> Notification Settings
              </h3>
              <div className="divide-y divide-white/5">
                <div className="py-6 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg mb-1">Push Notifications</p>
                    <p className="text-sm text-secondaryClr">Get alerted on every approved incident involving your students.</p>
                  </div>
                  <button 
                    onClick={toggleDarkMode}
                    className={`w-14 h-7 rounded-full p-1 flex transition-all ${darkMode ? 'bg-primaryClr justify-end' : 'bg-white/10 justify-start'}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-xl"></div>
                  </button>
                </div>
                <div className="py-6 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg mb-1">Weekly Digest</p>
                    <p className="text-sm text-secondaryClr">Receive a summarized performance report every Friday.</p>
                  </div>
                  <button 
                    onClick={toggleNotifs}
                    className={`w-14 h-7 rounded-full p-1 flex transition-all ${emailNotifs ? 'bg-primaryClr justify-end' : 'bg-white/10 justify-start'}`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-xl"></div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="animate-fadeIn glass-card">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <Lock className="text-primaryClr" /> Security & Access
              </h3>
              
              <form onSubmit={handleChangePassword} className="space-y-8">
                <div className="max-w-md space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondaryClr uppercase tracking-widest pl-1">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondaryClr" size={16} />
                      <input 
                        type={showPass ? 'text' : 'password'} 
                        className="input-field pl-12"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-secondaryClr"
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondaryClr uppercase tracking-widest pl-1">New Password</label>
                    <input 
                      type="password" 
                      className="input-field"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-secondaryClr uppercase tracking-widest pl-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      className="input-field"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-primary px-10 py-4 flex items-center justify-center gap-2 shadow-xl"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {status.message && (
            <div className={`mt-6 p-5 rounded-2xl flex items-center gap-3 text-sm font-bold animate-shake ${
              status.type === 'success' ? 'bg-accentClr/10 text-accentClr border border-accentClr/20' : 'bg-dangerClr/10 text-dangerClr border border-dangerClr/20'
            }`}>
              {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{status.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;


