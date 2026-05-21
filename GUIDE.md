# Mendicoat Premier League — User Guide

🔗 **App link: [mendicoat-premier-league.vercel.app](https://mendicoat-premier-league.vercel.app/)**

This app tracks every game of Mendicoat your group plays. Log a game in under 30 seconds and let the app do the rest — leaderboards, streaks, pair stats, and more update automatically.

---

## Installing the App

You don't need to download anything from an app store. Open the link in your browser and install it as a home screen app.

**On Android (Chrome)**
Tap the three-dot menu → *Add to Home Screen*

**On iPhone (Safari)**
Tap the Share button → *Add to Home Screen*

Once installed, the app opens full-screen like a native app.

---

## The Four Tabs

### ➕ Log — Record a Game

This is where you log every game after it finishes.

**How to log a game:**
1. Tap each player who played to assign them to a team
   - First tap → **Team A** (green)
   - Second tap → **Team B** (blue)
   - Third tap → removes them from the game
2. You need exactly 4 players selected (2 per team)
3. Select the result:
   - **No coat** — neither team got coated (a normal win/loss)
   - **Team A coated** — Team A got all four tens
   - **Team B coated** — Team B got all four tens
4. Tap **LOG GAME**

**Auto-recall:** The app remembers the last game's team setup. If the same four people are playing again, their teams will be pre-filled — just check they're correct and tap Log Game.

**Adding a new player:** Scroll to the bottom of the Log screen, type their name and tap *Add Player*.

---

### 🏆 Board — Leaderboard & Group Stats

The main ranking screen. Players are sorted from best to worst by coat rate (lower is better).

#### Player Rankings

| What you see | What it means |
|---|---|
| **Coat rate %** | Percentage of games where that player got coated. Lower = better. |
| **Win % (blue)** | Percentage of games where that player's team won (opponent got coated). |
| **↑ improving / ↓ worsening** | Whether their coat rate is trending better or worse over their last 10 games. |
| **🔥 N game clean streak** | They haven't been coated in their last N games. |
| **💀 N coat streak** | They've been coated in each of their last N games. |
| Green border | Current best performer (lowest coat rate). |
| Red border | Current worst performer (highest coat rate with at least one coat). |

Tap any player row to jump to their detailed stats in the **Me** tab.

#### Group Stats (below the leaderboard)

| Stat | What it means |
|---|---|
| **Avg games / session** | Average number of games played on days the group meets. |
| **Coat-free sessions** | Number of days where every game played was clean (no coats at all). |
| **Longest session** | The single day with the most games played. |
| **Most coats** | The single day with the most coats in one session. |
| **Most common lineup** | The four players who most frequently end up playing together. |
| **Group coat trend** | Monthly chart of the group's overall coat rate — shows whether the group is getting better or worse over time. |

---

### 🤝 Pairs — Duo Statistics

Shows stats for every pair of players who have played as teammates at least twice.

#### Highlight Cards

| Card | What it means |
|---|---|
| **🏅 Best duo** | The pair with the lowest coat rate — the most reliable teammates. |
| **💀 Danger duo** | The pair with the highest coat rate — playing together tends to end in a coat. |
| **⚡ Most wins** | The pair with the highest win rate (opponent got coated). |
| **🃏 Most played** | The pair who have played together the most games. |

#### Sort Buttons

- **Coat % ↑** — sorted by coat rate, lowest first (best pairs at top)
- **Win % ↓** — sorted by win rate, highest first (most dominant pairs at top)
- **Games ↓** — sorted by games played together, most first

#### Per-Pair Card

| What you see | What it means |
|---|---|
| **Coat rate %** | How often this pair gets coated when playing together. |
| **Coats** | Total number of times this pair was coated. |
| **Wins** | Total games where the other team got coated while these two played. |
| **Win rate** | Wins as a percentage of games together. |
| **Win streak 🔥** | Consecutive wins in their most recent games together (only shown when > 0). |
| **LAST 5 dots** | Their last 5 games together — 🔴 red = coated, 🟢 green = clean. |
| **Coat rate bar** | Visual bar showing coat rate (green = low, amber = medium, red = high). |

#### Head to Head (▼ HEAD TO HEAD)

Tap this on any pair card to see their record against every specific opponent pair they've faced.

- **W** — wins (opponent got coated)
- **L** — losses (this pair got coated)
- **G** — total games against that opponent pair

---

### 👤 Me — Individual Player Stats

Detailed breakdown for a single player. Tap the name buttons at the top to switch between players.

#### Hero Card

| What you see | What it means |
|---|---|
| **Coat rate %** | Overall percentage of games where this player was coated. |
| **Rank** | Their position on the leaderboard (1 = fewest coats). |
| **↓ X% vs last month** | Coat rate dropped compared to last month — they're improving. Green. |
| **↑ X% vs last month** | Coat rate went up compared to last month — they're getting worse. Red. |
| **↑ Form improving** | Fewer coats in last 5 games compared to the 5 before that. |
| **↓ Form worsening** | More coats in last 5 games compared to the 5 before that. |
| **Last N games dots** | Each dot is one game — 🔴 coated, 🟢 clean. Most recent is on the right. |

#### Core Stats Grid

| Stat | What it means |
|---|---|
| **Games** | Total games this player has played. |
| **Coats** | Total times this player was coated. |
| **Rank** | Leaderboard position. |
| **Wins** | Games where this player's team won (the other team got coated). |
| **Win %** | Wins as a percentage of games played. |
| **Sit-out** | Games this player was NOT part of (sat out while others played). |

#### Streaks

| Stat | What it means |
|---|---|
| **🔥 Best clean streak** | Longest run of consecutive games without being coated, all-time. |
| **💀 Worst coat streak** | Longest run of consecutive games where they got coated, all-time. |
| **📍 Current streak** | Their current ongoing streak — either clean games or coat games. |
| **📅 Last coated** | Date of the most recent game where they got coated. "Never!" if they've never been coated. |
| **📆 Worst day** | The single day they got coated the most times, with the date and total games played that day. |
| **⚡ Best win streak** | Longest run of consecutive wins (opponent coated) all-time. |
| **🏅 Current win streak** | How many wins in a row they're currently on. |

#### Partner Breakdown

Shows coat rate for every partner this player has played with (at least 2 games together).

- **🍀 lucky** — the partner they get coated least with
- **👿 nemesis** — the partner they get coated most with
- Sorted from best (lowest coat rate) to worst

#### VS Opponents

Shows how often this player gets coated when facing each opponent. Sorted by worst opponent first (the opponent that causes the most coats for this player).

| Stat | What it means |
|---|---|
| **Coat rate %** | How often this player gets coated when that person is on the opposing team. |
| **Games facing** | Total games played against that opponent. |
| **Coats received** | Times coated while facing that opponent. |

#### Monthly Trend

A bar chart showing coat rate month by month (last 6 months, most recent at top).
- Green bar = good month (coat rate below 20%)
- Amber bar = average month (20–40%)
- Red bar = rough month (above 40%)

---

## Quick Reference — Colour Coding

The same colour system is used everywhere in the app:

| Colour | Meaning |
|---|---|
| 🟢 Green | Good — low coat rate (below 20%) |
| 🟡 Amber/Gold | Average — mid coat rate (20–40%) |
| 🔴 Red | Bad — high coat rate (above 40%) |
| 🔵 Blue | Win rate stats |

---

## Refreshing Data

Tap the **↻ button** in the top-right corner of the app to reload the latest data from the server. The app caches stats for speed, so if someone else just logged a game and you don't see it yet, hit refresh.

---

## Common Questions

**Do I need an account?**
No. The app is shared via the group link. Anyone with the link can log games and view stats.

**What if I log a game wrong?**
Open the Google Sheet directly and fix the row in the *Games* tab. The app will pick up the correction next time it refreshes.

**Can two people log games at the same time?**
Yes. Each game is a separate row in the sheet, so there's no conflict.

**Why does my coat rate look high?**
Coat rate = coats ÷ games × 100. If you've played 5 games and been coated 3 times, your rate is 60%. It evens out as you play more games.

**What's the difference between coat rate and win rate?**
- **Coat rate** — how often YOUR team gets coated (you want this low)
- **Win rate** — how often the OPPONENT team gets coated while you play (you want this high)
- A game with no coat counts as a loss for both sides in win rate terms
