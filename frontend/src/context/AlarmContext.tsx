import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { AlarmItem } from '../types/audio';
import { INITIAL_ALARMS } from '../utils/mockData';
import { audioEngine } from '../utils/audioEngine';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

interface AlarmContextType {
  alarms: AlarmItem[];
  nextAlarm: AlarmItem | null;
  currentTime: Date;
  isLoading: boolean;
  error: string | null;
  toggleAlarm: (id: string) => void;
  updateAlarm: (id: string, updated: Partial<AlarmItem>) => void;
  addAlarm: (alarm: Omit<AlarmItem, 'id'>) => void;
  deleteAlarm: (id: string) => void;
  previewAlarmSound: (soundTrack: string) => void;
  refreshAlarms: () => Promise<void>;
  clearError: () => void;
}

const AlarmContext = createContext<AlarmContextType | undefined>(undefined);

export const AlarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    try {
      const saved = localStorage.getItem('sleepcycle_alarms');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_ALARMS;
  });

  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Real-time clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync on auth change with cancellation safety
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    api.getAlarms()
      .then((backendAlarms) => {
        if (!isMounted) return;
        if (backendAlarms && backendAlarms.length > 0) {
          setAlarms(backendAlarms);
          localStorage.setItem('sleepcycle_alarms', JSON.stringify(backendAlarms));
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Could not fetch alarms from backend:', err.message);
        setError(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?.id]);

  // Public refresh handler for user actions
  const refreshAlarms = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const backendAlarms = await api.getAlarms();
      if (backendAlarms && backendAlarms.length > 0) {
        setAlarms(backendAlarms);
        localStorage.setItem('sleepcycle_alarms', JSON.stringify(backendAlarms));
      }
    } catch (err: any) {
      console.warn('Could not fetch alarms from backend:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Persist to localStorage cache
  useEffect(() => {
    localStorage.setItem('sleepcycle_alarms', JSON.stringify(alarms));
  }, [alarms]);

  const toggleAlarm = (id: string) => {
    // Optimistic toggle
    setAlarms((prev) =>
      prev.map((alm) => (alm.id === id ? { ...alm, enabled: !alm.enabled } : alm))
    );

    if (isAuthenticated) {
      api
        .toggleAlarm(id)
        .then((updated) => {
          setAlarms((prev) =>
            prev.map((alm) => (alm.id === id ? updated : alm))
          );
        })
        .catch((err) => {
          console.warn('Backend toggle alarm error:', err.message);
        });
    }
  };

  const updateAlarm = (id: string, updated: Partial<AlarmItem>) => {
    setAlarms((prev) =>
      prev.map((alm) => (alm.id === id ? { ...alm, ...updated } : alm))
    );

    if (isAuthenticated) {
      api
        .updateAlarm(id, updated)
        .then((saved) => {
          setAlarms((prev) =>
            prev.map((alm) => (alm.id === id ? saved : alm))
          );
        })
        .catch((err) => {
          console.warn('Backend update alarm error:', err.message);
        });
    }
  };

  const addAlarm = (alarmData: Omit<AlarmItem, 'id'>) => {
    const tempId = `alm_${Date.now()}`;
    const newAlarm: AlarmItem = {
      ...alarmData,
      id: tempId,
    };
    setAlarms((prev) => [...prev, newAlarm]);

    if (isAuthenticated) {
      api
        .createAlarm(alarmData)
        .then((serverAlarm) => {
          setAlarms((prev) =>
            prev.map((alm) => (alm.id === tempId ? serverAlarm : alm))
          );
        })
        .catch((err) => {
          console.warn('Backend create alarm error, preserving local alarm:', err.message);
        });
    }
  };

  const deleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((alm) => alm.id !== id));

    if (isAuthenticated) {
      api.deleteAlarm(id).catch((err) => {
        console.warn('Backend delete alarm error:', err.message);
      });
    }
  };

  const previewAlarmSound = (soundTrack: string) => {
    audioEngine.playAlarmPreview(soundTrack);
  };

  const nextAlarm = useMemo(() => {
    const enabledAlarms = alarms.filter((a) => a.enabled);
    return enabledAlarms.length > 0 ? enabledAlarms[0] : null;
  }, [alarms]);

  return (
    <AlarmContext.Provider
      value={{
        alarms,
        nextAlarm,
        currentTime,
        isLoading,
        error,
        toggleAlarm,
        updateAlarm,
        addAlarm,
        deleteAlarm,
        previewAlarmSound,
        refreshAlarms,
        clearError,
      }}
    >
      {children}
    </AlarmContext.Provider>
  );
};

export const useAlarm = (): AlarmContextType => {
  const context = useContext(AlarmContext);
  if (!context) {
    throw new Error('useAlarm must be used within an AlarmProvider');
  }
  return context;
};
