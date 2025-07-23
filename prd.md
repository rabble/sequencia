# Product Requirements Document: Zoom Speaker Queue Manager

## Executive Summary
A Zoom App that automatically tracks and manages speaker order in meetings, providing visual queue management through an in-app interface and universal visibility through chat updates. This recreates the speaker order functionality from Around that helps facilitate organized discussions and ensure everyone gets their turn to speak.

## Goals and Objectives

### Primary Goals
1. **Facilitate organized discussions** - Ensure everyone knows when it's their turn to speak
2. **Reduce meeting chaos** - Eliminate interruptions and talking over each other
3. **Ensure inclusive participation** - Track who hasn't spoken and encourage participation
4. **Provide universal visibility** - All participants can see the order, even without the app

### Secondary Goals
- Minimize meeting facilitator overhead
- Create meeting analytics (speaking time distribution)
- Support various meeting formats (standup, brainstorming, presentations)

## User Stories

### As a Meeting Host
- I want to automatically generate a speaking order so I don't have to manage it manually
- I want to see who's next in line so I can prompt them if needed
- I want to skip absent participants so the meeting flows smoothly
- I want to see speaking time analytics so I can ensure balanced participation

### As a Participant
- I want to know when it's my turn so I can prepare
- I want to see my position in the queue so I can pay attention
- I want to indicate I'm done speaking so the next person knows to start
- I want to pass my turn if I'm not ready

### As a Non-App User
- I want to see speaker updates in chat so I know what's happening
- I want to know who's speaking next even if I don't have the app

## Functional Requirements

### Core Features

#### 1. Speaker Detection & Tracking
- **Detect audio start/stop events** for all participants
- **Track speaking duration** for each person
- **Identify current speaker** in real-time
- **Mark speakers as "completed"** after they finish

#### 2. Queue Management
- **Auto-generate initial order** (alphabetical, random, or by join time)
- **Manual reordering** via drag-and-drop
- **Skip functionality** for absent/unready participants
- **Pause/unpause** participants in queue
- **Add late joiners** to the queue

#### 3. Visual Interface (Side Panel)
- **Current speaker display** with timer
- **Queue visualization** with participant names and status
- **Control buttons** (End Turn, Skip, Pause)
- **Completed speakers list** with speaking duration
- **Queue management controls** (Shuffle, Reset, Clear)

#### 4. Chat Integration
- **Post initial order** when queue is set
- **Update on speaker changes** ("✅ John finished → Next: Sarah")
- **Respond to chat commands** (!skip, !reset, !order)
- **Configurable update frequency** to avoid spam

#### 5. Meeting Formats
- **Standard Queue** - Sequential order, one pass
- **Round Robin** - Multiple rounds, tracks rounds completed
- **Time Box** - Each speaker gets X minutes
- **Free Flow** - Track order but allow natural conversation

### Advanced Features

#### 6. Analytics Dashboard
- **Speaking time distribution** graph
- **Participation rate** (% who have spoken)
- **Average speaking duration**
- **Export meeting statistics**

#### 7. Customization
- **Custom prompts** for chat messages
- **Configurable time limits**
- **Theme selection** for UI
- **Preferred ordering methods**

## UI/UX Specifications

### Main Panel Layout
```
┌─────────────────────────────────┐
│ [⚙️] Speaker Queue Manager  [?] │
├─────────────────────────────────┤
│ 🎤 Now Speaking                 │
│ ┌─────────────────────────────┐ │
│ │ Sarah Johnson      02:45 ⏱️  │ │
│ │ [End Turn] [Skip] [Pause]   │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ 📋 Up Next (4 remaining)        │
│ ┌─────────────────────────────┐ │
│ │ 2. John Doe            ⋮⋮   │ │
│ │ 3. Lisa Park           ⋮⋮   │ │
│ │ 4. Mike Chen      [⏸️]  ⋮⋮   │ │
│ │ 5. Amy Wilson          ⋮⋮   │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ✅ Completed (2)                │
│ ┌─────────────────────────────┐ │
│ │ • Bob Smith (01:30)         │ │
│ │ • Emma Davis (02:15)        │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ [🔀 Shuffle] [♻️ Reset] [➕ Add] │
└─────────────────────────────────┘
```

