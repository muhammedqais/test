import { useEffect, useRef, useState } from 'react'
import { getScheduleForDay, getWorkout } from '../data/workouts.js'
import { getDayPlan, saveDayPlan, makeId } from '../storage/database.js'
import { toDateKey, formatLongDate } from '../utils/dates.js'

const MEALS = [
  { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
  { id: 'lunch', label: 'Lunch', icon: '🥗' },
  { id: 'dinner', label: 'Dinner', icon: '🍽️' },
  { id: 'snacks', label: 'Snacks', icon: '🍎' }
]

function emptyPlan(dateKey) {
  return {
    date: dateKey,
    gymTime: '',
    meals: { breakfast: [], lunch: [], dinner: [], snacks: [] }
  }
}

function mealTotal(items) {
  return items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0)
}

function MealCard({ meal, items, onAdd, onRemove }) {
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const nameRef = useRef(null)

  const submit = () => {
    if (!name.trim()) return
    onAdd(meal.id, { id: makeId(), name: name.trim(), calories: Number(calories) || 0 })
    setName('')
    setCalories('')
    nameRef.current?.focus()
  }

  return (
    <div className="card">
      <div className="meal-header">
        <span className="meal-header__title">
          <span aria-hidden="true">{meal.icon}</span> {meal.label}
        </span>
        {items.length > 0 && <span className="meal-header__total">{mealTotal(items)} kcal</span>}
      </div>

      {items.length === 0 ? (
        <p className="empty-note">Nothing logged yet.</p>
      ) : (
        items.map((item) => (
          <div className="meal-item" key={item.id}>
            <span className="meal-item__name">{item.name}</span>
            <span className="meal-item__kcal">
              {Number(item.calories) > 0 ? `${item.calories} kcal` : '—'}
            </span>
            <button
              type="button"
              className="mini-btn mini-btn--danger"
              onClick={() => onRemove(meal.id, item.id)}
              aria-label={`Remove ${item.name}`}
            >
              ✕
            </button>
          </div>
        ))
      )}

      <div className="meal-add">
        <input
          ref={nameRef}
          type="text"
          value={name}
          placeholder="Food item"
          aria-label={`${meal.label} item name`}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <input
          type="number"
          inputMode="numeric"
          min="0"
          value={calories}
          placeholder="kcal"
          aria-label={`${meal.label} item calories`}
          onChange={(e) => setCalories(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button type="button" className="mini-btn meal-add__btn" disabled={!name.trim()} onClick={submit} aria-label="Add item">
          ＋
        </button>
      </div>
    </div>
  )
}

export default function DayPlanner({ today, sessions }) {
  const [date, setDate] = useState(() => new Date(today))
  const [plan, setPlan] = useState(null)
  const dateKey = toDateKey(date)
  const todayKey = toDateKey(today)

  useEffect(() => {
    let cancelled = false
    setPlan(null)
    getDayPlan(dateKey)
      .then((stored) => {
        if (cancelled) return
        const base = emptyPlan(dateKey)
        setPlan(stored ? { ...base, ...stored, meals: { ...base.meals, ...stored.meals } } : base)
      })
      .catch(() => !cancelled && setPlan(emptyPlan(dateKey)))
    return () => {
      cancelled = true
    }
  }, [dateKey])

  const update = (next) => {
    setPlan(next)
    saveDayPlan(next).catch((err) => console.error('Failed to save day plan', err))
  }

  const shiftDay = (delta) => {
    const next = new Date(date)
    next.setDate(next.getDate() + delta)
    setDate(next)
  }

  const addItem = (mealId, item) => {
    update({ ...plan, meals: { ...plan.meals, [mealId]: [...plan.meals[mealId], item] } })
  }

  const removeItem = (mealId, itemId) => {
    update({
      ...plan,
      meals: { ...plan.meals, [mealId]: plan.meals[mealId].filter((i) => i.id !== itemId) }
    })
  }

  const entry = getScheduleForDay(date.getDay())
  const workout = entry.kind === 'workout' ? getWorkout(entry.workoutId) : null
  const workoutLogged = sessions.some((s) => s.date === dateKey && s.completed)
  const dayTotal = plan
    ? MEALS.reduce((sum, m) => sum + mealTotal(plan.meals[m.id] || []), 0)
    : 0

  return (
    <div className="fade-in">
      <div className="day-nav">
        <button type="button" className="mini-btn day-nav__arrow" onClick={() => shiftDay(-1)} aria-label="Previous day">
          ‹
        </button>
        <div className="day-nav__date">
          <div className="eyebrow eyebrow--accent">
            {dateKey === todayKey ? 'Today' : entry.dayName}
          </div>
          <div className="day-nav__title">{formatLongDate(date)}</div>
          {dateKey !== todayKey && (
            <button type="button" className="edit-link" onClick={() => setDate(new Date(today))}>
              Back to today
            </button>
          )}
        </div>
        <button type="button" className="mini-btn day-nav__arrow" onClick={() => shiftDay(1)} aria-label="Next day">
          ›
        </button>
      </div>

      <div className="card">
        <div className="meal-header">
          <span className="meal-header__title">
            <span aria-hidden="true">🏋️</span> Gym
          </span>
          {workoutLogged && <span className="chip chip--success">Workout logged ✓</span>}
        </div>
        {workout ? (
          <>
            <p style={{ fontSize: 15, fontWeight: 700, margin: '2px 0 10px' }}>
              {workout.name}
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                {' '}
                · ~ {workout.estimatedTime}
              </span>
            </p>
            <div className="form-field" style={{ marginBottom: 0 }}>
              <label htmlFor="gym-time">Gym time</label>
              <input
                id="gym-time"
                type="time"
                value={plan?.gymTime || ''}
                onChange={(e) => update({ ...plan, gymTime: e.target.value })}
                disabled={!plan}
              />
            </div>
          </>
        ) : (
          <p className="empty-note">
            {entry.kind === 'rest' ? 'Rest day — no gym scheduled.' : 'Recovery day — light movement only.'}
          </p>
        )}
      </div>

      <div className="card day-total">
        <span className="day-total__label">Total calories</span>
        <span className="day-total__value">
          {dayTotal} <small>kcal</small>
        </span>
      </div>

      {plan === null ? (
        <div className="card">
          <p className="empty-note">Loading…</p>
        </div>
      ) : (
        MEALS.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            items={plan.meals[meal.id] || []}
            onAdd={addItem}
            onRemove={removeItem}
          />
        ))
      )}
    </div>
  )
}
