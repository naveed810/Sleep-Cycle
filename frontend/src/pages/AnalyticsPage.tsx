import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import {
  LineChart as ChartIcon,
  Download,
  Moon,
  Heart,
  Activity,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useSleepData } from '../context/SleepDataContext';
import { HeartRateChart } from '../components/charts/HeartRateChart';
import { SleepStagesChart } from '../components/charts/SleepStagesChart';
import { api } from '../services/api';

const CustomTrendTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="glass-panel-glow rounded-xl p-3 border border-purple-500/40 text-xs shadow-xl">
        <div className="font-bold text-white mb-1">
          {d.date} • {d.fullDate}
        </div>
        <div className="flex items-center justify-between gap-4 py-0.5">
          <span className="text-slate-400">Sleep Score:</span>
          <span className="font-bold text-emerald-400">{d.score} / 100</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-0.5">
          <span className="text-slate-400">Duration:</span>
          <span className="text-purple-300 font-semibold">{d.duration} hrs</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-0.5">
          <span className="text-slate-400">HRV:</span>
          <span className="text-rose-300 font-semibold">{d.hrv} ms</span>
        </div>
      </div>
    );
  }
  return null;
};

export const AnalyticsPage: React.FC = () => {
  const { records, todayRecord } = useSleepData();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [backendSummary, setBackendSummary] = useState<any>(null);

  // Fetch backend analytics telemetry
  React.useEffect(() => {
    let isMounted = true;
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

    api.getAnalyticsSummary(days)
      .then((summary) => {
        if (isMounted) setBackendSummary(summary);
      })
      .catch((err) => {
        console.warn('Backend analytics summary notice:', err.message);
      });

    api.getWeeklyReport()
      .then((report) => {
        if (isMounted) setWeeklyReport(report);
      })
      .catch((err) => {
        console.warn('Backend weekly report notice:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [timeRange, records.length]);

  // Prepare trend data
  const trendData = records.slice(0, 14).reverse().map((r) => ({
    date: r.dayOfWeek,
    fullDate: r.date,
    score: r.score,
    duration: Number((r.durationMinutes / 60).toFixed(1)),
    hrv: r.hrv,
    deepMinutes: r.deepMinutes,
    remMinutes: r.remMinutes,
  }));

  const avgScore = backendSummary?.average_score ?? Math.round(
    trendData.reduce((acc, curr) => acc + curr.score, 0) / (trendData.length || 1)
  );

  const avgDurationHours = (
    backendSummary?.average_duration_hours !== undefined
      ? backendSummary.average_duration_hours.toFixed(1)
      : (trendData.reduce((acc, curr) => acc + curr.duration, 0) / (trendData.length || 1)).toFixed(1)
  );

  const avgHrv = backendSummary?.average_hrv ?? Math.round(
    trendData.reduce((acc, curr) => acc + curr.hrv, 0) / (trendData.length || 1)
  );

  const handleExport = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(records, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `sleep_cycle_telemetry_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Range & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
            <ChartIcon className="w-4 h-4 text-purple-400" />
            <span>Circadian Biometrics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Sleep Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Long-term sleep trends, cardiac recovery, and habit correlation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Aggregate Biometric Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-white/10">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Period Avg Score
          </span>
          <div className="text-2xl font-black text-white mt-1">{avgScore} / 100</div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top 8% in your age cohort</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Avg Duration
          </span>
          <div className="text-2xl font-black text-white mt-1">{avgDurationHours} hrs</div>
          <div className="mt-2 text-[11px] text-purple-300">Target: 8.0 hrs (+0.1h)</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Heart Rate Variability (HRV)
          </span>
          <div className="text-2xl font-black text-white mt-1">{avgHrv} ms</div>
          <div className="mt-2 text-[11px] text-rose-300">High parasympathetic tone</div>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-white/10">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
            Regularity Index
          </span>
          <div className="text-2xl font-black text-white mt-1">94%</div>
          <div className="mt-2 text-[11px] text-amber-400">±18 min bedtime variance</div>
        </div>
      </div>

      {/* Trend Line Chart */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Sleep Score Progression & Recovery Trend</span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated using duration, sleep efficiency, and slow-wave proportions.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-purple-300">
              <span className="w-3 h-0.5 bg-purple-400" /> Score (0 - 100)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <span className="w-3 h-0.5 bg-emerald-400 border-dashed" /> Target 85+
            </span>
          </div>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[60, 100]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTrendTooltip />} />
              <ReferenceLine
                y={85}
                stroke="#34d399"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
                label={{
                  value: 'Optimal 85+',
                  fill: '#34d399',
                  fontSize: 10,
                  position: 'right',
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#a855f7"
                strokeWidth={3}
                dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 7, fill: '#c084fc' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Section: Sleep Stages & Heart Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stages Breakdown */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Moon className="w-4 h-4 text-purple-400" />
                <span>Sleep Stages Composition</span>
              </h3>
              <p className="text-xs text-slate-400">Deep, REM, Light, and Awake breakdown</p>
            </div>
            <span className="text-xs text-purple-300 font-bold">
              {todayRecord.efficiency}% Efficiency
            </span>
          </div>

          <SleepStagesChart record={todayRecord} />
        </div>

        {/* Heart Rate & Nocturnal Dip */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Nocturnal Cardiac Deceleration</span>
              </h3>
              <p className="text-xs text-slate-400">Resting pulse curve across sleep phases</p>
            </div>
            <span className="text-xs text-rose-300 font-bold">
              Lowest 52 bpm at 03:00
            </span>
          </div>

          <HeartRateChart avgHeartRate={todayRecord.avgHeartRate} />
        </div>
      </div>

      {/* Sleep Habits Correlation Grid */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Habit Impact & Sleep Multipliers</span>
          </h3>
          <p className="text-xs text-slate-400">
            Statistical impact of your evening routines on restorative sleep score.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white/5 border border-emerald-500/20">
            <div className="text-emerald-400 font-bold text-lg">+18% REM</div>
            <div className="font-semibold text-white text-xs mt-1">No Screen 45m</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Eliminating blue wavelengths accelerated melatonin synthesis.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/20">
            <div className="text-purple-300 font-bold text-lg">-14m Latency</div>
            <div className="font-semibold text-white text-xs mt-1">8Hz Alpha Waves</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Binaural entrainment reduced time to fall asleep from 28m to 14m.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-sky-500/20">
            <div className="text-sky-300 font-bold text-lg">+22m Deep Sleep</div>
            <div className="font-semibold text-white text-xs mt-1">19°C Bedroom Temp</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Thermoregulatory drop facilitated sustained slow-wave delta cycles.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-amber-500/20">
            <div className="text-amber-300 font-bold text-lg">-8% Snoring</div>
            <div className="font-semibold text-white text-xs mt-1">Elevated Pillow</div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Reduced upper respiratory resistance and micro-arousal frequency.
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Clinical Intelligence Report from Backend */}
      {weeklyReport && (
        <div className="glass-panel-glow rounded-3xl p-6 border border-purple-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">
                Weekly Clinical Intelligence Report
              </h3>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold">
              Consistency: {weeklyReport.consistency_score}%
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {weeklyReport.clinical_recommendation}
          </p>
          <div className="text-[11px] text-slate-400 flex items-center gap-4 pt-1">
            <span>Period: {weeklyReport.week_start} to {weeklyReport.week_end}</span>
            <span>•</span>
            <span>Nights Evaluated: {weeklyReport.total_nights_logged}</span>
            <span>•</span>
            <span>Weekly Avg Score: {weeklyReport.average_score}/100</span>
          </div>
        </div>
      )}
    </div>
  );
};
