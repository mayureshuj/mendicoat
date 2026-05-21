// ============================================================
//  MENDICOAT PREMIER LEAGUE — Google Apps Script Backend
//  Deploy as: Web App → Execute as Me → Anyone can access
// ============================================================

const SHEET_NAME_GAMES   = "Games";
const SHEET_NAME_PLAYERS = "Players";
const STATS_CACHE_KEY    = "mpl_stats_v1";
const STATS_CACHE_TTL    = 21600; // 6 hours

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const params = e.parameter || {};
  const body   = e.postData ? JSON.parse(e.postData.contents || "{}") : {};
  const action = params.action || body.action;

  try {
    let result;
    switch (action) {
      case "getPlayers":   result = getPlayers();         break;
      case "addPlayer":    result = addPlayer(body);      break;
      case "logGame":      result = logGame(body);        break;
      case "getStats":     result = getStats();           break;
      case "getLastGame":  result = getLastGame();        break;
      case "getGames":     result = getGames();           break;
      default:             result = { error: "Unknown action: " + action };
    }
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function jsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ── Sheet helpers ──────────────────────────────────────────

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row =>
    Object.fromEntries(headers.map((h, i) => [h, row[i]]))
  );
}

// ── Players ───────────────────────────────────────────────

function getPlayers() {
  const sheet = getOrCreateSheet("Players", ["id", "name", "createdAt"]);
  return { players: sheetToObjects(sheet) };
}

function addPlayer(body) {
  const sheet = getOrCreateSheet("Players", ["id", "name", "createdAt"]);
  const existing = sheetToObjects(sheet);
  const name = (body.name || "").trim();
  if (!name) throw new Error("Name is required");
  if (existing.find(p => p.name.toLowerCase() === name.toLowerCase()))
    throw new Error("Player already exists");
  const id = "p_" + Date.now();
  sheet.appendRow([id, name, new Date().toISOString()]);
  return { success: true, player: { id, name } };
}

// ── Games ─────────────────────────────────────────────────

function logGame(body) {
  const sheet = getOrCreateSheet("Games", [
    "id","date","teamA_p1","teamA_p2","teamB_p1","teamB_p2","coatedTeam"
  ]);
  const { teamA, teamB, coatedTeam, date } = body;
  if (!teamA || teamA.length !== 2) throw new Error("teamA must have 2 players");
  if (!teamB || teamB.length !== 2) throw new Error("teamB must have 2 players");
  if (!["A","B","none"].includes(coatedTeam)) throw new Error("Invalid coatedTeam value");

  const id = "g_" + Date.now();
  const gameDate = date || new Date().toISOString();
  sheet.appendRow([id, gameDate, teamA[0], teamA[1], teamB[0], teamB[1], coatedTeam]);
  // Invalidate cache so next getStats() reflects the new game
  CacheService.getScriptCache().remove(STATS_CACHE_KEY);
  return { success: true, id };
}

function getGames() {
  const sheet = getOrCreateSheet("Games", [
    "id","date","teamA_p1","teamA_p2","teamB_p1","teamB_p2","coatedTeam"
  ]);
  return { games: sheetToObjects(sheet) };
}

function getLastGame() {
  const sheet = getOrCreateSheet("Games", [
    "id","date","teamA_p1","teamA_p2","teamB_p1","teamB_p2","coatedTeam"
  ]);
  const rows = sheetToObjects(sheet);
  if (!rows.length) return { game: null };
  return { game: rows[rows.length - 1] };
}

// ── Stats ─────────────────────────────────────────────────

function getStats() {
  const gamesSheet = getOrCreateSheet("Games", [
    "id","date","teamA_p1","teamA_p2","teamB_p1","teamB_p2","coatedTeam"
  ]);
  const gameCount = Math.max(0, gamesSheet.getLastRow() - 1);

  const cache  = CacheService.getScriptCache();
  const cached = cache.get(STATS_CACHE_KEY);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed._gameCount === gameCount) {
        delete parsed._gameCount;
        return parsed;
      }
    } catch(e) {}
  }

  const result = computeStats();
  try {
    cache.put(STATS_CACHE_KEY, JSON.stringify({ ...result, _gameCount: gameCount }), STATS_CACHE_TTL);
  } catch(e) {}
  return result;
}

