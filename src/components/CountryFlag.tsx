import React from 'react';

interface CountryFlagProps {
  code?: string;
  country?: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

const SIZE_CLASSES: Record<'xs' | 'sm' | 'md', string> = {
  xs: 'w-3.5 h-[10px]',
  sm: 'w-4 h-[11px]',
  md: 'w-5 h-[14px]',
};

function renderFlagGraphics(code: string): React.ReactNode {
  switch (code) {
    case 'BR':
      return (
        <>
          <rect width="24" height="16" fill="#009C3B" />
          <polygon points="12,2 21,8 12,14 3,8" fill="#FFDF00" />
          <circle cx="12" cy="8" r="3.2" fill="#002776" />
          <path d="M9.1 7.6 Q12 8.7 14.9 7.8" stroke="#FFFFFF" strokeWidth="0.7" fill="none" />
        </>
      );
    case 'US':
      return (
        <>
          <rect width="24" height="16" fill="#FFFFFF" />
          <rect y="0" width="24" height="2.3" fill="#B22234" />
          <rect y="4.6" width="24" height="2.3" fill="#B22234" />
          <rect y="9.2" width="24" height="2.3" fill="#B22234" />
          <rect y="13.7" width="24" height="2.3" fill="#B22234" />
          <rect width="10.5" height="9.2" fill="#3C3B6E" />
          <circle cx="2.6" cy="2.3" r="0.65" fill="#FFFFFF" />
          <circle cx="5.2" cy="2.3" r="0.65" fill="#FFFFFF" />
          <circle cx="7.8" cy="2.3" r="0.65" fill="#FFFFFF" />
          <circle cx="3.9" cy="4.6" r="0.65" fill="#FFFFFF" />
          <circle cx="6.5" cy="4.6" r="0.65" fill="#FFFFFF" />
          <circle cx="2.6" cy="6.9" r="0.65" fill="#FFFFFF" />
          <circle cx="5.2" cy="6.9" r="0.65" fill="#FFFFFF" />
          <circle cx="7.8" cy="6.9" r="0.65" fill="#FFFFFF" />
        </>
      );
    case 'CA':
      return (
        <>
          <rect width="24" height="16" fill="#FFFFFF" />
          <rect width="6" height="16" fill="#D80621" />
          <rect x="18" width="6" height="16" fill="#D80621" />
          <polygon points="12,3.4 13.4,6.4 15.8,6.2 14,8.6 14.8,10.5 12.4,9.8 12.4,12.8 11.6,12.8 11.6,9.8 9.2,10.5 10,8.6 8.2,6.2 10.6,6.4" fill="#D80621" />
        </>
      );
    case 'AR':
      return (
        <>
          <rect width="24" height="16" fill="#74ACDF" />
          <rect y="5.3" width="24" height="5.4" fill="#FFFFFF" />
          <circle cx="12" cy="8" r="1.7" fill="#F6B40E" />
        </>
      );
    case 'CL':
      return (
        <>
          <rect width="24" height="8" fill="#FFFFFF" />
          <rect y="8" width="24" height="8" fill="#D52B1E" />
          <rect width="9" height="8" fill="#0039A6" />
          <circle cx="4.5" cy="4" r="1.5" fill="#FFFFFF" />
        </>
      );
    case 'CO':
      return (
        <>
          <rect width="24" height="8" fill="#FCD116" />
          <rect y="8" width="24" height="4" fill="#003893" />
          <rect y="12" width="24" height="4" fill="#CE1126" />
        </>
      );
    case 'KR':
      return (
        <>
          <rect width="24" height="16" fill="#FFFFFF" />
          <circle cx="12" cy="8" r="3.4" fill="#CD2E3A" />
          <path d="M8.6 8 A3.4 3.4 0 0 0 15.4 8 A1.7 1.7 0 0 1 12 8 A1.7 1.7 0 0 0 8.6 8 Z" fill="#0047A0" />
          <line x1="4.5" y1="3.5" x2="6.8" y2="2" stroke="#111827" strokeWidth="1.2" />
          <line x1="17.2" y1="2" x2="19.5" y2="3.5" stroke="#111827" strokeWidth="1.2" />
          <line x1="4.5" y1="12.5" x2="6.8" y2="14" stroke="#111827" strokeWidth="1.2" />
          <line x1="17.2" y1="14" x2="19.5" y2="12.5" stroke="#111827" strokeWidth="1.2" />
        </>
      );
    case 'JP':
      return (
        <>
          <rect width="24" height="16" fill="#FFFFFF" />
          <circle cx="12" cy="8" r="4" fill="#BC002D" />
        </>
      );
    case 'CN':
      return (
        <>
          <rect width="24" height="16" fill="#DE2910" />
          <circle cx="5.2" cy="4.8" r="1.7" fill="#FFDE00" />
          <circle cx="8.8" cy="2.6" r="0.65" fill="#FFDE00" />
          <circle cx="9.8" cy="4.4" r="0.65" fill="#FFDE00" />
          <circle cx="9.4" cy="6.4" r="0.65" fill="#FFDE00" />
          <circle cx="7.8" cy="7.6" r="0.65" fill="#FFDE00" />
        </>
      );
    case 'HK':
      return (
        <>
          <rect width="24" height="16" fill="#DE2910" />
          <circle cx="12" cy="8" r="2.8" fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeDasharray="1.8 1.1" />
          <circle cx="12" cy="8" r="0.9" fill="#FFFFFF" />
        </>
      );
    case 'TW':
      return (
        <>
          <rect width="24" height="16" fill="#FE0000" />
          <rect width="12" height="8" fill="#000095" />
          <circle cx="6" cy="4" r="2.1" fill="#FFFFFF" />
        </>
      );
    case 'TR':
      return (
        <>
          <rect width="24" height="16" fill="#E30A17" />
          <circle cx="9.2" cy="8" r="3.4" fill="#FFFFFF" />
          <circle cx="10.4" cy="8" r="2.7" fill="#E30A17" />
          <circle cx="14.2" cy="8" r="1.15" fill="#FFFFFF" />
        </>
      );
    case 'RU':
      return (
        <>
          <rect width="24" height="5.3" fill="#FFFFFF" />
          <rect y="5.3" width="24" height="5.4" fill="#0039A6" />
          <rect y="10.7" width="24" height="5.3" fill="#D52B1E" />
        </>
      );
    case 'UA':
      return (
        <>
          <rect width="24" height="8" fill="#0057B7" />
          <rect y="8" width="24" height="8" fill="#FFD700" />
        </>
      );
    case 'GB':
      return (
        <>
          <rect width="24" height="16" fill="#012169" />
          <line x1="0" y1="0" x2="24" y2="16" stroke="#FFFFFF" strokeWidth="2.8" />
          <line x1="24" y1="0" x2="0" y2="16" stroke="#FFFFFF" strokeWidth="2.8" />
          <line x1="0" y1="0" x2="24" y2="16" stroke="#C8102E" strokeWidth="1.2" />
          <line x1="24" y1="0" x2="0" y2="16" stroke="#C8102E" strokeWidth="1.2" />
          <rect x="9.8" width="4.4" height="16" fill="#FFFFFF" />
          <rect y="5.8" width="24" height="4.4" fill="#FFFFFF" />
          <rect x="10.8" width="2.4" height="16" fill="#C8102E" />
          <rect y="6.8" width="24" height="2.4" fill="#C8102E" />
        </>
      );
    case 'FR':
      return (
        <>
          <rect width="8" height="16" fill="#002395" />
          <rect x="8" width="8" height="16" fill="#FFFFFF" />
          <rect x="16" width="8" height="16" fill="#ED2939" />
        </>
      );
    case 'BE':
      return (
        <>
          <rect width="8" height="16" fill="#111827" />
          <rect x="8" width="8" height="16" fill="#FAE042" />
          <rect x="16" width="8" height="16" fill="#ED2939" />
        </>
      );
    case 'ES':
      return (
        <>
          <rect width="24" height="4" fill="#AA151B" />
          <rect y="4" width="24" height="8" fill="#F1BF00" />
          <rect y="12" width="24" height="4" fill="#AA151B" />
          <rect x="6" y="6.2" width="2.2" height="3.6" rx="0.6" fill="#AA151B" />
        </>
      );
    case 'PT':
      return (
        <>
          <rect width="9.6" height="16" fill="#006600" />
          <rect x="9.6" width="14.4" height="16" fill="#FF0000" />
          <circle cx="9.6" cy="8" r="2.7" fill="#FFCC00" />
          <circle cx="9.6" cy="8" r="1.4" fill="#FFFFFF" />
        </>
      );
    case 'NL':
      return (
        <>
          <rect width="24" height="5.3" fill="#AE1C28" />
          <rect y="5.3" width="24" height="5.4" fill="#FFFFFF" />
          <rect y="10.7" width="24" height="5.3" fill="#21468B" />
        </>
      );
    case 'FI':
      return (
        <>
          <rect width="24" height="16" fill="#FFFFFF" />
          <rect x="6.5" width="3.8" height="16" fill="#003580" />
          <rect y="6" width="24" height="3.8" fill="#003580" />
        </>
      );
    case 'SE':
      return (
        <>
          <rect width="24" height="16" fill="#006AA7" />
          <rect x="6.8" width="3.4" height="16" fill="#FECC02" />
          <rect y="6.2" width="24" height="3.4" fill="#FECC02" />
        </>
      );
    case 'NO':
      return (
        <>
          <rect width="24" height="16" fill="#BA0C2F" />
          <rect x="6" width="4.4" height="16" fill="#FFFFFF" />
          <rect y="5.8" width="24" height="4.4" fill="#FFFFFF" />
          <rect x="7" width="2.4" height="16" fill="#00205B" />
          <rect y="6.8" width="24" height="2.4" fill="#00205B" />
        </>
      );
    case 'PL':
      return (
        <>
          <rect width="24" height="8" fill="#FFFFFF" />
          <rect y="8" width="24" height="8" fill="#DC143C" />
        </>
      );
    case 'CZ':
      return (
        <>
          <rect width="24" height="8" fill="#FFFFFF" />
          <rect y="8" width="24" height="8" fill="#D7141A" />
          <polygon points="0,0 11,8 0,16" fill="#11457E" />
        </>
      );
    case 'LT':
      return (
        <>
          <rect width="24" height="5.3" fill="#FDB913" />
          <rect y="5.3" width="24" height="5.4" fill="#006A44" />
          <rect y="10.7" width="24" height="5.3" fill="#C1272D" />
        </>
      );
    case 'LV':
      return (
        <>
          <rect width="24" height="16" fill="#9E3039" />
          <rect y="6.2" width="24" height="3.6" fill="#FFFFFF" />
        </>
      );
    case 'MA':
      return (
        <>
          <rect width="24" height="16" fill="#C1272D" />
          <polygon points="12,4.4 13.1,7.3 16,7.3 13.7,9.1 14.5,11.9 12,10.2 9.5,11.9 10.3,9.1 8,7.3 10.9,7.3" fill="none" stroke="#006233" strokeWidth="1.1" />
        </>
      );
    case 'MK':
      return (
        <>
          <rect width="24" height="16" fill="#D20000" />
          <line x1="0" y1="0" x2="24" y2="16" stroke="#FFE600" strokeWidth="1.6" />
          <line x1="24" y1="0" x2="0" y2="16" stroke="#FFE600" strokeWidth="1.6" />
          <line x1="12" y1="0" x2="12" y2="16" stroke="#FFE600" strokeWidth="1.6" />
          <line x1="0" y1="8" x2="24" y2="8" stroke="#FFE600" strokeWidth="1.6" />
          <circle cx="12" cy="8" r="2.7" fill="#FFE600" stroke="#D20000" strokeWidth="0.9" />
        </>
      );
    case 'AU':
      return (
        <>
          <rect width="24" height="16" fill="#012169" />
          <rect width="10" height="8" fill="#012169" />
          <line x1="0" y1="0" x2="10" y2="8" stroke="#FFFFFF" strokeWidth="1.3" />
          <line x1="10" y1="0" x2="0" y2="8" stroke="#FFFFFF" strokeWidth="1.3" />
          <rect x="4.1" width="1.8" height="8" fill="#FFFFFF" />
          <rect y="3.1" width="10" height="1.8" fill="#FFFFFF" />
          <rect x="4.5" width="1" height="8" fill="#C8102E" />
          <rect y="3.5" width="10" height="1" fill="#C8102E" />
          <circle cx="5" cy="11.8" r="1.1" fill="#FFFFFF" />
          <circle cx="17.5" cy="4.2" r="0.8" fill="#FFFFFF" />
          <circle cx="19.8" cy="7.5" r="0.8" fill="#FFFFFF" />
          <circle cx="15.8" cy="8.5" r="0.8" fill="#FFFFFF" />
          <circle cx="17.8" cy="12" r="0.9" fill="#FFFFFF" />
        </>
      );
    case 'ID':
      return (
        <>
          <rect width="24" height="8" fill="#CE1126" />
          <rect y="8" width="24" height="8" fill="#FFFFFF" />
        </>
      );
    case 'TH':
      return (
        <>
          <rect width="24" height="16" fill="#A51931" />
          <rect y="2.7" width="24" height="10.6" fill="#F4F5F8" />
          <rect y="5.3" width="24" height="5.4" fill="#2D2A4A" />
        </>
      );
    case 'SG':
      return (
        <>
          <rect width="24" height="8" fill="#EF3340" />
          <rect y="8" width="24" height="8" fill="#FFFFFF" />
          <circle cx="5.2" cy="4" r="2.2" fill="#FFFFFF" />
          <circle cx="6.2" cy="4" r="1.9" fill="#EF3340" />
          <circle cx="7.4" cy="3.2" r="0.45" fill="#FFFFFF" />
          <circle cx="7.4" cy="4.8" r="0.45" fill="#FFFFFF" />
        </>
      );
    case 'MY':
      return (
        <>
          <rect width="24" height="16" fill="#FFFFFF" />
          <rect y="0" width="24" height="2.3" fill="#CC0001" />
          <rect y="4.6" width="24" height="2.3" fill="#CC0001" />
          <rect y="9.2" width="24" height="2.3" fill="#CC0001" />
          <rect y="13.7" width="24" height="2.3" fill="#CC0001" />
          <rect width="11.5" height="9.2" fill="#010066" />
          <circle cx="4.8" cy="4.6" r="2.1" fill="#FFCC00" />
          <circle cx="5.7" cy="4.6" r="1.7" fill="#010066" />
          <circle cx="7.5" cy="4.6" r="0.9" fill="#FFCC00" />
        </>
      );
    case 'PH':
      return (
        <>
          <rect width="24" height="8" fill="#0038A8" />
          <rect y="8" width="24" height="8" fill="#CE1126" />
          <polygon points="0,0 11,8 0,16" fill="#FFFFFF" />
          <circle cx="4" cy="8" r="1.8" fill="#FCD116" />
        </>
      );
    case 'KH':
      return (
        <>
          <rect width="24" height="16" fill="#032EA1" />
          <rect y="4" width="24" height="8" fill="#E00025" />
          <path d="M8 11 V8.2 H9.5 V6.8 H11.2 V5.5 H12.8 V6.8 H14.5 V8.2 H16 V11 Z" fill="#FFFFFF" />
        </>
      );
    case 'KZ':
      return (
        <>
          <rect width="24" height="16" fill="#00AFCA" />
          <rect x="2" y="1.5" width="1.6" height="13" fill="#FEC50C" />
          <circle cx="13" cy="8" r="2.8" fill="#FEC50C" />
        </>
      );
    default:
      return (
        <>
          <rect width="24" height="16" fill="#1e293b" />
          <text
            x="12"
            y="10.8"
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize="7"
            fontFamily="monospace"
            fontWeight="700"
          >
            {(code || '--').slice(0, 2).toUpperCase()}
          </text>
        </>
      );
  }
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  code = '',
  country,
  size = 'sm',
  className = '',
}) => {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-[2px] overflow-hidden border border-white/20 shadow-xs shrink-0 ${SIZE_CLASSES[size]} ${className}`}
      title={country || normalized}
      aria-label={country || normalized}
    >
      <svg viewBox="0 0 24 16" className="w-full h-full block" aria-hidden="true">
        {renderFlagGraphics(normalized)}
      </svg>
    </span>
  );
};
