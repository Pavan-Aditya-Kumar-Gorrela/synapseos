'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
// — API Service Layer (backend bridge) —
import {
  UserService,
  OrganizationService,
  type UserUpdate,
  type OrganizationUpdate,
} from '../../services/api';

// — Reusable Settings Components —
import {
  SettingsCard,
  SettingsField,
  SettingsInput,
  SettingsSelect,
  SettingsToggle,
  SettingsBadge,
  SettingsFormFooter,
  SettingsDangerZone,
  SettingsInfoRow,
} from './index';

// ─── Mock auth token hook (replace with real auth context) ──
function useAuthToken() {
  if(typeof window !== 'undefined'){
    return sessionStorage.getItem('access_token');
  }
  return '';
}

// ══════════════════════════════════════════════════════════
// TAB DEFINITIONS
// ══════════════════════════════════════════════════════════

type SettingsTab =
  | 'Organization'
  | 'Personal Details'
  | 'AI Intelligence'
  | 'Billing & Plan'
  | 'Security & SSO'
  | 'API Access'
  | 'Audit Logs';

const NAV_ITEMS: { id: SettingsTab; icon: string }[] = [
  { id: 'Organization',     icon: '🏢' },
  { id: 'Personal Details', icon: '👤' },
  { id: 'AI Intelligence',  icon: '✨' },
  { id: 'Billing & Plan',   icon: '💵' },
  { id: 'Security & SSO',   icon: '🛡️' },
  { id: 'API Access',       icon: '🔑' },
  { id: 'Audit Logs',       icon: '📋' },
];

// ══════════════════════════════════════════════════════════
// ORGANIZATION TAB — Wired to OrganizationService
// ══════════════════════════════════════════════════════════

function OrganizationPanel() {
  const token = useAuthToken();
  const [orgName, setOrgName]     = useState<string>('');
  const [slug, setSlug]           = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved]         = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  useEffect(()=>{
    const fetchOrg = async ()=>{
      try {
        const org = await OrganizationService.getMyOrg(token);
        setOrgName(org.name ?? '');
        setSlug(org.slug ?? '');
      }catch(err){
        console.log(err);
      }

    };
    if(token) fetchOrg();
  }, [token]);

  const handleSave = useCallback(async () => {
    if (!orgName.trim()) {
      setErrors({ orgName: 'Organization name is required.' });
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      const payload: OrganizationUpdate = {
        name: orgName,
        slug,

      };
      // POST /organizations/me  →  OrganizationService.updateMyOrg
      console.log(token);
      await OrganizationService.updateMyOrg(payload, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to update org:', err);
    } finally {
      setIsLoading(false);
    }
  }, [orgName, slug, token]);

  return (
  
    <div className="space-y-6">
      <SettingsCard
        title="Organization Profile"
        description="Public-facing details for your workspace."
      >
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingsField label="Organization Name">
              <SettingsInput
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Acme Corp"
                error={errors.orgName}
              />
            </SettingsField>

            <SettingsField label="Slug" hint="Used in URLs — lowercase, no spaces.">
              <SettingsInput
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s/g, '-'))}
                placeholder="acme-corp"
              />
            </SettingsField>

            
          </div>

          {saved && (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              <span>✓</span> Organization profile updated.
            </p>
          )}

          <SettingsFormFooter
            onSave={handleSave}
            isLoading={isLoading}
            saveLabel={saved ? '✓ Saved' : 'Save Changes'}
          />
        </form>
      </SettingsCard>

      <SettingsDangerZone
        actions={[
          {
            label: 'Transfer Ownership',
            description: 'Assign a new owner for this organization.',
            buttonLabel: 'Transfer',
            onClick: () => alert('Transfer ownership flow'),
          },
          {
            label: 'Delete Organization',
            description: 'Permanently remove this org and all its data.',
            buttonLabel: 'Delete',
            onClick: () => alert('Delete org confirmation'),
          },
        ]}
      />
    </div>
    
  );
}

// ══════════════════════════════════════════════════════════
// PERSONAL DETAILS TAB — Wired to UserService
// ══════════════════════════════════════════════════════════

