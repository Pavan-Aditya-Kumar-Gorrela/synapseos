'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, SendHorizontal, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Logo from '../../components/Logo';


// ─── API ──────────────────────────────────────────────────────────────────────
// Mirrors AuthService.register() → POST /api/v1/auth/register
// Matches RegisterRequest schema exactly: full_name, email, password,
// organization_name, organization_slug
const api = 'http://127.0.0.1:8000';
interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
  organization_name: string;
  organization_slug: string;
}

async function submitAccessRequest(payload: RegisterPayload): Promise<void> {
  const res = await fetch(`${api}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    // AuthService raises HTTP 409 for slug/email conflicts, 422 for validation
    const err = await res.json().catch(() => ({ detail: 'Unexpected server error.' }));
    throw new Error(err.detail || 'Request submission failed.');
  }
}

// Derive a URL-safe slug from organization name
// e.g. "Acme Corp" → "acme-corp"
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function RequestAccessWorkspace() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isLoading = formState === 'loading';
  const isSuccess = formState === 'success';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('loading');
    setErrorMsg('');

    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }
      await submitAccessRequest({
        full_name: fullName,
        email,
        password,
        organization_name: organization,
        organization_slug: slugify(organization),
      });
      setFormState('success');
    } catch (err: unknown) {
      setFormState('error');
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1323] text-[#dee1f9] font-sans selection:bg-[#2fd9f4]/20 flex flex-col justify-between relative overflow-hidden antialiased p-4 sm:p-8">

      {/* ── CENTRAL REQUEST FORM MODULE ── */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-xl w-full mx-auto z-10 my-8">

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

        <div className="w-full bg-[#161b2b]/40 border border-white/[0.08] rounded-2xl p-6 sm:p-10 backdrop-blur-[30px] shadow-[0_24px_60px_rgba(8,13,29,0.7)] relative group transition-all duration-300 hover:border-white/[0.12]">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#d0bcff]/2 via-transparent to-transparent opacity-40 pointer-events-none" />

          {/* ── Error banner ── */}
          {formState === 'error' && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/[0.08] border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs text-red-300 leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* ── Success state — replaces form ── */}
          {isSuccess ? (
            <div className="py-8 flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium text-[#F8FAFC]">Request submitted</p>
                <p className="text-xs text-[#94A3B8] leading-relaxed max-w-xs">
                  Our security team will review your request and reach out to <span className="text-[#adc6ff]">{email}</span> within 1–2 business days.
                </p>
              </div>
              <a
                href="/login"
                className="mt-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-[#adc6ff] hover:text-[#d0bcff] transition-colors"
              >
                Back to login →
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Full Name */}
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
                    disabled={isLoading}
                    className="w-full h-11 bg-transparent px-3 text-sm text-[#dee1f9] placeholder-[#424754] focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Corporate Email */}
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
                    disabled={isLoading}
                    className="w-full h-11 bg-transparent pl-10 pr-3 text-sm text-[#dee1f9] placeholder-[#424754] focus:outline-none disabled:opacity-50"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#424754] flex items-center justify-center">
                    <span className="text-sm font-mono font-medium select-none">@</span>
                  </div>
                </div>
              </div>

              {/* Organization — full width, slug auto-derived */}
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
                    disabled={isLoading}
                    className="w-full h-11 bg-transparent px-3 text-sm text-[#dee1f9] placeholder-[#424754] focus:outline-none disabled:opacity-50"
                  />
                </div>
                {/* Live slug preview */}
                {organization && (
                  <p className="text-[10px] text-[#424754] font-mono pl-1">
                    slug: <span className="text-[#4d8eff]">{slugify(organization)}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="reg-password" className="text-[10px] font-semibold tracking-[0.2em] text-[#94A3B8] uppercase">
                  Password
                </label>
                <div className="relative rounded-lg bg-[#080d1d]/60 border border-white/[0.08] focus-within:border-[#4d8eff] transition-colors duration-200">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    disabled={isLoading}
                    className="w-full h-11 bg-transparent px-3 pr-11 text-sm text-[#dee1f9] placeholder-[#424754] focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#424754] hover:text-[#94A3B8] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-[10px] font-semibold tracking-[0.2em] text-[#94A3B8] uppercase">
                  Confirm Password
                </label>
                <div className={`relative rounded-lg bg-[#080d1d]/60 border transition-colors duration-200 ${
                  confirmPassword && confirmPassword !== password
                    ? 'border-red-500/40 focus-within:border-red-500/70'
                    : 'border-white/[0.08] focus-within:border-[#4d8eff]'
                }`}>
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    disabled={isLoading}
                    className="w-full h-11 bg-transparent px-3 pr-11 text-sm text-[#dee1f9] placeholder-[#424754] focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#424754] hover:text-[#94A3B8] transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-[10px] text-red-400 pl-1">Passwords do not match.</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-lg bg-gradient-to-r from-[#adc6ff] to-[#d0bcff] hover:opacity-95 text-[#00285d] font-semibold text-xs tracking-[0.1em] uppercase shadow-[0_0_30px_rgba(173,198,255,0.15)] hover:shadow-[0_0_35px_rgba(173,198,255,0.25)] transition-all active:scale-[0.99] pt-0.5 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" />Submitting…</>
                ) : (
                  <><SendHorizontal className="w-3.5 h-3.5 stroke-[2.5]" />Submit Request</>
                )}
              </button>
            </form>
          )}

          {/* → login link */}
          {!isSuccess && (
            <div className="mt-8 text-center text-xs">
              <span className="text-[#94A3B8] font-light">Already have access? </span>
              <a
                href="/login"
                className="text-[#adc6ff] hover:text-[#d0bcff] transition-colors font-medium underline underline-offset-4 decoration-white/[0.15]"
              >
                Log in
              </a>
            </div>
          )}
        </div>
      </main>

      {/* ── FOOTER ── */}
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