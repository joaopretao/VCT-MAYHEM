import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
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
import { TeamIdentityModal, DEFAULT_TEAM_IDENTITY } from './components/TeamCrest';
import { DraftTutorialModal, hasSeenDraftTutorial } from './components/DraftTutorialModal';
import {
  Lineup,
  Role,
  Player,
  Team,
  Difficulty,
  CampaignHistory,
  MayhemBonus,
  PlayerRecords,
  UserTeamIdentity,
  SavedTournamentState,
  RunRuleId,
  CardFrameId,
} from './types';
import { rollMayhemBonusChoices } from './data/mayhemBonuses';
import { evaluateAchievements } from './data/achievements';
import { loadEquippedFrame, saveEquippedFrame } from './data/frames';
import { rollOpponentBans, isPlayerBanned } from './utils/bans';
import { playLockSound, playSelectSound, playBonusRevealSound } from './utils/audio';
import { vibrateLight, vibrateBonus } from './utils/haptics';
import {
  drawThreeTeamsForRun,
  isPlayerEligibleForRule,
  isPlayerInLineup,
  isSamePlayer,
  getRunRuleMeta,
} from './utils/runRules';
import {
  buildShareDraftUrl,
  clearUrlSeedParams,
  createSeededRng,
  generateRandomSeed,
  getDailyDraftSeed,
  hasCompletedDailyDraft,
  markDailyDraftCompleted,
  parseRunFromUrl,
} from './utils/seed';
import {
  loadActiveRun,
  saveActiveRun,
  clearActiveRun,
  hasSavedProgress,
} from './utils/activeRun';
import {
  EMPTY_PLAYER_RECORDS,
  loadPlayerRecords,
  recordCampaignAndSave,
  clearPlayerRecords,
} from './utils/records';

