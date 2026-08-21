// Master exercise database and the weekly schedule.
// The app is seeded entirely from this file — no manual setup required.

export const EXERCISES = {
  'lat-pulldown': {
    id: 'lat-pulldown',
    name: 'Lat Pulldowns',
    category: 'Back',
    type: 'strength',
    targetSets: 3,
    targetReps: '10–12',
    illustration: 'latPulldown',
    instructions: [
      'Sit securely with thighs positioned under the pads.',
      'Grip the bar comfortably.',
      'Pull toward the upper chest with controlled movement.',
      'Return the bar slowly.'
    ],
    notes: 'Choose a manageable resistance. Avoid leaning far back.'
  },
  'db-incline-press': {
    id: 'db-incline-press',
    name: 'Dumbbell Incline Bench Press',
    category: 'Chest',
    type: 'strength',
    targetSets: 3,
    targetReps: '10–12',
    illustration: 'inclinePress',
    instructions: [
      'Set the bench to a comfortable incline.',
      'Keep the dumbbells controlled throughout the movement.',
      'Press upward without bouncing.',
      'Lower the dumbbells slowly.'
    ],
    notes: 'Keep feet planted and back supported on the bench.'
  },
  'seated-cable-row': {
    id: 'seated-cable-row',
    name: 'Seated Cable Rows',
    category: 'Back',
    type: 'strength',
    targetSets: 3,
    targetReps: '12',
    illustration: 'cableRow',
    instructions: [
      'Sit tall with feet braced on the platform.',
      'Pull the handle toward your torso.',
      'Keep shoulders relaxed, not shrugged.',
      'Return with control — no jerking.'
    ],
    notes: 'Use a comfortable, controlled range of motion.'
  },
  'db-lateral-raise': {
    id: 'db-lateral-raise',
    name: 'Dumbbell Lateral Raises',
    category: 'Shoulders',
    type: 'strength',
    targetSets: 3,
    targetReps: '15',
    illustration: 'lateralRaise',
    instructions: [
      'Stand tall with a light dumbbell in each hand.',
      'Raise arms out to the sides to about shoulder height.',
      'Keep a slight bend in the elbows.',
      'Lower slowly — no swinging.'
    ],
    notes: 'Light weight, strict form. Stop if movement causes pain.'
  },
  'tricep-pushdown': {
    id: 'tricep-pushdown',
    name: 'Tricep Rope Pushdowns',
    category: 'Arms',
    type: 'strength',
    targetSets: 3,
    targetReps: '12–15',
    illustration: 'tricepPushdown',
    instructions: [
      'Keep elbows tucked at your sides.',
      'Press the rope down until arms are extended.',
      'Pause briefly at the bottom.',
      'Return slowly to the start.'
    ],
    notes: 'Only the forearms move — keep upper arms still.'
  },
  'seated-leg-press': {
    id: 'seated-leg-press',
    name: 'Seated Leg Press',
    category: 'Legs',
    type: 'strength',
    targetSets: 3,
    targetReps: '12–15',
    illustration: 'legPress',
    instructions: [
      'Position feet comfortably on the platform.',
      'Maintain controlled movement.',
      'Avoid forcing the range of motion.',
      "Use the machine's safety mechanism correctly."
    ],
    notes: 'Moderate stance, controlled tempo. Choose a manageable resistance.'
  },
  'hamstring-curl': {
    id: 'hamstring-curl',
    name: 'Hamstring Curls',
    category: 'Legs',
    type: 'strength',
    targetSets: 3,
    targetReps: '12–15',
    illustration: 'hamstringCurl',
    instructions: [
      'Adjust the machine so the pad sits just above the heels.',
      'Curl with a smooth, controlled tempo.',
      'Avoid lifting hips off the seat or bench.',
      'Return slowly to the start.'
    ],
    notes: 'Lying or seated machine — use whichever is available and comfortable.'
  },
  'leg-extension': {
    id: 'leg-extension',
    name: 'Leg Extensions',
    category: 'Legs',
    type: 'strength',
    targetSets: 3,
    targetReps: '12–15',
    illustration: 'legExtension',
    instructions: [
      'Adjust the seat so knees align with the machine pivot.',
      'Extend legs with a smooth, controlled motion.',
      'Avoid locking out forcefully.',
      'Lower slowly against the resistance.'
    ],
    notes: 'Light-to-moderate resistance. Stop if movement causes pain.'
  },
  'calf-raise': {
    id: 'calf-raise',
    name: 'Standing Calf Raises',
    category: 'Legs',
    type: 'strength',
    targetSets: 3,
    targetReps: '15',
    illustration: 'calfRaise',
    instructions: [
      'Stand tall, balls of the feet on the edge or platform.',
      'Rise onto your toes with control.',
      'Pause briefly at the top.',
      'Lower slowly through a comfortable range.'
    ],
    notes: 'Hold a support for balance if needed.'
  },
  'plank': {
    id: 'plank',
    name: 'Plank / Hanging Knee Raises',
    category: 'Core',
    type: 'timed',
    targetSets: 3,
    targetDuration: '30–45 s',
    illustration: 'plank',
    instructions: [
      'Plank: forearms down, body in a straight line.',
      'Brace your core — no sagging hips.',
      'Breathe steadily through the hold.',
      'Knee raises: hang and lift knees with control.'
    ],
    notes: 'Pick the variation that feels comfortable today.'
  },
  'chest-supported-row': {
    id: 'chest-supported-row',
    name: 'Chest-Supported Dumbbell Rows',
    category: 'Back',
    type: 'strength',
    targetSets: 3,
    targetReps: '10–12',
    illustration: 'supportedRow',
    instructions: [
      'Lie chest-down on an incline bench.',
      'Let the dumbbells hang with straight arms.',
      'Row toward your hips, squeezing the shoulder blades.',
      'Lower slowly to the start.'
    ],
    notes: 'The bench supports your back — keep chest on the pad.'
  },
  'machine-chest-press': {
    id: 'machine-chest-press',
    name: 'Machine Chest Press',
    category: 'Chest',
    type: 'strength',
    targetSets: 3,
    targetReps: '10–12',
    illustration: 'chestPress',
    instructions: [
      'Adjust the seat so handles sit at mid-chest height.',
      'Press forward with a smooth motion.',
      'Avoid locking elbows forcefully.',
      'Return slowly with control.'
    ],
    notes: "Follow the equipment's safety instructions."
  },
  'db-overhead-press': {
    id: 'db-overhead-press',
    name: 'Seated Dumbbell Overhead Press',
    category: 'Shoulders',
    type: 'strength',
    targetSets: 3,
    targetReps: '12',
    illustration: 'overheadPress',
    instructions: [
      'Sit with back supported on an upright bench.',
      'Start with dumbbells at shoulder height.',
      'Press upward without arching your back.',
      'Lower slowly to the start.'
    ],
    notes: 'Choose a manageable weight you can control overhead.'
  },
  'face-pull': {
    id: 'face-pull',
    name: 'Face Pulls',
    category: 'Shoulders',
    type: 'strength',
    targetSets: 3,
    targetReps: '15',
    illustration: 'facePull',
    instructions: [
      'Set the rope at about face height.',
      'Pull the rope toward your face, elbows high.',
      'Squeeze the rear shoulders at the end.',
      'Return slowly with control.'
    ],
    notes: 'Light resistance, strict form.'
  },
  'db-bicep-curl': {
    id: 'db-bicep-curl',
    name: 'Dumbbell Bicep Curls',
    category: 'Arms',
    type: 'strength',
    targetSets: 3,
    targetReps: '12–15',
    illustration: 'bicepCurl',
    instructions: [
      'Stand tall, elbows close to your sides.',
      'Curl the dumbbells with control.',
      'Avoid swinging or leaning back.',
      'Lower slowly to full extension.'
    ],
    notes: 'Keep wrists neutral and movement smooth.'
  },
  'db-rdl': {
    id: 'db-rdl',
    name: 'Dumbbell Romanian Deadlifts',
    category: 'Legs',
    type: 'strength',
    targetSets: 3,
    targetReps: '10–12',
    illustration: 'rdl',
    instructions: [
      'Hold dumbbells in front of your thighs.',
      'Hinge at the hips with a flat back.',
      'Lower until you feel a comfortable hamstring stretch.',
      'Drive hips forward to stand tall.'
    ],
    notes: 'Light-to-moderate resistance. Focus on controlled movement and the hamstring stretch — not depth or load.'
  },
  'ab-crunch': {
    id: 'ab-crunch',
    name: 'Machine Ab Crunch / Cable Woodchoppers',
    category: 'Core',
    type: 'strength',
    targetSets: 3,
    targetReps: '15',
    illustration: 'abCrunch',
    instructions: [
      'Ab crunch: adjust the seat, curl the torso with control.',
      'Woodchopper: rotate through the torso, arms extended.',
      'Exhale as you contract.',
      'Return slowly — no jerking.'
    ],
    notes: 'Pick either variation. Use a comfortable, controlled range of motion.'
  }
}

