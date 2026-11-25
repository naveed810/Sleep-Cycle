import React from 'react';
import { motion } from 'framer-motion';

interface SleepScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export const SleepScoreBadge: React.FC<SleepScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const getQualityText = (val: number) => {
    if (val >= 90) return { label: 'Optimal', color: 'text-emerald-400', border: 'border-emerald-500/40', stroke: '#34d399' };
    if (val >= 80) return { label: 'Restorative', color: 'text-purple-300', border: 'border-purple-500/40', stroke: '#c084fc' };
    if (val >= 70) return { label: 'Good', color: 'text-blue-300', border: 'border-blue-500/40', stroke: '#60a5fa' };
    return { label: 'Sub-Optimal', color: 'text-amber-300', border: 'border-amber-500/40', stroke: '#fbbf24' };
  };

  const info = getQualityText(score);

  const dimensions = {
    sm: { box: 64, stroke: 5, font: 'text-lg', label: 'text-[10px]' },
    md: { box: 96, stroke: 7, font: 'text-2xl', label: 'text-xs' },
    lg: { box: 140, stroke: 9, font: 'text-4xl', label: 'text-sm' },
    xl: { box: 180, stroke: 11, font: 'text-5xl', label: 'text-base' },
  }[size];

  const radius = (dimensions.box - dimensions.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div
        className="relative flex items-center justify-center"
        style={{ width: dimensions.box, height: dimensions.box }}
      >
        <svg
          className="transform -rotate-90 origin-center"
          width={dimensions.box}
          height={dimensions.box}
        >
          {/* Background circle */}
          <circle
            cx={dimensions.box / 2}
            cy={dimensions.box / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={dimensions.stroke}
            fill="transparent"
          />
          {/* Animated score circle */}
          <motion.circle
            cx={dimensions.box / 2}
            cy={dimensions.box / 2}
            r={radius}
            stroke={info.stroke}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold tracking-tight text-white ${dimensions.font}`}>
            {score}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-purple-200/60 font-medium">
            Score
          </span>
        </div>
      </div>

      {showLabel && (
        <span
          className={`mt-2 font-medium px-2.5 py-0.5 rounded-full border ${info.border} bg-white/5 ${info.color} ${dimensions.label}`}
        >
          {info.label}
        </span>
      )}
    </div>
  );
};
