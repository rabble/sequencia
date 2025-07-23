// ABOUTME: Hook for handling keyboard shortcuts throughout the application
// ABOUTME: Manages global keyboard events for queue control and navigation

import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsProps {
  onStartQueue?: () => void;
  onEndTurn?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onShuffle?: () => void;
  isQueueActive: boolean;
}

export const useKeyboardShortcuts = ({
  onStartQueue,
  onEndTurn,
  onPause,
  onReset,
  onShuffle,
  isQueueActive
}: KeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    if (e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement) {
      return;
    }

    // Check for modifier keys
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    switch (e.key.toLowerCase()) {
      case 's':
        e.preventDefault();
        if (!isQueueActive && onStartQueue) {
          onStartQueue();
        }
        break;
      
      case ' ':
        e.preventDefault();
        if (isQueueActive && onEndTurn) {
          onEndTurn();
        }
        break;
      
      case 'p':
        e.preventDefault();
        if (isQueueActive && onPause) {
          onPause();
        }
        break;
      
      case 'r':
        e.preventDefault();
        if (e.shiftKey && onReset) {
          onReset();
        } else if (!e.shiftKey && onShuffle) {
          onShuffle();
        }
        break;
    }
  }, [isQueueActive, onStartQueue, onEndTurn, onPause, onReset, onShuffle]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Return shortcut info for display
  return {
    shortcuts: [
      { key: 'S', description: 'Start queue', enabled: !isQueueActive },
      { key: 'Space', description: 'End turn', enabled: isQueueActive },
      { key: 'P', description: 'Pause/Resume', enabled: isQueueActive },
      { key: 'R', description: 'Shuffle queue', enabled: true },
      { key: 'Shift+R', description: 'Reset queue', enabled: true }
    ]
  };
};