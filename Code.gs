// ============================================================
//  MENDICOAT TRACKER — Google Apps Script Backend
//  Deploy as: Web App → Execute as Me → Anyone can access
// ============================================================

const SHEET_NAME_GAMES   = "Games";
const SHEET_NAME_PLAYERS = "Players";

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
      currentStreak: 0,       // + = clean games, - = coat games
      worstCoatStreak: 0,
      bestCleanStreak: 0,
      lastCoatDate: null,
      recentForm: [],          // last 10: true=coated false=clean
      monthlyStats: {}
    };
  });

  // ── Pair stats
  const pairMap = {};
  function pairKey(a, b) { return [a, b].sort().join("||"); }
  function getPair(a, b) {
    const k = pairKey(a, b);
    if (!pairMap[k]) pairMap[k] = { p1: [a,b].sort()[0], p2: [a,b].sort()[1],
      gamesTogther: 0, coatsTogether: 0, wins: 0 };
    return pairMap[k];
  }

  // ── Session stats
  const sessionMap = {};

  gamesData.forEach(g => {
    const { teamA_p1, teamA_p2, teamB_p1, teamB_p2, coatedTeam, date } = g;
    const teamA = [teamA_p1, teamA_p2];
    const teamB = [teamB_p1, teamB_p2];
    const all4  = [...teamA, ...teamB];
    const dayKey = (date || "").substring(0, 10);

    // session
    if (!sessionMap[dayKey]) sessionMap[dayKey] = { date: dayKey, games: 0, coats: 0 };
    sessionMap[dayKey].games++;
    if (coatedTeam !== "none") sessionMap[dayKey].coats++;

    // month key
    const monthKey = (date || "").substring(0, 7);

    all4.forEach(name => {
      if (!playerMap[name]) return;
      const p = playerMap[name];
      p.gamesPlayed++;
      const gotCoat = (coatedTeam === "A" && teamA.includes(name)) ||
                      (coatedTeam === "B" && teamB.includes(name));
      if (gotCoat) {
        p.coatsReceived++;
        p.lastCoatDate = dayKey;
        p.recentForm.push(true);
      } else {
        p.recentForm.push(false);
      }
      if (!p.monthlyStats[monthKey]) p.monthlyStats[monthKey] = { games: 0, coats: 0 };
      p.monthlyStats[monthKey].games++;
      if (gotCoat) p.monthlyStats[monthKey].coats++;
    });

    // pair stats
    const pairs = [
      { pair: teamA, won: coatedTeam === "B", coated: coatedTeam === "A" },
      { pair: teamB, won: coatedTeam === "A", coated: coatedTeam === "B" }
    ];
    pairs.forEach(({ pair, won, coated }) => {
      const pr = getPair(pair[0], pair[1]);
      pr.gamesTogther++;
      if (coated) pr.coatsTogether++;
      if (won && coatedTeam !== "none") pr.wins++;
    });
  });

  // ── Compute streaks
  Object.values(playerMap).forEach(p => {
    // keep only last 10 for form
    p.recentForm = p.recentForm.slice(-10);
    p.coatRate = p.gamesPlayed > 0
      ? parseFloat((p.coatsReceived / p.gamesPlayed * 100).toFixed(1))
      : 0;

    // rebuild streaks from all games in order
    let curStreak = 0, worstCoat = 0, bestClean = 0, runCoat = 0, runClean = 0;
    const allCoatFlags = gamesData.map(g => {
      const tA = [g.teamA_p1, g.teamA_p2];
      const tB = [g.teamB_p1, g.teamB_p2];
      const played = [...tA, ...tB].includes(p.name);
      if (!played) return null;
      return (g.coatedTeam === "A" && tA.includes(p.name)) ||
             (g.coatedTeam === "B" && tB.includes(p.name));
    }).filter(x => x !== null);

    allCoatFlags.forEach((coated, i) => {
      if (coated) {
        runCoat++; runClean = 0;
        if (runCoat > worstCoat) worstCoat = runCoat;
      } else {
        runClean++; runCoat = 0;
        if (runClean > bestClean) bestClean = runClean;
      }
      if (i === allCoatFlags.length - 1) {
        curStreak = coated ? -runCoat : runClean;
      }
    });

    p.currentStreak  = curStreak;
    p.worstCoatStreak = worstCoat;
    p.bestCleanStreak = bestClean;

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

    p.luckyPartner  = partnerRates[0] || null;
    p.nemesisPartner = partnerRates[partnerRates.length - 1] || null;

    // form trend: last 5 vs prev 5
    const last5  = p.recentForm.slice(-5).filter(Boolean).length;
    const prev5  = p.recentForm.slice(-10, -5).filter(Boolean).length;
    p.formTrend = p.recentForm.length >= 6 ? (last5 < prev5 ? "improving" : last5 > prev5 ? "worsening" : "stable") : "stable";

    // monthly array
    p.monthlyStats = Object.entries(p.monthlyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, s]) => ({ month, ...s, rate: s.games ? parseFloat((s.coats/s.games*100).toFixed(1)) : 0 }));
  });

  // ── Pair array
  const pairs = Object.values(pairMap).map(pr => ({
    ...pr,
    coatRate: pr.gamesTogther > 0
      ? parseFloat((pr.coatsTogether / pr.gamesTogther * 100).toFixed(1))
      : 0,
    winRate: pr.gamesTogther > 0
      ? parseFloat((pr.wins / pr.gamesTogther * 100).toFixed(1))
      : 0
  })).filter(pr => pr.gamesTogther >= 2)
    .sort((a, b) => a.coatRate - b.coatRate);

  // ── Session array
  const sessions = Object.values(sessionMap)
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    players: Object.values(playerMap).sort((a, b) => a.coatRate - b.coatRate),
    pairs,
    sessions,
    totalGames: gamesData.length,
    totalCoats: gamesData.filter(g => g.coatedTeam !== "none").length
  };
}
