// ABOUTME: Component that displays the queue of upcoming speakers with drag-and-drop reordering
// ABOUTME: Shows participant status, position, and provides inline controls for each participant

import React from 'react';
import type { Participant } from '../types/participant';

interface QueueListProps {
  participants: Participant[];
  onPause?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export const QueueList: React.FC<QueueListProps> = ({
  participants,
  onPause,
  onRemove
}) => {
  const upcomingParticipants = participants.filter(
    p => p.status === 'waiting' || p.status === 'paused'
  );

  if (upcomingParticipants.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        No participants in queue
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {upcomingParticipants.map((participant, index) => (
        <div
          key={participant.id}
          className={`flex items-center justify-between p-3 rounded-lg ${
            participant.status === 'paused' 
              ? 'bg-gray-100 text-gray-500' 
              : index === 0 
              ? 'bg-blue-50 border-blue-300 border'
              : 'bg-white border border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-gray-600">
              {participant.position + 1}.
            </span>
            <span className={`font-medium ${
              participant.status === 'paused' ? 'line-through' : ''
            }`}>
              {participant.name}
            </span>
            {participant.status === 'paused' && (
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">⏸️ Paused</span>
            )}
            {index === 0 && participant.status !== 'paused' && (
              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">Up Next</span>
            )}
          </div>
          
          <div className="flex gap-2">
            {onPause && (
              <button
                onClick={() => onPause(participant.id)}
                className="text-sm px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
              >
                {participant.status === 'paused' ? 'Resume' : 'Pause'}
              </button>
            )}
            {onRemove && (
              <button
                onClick={() => onRemove(participant.id)}
                className="text-sm px-2 py-1 text-red-600 hover:bg-red-50 rounded"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};