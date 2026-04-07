import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api/axios';
import { Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle, Eye, EyeOff, ShieldCheck, KeyRound } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const phoneFromState = location.state?.phone || '';

  const [phone, setPhone] = useState(phoneFromState);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [showPass, setShowPass] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setIsLoading(true);
    try {
      await api.post('/auth/verify-token', { phone, code });
      setIsVerified(true);
      setStatus({ type: 'success', message: 'Identity verified. You can now set a new password.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Invalid or expired code.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }
    
    setStatus({ type: '', message: '' });
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { phone, code, newPassword });
      setStatus({ type: 'success', message: 'Password updated! Redirecting to login...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Final reset failed. Try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-bgDarkAll">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accentClr rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-scaleIn">
        <div className="glass-card !p-10 border-t border-white/10 shadow-2xl">
          <Link to="/forgot-password" text-xs className="inline-flex items-center gap-2 text-secondaryClr hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-8">
            <ArrowLeft size={16} /> Back
          </Link>

          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-white/50 p-2">
              <img src="/logo.png" alt="logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-display font-black text-primaryClr mb-2 tracking-tighter uppercase">
              {isVerified ? 'Set New Password' : 'Verify Identity'}
            </h2>
            <p className="text-secondaryClr text-sm">
              {isVerified ? 'Finalize your account security.' : 'Enter the 6-digit code sent to your device.'}
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex-1 h-1 rounded-full ${isVerified ? 'bg-primaryClr' : 'bg-primaryClr/20'}`}></div>
            <div className={`flex-1 h-1 rounded-full ${isVerified ? 'bg-primaryClr' : 'bg-white/10'}`}></div>
          </div>

          {!isVerified ? (
            <form onSubmit={handleVerify} className="space-y-6 animate-fadeIn">
              {!phoneFromState && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondaryClr uppercase tracking-widest pl-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="09..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondaryClr uppercase tracking-widest pl-1">6-Digit Reset Code</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondaryClr group-focus-within:text-primaryClr transition-colors">
                    <ShieldCheck size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="input-field pl-12 text-center tracking-[1em] font-black text-2xl"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>
              </div>

              {status.message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                  status.type === 'success' ? 'bg-accentClr/10 text-accentClr border border-accentClr/20' : 'bg-dangerClr/10 text-dangerClr border border-dangerClr/20'
                }`}>
                  {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-6 animate-slideUp">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondaryClr uppercase tracking-widest pl-1">New Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondaryClr group-focus-within:text-primaryClr transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    className="input-field pl-12"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondaryClr"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondaryClr uppercase tracking-widest pl-1">Confirm New Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondaryClr group-focus-within:text-primaryClr transition-colors">
                    <KeyRound size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    className="input-field pl-12"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {status.message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                  status.type === 'success' ? 'bg-accentClr/10 text-accentClr border border-accentClr/20' : 'bg-dangerClr/10 text-dangerClr border border-dangerClr/20'
                }`}>
                  {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || status.type === 'success'}
                className="btn-primary w-full py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Finalize Reset'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
