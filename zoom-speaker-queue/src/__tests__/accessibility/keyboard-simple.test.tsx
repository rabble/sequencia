// ABOUTME: Simple keyboard navigation test
// ABOUTME: Tests basic keyboard functionality

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueueList } from '../../components/QueueList';
import type { Participant } from '../../types/participant';

describe('Simple Keyboard Navigation', () => {
  it('should handle arrow key navigation', async () => {
    const user = userEvent.setup();
    const participants: Participant[] = [
      { id: '1', name: 'John', position: 0, status: 'waiting', speakingTime: 0 },
      { id: '2', name: 'Jane', position: 1, status: 'waiting', speakingTime: 0 }
    ];

    render(
      <QueueList
        participants={participants}
        onReorder={vi.fn()}
        onPause={vi.fn()}
      />
    );

    const listItems = screen.getAllByRole('listitem');
    
    // Click to focus first item
    await user.click(listItems[0]);
    expect(document.activeElement).toBe(listItems[0]);

    // Arrow down
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(listItems[1]);

    // Arrow up
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(listItems[0]);
  });
});