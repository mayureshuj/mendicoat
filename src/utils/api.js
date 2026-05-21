// src/utils/api.js
// Replace SCRIPT_URL with your deployed Apps Script Web App URL

const SCRIPT_URL = process.env.REACT_APP_SCRIPT_URL || "";

async function call(action, body = {}) {
  if (!SCRIPT_URL) throw new Error("REACT_APP_SCRIPT_URL not set in .env");
  const url = `${SCRIPT_URL}?action=${action}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action, ...body }),
    redirect: "follow",
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export const api = {
  getPlayers:  ()        => call("getPlayers"),
  addPlayer:   (name)    => call("addPlayer",  { name }),
  logGame:     (payload) => call("logGame",    payload),
  getStats:    ()        => call("getStats"),
  getLastGame: ()        => call("getLastGame"),
  getGames:    ()        => call("getGames"),
};
