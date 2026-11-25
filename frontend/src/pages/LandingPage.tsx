import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Moon,
  Sparkles,
  AlarmClock,
  Headphones,
  CheckCircle2,
  ArrowRight,
  Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SleepScoreBadge } from '../components/common/SleepScoreBadge';

export const LandingPage: React.FC = () => {
  const { loginDemo } = useAuth();
  const navigate = useNavigate();

  // Interactive Sleep Score Preview Simulator
  const [bedtimeHour, setBedtimeHour] = useState(23); // 11 PM
  const [wakeHour, setWakeHour] = useState(7); // 7 AM
  const [screenTimeChecked, setScreenTimeChecked] = useState(false);
  const [caffeineLate, setCaffeineLate] = useState(false);

  // Compute simulated score
  let duration = wakeHour - bedtimeHour;
  if (duration <= 0) duration += 24;
  let simulatedScore = 70;
  if (duration >= 7 && duration <= 9) simulatedScore += 22;
  else if (duration === 6) simulatedScore += 12;
  else simulatedScore -= 10;
  if (!screenTimeChecked) simulatedScore += 5;
  if (!caffeineLate) simulatedScore += 3;
  simulatedScore = Math.min(98, Math.max(45, simulatedScore));

  const handleTryDemo = () => {
    loginDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#090a16] text-white overflow-hidden relative">
      {/* Background stars and aurora */}
      <div className="absolute inset-0 stars-bg opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-purple-600/20 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Next-Generation Circadian Sleep Science</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Master Your Sleep.{' '}
            <span className="gradient-text-violet">Elevate Your Life.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Harness intelligent acoustic tracking, non-invasive smart wake windows,
            generative soundscapes, and AI circadian coaching to wake up feeling truly restored.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleTryDemo}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-base shadow-xl shadow-purple-900/50 hover:shadow-purple-700/60 transition-all transform hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Live Demo App</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <Link
              to="/register"
              className="px-8 py-4 rounded-2xl glass-button text-white font-bold text-base hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <span>Create Free Account</span>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No wearable required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Acoustic sleep science
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero fake data
            </span>
          </div>
        </div>

        {/* Interactive Sleep Simulator Card */}
        <div className="mt-16 max-w-3xl mx-auto glass-panel-glow rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl relative">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-xs uppercase tracking-wider text-purple-300 font-bold">
                Interactive Preview
              </span>
              <h3 className="text-xl font-bold text-white">Simulate Your Sleep Potential</h3>
            </div>
            <span className="text-xs text-slate-400">Adjust parameters below</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-center">
            {/* Sliders */}
            <div className="md:col-span-2 space-y-5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">Target Bedtime:</span>
                  <span className="text-purple-300 font-mono">
                    {bedtimeHour > 12 ? `${bedtimeHour - 12}:00 PM` : `${bedtimeHour}:00 AM`}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="26"
                  value={bedtimeHour}
                  onChange={(e) => setBedtimeHour(parseInt(e.target.value))}
                  className="w-full accent-purple-500 h-2 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-300">Desired Wake Time:</span>
                  <span className="text-purple-300 font-mono">
                    {wakeHour}:00 AM ({duration}h total)
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="10"
                  value={wakeHour}
                  onChange={(e) => setWakeHour(parseInt(e.target.value))}
                  className="w-full accent-purple-500 h-2 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              {/* Factors toggles */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 cursor-pointer hover:bg-white/10">
                  <input
                    type="checkbox"
                    checked={screenTimeChecked}
                    onChange={(e) => setScreenTimeChecked(e.target.checked)}
                    className="accent-purple-500"
                  />
                  <span>Late Phone Screen</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 cursor-pointer hover:bg-white/10">
                  <input
                    type="checkbox"
                    checked={caffeineLate}
                    onChange={(e) => setCaffeineLate(e.target.checked)}
                    className="accent-purple-500"
                  />
                  <span>Caffeine Past 3 PM</span>
                </label>
              </div>
            </div>

            {/* Score Result */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
              <SleepScoreBadge score={simulatedScore} size="lg" />
              <div className="mt-4">
                <button
                  onClick={handleTryDemo}
                  className="text-xs font-bold text-purple-300 hover:text-white underline cursor-pointer"
                >
                  View Full Tracking Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Engineered for Deeper, Restorative Sleep
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Every feature is backed by clinical chronobiology and circadian medicine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-purple-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5">
              <Moon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Acoustic Sleep Tracking</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Patented sound analysis monitors respiratory rate and body movement without needing a wristband.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-purple-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5">
              <AlarmClock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Light Wakeup</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Identifies your lightest sleep phase within your chosen 20-minute window to eliminate morning sleep inertia.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-purple-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-5">
              <Headphones className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-Channel Soundscapes</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Synthesized 8Hz alpha waves, rainfall, and campfire embers generated directly in your browser.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel rounded-3xl p-6 border border-white/10 hover:border-purple-500/40 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Somna AI Sleep Coach</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Personalized chronotype diagnostics, caffeine half-life tracking, and custom sleep hygiene roadmaps.
            </p>
          </div>
        </div>
      </section>

      {/* The Science: 4 Sleep Stages */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="glass-panel-glow rounded-3xl p-8 sm:p-12 border border-purple-500/30 shadow-2xl">
          <div className="max-w-2xl mb-8">
            <span className="text-xs uppercase tracking-wider text-purple-300 font-bold">
              Circadian Architecture
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-1">
              Decoding the Four Phases of Human Sleep
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                <h4 className="font-bold text-white text-sm">Deep Slow-Wave</h4>
              </div>
              <div className="text-xs text-indigo-300 font-mono mb-1">Target: 15 - 25%</div>
              <p className="text-xs text-slate-400">
                Delta brainwaves dominate. Tissue repairs, human growth hormone surges, and immune memory consolidates.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-purple-500" />
                <h4 className="font-bold text-white text-sm">REM Dream Sleep</h4>
              </div>
              <div className="text-xs text-purple-300 font-mono mb-1">Target: 20 - 25%</div>
              <p className="text-xs text-slate-400">
                Rapid eye movement phase. Brain reorganizes neural synapes, clears traumatic emotional stress, and fosters creative synthesis.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-sky-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-sky-500" />
                <h4 className="font-bold text-white text-sm">Light Sleep</h4>
              </div>
              <div className="text-xs text-sky-300 font-mono mb-1">Target: 45 - 55%</div>
              <p className="text-xs text-slate-400">
                Sleep spindles and K-complexes protect memory from auditory interruptions as heart rate gradually slows down.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <h4 className="font-bold text-white text-sm">Micro-Arousals</h4>
              </div>
              <div className="text-xs text-amber-300 font-mono mb-1">Target: &lt; 10%</div>
              <p className="text-xs text-slate-400">
                Brief subconscious awakenings between 90-minute sleep cycles as posture shifts naturally during the night.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-white">Loved by High Performers</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Over 1.2 million nights analyzed and optimized worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              "The smart wake window is pure magic. I used to wake up groggy to harsh alarms; now I wake up during light sleep feeling alert immediately."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-600/40 border border-purple-400/40 flex items-center justify-center font-bold text-xs text-purple-200">
                DR
              </div>
              <div>
                <div className="text-xs font-bold text-white">Dr. Sarah Jenkins</div>
                <div className="text-[11px] text-slate-400">Neuroscience Researcher</div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              "The browser audio synthesizer is incredible. Layering the 8Hz alpha wave with gentle rainfall puts me out in under 12 minutes consistently."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-600/40 border border-indigo-400/40 flex items-center justify-center font-bold text-xs text-indigo-200">
                MK
              </div>
              <div>
                <div className="text-xs font-bold text-white">Marcus Vance</div>
                <div className="text-[11px] text-slate-400">Triathlete & Software Architect</div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              "The AI sleep coach diagnosed my chronotype as 'Bear' and gave me an exact caffeine cutoff time. My deep sleep jumped by 24% in two weeks."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-pink-600/40 border border-pink-400/40 flex items-center justify-center font-bold text-xs text-pink-200">
                EL
              </div>
              <div>
                <div className="text-xs font-bold text-white">Elena Rostova</div>
                <div className="text-[11px] text-slate-400">Design Director</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action footer banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="glass-panel-glow rounded-3xl p-10 border border-purple-500/40 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready for the Best Sleep of Your Life?
            </h2>
            <p className="text-slate-300 text-sm max-w-xl mx-auto">
              Join thousands who track their circadian rhythms, improve recovery, and wake up energized.
            </p>
            <div className="pt-2">
              <button
                onClick={handleTryDemo}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-purple-900/50 transition-all cursor-pointer"
              >
                Launch Demo Experience Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-white">SLEEP CYCLE™</span>
            <span>— Precision Circadian Wellness</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={handleTryDemo} className="hover:text-purple-300 transition-colors cursor-pointer">
              Demo Dashboard
            </button>
            <Link to="/sounds" className="hover:text-purple-300 transition-colors">
              Soundscapes
            </Link>
            <Link to="/login" className="hover:text-purple-300 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
