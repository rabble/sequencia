// ABOUTME: Zustand store for managing speaker queue state and operations
// ABOUTME: Handles participant tracking, speaker progression, and queue management

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Participant, ParticipantStatus } from '../types/participant';

type MeetingFormat = 'standard' | 'roundRobin' | 'timeBox';

interface MeetingSettings {
  format: MeetingFormat;
  timeLimit: number;
  currentRound: number;
  autoAdvance: boolean;
}

interface QueueState {
  participants: Participant[];
  currentSpeaker: string | null;
  meetingFormat: MeetingFormat;
  timeLimit: number; // in seconds
  currentRound: number;
  speakerStartTime: number | null;
  autoAdvanceEnabled: boolean;
  autoAdvanceDelay: number; // in seconds
  autoAdvanceTimer: NodeJS.Timeout | null;
  autoAdvanceStartTime: number | null;
  
  // Actions
  addParticipant: (participant: { id: string; name: string }) => void;
  startSpeaking: (id: string) => void;
  endTurn: (id: string) => void;
  skipParticipant: (id: string) => void;
  pauseParticipant: (id: string) => void;
  unpauseParticipant: (id: string) => void;
  reorderParticipants: (ids: string[]) => void;
  shuffleQueue: () => void;
  resetQueue: () => void;
  
  // Queries
  getNextSpeaker: () => Participant | null;
  getQueueProgress: () => { total: number; completed: number; remaining: number };
  
  // Meeting format actions
  setMeetingFormat: (format: MeetingFormat) => void;
  setTimeLimit: (seconds: number) => void;
  completeRound: () => void;
  isQueueComplete: () => boolean;
  getTimeRemaining: () => number;
  isTimeWarning: () => boolean;
  getMeetingSettings: () => MeetingSettings;
  
  // Auto-advance actions
  setAutoAdvance: (enabled: boolean) => void;
  setAutoAdvanceDelay: (seconds: number) => void;
  getAutoAdvanceCountdown: () => number;
}

