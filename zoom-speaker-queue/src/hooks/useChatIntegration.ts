// ABOUTME: Hook for integrating with Zoom chat to post queue updates and handle commands
// ABOUTME: Manages message formatting, rate limiting, and chat command parsing

import { useState, useCallback, useRef } from 'react';
import { ZoomService } from '../services/zoomService';
import type { Participant } from '../types/participant';

interface ChatCommand {
  command: string;
  args: string[];
}

export const useChatIntegration = () => {
  const [lastMessage, setLastMessage] = useState<string>('');
  const [messageCount, setMessageCount] = useState(0);
  const [verboseMode, setVerboseMode] = useState(false);
  const zoomServiceRef = useRef<ZoomService | null>(null);
  const lastPostTime = useRef<number>(0);

  // Initialize zoom service on first use
  const getZoomService = useCallback(() => {
    if (!zoomServiceRef.current) {
      zoomServiceRef.current = new ZoomService();
    }
    return zoomServiceRef.current;
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const postMessage = useCallback(async (message: string) => {
    const now = Date.now();
    const timeSinceLastPost = now - lastPostTime.current;
    
    // Rate limit: 10 seconds between messages
    if (timeSinceLastPost < 10000 && lastPostTime.current > 0) {
      return; // Skip this message due to rate limiting
    }

    try {
      const service = getZoomService();
      await service.postToChat(message);
      setLastMessage(message);
      setMessageCount(prev => prev + 1);
      lastPostTime.current = now;
    } catch (error) {
      console.error('Failed to post to chat:', error);
    }
  }, [getZoomService]);

  const postQueueStarted = useCallback(async (participants: Participant[]) => {
    const waitingParticipants = participants.filter(p => 
      p.status === 'waiting' || p.status === 'paused'
    );
    
    let message = '🎤 Speaker Queue Started:\n';
    waitingParticipants.forEach((p, index) => {
      message += `${index + 1}. ${p.name}${p.status === 'paused' ? ' (paused)' : ''}\n`;
    });

    await postMessage(message.trim());
  }, [postMessage]);

  const postSpeakerChange = useCallback(async (current: Participant, next: Participant | null) => {
    const timeStr = formatTime(current.speakingTime);
    const message = next 
      ? `✅ ${current.name} finished (${timeStr}) → Next: ${next.name}`
      : `✅ ${current.name} finished (${timeStr})`;
    
    await postMessage(message);
  }, [postMessage, formatTime]);

  const postSkip = useCallback(async (skipped: Participant, next: Participant | null) => {
    const message = next
      ? `⏭️ ${skipped.name} skipped → Next: ${next.name}`
      : `⏭️ ${skipped.name} skipped`;
    
    await postMessage(message);
  }, [postMessage]);

  const postQueueCompleted = useCallback(async () => {
    await postMessage('🎉 All speakers have finished!');
  }, [postMessage]);

  const formatQueueStatus = useCallback((participants: Participant[]): string => {
    const speaking = participants.find(p => p.status === 'speaking');
    const waiting = participants.filter(p => p.status === 'waiting' || p.status === 'paused');
    const completed = participants.filter(p => p.status === 'completed');

    let status = '';
    
    if (speaking) {
      status += `🎤 Speaking: ${speaking.name} (${formatTime(speaking.speakingTime)})\n`;
    }
    
    if (waiting.length > 0) {
      status += '📋 Up Next:\n';
      waiting.forEach((p, index) => {
        status += `${index + 1}. ${p.name}${p.status === 'paused' ? ' (paused)' : ''}\n`;
      });
    }
    
    if (completed.length > 0 && verboseMode) {
      status += '✅ Completed: ';
      status += completed.map(p => p.name).join(', ');
    }

    return status.trim();
  }, [formatTime, verboseMode]);

  const parseCommand = useCallback((message: string): ChatCommand | null => {
    const service = getZoomService();
    return service.parseCommand(message);
  }, [getZoomService]);

  const toggleVerboseMode = useCallback(() => {
    setVerboseMode(prev => !prev);
  }, []);

  return {
    lastMessage,
    messageCount,
    verboseMode,
    postQueueStarted,
    postSpeakerChange,
    postSkip,
    postQueueCompleted,
    formatQueueStatus,
    parseCommand,
    toggleVerboseMode,
    formatTime
  };
};