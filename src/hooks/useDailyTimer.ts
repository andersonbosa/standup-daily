import { useState, useEffect, useCallback, useRef } from 'react';
import type { SessionConfig, SessionState, ParticipantStats, Stage } from '@/types';
import { useLocalStorage } from './useLocalStorage';

export function useDailyTimer() {
  const [savedConfig, setSavedConfig] = useLocalStorage<SessionConfig | null>('daily-timer-config', null);
  
  const [sessionState, setSessionState] = useState<SessionState>({
    stage: 'setup',
    config: savedConfig,
    currentParticipantIndex: 0,
    participantStats: [],
    isPaused: false,
    remainingSeconds: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const presentParticipants = sessionState.config?.participants.filter(p => !p.isAbsent) || [];
  const timePerParticipant = presentParticipants.length > 0
    ? Math.floor((sessionState.config?.totalMinutes || 0) * 60 / presentParticipants.length)
    : 0;

  const saveConfig = useCallback((config: SessionConfig) => {
    setSavedConfig(config);
    setSessionState(prev => ({ ...prev, config }));
  }, [setSavedConfig]);

  const startDaily = useCallback(() => {
    if (!sessionState.config) return;

    const stats: ParticipantStats[] = presentParticipants.map(p => ({
      id: p.id,
      name: p.name,
      timeUsed: 0,
      timeAllowed: timePerParticipant,
      exceeded: false,
    }));

    setSessionState(prev => ({
      ...prev,
      stage: 'running',
      currentParticipantIndex: 0,
      participantStats: stats,
      isPaused: false,
      remainingSeconds: timePerParticipant,
    }));
  }, [sessionState.config, presentParticipants, timePerParticipant]);

  const nextParticipant = useCallback(() => {
    const currentStats = sessionState.participantStats[sessionState.currentParticipantIndex];
    if (currentStats) {
      const timeUsed = timePerParticipant - sessionState.remainingSeconds;
      currentStats.timeUsed = timeUsed;
      currentStats.exceeded = timeUsed > timePerParticipant;
    }

    if (sessionState.currentParticipantIndex >= presentParticipants.length - 1) {
      setSessionState(prev => ({
        ...prev,
        stage: 'finished',
        isPaused: true,
      }));
    } else {
      setSessionState(prev => ({
        ...prev,
        currentParticipantIndex: prev.currentParticipantIndex + 1,
        remainingSeconds: timePerParticipant,
      }));
    }
  }, [sessionState, presentParticipants.length, timePerParticipant]);

  const togglePause = useCallback(() => {
    setSessionState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const resetDaily = useCallback(() => {
    setSessionState(prev => ({
      ...prev,
      stage: 'setup',
      currentParticipantIndex: 0,
      participantStats: [],
      isPaused: false,
      remainingSeconds: 0,
    }));
  }, []);

  useEffect(() => {
    if (sessionState.stage === 'running' && !sessionState.isPaused) {
      timerRef.current = setInterval(() => {
        setSessionState(prev => {
          if (prev.remainingSeconds <= 0) {
            return prev;
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [sessionState.stage, sessionState.isPaused]);

  return {
    sessionState,
    saveConfig,
    startDaily,
    nextParticipant,
    togglePause,
    resetDaily,
    presentParticipants,
    timePerParticipant,
  };
}

