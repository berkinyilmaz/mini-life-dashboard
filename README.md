# Mini Life Dashboard
Track your time, health, habits, and money — all in one clean page that resets every day.

---

## Live Demo
_Coming soon_

---

## Features
- **Year / Month / Day progress bars** — see exactly how much of each period has passed
- **Life Stats** — days alive, weeks alive, age, days to next birthday, and a "life percentage" bar (based on 80yr avg)
- **Birthday input** — enter once, persists across sessions
- **Daily Habits tracker** — add, check off, and remove habits; resets automatically every day
- **Water intake** — 8 interactive drop indicators, tap to fill
- **Sleep logger** — range slider from 0–12 hours with contextual feedback
- **Step counter** — number input with a progress bar toward the 10,000-step goal
- **Daily Expenses** — add items with description, amount, and category; running total shown; resets each day
- **localStorage persistence** — all data survives page refreshes; daily-reset items clear at midnight

---

## Tech Stack
- React 19 (Vite 5)
- CSS custom properties (Apple-inspired dark UI, no framework)
- localStorage for persistence with daily-reset logic

---

## How It Works
1. Open the app — the date banner and three progress cards update in real time
2. Enter your birthday once to unlock Life Stats
3. Check off habits as you complete them throughout the day
4. Tap water drops, drag the sleep slider, or type your step count
5. Add expenses with a category as you spend; the total updates instantly
6. Tomorrow, daily data (habits, water, sleep, steps, expenses) resets automatically

> Everything runs entirely in your browser. No data leaves your machine.

---

## Installation
```bash
git clone https://github.com/berkinyilmaz/mini-life-dashboard.git
cd mini-life-dashboard
npm install
npm run dev
```

---

## Privacy
Everything runs **locally in your browser**.
# mini-life-dashboard
