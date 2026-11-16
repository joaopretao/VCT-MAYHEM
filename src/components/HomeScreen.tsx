import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Trophy, HelpCircle } from 'lucide-react';
import { Difficulty } from '../types';
import { Card, PrimaryButton, SecondaryButton } from './ui';
import { TeamLogo } from './TeamLogo';
import { playSelectSound, playHoverSound } from '../utils/audio';

type ModeTab = 'draft' | 'grid' | 'trivia' | 'history';

interface HomeScreenProps {
  difficulty: Difficulty;
  onDifficultyChange: (diff: Difficulty) => void;
  onSelectMode: (tab: ModeTab) => void;
  onOpenHelp: () => void;
  trophiesCount: number;
  totalCampaigns: number;
}

const FEATURED_CRESTS = [
  { name: 'LOUD', label: 'LOUD' },
  { name: 'Fnatic', label: 'Fnatic' },
  { name: 'Evil Geniuses', label: 'EG' },
  { name: 'EDward Gaming', label: 'EDG' },
  { name: 'NRG', label: 'NRG' },
  { name: 'Team Vitality', label: 'Vitality' },
];

const DIFFICULTY_OPTIONS: { id: Difficulty; label: string; hint: string; color: string; text: string }[] = [
  { id: 'normal', label: 'Normal', hint: '3 rerolls · Sem vetos', color: '#10b981', text: '#0b0e14' },
  { id: 'hard', label: 'Difícil', hint: '2 rerolls · 3 vetos', color: '#e2b714', text: '#0b0e14' },
  { id: 'master', label: 'Master', hint: '1 reroll · 6 vetos', color: '#ff4655', text: '#ffffff' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  difficulty,
  onDifficultyChange,
  onSelectMode,
  onOpenHelp,
  trophiesCount,
  totalCampaigns,
}) => {
  const activeDiff = DIFFICULTY_OPTIONS.find(d => d.id === difficulty) || DIFFICULTY_OPTIONS[0];

  return (
    <div className="flex-1 flex flex-col justify-center max-w-6xl w-full mx-auto py-3 sm:py-5 gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 px-0.5">
        <div className="flex items-center gap-3">
          <span className="vct-slash h-7" aria-hidden />
          <div>
            <span className="font-mono-vct text-xs font-bold uppercase tracking-widest text-slate-400 block">
              VCT 2022–2026
            </span>
            <h2 className="font-display text-3xl sm:text-4xl text-white uppercase tracking-wide leading-none">
              Escolha o modo
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalCampaigns > 0 && (
            <div className="surface-sub px-3 py-1.5 flex items-center gap-2 text-xs font-mono-vct text-slate-200">
              <Trophy className="w-3.5 h-3.5 text-[#e2b714]" />
              <span>
                {trophiesCount} {trophiesCount === 1 ? 'título' : 'títulos'} em {totalCampaigns}{' '}
                {totalCampaigns === 1 ? 'campanha' : 'campanhas'}
              </span>
            </div>
          )}
          <SecondaryButton
            id="home-help-btn"
            size="sm"
            onClick={() => {
              playSelectSound();
              onOpenHelp();
            }}
          >
            <HelpCircle className="w-4 h-4 text-slate-300" />
            <span>Como jogar</span>
          </SecondaryButton>
        </div>
      </div>

      {/* HERO SPOTLIGHT: MAYHEM */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        <Card
          padding="lg"
          cutCorner
          className="relative overflow-hidden border-[#ff4655]/35"
        >
          {/* Left tactical red bar */}
          <div className="absolute inset-y-0 left-0 w-1 bg-[#ff4655]" aria-hidden />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pl-1">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1.5">
                <span className="font-mono-vct text-xs font-bold uppercase tracking-widest text-[#ff4655] block">
                  Modo Principal
                </span>
                <h1 className="font-display text-5xl sm:text-6xl leading-[0.92] text-white uppercase tracking-wide">
                  CHAMPIONS MAYHEM
                </h1>
                <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                  Cinco picks, três times por rodada. Monta tua line com jogadores reais do VCT (2022–2026), busca química entre companheiros e tenta levar o caneco.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono-vct text-slate-300">
                <span>5 funções</span>
                <span className="text-slate-600">/</span>
                <span>Overall oculto na run</span>
                <span className="text-slate-600">/</span>
                <span>Grupos, playoffs e final MD5</span>
              </div>

              {/* Difficulty & Primary CTA */}
              <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3">
                <PrimaryButton
                  id="home-play-mayhem-btn"
                  size="lg"
                  onMouseEnter={() => playHoverSound()}
                  onClick={() => {
                    playSelectSound();
                    onSelectMode('draft');
                  }}
                  className="text-base px-8 py-3.5"
                >
                  <span>JOGAR MAYHEM</span>
                  <ArrowRight className="w-4 h-4" />
                </PrimaryButton>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1 p-1 rounded-[3px] bg-[#0b0e14] border border-white/10 w-fit">
                    {DIFFICULTY_OPTIONS.map(opt => {
                      const active = opt.id === difficulty;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            playSelectSound();
                            onDifficultyChange(opt.id);
                          }}
                          className={`px-3 py-1 rounded-[2px] font-mono-vct text-xs font-bold transition-colors cursor-pointer ${
                            active ? '' : 'text-slate-300 hover:text-white'
                          }`}
                          style={active ? { backgroundColor: opt.color, color: opt.text } : undefined}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-mono-vct text-slate-400 pl-0.5">
                    {activeDiff.hint}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Champion Crests Showcase */}
            <div className="lg:col-span-5">
              <div className="surface-sub p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono-vct">
                  <span className="text-slate-300 font-bold uppercase tracking-wider">
                    Campeões e elencos no pool
                  </span>
                  <span className="text-slate-400">+40 times</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {FEATURED_CRESTS.map(team => (
                    <div
                      key={team.name}
                      className="rounded-[3px] bg-[#11151d] border border-white/[0.07] p-2.5 flex flex-col items-center justify-center text-center gap-1.5"
                    >
                      <TeamLogo teamName={team.name} size="md" />
                      <span className="text-xs font-semibold text-slate-200 truncate max-w-full">
                        {team.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* SECONDARY MODES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          variant="interactive"
          padding="md"
          onMouseEnter={() => playHoverSound()}
          onClick={() => {
            playSelectSound();
            onSelectMode('grid');
          }}
          className="h-full flex flex-col justify-between gap-4 cursor-pointer hover:border-[#e2b714]/55"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono-vct">
              <span className="text-[#e2b714] font-bold uppercase tracking-wider">3×3</span>
              <span className="text-slate-400">5 tabuleiros</span>
            </div>
            <h3 className="font-display text-3xl leading-none text-white uppercase tracking-wide">
              GRID VCT
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Cruza camisas, janelas de transferência e nacionalidades sem dar um chute aleatório.
            </p>
          </div>

          <SecondaryButton id="home-play-grid-btn" size="sm" className="w-full justify-between">
            <span>Abrir Grid</span>
            <ArrowRight className="w-4 h-4 text-[#e2b714]" />
          </SecondaryButton>
        </Card>

        <Card
          variant="interactive"
          padding="md"
          onMouseEnter={() => playHoverSound()}
          onClick={() => {
            playSelectSound();
            onSelectMode('trivia');
          }}
          className="h-full flex flex-col justify-between gap-4 cursor-pointer hover:border-[#38bdf8]/55"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono-vct">
              <span className="text-[#38bdf8] font-bold uppercase tracking-wider">Diário</span>
              <span className="text-slate-400">8 chances</span>
            </div>
            <h3 className="font-display text-3xl leading-none text-white uppercase tracking-wide">
              TRIVIA DOS PROS
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Descobre o jogador misterioso pelas pistas de time, região, função e agente assinatura.
            </p>
          </div>

          <SecondaryButton id="home-play-trivia-btn" size="sm" className="w-full justify-between">
            <span>Jogar Trivia</span>
            <ArrowRight className="w-4 h-4 text-[#38bdf8]" />
          </SecondaryButton>
        </Card>

        <Card
          variant="interactive"
          padding="md"
          onMouseEnter={() => playHoverSound()}
          onClick={() => {
            playSelectSound();
            onSelectMode('history');
          }}
          className="h-full flex flex-col justify-between gap-4 cursor-pointer hover:border-[#10b981]/55"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono-vct">
              <span className="text-[#10b981] font-bold uppercase tracking-wider">Histórico</span>
              <span className="text-slate-400">
                {trophiesCount} {trophiesCount === 1 ? 'título' : 'títulos'}
              </span>
            </div>
            <h3 className="font-display text-3xl leading-none text-white uppercase tracking-wide">
              SALA DE TROFÉUS
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Teus campeões salvos, MVPs de cada campanha e conquistas desbloqueadas.
            </p>
          </div>

          <SecondaryButton id="home-open-history-btn" size="sm" className="w-full justify-between">
            <span>Ver Troféus</span>
            <ArrowRight className="w-4 h-4 text-[#10b981]" />
          </SecondaryButton>
        </Card>
      </div>
    </div>
  );
};