export default function App() {
  const [urlBoot] = useState(() => parseRunFromUrl());
  const [restoredRun] = useState(() => loadActiveRun());
  const matchesUrlWithSave =
    Boolean(urlBoot) &&
    Boolean(restoredRun) &&
    hasSavedProgress(restoredRun) &&
    restoredRun?.seed === urlBoot?.seed &&
    restoredRun?.runRule === urlBoot?.rule &&
    restoredRun?.difficulty === urlBoot?.difficulty;
  const canResumeRun = urlBoot ? matchesUrlWithSave : hasSavedProgress(restoredRun);
  const bootFromUrl = Boolean(urlBoot) && !matchesUrlWithSave;

  const [currentTab, setCurrentTab] = useState<TabId>(
    bootFromUrl || canResumeRun ? 'draft' : 'home'
  );
  const [difficulty, setDifficulty] = useState<Difficulty>(
    bootFromUrl && urlBoot ? urlBoot.difficulty : restoredRun?.difficulty ?? 'normal'
  );
  const [runRule, setRunRule] = useState<RunRuleId>(
    bootFromUrl && urlBoot ? urlBoot.rule : restoredRun?.runRule ?? 'standard'
  );
  const [runSeed, setRunSeed] = useState<string>(
    bootFromUrl && urlBoot ? urlBoot.seed : restoredRun?.seed ?? generateRandomSeed()
  );
  const [drawStep, setDrawStep] = useState<number>(
    bootFromUrl ? 0 : restoredRun?.drawStep ?? 0
  );
  const [rerollsUsed, setRerollsUsed] = useState<number>(
    bootFromUrl ? 0 : restoredRun?.rerollsUsed ?? 0
  );
  const [isDailyRun, setIsDailyRun] = useState<boolean>(
    bootFromUrl && urlBoot ? urlBoot.isDaily : Boolean(restoredRun?.isDaily)
  );
  const [dailyCompleted, setDailyCompleted] = useState<boolean>(() => hasCompletedDailyDraft());
  const [seedCopied, setSeedCopied] = useState<boolean>(false);
  const [equippedFrameId, setEquippedFrameId] = useState<CardFrameId>('default');
  const [teamIdentity, setTeamIdentity] = useState<UserTeamIdentity>(
    restoredRun?.teamIdentity ?? DEFAULT_TEAM_IDENTITY
  );
  const [showTeamIdentityModal, setShowTeamIdentityModal] = useState<boolean>(false);
  const [showTutorialModal, setShowTutorialModal] = useState<boolean>(false);
  const [pendingBansNotice, setPendingBansNotice] = useState<boolean>(false);
  const [lineup, setLineup] = useState<Lineup>(
    bootFromUrl
      ? { Duelist: null, Controller: null, Initiator: null, Sentinel: null, Flex: null }
      : restoredRun?.lineup ?? {
          Duelist: null,
          Controller: null,
          Initiator: null,
          Sentinel: null,
          Flex: null,
        }
  );

  const [availableTeams, setAvailableTeams] = useState<Team[]>(
    bootFromUrl ? [] : restoredRun?.availableTeams ?? []
  );
  const [rerollsLeft, setRerollsLeft] = useState<number>(
    bootFromUrl ? 3 : restoredRun?.rerollsLeft ?? 3
  );
  const [isTournamentActive, setIsTournamentActive] = useState<boolean>(
    canResumeRun && Boolean(restoredRun?.isTournamentActive)
  );
  const [savedTournamentState, setSavedTournamentState] = useState<SavedTournamentState | null>(
    canResumeRun ? restoredRun?.tournamentState ?? null : null
  );
  const [inspectedPlayer, setInspectedPlayer] = useState<Player | null>(null);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [campaignHistory, setCampaignHistory] = useState<CampaignHistory[]>([]);
  const [playerRecords, setPlayerRecords] = useState<PlayerRecords>(EMPTY_PLAYER_RECORDS);

  // Roguelike Mayhem Bonuses (max 2 per run: after pick 2 and pick 4)
  const [selectedBonuses, setSelectedBonuses] = useState<MayhemBonus[]>(
    bootFromUrl ? [] : restoredRun?.selectedBonuses ?? []
  );
  const [pendingBonusChoices, setPendingBonusChoices] = useState<MayhemBonus[] | null>(
    bootFromUrl ? null : restoredRun?.pendingBonusChoices ?? null
  );
  const [bonusPromptStep, setBonusPromptStep] = useState<1 | 2>(
    bootFromUrl ? 1 : restoredRun?.bonusPromptStep ?? 1
  );

  // Opponent Ban System (Normal: 0 bans, Hard: 3 bans, Master: 6 bans)
  const [bannedPlayers, setBannedPlayers] = useState<Player[]>(
    bootFromUrl ? [] : restoredRun?.bannedPlayers ?? []
  );
  const [showBansModal, setShowBansModal] = useState<boolean>(false);

  // Load campaign history, player records and unlocked frames from localStorage
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
    const ach = evaluateAchievements(loadedCampaigns);
    setEquippedFrameId(loadEquippedFrame(ach));
  }, []);

  // Initialize a new draft run with seed, rule, rerolls and opponent bans
  const initializeDraftRun = useCallback(
    (
      targetDifficulty: Difficulty,
      openBansNotification: boolean = true,
      overrides?: { seed?: string; rule?: RunRuleId; isDaily?: boolean }
    ) => {
      clearActiveRun();
      const targetRule = overrides?.rule ?? runRule;
      const targetSeed = overrides?.seed ?? generateRandomSeed();
      const targetDaily = overrides?.isDaily ?? false;

      if (!overrides?.seed) {
        clearUrlSeedParams();
      }

      const emptyLineup: Lineup = {
        Duelist: null,
        Controller: null,
        Initiator: null,
        Sentinel: null,
        Flex: null,
      };

      setSavedTournamentState(null);
      setLineup(emptyLineup);
      setIsTournamentActive(false);
      setSelectedBonuses([]);
      setPendingBonusChoices(null);
      setBonusPromptStep(1);
      setRunSeed(targetSeed);
      setRunRule(targetRule);
      setIsDailyRun(targetDaily);
      setDrawStep(0);
      setRerollsUsed(0);

      if (targetRule === 'no_reroll') {
        setRerollsLeft(0);
      } else if (targetDifficulty === 'normal') {
        setRerollsLeft(3);
      } else if (targetDifficulty === 'hard') {
        setRerollsLeft(2);
      } else {
        setRerollsLeft(1);
      }

      const bans = rollOpponentBans(targetDifficulty, targetSeed, targetRule);
      setBannedPlayers(bans);
      if (bans.length > 0 && openBansNotification) {
        setShowBansModal(true);
        setPendingBansNotice(false);
      } else if (bans.length > 0) {
        setPendingBansNotice(true);
      } else {
        setPendingBansNotice(false);
      }

      setAvailableTeams(
        drawThreeTeamsForRun({
          rule: targetRule,
          seed: targetSeed,
          step: 0,
          excludeIds: [],
          lineup: emptyLineup,
          bannedPlayers: bans,
        })
      );
    },
    [runRule]
  );

  // Initial draw only if no valid saved run restored availableTeams
  useEffect(() => {
    if (availableTeams.length === 0) {
      if (bootFromUrl && urlBoot) {
        initializeDraftRun(urlBoot.difficulty, true, {
          seed: urlBoot.seed,
          rule: urlBoot.rule,
          isDaily: urlBoot.isDaily,
        });
      } else {
        initializeDraftRun(difficulty, false, { seed: runSeed, rule: runRule, isDaily: isDailyRun });
      }
    }
  }, [availableTeams.length]);

  // Show short 3-step tutorial only on first visit to Draft mode (and when no modal blocks it)
  useEffect(() => {
    if (
      currentTab === 'draft' &&
      !isTournamentActive &&
      !pendingBonusChoices &&
      !showBansModal &&
      !hasSeenDraftTutorial()
    ) {
      setShowTutorialModal(true);
    }
  }, [currentTab, isTournamentActive, pendingBonusChoices, showBansModal]);

  // Auto-save active run to localStorage
  useEffect(() => {
    if (availableTeams.length === 0) return;
    if (savedTournamentState?.isChampionshipWon || savedTournamentState?.isEliminated) {
      clearActiveRun();
      return;
    }
    saveActiveRun({
      version: 1,
      savedAt: Date.now(),
      difficulty,
      runRule,
      seed: runSeed,
      drawStep,
      rerollsUsed,
      isDaily: isDailyRun,
      teamIdentity,
      lineup,
      availableTeams,
      rerollsLeft,
      selectedBonuses,
      pendingBonusChoices,
      bonusPromptStep,
      bannedPlayers,
      isTournamentActive,
      tournamentState: savedTournamentState,
    });
  }, [
    difficulty,
    runRule,
    runSeed,
    drawStep,
    rerollsUsed,
    isDailyRun,
    teamIdentity,
    lineup,
    availableTeams,
    rerollsLeft,
    selectedBonuses,
    pendingBonusChoices,
    bonusPromptStep,
    bannedPlayers,
    isTournamentActive,
    savedTournamentState,
  ]);

  const handleTabChange = (tab: TabId) => {
    setCurrentTab(tab);
    if (tab !== 'draft') {
      setIsTournamentActive(false);
    } else {
      if (
        savedTournamentState &&
        !savedTournamentState.isChampionshipWon &&
        !savedTournamentState.isEliminated
      ) {
        setIsTournamentActive(true);
      } else if (pendingBansNotice && bannedPlayers.length > 0) {
        setShowBansModal(true);
        setPendingBansNotice(false);
      }
    }
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    initializeDraftRun(newDifficulty, currentTab === 'draft', { rule: runRule });
  };

  const handleRunRuleChange = (nextRule: RunRuleId) => {
    setRunRule(nextRule);
    initializeDraftRun(difficulty, false, { rule: nextRule });
  };

  const handleStartDailyDraft = () => {
    const dailySeed = getDailyDraftSeed();
    setDifficulty('normal');
    setRunRule('standard');
    setCurrentTab('draft');
    initializeDraftRun('normal', false, {
      seed: dailySeed,
      rule: 'standard',
      isDaily: true,
    });
  };

  const handleCopySeedUrl = () => {
    const url = buildShareDraftUrl(runSeed, runRule, difficulty);
    if (!url) return;
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(url);
      }
    } catch {
      // Fallback ignored on restricted permissions
    }
    setSeedCopied(true);
    window.setTimeout(() => setSeedCopied(false), 2400);
  };

  const handleSelectFrame = (frameId: CardFrameId) => {
    setEquippedFrameId(frameId);
    saveEquippedFrame(frameId);
  };

  const handleReroll = () => {
    if (rerollsLeft <= 0 || pendingBonusChoices || runRule === 'no_reroll') return;
    const nextStep = drawStep + 1;
    setDrawStep(nextStep);
    setRerollsLeft(prev => prev - 1);
    setRerollsUsed(prev => prev + 1);
    const currentIds = availableTeams.map(t => t.id);
    setAvailableTeams(
      drawThreeTeamsForRun({
        rule: runRule,
        seed: runSeed,
        step: nextStep,
        excludeIds: currentIds,
        lineup,
        bannedPlayers,
      })
    );
  };

  const commitNewPick = (updatedLineup: Lineup) => {
    const pickedList = Object.values(updatedLineup).filter((p): p is Player => p !== null);
    for (let i = 0; i < pickedList.length; i++) {
      for (let j = i + 1; j < pickedList.length; j++) {
        if (isSamePlayer(pickedList[i], pickedList[j])) {
          setWarningMessage(`${pickedList[i].ign} já foi escalado em sua equipe.`);
          setTimeout(() => setWarningMessage(null), 3000);
          return;
        }
      }
    }

    const prevCount = Object.values(lineup).filter(p => p !== null).length;
    const nextCount = pickedList.length;
    const nextStep = drawStep + 1;

    setDrawStep(nextStep);
    setLineup(updatedLineup);
    playLockSound();
    vibrateLight();
    setWarningMessage(null);
    setAvailableTeams(
      drawThreeTeamsForRun({
        rule: runRule,
        seed: runSeed,
        step: nextStep,
        excludeIds: availableTeams.map(t => t.id),
        lineup: updatedLineup,
        bannedPlayers,
      })
    );

    if (nextCount > prevCount) {
      if (nextCount >= 2 && selectedBonuses.length === 0) {
        const offer = rollMayhemBonusChoices([], 3, {
          rng: createSeededRng(`${runSeed}-bonus-1`),
          rule: runRule,
        });
        if (offer.length > 0) {
          setBonusPromptStep(1);
          setPendingBonusChoices(offer);
          playBonusRevealSound();
          vibrateBonus();
        }
      } else if (nextCount >= 4 && selectedBonuses.length === 1) {
        const offer = rollMayhemBonusChoices(
          selectedBonuses.map(b => b.id),
          3,
          {
            rng: createSeededRng(`${runSeed}-bonus-2`),
            rule: runRule,
          }
        );
        if (offer.length > 0) {
          setBonusPromptStep(2);
          setPendingBonusChoices(offer);
          playBonusRevealSound();
          vibrateBonus();
        }
      }
    }
  };

  const handleSelectMayhemBonus = (bonus: MayhemBonus) => {
    playLockSound();
    vibrateBonus();
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

    if (!isPlayerEligibleForRule(player, runRule)) {
      setWarningMessage(`${player.ign} não participa desta regra (${getRunRuleMeta(runRule).label}).`);
      setTimeout(() => setWarningMessage(null), 3000);
      return;
    }

    if (isPlayerBanned(player, bannedPlayers)) {
      setWarningMessage(`${player.ign} foi vetado pelo adversário nessa run.`);
      setTimeout(() => setWarningMessage(null), 3000);
      return;
    }

    // Check if this exact player card is already in lineup (moving/swapping slots)
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

    // Prevent drafting another team/year version of an already drafted player
    if (isPlayerInLineup(player, lineup)) {
      setWarningMessage(`${player.ign} já foi escalado em sua equipe (outra edição).`);
      setTimeout(() => setWarningMessage(null), 3000);
      return;
    }

    updatedLineup[targetRole] = player;
    commitNewPick(updatedLineup);
  };

  // Smart selection when player chip is clicked from team card
  const handleSelectPlayerFromCard = (player: Player) => {
    if (pendingBonusChoices) return;

    if (!isPlayerEligibleForRule(player, runRule)) {
      setWarningMessage(`${player.ign} não participa desta regra (${getRunRuleMeta(runRule).label}).`);
      setTimeout(() => setWarningMessage(null), 3000);
      return;
    }

    if (isPlayerBanned(player, bannedPlayers)) {
      setWarningMessage(`${player.ign} foi vetado pelo adversário nessa run.`);
      setTimeout(() => setWarningMessage(null), 3000);
      return;
    }

    // Check if player (any team/year edition) is already drafted
    if (isPlayerInLineup(player, lineup)) {
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
    initializeDraftRun(difficulty, false, { rule: runRule });
  };

  const handleStartTournament = () => {
    if (pendingBonusChoices) return;
    const isComplete = Object.values(lineup).every(p => p !== null);
    if (!isComplete) return;
    setIsTournamentActive(true);
  };

  const handleResetTournament = () => {
    initializeDraftRun(difficulty, true, { rule: runRule });
  };

  const handleSaveCampaign = (record: CampaignHistory) => {
    try {
      const updated = [record, ...campaignHistory];
      setCampaignHistory(updated);
      localStorage.setItem('vct_mayhem_campaigns', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save campaign', e);
    }
    if (record.isDaily || isDailyRun) {
      markDailyDraftCompleted();
      setDailyCompleted(true);
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
  const picksCount = Object.values(lineup).filter(Boolean).length;
  const hasOngoingTournament =
    Boolean(savedTournamentState) &&
    !savedTournamentState?.isChampionshipWon &&
    !savedTournamentState?.isEliminated;
  const homeHasActiveRun = hasOngoingTournament || picksCount > 0 || Boolean(pendingBonusChoices);
  const activeRunLabel = hasOngoingTournament
    ? savedTournamentState?.series?.stageTitle?.split(' - ')[0] || 'Torneio'
    : homeHasActiveRun
    ? `Pick ${Math.min(5, picksCount)}/5`
    : null;

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-hidden bg-transparent text-slate-100 flex flex-col selection:bg-[#ff4655] selection:text-white relative isolate">
      {/* Ambient Drifting Background */}
      <AppBackground />

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={handleTabChange}
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
                runRule={runRule}
                onRunRuleChange={handleRunRuleChange}
                onStartDailyDraft={handleStartDailyDraft}
                isDailyCompleted={dailyCompleted}
                onSelectMode={handleTabChange}
                onOpenHelp={() => setShowRulesModal(true)}
                trophiesCount={championshipsCount}
                totalCampaigns={campaignHistory.length}
                hasActiveRun={homeHasActiveRun}
                activeRunLabel={activeRunLabel}
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
                    teamIdentity={teamIdentity}
                    frameId={equippedFrameId}
                    runRule={runRule}
                    seed={runSeed}
                    isDaily={isDailyRun}
                    onCopySeedUrl={handleCopySeedUrl}
                    seedCopied={seedCopied}
                    onEditTeamIdentity={() => setShowTeamIdentityModal(true)}
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
                    runRule={runRule}
                    seed={runSeed}
                    rerollsUsed={rerollsUsed}
                    isDaily={isDailyRun}
                    frameId={equippedFrameId}
                    seedCopied={seedCopied}
                    onCopySeedUrl={handleCopySeedUrl}
                    selectedBonuses={selectedBonuses}
                    bannedPlayers={bannedPlayers}
                    teamIdentity={teamIdentity}
                    initialSavedState={savedTournamentState}
                    onTournamentStateChange={setSavedTournamentState}
                    onUpdateLineup={setLineup}
                    onAddShopBonus={bonus =>
                      setSelectedBonuses(prev =>
                        prev.some(b => b.id === bonus.id) ? prev : [...prev, bonus]
                      )
                    }
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
                equippedFrameId={equippedFrameId}
                onSelectFrame={handleSelectFrame}
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
          lineup={lineup}
          selectedBonuses={selectedBonuses}
          difficulty={difficulty}
          onSelect={handleSelectMayhemBonus}
        />
      )}

      {/* Team Identity Editor Modal */}
      {showTeamIdentityModal && (
        <TeamIdentityModal
          identity={teamIdentity}
          onSave={setTeamIdentity}
          onClose={() => setShowTeamIdentityModal(false)}
        />
      )}

      {/* First-Run 3-Step Tutorial Modal */}
      {showTutorialModal && (
        <DraftTutorialModal onClose={() => setShowTutorialModal(false)} />
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
      {showRulesModal && (
        <RulesModal
          onClose={() => setShowRulesModal(false)}
          onReplayTutorial={() => {
            setCurrentTab('draft');
            setShowTutorialModal(true);
          }}
        />
      )}
    </div>
    </MotionConfig>
  );
}
