import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar, TabId } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { AppBackground } from './components/AppBackground';
import { ValorantDraftBoard } from './components/ValorantDraftBoard';
import { PlayerModal } from './components/PlayerModal';
import { TournamentSimulation } from './components/TournamentSimulation';
import { TriviaMode } from './components/TriviaMode';
import { ValorantGridMode } from './components/ValorantGridMode';
import { TrophyRoomModal } from './components/TrophyRoomModal';
import { RulesModal } from './components/RulesModal';
import { OpponentBansModal } from './components/OpponentBansModal';
import { MayhemBonusModal } from './components/MayhemBonusModal';
import { Lineup, Role, Player, Team, Difficulty, CampaignHistory, MayhemBonus, PlayerRecords } from './types';
import { TEAMS_DATABASE } from './data/teamsAndPlayers';
import { assignTraitsToTeam } from './data/traits';
import { rollMayhemBonusChoices } from './data/mayhemBonuses';
import { rollOpponentBans, isPlayerBanned } from './utils/bans';
import { playLockSound, playSelectSound, playBonusRevealSound } from './utils/audio';
import {
  EMPTY_PLAYER_RECORDS,
  loadPlayerRecords,
  recordCampaignAndSave,
  clearPlayerRecords,
} from './utils/records';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabId>('home');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [pendingBansNotice, setPendingBansNotice] = useState<boolean>(false);
  const [lineup, setLineup] = useState<Lineup>({
    Duelist: null,
    Controller: null,
    Initiator: null,
    Sentinel: null,
    Flex: null,
  });

  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [rerollsLeft, setRerollsLeft] = useState<number>(3);
  const [isTournamentActive, setIsTournamentActive] = useState<boolean>(false);
  const [inspectedPlayer, setInspectedPlayer] = useState<Player | null>(null);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [campaignHistory, setCampaignHistory] = useState<CampaignHistory[]>([]);
  const [playerRecords, setPlayerRecords] = useState<PlayerRecords>(EMPTY_PLAYER_RECORDS);

  // Roguelike Mayhem Bonuses (max 2 per run: after pick 2 and pick 4)
  const [selectedBonuses, setSelectedBonuses] = useState<MayhemBonus[]>([]);
  const [pendingBonusChoices, setPendingBonusChoices] = useState<MayhemBonus[] | null>(null);
  const [bonusPromptStep, setBonusPromptStep] = useState<1 | 2>(1);

  // Opponent Ban System (Normal: 3 bans, Hard/Master: 6 bans)
  const [bannedPlayers, setBannedPlayers] = useState<Player[]>([]);
  const [showBansModal, setShowBansModal] = useState<boolean>(false);

  // Load campaign history and player records from localStorage
  useEffect(() => {
    let loadedCampaigns: CampaignHistory[] = [];
    try {
      const saved = localStorage.getItem('vct_mayhem_campaigns');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          loadedCampaigns = parsed;
          setCampaignHistory(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load campaigns history', e);
    }
    setPlayerRecords(loadPlayerRecords(loadedCampaigns));
  }, []);

  const drawThreeTeams = useCallback((excludeIds: string[] = []) => {
    const availablePool = TEAMS_DATABASE.filter(t => !excludeIds.includes(t.id));
    const pool = availablePool.length >= 3 ? availablePool : TEAMS_DATABASE;

    // Shuffle pool and roll traits for the rosters
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const withTraits = shuffled.slice(0, 3).map(team => assignTraitsToTeam(team));
    setAvailableTeams(withTraits);
  }, []);

  // Initialize a new draft run with rerolls and opponent bans
  const initializeDraftRun = useCallback((targetDifficulty: Difficulty, openBansNotification: boolean = true) => {
    setLineup({
      Duelist: null,
      Controller: null,
      Initiator: null,
      Sentinel: null,
      Flex: null,
    });
    setIsTournamentActive(false);
    setSelectedBonuses([]);
    setPendingBonusChoices(null);
    setBonusPromptStep(1);

    if (targetDifficulty === 'normal') setRerollsLeft(3);
    else if (targetDifficulty === 'hard') setRerollsLeft(2);
    else if (targetDifficulty === 'master') setRerollsLeft(1);

    const bans = rollOpponentBans(targetDifficulty);
    setBannedPlayers(bans);
    if (bans.length > 0 && openBansNotification) {
      setShowBansModal(true);
      setPendingBansNotice(false);
    } else if (bans.length > 0) {
      setPendingBansNotice(true);
    } else {
      setPendingBansNotice(false);
    }

    drawThreeTeams([]);
  }, [drawThreeTeams]);

  // Initial draw & initial bans on app mount
  useEffect(() => {
    initializeDraftRun('normal', false);
  }, [initializeDraftRun]);

  const handleTabChange = (tab: TabId) => {
    setCurrentTab(tab);
    if (tab !== 'draft') {
      setIsTournamentActive(false);
    } else if (pendingBansNotice && bannedPlayers.length > 0) {
      setShowBansModal(true);
      setPendingBansNotice(false);
    }
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    initializeDraftRun(newDifficulty, currentTab === 'draft');
  };

  const handleReroll = () => {
    if (rerollsLeft <= 0 || pendingBonusChoices) return;
    setRerollsLeft(prev => prev - 1);
    const currentIds = availableTeams.map(t => t.id);
    drawThreeTeams(currentIds);
  };

  const commitNewPick = (updatedLineup: Lineup) => {
    const prevCount = Object.values(lineup).filter(p => p !== null).length;
    const nextCount = Object.values(updatedLineup).filter(p => p !== null).length;

    setLineup(updatedLineup);
    playLockSound();
    setWarningMessage(null);
    drawThreeTeams(availableTeams.map(t => t.id));

    if (nextCount > prevCount) {
      if (nextCount >= 2 && selectedBonuses.length === 0) {
        const offer = rollMayhemBonusChoices([], 3);
        if (offer.length > 0) {
          setBonusPromptStep(1);
          setPendingBonusChoices(offer);
          playBonusRevealSound();
        }
      } else if (nextCount >= 4 && selectedBonuses.length === 1) {
        const offer = rollMayhemBonusChoices(
          selectedBonuses.map(b => b.id),
          3
        );
        if (offer.length > 0) {
          setBonusPromptStep(2);
          setPendingBonusChoices(offer);
          playBonusRevealSound();
        }
      }
    }
  };

  const handleSelectMayhemBonus = (bonus: MayhemBonus) => {
    playLockSound();
    setSelectedBonuses(prev => (prev.some(b => b.id === bonus.id) ? prev : [...prev, bonus]));
    if (bonus.modifiers.extraRerolls) {
      setRerollsLeft(prev => prev + bonus.modifiers.extraRerolls!);
    }
    if (bonus.modifiers.zeroRerolls) {
      setRerollsLeft(0);
    }
    setPendingBonusChoices(null);
  };

  // Assign player to a specific role in the lineup (supports moving/swapping already drafted players)
  const handleAssignRole = (player: Player, targetRole: Role) => {
    if (pendingBonusChoices) return;

    if (isPlayerBanned(player, bannedPlayers)) {
      setWarningMessage(`${player.ign} foi vetado pelo adversário nessa run.`);
      setTimeout(() => setWarningMessage(null), 3000);
      return;
    }

    // Check if player is already somewhere in lineup
    const existingEntry = Object.entries(lineup).find(([_, p]) => p?.id === player.id);
    const updatedLineup = { ...lineup };

    if (existingEntry) {
      const oldRole = existingEntry[0] as Role;
      if (oldRole === targetRole) return;
      const occupantInTarget = updatedLineup[targetRole];
      updatedLineup[oldRole] = occupantInTarget || null;
      updatedLineup[targetRole] = player;
      setLineup(updatedLineup);
      playSelectSound();
      setWarningMessage(null);
      return;
    }

    updatedLineup[targetRole] = player;
    commitNewPick(updatedLineup);
  };

  // Smart selection when player chip is clicked from team card
  const handleSelectPlayerFromCard = (player: Player) => {
    if (pendingBonusChoices) return;

    if (isPlayerBanned(player, bannedPlayers)) {
      setWarningMessage(`${player.ign} foi vetado pelo adversário nessa run.`);
      setTimeout(() => setWarningMessage(null), 3000);
      return;
    }

    // Check if player is already drafted
    const isAlreadyDrafted = Object.values(lineup).some(p => p?.id === player.id);
    if (isAlreadyDrafted) {
      setWarningMessage(`${player.ign} já foi escalado em sua equipe.`);
      setTimeout(() => setWarningMessage(null), 3000);
      return;
    }

    // 1. Can we place in primary role?
    if (!lineup[player.primaryRole]) {
      handleAssignRole(player, player.primaryRole);
      return;
    }

    // 2. Can we place in secondary roles?
    for (const secRole of player.secondaryRoles) {
      if (!lineup[secRole]) {
        handleAssignRole(player, secRole);
        return;
      }
    }

    // 3. Can we place in Flex?
    if (!lineup.Flex) {
      handleAssignRole(player, 'Flex');
      return;
    }

    // 4. Smart shift: can the current occupant of primaryRole or Flex move to an open secondary role?
    const primaryOccupant = lineup[player.primaryRole];
    if (primaryOccupant) {
      for (const altRole of primaryOccupant.secondaryRoles) {
        if (!lineup[altRole]) {
          const updatedLineup = { ...lineup, [altRole]: primaryOccupant, [player.primaryRole]: player };
          commitNewPick(updatedLineup);
          return;
        }
      }
    }

    const flexOccupant = lineup.Flex;
    if (flexOccupant) {
      const flexCandidates: Role[] = [flexOccupant.primaryRole, ...flexOccupant.secondaryRoles];
      for (const altRole of flexCandidates) {
        if (!lineup[altRole]) {
          const updatedLineup = { ...lineup, [altRole]: flexOccupant, Flex: player };
          commitNewPick(updatedLineup);
          return;
        }
      }
    }

    // If none are free
    setWarningMessage(
      `A função ${player.primaryRole} e a vaga Flex já estão ocupadas. Clique em um jogador no mapa para mudar sua posição ou removê-lo.`
    );
    setTimeout(() => setWarningMessage(null), 3500);
  };

  const handleRemovePlayer = (role: Role) => {
    setLineup(prev => ({ ...prev, [role]: null }));
  };

  const handleClearLineup = () => {
    initializeDraftRun(difficulty, false);
  };

  const handleStartTournament = () => {
    if (pendingBonusChoices) return;
    const isComplete = Object.values(lineup).every(p => p !== null);
    if (!isComplete) return;
    setIsTournamentActive(true);
  };

  const handleResetTournament = () => {
    initializeDraftRun(difficulty, true);
  };

  const handleSaveCampaign = (record: CampaignHistory) => {
    try {
      const updated = [record, ...campaignHistory];
      setCampaignHistory(updated);
      localStorage.setItem('vct_mayhem_campaigns', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save campaign', e);
    }
    setPlayerRecords(prev => recordCampaignAndSave(prev, record));
  };

  const handleClearHistory = () => {
    setCampaignHistory([]);
    try {
      localStorage.removeItem('vct_mayhem_campaigns');
    } catch (e) {
      console.error('Failed to remove campaigns history', e);
    }
    setPlayerRecords(clearPlayerRecords());
  };

  const championshipsCount = campaignHistory.filter(c => c.wonChampionship).length;

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent text-slate-100 flex flex-col selection:bg-[#ff4655] selection:text-white relative isolate">
      {/* Ambient Drifting Background */}
      <AppBackground />

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        difficulty={difficulty}
        onDifficultyChange={handleDifficultyChange}
        onOpenHelp={() => setShowRulesModal(true)}
        trophiesCount={championshipsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-2.5 py-2.5 md:px-4 md:py-4 flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab === 'draft' ? (isTournamentActive ? 'tournament' : 'draft') : currentTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex-1 flex flex-col"
          >
            {currentTab === 'home' && (
              <HomeScreen
                difficulty={difficulty}
                onDifficultyChange={handleDifficultyChange}
                onSelectMode={handleTabChange}
                onOpenHelp={() => setShowRulesModal(true)}
                trophiesCount={championshipsCount}
                totalCampaigns={campaignHistory.length}
              />
            )}

            {currentTab === 'draft' && (
              <>
                {!isTournamentActive ? (
                  <ValorantDraftBoard
                    availableTeams={availableTeams}
                    lineup={lineup}
                    rerollsLeft={rerollsLeft}
                    selectedBonuses={selectedBonuses}
                    bannedPlayers={bannedPlayers}
                    onOpenBansModal={() => setShowBansModal(true)}
                    onReroll={handleReroll}
                    onSelectPlayer={handleSelectPlayerFromCard}
                    onInspectPlayer={setInspectedPlayer}
                    onRemovePlayer={handleRemovePlayer}
                    onClearLineup={handleClearLineup}
                    onStartTournament={handleStartTournament}
                    warningMessage={warningMessage}
                  />
                ) : (
                  <TournamentSimulation
                    lineup={lineup}
                    difficulty={difficulty}
                    selectedBonuses={selectedBonuses}
                    onResetTournament={handleResetTournament}
                    onSaveCampaign={handleSaveCampaign}
                  />
                )}
              </>
            )}

            {currentTab === 'grid' && <ValorantGridMode />}

            {currentTab === 'trivia' && <TriviaMode />}

            {currentTab === 'history' && (
              <TrophyRoomModal
                history={campaignHistory}
                records={playerRecords}
                onClearHistory={handleClearHistory}
                onClose={() => setCurrentTab('draft')}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Roguelike Mayhem Bonus Selection Modal (Pick 2 & Pick 4) */}
      {pendingBonusChoices && currentTab === 'draft' && !isTournamentActive && (
        <MayhemBonusModal
          choices={pendingBonusChoices}
          stepNumber={bonusPromptStep}
          onSelect={handleSelectMayhemBonus}
        />
      )}

      {/* Opponent Bans Modal */}
      {showBansModal && (
        <OpponentBansModal
          bannedPlayers={bannedPlayers}
          difficulty={difficulty}
          onClose={() => setShowBansModal(false)}
        />
      )}

      {/* Player Stats Inspector Modal */}
      <PlayerModal
        player={inspectedPlayer}
        lineup={lineup}
        onClose={() => setInspectedPlayer(null)}
        onAssignToRole={handleAssignRole}
      />

      {/* Rules Guide Modal */}
      {showRulesModal && <RulesModal onClose={() => setShowRulesModal(false)} />}
    </div>
  );
}
