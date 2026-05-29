'use client';

import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Cpu, 
  Zap, 
  Activity, 
  Brain,
  TreePine, 
  Layers, 
  CheckCircle2, 
  Plus, 
  TrendingUp, 
  Search,
  Globe,
  Share2,
  ArrowRight
} from 'lucide-react';
import Logo from '../components/Logo'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    // Uses layout-defined base tokens and system fonts
<div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_28%),radial-gradient(circle_at_center,rgba(30,41,59,0.35),transparent_45%),linear-gradient(to_bottom,#070B14,#111827,#0B1120)] text-on-background font-sans selection:bg-[#2fd9f4]/30 overflow-x-hidden antialiased">

      <header className="border-b border-white/[0.08] backdrop-blur-[20px] sticky top-0 z-50 bg-[#111827]">
        <div className="max-w-7xl mx-auto px-8 h-22 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight text-[#F8FAFC]">
            <Logo width={250} height={250} />
            
          </div>
          <nav className="hidden md:flex items-center gap-10 text-sm text-[#94A3B8] font-medium">
            <a href="#platform" className="hover:text-[#F8FAFC] transition-colors text-[#F8FAFC] border-b-2 border-[#adc6ff] pb-1 pt-0.5">Platform</a>
            <a href="#solutions" className="hover:text-[#F8FAFC] transition-colors">Solutions</a>
            <a href="#agents" className="hover:text-[#F8FAFC] transition-colors">Agents</a>
            <a href="#pricing" className="hover:text-[#F8FAFC] transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="text-[#94A3B8] hover:text-[#F8FAFC] p-2 transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button className="bg-gradient-to-r from-[#adc6ff] to-[#d0bcff] hover:opacity-90 text-[#002e6a] font-semibold text-xs px-4 py-2.5 rounded-lg shadow-[0_0_20px_rgba(173,198,255,0.2)] transition-all active:scale-95"
             onClick={() => window.location.href = '/login'}>
              Launch Platform
            </button>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section id="platform" className="max-w-6xl mx-auto px-8 pt-24 pb-16 text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2fd9f4]/30 bg-[#00363e]/30 text-[10px] uppercase tracking-[0.2em] text-[#2fd9f4] font-semibold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2fd9f4] animate-pulse" />
          System Status: Optimized
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.02em] text-[#F8FAFC] max-w-5xl mx-auto leading-[1.1]">
          Your Enterprise, Powered by <br />
          <span className="bg-gradient-to-r from-[#adc6ff] via-[#d0bcff] to-[#2fd9f4] bg-clip-text text-transparent">
            Autonomous AI Agents
          </span>
        </h1>
        
        <p className="mt-6 text-base md:text-lg text-[#94A3B8] max-w-2xl mx-auto font-normal leading-relaxed">
          SynapseOS orchestrates thousands of specialized AI agents to handle complex workflows, predictive analytics, and executive decision support at scale.
        </p>
        
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button className="px-6 py-3.5 rounded-xl bg-[#4d8eff] text-[#00285d] hover:bg-[#adc6ff] font-semibold text-sm transition-all shadow-[0_0_30px_rgba(77,142,255,0.3)] active:scale-95">
            Deploy AI Workforce
          </button>
          <button className="px-6 py-3.5 rounded-xl bg-[#161b2b] border border-white/[0.08] hover:border-[#424754] text-[#F8FAFC] font-semibold text-sm transition-all backdrop-blur-md">
            View Enterprise Demo
          </button>
        </div>

         {/* Dashboard Preview */}
        <div className="relative w-full max-w-6xl mx-auto z-10 mt-20">
          <div className="glass-card rounded-2xl p-2 border border-border-low-alpha shadow-2xl relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>

            <img
              alt="Dashboard Preview"
              className="rounded-xl w-full object-cover aspect-[16/9] shadow-inner"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyEfyGi1PhFbh1Bz3or4HT-AgNk0Ff8WZW8GaMukKYgMXLyi3g04iVbHA6_T_vaZ6zmC-HoQn92ij0yuphmlZo3PqWPUvVizop9dRxvB3I7w5QgJpxjl_-5oLpMb-W1pat4g6X2v7q_UsmlyG2lFfuwiK9vi317M6FhiF5RB-JiqKcE5MgP1aEGiZKnFp85reXzHs4c5ikQJiOOoxb0M-Fyw7ZsUoypBXq94iZg1Fq7EOu2R821MVttZHX_0Ho1AHhjLoGkRrB8d0E"
            />

            {/* --- FLOATING AGENT ORACLE CARD --- */}
            <div className="absolute -left-12 top-1/4 bg-[#1a1f30]/80 backdrop-blur-[20px] p-4 rounded-xl border border-white/[0.08] hidden lg:block animate-bounce shadow-[0_0_30px_rgba(8,13,29,0.5)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#adc6ff]/10 border border-[#adc6ff]/20 flex items-center justify-center">
                  <Brain/>
                  <span className="material-symbols-outlined text-[#adc6ff]"></span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#adc6ff] tracking-tight">Agent "Oracle"</p>
                  <p className="text-[10px] text-[#c2c6d6] uppercase tracking-[0.2em] font-semibold mt-0.5">
                    Predicting Market Shift
                  </p>
                </div>
              </div>
            </div>

            {/* --- FLOATING WORKFLOW SYNC CARD --- */}
            <div className="absolute -right-8 bottom-1/4 bg-[#1a1f30]/80 backdrop-blur-[20px] p-4 rounded-xl border border-white/[0.08] hidden lg:block animate-bounce shadow-[0_0_30px_rgba(8,13,29,0.5)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#d0bcff]/10 border border-[#d0bcff]/20 flex items-center justify-center">
                <TreePine/>
                  <span className="material-symbols-outlined text-[#d0bcff]"></span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#d0bcff] tracking-tight">Workflow Sync</p>
                  <p className="text-[10px] text-[#c2c6d6] uppercase tracking-[0.2em] font-semibold mt-0.5">
                    99.8% Efficiency
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- AUTOMANAGED WORKFLOW LAYER --- */}
      <section id="solutions" className="max-w-7xl mx-auto px-8 py-24 grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#adc6ff] font-semibold block">The Neural Engine</span>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.01em] text-[#F8FAFC] leading-[1.15]">
            Autonomous AI <br />
            <span className="bg-gradient-to-r from-[#adc6ff] to-[#d0bcff] bg-clip-text text-transparent">Workflow Orchestration</span>
          </h2>
          <p className="text-[#94A3B8] font-normal text-base md:text-lg leading-relaxed">
            Stop building single prompts. Start building intelligent chains. Our orchestration engine manages task delegation, memory persistence, and cross-agent communication automatically.
          </p>
          <ul className="space-y-4 pt-2">
            {[
              "Cross-functional task delegation",
              "Self-healing workflow recovery",
              "Zero-latency data synchronization"
            ].map((text, idx) => (
              <li key={idx} className="flex items-center gap-3 text-sm text-[#dee1f9]">
                <div className="w-5 h-5 rounded-full bg-[#adc6ff]/10 border border-[#adc6ff]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#adc6ff]" />
                </div>
                <span className="font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="grid grid-cols-2 gap-4 relative">
          {[
            { icon: <Layers className="w-6 h-6 text-[#adc6ff]" />, title: "Ingestion", desc: "Centralized data vectorization from all sources." },
            { icon: <Brain className="w-6 h-6 text-[#2fd9f4]" />, title: "Reasoning", desc: "Multi-layered LLM logic clusters processing intent." },
            { icon: <Zap className="w-6 h-6 text-[#d0bcff]" />, title: "Execution", desc: "Agents perform actions across your software stack." },
            { icon: <Activity className="w-6 h-6 text-[#2fd9f4]" />, title: "Learning", desc: "Continuous RLHF improvement based on output." }
          ].map((item, idx) => (
            <div key={idx} className="bg-[#161b2b]/40 border border-white/[0.08] rounded-xl p-6 backdrop-blur-[20px] hover:border-[#424754] transition-all group hover:-translate-y-1 duration-300">
              <div className="p-2.5 w-12 h-12 rounded-lg bg-[#080d1d] border border-white/[0.08] mb-5 flex items-center justify-center group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <h3 className="text-[#F8FAFC] font-semibold text-base mb-1.5">{item.title}</h3>
              <p className="text-[#94A3B8] text-xs leading-relaxed font-light">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- BENTO GRID: AGENT FORCE SHOWCASE --- */}
      <section id="agents" className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.01em] text-[#F8FAFC]">
            Your Specialized <span className="bg-gradient-to-r from-[#d0bcff] to-[#2fd9f4] bg-clip-text text-transparent">Agent Force</span>
          </h2>
          <p className="text-[#94A3B8] text-sm max-w-xl mx-auto font-light">
            Pre-trained on billions of enterprise data points across every industry vertical.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          
          {/* Card 1: Compliance Guardian */}
          <div className="md:col-span-2 bg-gradient-to-br from-[#161b2b] to-[#080d1d] border border-white/[0.08] rounded-xl p-8 flex flex-col justify-between relative overflow-hidden group min-h-[320px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#4d8eff]/5 blur-3xl rounded-full pointer-events-none" />
            <div>
              <div className="p-3.5 w-14 h-14 rounded-lg bg-[#080d1d] border border-white/[0.08] flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-[#adc6ff]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#F8FAFC] mb-3">The Compliance Guardian</h3>
              <p className="text-[#94A3B8] text-sm font-light max-w-lg leading-relaxed">
                Autonomous monitoring of global regulations, auto-updating your internal policies in real-time as laws change across jurisdictions.
              </p>
            </div>
            <div className="flex gap-2.5 mt-8">
              <span className="text-[10px] bg-[#080d1d]/80 border border-white/[0.08] px-3 py-1.5 rounded-full text-[#adc6ff] tracking-[0.2em] font-medium">GDPR READY</span>
              <span className="text-[10px] bg-[#080d1d]/80 border border-white/[0.08] px-3 py-1.5 rounded-full text-[#adc6ff] tracking-[0.2em] font-medium">SOC2 AUTO-PILOT</span>
            </div>
          </div>

          {/* Card 2: Predictive Financial Agent */}
          <div className="bg-[#161b2b]/50 border border-white/[0.08] rounded-xl p-6 flex flex-col justify-between hover:border-[#424754] transition-colors">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-lg bg-[#080d1d] border border-white/[0.08] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#2fd9f4]" />
              </div>
            </div>
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-[#F8FAFC] mb-1.5">Predictive Financial Agent</h3>
              <p className="text-[#94A3B8] text-xs font-light leading-relaxed">Forecasts cash flow patterns with 98% contextual accuracy 12 months out.</p>
            </div>
          </div>

          {/* Card 3: CX Autopilot */}
          <div className="bg-[#161b2b]/50 border border-white/[0.08] rounded-xl p-6 flex flex-col justify-between hover:border-[#424754] transition-colors">
            <div className="p-3 w-12 h-12 rounded-lg bg-[#080d1d] border border-white/[0.08] flex items-center justify-center">
              <Globe className="w-6 h-6 text-[#d0bcff]" />
            </div>
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-[#F8FAFC] mb-1.5">CX Autopilot</h3>
              <p className="text-[#94A3B8] text-xs font-light leading-relaxed">End-to-end user issue resolution loops without manual helper intervention steps.</p>
            </div>
          </div>

          {/* Card 4: Action/Call Builder */}
          <div className="md:col-span-2 border border-dashed border-white/[0.08] hover:border-[#424754] rounded-xl p-6 flex items-center justify-between cursor-pointer group transition-all bg-[#080d1d]/40">
            <div className="flex items-center gap-5">
              <div className="p-3 rounded-lg bg-[#080d1d] border border-white/[0.08] flex items-center justify-center text-[#94A3B8] group-hover:text-[#F8FAFC] transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[#c2c6d6] font-semibold text-base group-hover:text-[#F8FAFC] transition-colors">Create Custom Architecture Agent</h3>
                <p className="text-[#94A3B8] text-xs font-light mt-0.5">Train domain-specific tailored data models instantly on secure file instances.</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#424754] group-hover:text-[#94A3B8] transform group-hover:translate-x-1 transition-all hidden sm:block" />
          </div>

        </div>
      </section>

      {/* --- ACTIONABLE REALTIME TELEMETRY --- */}
      <section className="py-24 bg-[#080d1d]/50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Visual Analytics Asset Wrapper */}
            <div className="lg:w-1/2 relative w-full">
              {/* Soft Ambient Vector Backdrop */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[#adc6ff]/20 to-[#d0bcff]/20 blur-2xl opacity-20 pointer-events-none" />
              
              {/* High-Elevated Dashboard Mockup Frame */}
              <div className="bg-[#1a1f30]/40 rounded-2xl overflow-hidden border border-white/[0.08] backdrop-blur-[20px] shadow-2xl relative p-2">
                {/* Internal simulated canvas structure matching your asset guidelines */}
                <div className="aspect-[16/10] w-full rounded-xl bg-[#080d1d] border border-white/[0.08] p-5 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#2fd9f4] animate-pulse" />
                      <div className="w-24 h-2 bg-[#161b2b] rounded" />
                    </div>
                    <div className="w-12 h-3 bg-[#161b2b] rounded-full" />
                  </div>

                  {/* Simulated Analytical Graph Lines */}
                  <div className="glass-card rounded-2xl overflow-hidden border border-border-low-alpha">
                    <img
                      alt="Analytics Dashboard"
                      className="w-full h-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWYsU5Bx6sqv4bJD93Q_EslAJJwxTE2X0XqNppkLy6Ihph8YnYYHGzn6E3jCVcgLyZETRbbsxjyW3i7xOLnw-PCMbfm_EEgr2AGad66KB1XcmQo9l80Am8ipQjYNwAz55EvuzH_mvBA9P-PrEyLeQqhVFxb-Gd04kyuH8DWAb5SjRmRxr3CBovjDVxmuXKH2M1Kkz1vlfBrMhLcYRqvPVvq5zGHjFu_DtNTi9SZLVvy5xR4vrP2_nreJUR5WlDkTGpY-xhf_jwfx8P"
                    />
                  </div>

                  <div className="h-4 border-t border-white/[0.08] pt-3 flex justify-between">
                    <div className="w-10 h-1.5 bg-[#161b2b] rounded" />
                    <div className="w-10 h-1.5 bg-[#161b2b] rounded" />
                    <div className="w-10 h-1.5 bg-[#161b2b] rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Columns */}
            <div className="lg:w-1/2 space-y-8">
              <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.02em] text-[#F8FAFC] leading-[1.15]">
                Actionable Insights, <br />
                <span className="bg-gradient-to-r from-[#adc6ff] to-[#2fd9f4] bg-clip-text text-transparent">Not Just Raw Data</span>
              </h2>
              
              <p className="text-[#94A3B8] font-normal text-base md:text-lg leading-relaxed">
                SynapseOS doesn't just show you graphs. It interprets the "why" behind the numbers and suggests proactive
                steps for your human team to take.
              </p>
              
              {/* Metric Grid Display */}
              <div className="grid grid-cols-2 gap-8 border-t border-white/[0.08] pt-8">
                <div>
                  <p className="text-4xl font-semibold tracking-tight text-[#adc6ff]">10x</p>
                  <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.2em] mt-1">Operational Speed</p>
                </div>
                <div>
                  <p className="text-4xl font-semibold tracking-tight text-[#d0bcff]">64%</p>
                  <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.2em] mt-1">Cost Reduction</p>
                </div>
                <div>
                  <p className="text-4xl font-semibold tracking-tight text-[#2fd9f4]">2.4k</p>
                  <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.2em] mt-1">Daily Automations</p>
                </div>
                <div>
                  <p className="text-4xl font-semibold tracking-tight text-[#F8FAFC]">∞</p>
                  <p className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-[0.2em] mt-1">Scalability</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- PRICING MATRIX --- */}
      <section id="pricing" className="max-w-7xl mx-auto px-8 py-24 text-center">
        <div className="space-y-4 mb-14">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.01em] text-[#F8FAFC]">
            Scalable Pricing for <span className="bg-gradient-to-r from-[#adc6ff] to-[#d0bcff] bg-clip-text text-transparent">Every Scale</span>
          </h2>
          
          <div className="inline-flex p-1 rounded-full bg-[#080d1d] border border-white/[0.08] text-xs font-semibold">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full transition-all ${billingCycle === 'monthly' ? 'bg-[#d0bcff] text-[#00285d] shadow' : 'text-[#94A3B8] hover:text-[#dee1f9]'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-full transition-all ${billingCycle === 'yearly' ? 'bg-[#4d8eff] text-[#00285d] shadow' : 'text-[#94A3B8] hover:text-[#dee1f9]'}`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-left items-stretch max-w-6xl mx-auto">
          
          {/* Card 1: Startup Tier */}
          <div className="bg-[#161b2b]/50 border border-white/[0.08] rounded-xl p-8 flex flex-col justify-between backdrop-blur-[20px]">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-[0.2em] text-[#94A3B8] block mb-4">Startup</span>
              <div className="flex items-baseline gap-1 text-[#F8FAFC] mb-6">
                <span className="text-2xl font-semibold">$</span>
                <span className="text-5xl font-semibold tracking-tight">{billingCycle === 'monthly' ? '499' : '399'}</span>
                <span className="text-xs text-[#94A3B8] font-medium">/mo</span>
              </div>
              <ul className="space-y-4 border-t border-white/[0.08] pt-6">
                {["5 Autonomous Agents", "Basic LLM Orchestration", "100k Token Monthly Cap", "Standard Core Toolset"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs text-[#dee1f9]">
                    <CheckCircle2 className="w-4 h-4 text-[#424754] flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button className="mt-8 w-full py-3 rounded-lg bg-[#080d1d] border border-white/[0.08] hover:border-[#424754] text-xs font-semibold text-[#F8FAFC] transition-colors">
              Get Started
            </button>
          </div>

          {/* Card 2: Enterprise */}
          <div className="bg-gradient-to-b from-[#1a1f30] to-[#080d1d] border-2 border-[#d0bcff] rounded-xl p-8 flex flex-col justify-between relative shadow-[0_0_50px_rgba(77,142,255,0.15)] md:-translate-y-2 transform transition-transform">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.2em] font-bold bg-[#d0bcff] text-[#00285d] px-4 py-1 rounded-full shadow-lg">
              Most Popular
            </span>
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-[0.2em] text-[#adc6ff] block mb-4">Enterprise</span>
              <div className="flex items-baseline gap-1 text-[#F8FAFC] mb-6">
                <span className="text-2xl font-semibold">$</span>
                <span className="text-5xl font-semibold tracking-tight">{billingCycle === 'monthly' ? '2,499' : '1,999'}</span>
                <span className="text-xs text-[#c2c6d6] font-medium">/mo</span>
              </div>
              <ul className="space-y-4 border-t border-white/[0.08] pt-6">
                {["25 Autonomous Agents", "Advanced Neural Logic", "2.5M Token Monthly Cap", "SOC2 Compliance Package"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs text-[#dee1f9]">
                    <CheckCircle2 className="w-4 h-4 text-[#d0bcff] flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button className="mt-8 w-full py-3 rounded-lg bg-gradient-to-r from-[#adc6ff] to-[#d0bcff] text-[#002e6a] text-xs font-semibold transition-all shadow-[0_0_25px_rgba(173,198,255,0.3)]">
              Start 14-Day Trial
            </button>
          </div>

          {/* Card 3: Unlimited */}
          <div className="bg-[#161b2b]/50 border border-white/[0.08] rounded-xl p-8 flex flex-col justify-between backdrop-blur-[20px]">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-[0.2em] text-[#94A3B8] block mb-4">Unlimited</span>
              <div className="text-[#F8FAFC] text-4xl font-semibold tracking-tight mb-6 pt-1.5">Custom</div>
              <ul className="space-y-4 border-t border-white/[0.08] pt-6">
                {["Unlimited Agents", "Private On-Prem Deployment", "Dedicated Model Fine-tuning", "24/7 Neural Architect Support"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs text-[#dee1f9]">
                    <CheckCircle2 className="w-4 h-4 text-[#424754] flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button className="mt-8 w-full py-3 rounded-lg bg-[#080d1d] border border-white/[0.08] hover:border-[#424754] text-xs font-semibold text-[#F8FAFC] transition-colors">
              Contact Sales
            </button>
          </div>

        </div>
      </section>

      {/* --- PRODUCTION FOOTER --- */}
      <footer className="border-t border-white/[0.08] bg-[#111827]">
        <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
          <div className="col-span-2 space-y-4">
            <Logo width={200} height={70} />
            <p className="text-xs text-[#94A3B8] max-w-xs leading-relaxed font-light">
              The operating system optimization framework for autonomous enterprise environments.
            </p>
            <div className="flex gap-3 text-[#424754] pt-2">
              <Share2 className="w-4 h-4 cursor-pointer hover:text-[#94A3B8] transition-colors" />
              <Globe className="w-4 h-4 cursor-pointer hover:text-[#94A3B8] transition-colors" />
            </div>
          </div>
          
          <div>
            <h5 className="text-[10px] font-semibold text-[#F8FAFC] uppercase tracking-[0.2em] mb-4">Platform</h5>
            <ul className="space-y-3 text-xs text-[#94A3B8]">
              <li><a href="#" className="hover:text-[#adc6ff] transition-colors">AI Architecture</a></li>
              <li><a href="#" className="hover:text-[#adc6ff] transition-colors">Agent Marketplace</a></li>
              <li><a href="#" className="hover:text-[#adc6ff] transition-colors">Shared Memory</a></li>
              <li><a href="#" className="hover:text-[#adc6ff] transition-colors">Security & Trust</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[10px] font-semibold text-[#F8FAFC] uppercase tracking-[0.2em] mb-4">Company</h5>
            <ul className="space-y-3 text-xs text-[#94A3B8]">
              <li><a href="#" className="hover:text-[#adc6ff] transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-[#adc6ff] transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-[#adc6ff] transition-colors">Press Kit</a></li>
              <li><a href="#" className="hover:text-[#adc6ff] transition-colors">Contact</a></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h5 className="text-[10px] font-semibold text-[#F8FAFC] uppercase tracking-[0.2em] mb-4">Subscribe to Insights</h5>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="work@email.com" 
                className="bg-[#0e1323] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#dee1f9] placeholder-[#424754] focus:outline-none focus:border-[#4d8eff] flex-1 min-w-0"
              />
              <button className="bg-[#d0bcff] text-[#00285d] hover:bg-[#adc6ff] text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                Join
              </button>
            </div>
            <span className="text-[9px] text-[#424754] block mt-2 font-light">By subscribing, you agree to our policies.</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#424754] font-semibold tracking-[0.2em] gap-4">
          <div>&copy; {new Date().getFullYear()} SYNAPSEOS ARCHITECTURE INC. ALL RIGHTS RESERVED.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#94A3B8] transition-colors">PRIVACY POLICY</a>
            <a href="#" className="hover:text-[#94A3B8] transition-colors">TERMS OF SERVICE</a>
            <a href="#" className="hover:text-[#94A3B8] transition-colors">SECURITY</a>
          </div>
        </div>
      </footer>
    </div>
  );
}