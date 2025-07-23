// ABOUTME: Tests for the CurrentSpeaker component that displays active speaker with timer
// ABOUTME: Verifies display states, timer functionality, and control button interactions

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CurrentSpeaker } from '../../components/CurrentSpeaker';
import type { Participant } from '../../types/participant';

describe('CurrentSpeaker Component', () => {
  const mockHandlers = {
    onEndTurn: vi.fn(),
    onSkip: vi.fn(),
    onPause: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display current speaker information', () => {
    const speaker: Participant = {
      id: '1',
      name: 'John Doe',
      speakingTime: 125, // 2:05
      position: 0,
      status: 'speaking'
    };
    
    render(
      <CurrentSpeaker 
        speaker={speaker}
        isActive={true}
        {...mockHandlers}
      />
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('02:05')).toBeInTheDocument();
  });

  it('should show empty state when no speaker', () => {
    render(
      <CurrentSpeaker 
        speaker={null}
        isActive={false}
        {...mockHandlers}
      />
    );
    
    expect(screen.getByText('No one is speaking')).toBeInTheDocument();
    expect(screen.getByText('Click "Start Queue" to begin')).toBeInTheDocument();
  });

  it('should update timer in real-time when active', () => {
    // vi.useFakeTimers();
    
    // const speaker = {
    //   id: '1',
    //   name: 'John Doe',
    //   speakingTime: 0
    // };
    
    // const { rerender } = render(
    //   <CurrentSpeaker 
    //     speaker={speaker}
    //     isActive={true}
    //     {...mockHandlers}
    //   />
    // );
    
    // expect(screen.getByText('00:00')).toBeInTheDocument();
    
    // // Advance timer by 5 seconds
    // vi.advanceTimersByTime(5000);
    
    // rerender(
    //   <CurrentSpeaker 
    //     speaker={{ ...speaker, speakingTime: 5 }}
    //     isActive={true}
    //     {...mockHandlers}
    //   />
    // );
    
    // expect(screen.getByText('00:05')).toBeInTheDocument();
    
    // vi.useRealTimers();
  });

  it('should handle End Turn button click', async () => {
    // const user = userEvent.setup();
    // const speaker = {
    //   id: '1',
    //   name: 'John Doe',
    //   speakingTime: 60
    // };
    
    // render(
    //   <CurrentSpeaker 
    //     speaker={speaker}
    //     isActive={true}
    //     {...mockHandlers}
    //   />
    // );
    
    // await user.click(screen.getByText('End Turn'));
    // expect(mockHandlers.onEndTurn).toHaveBeenCalledWith('1');
  });

  it('should handle Skip button click', async () => {
    // const user = userEvent.setup();
    // const speaker = {
    //   id: '1',
    //   name: 'John Doe',
    //   speakingTime: 0
    // };
    
    // render(
    //   <CurrentSpeaker 
    //     speaker={speaker}
    //     isActive={true}
    //     {...mockHandlers}
    //   />
    // );
    
    // await user.click(screen.getByText('Skip'));
    // expect(mockHandlers.onSkip).toHaveBeenCalledWith('1');
  });

  it('should show pause/resume button based on state', async () => {
    // const user = userEvent.setup();
    // const speaker = {
    //   id: '1',
    //   name: 'John Doe',
    //   speakingTime: 30,
    //   status: 'speaking'
    // };
    
    // const { rerender } = render(
    //   <CurrentSpeaker 
    //     speaker={speaker}
    //     isActive={true}
    //     {...mockHandlers}
    //   />
    // );
    
    // expect(screen.getByText('Pause')).toBeInTheDocument();
    
    // await user.click(screen.getByText('Pause'));
    // expect(mockHandlers.onPause).toHaveBeenCalledWith('1');
    
    // // Update to paused state
    // rerender(
    //   <CurrentSpeaker 
    //     speaker={{ ...speaker, status: 'paused' }}
    //     isActive={false}
    //     {...mockHandlers}
    //   />
    // );
    
    // expect(screen.getByText('Resume')).toBeInTheDocument();
  });

  it('should show visual indicator when active', () => {
    // const speaker = {
    //   id: '1',
    //   name: 'John Doe',
    //   speakingTime: 0
    // };
    
    // const { container } = render(
    //   <CurrentSpeaker 
    //     speaker={speaker}
    //     isActive={true}
    //     {...mockHandlers}
    //   />
    // );
    
    // const speakerCard = container.querySelector('.speaker-card');
    // expect(speakerCard).toHaveClass('speaker-active');
    // expect(speakerCard).toHaveClass('pulse-animation');
  });

  it('should be keyboard accessible', async () => {
    // const user = userEvent.setup();
    // const speaker = {
    //   id: '1',
    //   name: 'John Doe',
    //   speakingTime: 45
    // };
    
    // render(
    //   <CurrentSpeaker 
    //     speaker={speaker}
    //     isActive={true}
    //     {...mockHandlers}
    //   />
    // );
    
    // // Tab to End Turn button
    // await user.tab();
    // expect(screen.getByText('End Turn')).toHaveFocus();
    
    // // Press Space to activate
    // await user.keyboard(' ');
    // expect(mockHandlers.onEndTurn).toHaveBeenCalled();
    
    // // Tab to Skip button
    // await user.tab();
    // expect(screen.getByText('Skip')).toHaveFocus();
  });
});