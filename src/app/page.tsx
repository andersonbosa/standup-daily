'use client';

import { useApp } from '@/components/context/AppContext'
import { FinishedStage } from '@/components/FinishedStage'
import { FloatingMenu } from '@/components/FloatingMenu'
import { RunningStage } from '@/components/RunningStage'
import { SetupStage } from '@/components/SetupStage'

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
