export interface Participant {
  id: string;
  name: string;
  emoji?: string;
  isAbsent: boolean;
}

export interface SessionConfig {
  participants: Participant[];
  totalMinutes: number;
}

export interface ParticipantStats {
  id: string;
  name: string;
  timeUsed: number;
  timeAllowed: number;
  exceeded: boolean;
}

export type Stage = 'setup' | 'running' | 'finished';

export interface SessionState {
  stage: Stage;
  config: SessionConfig | null;
  currentParticipantIndex: number;
  participantStats: ParticipantStats[];
  isPaused: boolean;
  remainingSeconds: number;
}

