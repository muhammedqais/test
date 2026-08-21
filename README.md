# FemurFit Tracker

A mobile-first fitness tracker Progressive Web App for a fixed 4-day weekly
training plan. Built with React + Vite, persisted entirely in the browser with
IndexedDB, installable to a phone home screen, and fully functional offline.

## Features

- **Automatic weekly schedule** — the app maps the current weekday to the plan
  (Upper A · Lower A · Recovery · Recovery · Upper B · Lower B · Rest); nothing
  is hard-coded to a date.
- **Dashboard** with today's workout card, week overview with
  completed/today/upcoming/rest states, current date and ISO week.
- **Active workout mode** — one exercise at a time with an illustrated guide,
  concise instructions, safety notes, target sets/reps, and back/forward
  navigation.
- **Set logging** — large numeric inputs (decimal weights supported), one-tap
  logging with confirmation states, duration input for timed core work, and
  editable logged sets.
- **Previous-session comparison** shown for every exercise before logging.
- **Crash-proof drafts** — every keystroke and logged set is persisted to
  IndexedDB (debounced), so a refresh or closed tab never loses data; an
  in-progress workout resumes automatically.
- **Workout completion** flow with summary, save confirmation, and next
  scheduled workout.
- **History** — chronological session list with full per-set detail views.
- **Progress charts** — weight/duration and reps over time per exercise, plus
  session/set counters, rendered as dependency-free SVG.
- **Sample data** — optional demo sessions for previewing History/Progress,
  always flagged with a "Sample" badge and removable in one tap.
- **PWA** — `manifest.json`, icons, and a service worker (network-first
  navigations, stale-while-revalidate assets) make the app installable and
  offline-capable after the first visit.

## Development

```bash
npm install
npm run dev       # local dev server
npm run build     # production build to dist/
npm run preview   # serve the production build (service worker active)
npm run icons     # regenerate public/icons/*.png (no dependencies needed)
```

The service worker only registers in production builds — use
`npm run build && npm run preview` to test offline behavior and installation.

## Project structure

```
src/
├── components/     # BottomNavigation, ExerciseCard, SetLogger, WorkoutProgress,
│                   # ExerciseGuide (SVG illustrations), ProgressChart, PreviousPerformance
├── pages/          # Dashboard, WorkoutHome, ActiveWorkout, History, Progress, ExerciseDetails
├── data/           # workouts.js (exercise database + weekly schedule), sampleData.js
├── storage/        # database.js (IndexedDB layer)
├── utils/          # dates.js
├── App.jsx
└── main.jsx
public/
├── manifest.json
├── sw.js
└── icons/
```

## Data model

- **WorkoutSession** — `id`, `date`, `workoutId`, `completed`, `exercises[]`,
  `cardio`, timestamps, optional `sample` flag.
- **ExerciseLog** — `exerciseId`, `sets[]`.
- **Set** — `setNumber`, `weight`, `reps`, `duration`, `completed`, `timestamp`.
- **Exercise** (seeded in `src/data/workouts.js`) — `id`, `name`, `category`,
  `type`, `targetSets`, `targetReps`/`targetDuration`, `instructions`,
  `illustration`, `notes`.

All data stays in the browser — there is no backend and no login.

## A note on safety

FemurFit is a tracking and exercise-guide tool, not a medical application. It
never auto-increases weights and its cues favor controlled, comfortable ranges
of motion. Stop if movement causes pain, and skip any exercise a qualified
professional has restricted for you.
