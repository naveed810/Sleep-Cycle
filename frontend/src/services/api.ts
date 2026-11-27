
import type { UserProfile } from '../types/user';
import type { SleepRecord } from '../types/sleep';
import type { AlarmItem } from '../types/audio';

// Live Render Backend API URL
export const API_BASE: string =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  'https://sleep-cycle-backend-api.onrender.com/api/v1';

export const TOKEN_KEY = 'sleepcycle_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasToken(): boolean {
  return !!getToken();
}

export function getAuthHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Robust fetch wrapper handling JSON parsing, standard HTTP status codes,
 * and meaningful error messages returned by FastAPI HTTPException.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });

    // Handle 204 No Content
    if (res.status === 204) {
      return null as T;
    }

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const errorData = await res.json();
        if (typeof errorData.detail === 'string') {
          errorMsg = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMsg = errorData.detail
            .map((item: any) => `${item.loc?.slice(-1)[0] || 'field'}: ${item.msg}`)
            .join(', ');
        } else if (errorData.message) {
          errorMsg = errorData.message;
        }
      } catch {
        errorMsg = res.statusText || errorMsg;
      }
      throw new Error(errorMsg);
    }

    return (await res.json()) as T;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Backend server is unreachable. Please check your internet connection or Render service.');
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA MAPPERS (Backend snake_case <───> Frontend camelCase)
// ─────────────────────────────────────────────────────────────────────────────

export function mapBackendUserToFrontend(u: any): UserProfile {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar:
      u.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    plan: (u.plan as 'Celestial Pro' | 'Free Tier') || 'Celestial Pro',
    streakDays: u.streak_days ?? 1,
    memberSince: u.member_since || 'October 2024',
    targetSleepMinutes: u.target_sleep_minutes ?? 480,
    targetBedtime: u.target_bedtime || '23:00',
    targetWakeTime: u.target_wake_time || '07:00',
    chronotype: (u.chronotype as 'lion' | 'bear' | 'wolf' | 'dolphin') || 'bear',
    roomTempPreference: u.room_temp_preference ?? 19,
    smartAlarmEnabled: u.smart_alarm_enabled ?? true,
    hapticFeedback: u.haptic_feedback ?? true,
    snoreDetection: u.snore_detection ?? true,
    soundVolumeDefault: u.sound_volume_default ?? 0.7,
    notificationPreferences: {
      windDownReminder: u.wind_down_reminder ?? true,
      morningBriefing: u.morning_briefing ?? true,
      circadianAlerts: u.circadian_alerts ?? true,
    },
  };
}

export function mapFrontendUserToBackend(p: Partial<UserProfile>): Record<string, any> {
  const payload: Record<string, any> = {};
  if (p.name !== undefined) payload.name = p.name;
  if (p.avatar !== undefined) payload.avatar = p.avatar;
  if (p.targetSleepMinutes !== undefined) payload.target_sleep_minutes = p.targetSleepMinutes;
  if (p.targetBedtime !== undefined) payload.target_bedtime = p.targetBedtime;
  if (p.targetWakeTime !== undefined) payload.target_wake_time = p.targetWakeTime;
  if (p.chronotype !== undefined) payload.chronotype = p.chronotype;
  if (p.roomTempPreference !== undefined) payload.room_temp_preference = p.roomTempPreference;
  if (p.smartAlarmEnabled !== undefined) payload.smart_alarm_enabled = p.smartAlarmEnabled;
  if (p.hapticFeedback !== undefined) payload.haptic_feedback = p.hapticFeedback;
  if (p.snoreDetection !== undefined) payload.snore_detection = p.snoreDetection;
  if (p.soundVolumeDefault !== undefined) payload.sound_volume_default = p.soundVolumeDefault;

  if (p.notificationPreferences) {
    if (p.notificationPreferences.windDownReminder !== undefined) {
      payload.wind_down_reminder = p.notificationPreferences.windDownReminder;
    }
    if (p.notificationPreferences.morningBriefing !== undefined) {
      payload.morning_briefing = p.notificationPreferences.morningBriefing;
    }
    if (p.notificationPreferences.circadianAlerts !== undefined) {
      payload.circadian_alerts = p.notificationPreferences.circadianAlerts;
    }
  }
  return payload;
}

export function mapBackendSleepToFrontend(s: any): SleepRecord {
  return {
    id: s.id,
    date: s.date,
    dayOfWeek: s.day_of_week,
    bedtime: s.bedtime,
    wakeTime: s.wake_time,
    durationMinutes: s.duration_minutes,
    score: s.score,
    efficiency: s.efficiency ?? 90,
    deepMinutes: s.deep_minutes ?? 0,
    remMinutes: s.rem_minutes ?? 0,
    lightMinutes: s.light_minutes ?? 0,
    awakeMinutes: s.awake_minutes ?? 0,
    avgHeartRate: s.avg_heart_rate ?? 55,
    hrv: s.hrv ?? 70,
    respiratoryRate: s.respiratory_rate ?? 14.2,
    snoreMinutes: s.snore_minutes ?? 0,
    sleepDebtMinutes: s.sleep_debt_minutes ?? 0,
    notes: s.notes || undefined,
    tags: s.tags || [],
  };
}

