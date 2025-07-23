// ABOUTME: Type definitions for participant tracking including status, speaking time, and queue position
// ABOUTME: Core data structure used throughout the app for managing speaker queue state

export type ParticipantStatus = 'waiting' | 'speaking' | 'completed' | 'paused' | 'skipped';

export interface Participant {
  id: string;
  name: string;
  position: number;
  status: ParticipantStatus;
  speakingTime: number;
  startTime?: Date;
}