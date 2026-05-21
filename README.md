# 🃏 Mendicoat Premier League

A mobile-first web application for tracking scores in the Indian card game **Mendicoat** (also called Mendikot). Built for a fixed group of friends who play daily, with persistent cloud storage via Google Sheets.

> **Live stack:** React PWA → Google Apps Script API → Google Sheets as database. 100% free, forever.

---

## Table of Contents

- [About the Game](#about-the-game)
- [Why This App Exists](#why-this-app-exists)
- [Features](#features)
- [Tech Stack & Architecture](#tech-stack--architecture)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Statistics Engine](#statistics-engine)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Design Decisions](#design-decisions)
- [Future Ideas](#future-ideas)

---

## About the Game

Mendicoat is a 4-player trick-taking card game popular in Maharashtra, India. Players split into 2 teams of 2 and compete to capture **tens** (the 10 of each suit) across 13 tricks.

**Winning conditions:**
- A team that captures **3 or 4 tens** wins the game
- If each team gets **2 tens**, the team with more tricks wins
- **Mendicot / Coat** — when one team captures **all 4 tens**, the losing team is said to have been *coated*
- **Whitewash** — when one team wins all 13 tricks

This app tracks **coats** — the most dramatic losing outcome — across sessions for a group of 6–8 regular players.

---

## Why This App Exists

Our group of 6 plays Mendicoat almost every day. We wanted to track:

- Who gets coated the most (and least)
- Whether certain player combinations are unlucky together
- Individual improvement over time
- A live leaderboard everyone can see from their phones

**Requirements that shaped the solution:**
- Multiple players log games from their own mobile devices simultaneously → no `localStorage`, needs a real shared backend
- Must be free with zero ongoing cost
- No app store — installable as a PWA
- Simple enough to log a game in under 30 seconds
- Previous game's team setup should auto-fill since the same players often play back-to-back

---

## Features

### Log Game screen
- Tap players to assign to Team A or Team B (cycles A → B → unselected)
- **Auto-recalls the last logged game's team setup** to save time on repeat sessions
- 3-button coat result selector: No coat / Team A coated / Team B coated
- Add new players to the roster at any time

### Leaderboard
- Ranked by coat rate (coats ÷ games played × 100%)
- Colour-coded bars: green (<20%), amber (<40%), red (40%+)
- Current streak badges (clean streak 🔥 or coat streak 💀)
- Form trend indicator (improving / worsening based on last 10 games)
- Tap any player to jump to their individual stats

### Pair Stats
- All player duos with ≥2 games together
- Sortable by coat rate, win rate, or games played
- Highlights best duo (lowest coat rate) and danger duo (highest coat rate)
- Win rate tracked separately from coat rate

### Individual Player Stats
- Coat rate, total games, total coats, leaderboard rank
- Recent form: last 10 games shown as coloured dots (🔴 coat / 🟢 clean)
- Streaks: current, worst coat streak ever, best clean streak ever
- Last coat date
- Per-partner breakdown with 🍀 lucky partner and 👿 nemesis partner tags
- Monthly trend bars (last 6 months)

---

## Tech Stack & Architecture

```
┌─────────────────────────────────────────┐
│         React PWA (Vercel)              │
│  Mobile-first, installable on homescreen│
└──────────────┬──────────────────────────┘
               │ HTTPS POST (JSON)
               │ action= query param
               ▼
┌─────────────────────────────────────────┐
│     Google Apps Script Web App          │
│  Serverless function, deployed as       │
│  public web endpoint. No auth needed.   │
│  Handles: getPlayers, addPlayer,        │
│  logGame, getStats, getLastGame,        │
│  getGames                               │
└──────────────┬──────────────────────────┘
               │ SpreadsheetApp API
               ▼
┌─────────────────────────────────────────┐
│         Google Sheets                   │
│  Two tabs: Players + Games              │
│  Human-readable, exportable, editable   │
└─────────────────────────────────────────┘
```

**Why this stack?**

| Concern | Decision | Reason |
|---|---|---|
| Storage | Google Sheets | Free, multi-user safe, human-editable, no DB setup |
| Backend | Google Apps Script | Runs inside Google's infra, free, no server to manage |
| Frontend | React | Component model suits the multi-screen app |
| Hosting | Vercel | Free tier, CI/CD from GitHub, global CDN |
| Auth | None (open link) | Small trusted group, simplicity over security |
| State | None (API-driven) | Every screen fetches fresh data; no client state sync needed |

**Why not localStorage?**
Multiple players log games from their own devices. localStorage is per-browser and per-device — any data stored there is invisible to everyone else. A shared backend (Apps Script → Sheets) is required.

---

## Project Structure

```
mendicoat-premier-league/
│
├── Code.gs                        # ← Google Apps Script (the entire backend)
│
├── public/
│   ├── index.html                 # HTML shell, loads Google Fonts
│   ├── manifest.json              # PWA manifest (name, icon, display mode)
│   └── logo.png                   # App icon (card suits with "10")
│
├── src/
│   ├── index.js                   # React entry point
│   ├── index.css                  # Global CSS variables, dark theme, animations
│   ├── App.js                     # Root component: tab navigation, data loading
│   │
│   ├── utils/
│   │   └── api.js                 # All fetch calls to Apps Script, single source of truth
│   │
│   └── components/
│       ├── LogGame.js             # Game logging screen with auto-recall
│       ├── Leaderboard.js         # Ranked table with bars, streaks, form trend
│       ├── PairStats.js           # Duo statistics, sortable
│       └── PlayerStats.js         # Individual deep-dive: streaks, partners, monthly
│
├── package.json
├── .env                           # ← YOU CREATE THIS (not committed to git)
├── .gitignore
├── DEPLOYMENT.md                  # Step-by-step setup guide
└── README.md                      # This file
```

---

## Data Model

### Google Sheet: `Players` tab

| Column | Type | Description |
|---|---|---|
| `id` | string | Unique ID, format `p_<timestamp>` |
| `name` | string | Full name |
| `createdAt` | ISO string | When the player was added |

### Google Sheet: `Games` tab

| Column | Type | Description |
|---|---|---|
| `id` | string | Unique ID, format `g_<timestamp>` |
| `date` | ISO string | When the game was logged |
| `teamA_p1` | string | Player name |
| `teamA_p2` | string | Player name |
| `teamB_p1` | string | Player name |
| `teamB_p2` | string | Player name |
| `coatedTeam` | `"A"` / `"B"` / `"none"` | Which team got coated, or no coat |

**One row = one completed game.** All statistics are computed dynamically from this raw log — nothing is stored pre-aggregated. This means:
- Fixing a wrong entry in Sheets automatically fixes all stats on next refresh
- The stats logic can be updated without migrating data
- The full game history is always available for any future analysis

---

## Statistics Engine

All stats are computed in `Code.gs` → `getStats()` on every API call. The function makes a single pass over the games array and computes everything simultaneously.

### Per-player stats computed

```
gamesPlayed      = count of games where player was in the 4
coatsReceived    = count of games where player was on the coated team
coatRate         = coatsReceived / gamesPlayed × 100  (lower = better)
currentStreak    = positive: consecutive clean games; negative: consecutive coat games
worstCoatStreak  = longest run of consecutive coats ever
bestCleanStreak  = longest run of consecutive clean games ever
lastCoatDate     = ISO date string of most recent coat
recentForm       = array of last 10 games: true=coated, false=clean
formTrend        = "improving" | "worsening" | "stable"
                   (compare coats in last 5 games vs previous 5)
luckyPartner     = partner with lowest coat rate when paired together (min 2 games)
nemesisPartner   = partner with highest coat rate when paired together (min 2 games)
monthlyStats     = array of { month, games, coats, rate } for trend chart
```

### Per-pair stats computed

```
gamesTogther     = count of games this exact duo played as teammates
coatsTogether    = games where this duo was on the coated team
coatRate         = coatsTogether / gamesTogther × 100
wins             = games where this duo was on the winning side (non-coat game)
winRate          = wins / gamesTogther × 100
```

Pairs with fewer than 2 games together are excluded from display (insufficient data).

### Session stats computed

```
date             = YYYY-MM-DD
games            = total games played that day
coats            = total coats that happened that day
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v16 or higher
- A Google account
- A [Vercel](https://vercel.com) account (free)

### Local setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/mendicoat-premier-league.git
cd mendicoat-premier-league

# 2. Install dependencies
npm install

# 3. Create environment file
echo "REACT_APP_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec" > .env

# 4. Start dev server
npm start
```

Open [http://localhost:3000](http://localhost:3000)

> The `.env` file is gitignored. See [Deployment](#deployment) for how to get your Apps Script URL.

---

## Deployment

Full step-by-step instructions are in [`DEPLOYMENT.md`](./DEPLOYMENT.md). Summary:

### 1. Google Apps Script (backend)

1. Create a new Google Sheet at [sheets.google.com](https://sheets.google.com)
2. Open **Extensions → Apps Script**
3. Paste the contents of `Code.gs` into the editor
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the deployment URL

### 2. Vercel (frontend)

```bash
npm install -g vercel
npm run build
vercel --prod
```

Add `REACT_APP_SCRIPT_URL` as an environment variable in the Vercel dashboard, then redeploy.

### 3. Install as PWA

- **Android:** Chrome menu → Add to Home Screen
- **iPhone:** Safari Share → Add to Home Screen

### Environment variables

| Variable | Description |
|---|---|
| `REACT_APP_SCRIPT_URL` | Full URL of your deployed Google Apps Script web app |

---

## Design Decisions

### Why Google Sheets as a database?
For a small group of friends, a full database (Firebase, Supabase, PlanetScale) would be free-tier overkill and adds account/config complexity. Google Sheets gives us a human-readable, editable data store that everyone in the group can inspect directly. If someone logs a game wrong, they can just fix the row in Sheets.

### Why no authentication?
The app is shared via a private link within a WhatsApp group. Anyone with the link can log games — this matches how the group operates (trust-based) and avoids login friction on mobile. For a larger deployment, adding a simple PIN or Google OAuth would be a natural next step.

### Why compute stats on the backend (Apps Script) instead of the frontend?
The frontend receives raw player and game arrays and the Apps Script `getStats()` does all aggregation server-side. This keeps the React components lean and means the stats logic is in one place. The tradeoff is a slightly slower API response — acceptable since stats are only recomputed on page load/refresh.

### Why auto-recall the last game setup?
The most common flow is: same 4 people play 5–10 games in a session. Making users re-select all 4 players and re-assign teams for every single game would be tedious on mobile. Auto-recall turns the typical case into: open app → check teams are right → select coat result → tap Log. Under 10 seconds.

### Aesthetic direction
Dark theme (`#0f0f0f` base) with gold accent (`#e8c547`) — chosen to evoke a card game / casino feel without being garish. Typography uses **Syne** (geometric, bold, great for headings and numbers) paired with **DM Sans** (clean, readable at small sizes on mobile). Colour coding for coat rates (green/amber/red) provides instant visual parsing of the leaderboard.

---

## Future Ideas

These weren't built yet but the data model supports them all:

- **Season system** — reset leaderboard every month, archive historical seasons
- **Head-to-head records** — Team A (pair) vs Team B (pair) all-time win/loss record
- **Notifications** — WhatsApp/Telegram bot that posts leaderboard updates after each game
- **Edit/delete game** — correct a mis-logged game from the app (currently must edit in Sheets directly)
- **Offline support** — queue games logged without internet and sync when connection returns
- **Admin PIN** — optional protection so only designated players can log games
- **Achievements** — badges for milestones (10 clean games streak, 50 games played, etc.)
- **Export** — download season stats as PDF or share leaderboard screenshot

---

## Contributing

This is a personal project for our friend group but PRs are welcome. The codebase is intentionally kept simple — no TypeScript, no Redux, no test suite — to stay approachable for anyone who wants to fork it for their own group.

---

## License

MIT — do whatever you want with it.

---

*Built with Claude — designed in a single conversation starting from "we play Mendicoat every day and want to track coats."*