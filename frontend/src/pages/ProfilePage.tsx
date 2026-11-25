import React, { useState } from 'react';
import {
  User,
  Flame,
  Clock,
  Sliders,
  RotateCcw,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSleepData } from '../context/SleepDataContext';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { records, resetDemoData } = useSleepData();

  const [name, setName] = useState(user?.name || 'Naveen Kumar');
  const [email, setEmail] = useState(user?.email || 'naveen@sleepcycle.premium');
  const [targetBedtime, setTargetBedtime] = useState(user?.targetBedtime || '23:00');
  const [targetWakeTime, setTargetWakeTime] = useState(user?.targetWakeTime || '07:00');
  const [targetSleepHours, setTargetSleepHours] = useState(
    ((user?.targetSleepMinutes || 480) / 60).toString()
  );
  const [roomTemp, setRoomTemp] = useState(user?.roomTempPreference || 19);
  const [snoreDetection, setSnoreDetection] = useState(user?.snoreDetection ?? true);
  const [hapticFeedback, setHapticFeedback] = useState(user?.hapticFeedback ?? true);
  const [windDownReminder, setWindDownReminder] = useState(
    user?.notificationPreferences?.windDownReminder ?? true
  );
  const [morningBriefing, setMorningBriefing] = useState(
    user?.notificationPreferences?.morningBriefing ?? true
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      targetBedtime,
      targetWakeTime,
      targetSleepMinutes: Math.round(parseFloat(targetSleepHours) * 60) || 480,
      roomTempPreference: roomTemp,
      snoreDetection,
      hapticFeedback,
      notificationPreferences: {
        windDownReminder,
        morningBriefing,
        circadianAlerts: true,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExport = () => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({ user, records }, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sleep_cycle_profile_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
          <User className="w-4 h-4 text-purple-400" />
          <span>Account Preferences & Biological Targets</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white mt-1">Profile & Settings</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Customize your sleep targets, sensory parameters, and biometric privacy.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profile preferences saved successfully!</span>
        </div>
      )}

      {/* Plan & Streak Banner */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
            alt={user?.name || 'User'}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-400/50 shadow-xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold uppercase">
                {user?.plan}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">{user?.email}</div>
            <div className="text-[11px] text-purple-300/80 mt-1">
              Member since {user?.memberSince || 'October 2024'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
          <div>
            <div className="text-xs uppercase font-bold text-amber-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Current Streak</span>
            </div>
            <div className="text-2xl font-black text-white mt-0.5">
              {user?.streakDays || 14} Nights
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Personal Details & Circadian Targets */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Circadian Sleep Targets</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Bedtime</label>
              <input
                type="time"
                value={targetBedtime}
                onChange={(e) => setTargetBedtime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Wake-up Time</label>
              <input
                type="time"
                value={targetWakeTime}
                onChange={(e) => setTargetWakeTime(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Target Sleep Duration (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="5"
                max="12"
                value={targetSleepHours}
                onChange={(e) => setTargetSleepHours(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Preferred Room Temp (°C)
              </label>
              <input
                type="number"
                min="15"
                max="24"
                value={roomTemp}
                onChange={(e) => setRoomTemp(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sensory & Sensor Settings */}
        <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Sensory & Acoustic Sensor Preferences</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
              <div>
                <div className="font-semibold text-white">Acoustic Snore & Respiration Tracker</div>
                <div className="text-slate-400 text-[11px]">
                  Monitors nocturnal breathing patterns to detect micro-arousals
                </div>
              </div>
              <input
                type="checkbox"
                checked={snoreDetection}
                onChange={(e) => setSnoreDetection(e.target.checked)}
                className="accent-purple-500 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
              <div>
                <div className="font-semibold text-white">Gentle Haptic Morning Cue</div>
                <div className="text-slate-400 text-[11px]">
                  Progressive subtle pulse preceding audio alarm
                </div>
              </div>
              <input
                type="checkbox"
                checked={hapticFeedback}
                onChange={(e) => setHapticFeedback(e.target.checked)}
                className="accent-purple-500 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
              <div>
                <div className="font-semibold text-white">Evening Wind-Down Prompt</div>
                <div className="text-slate-400 text-[11px]">
                  Notifies 45 minutes before target bedtime to initiate amber light protocols
                </div>
              </div>
              <input
                type="checkbox"
                checked={windDownReminder}
                onChange={(e) => setWindDownReminder(e.target.checked)}
                className="accent-purple-500 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
              <div>
                <div className="font-semibold text-white">Morning Circadian Briefing</div>
                <div className="text-slate-400 text-[11px]">
                  Generates morning readiness score and outdoor sunlight recommendations
                </div>
              </div>
              <input
                type="checkbox"
                checked={morningBriefing}
                onChange={(e) => setMorningBriefing(e.target.checked)}
                className="accent-purple-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all cursor-pointer"
          >
            Save Target Preferences
          </button>
        </div>
      </form>

      {/* Data Management & Demo Reset */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white">Data Management & Privacy</h3>
        <p className="text-xs text-slate-400">
          Your biometric telemetry is processed with zero tracking scripts or ads.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span>Download Complete Telemetry (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Reset all sleep telemetry back to pristine demo data?')) {
                resetDemoData();
                alert('Demo dataset restored.');
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
