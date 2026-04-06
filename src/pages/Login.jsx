import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Phone, Lock, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(phone, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgDarkAll flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primaryClr/20 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primaryClrDark/30 rounded-full blur-[100px] -ml-32 -mb-32"></div>

      <div className="w-full max-w-md animate-fadeInUp">
        <div className="glass-card">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primaryClr/20 text-primaryClr mb-6">
              <LogIn size={32} />
            </div>
            <h1 className="text-3xl font-display font-bold text-primaryClrText mb-2">School Tracker</h1>
            <p className="text-secondaryClr text-sm">Please enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-primaryClrText mb-2 flex items-center gap-2">
                <Phone size={16} /> Phone Number
              </label>
              <input
                type="text"
                placeholder="0912345678"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primaryClrText mb-2 flex items-center gap-2">
                <Lock size={16} /> Password
              </label>
              <input
                type="password"
                placeholder="********"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-dangerClr/10 border border-dangerClr/20 text-dangerClr p-4 rounded-xl flex items-center gap-3 text-sm animate-pulse">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 size={24} className="animate-spin text-white" />
              ) : (
                <>
                  <LogIn size={20} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-secondaryClr text-xs">
              System Admin contact / technical support: support@sbts.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;