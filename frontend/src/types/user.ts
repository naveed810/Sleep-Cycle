export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: 'Celestial Pro' | 'Free Tier';
  streakDays: number;
  memberSince: string;
  targetSleepMinutes: number; // e.g. 480 (8 hours)
  targetBedtime: string; // "23:00"
  targetWakeTime: string; // "07:00"
  chronotype: 'lion' | 'bear' | 'wolf' | 'dolphin';
  roomTempPreference: number; // Celsius, e.g. 19
  smartAlarmEnabled: boolean;
  hapticFeedback: boolean;
  snoreDetection: boolean;
  soundVolumeDefault: number;
  notificationPreferences: {
    windDownReminder: boolean;
    morningBriefing: boolean;
    circadianAlerts: boolean;
  };
}
