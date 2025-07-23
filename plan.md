Zoom Speaker Queue Manager

Product Requirements Document (PRD) v 2.0 – 23 Jul 2025

⸻

1. Executive Summary

Speaker Queue Manager is a Zoom App that automatically detects the active speaker, maintains a visible queue, and posts concise updates to chat so everyone—including participants who have not installed the app—always knows when it is their turn. The app reduces crosstalk, promotes inclusive participation, and provides lightweight analytics, all while keeping data on‑device unless the host explicitly opts in to export.

⸻

2. Goals & Success Metrics

Category	Goals	Primary Metrics (90‑day post‑launch targets)
Meeting flow	Orderly, interruption‑free discussions	• ≥ 60 % reduction in “double‑talk” events (measured by ≥ 2 active speakers)
Inclusivity	Balance speaking time	• Std‑dev of speaking time ≤ 40 % of mean in ≥ 50 % of meetings
Adoption & retention	Low first‑run friction	• Activation = 65 % of hosts who install run the queue in their next meeting • 4‑week host retention ≥ 40 %
Accessibility	Fully usable without a mouse or sight	• 100 % functions reachable via keyboard and screen‑reader labels (internal audit)
Privacy & compliance	Data never leaves client by default	• 0 recorded complaints about un‑consented data export


⸻

3. User Stories (∆ = new since v 1)

Host
	1.	Auto‑create and reorder speaker queue.
	2.	Skip or pause a participant to keep flow.
	3.	See live speaking timers + post‑meeting analytics.
	4.	∆ Select whether analytics are stored locally only or exported.

Participant
	1.	Know place in line and prepare.
	2.	Click “I’m done” or “Pass” if not ready.
	3.	∆ Use keyboard shortcuts instead of mouse.

Non‑app Participant
	1.	See succinct chat messages (e.g., “✅ Jo finished → Next Li”).
	2.	Retrieve current order on demand via !order.

Accessibility User
	1.	Navigate queue, end turn, or skip via screen reader and arrow/Enter keys.

Privacy‑sensitive User
	1.	Opt out of having speaking data included in exports.

⸻

4. Functional Requirements

#	Feature	Details / Edge‑cases
F1	Active‑Speaker Detection	Use onActiveSpeakerChange (array of IDs). End a turn after n ms of silence or manual “End Turn”. Fallback: host can press Ctrl + Space.
F2	Queue Management	Auto‑order: alphabetical, join time, or random; drag‑and‑drop; skip/pause; late‑join insertion.
F3	Chat Integration	Post initial order + updates ≤ 1 / 10 s; obey host/co‑host permission; respond to commands !skip, !order, !reset.
F4	Meeting Formats	Standard, Round Robin, Time‑Box, Free‑Flow with configurable silence‑timeout.
F5	Accessibility Layer	All controls reachable via keyboard; ARIA labels; color‑contrast AA.
F6	Privacy Controls	Local‑only analytics by default; explicit “Export CSV” requires host confirmation; ephemeral in‑meeting storage purged on leave.
F7	Analytics	Speaking‑time bar chart, participation rate, export CSV. Stored in localStorage unless exported.


⸻

5. UI / UX Specifications

Panel Layout (unchanged structure; add accessibility notes)
	•	Visual cues:
	•	Active speaker = green outline + pulse;
	•	Next up = blue bar;
	•	Paused = gray w/ ‘⏸’;
	•	Completed = faded + ✓.
	•	Keyboard map: Space = End Turn, S = Skip, P = Pause/un‑pause, R = Reset queue, ? = Help sheet.
	•	Screen‑reader live region announces: “Next speaker: {firstName}”.
	•	Dark / light themes (auto detect but toggleable).

⸻

6. Technical Requirements

Layer	Decision
Front‑end	Vite + React 18 + TypeScript
State	Zustand store with immer and selectors
DnD	@dnd‑kit/sortable (react‑beautiful‑dnd removed)
Styling	TailwindCSS + tailwind‑merge, Framer Motion for transitions
Zoom SDK	@zoom/appssdk v 1.10 – use onActiveSpeakerChange, postMessage, getMeetingContext, onParticipantsChange
Data	All analytics held in memory + optional localStorage; export produces client‑side CSV.
Testing	Vitest, React Testing Library, MSW (mock SDK); Playwright for E2E
Deployment	Cloudflare Pages; GitHub Actions CI/CD; enforced HTTPS
Security	CSP, Zoom event‑signature validation, OWASP headers via meta tags


⸻

7. Risks & Mitigations

Risk	Mitigation
Active‑speaker event gaps	Silence‑timeout fallback + manual override
Chat spam irritation	Default low‑verbosity mode; rate‑limit guard
Marketplace review delays	Book security review slot in W‑6; have privacy, TOS ready
Accessibility regression	Automated axe‑core tests in CI
Large meetings (50 +)	List virtualisation; state updates throttled to 60 fps


