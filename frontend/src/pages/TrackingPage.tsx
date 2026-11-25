import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Moon,
  Play,
  Pause,
  Square,
  Volume2,
  Mic,
  Shield,
  CheckCircle2,
  EyeOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSleepData } from '../context/SleepDataContext';
import { useSoundPlayer } from '../context/SoundPlayerContext';
import { Modal } from '../components/common/Modal';

export const TrackingPage: React.FC = () => {
  const { activeTracking, startTracking, pauseTracking, resumeTracking, stopAndSaveTracking, discardTracking } =
    useSleepData();
  const { playTrack, stopAll } = useSoundPlayer();
  const navigate = useNavigate();

  // Pre-sleep factor checklist
  const [selectedFactors, setSelectedFactors] = useState<string[]>([
    'Caffeine Cutoff Met',
    'Dimmed Amber Lighting',
    'Bedroom 19°C',
  ]);

  // Night display mode (ultra dimmed for sleeping in the dark)
  const [nightDisplayMode, setNightDisplayMode] = useState(false);

  // Finish modal state
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [sleepQualityScore, setSleepQualityScore] = useState(90);
  const [morningNotes, setMorningNotes] = useState('');

  const factorsList = [
    'Caffeine Cutoff Met',
    'Dimmed Amber Lighting',
    'Bedroom 19°C',
    'Screen Free 45m',
    'Chamomile / Herbal Infusion',
    'Evening Stretch or Yoga',
    'Magnesium Glycinate',
    'Warm Shower / Bath',
  ];

  const toggleFactor = (f: string) => {
    setSelectedFactors((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  const formatElapsedTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Determine estimated stage based on elapsed time
  const getEstimatedStage = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 15) return { stage: 'Sleep Latency', desc: 'Hypnagogic state, decelerating beta waves' };
    if (minutes < 45) return { stage: 'Light Sleep (N1/N2)', desc: 'Sleep spindles active, heart rate slowing' };
    if (minutes < 105) return { stage: 'Deep Slow-Wave (N3)', desc: 'Delta waves dominant, physical regeneration' };
    if (minutes < 150) return { stage: 'REM Dream Phase', desc: 'Neural synapse pruning, memory consolidation' };
    return { stage: 'Restorative Sleep Cycle', desc: 'Natural ultradian sleep cycle alternating stages' };
  };

  const handleStart = () => {
    startTracking(selectedFactors);
  };

  const handleFinishConfirm = () => {
    stopAndSaveTracking(sleepQualityScore, morningNotes);
    stopAll();
    setFinishModalOpen(false);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#6366f1', '#ec4899', '#38bdf8'],
      });
    } catch {
      // ignore
    }

    navigate('/dashboard');
  };

  // Ultra-dim night mode overlay
  if (nightDisplayMode) {
    return (
      <div
        onClick={() => setNightDisplayMode(false)}
        className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-red-900/60 select-none cursor-pointer p-6"
      >
        <div className="font-mono text-5xl sm:text-7xl font-bold tracking-widest text-red-950/80">
          {formatElapsedTime(activeTracking.elapsedSeconds)}
        </div>
        <div className="mt-4 text-xs text-red-950/70 uppercase tracking-widest flex items-center gap-2">
          <span>Acoustic Sensor Monitoring</span>
          <span className="w-2 h-2 rounded-full bg-red-900/40 animate-ping" />
        </div>
        <div className="absolute bottom-10 text-[10px] text-red-950/50">
          Tap anywhere to exit blackout display mode
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
            <Mic className="w-4 h-4 text-purple-400" />
            <span>Patented Acoustic Bio-Analysis</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Smart Sleep Tracker</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time respiratory and micro-movement analysis. Place phone on nightstand.
          </p>
        </div>

        {activeTracking.isTracking && (
          <button
            onClick={() => setNightDisplayMode(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <EyeOff className="w-4 h-4 text-purple-400" />
            <span>Blackout Night Display</span>
          </button>
        )}
      </div>

      {!activeTracking.isTracking ? (
        /* Pre-tracking preparation stage */
        <div className="space-y-6">
          {/* Main Hero Start Card */}
          <div className="glass-panel-glow rounded-3xl p-8 border border-purple-500/30 text-center relative overflow-hidden">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-1 mb-5 shadow-2xl shadow-purple-900/60">
              <div className="w-full h-full bg-[#090a16] rounded-[22px] flex items-center justify-center">
                <Moon className="w-10 h-10 text-purple-400" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white">Ready for Restorative Sleep?</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
              Place your device display-side down or on your nightstand. Our acoustic analyzer
              tracks your breathing rate, sleep cycle shifts, and snore frequency.
            </p>

            <div className="pt-6">
              <button
                onClick={handleStart}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-base shadow-xl shadow-purple-900/50 hover:shadow-purple-700/60 transition-all transform hover:-translate-y-0.5 flex items-center gap-3 mx-auto cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Start Sleep Session</span>
              </button>
            </div>

            <div className="mt-4 text-[11px] text-slate-400 flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audio is processed locally on device. Zero raw audio uploaded.</span>
            </div>
          </div>

          {/* Wind Down Factors Checklist */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Pre-Sleep Habits & Wind-down</h3>
                <p className="text-xs text-slate-400">
                  Tag the healthy actions you performed tonight for correlation insights.
                </p>
              </div>
              <span className="text-xs text-purple-300 font-semibold">
                {selectedFactors.length} selected
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {factorsList.map((factor) => {
                const isSelected = selectedFactors.includes(factor);
                return (
                  <button
                    key={factor}
                    type="button"
                    onClick={() => toggleFactor(factor)}
                    className={`p-3 rounded-2xl text-left border text-xs font-semibold transition-all cursor-pointer flex flex-col justify-between h-20 ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-500 text-white shadow-md shadow-purple-950/40'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] text-purple-300 font-mono">Habit</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <span className="leading-snug">{factor}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Soundscape Companion */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Sleep Induction Audio</h3>
                  <p className="text-xs text-slate-400">Play a soothing background atmosphere</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/sounds')}
                className="text-xs font-semibold text-purple-300 hover:text-white"
              >
                More Sounds →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => playTrack('rain')}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 text-left transition-all cursor-pointer"
              >
                <div className="font-bold text-white text-xs">Gentle Rain</div>
                <div className="text-[11px] text-slate-400">White noise filter</div>
              </button>
              <button
                onClick={() => playTrack('binaural_alpha')}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 text-left transition-all cursor-pointer"
              >
                <div className="font-bold text-white text-xs">8Hz Alpha Waves</div>
                <div className="text-[11px] text-slate-400">Binaural entrainment</div>
              </button>
              <button
                onClick={() => playTrack('hearth')}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 text-left transition-all cursor-pointer"
              >
                <div className="font-bold text-white text-xs">Campfire Hearth</div>
                <div className="text-[11px] text-slate-400">Warm sub-rumble</div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Active sleep tracking state */
        <div className="space-y-6">
          <div className="glass-panel-glow rounded-3xl p-8 border border-purple-500/30 text-center relative overflow-hidden">
            {/* Visual audio frequency wave bars */}
            <div className="flex items-center justify-center gap-1.5 h-16 mb-6">
              {[4, 8, 16, 24, 18, 12, 28, 20, 14, 22, 10, 26, 15, 8, 4].map((h, i) => (
                <div
                  key={i}
                  style={{
                    height: activeTracking.isPaused ? '4px' : `${h}px`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                  className={`w-1.5 rounded-full transition-all duration-300 ${
                    activeTracking.isPaused
                      ? 'bg-slate-600'
                      : 'bg-gradient-to-t from-purple-500 to-indigo-400 wave-bar'
                  }`}
                />
              ))}
            </div>

            {/* Elapsed Time Counter */}
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-purple-300 font-bold">
                {activeTracking.isPaused ? 'Tracking Paused' : 'Sleep Telemetry Active'}
              </span>
              <div className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight">
                {formatElapsedTime(activeTracking.elapsedSeconds)}
              </div>
            </div>

            {/* Current Stage Estimation */}
            <div className="mt-5 p-3 rounded-2xl bg-white/5 border border-white/10 max-w-sm mx-auto">
              <div className="text-xs font-bold text-emerald-400">
                Phase: {getEstimatedStage(activeTracking.elapsedSeconds).stage}
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                {getEstimatedStage(activeTracking.elapsedSeconds).desc}
              </div>
            </div>

            {/* Sensor Status Indicator */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Acoustic Mic 28 dB</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span>Respiration 14.2 br/m</span>
              </span>
            </div>

            {/* Tracking Action Controls */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-4">
              {activeTracking.isPaused ? (
                <button
                  onClick={resumeTracking}
                  className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-900/40"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Resume Tracking</span>
                </button>
              ) : (
                <button
                  onClick={pauseTracking}
                  className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause Tracking</span>
                </button>
              )}

              <button
                onClick={() => setFinishModalOpen(true)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Wake Up & Finish Session</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Discard current tracking session without saving?')) {
                    discardTracking();
                  }
                }}
                className="px-4 py-3 rounded-2xl text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Sleep Session Modal */}
      <Modal
        isOpen={finishModalOpen}
        onClose={() => setFinishModalOpen(false)}
        title="Good Morning! Complete Session"
      >
        <div className="space-y-4 text-xs">
          <div className="text-center py-2">
            <div className="text-3xl font-extrabold text-white font-mono">
              {formatElapsedTime(activeTracking.elapsedSeconds)}
            </div>
            <div className="text-slate-400 text-xs mt-1">Total Monitored Time</div>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-200 mb-1">
              <span>How refreshed do you feel?</span>
              <span className="text-purple-300 font-bold">{sleepQualityScore} / 100</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={sleepQualityScore}
              onChange={(e) => setSleepQualityScore(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Groggy</span>
              <span>Refreshed</span>
              <span>Fully Restored</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-200 mb-1">Waking Observations</label>
            <textarea
              value={morningNotes}
              onChange={(e) => setMorningNotes(e.target.value)}
              placeholder="e.g. Woke naturally before alarm, remembered vivid dream"
              className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none h-20 placeholder:text-slate-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => setFinishModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleFinishConfirm}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              Save to Sleep Bank
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
