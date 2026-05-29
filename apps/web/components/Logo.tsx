import React from "react";

interface SynapseOSLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const Logo: React.FC<SynapseOSLogoProps> = ({
  width = 600,
  height = 220,
  className,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 600 220"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="SynapseOS — Agentic Workspace"
    >
      <title>SynapseOS — Logo</title>
      <desc>Transparent horizontal SynapseOS logo with organic honeycomb icon and wordmark</desc>

      {/* ── ICON center at 108,110 ── */}

      {/* Ring 2 partial — Indigo Glow */}
      <polygon points="108,44  127,55  127,77  108,88  89,77   89,55"   fill="#6366F1" opacity="0.20" />
      <polygon points="146,66  165,77  165,99  146,110 127,99  127,77"  fill="#6366F1" opacity="0.17" />
      <polygon points="146,110 165,121 165,143 146,154 127,143 127,121" fill="#6366F1" opacity="0.17" />
      <polygon points="108,132 127,143 127,165 108,176 89,165  89,143"  fill="#6366F1" opacity="0.20" />
      <polygon points="70,110  89,121  89,143  70,154  51,143  51,121"  fill="#6366F1" opacity="0.17" />
      <polygon points="70,66   89,77   89,99   70,110  51,99   51,77"   fill="#6366F1" opacity="0.17" />

      {/* Stray organic cells */}
      <polygon points="32,88   51,99   51,121  32,132  13,121  13,99"   fill="#3B82F6" opacity="0.12" />
      <polygon points="184,88  203,99  203,121 184,132 165,121 165,99"  fill="#3B82F6" opacity="0.12" />

      {/* Ring 1 — Electric Blue */}
      <polygon points="108,66  127,77  127,99  108,110 89,99   89,77"   fill="#3B82F6" opacity="0.72" />
      <polygon points="146,88  165,99  165,121 146,132 127,121 127,99"  fill="#3B82F6" opacity="0.68" />
      <polygon points="146,132 165,143 165,165 146,176 127,165 127,143" fill="#3B82F6" opacity="0.63" />
      <polygon points="108,154 127,165 127,187 108,198 89,187  89,165"  fill="#3B82F6" opacity="0.58" />
      <polygon points="70,132  89,143  89,165  70,176  51,165  51,143"  fill="#3B82F6" opacity="0.63" />
      <polygon points="70,88   89,99   89,121  70,132  51,121  51,99"   fill="#3B82F6" opacity="0.68" />

      {/* Ring 1 borders */}
      <polygon points="108,66  127,77  127,99  108,110 89,99   89,77"   fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
      <polygon points="146,88  165,99  165,121 146,132 127,121 127,99"  fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
      <polygon points="146,132 165,143 165,165 146,176 127,165 127,143" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
      <polygon points="108,154 127,165 127,187 108,198 89,187  89,165"  fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
      <polygon points="70,132  89,143  89,165  70,176  51,165  51,143"  fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
      <polygon points="70,88   89,99   89,121  70,132  51,121  51,99"   fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />

      {/* Center cell — AI Purple */}
      <polygon points="108,88  127,99  127,121 108,132 89,121  89,99"   fill="#8B5CF6" opacity="0.97" />
      <polygon points="108,88  127,99  127,121 108,132 89,121  89,99"   fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.9" />

      {/* Live Accent (Cyan) signal dot */}
      <circle cx="108" cy="110" r="5" fill="#22D3EE" opacity="0.95" />
      <circle cx="108" cy="110" r="2" fill="currentColor" />

      {/* ── WORDMARK ── */}
      <text
        x="228" y="98"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="38"
        fontWeight="600"
        fill="currentColor"
      >
        Synapse
        <tspan fontWeight="200" fill="#22D3EE">OS</tspan>
      </text>

      {/* Deep-canvas adaptive tracking line separator */}
      <line x1="228" y1="112" x2="578" y2="112" stroke="currentColor" opacity="0.08" strokeWidth="0.75" />

      {/* Tagline */}
      <text
        x="230" y="132"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="9.5"
        fontWeight="500"
        letterSpacing="4"
        fill="currentColor"
        opacity="0.6"
      >
        AGENTIC WORKSPACE
      </text>
    </svg>
  );
};

export default Logo;