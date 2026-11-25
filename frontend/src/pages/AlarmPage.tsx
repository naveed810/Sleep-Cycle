import React, { useState } from 'react';
import {
  AlarmClock,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  Play,
  Vibrate,
} from 'lucide-react';
import { useAlarm } from '../context/AlarmContext';
import { Modal } from '../components/common/Modal';

export const AlarmPage: React.FC = () => {
  const {
    alarms,
    currentTime,
    toggleAlarm,
    addAlarm,
    deleteAlarm,
    previewAlarmSound,
  } = useAlarm();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('Gentle Rise');
  const [newTime, setNewTime] = useState('07:00');
  const [newPeriod, setNewPeriod] = useState<'AM' | 'PM'>('AM');
  const [newSmartWindow, setNewSmartWindow] = useState(20);
  const [newSound, setNewSound] = useState('forest_dawn');
  const [newVibration, setNewVibration] = useState(true);
  const [selectedDays, setSelectedDays] = useState<('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[]>([
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
  ]);

  const soundOptions = [
    { id: 'forest_dawn', name: 'Forest Dawn Chime' },
    { id: 'harp', name: 'Celestial Gentle Harp' },
    { id: 'cosmic', name: 'Cosmic Resonance' },
  ];

  const daysOfWeek: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[] = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ];

  const toggleDay = (d: typeof daysOfWeek[0]) => {
    setSelectedDays((prev) =>
      prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d]
    );
  };

  const handleCreateAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    addAlarm({
      label: newLabel,
      time: newTime,
      period: newPeriod,
      days: selectedDays,
      enabled: true,
      smartWindowMinutes: newSmartWindow,
      soundTrack: newSound,
      vibration: newVibration,
      snoozeCount: 0,
    });
    setAddModalOpen(false);
    setNewLabel('Gentle Rise');
  };

  const formattedDigital = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
            <AlarmClock className="w-4 h-4 text-purple-400" />
            <span>Light-Phase Bio-Alarm</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Smart Alarm System</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Wakes you naturally during your lightest sleep phase within your customized window.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Smart Alarm</span>
        </button>
      </div>

      {/* Hero Live Digital Clock Card */}
      <div className="glass-panel-glow rounded-3xl p-8 border border-purple-500/30 text-center relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-purple-300">
            <Clock className="w-3.5 h-3.5" />
            <span>Circadian Clock Synchronized</span>
          </div>

          <div className="text-5xl sm:text-7xl font-black text-white font-mono tracking-tight pt-2">
            {formattedDigital}
          </div>

          <p className="text-xs text-slate-400 pt-1">
            Smart wake monitoring active for upcoming scheduled alarms.
          </p>
        </div>
      </div>

      {/* Smart Wake-Up Science Explanation Banner */}
      <div className="glass-panel rounded-2xl p-4 border border-indigo-500/30 flex items-start gap-3.5 bg-indigo-950/20">
        <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 shrink-0 mt-0.5">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white block mb-0.5">How Smart Wake Works:</strong>
          Traditional alarms jar you out of deep slow-wave delta sleep, causing severe grogginess
          (sleep inertia) that lasts hours. Sleep Cycle monitors acoustic sleep cycles and sounds
          the gentle chime precisely when you transition into light sleep during your selected
          window.
        </div>
      </div>

      {/* Alarms List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Configured Alarms</h3>

        <div className="space-y-3">
          {alarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`glass-panel rounded-2xl p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                alarm.enabled
                  ? 'border-purple-500/40 bg-purple-950/10'
                  : 'border-white/5 opacity-60'
              }`}
            >
              {/* Left Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-white font-mono">
                    {alarm.time}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    {alarm.period}
                  </span>
                  <span className="text-sm font-semibold text-slate-200">
                    {alarm.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="text-purple-300 font-medium">
                    ±{alarm.smartWindowMinutes}m Smart Window
                  </span>
                  <span>•</span>
                  <span>Sound: {alarm.soundTrack.replace('_', ' ')}</span>
                  <span>•</span>
                  <div className="flex gap-1">
                    {daysOfWeek.map((d) => (
                      <span
                        key={d}
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          alarm.days.includes(d)
                            ? 'text-white bg-purple-600/40 font-bold'
                            : 'text-slate-600'
                        }`}
                      >
                        {d[0]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => previewAlarmSound(alarm.soundTrack)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/5"
                  title="Test Alarm Audio Chime"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>

                {/* Toggle switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alarm.enabled}
                    onChange={() => toggleAlarm(alarm.id)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>

                {/* Delete */}
                <button
                  onClick={() => deleteAlarm(alarm.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Delete alarm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Alarm Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Configure New Smart Alarm"
      >
        <form onSubmit={handleCreateAlarm} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Alarm Label</label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Time</label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="07:00"
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">AM / PM</label>
              <div className="grid grid-cols-2 gap-2">
                {(['AM', 'PM'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewPeriod(p)}
                    className={`py-2 rounded-xl font-bold cursor-pointer transition-colors ${
                      newPeriod === p
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              Smart Wake-up Window
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[10, 20, 30].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setNewSmartWindow(w)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    newSmartWindow === w
                      ? 'bg-purple-600/30 border-purple-500 text-white font-bold'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/15'
                  }`}
                >
                  <div className="font-bold text-sm">±{w}m</div>
                  <div className="text-[10px] text-slate-400">Gentle window</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Wake Melody Chime</label>
            <div className="space-y-2">
              {soundOptions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setNewSound(s.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    newSound === s.id
                      ? 'bg-purple-600/20 border-purple-500 text-white'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <span className="font-semibold">{s.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      previewAlarmSound(s.id);
                    }}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300"
                    title="Play Preview"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Repeat Days</label>
            <div className="flex gap-1.5">
              {daysOfWeek.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDays.includes(d)
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white/5 text-slate-500 hover:bg-white/10'
                  }`}
                >
                  {d[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5 cursor-pointer text-slate-300">
              <Vibrate className="w-4 h-4 text-purple-400" />
              <input
                type="checkbox"
                checked={newVibration}
                onChange={(e) => setNewVibration(e.target.checked)}
                className="accent-purple-500"
              />
              <span className="font-semibold text-xs">Enable Gentle Haptic Vibration</span>
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-900/40 cursor-pointer"
            >
              Set Smart Alarm
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
