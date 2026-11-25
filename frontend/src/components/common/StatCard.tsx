import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: {
    text: string;
    variant: 'positive' | 'negative' | 'neutral' | 'accent';
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-purple-400',
  badge,
  onClick,
}) => {
  const badgeColors = {
    positive: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    negative: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    neutral: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    accent: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  };

  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-950/30 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white">
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-slate-400">
              {title}
            </h4>
            <div className="text-2xl font-bold text-white tracking-tight mt-0.5">
              {value}
            </div>
          </div>
        </div>

        {badge && (
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${badgeColors[badge.variant]}`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="mt-3 pt-3 border-t border-white/5 text-xs text-slate-400 flex items-center justify-between">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
