import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sparkles, Lock, Mail, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register, loginDemo } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [chronotype, setChronotype] = useState<'lion' | 'bear' | 'wolf' | 'dolphin'>('bear');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to the privacy policy & terms');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, chronotype);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
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
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 my-8">
        {/* Brand header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-xl shadow-purple-900/50">
              <div className="w-full h-full bg-[#090a16] rounded-[14px] flex items-center justify-center">
                <Moon className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-white mt-4">Begin Your Sleep Awakening</h2>
          <p className="text-xs text-slate-400 mt-1">
            Personalized acoustic sleep science & circadian recovery
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl">
          {/* Quick Demo Button */}
          <div className="mb-5 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Want to test immediately?</span>
              </div>
              <div className="text-[11px] text-purple-200/70">
                Skip registration and open with full demo data
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemo}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-900/40 transition-all cursor-pointer"
            >
              One-Click Demo
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Naveen Kumar"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none text-white text-xs placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naveen@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none text-white text-xs placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none text-white text-xs placeholder:text-slate-500"
                  required
                />
              </div>
            </div>

            {/* Chronotype Picker */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Estimated Chronotype
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'lion', label: '🦁 Lion', desc: 'Early riser (5 AM)' },
                  { id: 'bear', label: '🐻 Bear', desc: 'Solar schedule (7 AM)' },
                  { id: 'wolf', label: '🐺 Wolf', desc: 'Night owl (9 AM)' },
                  { id: 'dolphin', label: '🐬 Dolphin', desc: 'Light sleeper' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setChronotype(item.id as any)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      chronotype === item.id
                        ? 'bg-purple-600/30 border-purple-500 text-white shadow-md shadow-purple-950/40'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="accent-purple-500 mt-0.5"
                />
                <span>
                  I agree to the Sleep Cycle wellness terms and accept acoustic sleep sensor
                  calibration.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Setting up circadian profile...</span>
              ) : (
                <>
                  <span>Create Celestial Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-300 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