export const WORKOUTS = {
  upperA: {
    id: 'upperA',
    name: 'Upper Body A',
    shortName: 'Upper A',
    exercises: [
      'lat-pulldown',
      'db-incline-press',
      'seated-cable-row',
      'db-lateral-raise',
      'tricep-pushdown'
    ],
    cardio: {
      name: 'Low-impact incline walk',
      duration: '15–20 min',
      illustration: 'walk'
    },
    estimatedTime: '45–60 min'
  },
  lowerA: {
    id: 'lowerA',
    name: 'Lower Body & Core A',
    shortName: 'Lower A',
    exercises: [
      'seated-leg-press',
      'hamstring-curl',
      'leg-extension',
      'calf-raise',
      'plank'
    ],
    cardio: {
      name: 'Stationary bike or flat walk',
      duration: '15–20 min',
      illustration: 'bike'
    },
    estimatedTime: '45–60 min'
  },
  upperB: {
    id: 'upperB',
    name: 'Upper Body B',
    shortName: 'Upper B',
    exercises: [
      'chest-supported-row',
      'machine-chest-press',
      'db-overhead-press',
      'face-pull',
      'db-bicep-curl'
    ],
    cardio: {
      name: 'Low-impact incline walk',
      duration: '15–20 min',
      illustration: 'walk'
    },
    estimatedTime: '45–60 min'
  },
  lowerB: {
    id: 'lowerB',
    name: 'Lower Body & Core B',
    shortName: 'Lower B',
    exercises: [
      'db-rdl',
      'seated-leg-press',
      'hamstring-curl',
      'ab-crunch'
    ],
    cardio: {
      name: 'Stationary bike or flat walk',
      duration: '15–20 min',
      illustration: 'bike'
    },
    estimatedTime: '40–55 min'
  }
}

