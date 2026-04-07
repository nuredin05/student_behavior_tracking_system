import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Phone, Lock, AlertCircle, Loader2, ChevronRight, Mail, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-bgDarkAll">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primaryClr/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-accentClr/10 rounded-full blur-[100px] animate-bounce"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-scaleIn">
        {/* Branding Section */}
        <div className="text-center mb-10 group">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-primaryClr blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
            <div className="w-24 h-24 bg-white rounded-3xl mb-6 mx-auto flex items-center justify-center shadow-2xl relative z-10 border border-white/50 transform group-hover:rotate-3 transition-transform">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-display font-black text-primaryClr mb-2 tracking-tighter uppercase">
            Amana Model
          </h1>
          <p className="text-secondaryClr text-sm font-bold uppercase tracking-[0.3em] opacity-80">
            Secondary School
          </p>
        </div>

        {/* Login Form */}
        <div className="glass-card !p-10 border-t border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-primaryClr mb-2">Welcome Back</h2>
            <p className="text-secondaryClr text-sm">Security Gateway / Behavior Tracking</p>
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

            <div className="space-y-2">
              <label className="text-[10px] font-black text-secondaryClr uppercase tracking-widest pl-1">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondaryClr group-focus-within:text-primaryClr transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="input-field pl-12 pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondaryClr hover:text-primaryClr transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-dangerClr/10 border border-dangerClr/20 text-dangerClr flex items-center gap-3 text-sm font-bold animate-shake">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-4 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 group shadow-[0_10px_20px_rgba(108,93,211,0.3)] transition-all"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Enter Dashboard
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="text-center">
                <Link to="/forgot-password" className="text-xs font-bold text-primaryClr hover:underline opacity-80 hover:opacity-100 transition-opacity">
                  Forgotten your password?
                </Link>
              </div>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-secondaryClr text-[10px] font-medium leading-relaxed">
              Amana Model School.
              Unauthorized access is strictly prohibited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
