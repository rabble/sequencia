// ABOUTME: Component that displays the current speaker with real-time timer and controls
// ABOUTME: Shows speaker name, duration, and provides buttons to end turn, skip, or pause

import React, { useEffect, useState } from 'react';
import type { Participant } from '../types/participant';

interface CurrentSpeakerProps {
  speaker: Participant | null;
  isActive: boolean;
  onEndTurn: (id: string) => void;
  onSkip: (id: string) => void;
  onPause: (id: string) => void;
}

export const CurrentSpeaker: React.FC<CurrentSpeakerProps> = ({
  speaker,
  isActive,
  onEndTurn,
  onSkip,
  onPause
}) => {
  const [elapsedTime, setElapsedTime] = useState(speaker?.speakingTime || 0);

  useEffect(() => {
    setElapsedTime(speaker?.speakingTime || 0);
  }, [speaker?.speakingTime]);

  useEffect(() => {
    if (isActive && speaker && speaker.status !== 'paused') {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive, speaker]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!speaker) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 text-center">
        <p className="text-gray-600 text-lg">No one is speaking</p>
        <p className="text-gray-500 text-sm mt-2">Click "Start Queue" to begin</p>
      </div>
    );
  }

  const isPaused = speaker.status === 'paused';
  const speakerTime = isActive && !isPaused ? elapsedTime : speaker.speakingTime;

  return (
    <div className={`speaker-card rounded-lg p-6 ${isActive && !isPaused ? 'speaker-active pulse-animation' : ''}`}>
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-bold">{speaker.name}</h2>
        <div className="text-4xl font-mono mt-4" data-testid="speaker-timer">
          {formatTime(speakerTime)}
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onEndTurn(speaker.id)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            aria-label={`End turn for ${speaker.name}`}
          >
            End Turn
          </button>
          
          <button
            onClick={() => onSkip(speaker.id)}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            aria-label={`Skip ${speaker.name}`}
          >
            Skip
          </button>
          
          <button
            onClick={() => onPause(speaker.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            aria-label={isPaused ? `Resume ${speaker.name}` : `Pause ${speaker.name}`}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>
    </div>
  );
};