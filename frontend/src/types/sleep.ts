export type SleepStage = 'deep' | 'rem' | 'light' | 'awake';

export interface SleepStageInterval {
  stage: SleepStage;
  startTime: string; // e.g. "23:30"
  durationMinutes: number;
}

export interface SleepRecord {
  id: string;
  date: string; // "2026-11-20"
  dayOfWeek: string; // "Fri"
  bedtime: string; // "23:15"
  wakeTime: string; // "07:15"
  durationMinutes: number; // 480 (8h)
  score: number; // 0 - 100
  efficiency: number; // e.g. 94%
  deepMinutes: number;
  remMinutes: number;
  lightMinutes: number;
  awakeMinutes: number;
  avgHeartRate: number; // bpm
  hrv: number; // ms
  respiratoryRate: number; // br/min
  snoreMinutes: number;
  sleepDebtMinutes: number; // relative to 8h goal (+ or -)
  notes?: string;
  tags?: string[]; // e.g. ["No Screen", "Caffeine 2PM", "Chamomile", "Cool Room"]
}

export interface CircadianData {
  chronotype: 'lion' | 'bear' | 'wolf' | 'dolphin';
  peakEnergy: string;
  optimalBedtime: string;
  optimalWakeTime: string;
  melatoninOnset: string;
  caffeineCutoff: string;
}

export interface SleepInsight {
  id: string;
  category: 'recovery' | 'circadian' | 'environment' | 'achievement';
  title: string;
  description: string;
  impact: 'positive' | 'neutral' | 'warning';
  timestamp: string;
  actionableStep?: string;
}
