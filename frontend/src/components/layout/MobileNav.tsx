import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Moon,
  LineChart,
  AlarmClock,
  Headphones,
  Sparkles,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const items = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/tracking', label: 'Track', icon: Moon },
    { to: '/analytics', label: 'Analytics', icon: LineChart },
    { to: '/alarm', label: 'Alarm', icon: AlarmClock },
    { to: '/sounds', label: 'Sounds', icon: Headphones },
    { to: '/coach', label: 'Coach', icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden glass-panel border-t border-white/10 backdrop-blur-2xl px-2 py-1.5 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
                isActive ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
