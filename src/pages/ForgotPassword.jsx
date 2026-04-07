import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Phone, ArrowLeft, Loader2, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

const ForgotPassword = () => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [debugCode, setDebugCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { phone });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to request reset. Please check the phone number.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-bgDarkAll">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primaryClr rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-md relative z-10 animate-scaleIn">
        <div className="glass-card !p-10 border-t border-white/10 shadow-2xl">
          <Link to="/login" className="inline-flex items-center gap-2 text-secondaryClr hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-8">
            <ArrowLeft size={16} /> Back to Login
          </Link>

          {!success ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-display font-black text-primaryClr mb-2 tracking-tighter uppercase">Reset Access</h2>
                <p className="text-secondaryClr text-sm">Enter your registered phone number to receive a secure reset code via SMS.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondaryClr uppercase tracking-widest pl-1">Phone Number</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondaryClr group-focus-within:text-primaryClr transition-colors">
                      <Phone size={18} />
                    </div>
                    <input
                      type="text"
                      required
                      className="input-field pl-12"
                      placeholder="09..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-2xl bg-dangerClr/10 border border-dangerClr/20 text-dangerClr flex items-center gap-3 text-sm font-bold">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Request Reset Code'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center animate-fadeIn">
              <div className="w-20 h-20 bg-accentClr/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accentClr/30">
                <CheckCircle size={40} className="text-accentClr" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Code Dispatched</h2>
              <p className="text-secondaryClr text-sm mb-8 leading-relaxed">
                A secure reset code has been sent to your registered phone (SMS) and primary school email.
                <br/>
                <span className="text-primaryClr font-bold">(In this demo: Check your server terminal logs for the 'Email' box)</span>
              </p>

              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 mb-8 border-dashed shadow-inner">
                <p className="text-[10px] font-black text-secondaryClr uppercase tracking-widest mb-2">Checking Inbox...</p>
                <div className="flex justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primaryClr animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 rounded-full bg-primaryClr animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 rounded-full bg-primaryClr animate-bounce"></div>
                </div>
              </div>

              <button
                onClick={() => navigate('/reset-password', { state: { phone } })}
                className="btn-primary w-full py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
              >
                Continue to Reset
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
