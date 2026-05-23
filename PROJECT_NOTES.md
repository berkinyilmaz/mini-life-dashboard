# Day 27 — Mini Life Dashboard

30 günde 30 proje serisinin 27. günü. Zaman, sağlık, alışkanlık ve harcamaları tek sayfada takip eden mini bir kişisel dashboard.

---

## Konsept

Slidedaki mesaj: hayatınız veri. Günlük yaşamı sayısal olarak görmek, kalıpları fark etmek ve daha bilinçli kararlar almak için tek sayfada her şeyi bir arada topladık.

---

## Tasarım Dili (seri ile birebir)

`timestamp-converter` baz alındı:
- **Dark-first** zemin: `#0a0a0c` + radial gradient
- **Tek aksan**: indigo `#6366f1` — CTA, progress vurgu, kategori badge
- İkincil renkler: mor `#a78bfa` (ay progressi), yeşil `#34d399` (gün progressi, water, steps)
- **Surface katmanları**: `--surface`, `--surface-2` — soft border + shadow
- **Köşeler**: 20px kartlar / 14px input / pill header elementleri
- **Micro-interactions**: 180ms ease; hover border, glow, scale
- **Pure CSS + CSS custom properties** (Tailwind yok)

---

## Stack

| Katman | Seçim |
|---|---|
| Framework | React 19 + Vite 5 |
| Styling | Pure CSS + design tokens |
| State | `useState` + `useMemo` + `useCallback` |
| Persistence | `localStorage` (günlük sıfırlama mantığı ile) |
| Font | Inter (Google Fonts) + system mono |

---

## Özellikler

1. **Progress Kartları** — Year / Month / Day için canlı güncellenen progress bar (3 farklı renk)
2. **Date Banner** — tam tarih + yılın kaçıncı günü
3. **Life Stats** — birthday girişiyle: gün/hafta/yaş/birthday sayaç + hayat % bar
4. **Habits** — add/check/remove; günlük sıfırlama; all-done state (yeşil kart border)
5. **Water** — 8 tıklanabilir damla indikatörü
6. **Sleep** — range slider (0–12h), contextual feedback metni
7. **Steps** — number input + progress bar (hedef: 10k)
8. **Expenses** — desc + amount + category; günlük toplam; localStorage'da güne göre sıfırlanır
9. **Günlük sıfırlama** — habits, water, sleep, steps, expenses her gün otomatik sıfırlanır; birthday hafızada kalır

---

## Mimari Notlar

### Dosya yapısı
```
mini-life-dashboard/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── PROJECT_NOTES.md  ← bu dosya
└── src/
    ├── main.jsx        (React mount)
    ├── App.jsx         (tüm UI + mantık — tek dosya)
    └── styles.css      (design tokens + tüm komponent stilleri)
```

### State şeması (localStorage)
```js
{
  birthday: '',               // persist — sıfırlanmaz
  habits: [{ id, label, done }],  // günlük: done → false
  water: 0,                   // günlük sıfırlanır
  sleep: '',                  // günlük sıfırlanır
  steps: '',                  // günlük sıfırlanır
  expenses: [],               // günlük sıfırlanır
  lastDay: 'Mon May 23 2026', // Date.toDateString() ile karşılaştırma
}
```

### Günlük sıfırlama mantığı
`initData(saved)` — `saved.lastDay !== todayStr()` ise habits.done false'a döner, su/uyku/adım/harcama sıfırlanır. Birthday ve habit listesi (sadece done değerleri değil, label'lar) korunur.

### Layout
- `.progress-grid`: 3 kolon — `repeat(3, 1fr)`
- `.two-col`: 2 kolon — Life Stats | Habits
- `.vitals-grid`: 3 kolon — Water | Sleep | Steps
- `.card` (expenses): tam genişlik
- 720px: two-col → 1 kolon, vitals → 2 kolon
- 600px: hepsi 1 kolon

### Alt komponentler
- `ProgressCard({ label, pct, detail, color })` — renklenebilir progress kart
- `StatItem({ value, label, accent })` — sayı stat kutusu
- `IconCheck / IconX / IconPlus / IconDrop` — inline SVG ikonlar

---

## Tamamlandı / Test

- `npm install` — 61 paket, temiz
- `npm run build` — 334ms, 13.78kB CSS / 205.73kB JS, hata yok
- `npm run dev` — `localhost:5173` 200 OK
- Günlük sıfırlama mantığı: `lastDay` karşılaştırması ile çalışıyor
- Responsive: 720px ve 600px breakpoint'leri tanımlı

---

## Sonraki Adımlar (opsiyonel)

- Haftalık istatistik görünümü (7 günlük geçmiş özeti)
- Habit streak sayacı (kaç gün üst üste yapıldı)
- Gider kategorisi bazlı pasta grafik
- Para birimi seçeneği (₺ / $ / €)
- Dark/light mode toggle
