// ABOUTME: Tests for auto-advance functionality with configurable delay
// ABOUTME: Verifies automatic speaker progression after turn completion

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useQueueStore } from '../../store/queueStore';

describe('Auto-Advance Feature', () => {
  beforeEach(() => {
    // Reset store
    useQueueStore.getState().resetQueue();
    useQueueStore.setState({ 
      participants: [], 
      currentSpeaker: null,
      autoAdvanceDelay: 3,
      autoAdvanceEnabled: true
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should auto-advance to next speaker after delay', async () => {
    // Add participants
    useQueueStore.getState().addParticipant({ id: '1', name: 'John' });
    useQueueStore.getState().addParticipant({ id: '2', name: 'Jane' });
    
    // Start first speaker
    useQueueStore.getState().startSpeaking('1');
    expect(useQueueStore.getState().currentSpeaker).toBe('1');
    
    // End turn
    useQueueStore.getState().endTurn('1');
    
    // Should not advance immediately
    expect(useQueueStore.getState().currentSpeaker).toBe(null);
    
    // Advance time by configured delay
    await vi.advanceTimersByTimeAsync(3000);
    
    // Should now advance to next speaker
    expect(useQueueStore.getState().currentSpeaker).toBe('2');
  });

  it('should cancel auto-advance if manually started', async () => {
    useQueueStore.getState().addParticipant({ id: '1', name: 'John' });
    useQueueStore.getState().addParticipant({ id: '2', name: 'Jane' });
    useQueueStore.getState().addParticipant({ id: '3', name: 'Bob' });
    
    // Start and end first speaker
    useQueueStore.getState().startSpeaking('1');
    useQueueStore.getState().endTurn('1');
    
    // Advance halfway through delay
    await vi.advanceTimersByTimeAsync(1500);
    
    // Manually start a different speaker
    useQueueStore.getState().startSpeaking('3');
    
    // Complete the delay period
    await vi.advanceTimersByTimeAsync(1500);
    
    // Should still be speaker 3, not 2
    expect(useQueueStore.getState().currentSpeaker).toBe('3');
  });

  it('should respect auto-advance enabled setting', async () => {
    useQueueStore.getState().setAutoAdvance(false);
    
    useQueueStore.getState().addParticipant({ id: '1', name: 'John' });
    useQueueStore.getState().addParticipant({ id: '2', name: 'Jane' });
    
    // Start and end first speaker
    useQueueStore.getState().startSpeaking('1');
    useQueueStore.getState().endTurn('1');
    
    // Advance past delay
    await vi.advanceTimersByTimeAsync(5000);
    
    // Should not auto-advance
    expect(useQueueStore.getState().currentSpeaker).toBe(null);
  });

  it('should allow configuring auto-advance delay', () => {
    const store = useQueueStore.getState();
    
    expect(store.autoAdvanceDelay).toBe(3);
    
    store.setAutoAdvanceDelay(5);
    expect(useQueueStore.getState().autoAdvanceDelay).toBe(5);
    
    // Should clamp to valid range (0-30 seconds)
    store.setAutoAdvanceDelay(-1);
    expect(useQueueStore.getState().autoAdvanceDelay).toBe(0);
    
    store.setAutoAdvanceDelay(100);
    expect(useQueueStore.getState().autoAdvanceDelay).toBe(30);
  });

  it('should show countdown during auto-advance delay', async () => {
    useQueueStore.getState().addParticipant({ id: '1', name: 'John' });
    useQueueStore.getState().addParticipant({ id: '2', name: 'Jane' });
    
    useQueueStore.getState().startSpeaking('1');
    useQueueStore.getState().endTurn('1');
    
    // Check countdown
    expect(useQueueStore.getState().getAutoAdvanceCountdown()).toBe(3);
    
    await vi.advanceTimersByTimeAsync(1000);
    expect(useQueueStore.getState().getAutoAdvanceCountdown()).toBe(2);
    
    await vi.advanceTimersByTimeAsync(1000);
    expect(useQueueStore.getState().getAutoAdvanceCountdown()).toBe(1);
    
    await vi.advanceTimersByTimeAsync(1000);
    expect(useQueueStore.getState().getAutoAdvanceCountdown()).toBe(0);
    expect(useQueueStore.getState().currentSpeaker).toBe('2');
  });

  it('should work with meeting format modes', async () => {
    useQueueStore.getState().setMeetingFormat('roundRobin');
    useQueueStore.getState().addParticipant({ id: '1', name: 'John' });
    useQueueStore.getState().addParticipant({ id: '2', name: 'Jane' });
    
    // First round
    useQueueStore.getState().startSpeaking('1');
    useQueueStore.getState().endTurn('1');
    
    await vi.advanceTimersByTimeAsync(3000);
    expect(useQueueStore.getState().currentSpeaker).toBe('2');
    
    // End second speaker
    useQueueStore.getState().endTurn('2');
    
    // Should auto-advance to new round
    await vi.advanceTimersByTimeAsync(3000);
    expect(useQueueStore.getState().currentSpeaker).toBe('1');
    expect(useQueueStore.getState().currentRound).toBe(2);
  });
});