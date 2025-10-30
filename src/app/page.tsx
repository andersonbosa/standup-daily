'use client';

import { useDailyTimer } from '@/hooks/useDailyTimer';
import { useLanguage } from '@/hooks/useLanguage';
import { SetupStage } from '@/components/SetupStage';
import { RunningStage } from '@/components/RunningStage';
import { FinishedStage } from '@/components/FinishedStage';
import { FloatingMenu } from '@/components/FloatingMenu';
import type { SessionConfig } from '@/types';

export default function Home() {
  const {
    sessionState,
    saveConfig,
    startDaily,
    nextParticipant,
    togglePause,
    resetDaily,
    presentParticipants,
    timePerParticipant,
  } = useDailyTimer();

  const { language, setLanguage, t } = useLanguage();

  const handleStart = (config: SessionConfig) => {
    saveConfig(config);
    setTimeout(() => startDaily(), 100);
  };

  return (
    <>
      <FloatingMenu language={language} onLanguageChange={setLanguage} t={t} />
      
      {sessionState.stage === 'setup' && (
        <SetupStage initialConfig={sessionState.config} onStart={handleStart} t={t} />
      )}

      {sessionState.stage === 'running' && (
        <RunningStage
          participants={presentParticipants}
          currentIndex={sessionState.currentParticipantIndex}
          remainingSeconds={sessionState.remainingSeconds}
          timePerParticipant={timePerParticipant}
          isPaused={sessionState.isPaused}
          onNext={nextParticipant}
          onTogglePause={togglePause}
          onReset={resetDaily}
          t={t}
        />
      )}

      {sessionState.stage === 'finished' && (
        <FinishedStage
          stats={sessionState.participantStats}
          onRestart={startDaily}
          onBackToSetup={resetDaily}
          t={t}
        />
      )}
    </>
  );
}
