import React from 'react';

interface CountryFlagProps {
  code?: string;
  country?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<'xs' | 'sm' | 'md' | 'lg', string> = {
  xs: 'w-4 h-3',
  sm: 'w-5 h-3.5',
  md: 'w-6 h-4',
  lg: 'w-9 h-6',
};

const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  brasil: 'br',
  brazil: 'br',
  'estados unidos': 'us',
  eua: 'us',
  usa: 'us',
  'united states': 'us',
  canadá: 'ca',
  canada: 'ca',
  argentina: 'ar',
  chile: 'cl',
  colômbia: 'co',
  colombia: 'co',
  'coreia do sul': 'kr',
  'south korea': 'kr',
  korea: 'kr',
  japão: 'jp',
  japan: 'jp',
  china: 'cn',
  'hong kong': 'hk',
  taiwan: 'tw',
  indonésia: 'id',
  indonesia: 'id',
  tailândia: 'th',
  thailand: 'th',
  malásia: 'my',
  malaysia: 'my',
  singapura: 'sg',
  singapore: 'sg',
  filipinas: 'ph',
  philippines: 'ph',
  camboja: 'kh',
  cambodia: 'kh',
  austrália: 'au',
  australia: 'au',
  turquia: 'tr',
  turkey: 'tr',
  rússia: 'ru',
  russia: 'ru',
  ucrânia: 'ua',
  ukraine: 'ua',
  cazaquistão: 'kz',
  kazakhstan: 'kz',
  finlândia: 'fi',
  finlandia: 'fi',
  finland: 'fi',
  suécia: 'se',
  sweden: 'se',
  noruega: 'no',
  norway: 'no',
  'reino unido': 'gb',
  uk: 'gb',
  'united kingdom': 'gb',
  frança: 'fr',
  franca: 'fr',
  france: 'fr',
  espanha: 'es',
  spain: 'es',
  portugal: 'pt',
  polônia: 'pl',
  poland: 'pl',
  lituânia: 'lt',
  lithuania: 'lt',
  letônia: 'lv',
  latvia: 'lv',
  'países baixos': 'nl',
  holanda: 'nl',
  netherlands: 'nl',
  bélgica: 'be',
  belgium: 'be',
  'república tcheca': 'cz',
  czechia: 'cz',
  'macedônia do norte': 'mk',
  'north macedonia': 'mk',
  marrocos: 'ma',
  morocco: 'ma',
  alemanha: 'de',
  germany: 'de',
  dinamarca: 'dk',
  denmark: 'dk',
  itália: 'it',
  italy: 'it',
};

export function resolveCountryIso(code?: string, country?: string): string | null {
  if (code) {
    const clean = code.trim().toLowerCase();
    if (clean === 'uk') return 'gb';
    if (/^[a-z]{2}$/.test(clean)) return clean;
  }
  if (country) {
    const key = country.trim().toLowerCase();
    if (COUNTRY_NAME_TO_ISO[key]) return COUNTRY_NAME_TO_ISO[key];
  }
  return null;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  code,
  country,
  size = 'sm',
  className = '',
}) => {
  const iso = resolveCountryIso(code, country);
  const label = country || code || 'País';

  if (!iso) {
    return (
      <span
        title={label}
        className={`inline-flex items-center justify-center rounded-[2px] bg-[#161b24] border border-white/15 text-[9px] font-mono-vct font-bold text-slate-300 px-1 shrink-0 ${className}`}
      >
        {(code || country || '??').slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={`/flags/${iso}.svg`}
      alt={label}
      title={label}
      loading="lazy"
      className={`inline-block rounded-[2px] overflow-hidden border border-white/15 shrink-0 object-cover select-none ${SIZE_CLASSES[size]} ${className}`}
    />
  );
};
