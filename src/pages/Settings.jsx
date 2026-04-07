import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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
  AlertCircle
} from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setStatus({ type: 'success', message: 'Profile updated successfully (Mock)' });
    setTimeout(() => setStatus({ type: '', message: '' }), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeInUp max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-primaryClr mb-2">Account Settings</h1>
        <p className="text-secondaryClr">Manage your profile, notifications, and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation / User Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-3xl bg-primaryClr/20 border-2 border-primaryClr/40 flex items-center justify-center mb-4 overflow-hidden shadow-2xl">
              {user?.profile_picture ? (
                <img src={user.profile_picture} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-primaryClr" />
              )}
            </div>
            <h3 className="text-xl font-bold">{user?.first_name} {user?.last_name}</h3>
            <p className="text-xs text-secondaryClr uppercase tracking-widest font-bold mt-1 px-4 py-1 bg-bgDark rounded-full border border-white/5">
              {user?.role}
            </p>
            
            <div className="w-full h-px bg-white/5 my-6"></div>
            
            <div className="w-full space-y-2">
              <button className="w-full text-left p-3 rounded-xl bg-primaryClr/10 border border-primaryClr/20 text-primaryClr font-bold flex items-center gap-3">
                <User size={18} /> Public Profile
              </button>
              <button className="w-full text-left p-3 rounded-xl hover:bg-white/5 text-secondaryClr flex items-center gap-3 transition-all">
                <Bell size={18} /> Notifications
              </button>
              <button className="w-full text-left p-3 rounded-xl hover:bg-white/5 text-secondaryClr flex items-center gap-3 transition-all">
                <Shield size={18} /> Security
              </button>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full p-4 rounded-xl bg-dangerClr/10 border border-dangerClr/20 text-dangerClr hover:bg-dangerClr transition-all hover:text-white flex items-center justify-center gap-3 font-bold shadow-xl"
          >
            <LogOut size={20} /> Sign Out Account
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
              <User className="text-primaryClr" /> Personal Details
            </h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondaryClr flex items-center gap-2">
                    First Name
                  </label>
                  <input type="text" className="input-field" defaultValue={user?.first_name} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondaryClr flex items-center gap-2">
                    Last Name
                  </label>
                  <input type="text" className="input-field" defaultValue={user?.last_name} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondaryClr flex items-center gap-2">
                    <Mail size={14} /> Email Address
                  </label>
                  <input type="email" className="input-field" defaultValue={user?.email || ''} placeholder="Add your email" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondaryClr flex items-center gap-2">
                    <Phone size={14} /> Phone Number
                  </label>
                  <input type="text" className="input-field" defaultValue={user?.phone || ''} readOnly />
                  <p className="text-[10px] text-secondaryClr italic opacity-50">* Phone number is used for authentication and cannot be changed.</p>
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

              <button type="submit" className="btn-primary w-full md:w-auto px-8 py-3">
                Save Changes 
              </button>
            </form>
          </div>

          {/* Preferences */}
          <div className="glass-card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              App Preferences
            </h3>
            <div className="divide-y divide-white/5">
              <div className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-bgDark border border-white/5 flex items-center justify-center text-primaryClr">
                    <Moon size={20} />
                  </div>
                  <div>
                    <p className="font-bold">Dark Mode</p>
                    <p className="text-xs text-secondaryClr">Always on for high-performance visual comfort.</p>
                  </div>
                </div>
                <div className="w-12 h-6 rounded-full bg-primaryClr p-1 flex justify-end">
                  <div className="w-4 h-4 rounded-full bg-white shadow-xl"></div>
                </div>
              </div>

              <div className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-bgDark border border-white/5 flex items-center justify-center text-secondaryClr">
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="font-bold">Email Notifications</p>
                    <p className="text-xs text-secondaryClr">Daily reports of child progress.</p>
                  </div>
                </div>
                <div className="w-12 h-6 rounded-full bg-white/10 p-1 flex justify-start">
                  <div className="w-4 h-4 rounded-full bg-bgDarkAll shadow-xl"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl border-2 border-dangerClr/10 bg-dangerClr/5 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-5 -mr-10 -mt-10">
              <Trash2 size={120} className="text-dangerClr" />
            </div>
            <div className="relative z-10">
              <h4 className="text-lg font-bold text-dangerClr mb-1">Delete Account</h4>
              <p className="text-sm text-secondaryClr">Permanently remove your account and all associated data.</p>
            </div>
            <button className="relative z-10 px-6 py-3 rounded-xl border border-dangerClr/30 text-dangerClr hover:bg-dangerClr hover:text-white transition-all font-bold">
              Confirm Deletion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
