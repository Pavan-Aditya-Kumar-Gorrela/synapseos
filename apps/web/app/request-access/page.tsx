'use client';

import React, { useState } from 'react';
import { ChevronDown, Cpu, SendHorizontal } from 'lucide-react';
import Logo from '../../components/Logo';
export default function RequestAccessWorkspace() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [industry, setIndustry] = useState('');
  const [useCase, setUseCase] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Access Provision Request Dispatched', {
      fullName,
      email,
      organization,
      industry,
      useCase,
    });
  };

  return (
    <div className="min-h-screen bg-[#0e1323] text-[#dee1f9] font-sans selection:bg-[#2fd9f4]/20 flex flex-col justify-between relative overflow-hidden antialiased p-4 sm:p-8">
      
      
      {/* --- CENTRAL REQUEST FORM MODULE --- */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-xl w-full mx-auto z-10 my-8">
        
        {/* Core Description Headers */}
        <Logo width={300} height={100} className="mb-0" />
        <div className="text-center space-y-3 mb-10">
          <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#F8FAFC] mt-0">
            Request System Access
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] font-light max-w-md mx-auto leading-relaxed">
            Join the next generation of enterprise AI orchestration. <br />
            Your request will be reviewed by our security team.
          </p>
        </div>

        {/* Level 2 Floating Form Canvas */}
        <div className="w-full bg-[#161b2b]/40 border border-white/[0.08] rounded-2xl p-6 sm:p-10 backdrop-blur-[30px] shadow-[0_24px_60px_rgba(8,13,29,0.7)] relative group transition-all duration-300 hover:border-white/[0.12]">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#d0bcff]/2 via-transparent to-transparent opacity-40 pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Field: Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-[10px] font-semibold tracking-[0.2em] text-[#94A3B8] uppercase">
                Full Name
              </label>
              <div className="relative rounded-lg bg-[#080d1d]/60 border border-white/[0.08] focus-within:border-[#4d8eff] transition-colors duration-200">
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Johnathan Doe"
                  className="w-full h-11 bg-transparent px-3 text-sm text-[#dee1f9] placeholder-[#424754] focus:outline-none"
                />
              </div>
            </div>

            {/* Field: Corporate Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] font-semibold tracking-[0.2em] text-[#94A3B8] uppercase">
                Corporate Email
              </label>
              <div className="relative rounded-lg bg-[#080d1d]/60 border border-white/[0.08] focus-within:border-[#4d8eff] transition-colors duration-200">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-11 bg-transparent pl-10 pr-3 text-sm text-[#dee1f9] placeholder-[#424754] focus:outline-none"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#424754] flex items-center justify-center">
                  <span className="text-sm font-mono font-medium select-none">@</span>
                </div>
              </div>
            </div>

            {/* Twin Row Columns: Organization & Industry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Sub-Field: Organization */}
              <div className="space-y-2">
                <label htmlFor="organization" className="text-[10px] font-semibold tracking-[0.2em] text-[#94A3B8] uppercase">
                  Organization
                </label>
                <div className="relative rounded-lg bg-[#080d1d]/60 border border-white/[0.08] focus-within:border-[#4d8eff] transition-colors duration-200">
                  <input
                    id="organization"
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full h-11 bg-transparent px-3 text-sm text-[#dee1f9] placeholder-[#424754] focus:outline-none"
                  />
                </div>
              </div>

              {/* Sub-Field: Industry Select Menu */}
              <div className="space-y-2">
                <label htmlFor="industry" className="text-[10px] font-semibold tracking-[0.2em] text-[#94A3B8] uppercase">
                  Industry
                </label>
                <div className="relative rounded-lg bg-[#080d1d]/60 border border-white/[0.08] focus-within:border-[#4d8eff] transition-colors duration-200">
                  <select
                    id="industry"
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full h-11 bg-transparent px-3 text-sm text-[#dee1f9] focus:outline-none appearance-none cursor-pointer pr-10 valid:text-[#dee1f9]"
                  >
                    <option value="" disabled hidden>Select industry</option>
                    <option value="aerospace" className="bg-[#1a1f30]">Aerospace & Defense</option>
                    <option value="fintech" className="bg-[#1a1f30]">FinTech & Banking</option>
                    <option value="healthcare" className="bg-[#1a1f30]">Healthcare AI</option>
                    <option value="saas" className="bg-[#1a1f30]">Enterprise SaaS</option>
                    <option value="logistics" className="bg-[#1a1f30]">Autonomous Logistics</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#424754] pointer-events-none">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>

            {/* Field: Primary Use Case Textarea */}
            <div className="space-y-2">
              <label htmlFor="useCase" className="text-[10px] font-semibold tracking-[0.2em] text-[#94A3B8] uppercase">
                Primary Use Case
              </label>
              <div className="relative rounded-lg bg-[#080d1d]/60 border border-white/[0.08] focus-within:border-[#4d8eff] transition-colors duration-200">
                <textarea
                  id="useCase"
                  required
                  rows={4}
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder="e.g., Multi-agent workflow automation"
                  className="w-full bg-transparent p-3 text-sm text-[#dee1f9] placeholder-[#424754] focus:outline-none resize-none min-h-[96px]"
                />
              </div>
            </div>

            {/* Actions Block: Core Verification Request Submission */}
            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-gradient-to-r from-[#adc6ff] to-[#d0bcff] hover:opacity-95 text-[#00285d] font-semibold text-xs tracking-[0.1em] uppercase shadow-[0_0_30px_rgba(173,198,255,0.15)] hover:shadow-[0_0_35px_rgba(173,198,255,0.25)] transition-all active:scale-[0.99] pt-0.5 flex items-center justify-center gap-2"
            >
              <SendHorizontal className="w-3.5 h-3.5 stroke-[2.5]" />
              Submit Request
            </button>
          </form>

          {/* Core System Reverse Navigation Path */}
          <div className="mt-8 text-center text-xs">
            <span className="text-[#94A3B8] font-light">Already have access? </span>
            <a className="text-[#adc6ff] hover:text-[#d0bcff] transition-colors font-medium underline underline-offset-4 decoration-white/[0.15]"
              onClick={() => window.location.href = '/login'}>
              Log in
            </a>
          </div>

        </div>
      </main>

      {/* --- FOOTER COMPLIANCE ANCHOR --- */}
      <footer className="w-full max-w-7xl mx-auto border-t border-white/[0.04] pt-6 flex flex-col md:flex-row items-center justify-between text-[9px] text-[#424754] font-semibold tracking-[0.2em] gap-4">
        <div className="uppercase text-center md:text-left">
          &copy; {new Date().getFullYear()} SYNAPSEOS. ORGANIC PRECISION FOR ENTERPRISE AI.
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a href="#" className="hover:text-[#94A3B8] transition-colors">PRIVACY POLICY</a>
          <a href="#" className="hover:text-[#94A3B8] transition-colors">TERMS OF SERVICE</a>
          <a href="#" className="hover:text-[#94A3B8] transition-colors">SECURITY ARCHITECTURE</a>
        </div>
      </footer>
    </div>
  );
}