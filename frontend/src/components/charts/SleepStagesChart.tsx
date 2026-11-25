import React from 'react';
import type { SleepRecord } from '../../types/sleep';

interface SleepStagesChartProps {
  record: SleepRecord;
}

export const SleepStagesChart: React.FC<SleepStagesChartProps> = ({ record }) => {
  const total = record.durationMinutes;
  const stages = [
    {
      name: 'Deep Sleep',
      minutes: record.deepMinutes,
      percent: Math.round((record.deepMinutes / total) * 100),
      benchmark: '15-25%',
      color: 'bg-indigo-500',
      textColor: 'text-indigo-400',
      description: 'Physical restoration, cell repair, growth hormone release',
    },
    {
      name: 'REM Sleep',
      minutes: record.remMinutes,
      percent: Math.round((record.remMinutes / total) * 100),
      benchmark: '20-25%',
      color: 'bg-purple-500',
      textColor: 'text-purple-400',
      description: 'Memory consolidation, emotional regulation, vivid dreams',
    },
    {
      name: 'Light Sleep',
      minutes: record.lightMinutes,
      percent: Math.round((record.lightMinutes / total) * 100),
      benchmark: '45-55%',
      color: 'bg-sky-500',
      textColor: 'text-sky-400',
      description: 'Mental transition, muscle relaxation, heart deceleration',
    },
    {
      name: 'Awake / Micro-Arousal',
      minutes: record.awakeMinutes,
      percent: Math.round((record.awakeMinutes / total) * 100),
      benchmark: '<10%',
      color: 'bg-amber-400',
      textColor: 'text-amber-400',
      description: 'Natural brief awakenings during sleep cycle shifts',
    },
  ];

  const formatHoursMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-4">
      {/* Visual Stacked Progress Bar */}
      <div className="h-4 w-full rounded-full overflow-hidden flex bg-white/5 p-0.5 border border-white/10">
        {stages.map((st) => (
          <div
            key={st.name}
            style={{ width: `${st.percent}%` }}
            className={`h-full ${st.color} transition-all duration-500 first:rounded-l-full last:rounded-r-full relative group cursor-pointer`}
            title={`${st.name}: ${formatHoursMinutes(st.minutes)} (${st.percent}%)`}
          />
        ))}
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {stages.map((st) => (
          <div
            key={st.name}
            className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${st.color}`} />
                <span className="font-semibold text-white text-sm">{st.name}</span>
              </div>
              <span className={`text-xs font-bold ${st.textColor}`}>
                {st.percent}%
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 mt-2">
              <span className="font-medium text-slate-100">{formatHoursMinutes(st.minutes)}</span>
              <span className="text-[11px] text-slate-400">Target: {st.benchmark}</span>
            </div>

            <p className="text-[11px] text-slate-400 mt-1 leading-tight line-clamp-1">
              {st.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
