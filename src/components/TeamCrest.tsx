import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Flame, Crown, Swords, Crosshair, Zap, Dices, X, Check, Search } from 'lucide-react';
import { CustomEmblemId, UserTeamIdentity } from '../types';
import { TEAM_REAL_LOGOS, getTeamLogoData } from '../data/teamLogos';
import { playSelectSound } from '../utils/audio';
import { TeamLogo } from './TeamLogo';
import { Card, PrimaryButton, SecondaryButton } from './ui';

export const DEFAULT_TEAM_IDENTITY: UserTeamIdentity = {
  name: 'SEU ELENCO',
  emblemId: 'shield',
  color: '#ff4655',
};

export const TEAM_EMBLEMS: { id: CustomEmblemId; label: string }[] = [
  { id: 'shield', label: 'Escudo' },
  { id: 'flame', label: 'Chama' },
  { id: 'crown', label: 'Coroa' },
  { id: 'sword', label: 'Lâminas' },
  { id: 'phoenix', label: 'Mira' },
  { id: 'bolt', label: 'Raio' },
];

export const TEAM_COLOR_SWATCHES: { color: string; label: string }[] = [
  { color: '#ff4655', label: 'Vermelho VCT' },
  { color: '#e2b714', label: 'Ouro Champions' },
  { color: '#38bdf8', label: 'Azul Celeste' },
  { color: '#10b981', label: 'Esmeralda' },
  { color: '#a855f7', label: 'Roxo Radiante' },
  { color: '#f97316', label: 'Laranja' },
];

export const SUGGESTED_TEAM_NAMES = [
  'BOMB SITE A',
  'ECO ROUND',
  'RETAKE FIVE',
  'SPIKE DOWN',
  'LAST CHANCE',
  'OVERDRIVE',
  'MAIN ENTRY',
  'CLUTCH LINE',
];

const SORTED_OFFICIAL_TEAM_LOGOS = Object.entries(TEAM_REAL_LOGOS)
  .map(([key, data]) => ({ key, ...data }))
  .sort((a, b) => a.name.localeCompare(b.name));

function renderEmblemGlyph(emblemId: CustomEmblemId, className: string, color: string) {
  const style = { color };
  switch (emblemId) {
    case 'flame':
      return <Flame className={className} style={style} />;
    case 'crown':
      return <Crown className={className} style={style} />;
    case 'sword':
      return <Swords className={className} style={style} />;
    case 'phoenix':
      return <Crosshair className={className} style={style} />;
    case 'bolt':
      return <Zap className={className} style={style} />;
    case 'shield':
    default:
      return <Shield className={className} style={style} />;
  }
}

