// src/App.js
import React, { useState, useEffect, useCallback } from "react";
import { Analytics } from "@vercel/analytics/react";
import { api } from "./utils/api";
import LogGame   from "./components/LogGame";
import Leaderboard from "./components/Leaderboard";
import PlayerStats from "./components/PlayerStats";
import PairStats   from "./components/PairStats";
import "./index.css";

const TABS = [
  { id: "log",    label: "Log",    icon: "➕" },
  { id: "board",  label: "Board",  icon: "🏆" },
  { id: "pairs",  label: "Pairs",  icon: "🤝" },
  { id: "player", label: "Me",     icon: "👤" },
];

export default function App() {
  const [tab, setTab]         = useState("log");
  const [stats, setStats]     = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, sRes] = await Promise.all([api.getPlayers(), api.getStats()]);
      setPlayers(pRes.players || []);
      setStats(sRes);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handlePlayerSelect = (name) => {
    setSelectedPlayer(name);
    setTab("player");
  };

  if (!process.env.REACT_APP_SCRIPT_URL) {
    return (
      <div style={{ padding: "2rem", color: "var(--text)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
          <img src="/logo.png" alt="logo" style={{ width: 48, height: 48, borderRadius: 10 }} />
          <div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 17, fontWeight: 800 }}>MENDICOAT</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.12em", color: "var(--accent)" }}>PREMIER LEAGUE</div>
          </div>
        </div>
        <h2 style={{ fontFamily: "var(--font-head)", marginBottom: "1rem", fontSize: 16 }}>Setup needed</h2>
        <p style={{ color: "var(--text2)", lineHeight: 1.7 }}>
          Create a <code style={{ background: "var(--surface2)", padding: "2px 6px", borderRadius: 4 }}>.env</code> file
          in the project root with:<br /><br />
          <code style={{ background: "var(--surface2)", padding: "8px 12px", borderRadius: 6, display: "block" }}>
            REACT_APP_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
          </code>
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100dvh" }}>

      {/* Header */}
      <header style={{
        padding: "12px 16px 10px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="/logo.png"
            alt="Mendicoat logo"
            style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
          />
          <div>
            <h1 style={{ fontFamily: "var(--font-head)", fontSize: 15, fontWeight: 800,
              letterSpacing: "-0.2px", lineHeight: 1.2, color: "var(--text)" }}>
              MENDICOAT
            </h1>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.12em", color: "var(--accent)", lineHeight: 1 }}>
              PREMIER LEAGUE
            </div>
            {stats && !loading && (
              <p style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>
                {stats.totalGames} games · {stats.totalCoats} coats
              </p>
            )}
          </div>
        </div>
        <button
          onClick={loadData}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "var(--surface2)", color: "var(--text2)",
            fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0
          }}
          aria-label="Refresh"
        >
          ↻
        </button>
      </header>

      {/* Error banner */}
      {error && (
        <div style={{
          background: "var(--danger)", color: "#fff",
          padding: "10px 20px", fontSize: 13
        }}>
          ⚠ {error} — check your Apps Script URL
        </div>
      )}

      {/* Main content */}
      <main style={{ flex: 1, overflowY: "auto", padding: "0 0 calc(var(--tab-h) + 16px)" }}>
        {loading && (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text3)",
            animation: "pulse 1.5s ease infinite" }}>
            Loading…
          </div>
        )}

        {!loading && tab === "log" && (
          <LogGame players={players} onLogged={loadData} setPlayers={setPlayers} />
        )}
        {!loading && tab === "board" && (
          <Leaderboard stats={stats} onSelectPlayer={handlePlayerSelect} />
        )}
        {!loading && tab === "pairs" && (
          <PairStats stats={stats} />
        )}
        {!loading && tab === "player" && (
          <PlayerStats
            stats={stats}
            players={players}
            selectedPlayer={selectedPlayer}
            setSelectedPlayer={setSelectedPlayer}
          />
        )}
      </main>

      {/* Bottom tab bar */}
      <nav style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        height: "var(--tab-h)",
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        zIndex: 100
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: "none",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 3,
              color: tab === t.id ? "var(--accent)" : "var(--text3)",
              fontSize: 10,
              fontFamily: "var(--font-head)",
              fontWeight: tab === t.id ? 700 : 400,
              letterSpacing: "0.05em",
              transition: "color .2s"
            }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            {t.label.toUpperCase()}
          </button>
        ))}
      </nav>
      <Analytics />
    </div>
  );
}
