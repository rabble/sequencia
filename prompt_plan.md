# Zoom Speaker Queue Manager - AI Prompt Plan

## Project Setup & Architecture

### Prompt 1: Initial Project Setup
```
Create a new Vite React TypeScript project for a Zoom App called "Speaker Queue Manager". Set up the project structure with:
- Vite config optimized for Zoom Apps (needs to be served over HTTPS)
- TypeScript configuration
- Folder structure: /src/components, /src/hooks, /src/store, /src/utils, /src/types
- Basic Zoom App SDK integration
- Environment variables for Zoom App credentials
- Cloudflare Pages configuration (note: not Workers, as Zoom Apps need to serve a client-side app)
```

### Prompt 2: Zoom SDK Setup
```
Implement the Zoom App SDK initialization and authentication flow:
- Install @zoom/appssdk
- Create a ZoomContext provider that initializes the SDK
- Set up error handling for SDK initialization
- Create utility functions for common Zoom SDK calls
- Add TypeScript types for Zoom SDK responses
- Test the connection with a simple getMeetingContext call
```

## Core Functionality

### Prompt 3: Participant Management
```
Create the participant tracking system:
- Hook to fetch and monitor participant list using Zoom SDK
- Data structure for tracking participants with: id, name, position, status (waiting/speaking/completed/paused), speakingTime
- Handle participant join/leave events
- Create a Zustand store for managing participant state
- Utility functions for reordering participants
Include TypeScript interfaces for all data structures
```

### Prompt 4: Audio Detection System
```
Implement speaker detection using Zoom SDK audio events:
- Set up listener for onUserAudioStatusChange events
- Track current speaker with timestamp
- Calculate speaking duration
- Auto-advance to next speaker when current stops talking (with configurable delay)
- Handle edge cases: multiple people talking, brief pauses
- Create a useSpeakerDetection hook
```

### Prompt 5: Chat Integration
```
Build the chat posting system:
- Function to post formatted messages to Zoom chat
- Queue status templates: initial order, speaker changes, queue updates
- Rate limiting to prevent spam (max 1 update per 10 seconds)
- Chat command parser for: !skip, !reset, !status, !help
- Error handling for chat API failures
- Configurable chat output (verbose/minimal modes)
```

## UI Components

### Prompt 6: Main UI Layout
```
Create the main React component layout for the Zoom App panel:
- Header with app title and settings button
- Current Speaker section with name, timer, and control buttons
- Queue list with drag-and-drop capability using @dnd-kit/sortable
- Completed speakers section
- Footer with queue control buttons
Use Tailwind CSS for styling with a clean, modern design
Make it responsive for different panel sizes
```

### Prompt 7: Current Speaker Component
```
Build the Current Speaker component with:
- Large display of speaker name
- Live timer showing speaking duration (MM:SS format)
- Visual indicators (pulsing border when active)
- Control buttons: End Turn, Skip, Pause
- Auto-advance countdown indicator
- Smooth transitions between speakers
- Handle case when no one is speaking
```

### Prompt 8: Queue List Component
```
Create the Queue List component with:
- Numbered list of upcoming speakers
- Drag-and-drop to reorder (using @dnd-kit/sortable)
- Visual states: next up (highlighted), paused (grayed out), normal
- Inline controls per participant: pause/unpause, remove
- Empty state when queue is empty
- Smooth animations for reordering
- Touch-friendly drag handles
```

### Prompt 9: Queue Controls
```
Implement queue control buttons and modals:
- Shuffle button with confirmation
- Reset button to restore original order
- Add participant modal/dropdown
- Settings modal for: auto-advance delay, chat verbosity, queue mode
- Clear all button
- Round robin mode toggle
- Time limit per speaker setting
```

## State Management & Business Logic

### Prompt 10: State Management
```
Create a complete Zustand store for the app state:
- Participants array with all tracking data
- Current speaker ID and start time
- Queue settings (auto-advance, time limits, chat mode)
- Meeting metadata
- UI state (modals, drag state)
- Actions: reorder, skip, pause, complete, reset, shuffle
- Persist settings to localStorage
- Computed values: next speaker, queue progress
```

