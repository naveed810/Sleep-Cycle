import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Moon,
  Sparkles,
  Volume2,
  Clock,
  LogOut,
  Settings,
  Menu,
  X,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAlarm } from '../../context/AlarmContext';
import { useSoundPlayer } from '../../context/SoundPlayerContext';
import { useSleepData } from '../../context/SleepDataContext';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { currentTime } = useAlarm();
  const { isPlaying, activeTracks } = useSoundPlayer();
  const { activeTracking } = useSleepData();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/10 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Logo */}
        <div className="flex items-center gap-3">
          {isAuthenticated && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-0.5 shadow-lg shadow-purple-900/40 group-hover:shadow-purple-700/60 transition-all duration-300">
              <div className="w-full h-full bg-[#090a16] rounded-[14px] flex items-center justify-center">
                <Moon className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-purple-300 transition-colors">
                  SLEEP CYCLE
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  PRO
                </span>
              </div>
              <span className="hidden sm:block text-[10px] text-slate-400 tracking-wide font-medium">
                Circadian Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Live Clock & Ambient Status */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-mono text-white font-medium">{formattedTime}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Optimal Wind-down: 10:45 PM</span>
          </div>

          {isPlaying && (
            <Link
              to="/sounds"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition-all"
            >
              <Volume2 className="w-3.5 h-3.5 animate-pulse text-purple-400" />
              <span>Playing {activeTracks.length} Soundscape</span>
            </Link>
          )}

          {activeTracking.isTracking && (
            <Link
              to="/tracking"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Tracking Active</span>
            </Link>
          )}
        </div>

        {/* Right: Quick actions & Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Quick Track Action Button */}
              {!activeTracking.isTracking ? (
                <button
                  onClick={() => navigate('/tracking')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 hover:shadow-purple-700/50 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Tracking</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/tracking')}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Active Session</span>
                </button>
              )}

              {/* Profile dropdown trigger */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition-all cursor-pointer"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                    alt={user?.name || 'User'}
                    className="w-8 h-8 rounded-xl object-cover border border-purple-400/40"
                  />
                  <span className="hidden md:block text-xs font-semibold text-white max-w-[90px] truncate">
                    {user?.name || 'Explorer'}
                  </span>
                </button>

                {profileOpen && (
                  <div
                    onClick={() => setProfileOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                )}

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-panel-glow rounded-2xl border border-purple-500/30 shadow-2xl p-2 z-50 text-xs text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-white/10">
                      <div className="font-bold text-white text-sm">{user?.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-purple-300 font-medium">
                        <ShieldCheck className="w-3 h-3 text-purple-400" />
                        <span>{user?.plan}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate('/profile');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-slate-200 hover:text-white transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4 text-purple-400" />
                        <span>Profile & Settings</span>
                      </button>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate('/coach');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2.5 text-slate-200 hover:text-white transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-pink-400" />
                        <span>AI Sleep Coach</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-white/10">
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
