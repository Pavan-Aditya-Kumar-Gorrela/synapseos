import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.04] pb-6 mb-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-[#F8FAFC]">{title}</h1>
        {description && <p className="text-sm text-[#94A3B8] font-light">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
};