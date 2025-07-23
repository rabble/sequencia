// ABOUTME: Main application component that orchestrates the speaker queue functionality
// ABOUTME: Integrates Zoom SDK, manages queue state, and renders the UI components

import { useEffect, useState } from 'react';
import { useQueueStore } from './store/queueStore';
import { CurrentSpeaker } from './components/CurrentSpeaker';
import { QueueList } from './components/QueueList';
import { ZoomService } from './services/zoomService';

function App() {
  const [error, setError] = useState<string | null>(null);

  const {
    participants,
    currentSpeaker,
    addParticipant,
    startSpeaking,
    endTurn,
    skipParticipant,
    pauseParticipant,
    unpauseParticipant,
    shuffleQueue,
    resetQueue,
    getQueueProgress
  } = useQueueStore();

  const currentSpeakerData = participants.find(p => p.id === currentSpeaker);
  const queueProgress = getQueueProgress();

  useEffect(() => {
    // Initialize Zoom SDK
    const initializeZoom = async () => {
      try {
        const service = new ZoomService();
        await service.initialize();

        // Fetch initial participants
        const zoomParticipants = await service.getParticipants();
        zoomParticipants.forEach(p => {
          addParticipant({ id: p.id, name: p.name });
        });

        // Subscribe to participant changes
        service.onParticipantsChange((updatedParticipants) => {
          // Handle participant updates
          console.log('Participants updated:', updatedParticipants);
        });

        // Subscribe to active speaker changes
        service.onActiveSpeakerChange((speakerIds) => {
          console.log('Active speakers:', speakerIds);
        });
      } catch (err) {
        console.error('Failed to initialize Zoom SDK:', err);
        setError('Failed to connect to Zoom. Running in demo mode.');
        
        // Add demo participants
        const demoParticipants = [
          { id: '1', name: 'John Doe' },
          { id: '2', name: 'Jane Smith' },
          { id: '3', name: 'Bob Johnson' },
          { id: '4', name: 'Alice Brown' }
        ];
        demoParticipants.forEach(p => addParticipant(p));
      }
    };

    initializeZoom();
  }, []);

  const handleStartQueue = () => {
    if (participants.length > 0 && !currentSpeaker) {
      const firstParticipant = participants.find(p => p.status === 'waiting');
      if (firstParticipant) {
        startSpeaking(firstParticipant.id);
      }
    }
  };

  const handleEndTurn = (id: string) => {
    endTurn(id);
  };

  const handleSkip = (id: string) => {
    skipParticipant(id);
    // Auto-advance to next
    const next = participants.find(p => p.status === 'waiting');
    if (next) {
      startSpeaking(next.id);
    }
  };

  const handlePause = (id: string) => {
    const participant = participants.find(p => p.id === id);
    if (participant) {
      if (participant.status === 'paused') {
        unpauseParticipant(id);
      } else {
        pauseParticipant(id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎤 Speaker Queue Manager
          </h1>
          {error && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded">
              {error}
            </div>
          )}
        </header>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Now Speaking</h2>
          <CurrentSpeaker
            speaker={currentSpeakerData || null}
            isActive={!!currentSpeaker}
            onEndTurn={handleEndTurn}
            onSkip={handleSkip}
            onPause={handlePause}
          />
        </section>

        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Up Next ({queueProgress.remaining} remaining)
            </h2>
            {!currentSpeaker && participants.length > 0 && (
              <button
                onClick={handleStartQueue}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Start Queue
              </button>
            )}
          </div>
          <QueueList
            participants={participants}
            onPause={handlePause}
          />
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Completed ({queueProgress.completed})
          </h2>
          <div className="space-y-2">
            {participants
              .filter(p => p.status === 'completed')
              .map(p => (
                <div key={p.id} className="bg-gray-100 p-3 rounded flex justify-between">
                  <span>✅ {p.name}</span>
                  <span className="text-gray-600">
                    {Math.floor(p.speakingTime / 60)}:{(p.speakingTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              ))}
          </div>
        </section>

        <section className="flex gap-4 justify-center">
          <button
            onClick={shuffleQueue}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔀 Shuffle
          </button>
          <button
            onClick={resetQueue}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ♻️ Reset
          </button>
        </section>
      </div>
    </div>
  );
}

export default App;