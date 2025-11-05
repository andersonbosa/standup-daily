'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { SessionConfig, SessionState, ParticipantStats, Participant } from '@/types';
import type { Language, TranslationKey } from '@/i18n/translations';
import { getTranslation } from '@/i18n/translations';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AppContextType {
  sessionState: SessionState;
  language: Language;
  presentParticipants: Participant[];
  timePerParticipant: number;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  saveConfig: (config: SessionConfig) => void;
  startDaily: () => void;
  nextParticipant: () => void;
  togglePause: () => void;
  resetDaily: () => void;
  clearParticipants: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [savedConfig, setSavedConfig] = useLocalStorage<SessionConfig | null>('daily-timer-config', null);
  const [language, setLanguage] = useLocalStorage<Language>('daily-timer-language', 'pt-BR');
  
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

  const t = useCallback((key: TranslationKey): string => {
    return getTranslation(language, key);
  }, [language]);

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

  const clearParticipants = useCallback(() => {
    localStorage.removeItem('daily-timer-config');
    localStorage.removeItem('lastConfigToast');
    setSavedConfig(null);
    setSessionState({
      stage: 'setup',
      config: null,
      currentParticipantIndex: 0,
      participantStats: [],
      isPaused: false,
      remainingSeconds: 0,
    });
  }, [setSavedConfig]);

  useEffect(() => {
    if (sessionState.stage === 'running' && !sessionState.isPaused) {
      timerRef.current = setInterval(() => {
        setSessionState(prev => {
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [sessionState.stage, sessionState.isPaused]);

  const value: AppContextType = {
    sessionState,
    language,
    presentParticipants,
    timePerParticipant,
    setLanguage,
    t,
    saveConfig,
    startDaily,
    nextParticipant,
    togglePause,
    resetDaily,
    clearParticipants,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

