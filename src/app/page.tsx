'use client';

import { useApp } from '@/components/context/AppContext';
import { SetupStage } from '@/components/SetupStage';
import { RunningStage } from '@/components/RunningStage';
import { FinishedStage } from '@/components/FinishedStage';
import { FloatingMenu } from '@/components/FloatingMenu';

export default function Home() {
  const { sessionState } = useApp();

  return (
    <>
      <FloatingMenu />
      
      {sessionState.stage === 'setup' && <SetupStage />}
      {sessionState.stage === 'running' && <RunningStage />}
      {sessionState.stage === 'finished' && <FinishedStage />}
    </>
  );
}
