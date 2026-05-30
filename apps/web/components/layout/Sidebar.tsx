import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Cpu, FileText, Bot, GitBranch, BarChart3, FileSpreadsheet, Settings, Menu, X, Terminal } from 'lucide-react';
import Logo from '../Logo';

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Workspace', path: '/workspace', icon: Cpu },
  { name: 'Documents', path: '/documents', icon: FileText },
  { name: 'AI Agents', path: '/workspace/agents', icon: Bot },
  { name: 'Workflows', path: '/workflows', icon: GitBranch },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Reports', path: '/reports', icon: FileSpreadsheet },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile structural background layer overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-[#080d1d]/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#161b2b] border-r border-white/[0.06] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Logo Context Title Block */}
          <Logo width={250} height={100} className="mx-6 my-4" />
          {/* Core Navigation Block Elements */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path} className={`flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-all duration-150 relative group ${isActive ? 'text-[#adc6ff] bg-[#adc6ff]/5 border border-white/[0.04]' : 'text-[#94A3B8] hover:text-[#dee1f9] hover:bg-white/[0.02]'}`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#adc6ff]' : 'text-[#94A3B8] group-hover:text-[#dee1f9]'}`} />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#2fd9f4] shadow-[0_0_8px_rgba(47,217,244,0.6)]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* System Node Connection Bottom Utility */}
        <div className="p-4 border-t border-white/[0.04] bg-[#080d1d]/40">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-2 h-2 rounded-full bg-[#2fd9f4] animate-pulse" />
            <div className="text-[10px] font-semibold text-[#94A3B8] tracking-[0.15em] uppercase">
              NODE_SYNC: SECURE
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};