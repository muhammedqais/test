# MYFITNESS

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
- **Day planner** — a per-day view with an adjustable gym time and meal
  logging (breakfast, lunch, dinner, snacks) with item names, calories,
  per-meal subtotals and a daily total. Browse any past or future day.
- **Custom exercises** — add, edit, remove, and reorder the exercises of any
  workout day; create your own exercises (weight×reps or timed) alongside the
  built-in catalog. Logged history is never modified by edits.
- **Backup & restore** — export everything as a compact copyable backup code
  or a JSON file, and restore it on any device. No account or server needed.
- **Daily reminders at a chosen time** — pick a reminder time and get one
  notification a day with that day's scheduled workout. Fires exactly on
  time while the app runs; installed Android/Chrome PWAs also get it with
  the app closed via Periodic Background Sync (at or shortly after the
  chosen time). No push server involved, so iOS is foreground-only.
- **PWA** — `manifest.json`, icons, and a service worker (network-first
  navigations, stale-while-revalidate assets) make the app installable and
  offline-capable after the first visit. Safe-area aware for notched phones.

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
├── components/     # BottomNavigation, ExerciseCard, ExerciseForm, SetLogger,
│                   # WorkoutProgress, ExerciseGuide (SVG illustrations),
│                   # ProgressChart, PreviousPerformance
├── pages/          # Dashboard, WorkoutHome, ActiveWorkout, History, Progress,
│                   # ExerciseDetails, WorkoutEditor, Settings
├── data/           # workouts.js (exercise database + weekly schedule + live catalog)
├── storage/        # database.js (IndexedDB layer, backup/restore)
├── utils/          # dates.js, backup.js, reminders.js
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

MYFITNESS is a tracking and exercise-guide tool, not a medical application. It
never auto-increases weights and its cues favor controlled, comfortable ranges
of motion. Stop if movement causes pain, and skip any exercise a qualified
professional has restricted for you.