### Prompt 11: Business Logic Hooks
```
Create custom hooks for core business logic:
- useQueueManager: orchestrates all queue operations
- useAutoAdvance: handles automatic progression with configurable delay
- useSpeakingTimer: tracks and formats speaking time
- useChatAnnouncements: manages chat posting logic
- useKeyboardShortcuts: space to end turn, S to skip, etc.
- useMeetingAnalytics: calculate stats like avg speaking time
```

## Advanced Features

### Prompt 12: Meeting Formats
```
Implement different meeting format modes:
- Standard: One pass through the queue
- Round Robin: Multiple rounds, track round number
- Time Box: Enforce time limits with warnings
- Free Flow: Track order but don't auto-advance
Create a format selector and adapt UI/logic for each mode
Show round number and remaining speakers per round
```

### Prompt 13: Analytics Dashboard
```
Build an analytics view showing:
- Bar chart of speaking times per participant
- Participation rate (% who have spoken)
- Average speaking duration
- Total meeting time tracked
- Export to CSV functionality
- Use Recharts or Chart.js for visualizations
- Collapsible panel or modal view
```

## Deployment & Testing

### Prompt 14: Build Configuration
```
Set up the build and deployment pipeline:
- Vite build configuration for production
- Environment variable handling for Zoom credentials
- Cloudflare Pages deployment setup (not Workers - Zoom Apps need static hosting)
- GitHub Actions workflow for CI/CD
- Preview deployments for PRs
- Production deployment on main branch
- HTTPS configuration (required for Zoom Apps)
```

### Prompt 15: Testing & Error Handling
```
Implement comprehensive error handling and testing:
- Error boundaries for React components
- Fallback UI for SDK connection failures  
- Mock Zoom SDK for local development
- Unit tests for queue logic using Vitest
- Integration tests for Zoom SDK interactions
- E2E tests for critical user flows
- Logging system for debugging production issues
```

### Prompt 16: Zoom App Submission Prep
```
Prepare for Zoom App Marketplace submission:
- Create app manifest file
- Add required OAuth scopes documentation
- Create privacy policy page
- Build user documentation/help page
- Add analytics tracking (with user consent)
- Implement rate limiting for API calls
- Create demo video script
- Prepare marketplace listing content
```

## Production Readiness

### Prompt 17: Performance Optimization
```
Optimize the app for production:
- Lazy load components not immediately visible
- Optimize re-renders with React.memo
- Debounce drag operations
- Virtualize long participant lists
- Minimize bundle size (analyze with rollup-plugin-visualizer)
- Add loading states for all async operations
- Implement progressive enhancement
```

### Prompt 18: Polish & UX
```
Add final polish and UX improvements:
- Smooth animations with Framer Motion
- Sound effects for speaker changes (optional)
- Keyboard navigation throughout the app
- Screen reader support (ARIA labels)
- Dark mode support
- Onboarding tour for first-time users
- Helpful empty states
- Success/error toast notifications
```

## Usage Instructions

1. **Start with Prompts 1-2** to get the basic infrastructure working
2. **Test connection to Zoom SDK** before proceeding
3. **Build core features** (Prompts 3-5) to get basic functionality
4. **Add UI** (Prompts 6-9) once core logic works
5. **Refine state management** (Prompts 10-11) as complexity grows
6. **Add advanced features** (Prompts 12-13) after MVP works
7. **Deploy and test** (Prompts 14-16) when ready for real meetings
8. **Polish** (Prompts 17-18) based on user feedback

## Notes on Cloudflare Deployment

**Important**: Zoom Apps run as iframes in the Zoom client, so they need to be traditional web apps, not Cloudflare Workers. Use **Cloudflare Pages** instead:

```bash
# Deploy to Cloudflare Pages
npm run build
npx wrangler pages deploy dist --project-name=speaker-queue-manager
```

The app will be served as static files with client-side JavaScript, which is what Zoom Apps expect.
