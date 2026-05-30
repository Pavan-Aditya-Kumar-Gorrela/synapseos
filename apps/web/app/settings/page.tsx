'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';

export default function GenericComingSoonWorkspace() {
  return (
    <DashboardLayout>
      <PageHeader 
        title="Workspace Interface Node" 
        description="This segment of SynapseOS orchestration matrix is presently spin-locking up."
      />
      <div className="h-64 rounded-xl border border-dashed border-white/[0.08] flex items-center justify-center bg-[#161b2b]/20 backdrop-blur-[4px]">
        <div className="text-center space-y-2">
          <div className="w-2 h-2 rounded-full bg-[#2fd9f4] animate-ping mx-auto" />
          <p className="text-xs font-mono tracking-[0.25em] text-[#424754] uppercase mt-4">INITIALIZING_NODE_CANVAS // COMING SOON</p>
        </div>
      </div>
    </DashboardLayout>
  );
}