export function mapFrontendSleepToBackend(r: Partial<SleepRecord>): Record<string, any> {
  const payload: Record<string, any> = {};
  if (r.date !== undefined) payload.date = r.date;
  if (r.dayOfWeek !== undefined) payload.day_of_week = r.dayOfWeek;
  if (r.bedtime !== undefined) payload.bedtime = r.bedtime;
  if (r.wakeTime !== undefined) payload.wake_time = r.wakeTime;
  if (r.durationMinutes !== undefined) payload.duration_minutes = r.durationMinutes;
  if (r.score !== undefined) payload.score = r.score;
  if (r.efficiency !== undefined) payload.efficiency = r.efficiency;
  if (r.deepMinutes !== undefined) payload.deep_minutes = r.deepMinutes;
  if (r.remMinutes !== undefined) payload.rem_minutes = r.remMinutes;
  if (r.lightMinutes !== undefined) payload.light_minutes = r.lightMinutes;
  if (r.awakeMinutes !== undefined) payload.awake_minutes = r.awakeMinutes;
  if (r.avgHeartRate !== undefined) payload.avg_heart_rate = r.avgHeartRate;
  if (r.hrv !== undefined) payload.hrv = r.hrv;
  if (r.respiratoryRate !== undefined) payload.respiratory_rate = r.respiratoryRate;
  if (r.snoreMinutes !== undefined) payload.snore_minutes = r.snoreMinutes;
  if (r.sleepDebtMinutes !== undefined) payload.sleep_debt_minutes = r.sleepDebtMinutes;
  if (r.notes !== undefined) payload.notes = r.notes;
  if (r.tags !== undefined) payload.tags = r.tags;
  return payload;
}