export const useQueueStore = create<QueueState>()(
  immer((set, get) => ({
    participants: [],
    currentSpeaker: null,
    meetingFormat: 'standard',
    timeLimit: 0,
    currentRound: 1,
    speakerStartTime: null,
    autoAdvanceEnabled: true,
    autoAdvanceDelay: 3,
    autoAdvanceTimer: null,
    autoAdvanceStartTime: null,

    addParticipant: (participant) => set((state) => {
      const newParticipant: Participant = {
        id: participant.id,
        name: participant.name,
        position: state.participants.length,
        status: 'waiting',
        speakingTime: 0
      };
      state.participants.push(newParticipant);
    }),

    startSpeaking: (id) => set((state) => {
      // Clear any auto-advance timer when manually starting
      if (state.autoAdvanceTimer) {
        clearTimeout(state.autoAdvanceTimer);
        state.autoAdvanceTimer = null;
        state.autoAdvanceStartTime = null;
      }
      
      const participant = state.participants.find(p => p.id === id);
      if (participant) {
        participant.status = 'speaking';
        participant.startTime = new Date();
        state.currentSpeaker = id;
        state.speakerStartTime = Date.now();
        
        // Set up auto-advance for time box mode
        if (state.meetingFormat === 'timeBox' && state.timeLimit > 0) {
          setTimeout(() => {
            // Use getState to get fresh state and call endTurn
            const freshState = useQueueStore.getState();
            if (freshState.currentSpeaker === id) {
              freshState.endTurn(id);
            }
          }, state.timeLimit * 1000);
        }
      }
    }),

    endTurn: (id) => set((state) => {
      const participant = state.participants.find(p => p.id === id);
      if (participant && participant.startTime) {
        const endTime = new Date();
        const speakingTime = Math.floor((endTime.getTime() - participant.startTime.getTime()) / 1000);
        participant.speakingTime = speakingTime;
        participant.status = 'completed';
        participant.startTime = undefined;
        
        // Clear any existing auto-advance timer
        if (state.autoAdvanceTimer) {
          clearTimeout(state.autoAdvanceTimer);
          state.autoAdvanceTimer = null;
        }
        
        // Handle different meeting formats
        const nextSpeakerData = get().getNextSpeaker();
        
        if (state.meetingFormat === 'roundRobin' && !nextSpeakerData) {
          // Start new round in round robin mode
          state.currentRound += 1;
          // Reset all participants to waiting
          state.participants.forEach(p => {
            if (p.status === 'completed') {
              p.status = 'waiting';
            }
          });
          // Start first speaker of new round
          const waitingParticipants = state.participants
            .filter(p => p.status === 'waiting')
            .sort((a, b) => a.position - b.position);
          const firstSpeaker = waitingParticipants[0];
          if (firstSpeaker) {
            firstSpeaker.status = 'speaking';
            firstSpeaker.startTime = new Date();
            state.currentSpeaker = firstSpeaker.id;
            state.speakerStartTime = Date.now();
            
          }
        } else {
          state.currentSpeaker = null;
          state.speakerStartTime = null;
          
          // Set up auto-advance if enabled and there's a next speaker
          // For time box mode, always advance immediately
          if ((state.meetingFormat === 'timeBox' && nextSpeakerData) || 
              (state.autoAdvanceEnabled && nextSpeakerData)) {
            if (state.autoAdvanceDelay === 0 || state.meetingFormat === 'timeBox') {
              // Advance immediately if delay is 0
              const nextParticipant = state.participants.find(p => p.id === nextSpeakerData.id);
              if (nextParticipant) {
                nextParticipant.status = 'speaking';
                nextParticipant.startTime = new Date();
                state.currentSpeaker = nextSpeakerData.id;
                state.speakerStartTime = Date.now();
              }
            } else {
            state.autoAdvanceStartTime = Date.now();
            state.autoAdvanceTimer = setTimeout(() => {
              const currentState = useQueueStore.getState();
              // Check if we should still auto-advance
              if (!currentState.currentSpeaker && currentState.autoAdvanceTimer) {
                const nextSpeaker = currentState.getNextSpeaker();
                if (nextSpeaker) {
                  currentState.startSpeaking(nextSpeaker.id);
                }
              }
              // Clear timer reference
              useQueueStore.setState({ 
                autoAdvanceTimer: null,
                autoAdvanceStartTime: null 
              });
            }, state.autoAdvanceDelay * 1000);
            }
          }
        }
      }
    }),

    skipParticipant: (id) => set((state) => {
      const participant = state.participants.find(p => p.id === id);
      if (participant) {
        participant.status = 'skipped';
      }
    }),

    pauseParticipant: (id) => set((state) => {
      const participant = state.participants.find(p => p.id === id);
      if (participant) {
        participant.status = 'paused';
      }
    }),

    unpauseParticipant: (id) => set((state) => {
      const participant = state.participants.find(p => p.id === id);
      if (participant && participant.status === 'paused') {
        participant.status = 'waiting';
      }
    }),

    reorderParticipants: (ids) => set((state) => {
      const reordered = ids.map((id, index) => {
        const participant = state.participants.find(p => p.id === id);
        if (participant) {
          participant.position = index;
          return participant;
        }
        return null;
      }).filter(Boolean) as Participant[];
      
      state.participants = reordered;
    }),

    shuffleQueue: () => set((state) => {
      const waitingParticipants = state.participants.filter(p => 
        p.status === 'waiting' || p.status === 'paused'
      );
      
      // Fisher-Yates shuffle
      for (let i = waitingParticipants.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [waitingParticipants[i], waitingParticipants[j]] = 
        [waitingParticipants[j], waitingParticipants[i]];
      }
      
      // Rebuild participants array maintaining completed ones
      const completed = state.participants.filter(p => 
        p.status === 'completed' || p.status === 'speaking'
      );
      
      state.participants = [...completed, ...waitingParticipants].map((p, i) => ({
        ...p,
        position: i
      }));
    }),

    resetQueue: () => set((state) => {
      state.participants = state.participants.map(p => ({
        ...p,
        status: 'waiting' as ParticipantStatus,
        speakingTime: 0,
        startTime: undefined
      }));
      state.currentSpeaker = null;
    }),

    getNextSpeaker: () => {
      const state = get();
      const waiting = state.participants
        .filter(p => p.status === 'waiting')
        .sort((a, b) => a.position - b.position);
      return waiting[0] || null;
    },

    getQueueProgress: () => {
      const state = get();
      const total = state.participants.length;
      const completed = state.participants.filter(p => p.status === 'completed').length;
      const remaining = total - completed;
      return { total, completed, remaining };
    },

    setMeetingFormat: (format) => set((state) => {
      state.meetingFormat = format;
      state.currentRound = 1; // Reset round when changing format
    }),

    setTimeLimit: (seconds) => set((state) => {
      state.timeLimit = seconds;
    }),

    completeRound: () => set((state) => {
      // Mark all remaining participants as completed
      state.participants.forEach(p => {
        if (p.status === 'waiting' || p.status === 'paused') {
          p.status = 'completed';
        }
      });
      state.currentSpeaker = null;
    }),

    isQueueComplete: () => {
      const state = get();
      const hasWaiting = state.participants.some(p => 
        p.status === 'waiting' || p.status === 'paused'
      );
      return !hasWaiting && state.currentSpeaker === null;
    },

    getTimeRemaining: () => {
      const state = get();
      if (state.meetingFormat !== 'timeBox' || !state.speakerStartTime) {
        return 0;
      }
      const elapsed = (Date.now() - state.speakerStartTime) / 1000;
      const remaining = Math.max(0, state.timeLimit - elapsed);
      return Math.floor(remaining);
    },

    isTimeWarning: () => {
      const state = get();
      const remaining = state.getTimeRemaining();
      return remaining > 0 && remaining <= 5;
    },

    getMeetingSettings: () => {
      const state = get();
      return {
        format: state.meetingFormat,
        timeLimit: state.timeLimit,
        currentRound: state.currentRound,
        autoAdvance: true
      };
    },

    setAutoAdvance: (enabled) => set((state) => {
      state.autoAdvanceEnabled = enabled;
      // Clear timer if disabling
      if (!enabled && state.autoAdvanceTimer) {
        clearTimeout(state.autoAdvanceTimer);
        state.autoAdvanceTimer = null;
        state.autoAdvanceStartTime = null;
      }
    }),

    setAutoAdvanceDelay: (seconds) => set((state) => {
      // Clamp to valid range (0-30 seconds)
      state.autoAdvanceDelay = Math.max(0, Math.min(30, seconds));
    }),

    getAutoAdvanceCountdown: () => {
      const state = get();
      if (!state.autoAdvanceStartTime || !state.autoAdvanceTimer) {
        return 0;
      }
      const elapsed = (Date.now() - state.autoAdvanceStartTime) / 1000;
      const remaining = Math.max(0, state.autoAdvanceDelay - elapsed);
      return Math.ceil(remaining);
    }
  }))
);