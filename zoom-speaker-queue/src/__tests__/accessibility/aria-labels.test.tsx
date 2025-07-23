// ABOUTME: Tests for ARIA labels and basic accessibility attributes
// ABOUTME: Focuses on verifying proper labeling for screen readers

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CurrentSpeaker } from '../../components/CurrentSpeaker';
import { QueueList } from '../../components/QueueList';
import type { Participant } from '../../types/participant';

describe('ARIA Labels', () => {
  it('should have proper ARIA labels on CurrentSpeaker buttons', () => {
    const mockSpeaker: Participant = {
      id: '1',
      name: 'John Doe',
      position: 0,
      status: 'speaking',
      speakingTime: 30
    };

    render(
      <CurrentSpeaker
        speaker={mockSpeaker}
        isActive={true}
        onEndTurn={vi.fn()}
        onSkip={vi.fn()}
        onPause={vi.fn()}
      />
    );

    // These tests will fail until we add the labels
    const endButton = screen.getByText('End Turn');
    expect(endButton.closest('button')).toHaveAttribute('aria-label', 'End turn for John Doe');
    
    const skipButton = screen.getByText('Skip');
    expect(skipButton.closest('button')).toHaveAttribute('aria-label', 'Skip John Doe');
    
    const pauseButton = screen.getByText('Pause');
    expect(pauseButton.closest('button')).toHaveAttribute('aria-label', 'Pause John Doe');
  });

  it('should have proper ARIA labels on queue list', () => {
    const participants: Participant[] = [
      { id: '1', name: 'John', position: 0, status: 'waiting', speakingTime: 0 },
      { id: '2', name: 'Jane', position: 1, status: 'paused', speakingTime: 0 }
    ];

    render(
      <QueueList
        participants={participants}
        onReorder={vi.fn()}
        onPause={vi.fn()}
      />
    );

    // Check for list accessibility
    const list = screen.getByRole('list');
    expect(list).toHaveAttribute('aria-label', 'Speaker queue');
    
    // Check list items
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveAttribute('aria-label', 'John, position 1 of 2, waiting');
    expect(items[1]).toHaveAttribute('aria-label', 'Jane, position 2 of 2, paused');
  });
});