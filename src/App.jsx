import { useState, useEffect, useCallback, useMemo } from 'react'
import './styles.css'

const STORAGE_KEY = 'mld-v1'
const todayStr = () => new Date().toDateString()

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function initData(saved) {
  const today = todayStr()
  const base = {
    birthday: '',
    habits: [
      { id: 1, label: 'Exercise', done: false },
      { id: 2, label: 'Read', done: false },
      { id: 3, label: 'Meditate', done: false },
    ],
    water: 0,
    sleep: '',
    steps: '',
    expenses: [],
    lastDay: today,
  }
  if (!saved) return base
  if (saved.lastDay !== today) {
    return {
      ...base,
      birthday: saved.birthday || '',
      habits: (saved.habits || base.habits).map(h => ({ ...h, done: false })),
    }
  }
  return { ...base, ...saved }
}

const CATS = ['food', 'transport', 'health', 'shopping', 'entertainment', 'other']

export default function App() {
  const [now, setNow] = useState(new Date())
  const [data, setData] = useState(() => initData(loadData()))
  const [newHabit, setNewHabit] = useState('')
  const [expDesc, setExpDesc] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expCat, setExpCat] = useState('food')

  const { birthday, habits, water, sleep, steps, expenses } = data

  const update = useCallback(patch => setData(prev => ({ ...prev, ...patch })), [])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  // Progress calculations
  const yearPct = useMemo(() => {
    const s = new Date(now.getFullYear(), 0, 1)
    const e = new Date(now.getFullYear() + 1, 0, 1)
    return ((now - s) / (e - s)) * 100
  }, [now])

  const monthPct = useMemo(() => {
    const s = new Date(now.getFullYear(), now.getMonth(), 1)
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return ((now - s) / (e - s)) * 100
  }, [now])

  const dayPct = useMemo(() => {
    const sod = new Date(now)
    sod.setHours(0, 0, 0, 0)
    return ((now - sod) / 86400000) * 100
  }, [now])

  const dayOfYear = useMemo(() => {
    const s = new Date(now.getFullYear(), 0, 1)
    return Math.floor((now - s) / 86400000) + 1
  }, [now])

  const daysInYear = now.getFullYear() % 4 === 0 ? 366 : 365

  const daysLeftMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()

  // Life stats
  const life = useMemo(() => {
    if (!birthday) return null
    const bd = new Date(birthday)
    if (isNaN(bd) || bd > now) return null
    const diff = now - bd
    const days = Math.floor(diff / 86400000)
    const weeks = Math.floor(days / 7)
    const years = diff / (365.25 * 86400000)
    const pct = Math.min((years / 80) * 100, 100)
    const nb = new Date(bd)
    nb.setFullYear(now.getFullYear())
    if (nb <= now) nb.setFullYear(now.getFullYear() + 1)
    const daysToNb = Math.ceil((nb - now) / 86400000)
    return { days, weeks, age: Math.floor(years), pct, daysToNb }
  }, [birthday, now])

  // Habits
  const toggleHabit = useCallback(id => {
    update({ habits: habits.map(h => h.id === id ? { ...h, done: !h.done } : h) })
  }, [habits, update])

  const addHabit = useCallback(() => {
    if (!newHabit.trim()) return
    update({ habits: [...habits, { id: Date.now(), label: newHabit.trim(), done: false }] })
    setNewHabit('')
  }, [newHabit, habits, update])

  const removeHabit = useCallback(id => {
    update({ habits: habits.filter(h => h.id !== id) })
  }, [habits, update])

  // Expenses
  const addExpense = useCallback(() => {
    const amt = parseFloat(expAmount)
    if (!expDesc.trim() || isNaN(amt) || amt <= 0) return
    update({ expenses: [...expenses, { id: Date.now(), desc: expDesc.trim(), amount: amt, cat: expCat }] })
    setExpDesc('')
    setExpAmount('')
  }, [expDesc, expAmount, expCat, expenses, update])

  const removeExpense = useCallback(id => {
    update({ expenses: expenses.filter(e => e.id !== id) })
  }, [expenses, update])

  const totalExp = expenses.reduce((s, e) => s + e.amount, 0)
  const habitsDone = habits.filter(h => h.done).length
  const allHabitsDone = habits.length > 0 && habitsDone === habits.length

  const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  const dateStr = now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const monthName = now.toLocaleDateString('tr-TR', { month: 'long' })

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <span className="day-badge">Day 27</span>
            <div>
              <h1 className="header-title">Mini Life Dashboard</h1>
              <p className="header-sub">Your life, quantified</p>
            </div>
          </div>
          <div className="header-right">
            <div className="header-clock">
              <span className="live-dot" />
              <span className="clock-display">{timeStr}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="main">

        {/* Date banner */}
        <div className="date-banner">
          <span className="date-full">{dateStr}</span>
          <span className="date-day-count">Day {dayOfYear} of {daysInYear}</span>
        </div>

        {/* Progress Cards */}
        <section className="progress-grid">
          <ProgressCard label="Year" pct={yearPct} detail={`${(100 - yearPct).toFixed(1)}% left`} color="var(--accent)" />
          <ProgressCard label={monthName} pct={monthPct} detail={`${daysLeftMonth} days left`} color="#a78bfa" />
          <ProgressCard label="Today" pct={dayPct} detail={timeStr} color="#34d399" />
        </section>

        {/* Life Stats + Habits */}
        <section className="two-col">

          {/* Life Stats */}
          <div className="card">
            <div className="card-head">
              <span className="section-label">Life Stats</span>
            </div>
            <div className="card-body">
              {!life ? (
                <div className="birthday-wrap">
                  <p className="hint-text">Enter your birthday to see your life numbers</p>
                  <input
                    type="date"
                    className="date-input"
                    value={birthday}
                    onChange={e => update({ birthday: e.target.value })}
                    aria-label="Birthday"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              ) : (
                <>
                  <div className="stats-grid">
                    <StatItem value={life.days.toLocaleString()} label="Days Alive" accent />
                    <StatItem value={life.weeks.toLocaleString()} label="Weeks Alive" />
                    <StatItem value={life.age} label="Age" />
                    <StatItem value={`${life.daysToNb}d`} label="To Birthday" />
                  </div>
                  <div className="life-bar-wrap">
                    <div className="life-bar-labels">
                      <span>Life (80yr avg)</span>
                      <span style={{ color: 'var(--accent)' }}>{life.pct.toFixed(1)}%</span>
                    </div>
                    <div className="pbar-track">
                      <div className="pbar-fill" style={{ width: `${life.pct}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                  <button className="btn-text" onClick={() => update({ birthday: '' })}>Change birthday</button>
                </>
              )}
            </div>
          </div>

          {/* Habits */}
          <div className={`card${allHabitsDone ? ' card-success' : ''}`}>
            <div className="card-head">
              <span className="section-label">Habits</span>
              {habits.length > 0 && (
                <span className={`badge-count${allHabitsDone ? ' all-done' : ''}`}>
                  {habitsDone}/{habits.length}
                </span>
              )}
            </div>
            <div className="card-body">
              {habits.length === 0 ? (
                <p className="hint-text">No habits yet — add one below</p>
              ) : (
                <div className="habits-list">
                  {habits.map(h => (
                    <div key={h.id} className={`habit-row${h.done ? ' done' : ''}`}>
                      <button
                        className={`habit-check${h.done ? ' checked' : ''}`}
                        onClick={() => toggleHabit(h.id)}
                        aria-label={h.done ? 'Uncheck habit' : 'Check habit'}
                      >
                        {h.done && <IconCheck />}
                      </button>
                      <span className="habit-name">{h.label}</span>
                      <button className="icon-btn" onClick={() => removeHabit(h.id)} aria-label="Remove habit">
                        <IconX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="add-row">
                <input
                  type="text"
                  className="add-input"
                  placeholder="Add habit…"
                  value={newHabit}
                  onChange={e => setNewHabit(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addHabit()}
                  aria-label="New habit name"
                />
                <button className="btn-icon-add" onClick={addHabit} aria-label="Add habit">
                  <IconPlus />
                </button>
              </div>
            </div>
          </div>

        </section>

        {/* Vitals */}
        <section className="vitals-grid">

          {/* Water */}
          <div className="card">
            <div className="card-head">
              <span className="section-label">Water</span>
              <span className="vital-badge">{water}/8</span>
            </div>
            <div className="card-body">
              <div className="water-row">
                {[...Array(8)].map((_, i) => (
                  <button
                    key={i}
                    className={`water-drop${i < water ? ' filled' : ''}`}
                    onClick={() => update({ water: water === i + 1 ? i : i + 1 })}
                    aria-label={`${i + 1} glass${i > 0 ? 'es' : ''}`}
                  >
                    <IconDrop />
                  </button>
                ))}
              </div>
              <p className="vital-hint">
                {water === 0 ? 'Stay hydrated!' : water >= 8 ? 'Daily goal reached!' : `${8 - water} more to go`}
              </p>
            </div>
          </div>

          {/* Sleep */}
          <div className="card">
            <div className="card-head">
              <span className="section-label">Sleep</span>
              {sleep && <span className="vital-badge">{sleep}h</span>}
            </div>
            <div className="card-body">
              <div className="sleep-display-row">
                <span className="sleep-num">{sleep || '—'}</span>
                {sleep && <span className="sleep-unit">hrs</span>}
              </div>
              <input
                type="range" min="0" max="12" step="0.5"
                value={sleep || 0}
                onChange={e => update({ sleep: e.target.value === '0' ? '' : e.target.value })}
                className="sleep-range"
                aria-label="Sleep hours"
              />
              <div className="range-labels">
                <span>0h</span><span>6h</span><span>12h</span>
              </div>
              <p className="vital-hint">
                {!sleep ? 'Log your sleep' : parseFloat(sleep) >= 7 ? 'Well rested!' : parseFloat(sleep) >= 5 ? 'Could be better' : 'Get more rest!'}
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="card">
            <div className="card-head">
              <span className="section-label">Steps</span>
              {steps && parseInt(steps) >= 10000 && (
                <span className="vital-badge" style={{ color: '#34d399', borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)' }}>Goal!</span>
              )}
            </div>
            <div className="card-body">
              <div className="steps-display">{steps ? parseInt(steps).toLocaleString() : '—'}</div>
              <input
                type="number"
                className="steps-input"
                placeholder="Enter steps"
                value={steps}
                min="0"
                onChange={e => update({ steps: e.target.value })}
                aria-label="Step count"
              />
              {steps && parseInt(steps) > 0 && (
                <div className="pbar-track" style={{ marginTop: 10 }}>
                  <div className="pbar-fill" style={{ width: `${Math.min((parseInt(steps) / 10000) * 100, 100)}%`, background: '#34d399' }} />
                </div>
              )}
              <p className="vital-hint">
                {!steps || parseInt(steps) === 0
                  ? 'Goal: 10,000 steps'
                  : parseInt(steps) >= 10000
                    ? 'Goal reached!'
                    : `${(10000 - parseInt(steps)).toLocaleString()} to go`}
              </p>
            </div>
          </div>

        </section>

        {/* Expenses */}
        <section className="card">
          <div className="card-head">
            <span className="section-label">Today's Expenses</span>
            {expenses.length > 0 && (
              <span className="expense-total-badge">₺{totalExp.toFixed(2)}</span>
            )}
          </div>
          <div className="card-body">
            <div className="expense-add-row">
              <input
                type="text"
                className="expense-desc-input"
                placeholder="What did you spend on?"
                value={expDesc}
                onChange={e => setExpDesc(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addExpense()}
                aria-label="Expense description"
              />
              <input
                type="number"
                className="expense-amt-input"
                placeholder="0.00"
                value={expAmount}
                onChange={e => setExpAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addExpense()}
                min="0" step="0.01"
                aria-label="Amount"
              />
              <select
                className="expense-cat-select"
                value={expCat}
                onChange={e => setExpCat(e.target.value)}
                aria-label="Category"
                style={{ colorScheme: 'dark' }}
              >
                {CATS.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
              <button className="btn-icon-add" onClick={addExpense} aria-label="Add expense">
                <IconPlus />
              </button>
            </div>
            {expenses.length > 0 ? (
              <div className="expense-list">
                {expenses.map(e => (
                  <div key={e.id} className="expense-row">
                    <span className="exp-cat">{e.cat}</span>
                    <span className="exp-desc">{e.desc}</span>
                    <span className="exp-amt">₺{e.amount.toFixed(2)}</span>
                    <button className="icon-btn" onClick={() => removeExpense(e.id)} aria-label="Remove expense">
                      <IconX />
                    </button>
                  </div>
                ))}
                <div className="expense-total-row">
                  <span>Total today</span>
                  <span>₺{totalExp.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <p className="hint-text" style={{ marginTop: 14 }}>No expenses logged yet</p>
            )}
          </div>
        </section>

      </main>

      <footer className="credit">
        Coded by{' '}
        <a href="https://instagram.com/berkindev" target="_blank" rel="noopener noreferrer" className="credit-link">
          berkindev
        </a>
      </footer>
    </div>
  )
}

function ProgressCard({ label, pct, detail, color }) {
  return (
    <div className="progress-card">
      <div className="pc-top">
        <span className="pc-label">{label}</span>
        <span className="pc-pct" style={{ color }}>{pct.toFixed(1)}%</span>
      </div>
      <div className="pbar-track">
        <div className="pbar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="pc-detail">{detail}</span>
    </div>
  )
}

function StatItem({ value, label, accent }) {
  return (
    <div className="stat-item">
      <div className={`stat-val${accent ? ' accent' : ''}`}>{value}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  )
}

function IconCheck() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7l4 4 6-6" />
    </svg>
  )
}

function IconX() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M2 2l8 8M10 2l-8 8" />
    </svg>
  )
}

function IconPlus() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M7 2v10M2 7h10" />
    </svg>
  )
}

function IconDrop() {
  return (
    <svg width="13" height="17" viewBox="0 0 13 17" fill="currentColor">
      <path d="M6.5 0.5C6.5 0.5 0.5 8 0.5 11.5C0.5 14.5 3.2 16.5 6.5 16.5C9.8 16.5 12.5 14.5 12.5 11.5C12.5 8 6.5 0.5 6.5 0.5Z" />
    </svg>
  )
}
