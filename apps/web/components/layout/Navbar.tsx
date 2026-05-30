import React, { useState, useEffect } from 'react';
import { Bell, Search, ChevronDown, Command, Layers } from 'lucide-react';

export const Navbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-16 border-b border-white/[0.06] bg-[#0e1323]/80 backdrop-blur-md fixed top-0 right-0 left-0 lg:left-64 z-30 px-4 sm:px-6 flex items-center justify-between">
      
      {/* Left Block Elements */}
      <div className="flex items-center gap-4">
        <button className="p-1 text-[#94A3B8] hover:text-[#F8FAFC] lg:hidden" onClick={onMenuClick}>
          <Search className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#94A3B8]">
          <span>Enterprise Workspace</span>
          <span className="text-white/20">/</span>
          <span className="text-[#F8FAFC]">Dashboard</span>
        </div>
      </div>

      {/* Center Block: Interactive Search Terminal Field */}
      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <button 
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full h-9 bg-[#080d1d]/80 border border-white/[0.08] hover:border-white/[0.15] rounded-lg px-3 flex items-center justify-between text-left transition-colors duration-150 group"
        >
          <div className="flex items-center gap-2.5 text-xs text-[#424754] group-hover:text-[#94A3B8]">
            <Search className="w-3.5 h-3.5" />
            <span className="font-light">Execute systemic query or action...</span>
          </div>
          <div className="flex items-center gap-0.5 border border-white/[0.08] bg-[#161b2b] px-1.5 py-0.5 rounded text-[10px] font-mono text-[#94A3B8]">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Block Elements */}
      <div className="flex items-center gap-4">
        
        {/* Environment Workspace Dropdown Selector */}
        <div className="hidden lg:flex items-center gap-2 bg-[#161b2b]/60 border border-white/[0.06] h-9 px-3 rounded-lg cursor-pointer hover:bg-[#161b2b] transition-colors">
          <Layers className="w-3.5 h-3.5 text-[#adc6ff]" />
          <span className="text-xs font-medium text-[#dee1f9]">US-EAST-PRIMARY</span>
          <ChevronDown className="w-3 h-3 text-[#424754]" />
        </div>

        {/* Telemetry Alert Notifications Indicator */}
        <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#161b2b]/40 border border-white/[0.06] text-[#94A3B8] hover:text-[#F8FAFC] relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-[#2fd9f4] rounded-full" />
        </button>

        {/* Operator User Profile Block */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#571bc1] to-[#4d8eff] p-0.5">
            <div className="w-full h-full rounded-[6px] bg-[#080d1d] flex items-center justify-center text-[11px] font-mono font-bold text-[#adc6ff]">
              AX
            </div>
          </div>
        </div>

      </div>

      {/* Simulated AI Command Palette Overlaid Modal Wireframe */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 bg-[#080d1d]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setIsCommandPaletteOpen(false)} />
          <div className="w-full max-w-xl bg-[#161b2b] border border-white/[0.12] rounded-xl shadow-2xl p-4 relative z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-white/[0.08] pb-3 mb-3">
              <Search className="w-4 h-4 text-[#2fd9f4]" />
              <input 
                type="text" 
                autoFocus
                placeholder="Type a command or ask Synapse AI..." 
                className="bg-transparent w-full focus:outline-none text-sm placeholder-[#424754] text-[#dee1f9]"
              />
              <button onClick={() => setIsCommandPaletteOpen(false)} className="text-[10px] uppercase font-mono tracking-wider text-[#424754] hover:text-[#94A3B8]">ESC</button>
            </div>
            <div className="space-y-1 text-xs text-[#424754]">
              <p className="px-2 py-1 font-semibold tracking-wider uppercase text-[9px] text-[#94A3B8]">System Suggestions</p>
              <div className="p-2 hover:bg-white/[0.02] rounded-lg cursor-pointer text-[#c2c6d6] flex justify-between">
                <span>&gt; Initialize Multi-Agent Research Workflow</span>
                <span className="text-[#424754]">Workflows</span>
              </div>
              <div className="p-2 hover:bg-white/[0.02] rounded-lg cursor-pointer text-[#c2c6d6] flex justify-between">
                <span>&gt; Export ESG Operational Metrics Compliance Report</span>
                <span className="text-[#424754]">Reports</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};