export function mapBackendAlarmToFrontend(a: any): AlarmItem {
  return {
    id: a.id,
    label: a.label,
    time: a.time,
    period: (a.period as 'AM' | 'PM') || 'AM',
    days: (a.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']) as any,
    enabled: Boolean(a.enabled),
    smartWindowMinutes: a.smart_window_minutes ?? 20,
    soundTrack: a.sound_track || 'forest_dawn',
    vibration: Boolean(a.vibration),
    snoozeCount: a.snooze_count ?? 0,
  };
}

export function mapFrontendAlarmToBackend(a: Partial<AlarmItem>): Record<string, any> {
  const payload: Record<string, any> = {};
  if (a.label !== undefined) payload.label = a.label;
  if (a.time !== undefined) payload.time = a.time;
  if (a.period !== undefined) payload.period = a.period;
  if (a.days !== undefined) payload.days = a.days;
  if (a.enabled !== undefined) payload.enabled = a.enabled;
  if (a.smartWindowMinutes !== undefined) payload.smart_window_minutes = a.smartWindowMinutes;
  if (a.soundTrack !== undefined) payload.sound_track = a.soundTrack;
  if (a.vibration !== undefined) payload.vibration = a.vibration;
  if (a.snoozeCount !== undefined) payload.snooze_count = a.snoozeCount;
  return payload;
}

// ─────────────────────────────────────────────────────────────────────────────
// SLEEP CYCLE API CLIENT
// ─────────────────────────────────────────────────────────────────────────────

export const api = {
  // ── Authentication ──
  async login(email: string, pass: string): Promise<{ token: string; user: UserProfile }> {
    const data = await request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    setToken(data.access_token);
    const profile = await this.getMe();
    return { token: data.access_token, user: profile };
  },

  async register(
    name: string,
    email: string,
    pass: string,
    chronotype = 'bear'
  ): Promise<{ token: string; user: UserProfile }> {
    const data = await request<{ access_token: string; token_type: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password: pass, chronotype }),
    });
    setToken(data.access_token);
    const profile = await this.getMe();
    return { token: data.access_token, user: profile };
  },

  async demoLogin(): Promise<{ token: string; user: UserProfile }> {
    const data = await request<{ access_token: string; token_type: string }>(
      '/auth/demo-login',
      { method: 'POST' }
    );
    setToken(data.access_token);
    const profile = await this.getMe();
    return { token: data.access_token, user: profile };
  },

  async getMe(): Promise<UserProfile> {
    const data = await request<any>('/auth/me');
    return mapBackendUserToFrontend(data);
  },

  logout(): void {
    clearToken();
  },

  // ── Profile & Biological Goals ──
  async getProfile(): Promise<UserProfile> {
    const data = await request<any>('/users/profile');
    return mapBackendUserToFrontend(data);
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const payload = mapFrontendUserToBackend(updates);
    const data = await request<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapBackendUserToFrontend(data);
  },

  async getGoals(): Promise<any> {
    return request<any>('/users/goals');
  },

  async updateGoals(goals: {
    target_duration_minutes?: number;
    target_bedtime?: string;
    target_wake_time?: string;
    target_consistency_percent?: number;
  }): Promise<any> {
    return request<any>('/users/goals', {
      method: 'PUT',
      body: JSON.stringify(goals),
    });
  },

  // ── Sleep Sessions & Tracking ──
  async getSessions(
    skip = 0,
    limit = 50
  ): Promise<{ total: number; sessions: SleepRecord[] }> {
    const data = await request<{ total: number; sessions: any[] }>(
      `/sleep/sessions?skip=${skip}&limit=${limit}`
    );
    return {
      total: data.total,
      sessions: (data.sessions || []).map(mapBackendSleepToFrontend),
    };
  },

  async getTodaySession(): Promise<SleepRecord | null> {
    const data = await request<any>('/sleep/today');
    return data ? mapBackendSleepToFrontend(data) : null;
  },

  async createSession(record: Partial<SleepRecord>): Promise<SleepRecord> {
    const payload = mapFrontendSleepToBackend(record);
    const data = await request<any>('/sleep/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendSleepToFrontend(data);
  },

  async startTracking(tags: string[] = []): Promise<any> {
    return request<any>('/sleep/start', {
      method: 'POST',
      body: JSON.stringify({ tags }),
    });
  },

  async finishTracking(ratingScore: number, notes?: string): Promise<SleepRecord> {
    const data = await request<any>('/sleep/finish', {
      method: 'POST',
      body: JSON.stringify({
        rating_score: Math.min(100, Math.max(50, ratingScore)),
        notes,
      }),
    });
    return mapBackendSleepToFrontend(data);
  },

  async updateSession(id: string, updates: Partial<SleepRecord>): Promise<SleepRecord> {
    const payload = mapFrontendSleepToBackend(updates);
    const data = await request<any>(`/sleep/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapBackendSleepToFrontend(data);
  },

  async deleteSession(id: string): Promise<void> {
    await request<void>(`/sleep/sessions/${id}`, { method: 'DELETE' });
  },

  // ── Smart Alarms ──
  async getAlarms(): Promise<AlarmItem[]> {
    const data = await request<{ total: number; alarms: any[] }>('/alarms');
    return (data.alarms || []).map(mapBackendAlarmToFrontend);
  },

  async createAlarm(alarm: Partial<AlarmItem>): Promise<AlarmItem> {
    const payload = mapFrontendAlarmToBackend(alarm);
    const data = await request<any>('/alarms', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendAlarmToFrontend(data);
  },

  async updateAlarm(id: string, updates: Partial<AlarmItem>): Promise<AlarmItem> {
    const payload = mapFrontendAlarmToBackend(updates);
    const data = await request<any>(`/alarms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapBackendAlarmToFrontend(data);
  },

  async toggleAlarm(id: string): Promise<AlarmItem> {
    const data = await request<any>(`/alarms/${id}/toggle`, {
      method: 'POST',
    });
    return mapBackendAlarmToFrontend(data);
  },

  async deleteAlarm(id: string): Promise<void> {
    await request<void>(`/alarms/${id}`, { method: 'DELETE' });
  },

  // ── Sleep Analytics & Hypnogram ──
  async getAnalyticsSummary(periodDays = 7): Promise<any> {
    return request<any>(`/analytics/summary?period_days=${periodDays}`);
  },

  async getWeeklyReport(): Promise<any> {
    return request<any>('/analytics/weekly-report');
  },

  // ── AI Sleep Coach ──
  async askCoach(
    message: string,
    contextTags: string[] = []
  ): Promise<{
    reply: string;
    citation?: string;
    action_items: string[];
    provider: string;
  }> {
    return request<{
      reply: string;
      citation?: string;
      action_items: string[];
      provider: string;
    }>('/coach/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context_tags: contextTags }),
    });
  },

  async getChronotypeSchedule(chronotype?: string): Promise<any> {
    const url = chronotype
      ? `/coach/chronotype-schedule?chronotype=${encodeURIComponent(chronotype)}`
      : '/coach/chronotype-schedule';
    return request<any>(url);
  },

  async calculateBedtime(
    wakeTime: string,
    desiredCycles = 5,
    latencyMinutes = 15
  ): Promise<any> {
    return request<any>('/coach/calculate-bedtime', {
      method: 'POST',
      body: JSON.stringify({
        wake_time: wakeTime,
        desired_cycles: desiredCycles,
        sleep_latency_minutes: latencyMinutes,
      }),
    });
  },

  // ── Health ──
  async checkHealth(): Promise<{ status: string; service: string }> {
    const res = await fetch('https://sleep-cycle-backend-api.onrender.com/health');
    if (!res.ok) {
      throw new Error(`Health check failed: ${res.status}`);
    }
    return res.json();
  },
};