⸻

8. Development Roadmap & Checklist

Phase	Calendar (wk)	Key Deliverables	Exit Criteria
0. Setup	– (½ wk)	Repo, CI, Vite + TS skeleton, Zoom SDK auth stub	SDK getMeetingContext() returns OK locally
1. MVP	1–2	Active‑speaker listener, manual End Turn, basic queue UI, chat posts, local testing in 3–5‑person call	Host can run queue start→finish once
2. Core	3–4	Skip, pause, shuffle, drag‑and‑drop, silence‑timeout fallback, keyboard shortcuts	Feature‑complete for basic use; 90 % unit test pass
3. Polish	5–6	Accessibility pass, error boundaries, settings panel, onboarding tour	External beta w/ 5 teams positive feedback
4. Advanced	7–9	Time‑box & round‑robin modes, analytics dashboard, export CSV, theming	Host can export CSV; Lighthouse perf ≥ 85
5. Launch Prep	10–11	Privacy policy, marketplace assets, security doc, load tests, review iterations	Zoom marketplace “Approved” status
6. GA + Monitor	12	Production deploy, alerting, usage analytics	≤ 1 % error rate in first 2 weeks

A detailed tick‑box checklist (per phase) is provided in the prompt plan below.

⸻

9. AI Prompt Plan (engineering co‑pilot)

Each numbered prompt produces code or docs in a PR-sized chunk; prompts marked ∆ are new/changed.

#	Prompt Title & Goal	Output Checklist
1	Project Bootstrap	Vite + TS app, ESLint/Prettier, Tailwind config
2	Zoom SDK Auth Scaffold	ZoomContext provider; useZoomAuth hook; .env.example
3	∆ Active‑Speaker Prototype	Hook subscribing to onActiveSpeakerChange; logs array; Jest unit test
4	Participant Store (Zustand)	Types Participant, QueueState; actions add, reorder, setStatus
5	Basic Queue Panel UI	Layout with Now Speaking, Up Next, Completed lists
6	Chat Service	postChat, rate‑limit wrapper; minimal message templates
7	End‑Turn & Timer Logic	useSpeakingTimer, manual End Turn button; silence‑timeout param
8	∆ Keyboard & Screen‑Reader Support	ARIA labels, focus traps, key map; axe‑core test
9	DnD with @dnd‑kit	Sortable queue list; ghost animation
10	Skip / Pause / Shuffle	Store actions + UI buttons; confirm modal
11	Settings Panel	React‑Aria dialog; options: verbosity, timeout, theme
12	Round‑Robin / Time‑Box Modes	Mode selector; round tracker; countdown bar
13	Analytics Engine	useMeetingAnalytics; bar chart via Recharts; export CSV util
14	Error Boundaries & Fallbacks	Boundary component; offline view
15	Mock Zoom SDK for Tests	MSW handlers; sample participants fixture
16	CI/CD Pipeline	GitHub Actions: lint, test, build, deploy to Pages
17	∆ Privacy & Consent Banner	One‑time modal; localStorage flag; link to policy
18	Accessibility Regression Tests	npm run test:a11y with axe; CI gate
19	Performance Optimisations	Code‑splitting, TanStack Virtual list, memo selectors
20	Marketplace Manifest & Docs	zoomapp.yml, scopes table, privacy/TOS markdown
21	Load & Soak Tests	Playwright script simulating 60 participants; CPU/mem logs

How to use
	1.	Work top‑to‑bottom; each prompt is one PR.
	2.	Merge only when checklist items pass CI.
	3.	After Phase 3, run prompts 17–18 before accepting external beta users.
	4.	Keep prompts in /prompts/ folder to regenerate code on demand.

⸻

10. Appendix – Phase Checklists (abbreviated example)

Phase 1 MVP
	•	Prompt 1 merged; npm run dev serves HTTPS locally
	•	Prompt 2 merged; Zoom auth succeeds in sandbox call
	•	Prompt 3 merged; console logs active‑speaker IDs
	•	Prompt 4 merged; store actions covered by tests (≥ 90 % lines)
	•	Prompt 5 merged; host can click “Start Queue” and see order
	•	Prompt 6 merged; chat posts “Queue started” once
	•	Manual exploratory test in 3‑person meeting passes

(Phases 2–6 include similar granular lists in the repo’s /docs/checklists/*.md)

⸻

Ready to build

This PRD, roadmap, and prompt plan replace the earlier draft. Start with Prompt 1 to bootstrap the project, iterate through the checklists, and you’ll reach a security‑review‑ready build in roughly eleven calendar weeks.
