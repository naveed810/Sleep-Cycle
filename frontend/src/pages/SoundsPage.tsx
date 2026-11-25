import React, { useState } from 'react';
import {
  Headphones,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Waves,
  CloudRain,
  Flame,
  Radio,
  Wind,
  Trees,
  Disc,
  Sliders,
} from 'lucide-react';
import { useSoundPlayer } from '../context/SoundPlayerContext';
import { SOUND_LIBRARY } from '../utils/mockData';
import type { SoundCategory } from '../types/audio';

export const SoundsPage: React.FC = () => {
  const {
    activeTracks,
    isPlaying,
    masterVolume,
    sleepTimerMinutes,
    timerRemainingSeconds,
    stopTrack,
    toggleTrack,
    setTrackVolume,
    setMasterVolume,
    stopAll,
    setSleepTimer,
  } = useSoundPlayer();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Soundscapes' },
    { id: 'nature', label: 'Nature Atmospheres' },
    { id: 'binaural', label: 'Binaural Brainwaves' },
    { id: 'whitenoise', label: 'Noise Shields' },
    { id: 'meditation', label: 'Meditation Bowls' },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CloudRain':
        return CloudRain;
      case 'Waves':
        return Waves;
      case 'Flame':
        return Flame;
      case 'Radio':
        return Radio;
      case 'Sparkles':
        return Sparkles;
      case 'Wind':
        return Wind;
      case 'Trees':
        return Trees;
      case 'Disc':
        return Disc;
      default:
        return Headphones;
    }
  };

  const filteredTracks =
    selectedCategory === 'all'
      ? SOUND_LIBRARY
      : SOUND_LIBRARY.filter((t) => t.category === (selectedCategory as SoundCategory));

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Harmonic Web Audio Synthesizer</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">
            Sleep Soundscapes & Binaural Mixer
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Layer multiple ambient sounds simultaneously. Generated directly in your browser.
          </p>
        </div>

        {isPlaying && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 glass-panel px-3 py-1.5 rounded-xl border border-white/10 text-xs">
              <Volume2 className="w-4 h-4 text-purple-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="w-20 accent-purple-500 h-1 cursor-pointer"
                title="Master Volume"
              />
              <span className="font-mono text-purple-300 text-[11px] w-7">
                {Math.round(masterVolume * 100)}%
              </span>
            </div>
            <button
              onClick={stopAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all cursor-pointer"
            >
              <VolumeX className="w-4 h-4" />
              <span>Stop All Sounds</span>
            </button>
          </div>
        )}
      </div>

      {/* Active Mixer Control Console (if tracks are active) */}
      {activeTracks.length > 0 && (
        <div className="glass-panel-glow rounded-3xl p-6 border border-purple-500/40 shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-600/30 border border-purple-500/40 text-purple-300">
                <Sliders className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Active Soundscape Channels</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                    {activeTracks.length} playing
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Adjust individual volume levels to create your personal sleep blend
                </p>
              </div>
            </div>

            {/* Sleep Timer Preset Selector */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                {[15, 30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    onClick={() =>
                      setSleepTimer(sleepTimerMinutes === mins ? null : mins)
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      sleepTimerMinutes === mins
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
                {timerRemainingSeconds !== null && (
                  <span className="text-purple-300 font-mono text-xs ml-2">
                    ({formatTimer(timerRemainingSeconds)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Active Channels Faders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTracks.map(({ track, volume }) => {
              const Icon = getIcon(track.iconName);
              return (
                <div
                  key={track.id}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="text-xs font-bold text-white truncate">
                        {track.title}
                      </span>
                    </div>
                    <button
                      onClick={() => stopTrack(track.id)}
                      className="text-[11px] text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) =>
                        setTrackVolume(track.id, parseFloat(e.target.value))
                      }
                      className="w-full accent-purple-500 h-1.5 bg-white/20 rounded-lg cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-purple-300 w-8 text-right">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === c.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50'
                : 'glass-panel text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Sound Tracks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTracks.map((track) => {
          const Icon = getIcon(track.iconName);
          const activeItem = activeTracks.find((t) => t.track.id === track.id);
          const isActive = !!activeItem;

          return (
            <div
              key={track.id}
              className={`glass-panel rounded-3xl p-5 border transition-all flex flex-col justify-between hover:shadow-xl hover:shadow-purple-950/30 ${
                isActive
                  ? 'border-purple-500/60 bg-purple-950/20 shadow-purple-950/40'
                  : 'border-white/10 hover:border-purple-500/30'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="p-3 rounded-2xl flex items-center justify-center text-white"
                    style={{ backgroundColor: `${track.color}25` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: track.color }} />
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                    {track.durationLabel}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{track.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {track.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {track.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-purple-300 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => toggleTrack(track.id)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300'
                      : 'bg-white/5 hover:bg-purple-600 border border-white/10 hover:border-purple-500 text-white'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Playing</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play / Mix Sound</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
