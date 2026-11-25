export type SoundCategory = 'nature' | 'binaural' | 'whitenoise' | 'meditation' | 'ambient';

export interface SoundTrack {
  id: string;
  title: string;
  category: SoundCategory;
  description: string;
  durationLabel: string;
  iconName: string;
  color: string;
  tags: string[];
  isPremium?: boolean;
}

export interface ActiveChannel {
  trackId: string;
  volume: number; // 0 to 1
}

export interface AlarmItem {
  id: string;
  label: string;
  time: string; // "07:00"
  period: 'AM' | 'PM';
  days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[];
  enabled: boolean;
  smartWindowMinutes: number; // 0, 10, 20, 30 min gentle wake window
  soundTrack: string;
  vibration: boolean;
  snoozeCount: number;
}
