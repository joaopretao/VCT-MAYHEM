import React, { useState } from 'react';
import { X, Shield, Sparkles, Trophy, Users, ShieldAlert, Volume2, Play } from 'lucide-react';
import {
  playSelectSound,
  playLockSound,
  playRerollSound,
  playHoverSound,
  playRoundWinSound,
  playRoundLossSound,
  playRosterCompleteSound,
  playVictoryFanfare,
  playEliminationSound,
} from '../utils/audio';
import { Card, PrimaryButton, SecondaryButton, Badge } from './ui';

interface RulesModalProps {
  onClose: () => void;
}

const SOUND_TESTS = [
  { id: 'select', label: 'Selecionar / Clique', desc: 'Toque de cristal (2 notas)', play: playSelectSound },
  { id: 'lock', label: 'Confirmar no Lobby', desc: 'Acorde curto de confirmação', play: playLockSound },
  { id: 'reroll', label: 'Reroll', desc: 'Arpejo pentatônico ascendente', play: playRerollSound },
  { id: 'hover', label: 'Hover (Discreto)', desc: 'Tick suave quase inaudível', play: playHoverSound },
  { id: 'win', label: 'Rodada / Mapa Vencido', desc: 'Sino em acorde maior (C5–C6)', play: playRoundWinSound },
  { id: 'loss', label: 'Rodada / Mapa Perdido', desc: '2 notas descendentes quentes', play: playRoundLossSound },
  { id: 'complete', label: 'Elenco Completo (5/5)', desc: 'Arpejo Cmaj9 com reverb', play: playRosterCompleteSound },
  { id: 'victory', label: 'Campeão / Vitória', desc: 'Progressão elegante (~2 s)', play: playVictoryFanfare },
  { id: 'elimination', label: 'Derrota / Eliminação', desc: 'Acorde grave suave e resolvido', play: playEliminationSound },
];

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  const [showSoundTester, setShowSoundTester] = useState<boolean>(true);
  const [lastPlayedId, setLastPlayedId] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <Card padding="lg" className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto text-white animate-popIn">
        {/* Close Button */}
        <button
          onClick={() => {
            playSelectSound();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-xl bg-[#ff4655]/15 border border-[#ff4655]/35 flex items-center justify-center text-[#ff4655] shrink-0 shadow-[0_0_16px_rgba(255,70,85,0.2)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono-vct font-bold text-[#e2b714] uppercase tracking-wider block">
              Guia &amp; Mecânicas
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold uppercase text-white tracking-wider">
              Como Funciona o VCT Mayhem
            </h3>
          </div>
        </div>

        {/* Temporary Sound Tester Panel */}
        <div className="mb-6 glass-film p-4 rounded-xl border border-white/15">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-[#38bdf8]" />
              <span className="font-mono-vct text-xs font-bold uppercase tracking-wider text-white">
                Painel de Teste de Sons (Temporário)
              </span>
              <Badge tone="cyan">Web Audio Sintetizado</Badge>
            </div>
            <SecondaryButton
              size="sm"
              onClick={() => setShowSoundTester(prev => !prev)}
            >
              {showSoundTester ? 'Ocultar testador' : 'Testar sons'}
            </SecondaryButton>
          </div>

          {showSoundTester && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SOUND_TESTS.map(s => {
                const isActive = lastPlayedId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setLastPlayedId(s.id);
                      s.play();
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-[#38bdf8]/15 border-[#38bdf8]/60 text-white'
                        : 'bg-black/30 hover:bg-white/[0.08] border-white/10 text-slate-200'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{s.label}</div>
                      <div className="text-xs text-slate-300 truncate">{s.desc}</div>
                    </div>
                    <Play className="w-3.5 h-3.5 text-[#38bdf8] shrink-0 fill-[#38bdf8]" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-300">
          {/* Rule 1 */}
          <div className="glass-film p-4">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm mb-1">
              <Users className="w-4 h-4 text-[#ff4655]" />
              1. Composição de 5 Funções
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Você deve escalar 5 atletas: <strong className="text-white">1 Duelista, 1 Controlador, 1 Iniciador, 1 Sentinela e 1 Flex</strong>. Cada atleta só pode ocupar funções registradas em seu perfil oficial do VCT Champions.
            </p>
          </div>

          {/* Rule 2 */}
          <div className="glass-film p-4">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm mb-1">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              2. Dificuldades &amp; Vetos de Adversários
            </h4>
            <div className="text-slate-300 leading-relaxed space-y-1">
              <div>
                <strong className="text-emerald-400">Modo Normal:</strong> 3 Rerolls de equipes, 0 vetos pelo adversário.
              </div>
              <div>
                <strong className="text-amber-400">Modo Difícil:</strong> 2 Rerolls de equipes, 3 atletas banidos.
              </div>
              <div>
                <strong className="text-rose-400">Modo Master:</strong> 1 Reroll de equipes, 6 atletas banidos.
              </div>
            </div>
          </div>

          {/* Rule 3 */}
          <div className="glass-film p-4">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              3. Sinergia de Equipe &amp; Química Real
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Escalar jogadores que atuaram juntos na mesma equipe histórica concede <strong className="text-emerald-300">+Química de Elenco</strong>, garantindo vantagens decisivas nos rounds de overtime e playoffs.
            </p>
          </div>

          {/* Rule 4 */}
          <div className="glass-film p-4">
            <h4 className="text-white font-bold flex items-center gap-2 text-sm mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              4. Simulação do Campeonato
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Após preencher os 5 atletas, inicie a campanha rumo ao troféu do VCT Champions! Acompanhe cada round com estatísticas detalhadas de Rating, ACS, K/D e MVP do confronto.
            </p>
          </div>
        </div>

        <PrimaryButton
          size="md"
          onClick={() => {
            playSelectSound();
            onClose();
          }}
          className="mt-6 w-full"
        >
          Entendido, Voltar ao Jogo
        </PrimaryButton>
      </Card>
    </div>
  );
};
