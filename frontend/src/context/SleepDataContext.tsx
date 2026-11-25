import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { SleepRecord, SleepInsight } from '../types/sleep';
import { INITIAL_SLEEP_RECORDS, INITIAL_INSIGHTS } from '../utils/mockData';
import { useAuth } from './AuthContext';
import { api } from '../services/api';

interface ActiveTrackingState {
  isTracking: boolean;
  isPaused: boolean;
  startTime: number;
  elapsedSeconds: number;
  selectedTags: string[];
}

interface SleepDataContextType {
  records: SleepRecord[];
  todayRecord: SleepRecord;
  insights: SleepInsight[];
  activeTracking: ActiveTrackingState;
  isLoading: boolean;
  error: string | null;
  startTracking: (tags: string[]) => void;
  pauseTracking: () => void;
  resumeTracking: () => void;
  stopAndSaveTracking: (score: number, notes?: string) => SleepRecord;
  discardTracking: () => void;
  addRecord: (record: Omit<SleepRecord, 'id'>) => void;
  deleteRecord: (id: string) => void;
  resetDemoData: () => void;
  refreshRecords: () => Promise<void>;
  clearError: () => void;
}

const SleepDataContext = createContext<SleepDataContextType | undefined>(undefined);

export const SleepDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [records, setRecords] = useState<SleepRecord[]>(() => {
    try {
      const saved = localStorage.getItem('sleepcycle_records');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_SLEEP_RECORDS;
  });

  const [insights, setInsights] = useState<SleepInsight[]>(INITIAL_INSIGHTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTracking, setActiveTracking] = useState<ActiveTrackingState>(() => {
    try {
      const saved = localStorage.getItem('sleepcycle_active_tracking');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      isTracking: false,
      isPaused: false,
      startTime: 0,
      elapsedSeconds: 0,
      selectedTags: [],
    };
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Trigger sync on user change or login with cancellation safety
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    api.getSessions(0, 50)
      .then(({ sessions }) => {
        if (!isMounted) return;
        if (sessions && sessions.length > 0) {
          setRecords(sessions);
          localStorage.setItem('sleepcycle_records', JSON.stringify(sessions));
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Could not fetch sleep sessions from backend:', err.message);
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
  const refreshRecords = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const { sessions } = await api.getSessions(0, 50);
      if (sessions && sessions.length > 0) {
        setRecords(sessions);
        localStorage.setItem('sleepcycle_records', JSON.stringify(sessions));
      }
    } catch (err: any) {
      console.warn('Could not fetch sleep sessions from backend:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Persist records to local cache
  useEffect(() => {
    localStorage.setItem('sleepcycle_records', JSON.stringify(records));
  }, [records]);

  // Persist active tracking state
  useEffect(() => {
    localStorage.setItem('sleepcycle_active_tracking', JSON.stringify(activeTracking));
  }, [activeTracking]);

  // Timer loop for active tracking
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (activeTracking.isTracking && !activeTracking.isPaused) {
      interval = setInterval(() => {
        setActiveTracking((prev) => ({
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1,
        }));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTracking.isTracking, activeTracking.isPaused]);

  const startTracking = (tags: string[]) => {
    setActiveTracking({
      isTracking: true,
      isPaused: false,
      startTime: Date.now(),
      elapsedSeconds: 0,
      selectedTags: tags,
    });

    // Notify backend active tracker
    if (isAuthenticated) {
      api.startTracking(tags).catch((err) => {
        console.warn('Backend start tracking sync notice:', err.message);
      });
    }
  };

  const pauseTracking = () => {
    setActiveTracking((prev) => ({ ...prev, isPaused: true }));
  };

  const resumeTracking = () => {
    setActiveTracking((prev) => ({ ...prev, isPaused: false }));
  };

  const discardTracking = () => {
    setActiveTracking({
      isTracking: false,
      isPaused: false,
      startTime: 0,
      elapsedSeconds: 0,
      selectedTags: [],
    });
  };

  const stopAndSaveTracking = (score: number, notes?: string): SleepRecord => {
    const elapsedMinutes = Math.max(30, Math.round(activeTracking.elapsedSeconds / 60) || 480);
    const deepMin = Math.round(elapsedMinutes * 0.22);
    const remMin = Math.round(elapsedMinutes * 0.24);
    const awakeMin = Math.round(elapsedMinutes * 0.06);
    const lightMin = elapsedMinutes - deepMin - remMin - awakeMin;

    const now = new Date();
    const bedHour = new Date(now.getTime() - elapsedMinutes * 60000);
    const formatTime = (d: Date) => d.toTimeString().slice(0, 5);

    // Create optimistic local record
    const tempId = `slp_${Date.now()}`;
    const optimisticRecord: SleepRecord = {
      id: tempId,
      date: now.toISOString().slice(0, 10),
      dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()],
      bedtime: formatTime(bedHour),
      wakeTime: formatTime(now),
      durationMinutes: elapsedMinutes,
      score: Math.min(100, Math.max(50, score)),
      efficiency: Math.min(98, Math.max(75, Math.round(100 - (awakeMin / elapsedMinutes) * 100))),
      deepMinutes: deepMin,
      remMinutes: remMin,
      lightMinutes: lightMin,
      awakeMinutes: awakeMin,
      avgHeartRate: 53 + Math.floor(Math.random() * 6),
      hrv: 68 + Math.floor(Math.random() * 16),
      respiratoryRate: 14.1,
      snoreMinutes: Math.floor(Math.random() * 10),
      sleepDebtMinutes: 480 - elapsedMinutes,
      notes: notes || 'Monitored session with Sleep Cycle intelligent acoustic sensor.',
      tags:
        activeTracking.selectedTags.length > 0
          ? activeTracking.selectedTags
          : ['Acoustic Sensor', 'Pitch Black Room'],
    };

    // Update state immediately
    setRecords((prev) => [optimisticRecord, ...prev]);
    discardTracking();

    // Add milestone insight
    const newInsight: SleepInsight = {
      id: `ins_${Date.now()}`,
      category: 'recovery',
      title: 'Session Successfully Logged',
      description: `Tracked ${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m with ${optimisticRecord.score}% restorative quality.`,
      impact: 'positive',
      timestamp: 'Just now',
      actionableStep: 'Hydrate with room-temperature water within 15 minutes of waking.',
    };
    setInsights((prev) => [newInsight, ...prev]);

    // Persist to backend
    if (isAuthenticated) {
      api
        .finishTracking(score, notes)
        .then((savedServerRecord) => {
          // Replace optimistic record with server-persisted record
          setRecords((prev) =>
            prev.map((rec) => (rec.id === tempId ? savedServerRecord : rec))
          );
        })
        .catch((backendErr) => {
          console.warn('Backend finish tracking fallback, attempting manual createSession:', backendErr.message);
          api.createSession(optimisticRecord).then((fallbackSaved) => {
            setRecords((prev) =>
              prev.map((rec) => (rec.id === tempId ? fallbackSaved : rec))
            );
          }).catch((createErr) => {
            console.warn('Manual createSession also failed, keeping local record:', createErr.message);
          });
        });
    }

    return optimisticRecord;
  };

  const addRecord = (recordData: Omit<SleepRecord, 'id'>) => {
    const tempId = `slp_${Date.now()}`;
    const newRecord: SleepRecord = {
      ...recordData,
      id: tempId,
    };
    setRecords((prev) => [newRecord, ...prev]);

    if (isAuthenticated) {
      api
        .createSession(recordData)
        .then((serverRecord) => {
          setRecords((prev) =>
            prev.map((r) => (r.id === tempId ? serverRecord : r))
          );
        })
        .catch((err) => {
          console.warn('Failed to persist manual sleep session to backend:', err.message);
        });
    }
  };

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (isAuthenticated) {
      api.deleteSession(id).catch((err) => {
        console.warn('Failed to delete sleep session on backend:', err.message);
      });
    }
  };

  const resetDemoData = () => {
    setRecords(INITIAL_SLEEP_RECORDS);
    setInsights(INITIAL_INSIGHTS);
    discardTracking();
  };

  const todayRecord = records[0] || INITIAL_SLEEP_RECORDS[0];

  return (
    <SleepDataContext.Provider
      value={{
        records,
        todayRecord,
        insights,
        activeTracking,
        isLoading,
        error,
        startTracking,
        pauseTracking,
        resumeTracking,
        stopAndSaveTracking,
        discardTracking,
        addRecord,
        deleteRecord,
        resetDemoData,
        refreshRecords,
        clearError,
      }}
    >
      {children}
    </SleepDataContext.Provider>
  );
};

export const useSleepData = (): SleepDataContextType => {
  const context = useContext(SleepDataContext);
  if (!context) {
    throw new Error('useSleepData must be used within a SleepDataProvider');
  }
  return context;
};
