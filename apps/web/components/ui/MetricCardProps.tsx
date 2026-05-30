import React from 'react';
import { GlassCard } from './GlassCard';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  statusText?: string;
  accent?: 'primary' | 'secondary' | 'tertiary';
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, isPositive = true, statusText, accent = 'primary' }) => {
  const accentColors = {
    primary: 'text-[#adc6ff]',
    secondary: 'text-[#d0bcff]',
    tertiary: 'text-[#2fd9f4]',
  };

  return (
    <GlassCard level={2} className="p-4 sm:p-6 group hover:border-white/[0.15]">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.2em]">{title}</p>
        {change && (
          <span className={`text-xs font-mono font-medium ${isPositive ? 'text-[#2fd9f4]' : 'text-[#ffb4ab]'}`}>
            {change}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <h3 className={`text-2xl sm:text-3xl font-semibold tracking-tight ${accentColors[accent]}`}>{value}</h3>
      </div>
      {statusText && (
        <p className="text-[11px] text-[#c2c6d6] font-light mt-2 flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${accent === 'tertiary' ? 'bg-[#2fd9f4] animate-pulse' : 'bg-white/20'}`} />
          {statusText}
        </p>
      )}
    </GlassCard>
  );
};