function PersonalDetailsPanel() {
  const token = useAuthToken();
  const [fullName, setFullName]   = useState<string>('');
  const [email, setEmail]         = useState<string>('');
  const [password, setPassword]   = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved]         = useState(false);

  useEffect(()=>{
    const fetchProfile = async ()=>{
      const profile = await UserService.getMe(token);
      setFullName(profile.full_name);
      setEmail(profile.email);
    }
    if(token) fetchProfile();
  }, [token]);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      const payload: UserUpdate = { full_name: fullName };
      if (password) payload.password = password;
      // PATCH /users/me  →  UserService.updateMe
      await UserService.updateMe(payload, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Failed to update user:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fullName, password, token]);

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <SettingsCard title="Profile" description="Your personal account details.">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-800">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600
            flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {fullName.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{fullName}</p>
            <p className="text-xs text-slate-400">{email}</p>
            <button className="text-xs text-blue-400 hover:text-blue-300 mt-1.5 transition-colors">
              Change avatar →
            </button>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingsField label="Full Name">
              <SettingsInput
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </SettingsField>

            <SettingsField label="Email" hint="Contact support to change your email.">
              <SettingsInput type="email" value={email} disabled />
            </SettingsField>
          </div>

          <SettingsField label="New Password" hint="Leave blank to keep your current password.">
            <SettingsInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full sm:w-1/2"
            />
          </SettingsField>

          {saved && (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              <span>✓</span> Profile updated successfully.
            </p>
          )}

          <SettingsFormFooter onSave={handleSave} isLoading={isLoading} />
        </form>
      </SettingsCard>

      {/* Account Metadata */}
      <SettingsCard title="Account Info">
        <SettingsInfoRow label="Member Since"  value="Jan 12, 2024" />
        <SettingsInfoRow label="Role"          value={<SettingsBadge label="Admin" variant="blue" />} />
        <SettingsInfoRow label="Organization"  value="SynapseX Technologies" />
        <SettingsInfoRow label="Last Login"    value="Today, 9:41 AM" />
      </SettingsCard>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// AI INTELLIGENCE TAB — Static (no backend yet)
// ══════════════════════════════════════════════════════════

function AIIntelligencePanel() {
  const [model, setModel]               = useState('claude-sonnet-4');
  const [temperature, setTemperature]   = useState('0.7');
  const [memoryEnabled, setMemory]      = useState(true);
  const [contextWindow, setContext]     = useState(true);
  const [autoSummarize, setAutoSum]     = useState(false);
  const [hallucFilter, setHallucFilter] = useState(true);

  return (
    <div className="space-y-6">
      <SettingsCard title="Model Configuration" description="Choose the AI engine and behavior parameters.">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingsField label="Default Model">
              <SettingsSelect
                value={model}
                onChange={(e) => setModel(e.target.value)}
                options={[
                  { value: 'claude-sonnet-4',  label: 'Claude Sonnet 4 (Recommended)' },
                  { value: 'claude-opus-4',    label: 'Claude Opus 4 (Most Capable)' },
                  { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 (Fastest)' },
                ]}
              />
            </SettingsField>

            <SettingsField label="Temperature" hint="Higher = more creative; Lower = more precise.">
              <SettingsInput
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
              />
            </SettingsField>
          </div>

          <SettingsFormFooter saveLabel="Save Configuration" />
        </form>
      </SettingsCard>

      <SettingsCard title="Intelligence Features" description="Toggle AI capabilities for your workspace.">
        <div className="divide-y divide-slate-800">
          <SettingsToggle
            label="Persistent Memory"
            description="AI remembers context across sessions."
            checked={memoryEnabled}
            onChange={setMemory}
          />
          <SettingsToggle
            label="Extended Context Window"
            description="Use 200K context for long documents."
            checked={contextWindow}
            onChange={setContext}
          />
          <SettingsToggle
            label="Auto-Summarize Threads"
            description="Automatically summarize long conversations."
            checked={autoSummarize}
            onChange={setAutoSum}
          />
          <SettingsToggle
            label="Hallucination Filter"
            description="Flag low-confidence AI responses."
            checked={hallucFilter}
            onChange={setHallucFilter}
          />
        </div>
      </SettingsCard>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// BILLING & PLAN TAB
// ══════════════════════════════════════════════════════════

function BillingPanel() {
  const INVOICES = [
    { date: 'May 1, 2025',  amount: '$149.00', status: 'Paid' },
    { date: 'Apr 1, 2025',  amount: '$149.00', status: 'Paid' },
    { date: 'Mar 1, 2025',  amount: '$149.00', status: 'Paid' },
    { date: 'Feb 1, 2025',  amount: '$99.00',  status: 'Paid' },
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <SettingsCard title="Current Plan">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl font-bold text-white">Pro</span>
              <SettingsBadge label="Active" variant="green" />
            </div>
            <p className="text-sm text-slate-400">$149/month · Renews Jun 1, 2025</p>
            <ul className="mt-3 space-y-1">
              {['Unlimited AI requests', '10 team members', '100GB document storage', 'Priority support'].map((f) => (
                <li key={f} className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="text-blue-400">✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
          <button className="text-sm font-medium border border-slate-700 hover:border-slate-500
            text-slate-300 px-4 py-2 rounded-lg transition-colors">
            Upgrade →
          </button>
        </div>
      </SettingsCard>

      {/* Payment Method */}
      <SettingsCard title="Payment Method">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-14 bg-[#1F2937] rounded border border-slate-700 flex items-center justify-center text-xs font-bold text-blue-400">
              VISA
            </div>
            <div>
              <p className="text-sm text-white">•••• •••• •••• 4242</p>
              <p className="text-xs text-slate-400">Expires 08/27</p>
            </div>
          </div>
          <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Update card
          </button>
        </div>
      </SettingsCard>

      {/* Invoice History */}
      <SettingsCard title="Invoice History">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
              <th className="text-left pb-3">Date</th>
              <th className="text-left pb-3">Amount</th>
              <th className="text-left pb-3">Status</th>
              <th className="text-right pb-3">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {INVOICES.map((inv) => (
              <tr key={inv.date} className="text-slate-300">
                <td className="py-3">{inv.date}</td>
                <td className="py-3">{inv.amount}</td>
                <td className="py-3">
                  <SettingsBadge label={inv.status} variant="green" />
                </td>
                <td className="py-3 text-right">
                  <button className="text-xs text-blue-400 hover:underline">PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SettingsCard>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SECURITY & SSO TAB
// ══════════════════════════════════════════════════════════

function SecurityPanel() {
  const [mfa, setMfa]               = useState(true);
  const [ssoEnabled, setSso]        = useState(false);
  const [forceSSO, setForceSSO]     = useState(false);
  const [ipRestrict, setIpRestrict] = useState(false);

  const SESSIONS = [
    { device: 'Chrome on macOS',  location: 'Hyderabad, IN',  lastActive: 'Now',           current: true },
    { device: 'Safari on iPhone', location: 'Mumbai, IN',     lastActive: '2 hours ago',   current: false },
    { device: 'VS Code Extension',location: 'Hyderabad, IN',  lastActive: 'Yesterday',     current: false },
  ];

  return (
    <div className="space-y-6">
      <SettingsCard title="Authentication" description="Control how team members sign in.">
        <div className="divide-y divide-slate-800">
          <SettingsToggle
            label="Multi-Factor Authentication"
            description="Require MFA for all team members."
            checked={mfa}
            onChange={setMfa}
          />
          <SettingsToggle
            label="SAML SSO"
            description="Enable single sign-on via your identity provider."
            checked={ssoEnabled}
            onChange={setSso}
          />
          <SettingsToggle
            label="Enforce SSO Only"
            description="Block password login once SSO is active."
            checked={forceSSO}
            onChange={setForceSSO}
          />
          <SettingsToggle
            label="IP Allowlist"
            description="Restrict access to trusted IP ranges."
            checked={ipRestrict}
            onChange={setIpRestrict}
          />
        </div>
      </SettingsCard>

      {ssoEnabled && (
        <SettingsCard title="SSO Configuration">
          <div className="space-y-4">
            <SettingsField label="Identity Provider">
              <SettingsSelect
                options={[
                  { value: 'okta',        label: 'Okta' },
                  { value: 'azure-ad',    label: 'Microsoft Azure AD' },
                  { value: 'google',      label: 'Google Workspace' },
                  { value: 'onelogin',    label: 'OneLogin' },
                  { value: 'custom-saml', label: 'Custom SAML' },
                ]}
              />
            </SettingsField>
            <SettingsField label="SSO Metadata URL">
              <SettingsInput placeholder="https://idp.example.com/metadata.xml" />
            </SettingsField>
            <SettingsFormFooter saveLabel="Save SSO Config" />
          </div>
        </SettingsCard>
      )}

      <SettingsCard title="Active Sessions">
        <div className="space-y-3">
          {SESSIONS.map((s) => (
            <div key={s.device} className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-sm">
                  {s.device.includes('Chrome') ? '🖥️' : s.device.includes('Safari') ? '📱' : '💻'}
                </div>
                <div>
                  <p className="text-sm text-white flex items-center gap-2">
                    {s.device}
                    {s.current && <SettingsBadge label="This device" variant="blue" />}
                  </p>
                  <p className="text-xs text-slate-500">{s.location} · {s.lastActive}</p>
                </div>
              </div>
              {!s.current && (
                <button className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// API ACCESS TAB
// ══════════════════════════════════════════════════════════

function APIAccessPanel() {
  const [showKey, setShowKey] = useState(false);
  const MOCK_KEY = 'sx_live_k9xP2mRqTvWnJdCfAzHbLsGe7YuQiMoK';
  const MASKED    = 'sx_live_' + '•'.repeat(24);

  const API_KEYS = [
    { name: 'Production Key',   created: 'Jan 12, 2024', lastUsed: 'Today',       scope: 'Full Access' },
    { name: 'CI/CD Pipeline',   created: 'Mar 4, 2024',  lastUsed: '3 days ago',  scope: 'Read Only' },
    { name: 'Staging Webhook',  created: 'Apr 20, 2024', lastUsed: '2 weeks ago', scope: 'Write Only' },
  ];

  return (
    <div className="space-y-6">
      <SettingsCard title="API Keys" description="Manage programmatic access to the SynapseX API.">
        <div className="space-y-3 mb-4">
          {API_KEYS.map((k) => (
            <div key={k.name} className="flex items-center justify-between bg-[#1F2937] rounded-lg px-4 py-3 border border-slate-700">
              <div>
                <p className="text-sm font-medium text-white">{k.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">Created {k.created} · Last used {k.lastUsed}</p>
              </div>
              <div className="flex items-center gap-3">
                <SettingsBadge label={k.scope} variant={k.scope === 'Full Access' ? 'blue' : 'slate'} />
                <button className="text-xs text-red-400 hover:text-red-300 transition-colors">Revoke</button>
              </div>
            </div>
          ))}
        </div>
        <button className="text-sm font-medium text-blue-400 hover:text-blue-300 border border-blue-500/30
          hover:bg-blue-500/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <span>+</span> Generate New Key
        </button>
      </SettingsCard>

      <SettingsCard title="Your Live Key" description="Use this key for direct API calls.">
        <div className="flex items-center gap-3 bg-[#1F2937] border border-slate-700 rounded-lg px-4 py-3">
          <code className="text-xs text-emerald-400 font-mono flex-1 select-none">
            {showKey ? MOCK_KEY : MASKED}
          </code>
          <button
            onClick={() => setShowKey(!showKey)}
            className="text-xs text-slate-400 hover:text-white transition-colors shrink-0"
          >
            {showKey ? 'Hide' : 'Reveal'}
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(MOCK_KEY)}
            className="text-xs text-slate-400 hover:text-white transition-colors shrink-0"
          >
            Copy
          </button>
        </div>
        <p className="text-xs text-amber-400 mt-3 flex items-center gap-1.5">
          ⚠ Never share your API key publicly or commit it to version control.
        </p>
      </SettingsCard>

      <SettingsCard title="Webhook Endpoints">
        <SettingsField label="Webhook URL">
          <SettingsInput placeholder="https://yourapp.com/api/webhooks/synapsex" />
        </SettingsField>
        <div className="mt-4">
          <SettingsFormFooter saveLabel="Save Webhook" />
        </div>
      </SettingsCard>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// AUDIT LOGS TAB
// ══════════════════════════════════════════════════════════

function AuditLogsPanel() {
  const LOGS = [
    { user: 'Sonny Hayes',    action: 'Updated organization profile',  ts: '2 min ago',    type: 'settings' },
    { user: 'Sonny Hayes',    action: 'Generated new API key',         ts: '1 hour ago',   type: 'api' },
    { user: 'Priya Mehta',    action: 'Uploaded document Report.pdf',  ts: '3 hours ago',  type: 'document' },
    { user: 'System',         action: 'Plan renewed to Pro',           ts: 'Yesterday',    type: 'billing' },
    { user: 'Raj Kumar',      action: 'Joined organization',           ts: '2 days ago',   type: 'member' },
    { user: 'Sonny Hayes',    action: 'Enabled MFA for org',           ts: '3 days ago',   type: 'security' },
    { user: 'Priya Mehta',    action: 'Created workflow "Onboarding"', ts: '4 days ago',   type: 'workflow' },
    { user: 'Raj Kumar',      action: 'Revoked API key CI/CD v1',      ts: '1 week ago',   type: 'api' },
  ];

  const TYPE_BADGE: Record<string, string> = {
    settings: 'blue',
    api:      'yellow',
    document: 'slate',
    billing:  'green',
    member:   'blue',
    security: 'red',
    workflow: 'slate',
  };

  return (
    <div className="space-y-6">
      <SettingsCard title="Audit Logs" description="All activity within your organization.">
        {/* Filter row */}
        <div className="flex items-center gap-3 mb-5">
          <SettingsInput placeholder="Search logs…" className="max-w-xs" />
          <SettingsSelect
            className="max-w-[160px]"
            options={[
              { value: 'all',      label: 'All Types' },
              { value: 'settings', label: 'Settings' },
              { value: 'api',      label: 'API' },
              { value: 'billing',  label: 'Billing' },
              { value: 'security', label: 'Security' },
            ]}
          />
        </div>

        <div className="divide-y divide-slate-800">
          {LOGS.map((log, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                  {log.user === 'System' ? '⚙' : log.user.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm text-white">{log.action}</p>
                  <p className="text-xs text-slate-500">{log.user}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <SettingsBadge
                  label={log.type}
                  variant={(TYPE_BADGE[log.type] as 'blue' | 'green' | 'yellow' | 'red' | 'slate') ?? 'slate'}
                />
                <span className="text-xs text-slate-500 w-20 text-right">{log.ts}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Load more logs →
          </button>
        </div>
      </SettingsCard>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN SETTINGS PAGE
// ══════════════════════════════════════════════════════════

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Organization');

  const TAB_PANELS: Record<SettingsTab, React.ReactNode> = {
    'Organization':     <OrganizationPanel />,
    'Personal Details': <PersonalDetailsPanel />,
    'AI Intelligence':  <AIIntelligencePanel />,
    'Billing & Plan':   <BillingPanel />,
    'Security & SSO':   <SecurityPanel />,
    'API Access':       <APIAccessPanel />,
    'Audit Logs':       <AuditLogsPanel />,
  };

  return (

    // Replace with your <DashboardLayout> wrapper in the real app
    <div className="min-h-screen bg-[#0D1117] p-8">
      {/* Page Header */}
      <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your organization's configuration, settings, and intelligence parameters.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Sub-Navigation */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                  transition-colors text-left
                  ${isActive
                    ? 'bg-[#1E293B] text-blue-400 border border-slate-700/50'
                    : 'text-slate-400 hover:bg-[#1E293B]/50 hover:text-slate-200'
                  }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.id}
              </button>
            );
          })}
        </nav>

        {/* Right Content Panel */}
        <div className="md:col-span-3">
          {TAB_PANELS[activeTab]}
        </div>
      </div>
      </DashboardLayout>
    </div>
    
  );
}