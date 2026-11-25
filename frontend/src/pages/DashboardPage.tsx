import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon,
  Clock,
  Flame,
  AlarmClock,
  Sparkles,
  Headphones,
  Activity,
  Heart,
  Plus,
  Play,
  Volume2,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSleepData } from '../context/SleepDataContext';
import { useAlarm } from '../context/AlarmContext';
import { useSoundPlayer } from '../context/SoundPlayerContext';
import { SleepScoreBadge } from '../components/common/SleepScoreBadge';
import { StatCard } from '../components/common/StatCard';
import { WeeklySleepChart } from '../components/charts/WeeklySleepChart';
import { SleepStagesChart } from '../components/charts/SleepStagesChart';
import { Modal } from '../components/common/Modal';
import { SOUND_LIBRARY } from '../utils/mockData';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { records, todayRecord, insights, addRecord } = useSleepData();
  const { nextAlarm, toggleAlarm } = useAlarm();
  const { playTrack, stopTrack, activeTracks } = useSoundPlayer();
  const navigate = useNavigate();

  // Manual Log Sleep Modal state
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logBedtime, setLogBedtime] = useState('23:00');
  const [logWakeTime, setLogWakeTime] = useState('07:15');
  const [logScore, setLogScore] = useState(88);
  const [logNotes, setLogNotes] = useState('');

  const [currentDate] = useState(() => new Date());
  const greeting = React.useMemo(() => {
    const h = currentDate.getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }, [currentDate]);

  const formattedDate = React.useMemo(() => {
    return currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, [currentDate]);

  const formatHoursMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const handleManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    const [bH, bM] = logBedtime.split(':').map(Number);
    const [wH, wM] = logWakeTime.split(':').map(Number);
    let totalMins = (wH * 60 + wM) - (bH * 60 + bM);
    if (totalMins <= 0) totalMins += 24 * 60;

    const deepMin = Math.round(totalMins * 0.22);
    const remMin = Math.round(totalMins * 0.24);
    const awakeMin = Math.round(totalMins * 0.05);
    const lightMin = totalMins - deepMin - remMin - awakeMin;

    addRecord({
      date: new Date().toISOString().slice(0, 10),
      dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()],
      bedtime: logBedtime,
      wakeTime: logWakeTime,
      durationMinutes: totalMins,
      score: logScore,
      efficiency: 92,
      deepMinutes: deepMin,
      remMinutes: remMin,
      lightMinutes: lightMin,
      awakeMinutes: awakeMin,
      avgHeartRate: 55,
      hrv: 70,
      respiratoryRate: 14.2,
      snoreMinutes: 5,
      sleepDebtMinutes: 480 - totalMins,
      notes: logNotes || 'Manually logged night of sleep',
      tags: ['Manual Log', 'Restorative'],
    });

    setLogModalOpen(false);
    setLogNotes('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Circadian Rhythm Synced</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            {greeting}, {user?.name || 'Explorer'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {formattedDate} • Readiness score indicates high autonomic recovery.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setLogModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-purple-400" />
            <span>Log Sleep</span>
          </button>

          <button
            onClick={() => navigate('/tracking')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition-all cursor-pointer"
          >
            <Moon className="w-4 h-4 fill-white" />
            <span>Start Tracking Tonight</span>
          </button>
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sleep Score Card */}
        <div className="glass-panel-glow rounded-2xl p-5 border border-purple-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Today's Sleep Score
            </span>
            <div className="text-3xl font-black text-white mt-1">
              {todayRecord.score}
              <span className="text-sm font-normal text-slate-400">/100</span>
            </div>
            <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+4 pts higher than 30d avg</span>
            </div>
          </div>
          <SleepScoreBadge score={todayRecord.score} size="md" showLabel={false} />
        </div>

        {/* Duration Card */}
        <StatCard
          title="Sleep Duration"
          value={formatHoursMinutes(todayRecord.durationMinutes)}
          subtitle="Target 8h 00m (Met goal)"
          icon={Clock}
          iconColor="text-sky-400"
          badge={{
            text: todayRecord.durationMinutes >= 480 ? 'Optimal' : '-20m Deficit',
            variant: todayRecord.durationMinutes >= 480 ? 'positive' : 'neutral',
          }}
          onClick={() => navigate('/analytics')}
        />

        {/* Bedtime & Wake Card */}
        <StatCard
          title="Bedtime & Wake Up"
          value={`${todayRecord.bedtime} - ${todayRecord.wakeTime}`}
          subtitle="Sleep latency: 14 mins"
          icon={Moon}
          iconColor="text-indigo-400"
          badge={{ text: 'Synced', variant: 'accent' }}
          onClick={() => navigate('/analytics')}
        />

        {/* Sleep Consistency Card */}
        <StatCard
          title="Sleep Consistency"
          value="94%"
          subtitle="Regularity index based on 14d"
          icon={Flame}
          iconColor="text-amber-400"
          badge={{ text: `${user?.streakDays || 14}d Streak`, variant: 'positive' }}
          onClick={() => navigate('/analytics')}
        />
      </div>

      {/* Second Row: Weekly Chart & Stages Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Sleep Chart (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span>Weekly Sleep Bank (Last 7 Days)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Click any bar to inspect specific night telemetry
              </p>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs font-semibold text-purple-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Detailed Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <WeeklySleepChart records={records} />

          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-purple-500" /> Sleep Duration
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Optimal (8h+)
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 border-t-2 border-dashed border-purple-400" /> Target Line
            </span>
          </div>
        </div>

        {/* Today's Sleep Stages Breakdown (1 col) */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Moon className="w-4 h-4 text-purple-400" />
                <span>Sleep Cycles & Stages</span>
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 font-medium">
                {todayRecord.efficiency}% Efficiency
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Restorative balance across Deep, REM, and Light cycles.
            </p>

            <SleepStagesChart record={todayRecord} />
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Resting HR: {todayRecord.avgHeartRate} bpm</span>
            </span>
            <span className="font-mono text-purple-300">HRV: {todayRecord.hrv} ms</span>
          </div>
        </div>
      </div>

      {/* Third Row: Smart Alarm & Sleep Sounds & AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Smart Alarm Card */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <AlarmClock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Smart Alarm</h3>
                <span className="text-[11px] text-slate-400">Gentle light-phase wake</span>
              </div>
            </div>

            {nextAlarm && (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={nextAlarm.enabled}
                  onChange={() => toggleAlarm(nextAlarm.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            )}
          </div>

          {nextAlarm ? (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              <div className="text-2xl font-black text-white font-mono">
                {nextAlarm.time} <span className="text-sm font-normal text-purple-300">{nextAlarm.period}</span>
              </div>
              <div className="text-xs text-slate-300 flex items-center justify-between">
                <span>{nextAlarm.label}</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                  ±{nextAlarm.smartWindowMinutes}m window
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/5 text-xs text-slate-400">
              No active alarms configured.
            </div>
          )}

          <button
            onClick={() => navigate('/alarm')}
            className="w-full py-2.5 rounded-xl glass-button text-xs font-semibold text-purple-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Manage All Alarms</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Sleep Sounds Quick Shortcuts */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Soundscapes</h3>
                <span className="text-[11px] text-slate-400">Browser synthesizer</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/sounds')}
              className="text-xs text-purple-300 hover:text-white font-semibold cursor-pointer"
            >
              Open Mixer →
            </button>
          </div>

          <div className="space-y-2">
            {SOUND_LIBRARY.slice(0, 3).map((track) => {
              const isActive = activeTracks.some((t) => t.track.id === track.id);
              return (
                <div
                  key={track.id}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-purple-600/20 border-purple-500/40 text-white'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: track.color }}
                    />
                    <span className="text-xs font-semibold truncate">{track.title}</span>
                  </div>

                  <button
                    onClick={() => (isActive ? stopTrack(track.id) : playTrack(track.id))}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-purple-500 text-white shadow-sm shadow-purple-900'
                        : 'bg-white/10 hover:bg-white/20 text-slate-300'
                    }`}
                  >
                    {isActive ? (
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Generative Web Audio without broken links</span>
          </div>
        </div>

        {/* AI Sleep Insights */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Somna AI Insights</h3>
                <span className="text-[11px] text-slate-400">Circadian intelligence</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/coach')}
              className="text-xs text-pink-300 hover:text-white font-semibold cursor-pointer"
            >
              Ask Coach →
            </button>
          </div>

          {insights.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-white/5 border border-purple-500/20 space-y-2">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{insights[0].title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {insights[0].description}
              </p>
              {insights[0].actionableStep && (
                <div className="text-[11px] text-purple-300 pt-1 border-t border-white/5 font-medium">
                  Tip: {insights[0].actionableStep}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => navigate('/coach')}
            className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-xs font-semibold text-purple-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Run Circadian Diagnosis</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Manual Sleep Log Modal */}
      <Modal
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        title="Log Completed Sleep Session"
      >
        <form onSubmit={handleManualLog} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Bedtime</label>
              <input
                type="time"
                value={logBedtime}
                onChange={(e) => setLogBedtime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Wake-up Time</label>
              <input
                type="time"
                value={logWakeTime}
                onChange={(e) => setLogWakeTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-slate-300 font-medium mb-1">
              <span>Restorative Sleep Score:</span>
              <span className="font-bold text-purple-300">{logScore} / 100</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={logScore}
              onChange={(e) => setLogScore(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Night Notes</label>
            <textarea
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              placeholder="e.g. Chamomile tea, 15m reading, slept deeply"
              className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none h-20 placeholder:text-slate-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setLogModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-900/40 cursor-pointer"
            >
              Save to Dashboard
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
