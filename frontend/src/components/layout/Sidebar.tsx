import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Moon,
  LineChart,
  AlarmClock,
  Headphones,
  Sparkles,
  Settings,
  Flame,
  BatteryCharging,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSleepData } from '../../context/SleepDataContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { todayRecord, resetDemoData } = useSleepData();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/tracking',
      label: 'Sleep Tracking',
      icon: Moon,
      badge: 'Live',
    },
    {
      to: '/analytics',
      label: 'Sleep Analytics',
      icon: LineChart,
      badge: null,
    },
    {
      to: '/alarm',
      label: 'Smart Alarm',
      icon: AlarmClock,
      badge: null,
    },
    {
      to: '/sounds',
      label: 'Sleep Sounds',
      icon: Headphones,
      badge: 'Synth',
    },
    {
      to: '/coach',
      label: 'AI Sleep Coach',
      icon: Sparkles,
      badge: 'AI',
    },
    {
      to: '/profile',
      label: 'Profile & Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 glass-panel border-r border-white/10 flex flex-col justify-between p-4 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Wellness Suite
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-white border border-purple-500/40 shadow-lg shadow-purple-950/40'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Quick Metrics Glance */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Flame className="w-3.5 h-3.5" />
                <span>Sleep Streak</span>
              </span>
              <span className="font-bold text-white">{user?.streakDays || 14} Days</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-purple-300 font-semibold">
                <BatteryCharging className="w-3.5 h-3.5 text-purple-400" />
                <span>Sleep Debt</span>
              </span>
              <span className="font-bold text-emerald-400">
                {todayRecord.sleepDebtMinutes <= 0 ? 'Surplus +12m' : `${todayRecord.sleepDebtMinutes}m Debt`}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => {
              if (window.confirm('Reset all sleep records and alarms to default demo dataset?')) {
                resetDemoData();
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all cursor-pointer border border-white/5"
            title="Reset data back to pristine demo state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Demo Data</span>
          </button>

          <div className="text-[10px] text-center text-slate-400 pt-1">
            Sleep Cycle Pro v2.4 • Web Edition
          </div>
        </div>
      </aside>
    </>
  );
};
