// ABOUTME: Mock implementation of Zoom SDK for testing purposes
// ABOUTME: Provides controllable mock functions for all SDK methods used in tests

import { vi } from 'vitest';

const mockZoomSdk = {
  config: vi.fn().mockResolvedValue({ success: true }),
  getMeetingContext: vi.fn().mockResolvedValue({
    meetingID: '123456789',
    meetingTopic: 'Test Meeting'
  }),
  listParticipants: vi.fn().mockResolvedValue({
    participants: [
      { userGUID: '1', displayName: 'John Doe', audio: true },
      { userGUID: '2', displayName: 'Jane Smith', audio: false }
    ]
  }),
  postMessage: vi.fn().mockResolvedValue({ success: true }),
  onActiveSpeakerChange: vi.fn(),
  onParticipantsChange: vi.fn()
};

export default mockZoomSdk;