'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCardProps';
import { GlassCard } from '@/components/ui/GlassCard';
import { FileUp, Cpu, GitFork, FileLineChart, ArrowUpRight, Play, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useEffect } from 'react';

// Activity Logs Dummy Mock Data
const intelligenceFeed = [
  { id: 1, agent: 'Research Agent Alpha', action: 'Analyzed corporate ESG compliance reports', timestamp: '2 mins ago', status: 'completed' },
  { id: 2, agent: 'Analytics Orchestrator', action: 'Generated real-time token volume prediction dashboards', timestamp: '14 mins ago', status: 'completed' },
  { id: 3, agent: 'Workflow Engine', action: 'Executed cross-functional cloud automation matrix', timestamp: '1 hr ago', status: 'success' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, hydrated } = useAuthStore();
  console.log('DashboardPage render - Auth State:', { user, isAuthenticated, hydrated });
  useEffect(()=>{
    if(!hydrated) return; // Wait for the auth store to be hydrated before checking auth status
    if (!isAuthenticated) {
      toast.error('You must be logged in to access the dashboard.');
      router.push('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  return (
    
    <DashboardLayout>
      {/* Page Layout Header Module */}
      <PageHeader 
        title="Command Dashboard" 
        description="System operations, autonomous execution telemetry, and multi-agent core tracking."
      />

      {/* --- TELEMETRY METRIC GRID (Task 3 / KPI Cards) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <MetricCard title="Active AI Agents" value="1,482" change="+12%" statusText="Clusters live matching SLA" accent="primary" />
        <MetricCard title="Documents Processed" value="894,201" change="Live Streaming" statusText="Avg velocity 0.4s/file" accent="tertiary" />
        <MetricCard title="Workflow Executions" value="42.8M" change="+5.4k today" statusText="99.8% system efficiency" accent="secondary" />
        <MetricCard title="Estimated Cost Optimization" value="$12,402" change="-2.1%" statusText="Saved via load balancing" accent="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* --- RECENT ACTIVITY TELEMETRY FEED (Task 3) --- */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard level={2} className="p-6">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-4 mb-4">
              <h3 className="text-base font-medium text-[#F8FAFC]">Neural Intelligence Stream</h3>
              <span className="text-[10px] font-semibold text-[#2fd9f4] tracking-wider uppercase bg-[#2fd9f4]/10 px-2 py-0.5 rounded-full">Real-time Feed</span>
            </div>
            <div className="space-y-4">
              {intelligenceFeed.map((log) => (
                <div key={log.id} className="flex items-start justify-between p-3 rounded-lg bg-[#080d1d]/40 border border-white/[0.04] hover:border-white/[0.08] transition-colors group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-[#1a1f30] border border-white/[0.08] flex items-center justify-center text-[#adc6ff] mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-[#2fd9f4]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#dee1f9]">{log.agent}</p>
                      <p className="text-xs text-[#94A3B8] font-light mt-0.5">{log.action}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#424754] group-hover:text-[#94A3B8] transition-colors">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* --- SYSTEM INTERACTIVE QUICK ACTIONS MATRIX (Task 3) --- */}
        <div className="space-y-4">
          <GlassCard level={2} className="p-6">
            <h3 className="text-base font-medium text-[#F8FAFC] border-b border-white/[0.04] pb-4 mb-4">Orchestration Routines</h3>
            <div className="grid grid-cols-1 gap-3">
              <button className="flex items-center justify-between h-11 px-4 rounded-lg bg-gradient-to-r from-[#adc6ff]/10 to-transparent border border-white/[0.08] hover:border-[#adc6ff]/40 text-xs font-medium text-[#dee1f9] transition-all duration-150 group">
                <div className="flex items-center gap-3">
                  <FileUp className="w-4 h-4 text-[#adc6ff]" />
                  <span>Upload Control Document</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#424754] group-hover:text-[#adc6ff] transition-colors" />
              </button>
              
              <button className="flex items-center justify-between h-11 px-4 rounded-lg bg-gradient-to-r from-[#2fd9f4]/10 to-transparent border border-white/[0.08] hover:border-[#2fd9f4]/40 text-xs font-medium text-[#dee1f9] transition-all duration-150 group">
                <div className="flex items-center gap-3">
                  <Cpu className="w-4 h-4 text-[#2fd9f4]" />
                  <span>Access Agent Workspace</span>
                </div>
                <Play className="w-3.5 h-3.5 text-[#424754] group-hover:text-[#2fd9f4] transition-colors fill-none" />
              </button>

              <button className="flex items-center justify-between h-11 px-4 rounded-lg bg-gradient-to-r from-[#d0bcff]/10 to-transparent border border-white/[0.08] hover:border-[#d0bcff]/40 text-xs font-medium text-[#dee1f9] transition-all duration-150 group">
                <div className="flex items-center gap-3">
                  <GitFork className="w-4 h-4 text-[#d0bcff]" />
                  <span>Instantiate New Workflow</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#424754] group-hover:text-[#d0bcff] transition-colors" />
              </button>

              <button className="flex items-center justify-between h-11 px-4 rounded-lg bg-gradient-to-r from-white/5 to-transparent border border-white/[0.08] hover:border-white/20 text-xs font-medium text-[#dee1f9] transition-all duration-150 group">
                <div className="flex items-center gap-3">
                  <FileLineChart className="w-4 h-4 text-[#94A3B8]" />
                  <span>Generate Metric Reports</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#424754] group-hover:text-white transition-colors" />
              </button>
            </div>
          </GlassCard>
        </div>

      </div>
    </DashboardLayout>
    
  );
}