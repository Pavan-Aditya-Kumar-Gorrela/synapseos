export type SynapseThemeType = {
  colors: Record<string, string>;
  typography: Record<string, string>;
};

export const SynapseTheme: SynapseThemeType = {
  colors: {
    // Core Background Canvas Layout Layers
    background: '#0e1323',          // Level 0 Base Canvas
    surfaceLowest: '#080d1d',       // Deep Section Alternation Background
    surfaceLow: '#161b2b',          // Sidebar Panels / Level 1 Background
    surface: '#1a1f30',             // Level 2 Standard Float Canvas
    surfaceHigh: '#25293a',         // Level 3 Elevated Popovers
    surfaceHighest: '#2f3446',      // Highly Elevated Interactive Indicators

    // Brand Core Emissive Identity Nodes
    primary: '#adc6ff',             // Indigo Core Primary Utility Accent
    secondary: '#d0bcff',           // Soft Sage/Purple Workspace Secondary Utility
    tertiary: '#2fd9f4',            // Live Accent (Cyan): Reserved for Active AI states

    // Status Variant Boundaries
    error: '#ffb4ab',               // System Exception
    success: '#2fd9f4',             // Normal Status Sync Execution

    // Typography Foreground States
    onSurface: '#dee1f9',           // Standard Clean Read Text
    onSurfaceVariant: '#c2c6d6',    // Secondary Explanatory Muted Metadata Label
    textPrimary: '#F8FAFC',         // Pure White Header Dominance
    textSecondary: '#94A3B8',       // Muted Descriptions

    // Alpha Border Stroke Strategies
    borderLowAlpha: 'rgba(255, 255, 255, 0.08)', // Thin 0.75px Stroke Rule
    outlineVariant: '#424754',      // Deep Recessed Underline Separators
  },
  typography: {
    fontFamily: 'Geist, sans-serif',
    fontFamilyMono: 'Geist Mono, monospace',
  }
};

function toKebab(str: string) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function toCssVars(theme: SynapseThemeType, prefix = 'synapse') {
  const vars: Record<string, string> = {};
  Object.entries(theme.colors).forEach(([key, value]) => {
    vars[`--${prefix}-color-${toKebab(key)}`] = value;
  });
  Object.entries(theme.typography).forEach(([key, value]) => {
    vars[`--${prefix}-typography-${toKebab(key)}`] = value;
  });
  return vars;
}

export function getCssText(theme: SynapseThemeType, prefix = 'synapse') {
  const vars = toCssVars(theme, prefix);
  const body = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `:root {\n${body}\n}`;
}

export function applyTheme(theme: SynapseThemeType, prefix = 'synapse', root?: HTMLElement) {
  if (typeof document === 'undefined') return; // SSR-safe
  const el = root ?? document.documentElement;
  const vars = toCssVars(theme, prefix);
  Object.entries(vars).forEach(([name, value]) => el.style.setProperty(name, value));
  el.setAttribute('data-theme', prefix);
}

export default SynapseTheme;