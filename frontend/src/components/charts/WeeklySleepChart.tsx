import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { SleepRecord } from '../../types/sleep';

interface WeeklySleepChartProps {
  records: SleepRecord[];
  onSelectDay?: (record: any) => void;
}

const WeeklySleepTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="glass-panel-glow rounded-xl p-3 border border-purple-500/40 text-xs shadow-xl">
        <div className="font-bold text-white text-sm mb-1">
          {item.dayOfWeek} ({item.date})
        </div>
        <div className="flex items-center justify-between gap-4 py-0.5">
          <span className="text-slate-400">Duration:</span>
          <span className="font-semibold text-purple-300">{item.durationHours} hrs</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-0.5">
          <span className="text-slate-400">Sleep Score:</span>
          <span className="font-bold text-emerald-400">{item.score} / 100</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-0.5">
          <span className="text-slate-400">Bed - Wake:</span>
          <span className="text-slate-200">
            {item.bedtime} → {item.wakeTime}
          </span>
        </div>
        <div className="mt-2 pt-1.5 border-t border-white/10 flex gap-2 text-[10px]">
          <span className="text-indigo-400">Deep {Math.round((item.deepMinutes / 60) * 10) / 10}h</span>
          <span className="text-purple-400">REM {Math.round((item.remMinutes / 60) * 10) / 10}h</span>
          <span className="text-sky-400">Light {Math.round((item.lightMinutes / 60) * 10) / 10}h</span>
        </div>
      </div>
    );
  }
  return null;
};

export const WeeklySleepChart: React.FC<WeeklySleepChartProps> = ({ records, onSelectDay }) => {
  // Sort from oldest to newest for weekly display (up to last 7 days)
  const data = [...records]
    .slice(0, 7)
    .reverse()
    .map((r) => ({
      ...r,
      durationHours: Number((r.durationMinutes / 60).toFixed(1)),
      targetHours: 8.0,
    }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="sleepBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
            </linearGradient>
            <linearGradient id="sleepBarOptimal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="dayOfWeek"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[4, 10]}
            ticks={[4, 6, 8, 10]}
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            unit="h"
          />
          <Tooltip content={<WeeklySleepTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />
          <ReferenceLine
            y={8}
            stroke="#a855f7"
            strokeDasharray="4 4"
            strokeOpacity={0.6}
            label={{
              value: '8h Goal',
              fill: '#c084fc',
              fontSize: 10,
              position: 'right',
            }}
          />
          <Bar
            dataKey="durationHours"
            radius={[8, 8, 2, 2]}
            onClick={(entry: any) => onSelectDay && onSelectDay(entry)}
            cursor="pointer"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.durationHours >= 8.0 ? 'url(#sleepBarOptimal)' : 'url(#sleepBarGradient)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
