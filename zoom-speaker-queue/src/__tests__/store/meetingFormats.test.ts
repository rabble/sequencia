// ABOUTME: Tests for different meeting format modes (Standard, Round Robin, Time Box)
// ABOUTME: Verifies mode-specific behavior for speaker progression and queue management

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useQueueStore } from '../../store/queueStore';

describe('Meeting Format Modes', () => {
  beforeEach(() => {
    // Reset store before each test
    useQueueStore.getState().resetQueue();
    useQueueStore.setState({ 
      participants: [], 
      currentSpeaker: null,
      meetingFormat: 'standard',
      currentRound: 1,
      timeLimit: 0,
      autoAdvanceEnabled: true
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Standard Mode', () => {
    it('should complete queue after one pass', () => {
      // Set auto-advance delay to 0 for immediate advancement  
      useQueueStore.getState().setAutoAdvanceDelay(0);
      
      // Add participants
      useQueueStore.getState().addParticipant({ id: '1', name: 'John' });
      useQueueStore.getState().addParticipant({ id: '2', name: 'Jane' });
      useQueueStore.getState().setMeetingFormat('standard');
      
      // Start queue
      useQueueStore.getState().startSpeaking('1');
      useQueueStore.getState().endTurn('1');
      
      // Second speaker should auto-start after endTurn
      expect(useQueueStore.getState().currentSpeaker).toBe('2');
      useQueueStore.getState().endTurn('2');
      
      // Queue should be complete
      expect(useQueueStore.getState().currentSpeaker).toBeNull();
      expect(useQueueStore.getState().isQueueComplete()).toBe(true);
    });
  });

  describe('Round Robin Mode', () => {
    it('should start new round after all speakers finish', () => {
      // Disable auto-advance for this test
      useQueueStore.getState().setAutoAdvance(false);
      
      // Add participants
      useQueueStore.getState().addParticipant({ id: '1', name: 'John' });
      useQueueStore.getState().addParticipant({ id: '2', name: 'Jane' });
      useQueueStore.getState().setMeetingFormat('roundRobin');
      
      // First round
      useQueueStore.getState().startSpeaking('1');
      useQueueStore.getState().endTurn('1');
      // With auto-advance disabled, manually start speaker 2
      useQueueStore.getState().startSpeaking('2');
      useQueueStore.getState().endTurn('2');
      
      // Should start round 2
      expect(useQueueStore.getState().currentRound).toBe(2);
      expect(useQueueStore.getState().currentSpeaker).toBe('1');
      expect(useQueueStore.getState().participants[0].status).toBe('speaking');
    });

    it('should track round number', () => {
      useQueueStore.getState().addParticipant({ id: '1', name: 'John' });
      useQueueStore.getState().setMeetingFormat('roundRobin');
      
      expect(useQueueStore.getState().currentRound).toBe(1);
      
      useQueueStore.getState().startSpeaking('1');
      useQueueStore.getState().endTurn('1');
      
      // With only one participant, it should increment round after each turn
      expect(useQueueStore.getState().currentRound).toBe(2);
    });

    it('should allow manual round completion', () => {
      useQueueStore.getState().addParticipant({ id: '1', name: 'John' });
      useQueueStore.getState().addParticipant({ id: '2', name: 'Jane' });
      useQueueStore.getState().setMeetingFormat('roundRobin');
      
      useQueueStore.getState().startSpeaking('1');
      useQueueStore.getState().completeRound();
      
      expect(useQueueStore.getState().currentRound).toBe(1);
      expect(useQueueStore.getState().isQueueComplete()).toBe(true);
    });
  });

  describe('Time Box Mode', () => {
    it('should enforce time limits per speaker', async () => {
      useQueueStore.getState().addParticipant({ id: '1', name: 'John' });
      useQueueStore.getState().addParticipant({ id: '2', name: 'Jane' });
      useQueueStore.getState().setMeetingFormat('timeBox');
      useQueueStore.getState().setTimeLimit(30); // 30 seconds
      
      useQueueStore.getState().startSpeaking('1');
      
      // Advance time by 30 seconds
      await vi.advanceTimersByTimeAsync(30000);
      
      // Should auto-advance
      expect(useQueueStore.getState().currentSpeaker).toBe('2');
      expect(useQueueStore.getState().participants[0].status).toBe('completed');
    });

    it('should show time remaining', () => {
      useQueueStore.getState().addParticipant({ id: '1', name: 'John' });
      useQueueStore.getState().setMeetingFormat('timeBox');
      useQueueStore.getState().setTimeLimit(60); // 60 seconds
      
      const startTime = Date.now();
      vi.setSystemTime(startTime);
      
      useQueueStore.getState().startSpeaking('1');
      
      // Advance 20 seconds
      vi.setSystemTime(startTime + 20000);
      
      expect(useQueueStore.getState().getTimeRemaining()).toBe(40);
    });

    it('should warn when time is running out', () => {
      useQueueStore.getState().addParticipant({ id: '1', name: 'John' });
      useQueueStore.getState().setMeetingFormat('timeBox');
      useQueueStore.getState().setTimeLimit(30);
      
      const startTime = Date.now();
      vi.setSystemTime(startTime);
      
      useQueueStore.getState().startSpeaking('1');
      
      // Advance to 5 seconds remaining
      vi.setSystemTime(startTime + 25000);
      
      expect(useQueueStore.getState().isTimeWarning()).toBe(true);
    });
  });

  describe('Meeting Format Settings', () => {
    it('should get current format settings', () => {
      useQueueStore.getState().setMeetingFormat('timeBox');
      useQueueStore.getState().setTimeLimit(120);
      
      const settings = useQueueStore.getState().getMeetingSettings();
      
      expect(settings).toEqual({
        format: 'timeBox',
        timeLimit: 120,
        currentRound: 1,
        autoAdvance: true
      });
    });

    it('should reset round when changing format', () => {
      useQueueStore.getState().setMeetingFormat('roundRobin');
      // Manually set round to test reset
      useQueueStore.setState({ currentRound: 3 });
      
      useQueueStore.getState().setMeetingFormat('standard');
      
      expect(useQueueStore.getState().currentRound).toBe(1);
    });
  });
});