interface TeamCrestProps {
  emblemId?: CustomEmblemId;
  color?: string;
  logoTeamKey?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const CREST_SIZES = {
  xs: { box: 'w-5 h-5 rounded-[2px]', icon: 'w-3 h-3', logoPad: 'p-0.5' },
  sm: { box: 'w-7 h-7 rounded-[3px]', icon: 'w-4 h-4', logoPad: 'p-0.5' },
  md: { box: 'w-10 h-10 rounded-[3px]', icon: 'w-5 h-5', logoPad: 'p-1' },
  lg: { box: 'w-12 h-12 rounded-[4px]', icon: 'w-6 h-6', logoPad: 'p-1.5' },
};

export const TeamCrest: React.FC<TeamCrestProps> = ({
  emblemId = 'shield',
  color = '#ff4655',
  logoTeamKey,
  size = 'md',
  className = '',
}) => {
  const dim = CREST_SIZES[size];
  const resolvedLogo = logoTeamKey
    ? TEAM_REAL_LOGOS[logoTeamKey] || getTeamLogoData(logoTeamKey)
    : null;

  return (
    <span
      className={`inline-flex items-center justify-center border shrink-0 overflow-hidden ${dim.box} ${
        resolvedLogo ? dim.logoPad : ''
      } ${className}`}
      style={{
        background: `radial-gradient(circle at 50% 30%, ${color}33 0%, #0d1118 85%)`,
        borderColor: `${color}66`,
        boxShadow: `0 0 12px -4px ${color}66`,
      }}
      aria-hidden={!resolvedLogo}
    >
      {resolvedLogo ? (
        <TeamLogo
          teamName={resolvedLogo.name}
          shortName={resolvedLogo.shortName}
          logoUrl={resolvedLogo.logoUrl}
          primaryColor={resolvedLogo.primaryColor}
          size={size}
          className="w-full h-full"
        />
      ) : (
        renderEmblemGlyph(emblemId, dim.icon, color)
      )}
    </span>
  );
};

interface TeamIdentityModalProps {
  identity: UserTeamIdentity;
  onSave: (next: UserTeamIdentity) => void;
  onClose: () => void;
}

export const TeamIdentityModal: React.FC<TeamIdentityModalProps> = ({
  identity,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(identity.name);
  const [emblemId, setEmblemId] = useState<CustomEmblemId>(identity.emblemId);
  const [color, setColor] = useState(identity.color);
  const [logoTeamKey, setLogoTeamKey] = useState<string | undefined>(identity.logoTeamKey);
  const [crestMode, setCrestMode] = useState<'teams' | 'icons'>(
    identity.logoTeamKey ? 'teams' : 'teams'
  );
  const [teamSearch, setTeamSearch] = useState('');

  useEffect(() => {
    setName(identity.name);
    setEmblemId(identity.emblemId);
    setColor(identity.color);
    setLogoTeamKey(identity.logoTeamKey);
  }, [identity]);

  const selectedOfficialTeam = logoTeamKey ? TEAM_REAL_LOGOS[logoTeamKey] || null : null;

  const filteredTeams = useMemo(() => {
    const q = teamSearch.trim().toLowerCase();
    if (!q) return SORTED_OFFICIAL_TEAM_LOGOS;
    return SORTED_OFFICIAL_TEAM_LOGOS.filter(
      t =>
        t.name.toLowerCase().includes(q) ||
        t.shortName.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [teamSearch]);

  const handleRandomSuggestion = () => {
    playSelectSound();
    const candidates = SUGGESTED_TEAM_NAMES.filter(n => n !== name);
    const randomName =
      candidates[Math.floor(Math.random() * candidates.length)] || SUGGESTED_TEAM_NAMES[0];
    const randomEmblem = TEAM_EMBLEMS[Math.floor(Math.random() * TEAM_EMBLEMS.length)].id;
    const randomColor =
      TEAM_COLOR_SWATCHES[Math.floor(Math.random() * TEAM_COLOR_SWATCHES.length)].color;
    setName(randomName);
    setEmblemId(randomEmblem);
    setColor(randomColor);
    setLogoTeamKey(undefined);
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    playSelectSound();
    const trimmed = name.trim().slice(0, 18);
    onSave({
      name: trimmed.length > 0 ? trimmed.toUpperCase() : DEFAULT_TEAM_IDENTITY.name,
      emblemId,
      color,
      logoTeamKey,
    });
    onClose();
  };

  return (
    <div
      id="team-identity-modal"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-identity-title"
    >
      <Card variant="modal" padding="lg" cutCorner className="w-full max-w-lg relative animate-popIn">
        <button
          type="button"
          onClick={() => {
            playSelectSound();
            onClose();
          }}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-[3px] text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <TeamCrest
            emblemId={emblemId}
            color={color}
            logoTeamKey={logoTeamKey}
            size="lg"
          />
          <div className="min-w-0">
            <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-[#e2b714] block">
              Identidade da Equipe
            </span>
            <h3
              id="team-identity-title"
              className="font-display text-2xl sm:text-3xl leading-none text-white uppercase tracking-wide truncate"
            >
              {name.trim() ? name.toUpperCase() : DEFAULT_TEAM_IDENTITY.name}
            </h3>
            {selectedOfficialTeam && (
              <span className="font-mono-vct text-[11px] text-slate-300 block mt-0.5">
                Escudo selecionado: {selectedOfficialTeam.name}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label
                htmlFor="team-name-input"
                className="font-mono-vct text-xs font-bold uppercase tracking-wider text-slate-200"
              >
                Nome do time (opcional)
              </label>
              <button
                type="button"
                onClick={handleRandomSuggestion}
                className="inline-flex items-center gap-1 text-xs font-mono-vct font-semibold text-[#e2b714] hover:text-amber-200 cursor-pointer"
              >
                <Dices className="w-3.5 h-3.5" />
                Sugerir aleatório
              </button>
            </div>
            <input
              id="team-name-input"
              type="text"
              maxLength={18}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: TEAM MAYHEM"
              className="w-full px-3 py-2 rounded-[3px] bg-[#090c11] border border-white/15 focus:border-[#ff4655] outline-none text-sm font-bold text-white uppercase tracking-wider"
            />
            {selectedOfficialTeam &&
              name.trim().toUpperCase() !== selectedOfficialTeam.name.slice(0, 18).toUpperCase() && (
                <button
                  type="button"
                  onClick={() => {
                    playSelectSound();
                    setName(selectedOfficialTeam.name.slice(0, 18).toUpperCase());
                  }}
                  className="mt-1.5 text-[11px] font-mono-vct text-[#38bdf8] hover:text-sky-300 underline underline-offset-2 cursor-pointer"
                >
                  Usar também o nome "{selectedOfficialTeam.name}"
                </button>
              )}
          </div>

          {/* Crest Picker Tabs: Official Team Photos (47) vs Custom Icons */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-slate-200">
                Foto / Escudo do Time
              </span>
              <div className="flex items-center gap-1 bg-[#070a10] p-0.5 rounded-[3px] border border-white/10 font-mono-vct text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    playSelectSound();
                    setCrestMode('teams');
                  }}
                  className={`px-2 py-1 rounded-[2px] font-bold uppercase transition-colors cursor-pointer ${
                    crestMode === 'teams'
                      ? 'bg-[#ff4655] text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Times ({SORTED_OFFICIAL_TEAM_LOGOS.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSelectSound();
                    setCrestMode('icons');
                  }}
                  className={`px-2 py-1 rounded-[2px] font-bold uppercase transition-colors cursor-pointer ${
                    crestMode === 'icons'
                      ? 'bg-[#ff4655] text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Ícones
                </button>
              </div>
            </div>

            {crestMode === 'teams' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="team-logo-search-input"
                      type="text"
                      value={teamSearch}
                      onChange={e => setTeamSearch(e.target.value)}
                      placeholder="Buscar time (ex: LOUD, Sentinels, Fnatic, Cloud9)..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-[3px] bg-[#090c11] border border-white/12 focus:border-[#ff4655] outline-none text-xs text-white placeholder:text-slate-400"
                    />
                  </div>
                  {logoTeamKey && (
                    <button
                      type="button"
                      onClick={() => {
                        playSelectSound();
                        setLogoTeamKey(undefined);
                      }}
                      className="px-2 py-1.5 rounded-[3px] bg-[#0b0e14] border border-white/15 hover:border-white/35 text-[11px] font-mono-vct text-slate-300 hover:text-white shrink-0 cursor-pointer"
                    >
                      Limpar foto
                    </button>
                  )}
                </div>

                <div className="max-h-48 overflow-y-auto pr-1 grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                  {filteredTeams.map(team => {
                    const active = logoTeamKey === team.key;
                    return (
                      <button
                        key={team.key}
                        type="button"
                        onClick={() => {
                          playSelectSound();
                          setLogoTeamKey(team.key);
                          setColor(team.primaryColor);
                        }}
                        title={`${team.name} (${team.category})`}
                        className={`p-1.5 rounded-[3px] border flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#182131] border-[#ff4655]'
                            : 'bg-[#090c11] border-white/10 hover:border-white/30 hover:bg-[#111622]'
                        }`}
                      >
                        <TeamLogo
                          teamName={team.name}
                          shortName={team.shortName}
                          logoUrl={team.logoUrl}
                          primaryColor={team.primaryColor}
                          size="sm"
                        />
                        <span className="font-mono-vct text-[9px] font-bold uppercase text-slate-200 truncate max-w-full leading-none">
                          {team.shortName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-2">
                {TEAM_EMBLEMS.map(item => {
                  const active = !logoTeamKey && emblemId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        playSelectSound();
                        setLogoTeamKey(undefined);
                        setEmblemId(item.id);
                      }}
                      title={item.label}
                      aria-label={item.label}
                      className={`p-2 rounded-[3px] border flex items-center justify-center transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#1a2230] border-white/50'
                          : 'bg-[#0b0e14] border-white/10 hover:border-white/30'
                      }`}
                    >
                      {renderEmblemGlyph(item.id, 'w-5 h-5', active ? color : '#cbd5e1')}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-slate-200 block mb-1.5">
              Cor de destaque
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {TEAM_COLOR_SWATCHES.map(swatch => {
                const active = color.toLowerCase() === swatch.color.toLowerCase();
                return (
                  <button
                    key={swatch.color}
                    type="button"
                    onClick={() => {
                      playSelectSound();
                      setColor(swatch.color);
                    }}
                    title={swatch.label}
                    aria-label={swatch.label}
                    className={`w-8 h-8 rounded-[3px] border flex items-center justify-center transition-transform cursor-pointer ${
                      active ? 'scale-105 border-white' : 'border-white/15 hover:scale-105'
                    }`}
                    style={{ backgroundColor: swatch.color }}
                  >
                    {active && <Check className="w-4 h-4 text-[#0b0e14] stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <SecondaryButton
              type="button"
              size="sm"
              onClick={() => {
                playSelectSound();
                onClose();
              }}
            >
              Cancelar
            </SecondaryButton>
            <PrimaryButton id="save-team-identity-btn" type="submit" size="sm">
              <Check className="w-4 h-4" />
              Salvar time
            </PrimaryButton>
          </div>
        </form>
      </Card>
    </div>
  );
};
