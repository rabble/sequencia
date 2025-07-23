// ABOUTME: Zustand store for managing speaker queue state and operations
// ABOUTME: Handles participant tracking, speaker progression, and queue management

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Participant, ParticipantStatus } from '../types/participant';

interface QueueState {
  participants: Participant[];
  currentSpeaker: string | null;
  
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
}

export const useQueueStore = create<QueueState>()(
  immer((set, get) => ({
    participants: [],
    currentSpeaker: null,

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
      const participant = state.participants.find(p => p.id === id);
      if (participant) {
        participant.status = 'speaking';
        participant.startTime = new Date();
        state.currentSpeaker = id;
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
        
        // Auto-advance to next speaker
        const nextSpeakerData = get().getNextSpeaker();
        if (nextSpeakerData) {
          state.currentSpeaker = nextSpeakerData.id;
          const nextParticipant = state.participants.find(p => p.id === nextSpeakerData.id);
          if (nextParticipant) {
            nextParticipant.status = 'speaking';
            nextParticipant.startTime = new Date();
          }
        } else {
          state.currentSpeaker = null;
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
    }
  }))
);