function computeStats() {
  const playersData = getPlayers().players;
  const gamesData   = getGames().games;

  if (!playersData.length) return { players: [], pairs: [], sessions: [] };

  // ── Per-player stats
  const playerMap = {};
  playersData.forEach(p => {
    playerMap[p.name] = {
      name: p.name,
      gamesPlayed: 0,
      coatsReceived: 0,
      coatRate: 0,
      winsReceived: 0,
      winRate: 0,
      sitOutCount: 0,
      sitOutRate: 0,
      attendedSessions: 0,
      currentStreak: 0,
      worstCoatStreak: 0,
      bestCleanStreak: 0,
      currentWinStreak: 0,
      bestWinStreak: 0,
      lastCoatDate: null,
      monthOverMonthDelta: null,
      worstDay: null,
      recentForm: [],
      monthlyStats: {},
      opponentStats: []
    };
  });

  // ── Opponent tracking scratch maps
  const playerOpponentGames = {};
  const playerOpponentCoats = {};
  playersData.forEach(p => {
    playerOpponentGames[p.name] = {};
    playerOpponentCoats[p.name] = {};
  });

  // ── Pair stats
  const pairMap = {};
  function pairKey(a, b) { return [a, b].sort().join("||"); }
  function getPair(a, b) {
    const k = pairKey(a, b);
    if (!pairMap[k]) pairMap[k] = {
      p1: [a,b].sort()[0], p2: [a,b].sort()[1],
      gamesTogther: 0, coatsTogether: 0, wins: 0,
      recentForm: [],
      headToHead: {}
    };
    return pairMap[k];
  }

  // ── Session stats
  const sessionMap = {};

  // ── Lineup tracking
  const lineupMap = {};

  gamesData.forEach(g => {
    const { teamA_p1, teamA_p2, teamB_p1, teamB_p2, coatedTeam, date } = g;
    const teamA = [teamA_p1, teamA_p2];
    const teamB = [teamB_p1, teamB_p2];
    const all4  = [...teamA, ...teamB];
    const dayKey = (date || "").substring(0, 10);

    // session
    if (!sessionMap[dayKey]) sessionMap[dayKey] = { date: dayKey, games: 0, coats: 0, players: [] };
    sessionMap[dayKey].games++;
    if (coatedTeam !== "none") sessionMap[dayKey].coats++;

    // session player attendance
    all4.forEach(name => {
      if (!sessionMap[dayKey].players.includes(name)) sessionMap[dayKey].players.push(name);
    });

    // month key
    const monthKey = (date || "").substring(0, 7);

    all4.forEach(name => {
      if (!playerMap[name]) return;
      const p = playerMap[name];
      p.gamesPlayed++;
      const onTeamA = teamA.includes(name);
      const gotCoat = (coatedTeam === "A" && onTeamA) || (coatedTeam === "B" && !onTeamA);
      const won     = (coatedTeam === "B" && onTeamA) || (coatedTeam === "A" && !onTeamA);

      if (gotCoat) {
        p.coatsReceived++;
        p.lastCoatDate = dayKey;
        p.recentForm.push(true);
      } else {
        p.recentForm.push(false);
      }
      if (won && coatedTeam !== "none") p.winsReceived++;

      if (!p.monthlyStats[monthKey]) p.monthlyStats[monthKey] = { games: 0, coats: 0 };
      p.monthlyStats[monthKey].games++;
      if (gotCoat) p.monthlyStats[monthKey].coats++;

      // opponent tracking
      const opponents = onTeamA ? teamB : teamA;
      opponents.forEach(opp => {
        if (!playerOpponentGames[name]) return;
        playerOpponentGames[name][opp] = (playerOpponentGames[name][opp] || 0) + 1;
        if (gotCoat) playerOpponentCoats[name][opp] = (playerOpponentCoats[name][opp] || 0) + 1;
      });
    });

    // pair stats
    const pairEntries = [
      { pair: teamA, won: coatedTeam === "B", coated: coatedTeam === "A" },
      { pair: teamB, won: coatedTeam === "A", coated: coatedTeam === "B" }
    ];
    pairEntries.forEach(({ pair, won, coated }) => {
      const pr = getPair(pair[0], pair[1]);
      pr.gamesTogther++;
      if (coated) pr.coatsTogether++;
      if (won && coatedTeam !== "none") pr.wins++;
    });

    // pair recentForm + head-to-head
    const prA = getPair(teamA[0], teamA[1]);
    const prB = getPair(teamB[0], teamB[1]);
    const pkA = pairKey(teamA[0], teamA[1]);
    const pkB = pairKey(teamB[0], teamB[1]);

    prA.recentForm.push(coatedTeam === "A");
    prB.recentForm.push(coatedTeam === "B");

    if (!prA.headToHead[pkB]) prA.headToHead[pkB] = { wins: 0, losses: 0, games: 0 };
    prA.headToHead[pkB].games++;
    if (coatedTeam === "B") prA.headToHead[pkB].wins++;
    if (coatedTeam === "A") prA.headToHead[pkB].losses++;

    if (!prB.headToHead[pkA]) prB.headToHead[pkA] = { wins: 0, losses: 0, games: 0 };
    prB.headToHead[pkA].games++;
    if (coatedTeam === "A") prB.headToHead[pkA].wins++;
    if (coatedTeam === "B") prB.headToHead[pkA].losses++;

    // lineup tracking
    const lineupKey = all4.slice().sort().join("||");
    if (!lineupMap[lineupKey]) lineupMap[lineupKey] = { players: all4.slice().sort(), games: 0 };
    lineupMap[lineupKey].games++;
  });

  // ── Per-player post-processing
  Object.values(playerMap).forEach(p => {
    p.recentForm = p.recentForm.slice(-10);
    p.coatRate = p.gamesPlayed > 0
      ? parseFloat((p.coatsReceived / p.gamesPlayed * 100).toFixed(1))
      : 0;
    p.winRate = p.gamesPlayed > 0
      ? parseFloat((p.winsReceived / p.gamesPlayed * 100).toFixed(1))
      : 0;
    p.sitOutCount = gamesData.length - p.gamesPlayed;
    p.sitOutRate  = gamesData.length > 0
      ? parseFloat((p.sitOutCount / gamesData.length * 100).toFixed(1))
      : 0;
    p.attendedSessions = Object.values(sessionMap).filter(s => s.players.includes(p.name)).length;

    // coat streak + win streak (single pass per player)
    let curStreak = 0, worstCoat = 0, bestClean = 0, runCoat = 0, runClean = 0;
    let curWin = 0, bestWin = 0, runWin = 0;

    const allFlags = gamesData.map(g => {
      const tA = [g.teamA_p1, g.teamA_p2];
      const tB = [g.teamB_p1, g.teamB_p2];
      if (![...tA, ...tB].includes(p.name)) return null;
      const onA = tA.includes(p.name);
      const coated = (g.coatedTeam === "A" && onA) || (g.coatedTeam === "B" && !onA);
      const won    = (g.coatedTeam === "B" && onA) || (g.coatedTeam === "A" && !onA);
      return { coated, won: won && g.coatedTeam !== "none" };
    }).filter(x => x !== null);

    allFlags.forEach(({ coated, won }, i) => {
      // coat streak
      if (coated) { runCoat++; runClean = 0; if (runCoat > worstCoat) worstCoat = runCoat; }
      else        { runClean++; runCoat = 0; if (runClean > bestClean) bestClean = runClean; }
      if (i === allFlags.length - 1) curStreak = coated ? -runCoat : runClean;

      // win streak
      if (won) { runWin++; if (runWin > bestWin) bestWin = runWin; }
      else     { runWin = 0; }
      if (i === allFlags.length - 1) curWin = runWin;
    });

    p.currentStreak   = curStreak;
    p.worstCoatStreak = worstCoat;
    p.bestCleanStreak = bestClean;
    p.currentWinStreak = curWin;
    p.bestWinStreak    = bestWin;

    // partner stats
    const partnerCoats = {}, partnerGames = {};
    gamesData.forEach(g => {
      const tA = [g.teamA_p1, g.teamA_p2];
      const tB = [g.teamB_p1, g.teamB_p2];
      const myTeam = tA.includes(p.name) ? tA : tB.includes(p.name) ? tB : null;
      if (!myTeam) return;
      const partner = myTeam.find(n => n !== p.name);
      if (!partner) return;
      partnerGames[partner] = (partnerGames[partner] || 0) + 1;
      const gotCoat = (g.coatedTeam === "A" && tA.includes(p.name)) ||
                      (g.coatedTeam === "B" && tB.includes(p.name));
      if (gotCoat) partnerCoats[partner] = (partnerCoats[partner] || 0) + 1;
    });

    const partnerRates = Object.entries(partnerGames)
      .filter(([, g]) => g >= 2)
      .map(([name, g]) => ({
        name,
        games: g,
        coats: partnerCoats[name] || 0,
        rate: parseFloat(((partnerCoats[name] || 0) / g * 100).toFixed(1))
      }))
      .sort((a, b) => a.rate - b.rate);

    p.luckyPartner   = partnerRates[0] || null;
    p.nemesisPartner = partnerRates[partnerRates.length - 1] || null;

    // form trend: last 5 vs prev 5
    const last5 = p.recentForm.slice(-5).filter(Boolean).length;
    const prev5 = p.recentForm.slice(-10, -5).filter(Boolean).length;
    p.formTrend = p.recentForm.length >= 6
      ? (last5 < prev5 ? "improving" : last5 > prev5 ? "worsening" : "stable")
      : "stable";

    // monthly array (must be built before MoM delta)
    p.monthlyStats = Object.entries(p.monthlyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, s]) => ({
        month, ...s,
        rate: s.games ? parseFloat((s.coats / s.games * 100).toFixed(1)) : 0
      }));

    // month-over-month coat rate delta (positive = worsening, negative = improving)
    if (p.monthlyStats.length >= 2) {
      const prev = p.monthlyStats[p.monthlyStats.length - 2].rate;
      const curr = p.monthlyStats[p.monthlyStats.length - 1].rate;
      p.monthOverMonthDelta = parseFloat((curr - prev).toFixed(1));
    }

    // worst day — session where this player got coated the most
    const dailyCoats = {}, dailyGames = {};
    gamesData.forEach(g => {
      const tA = [g.teamA_p1, g.teamA_p2], tB = [g.teamB_p1, g.teamB_p2];
      if (![...tA, ...tB].includes(p.name)) return;
      const dk = (g.date || "").substring(0, 10);
      dailyGames[dk] = (dailyGames[dk] || 0) + 1;
      const onA = tA.includes(p.name);
      const gotCoat = (g.coatedTeam === "A" && onA) || (g.coatedTeam === "B" && !onA);
      if (gotCoat) dailyCoats[dk] = (dailyCoats[dk] || 0) + 1;
    });
    const worstDayEntry = Object.entries(dailyCoats)
      .filter(([, c]) => c > 0)
      .sort(([, a], [, b]) => b - a)[0];
    p.worstDay = worstDayEntry
      ? { date: worstDayEntry[0], coats: worstDayEntry[1], games: dailyGames[worstDayEntry[0]] }
      : null;

    // opponent stats
    p.opponentStats = Object.entries(playerOpponentGames[p.name] || {})
      .map(([opp, g]) => ({
        name: opp,
        games: g,
        coats: playerOpponentCoats[p.name][opp] || 0,
        rate: parseFloat(((playerOpponentCoats[p.name][opp] || 0) / g * 100).toFixed(1))
      }))
      .sort((a, b) => b.rate - a.rate);
  });

  // ── Pair array
  const pairs = Object.values(pairMap).map(pr => ({
    ...pr,
    coatRate: pr.gamesTogther > 0
      ? parseFloat((pr.coatsTogether / pr.gamesTogther * 100).toFixed(1))
      : 0,
    winRate: pr.gamesTogther > 0
      ? parseFloat((pr.wins / pr.gamesTogther * 100).toFixed(1))
      : 0,
    recentForm: pr.recentForm.slice(-5),
    headToHead: pr.headToHead,
    currentWinStreak: (() => {
      let s = 0;
      for (let i = pr.recentForm.length - 1; i >= 0; i--) {
        if (!pr.recentForm[i]) s++; else break;
      }
      return s;
    })(),
    bestWinStreak: (() => {
      let best = 0, run = 0;
      pr.recentForm.forEach(c => {
        if (!c) { run++; if (run > best) best = run; } else run = 0;
      });
      return best;
    })()
  })).filter(pr => pr.gamesTogther >= 2)
    .sort((a, b) => a.coatRate - b.coatRate);

  // ── Session array
  const sessionArr = Object.values(sessionMap).sort((a, b) => a.date.localeCompare(b.date));

  // ── Group-level stats
  const groupMonthly = {};
  gamesData.forEach(g => {
    const mk = (g.date || "").substring(0, 7);
    if (!groupMonthly[mk]) groupMonthly[mk] = { games: 0, coats: 0 };
    groupMonthly[mk].games++;
    if (g.coatedTeam !== "none") groupMonthly[mk].coats++;
  });
  const groupCoatRateTrend = Object.entries(groupMonthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, s]) => ({
      month, games: s.games, coats: s.coats,
      rate: parseFloat((s.coats / s.games * 100).toFixed(1))
    }));

  const longestSession       = sessionArr.reduce((best, s) => s.games > (best ? best.games : 0) ? s : best, null);
  const mostCoatHeavySession = sessionArr.reduce((best, s) => s.coats > (best ? best.coats : 0) ? s : best, null);
  const coatFreeSessionCount = sessionArr.filter(s => s.coats === 0).length;
  const avgGamesPerSession   = sessionArr.length > 0
    ? parseFloat((gamesData.length / sessionArr.length).toFixed(1))
    : 0;

  const lineups = Object.values(lineupMap).sort((a, b) => b.games - a.games);
  const mostCommonLineup = lineups[0] || null;

  return {
    players: Object.values(playerMap).sort((a, b) => a.coatRate - b.coatRate),
    pairs,
    sessions: sessionArr,
    totalGames: gamesData.length,
    totalCoats: gamesData.filter(g => g.coatedTeam !== "none").length,
    groupCoatRateTrend,
    longestSession,
    mostCoatHeavySession,
    coatFreeSessionCount,
    avgGamesPerSession,
    mostCommonLineup,
    lineups
  };
}
