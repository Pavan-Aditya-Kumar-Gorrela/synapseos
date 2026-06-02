// ══════════════════════════════════════════════════════════
// REUSABLE SETTINGS COMPONENTS — settings-page/components/settings/
// ══════════════════════════════════════════════════════════

'use client';

import React from 'react';

// ─── SettingsCard ──────────────────────────────────────────
// Wraps any settings panel with consistent card styling

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsCard({ title, description, children }: SettingsCardProps) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-white">{title}</h2>
        {description && (
          <p className="text-sm text-slate-400 mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── SettingsField ─────────────────────────────────────────
// A labeled input field used across all settings panels

interface SettingsFieldProps {
  label: string;
  children: React.ReactNode;
  hint?: string;
}

export function SettingsField({ label, children, hint }: SettingsFieldProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500 mt-1.5">{hint}</p>}
    </div>
  );
}

// ─── SettingsInput ─────────────────────────────────────────

interface SettingsInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function SettingsInput({ error, className = '', ...props }: SettingsInputProps) {
  return (
    <>
      <input
        {...props}
        className={`w-full bg-[#1F2937] border rounded-lg px-4 py-2.5 text-sm text-white
          focus:outline-none focus:border-blue-500 transition-colors
          disabled:cursor-not-allowed disabled:opacity-50
          ${error ? 'border-red-500/60' : 'border-slate-700'}
          ${className}`}
      />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </>
  );
}

// ─── SettingsSelect ────────────────────────────────────────

interface SettingsSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function SettingsSelect({ options, className = '', ...props }: SettingsSelectProps) {
  return (
    <select
      {...props}
      className={`w-full bg-[#1F2937] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white
        focus:outline-none focus:border-blue-500 transition-colors appearance-none
        ${className}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ─── SettingsToggle ────────────────────────────────────────

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SettingsToggle({ label, description, checked, onChange }: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none
          ${checked ? 'bg-blue-500' : 'bg-slate-700'}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow
            transition duration-200 ease-in-out
            ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );
}

// ─── SettingsBadge ─────────────────────────────────────────

type BadgeVariant = 'blue' | 'green' | 'yellow' | 'red' | 'slate';

interface SettingsBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const badgeStyles: Record<BadgeVariant, string> = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
  slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export function SettingsBadge({ label, variant = 'slate' }: SettingsBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${badgeStyles[variant]}`}>
      {label}
    </span>
  );
}

// ─── SettingsFormFooter ────────────────────────────────────

interface SettingsFormFooterProps {
  onCancel?: () => void;
  onSave?: () => void;
  isLoading?: boolean;
  saveLabel?: string;
}

export function SettingsFormFooter({
  onCancel,
  onSave,
  isLoading,
  saveLabel = 'Save Changes',
}: SettingsFormFooterProps) {
  return (
    <>
      <hr className="border-slate-800" />
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-slate-400 hover:text-white px-4 py-2 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          onClick={onSave}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed
            text-slate-900 font-semibold text-sm px-5 py-2 rounded-lg
            shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all flex items-center gap-2"
        >
          {isLoading && (
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {saveLabel}
        </button>
      </div>
    </>
  );
}

// ─── SettingsDangerZone ────────────────────────────────────

interface DangerAction {
  label: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
}

interface SettingsDangerZoneProps {
  actions: DangerAction[];
}

export function SettingsDangerZone({ actions }: SettingsDangerZoneProps) {
  return (
    <div className="border border-red-500/20 rounded-xl p-5 bg-red-500/5">
      <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4">Danger Zone</h3>
      <div className="space-y-4">
        {actions.map((action) => (
          <div key={action.label} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">{action.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
            </div>
            <button
              type="button"
              onClick={action.onClick}
              className="shrink-0 text-sm font-medium text-red-400 border border-red-500/30
                hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              {action.buttonLabel}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SettingsInfoRow ───────────────────────────────────────
// Read-only key-value display rows

interface SettingsInfoRowProps {
  label: string;
  value: React.ReactNode;
}

export function SettingsInfoRow({ label, value }: SettingsInfoRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}