// ABOUTME: Component that displays countdown timer for auto-advance between speakers
// ABOUTME: Shows visual countdown and allows canceling auto-advance

import React, { useEffect, useState } from 'react';
import { useQueueStore } from '../store/queueStore';

export const AutoAdvanceCountdown: React.FC = () => {
  const [countdown, setCountdown] = useState(0);
  const { 
    getAutoAdvanceCountdown, 
    autoAdvanceTimer,
    startSpeaking,
    getNextSpeaker
  } = useQueueStore();

  useEffect(() => {
    if (autoAdvanceTimer) {
      const interval = setInterval(() => {
        const remaining = getAutoAdvanceCountdown();
        setCountdown(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 100); // Update every 100ms for smooth countdown

      return () => clearInterval(interval);
    } else {
      setCountdown(0);
    }
  }, [autoAdvanceTimer, getAutoAdvanceCountdown]);

  const handleSkipCountdown = () => {
    const nextSpeaker = getNextSpeaker();
    if (nextSpeaker) {
      startSpeaking(nextSpeaker.id);
    }
  };

  if (!autoAdvanceTimer || countdown === 0) {
    return null;
  }

  const progressPercentage = (countdown / useQueueStore.getState().autoAdvanceDelay) * 100;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-800">
          Next speaker starts in {countdown}s
        </span>
        <button
          onClick={handleSkipCountdown}
          className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          aria-label="Start next speaker now"
        >
          Start Now
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-blue-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-100"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={countdown}
          aria-valuemin={0}
          aria-valuemax={useQueueStore.getState().autoAdvanceDelay}
        />
      </div>
    </div>
  );
};