// Day index follows Date.getDay(): 0 = Sunday … 6 = Saturday.
export const WEEK_SCHEDULE = [
  {
    day: 0,
    label: 'SUN',
    dayName: 'Sunday',
    kind: 'rest',
    title: 'Rest',
    details: ['Rest day', 'Meal prep', 'Recovery', "Prepare for next week's workouts"]
  },
  {
    day: 1,
    label: 'MON',
    dayName: 'Monday',
    kind: 'workout',
    workoutId: 'upperA'
  },
  {
    day: 2,
    label: 'TUE',
    dayName: 'Tuesday',
    kind: 'workout',
    workoutId: 'lowerA'
  },
  {
    day: 3,
    label: 'WED',
    dayName: 'Wednesday',
    kind: 'recovery',
    title: 'Recovery',
    details: ['Full rest or light walking.']
  },
  {
    day: 4,
    label: 'THU',
    dayName: 'Thursday',
    kind: 'recovery',
    title: 'Recovery',
    details: ['Full rest or light stretching / mobility.']
  },
  {
    day: 5,
    label: 'FRI',
    dayName: 'Friday',
    kind: 'workout',
    workoutId: 'upperB'
  },
  {
    day: 6,
    label: 'SAT',
    dayName: 'Saturday',
    kind: 'workout',
    workoutId: 'lowerB'
  }
]

export function getScheduleForDay(dayIndex) {
  return WEEK_SCHEDULE.find((d) => d.day === dayIndex)
}

// ---------- Live catalog ----------
// The user can edit built-in exercises, create their own, and change which
// exercises each workout contains. Those customizations are stored in
// IndexedDB and applied here at startup (and after every edit), so the rest
// of the app keeps reading exercises/workouts synchronously.

let liveExercises = { ...EXERCISES }
let liveWorkoutLists = {}

export function applyCatalog(catalog) {
  const c = catalog || {}
  liveExercises = { ...EXERCISES }
  for (const [id, patch] of Object.entries(c.overrides || {})) {
    if (liveExercises[id]) liveExercises[id] = { ...liveExercises[id], ...patch, id }
  }
  for (const [id, exercise] of Object.entries(c.customExercises || {})) {
    liveExercises[id] = { ...exercise, id, custom: true }
  }
  liveWorkoutLists = c.workoutExercises || {}
}

export function isBuiltinExercise(id) {
  return Object.prototype.hasOwnProperty.call(EXERCISES, id)
}

export function listExercises() {
  return Object.values(liveExercises)
}

export function getExercise(id) {
  return (
    liveExercises[id] || {
      id,
      name: 'Removed exercise',
      category: 'Other',
      type: 'strength',
      targetSets: 3,
      targetReps: '—',
      instructions: [],
      illustration: null,
      missing: true
    }
  )
}

export function getWorkout(id) {
  const base = WORKOUTS[id]
  if (!base) return base
  const custom = liveWorkoutLists[id]
  if (!custom) return base
  return { ...base, exercises: custom.filter((eid) => liveExercises[eid]) }
}

export function makeExerciseId(name) {
  const slug = String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return `custom-${slug || 'exercise'}-${Math.random().toString(36).slice(2, 6)}`
}

export const EXERCISE_CATEGORIES = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Other']

// The next scheduled training day strictly after the given weekday.
export function getNextWorkoutDay(fromDayIndex) {
  for (let offset = 1; offset <= 7; offset++) {
    const entry = getScheduleForDay((fromDayIndex + offset) % 7)
    if (entry.kind === 'workout') return entry
  }
  return null
}

export const SAFETY_NOTE =
  'Use a comfortable, controlled range of motion and a manageable resistance. Stop if movement causes pain. If an exercise has been restricted for you by a qualified professional, do not perform it.'
