// ABOUTME: Tests for chat integration hook that posts queue updates to Zoom chat
// ABOUTME: Verifies message formatting, rate limiting, and command handling

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChatIntegration } from '../../hooks/useChatIntegration';
import type { Participant } from '../../types/participant';

// Mock the Zoom service
vi.mock('../../services/zoomService', () => ({
  ZoomService: vi.fn().mockImplementation(() => ({
    postToChat: vi.fn().mockResolvedValue(undefined),
    parseCommand: vi.fn((msg) => {
      if (!msg.startsWith('!')) return null;
      const parts = msg.slice(1).split(' ');
      return { command: parts[0], args: parts.slice(1) };
    })
  }))
}));

describe('useChatIntegration Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should post queue started message', async () => {
    const { result } = renderHook(() => useChatIntegration());

    const participants: Participant[] = [
      { id: '1', name: 'John Doe', position: 0, status: 'waiting', speakingTime: 0 },
      { id: '2', name: 'Jane Smith', position: 1, status: 'waiting', speakingTime: 0 },
    ];

    await act(async () => {
      await result.current.postQueueStarted(participants);
    });

    expect(result.current.lastMessage).toContain('Speaker Queue Started');
    expect(result.current.lastMessage).toContain('1. John Doe');
    expect(result.current.lastMessage).toContain('2. Jane Smith');
  });

  it('should post speaker change message', async () => {
    const { result } = renderHook(() => useChatIntegration());

    const current: Participant = {
      id: '1', name: 'John Doe', position: 0, status: 'completed', speakingTime: 120
    };
    const next: Participant = {
      id: '2', name: 'Jane Smith', position: 1, status: 'waiting', speakingTime: 0
    };

    await act(async () => {
      await result.current.postSpeakerChange(current, next);
    });

    expect(result.current.lastMessage).toBe('✅ John Doe finished (2:00) → Next: Jane Smith');
  });

  it('should post skip message', async () => {
    const { result } = renderHook(() => useChatIntegration());

    const skipped: Participant = {
      id: '1', name: 'John Doe', position: 0, status: 'skipped', speakingTime: 0
    };
    const next: Participant = {
      id: '2', name: 'Jane Smith', position: 1, status: 'waiting', speakingTime: 0
    };

    await act(async () => {
      await result.current.postSkip(skipped, next);
    });

    expect(result.current.lastMessage).toBe('⏭️ John Doe skipped → Next: Jane Smith');
  });

  it('should post queue completed message', async () => {
    const { result } = renderHook(() => useChatIntegration());

    await act(async () => {
      await result.current.postQueueCompleted();
    });

    expect(result.current.lastMessage).toBe('🎉 All speakers have finished!');
  });

  it('should respect rate limiting', async () => {
    const { result } = renderHook(() => useChatIntegration());

    // Post multiple messages quickly
    await act(async () => {
      await result.current.postQueueCompleted();
      await result.current.postQueueCompleted();
      await result.current.postQueueCompleted();
    });

    // Only first should post immediately
    expect(result.current.messageCount).toBe(1);

    // Advance time by 10 seconds
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Now another message should be allowed
    await act(async () => {
      await result.current.postQueueCompleted();
    });

    expect(result.current.messageCount).toBe(2);
  });

  it('should handle chat commands', () => {
    const { result } = renderHook(() => useChatIntegration());

    const skipCommand = result.current.parseCommand('!skip');
    expect(skipCommand).toEqual({ command: 'skip', args: [] });

    const orderCommand = result.current.parseCommand('!order alphabetical');
    expect(orderCommand).toEqual({ command: 'order', args: ['alphabetical'] });

    const notCommand = result.current.parseCommand('Hello world');
    expect(notCommand).toBeNull();
  });

  it('should format queue status', () => {
    const { result } = renderHook(() => useChatIntegration());

    const participants: Participant[] = [
      { id: '1', name: 'John Doe', position: 0, status: 'speaking', speakingTime: 60 },
      { id: '2', name: 'Jane Smith', position: 1, status: 'waiting', speakingTime: 0 },
      { id: '3', name: 'Bob Johnson', position: 2, status: 'paused', speakingTime: 0 },
      { id: '4', name: 'Alice Brown', position: 3, status: 'completed', speakingTime: 180 }
    ];

    // Enable verbose mode to show completed speakers
    act(() => {
      result.current.toggleVerboseMode();
    });

    const status = result.current.formatQueueStatus(participants);
    
    expect(status).toContain('🎤 Speaking: John Doe (1:00)');
    expect(status).toContain('📋 Up Next:');
    expect(status).toContain('1. Jane Smith');
    expect(status).toContain('2. Bob Johnson (paused)');
    expect(status).toContain('✅ Completed: Alice Brown');
  });

  it('should toggle verbose mode', () => {
    const { result } = renderHook(() => useChatIntegration());

    expect(result.current.verboseMode).toBe(false);

    act(() => {
      result.current.toggleVerboseMode();
    });

    expect(result.current.verboseMode).toBe(true);
  });

  it('should format time correctly', () => {
    const { result } = renderHook(() => useChatIntegration());

    expect(result.current.formatTime(0)).toBe('0:00');
    expect(result.current.formatTime(59)).toBe('0:59');
    expect(result.current.formatTime(60)).toBe('1:00');
    expect(result.current.formatTime(125)).toBe('2:05');
    expect(result.current.formatTime(3661)).toBe('61:01');
  });
});