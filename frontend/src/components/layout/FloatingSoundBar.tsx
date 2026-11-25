import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, X, Clock, Music2 } from 'lucide-react';
import { useSoundPlayer } from '../../context/SoundPlayerContext';

export const FloatingSoundBar: React.FC = () => {
  const {
    activeTracks,
    isPlaying,
    masterVolume,
    timerRemainingSeconds,
    setMasterVolume,
    stopAll,
    setSleepTimer,
  } = useSoundPlayer();

  if (!isPlaying) return null;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl"
      >
        <div className="glass-panel-glow rounded-2xl p-3 md:px-5 md:py-3.5 border border-purple-500/40 shadow-2xl flex items-center justify-between gap-3 text-white">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 shrink-0">
              <Music2 className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
              </span>
            </div>

            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wider text-purple-300 font-semibold flex items-center gap-1.5">
                <span>Soundscape Active</span>
                {activeTracks.length > 1 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/30 border border-purple-400/30">
                    {activeTracks.length} layered
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-white truncate">
                {activeTracks.map((t) => t.track.title).join(' + ')}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Timer Status / Button */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-purple-200/80 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              {timerRemainingSeconds !== null ? (
                <span className="font-mono text-purple-300 font-medium">
                  {formatTimer(timerRemainingSeconds)}
                </span>
              ) : (
                <button
                  onClick={() => setSleepTimer(30)}
                  className="hover:text-white transition-colors cursor-pointer text-[11px]"
                >
                  Set 30m Timer
                </button>
              )}
            </div>

            {/* Master Volume Slider */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setMasterVolume(masterVolume > 0 ? 0 : 0.7)}
                className="text-slate-400 hover:text-white transition-colors"
                title="Mute / Unmute"
              >
                {masterVolume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="w-20 accent-purple-500 h-1 bg-white/20 rounded-lg cursor-pointer"
              />
            </div>

            {/* Stop / Dismiss */}
            <button
              onClick={stopAll}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer"
              title="Stop Audio"
              aria-label="Stop audio"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