### Visual States
- **Active speaker**: Green highlight with animated timer
- **Up next**: Blue highlight
- **Paused**: Grayed out with pause icon
- **Completed**: Checkmark with speaking duration
- **Skipped**: Strikethrough or moved to end

## Technical Requirements

### Zoom SDK Integration
- **Permissions needed**:
  - `sendAppInvitationToAllParticipants` - Chat messages
  - `getUserContext` - Get participant info
  - `listParticipants` - Get meeting roster
  - `onUserAudioStatusChange` - Audio events
  - `onMeetingParticipantsChange` - Join/leave events

### Technology Stack
- **Frontend**: React with TypeScript
- **UI Framework**: Material-UI or Ant Design
- **State Management**: Redux or Zustand
- **Drag-and-Drop**: react-beautiful-dnd
- **Build Tool**: Vite or Create React App

### Data Structure
```typescript
interface Participant {
  id: string;
  name: string;
  position: number;
  status: 'waiting' | 'speaking' | 'completed' | 'paused' | 'skipped';
  speakingTime: number;
  startTime?: Date;
}

interface QueueState {
  participants: Participant[];
  currentSpeaker: string | null;
  meetingFormat: 'standard' | 'roundRobin' | 'timeBox';
  round: number;
  settings: QueueSettings;
}
```

## Success Metrics
1. **Adoption Rate**: % of meeting participants who use the app
2. **Engagement**: Average number of speaker turns per meeting
3. **Meeting Efficiency**: Reduction in average meeting duration
4. **Participation Balance**: Standard deviation of speaking times
5. **User Satisfaction**: App store ratings and reviews

## Development Checklist

### Phase 1: MVP (Weeks 1-2)
- [ ] Set up Zoom App project structure
- [ ] Implement basic authentication
- [ ] Create participant list retrieval
- [ ] Build speaker detection logic
- [ ] Design basic queue UI
- [ ] Implement manual "End Turn" functionality
- [ ] Add chat posting for speaker changes
- [ ] Test with 3-5 person meetings

### Phase 2: Core Features (Weeks 3-4)
- [ ] Add drag-and-drop reordering
- [ ] Implement skip functionality
- [ ] Add pause/unpause for participants
- [ ] Create speaking timer
- [ ] Build completed speakers list
- [ ] Add shuffle and reset buttons
- [ ] Implement chat commands
- [ ] Add join/leave handling

### Phase 3: Polish (Weeks 5-6)
- [ ] Improve UI/UX design
- [ ] Add loading and error states
- [ ] Implement settings panel
- [ ] Add meeting format options
- [ ] Create onboarding flow
- [ ] Add keyboard shortcuts
- [ ] Optimize performance
- [ ] Write user documentation

### Phase 4: Advanced Features (Weeks 7-8)
- [ ] Build analytics dashboard
- [ ] Add export functionality
- [ ] Implement time-box mode
- [ ] Create round-robin tracking
- [ ] Add custom themes
- [ ] Build notification preferences
- [ ] Add integration tests
- [ ] Prepare for app store submission

### Phase 5: Launch Preparation
- [ ] Security review
- [ ] Zoom App marketplace requirements
- [ ] Create marketing materials
- [ ] Prepare support documentation
- [ ] Beta test with 10+ teams
- [ ] Performance optimization
- [ ] Set up analytics tracking
- [ ] Launch monitoring plan

## Risk Mitigation
1. **Zoom API limitations**: Maintain feature list that works within constraints
2. **Chat spam**: Implement smart filtering to only post important updates
3. **Performance with large meetings**: Test with 50+ participants
4. **User adoption**: Make onboarding seamless, provide clear value prop
5. **Audio detection accuracy**: Add manual overrides for edge cases

## Future Enhancements
- AI-powered queue optimization based on meeting context
- Integration with calendar apps for pre-meeting setup
- Speaking coach features (pace, filler words)
- Multi-language support
- Integration with meeting transcription
- Mobile app companion
