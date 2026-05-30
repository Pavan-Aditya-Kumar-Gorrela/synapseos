import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  level?: 1 | 2 | 3;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', level = 2, ...props }) => {
  const bgStyles = {
    1: 'bg-[#161b2b]/40 backdrop-blur-[10px]',
    2: 'bg-[#1a1f30]/60 backdrop-blur-[20px] shadow-[0_16px_40px_rgba(8,13,29,0.4)]',
    3: 'bg-[#25293a]/80 backdrop-blur-[30px] shadow-[0_24px_60px_rgba(8,13,29,0.6)] border-white/[0.15]',
  };

  return (
    <div 
      className={`rounded-xl border border-white/[0.08] transition-all duration-300 ${bgStyles[level]} ${className}`}
      style={{ borderWidth: '0.75px' }} // Strict 0.75px border constraint
      {...props}
    >
      {children}
    </div>
  );
};