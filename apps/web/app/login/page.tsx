'use client';

import React, { useState } from 'react';
import { Cpu, Eye, EyeOff, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Logo from '../../components/Logo';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

// ─── API ──────────────────────────────────────────────────────────────────────
// Mirrors AuthService.login() → POST /api/v1/auth/login
// Returns TokenResponse { access_token, refresh_token }
const api = 'http://127.0.0.1:8000';
interface UserProfile {
  id ?: string;
  organization_id ?: string;
  full_name: string;
  email: string;
  role: 'admin' | 'viewer' | 'manager' | 'analyst';
}
interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

interface LoginResponse {
  user: UserProfile;
  access_token: string;
  refresh_token: string;
}

async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${api}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    // AuthService raises HTTP 401 with { detail: "..." } on bad credentials
    const err = await res.json().catch(() => ({ detail: 'Unexpected server error.' }));
    throw new Error(err.detail || 'Authentication failed.');
  }

  return res.json();
}

// access_token → sessionStorage (tab-scoped, harder to steal)
// refresh_token → localStorage (persists across tabs for /api/v1/auth/refresh)
function persistTokens(tokens: TokenResponse) {
  sessionStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function AuthenticationWorkspace() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [trustTerminal, setTrustTerminal] = useState(false);
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { setUser, setToken } = useAuthStore();

  const isLoading = formState === 'loading';
  const isSuccess = formState === 'success';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('loading');
    setErrorMsg('');

    try {
      const data = await loginUser(email, password);
      console.log(useAuthStore.getState()); // Debug: log auth store state before updating
      persistTokens(data);
      setUser(data.user); 
      setToken(data.access_token);
       // Set the user profile in the auth store

      // Optional: extend trust via a longer-lived cookie flag sent to your backend
      if (trustTerminal) {
        localStorage.setItem('trust_terminal', 'true');
      }

      setFormState('success');
      router.push('/dashboard');
    } catch (err: unknown) {
      setFormState('error');
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1323] text-[#dee1f9] font-sans selection:bg-[#2fd9f4]/20 flex flex-col lg:flex-row relative overflow-hidden antialiased">

      {/* Background glow fields */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#4d8eff]/5 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[500px] h-[500px] bg-[#571bc1]/5 blur-[130px] pointer-events-none -z-10" />

      {/* ── LEFT BRANDING PANEL ── */}
      <div className="w-full lg:w-[55%] p-8 sm:p-12 lg:p-24 flex flex-col justify-start gap-y-12 relative min-h-fit lg:min-h-screen">
        <div className="flex items-center gap-3">
          <Logo width={400} height={200} />
        </div>

        <div className="max-w-xl">
          <h1 className="text-4xl sm:text-5xl lg:text-[36px] font-semibold tracking-[-0.02em] text-[#F8FAFC] leading-[1.12]">
            Orchestrate <span className="text-[#2fd9f4]">intelligence</span> with precision.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-[#94A3B8] font-normal leading-relaxed max-w-lg">
            The next-generation enterprise workspace designed for high-stakes technical environments. Experience the fusion of structured logic and adaptive AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-6 border-t border-white/[0.04] mt-auto">
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-[#94A3B8] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            Encryption AES-256
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-[#2fd9f4] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2fd9f4] animate-pulse" />
            Neural Sync Active
          </div>
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] text-[#94A3B8] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            ISO 27001
          </div>
        </div>
      </div>

      {/* ── RIGHT AUTH MODULE ── */}
      <div className="w-full lg:w-[45%] p-4 sm:p-8 lg:p-24 flex items-center justify-center bg-[#080d1d]/30 border-l border-white/[0.04] backdrop-blur-[10px]">
        <div className="w-full max-w-md bg-[#161b2b]/40 border border-white/[0.08] rounded-2xl p-8 backdrop-blur-[30px] shadow-[0_24px_60px_rgba(8,13,29,0.7)] relative group transition-all duration-300 hover:border-white/[0.12]">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#adc6ff]/2 via-transparent to-transparent opacity-50 pointer-events-none" />

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-medium tracking-tight text-[#F8FAFC]">Welcome Back</h2>
            <p className="text-xs text-[#94A3B8] font-light">Access your workspace with Synapse ID</p>
          </div>

          {/* ── Error banner ── */}
          {formState === 'error' && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/[0.08] border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-300 leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* ── Success banner ── */}
          {isSuccess && (
            <div className="mb-6 flex items-center gap-3 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-300">Authentication verified. Redirecting…</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-[10px] font-semibold tracking-[0.2em] text-[#94A3B8] uppercase">
                Corporate Email
              </label>
              <div className="relative rounded-lg bg-[#080d1d]/60 border border-white/[0.08] focus-within:border-[#4d8eff] transition-colors duration-200">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  disabled={isLoading || isSuccess}
                  className="w-full h-11 bg-transparent px-3 text-sm text-[#dee1f9] placeholder-[#424754] focus:outline-none pr-10 disabled:opacity-50"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#424754]">
                  <span className="text-sm font-mono font-medium">@</span>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-[10px] font-semibold tracking-[0.2em] text-[#94A3B8] uppercase">
                  Security Key
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs text-[#94A3B8] hover:text-[#adc6ff] transition-colors font-light"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative rounded-lg bg-[#080d1d]/60 border border-white/[0.08] focus-within:border-[#4d8eff] transition-colors duration-200">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={isLoading || isSuccess}
                  className="w-full h-11 bg-transparent px-3 text-sm text-[#dee1f9] placeholder-[#424754] focus:outline-none pr-10 font-mono tracking-widest disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#424754] hover:text-[#94A3B8] transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Trust terminal checkbox */}
            <label className="flex items-center gap-3 cursor-pointer group select-none py-1">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={trustTerminal}
                  onChange={(e) => setTrustTerminal(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-4 h-4 rounded border border-white/[0.15] bg-[#080d1d]/80 group-hover:border-[#424754] peer-checked:bg-[#4d8eff] peer-checked:border-[#4d8eff] transition-all flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-[#00285d] stroke-[3] fill-none stroke-current opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>
              <span className="text-xs text-[#c2c6d6] font-light group-hover:text-[#dee1f9] transition-colors">
                Trust this terminal for 30 days
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full h-11 rounded-lg bg-gradient-to-r from-[#adc6ff] to-[#4d8eff] hover:opacity-95 text-[#00285d] font-semibold text-xs tracking-[0.1em] uppercase shadow-[0_0_30px_rgba(173,198,255,0.2)] hover:shadow-[0_0_35px_rgba(173,198,255,0.3)] transition-all active:scale-[0.99] mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Authenticating…</>
              ) : isSuccess ? (
                <><CheckCircle2 className="w-4 h-4" />Authenticated</>
              ) : (
                <><ShieldCheck className="w-4 h-4 stroke-[2]" />Authenticate System</>
              )}
            </button>
          </form>

          {/* Federated login divider */}
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <span className="relative bg-[#1a1f30] px-3 text-[9px] font-bold tracking-[0.25em] text-[#424754] uppercase">
              Federated Login
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 h-10 rounded-lg bg-[#080d1d]/40 border border-white/[0.08] hover:bg-[#080d1d]/80 hover:border-[#424754] text-xs text-[#dee1f9] font-medium transition-all duration-150">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 h-10 rounded-lg bg-[#080d1d]/40 border border-white/[0.08] hover:bg-[#080d1d]/80 hover:border-[#424754] text-xs text-[#dee1f9] font-medium transition-all duration-150">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>SSO</span>
            </button>
          </div>

          {/* → request-access link */}
          <div className="mt-8 text-center text-xs">
            <span className="text-[#94A3B8] font-light">New operative? </span>
            <a
              href="/request-access"
              className="text-[#adc6ff] hover:text-[#d0bcff] transition-colors font-medium underline underline-offset-4 decoration-white/[0.15]"
            >
              Request access
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}