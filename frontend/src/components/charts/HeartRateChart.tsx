import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface HeartRateChartProps {
  avgHeartRate: number;
}

const HeartRateTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="glass-panel-glow rounded-xl p-2.5 border border-rose-500/30 text-xs shadow-lg">
        <div className="font-semibold text-white">{item.time}</div>
        <div className="text-rose-300 font-bold text-sm">{item.bpm} BPM</div>
        <div className="text-slate-400 text-[10px]">{item.phase}</div>
      </div>
    );
  }
  return null;
};

export const HeartRateChart: React.FC<HeartRateChartProps> = ({ avgHeartRate }) => {
  // Generate realistic nighttime heart rate telemetry curve (hourly from 23:00 to 07:00)
  const data = [
    { time: '23:00', bpm: avgHeartRate + 8, phase: 'Wind Down' },
    { time: '00:00', bpm: avgHeartRate + 4, phase: 'Light Sleep' },
    { time: '01:00', bpm: avgHeartRate - 1, phase: 'Deep Sleep' },
    { time: '02:00', bpm: avgHeartRate - 3, phase: 'Deep Stage 3' },
    { time: '03:00', bpm: avgHeartRate - 6, phase: 'Nadir (Lowest)' },
    { time: '04:00', bpm: avgHeartRate - 4, phase: 'REM Transition' },
    { time: '05:00', bpm: avgHeartRate - 2, phase: 'REM Cycle' },
    { time: '06:00', bpm: avgHeartRate + 1, phase: 'Cortisol Rise' },
    { time: '07:00', bpm: avgHeartRate + 7, phase: 'Wake Up' },
  ];

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#881337" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[45, 75]}
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<HeartRateTooltip />} />
          <ReferenceLine
            y={avgHeartRate}
            stroke="#f43f5e"
            strokeDasharray="3 3"
            strokeOpacity={0.5}
            label={{
              value: `Avg ${avgHeartRate} bpm`,
              fill: '#fda4af',
              fontSize: 10,
              position: 'insideTopRight',
            }}
          />
          <Area
            type="monotone"
            dataKey="bpm"
            stroke="#f43f5e"
            strokeWidth={2.5}
            fill="url(#hrGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
