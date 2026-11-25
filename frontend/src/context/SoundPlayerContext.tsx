import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { SoundTrack } from '../types/audio';
import { SOUND_LIBRARY } from '../utils/mockData';
import { audioEngine } from '../utils/audioEngine';

interface ActiveTrackState {
  track: SoundTrack;
  volume: number;
}

interface SoundPlayerContextType {
  activeTracks: ActiveTrackState[];
  isPlaying: boolean;
  masterVolume: number;
  sleepTimerMinutes: number | null;
  timerRemainingSeconds: number | null;
  playTrack: (trackId: string) => void;
  stopTrack: (trackId: string) => void;
  toggleTrack: (trackId: string) => void;
  setTrackVolume: (trackId: string, volume: number) => void;
  setMasterVolume: (volume: number) => void;
  stopAll: () => void;
  setSleepTimer: (minutes: number | null) => void;
}

const SoundPlayerContext = createContext<SoundPlayerContextType | undefined>(undefined);

export const SoundPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTracks, setActiveTracks] = useState<ActiveTrackState[]>([]);
  const [masterVolume, setMasterVolumeState] = useState(0.8);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [timerRemainingSeconds, setTimerRemainingSeconds] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAll = useCallback(() => {
    audioEngine.stopAll();
    setActiveTracks([]);
    setSleepTimerMinutes(null);
    setTimerRemainingSeconds(null);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const playTrack = useCallback((trackId: string) => {
    const track = SOUND_LIBRARY.find((t) => t.id === trackId);
    if (!track) return;

    setActiveTracks((prev) => {
      const exists = prev.find((t) => t.track.id === trackId);
      if (exists) return prev;
      audioEngine.playTrack(trackId, 0.7);
      return [...prev, { track, volume: 0.7 }];
    });
  }, []);

  const stopTrack = useCallback((trackId: string) => {
    audioEngine.stopTrack(trackId);
    setActiveTracks((prev) => prev.filter((t) => t.track.id !== trackId));
  }, []);

  const toggleTrack = useCallback((trackId: string) => {
    const isCurrentlyActive = activeTracks.some((t) => t.track.id === trackId);
    if (isCurrentlyActive) {
      stopTrack(trackId);
    } else {
      playTrack(trackId);
    }
  }, [activeTracks, playTrack, stopTrack]);

  const setTrackVolume = useCallback((trackId: string, volume: number) => {
    audioEngine.setChannelVolume(trackId, volume);
    setActiveTracks((prev) =>
      prev.map((item) => (item.track.id === trackId ? { ...item, volume } : item))
    );
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    setMasterVolumeState(volume);
    audioEngine.setMasterVolume(volume);
  }, []);

  const setSleepTimer = useCallback((minutes: number | null) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSleepTimerMinutes(minutes);

    if (minutes === null) {
      setTimerRemainingSeconds(null);
      return;
    }

    setTimerRemainingSeconds(minutes * 60);

    timerRef.current = setInterval(() => {
      setTimerRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          stopAll();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopAll]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const isPlaying = activeTracks.length > 0;

  return (
    <SoundPlayerContext.Provider
      value={{
        activeTracks,
        isPlaying,
        masterVolume,
        sleepTimerMinutes,
        timerRemainingSeconds,
        playTrack,
        stopTrack,
        toggleTrack,
        setTrackVolume,
        setMasterVolume,
        stopAll,
        setSleepTimer,
      }}
    >
      {children}
    </SoundPlayerContext.Provider>
  );
};

export const useSoundPlayer = (): SoundPlayerContextType => {
  const context = useContext(SoundPlayerContext);
  if (!context) {
    throw new Error('useSoundPlayer must be used within a SoundPlayerProvider');
  }
  return context;
};
