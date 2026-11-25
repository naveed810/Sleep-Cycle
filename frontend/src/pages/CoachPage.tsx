import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Brain,
  Sun,
  Moon,
  Coffee,
  CheckCircle2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSleepData } from '../context/SleepDataContext';
import { api } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citation?: string;
  actionItems?: string[];
}

export const CoachPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { todayRecord } = useSleepData();

  const [activeTab, setActiveTab] = useState<'chat' | 'chronotype'>('chat');

  // Interactive chat messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello ${user?.name || 'Explorer'}! I'm Somna AI, your circadian intelligence coach. Based on your recent telemetry, you had an impressive ${todayRecord.score}/100 sleep score last night with 110 minutes of deep slow-wave sleep. How can I optimize your rest today?`,
      timestamp: 'Today, 08:00 AM',
      actionItems: [
        'Get 15-20 mins outdoor sunlight before 9:00 AM',
        'Set caffeine cutoff for 2:00 PM today',
      ],
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Suggested prompt chips
  const suggestedChips = [
    'Why do I wake up around 3 AM?',
    'Calculate my exact caffeine cutoff',
    'How can I increase my deep slow-wave sleep?',
    'What is my optimal bedtime for 7 AM wake?',
    'Strategies to cure morning sleep inertia',
  ];

  // Chronotype Quiz state
  const [selectedChronotype, setSelectedChronotype] = useState<'lion' | 'bear' | 'wolf' | 'dolphin'>(
    user?.chronotype || 'bear'
  );

  const chronotypes = [
    {
      id: 'lion',
      title: '🦁 The Lion (15-20% of population)',
      desc: 'Early to bed, early to rise. Naturally energetic in early morning, tires early evening.',
      schedule: {
        wake: '05:30 AM',
        sunlight: '06:00 AM',
        peakFocus: '08:00 AM - 12:00 PM',
        caffeineCutoff: '12:00 PM',
        windDown: '09:00 PM',
        bedtime: '10:00 PM',
      },
    },
    {
      id: 'bear',
      title: '🐻 The Bear (50-55% of population)',
      desc: 'Follows solar cycle. Wakes with sunrise, sharpest mid-morning, needs 8 solid hours.',
      schedule: {
        wake: '07:00 AM',
        sunlight: '07:30 AM',
        peakFocus: '10:00 AM - 02:00 PM',
        caffeineCutoff: '02:00 PM',
        windDown: '10:15 PM',
        bedtime: '11:00 PM',
      },
    },
    {
      id: 'wolf',
      title: '🐺 The Wolf (15-20% of population)',
      desc: 'Classic night owl. Peak creative and intellectual burst occurs late afternoon and evening.',
      schedule: {
        wake: '08:30 AM',
        sunlight: '09:00 AM',
        peakFocus: '04:00 PM - 09:00 PM',
        caffeineCutoff: '03:30 PM',
        windDown: '11:30 PM',
        bedtime: '12:30 AM',
      },
    },
    {
      id: 'dolphin',
      title: '🐬 The Dolphin (10% of population)',
      desc: 'Light, alert sleeper. Unicellular slumber tendencies, often high cortisol in evenings.',
      schedule: {
        wake: '06:30 AM',
        sunlight: '07:00 AM',
        peakFocus: '02:00 PM - 06:00 PM',
        caffeineCutoff: '11:30 AM',
        windDown: '10:30 PM',
        bedtime: '11:30 PM',
      },
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await api.askCoach(text, todayRecord.tags || []);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: response.reply,
          timestamp: 'Just now',
          citation: response.citation,
          actionItems: response.action_items,
        },
      ]);
    } catch (err) {
      console.warn('Backend AI coach endpoint failed, using local clinical engine fallback:', err);
      // Fallback response generator
      let reply = '';
      let citation = '';
      let actionItems: string[] = [];

      const lower = text.toLowerCase();
      if (lower.includes('3 am') || lower.includes('waking up')) {
        reply =
          'Waking up around 3:00 to 4:00 AM is a classic circadian shift. Your core body temperature drops to its lowest point (the nocturnal nadir) and your first 2-3 deep sleep cycles finish, transitioning you into lighter REM sleep. Blood sugar dips or cortisol surges from late carbohydrates or alcohol can easily wake you at this vulnerability point.';
        citation = 'Stanford Sleep Medicine & Matthew Walker, PhD (Why We Sleep)';
        actionItems = [
          'Avoid alcohol within 3-4 hours of sleep (prevents rebound REM awakenings)',
          'Ensure your bedroom is maintained between 18°C - 19°C',
          'Have a small spoonful of almond butter or protein 45m before bed to stabilize glucose',
        ];
      } else if (lower.includes('caffeine')) {
        reply =
          'Caffeine has an average half-life of 5 to 7 hours and a quarter-life of up to 12 hours. Even if you fall asleep, residual caffeine blocks adenosine receptors in the brain, reducing deep restorative slow-wave delta sleep by up to 30%. For your Bear chronotype, cutoff is strictly 2:00 PM.';
        citation = 'Journal of Clinical Sleep Medicine (Drake et al.)';
        actionItems = [
          'Switch to herbal tisanes or decaf green tea after 2:00 PM',
          'Try 200mg L-theanine or chamomile if caffeine was consumed late',
        ];
      } else if (lower.includes('deep sleep') || lower.includes('slow-wave')) {
        reply =
          'To increase deep delta slow-wave sleep, the single most powerful lever is cooling your core body temperature. A hot shower 90 minutes before bed causes vasodilation in hands and feet, dumping heat and dropping internal temperature. Supplementing magnesium glycinate and sleeping in a pitch-black room at 19°C also directly deepens delta stage duration.';
        citation = 'Dr. Andrew Huberman, Stanford Neurobiology Lab';
        actionItems = [
          'Take a warm shower or bath 90 minutes before bed',
          'Use black-out blinds or a silk eye mask to suppress retinal melanopsin',
          'Listen to 8Hz alpha or 5Hz theta binaural audio during wind-down',
        ];
      } else if (lower.includes('optimal bedtime') || lower.includes('7 am')) {
        reply =
          'To wake up refreshed at 7:00 AM, we work backwards through 90-minute ultradian sleep cycles plus a 15-minute sleep latency buffer. 5 full cycles equals 7.5 hours of sleep. Your ideal lights-out time is exactly 11:15 PM, with dim amber wind-down beginning at 10:30 PM.';
        citation = 'Harvard Medical School Circadian Rhythm Lab';
        actionItems = [
          'Dim ambient household lighting by 50% at 10:15 PM',
          'Head into bed at 11:00 PM to allow 15 minutes of wind-down drift',
        ];
      } else {
        reply = `Great inquiry regarding sleep optimization! For your ${selectedChronotype.toUpperCase()} chronotype, maintaining circadian regularity within a 20-minute window yields dramatic improvements in REM density and cognitive clarity. Combining consistent light timing with sound masking gives your autonomic nervous system the permission to fully downregulate.`;
        citation = 'Sleep Research Society (Sleep Medicine Reviews)';
        actionItems = [
          'Maintain consistent wake time within 20 minutes even on weekends',
          'Keep bedroom strictly dedicated to sleep and recovery',
        ];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: reply,
          timestamp: 'Just now',
          citation,
          actionItems,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleApplyChronotype = (cId: 'lion' | 'bear' | 'wolf' | 'dolphin') => {
    setSelectedChronotype(cId);
    updateProfile({ chronotype: cId });
  };

  const currentSchedule =
    chronotypes.find((c) => c.id === selectedChronotype)?.schedule ||
    chronotypes[1].schedule;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pink-300">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Circadian Intelligence & Neurobiology</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-1">Somna AI Sleep Coach</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Clinical sleep science, chronotype diagnostics, and personalized sleep hygiene.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Consultation
          </button>
          <button
            onClick={() => setActiveTab('chronotype')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'chronotype'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Chronotype Schedule
          </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Interface (3 cols) */}
          <div className="lg:col-span-3 glass-panel rounded-3xl border border-white/10 flex flex-col h-[650px] overflow-hidden">
            {/* Chat header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Somna AI Assistant</div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Synchronized with your sleep telemetry</span>
                  </div>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono">v3.4 Neuro-Bio</span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-tr-none'
                        : 'glass-panel-glow border border-purple-500/30 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {msg.actionItems && msg.actionItems.length > 0 && (
                      <div className="pt-2 border-t border-white/10 space-y-1.5">
                        <div className="font-bold text-purple-300 text-[11px] uppercase tracking-wider">
                          Prescribed Protocols:
                        </div>
                        {msg.actionItems.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-1.5 text-slate-300 text-[11px]"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {msg.citation && (
                      <div className="text-[10px] text-purple-300/70 pt-1 border-t border-white/5 italic flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>Source: {msg.citation}</span>
                      </div>
                    )}

                    <div className="text-[9px] text-slate-500 text-right">
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 items-center text-xs text-purple-300">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="glass-panel px-4 py-2 rounded-2xl border border-white/10 flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-4 py-2 border-t border-white/5 flex gap-2 overflow-x-auto bg-white/5">
              {suggestedChips.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSendMessage(chip)}
                  className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-purple-300 whitespace-nowrap transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 border-t border-white/10 flex items-center gap-2 bg-[#0d0e20]"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about sleep stages, caffeine half-life, waking at 3 AM..."
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-purple-500 focus:outline-none placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all cursor-pointer disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Side Panel: Sleep Prescriptions */}
          <div className="space-y-4">
            <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Today's Protocols</span>
              </h3>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5" />
                  <span>Morning Light</span>
                </div>
                <div className="text-xs text-white font-semibold">15m Sunlight Exposure</div>
                <p className="text-[11px] text-slate-400">
                  Resets suprachiasmatic nucleus (SCN) circadian timer.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-purple-300 flex items-center gap-1">
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Adenosine Defense</span>
                </div>
                <div className="text-xs text-white font-semibold">Cutoff: 02:00 PM</div>
                <p className="text-[11px] text-slate-400">
                  Ensures clear adenosine binding for non-REM sleep.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-sky-400 flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5" />
                  <span>Thermoregulation</span>
                </div>
                <div className="text-xs text-white font-semibold">Cool Bedroom to 19°C</div>
                <p className="text-[11px] text-slate-400">
                  Required 1°C drop in core body temp to initiate sleep.
                </p>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-5 border border-white/10 space-y-2 text-xs">
              <div className="font-bold text-white">Chronotype Diagnostics</div>
              <p className="text-slate-400 text-[11px]">
                You are currently mapped to the <strong>Bear</strong> chronotype.
              </p>
              <button
                onClick={() => setActiveTab('chronotype')}
                className="w-full mt-2 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>View Full Schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Chronotype Schedule view */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {chronotypes.map((c) => (
              <div
                key={c.id}
                onClick={() => handleApplyChronotype(c.id as any)}
                className={`glass-panel rounded-3xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedChronotype === c.id
                    ? 'border-purple-500 bg-purple-950/20 shadow-xl shadow-purple-950/40 ring-1 ring-purple-500'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <h3 className="font-bold text-white text-sm">{c.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{c.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-purple-300 font-semibold">
                    {selectedChronotype === c.id ? 'Active Schedule' : 'Select'}
                  </span>
                  {selectedChronotype === c.id && (
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Full 24-Hour Circadian Schedule Card */}
          <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-purple-500/30 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Ideal 24-Hour Circadian Blueprint
                </h3>
                <p className="text-xs text-slate-400">
                  Calibrated to your chronotype biology and hormone fluctuations.
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold uppercase font-mono">
                {selectedChronotype} Phase
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-[10px] uppercase font-bold text-amber-400">01 • Rise</div>
                <div className="text-lg font-bold text-white mt-1">
                  {currentSchedule.wake}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Natural wake window</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-[10px] uppercase font-bold text-amber-300">
                  02 • Sunlight
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {currentSchedule.sunlight}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Cortisol pulse trigger</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-[10px] uppercase font-bold text-emerald-400">
                  03 • Peak Focus
                </div>
                <div className="text-sm font-bold text-white mt-1">
                  {currentSchedule.peakFocus}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Highest cognitive flow</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-[10px] uppercase font-bold text-rose-400">
                  04 • Caffeine Off
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {currentSchedule.caffeineCutoff}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Zero caffeine after</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-[10px] uppercase font-bold text-purple-300">
                  05 • Wind Down
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {currentSchedule.windDown}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Amber light & audio</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-[10px] uppercase font-bold text-indigo-400">
                  06 • Bedtime
                </div>
                <div className="text-lg font-bold text-white mt-1">
                  {currentSchedule.bedtime}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Lights out / delta sleep</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
