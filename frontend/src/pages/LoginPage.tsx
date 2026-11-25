import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sparkles, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('naveen@sleepcycle.premium');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide your email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Unable to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await loginDemo();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a16] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background stars and aurora */}
      <div className="absolute inset-0 stars-bg opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-xl shadow-purple-900/50">
              <div className="w-full h-full bg-[#090a16] rounded-[14px] flex items-center justify-center">
                <Moon className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-white mt-4">Welcome Back</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your circadian data and restorative sleep engine
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl">
          {/* Quick Demo Button */}
          <div className="mb-6 p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Instant Pro Demo</span>
                </div>
                <div className="text-[11px] text-purple-200/70">
                  One-click entry with pre-populated sleep telemetry
                </div>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/40 transition-all cursor-pointer"
              >
                Launch Demo
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-white/10" />
            <span className="flex-shrink mx-4 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Or sign in with email
            </span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none text-white text-xs placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset instructions have been simulated to your email.');
                  }}
                  className="text-[11px] text-purple-300 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none text-white text-xs placeholder:text-slate-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-300 font-semibold hover:underline">
              Create an account
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted bio-telemetry • HIPAA & GDPR compliant</span>
        </div>
      </div>
    </div>
  );
};
