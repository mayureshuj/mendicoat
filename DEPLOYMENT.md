# Mendicoat Premier League — Deployment Guide

## What you'll set up
| Part | Service | Cost |
|------|---------|------|
| Database | Google Sheets | Free |
| Backend API | Google Apps Script | Free |
| Frontend | Vercel | Free |

Total time: ~20 minutes.

---

## Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
2. Name it **Mendicoat Premier League**.
3. Leave it empty — the script will create the sheets automatically.
4. Copy the spreadsheet URL from your browser. You'll need it in Step 2.

---

## Step 2 — Deploy the Google Apps Script backend

1. In your Google Sheet, click **Extensions → Apps Script**.
2. Delete all the placeholder code in the editor.
3. Open `Code.gs` from the files you downloaded and **paste the entire contents** into the editor.
4. Click **Save** (💾 icon), name the project **MendicoatPremierLeague**.
5. Click **Deploy → New deployment**.
6. Click the gear icon ⚙ next to "Type" and select **Web app**.
7. Set the following:
   - Description: `Mendicoat Premier League API v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy**.
9. Google will ask you to **authorize** the app — click through and allow it.
10. **Copy the Web app URL** — it looks like:
    ```
    https://script.google.com/macros/s/AKfycb.../exec
    ```
    Keep this URL — you need it in Step 4.

> ⚠️ Every time you edit `Code.gs` later, you must create a **New deployment** (not update) to apply changes.

---

## Step 3 — Set up the React app locally

You need [Node.js](https://nodejs.org) installed (v16+).

```bash
# Unzip the downloaded project folder, then:
cd mendicoat-premier-league
npm install
```

Create a file named `.env` in the project root:

```
REACT_APP_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Replace the URL with the one you copied in Step 2.

Test it locally:
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) — you should see the app and be able to add players.

---

## Step 4 — Deploy to Vercel (free hosting)

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account (free).
2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. From the project folder, run:
   ```bash
   npm run build
   vercel --prod
   ```
4. When prompted:
   - Set up and deploy: **Y**
   - Which scope: select your account
   - Link to existing project: **N**
   - Project name: `mendicoat-premier-league`
   - Directory: `./` (press Enter)
5. After it deploys, go to your **Vercel dashboard → Project → Settings → Environment Variables**.
6. Add:
   - Key: `REACT_APP_SCRIPT_URL`
   - Value: your Apps Script URL
7. Go to **Deployments → Redeploy** to apply the env variable.

Your app is now live at `https://mendicoat-premier-league.vercel.app` (or similar).

---

## Step 5 — Add players & share the link

1. Open the app on your phone.
2. Go to the **Log** tab.
3. Scroll down to **Add Player** and add all 6 players:
   - Mayuresh Joshi
   - Ajit Wadkar
   - Mohan Jagtap
   - Milind Wagh
   - Amol Wagh
   - Pramod Kubade
4. Share the Vercel URL with all players via WhatsApp.

---

## Step 6 — Install as a PWA (optional but recommended)

On **Android (Chrome)**:
- Open the app URL in Chrome
- Tap the 3-dot menu → **Add to Home screen**

On **iPhone (Safari)**:
- Open the app URL in Safari
- Tap the Share button → **Add to Home Screen**

This gives everyone a native app icon — no app store needed.

---

## How to log a game (30-second flow)

1. Open app → **Log** tab
2. Players from the last game are **auto-selected** — just verify them
3. Tap players to toggle Team A (green) / Team B (blue)
4. Select coat result: **No coat / Team A / Team B**
5. Tap **LOG GAME**

---

## Data in Google Sheets

Your sheet will have two tabs auto-created:
- **Players** — roster with IDs
- **Games** — every logged game with teams and result

You can open the sheet anytime to view raw data, export to Excel, or manually fix a wrong entry.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "REACT_APP_SCRIPT_URL not set" | Add `.env` file with the Apps Script URL |
| App loads but data doesn't save | Re-deploy Apps Script as a **new** deployment |
| CORS error in console | Make sure "Who has access" is set to **Anyone** in Apps Script |
| Players not loading | Open the Apps Script URL directly in browser — if it returns JSON you're good |
| Vercel shows old data | Check env variable is set in Vercel dashboard and redeploy |

---

## File reference

```
mendicoat-premier-league/
├── Code.gs                  ← Paste into Google Apps Script
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── App.js               ← Main app shell + tab navigation
│   ├── index.js             ← React entry point
│   ├── index.css            ← Global styles
│   ├── utils/
│   │   └── api.js           ← All API calls (point to your Script URL)
│   └── components/
│       ├── LogGame.js       ← Log game screen (auto-loads last game)
│       ├── Leaderboard.js   ← Rankings with coat rate bars
│       ├── PairStats.js     ← Duo statistics
│       └── PlayerStats.js   ← Individual deep stats
└── package.json
```
