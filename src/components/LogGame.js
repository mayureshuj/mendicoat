// src/components/LogGame.js
import React, { useState, useEffect } from "react";
import { api } from "../utils/api";

const TEAM_COLORS = {
  A: { bg: "#1a2a1a", border: "#52b788", text: "#52b788" },
  B: { bg: "#1a1a2a", border: "#6ba3d6", text: "#6ba3d6" },
};

export default function LogGame({ players, onLogged, setPlayers }) {
  const [teamA, setTeamA]         = useState([]);
  const [teamB, setTeamB]         = useState([]);
  const [coatedTeam, setCoatedTeam] = useState("none");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]     = useState(false);
  const [error, setError]         = useState("");
  const [newName, setNewName]     = useState("");
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [loadingLast, setLoadingLast]   = useState(true);

  // Auto-load last game config
  useEffect(() => {
    api.getLastGame().then(({ game }) => {
      if (game) {
        setTeamA([game.teamA_p1, game.teamA_p2].filter(Boolean));
        setTeamB([game.teamB_p1, game.teamB_p2].filter(Boolean));
        setCoatedTeam("none");
      }
    }).catch(() => {}).finally(() => setLoadingLast(false));
  }, []);

  const allSelected = [...teamA, ...teamB];

  const handlePlayerClick = (name) => {
    // If already on teamA, move to teamB
    if (teamA.includes(name)) {
      setTeamA(teamA.filter(n => n !== name));
      if (teamB.length < 2) setTeamB([...teamB, name]);
      return;
    }
    // If already on teamB, remove
    if (teamB.includes(name)) {
      setTeamB(teamB.filter(n => n !== name));
      return;
    }
    // Not selected yet — add to teamA first, then teamB
    if (teamA.length < 2) { setTeamA([...teamA, name]); return; }
    if (teamB.length < 2) { setTeamB([...teamB, name]); return; }
    // All 4 slots full — replace oldest in teamA
    setTeamA([teamA[1], name]);
  };

  const getPlayerState = (name) => {
    if (teamA.includes(name)) return "A";
    if (teamB.includes(name)) return "B";
    return null;
  };

  const canSubmit = teamA.length === 2 && teamB.length === 2;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      await api.logGame({ teamA, teamB, coatedTeam });
      setSuccess(true);
      setCoatedTeam("none");
      setTimeout(() => setSuccess(false), 2500);
      onLogged();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPlayer = async () => {
    if (!newName.trim()) return;
    setAddingPlayer(true);
    try {
      const res = await api.addPlayer(newName.trim());
      setPlayers(prev => [...prev, res.player]);
      setNewName("");
    } catch (e) {
      setError(e.message);
    } finally {
      setAddingPlayer(false);
    }
  };

  const clearAll = () => {
    setTeamA([]); setTeamB([]); setCoatedTeam("none");
  };

  if (loadingLast) {
    return <div style={{ padding: "2rem", color: "var(--text3)", textAlign: "center",
      animation: "pulse 1.5s ease infinite" }}>Loading last game…</div>;
  }

  return (
    <div style={{ padding: "20px 16px" }} className="fade-up">

      {/* Success toast */}
      {success && (
        <div className="fade-in" style={{
          background: "var(--success)", color: "#fff",
          borderRadius: "var(--r)", padding: "12px 16px",
          marginBottom: 16, fontSize: 14, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 8
        }}>
          ✓ Game logged!
        </div>
      )}

      {error && (
        <div style={{
          background: "#2a1a1a", border: "1px solid var(--danger)",
          color: "var(--danger)", borderRadius: "var(--r)",
          padding: "10px 14px", marginBottom: 16, fontSize: 13
        }}>
          {error}
        </div>
      )}

      {/* Section: select players */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: 13, letterSpacing: "0.1em",
            color: "var(--text2)", fontWeight: 600 }}>
            SELECT PLAYERS
          </h2>
          <button onClick={clearAll} style={{
            fontSize: 11, color: "var(--text3)", background: "none",
            fontFamily: "var(--font-body)", letterSpacing: "0.05em"
          }}>CLEAR</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {players.map(p => {
            const state = getPlayerState(p.name);
            const col = state ? TEAM_COLORS[state] : null;
            return (
              <button
                key={p.id || p.name}
                onClick={() => handlePlayerClick(p.name)}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--r)",
                  background: col ? col.bg : "var(--surface2)",
                  border: `1.5px solid ${col ? col.border : "var(--border)"}`,
                  color: col ? col.text : "var(--text2)",
                  fontFamily: "var(--font-head)",
                  fontSize: 14, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "all .15s"
                }}
              >
                <span>{p.name.split(" ")[0]}</span>
                {state && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    background: col.border, color: "#000",
                    borderRadius: 4, padding: "1px 6px"
                  }}>
                    {state}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 8, textAlign: "center" }}>
          Tap to assign → Team A (green) then Team B (blue). Tap again to cycle/remove.
        </p>
      </div>

      {/* Team preview */}
      {canSubmit && (
        <div className="fade-in" style={{
          display: "grid", gridTemplateColumns: "1fr auto 1fr",
          gap: 8, alignItems: "center", marginBottom: 20
        }}>
          <TeamCard team="A" players={teamA} />
          <span style={{ color: "var(--text3)", fontSize: 13, fontWeight: 500 }}>VS</span>
          <TeamCard team="B" players={teamB} />
        </div>
      )}

      {/* Coat result */}
      {canSubmit && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: 13, letterSpacing: "0.1em",
            color: "var(--text2)", fontWeight: 600, marginBottom: 10 }}>
            COAT RESULT
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { val: "none",  label: "No coat",  sub: "Clean game" },
              { val: "A",     label: "Team A",   sub: "got coated" },
              { val: "B",     label: "Team B",   sub: "got coated" },
            ].map(opt => (
              <button
                key={opt.val}
                onClick={() => setCoatedTeam(opt.val)}
                style={{
                  padding: "12px 8px",
                  borderRadius: "var(--r)",
                  background: coatedTeam === opt.val
                    ? (opt.val === "none" ? "#1a2e1a" : opt.val === "A" ? TEAM_COLORS.A.bg : TEAM_COLORS.B.bg)
                    : "var(--surface2)",
                  border: `1.5px solid ${coatedTeam === opt.val
                    ? (opt.val === "none" ? "var(--success)" : opt.val === "A" ? TEAM_COLORS.A.border : TEAM_COLORS.B.border)
                    : "var(--border)"}`,
                  color: coatedTeam === opt.val
                    ? (opt.val === "none" ? "var(--success)" : opt.val === "A" ? TEAM_COLORS.A.text : TEAM_COLORS.B.text)
                    : "var(--text3)",
                  textAlign: "center",
                  transition: "all .15s"
                }}
              >
                <div style={{ fontFamily: "var(--font-head)", fontSize: 13, fontWeight: 700 }}>{opt.label}</div>
                <div style={{ fontSize: 10, marginTop: 2, opacity: 0.7 }}>{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: "var(--r)",
          background: canSubmit ? "var(--accent)" : "var(--surface2)",
          color: canSubmit ? "#0f0f0f" : "var(--text3)",
          fontFamily: "var(--font-head)",
          fontSize: 15, fontWeight: 800,
          letterSpacing: "0.05em",
          opacity: submitting ? 0.6 : 1,
          transition: "all .2s",
          marginBottom: 24
        }}
      >
        {submitting ? "SAVING…" : "LOG GAME"}
      </button>

      {/* Add player */}
      <div style={{
        borderTop: "1px solid var(--border)",
        paddingTop: 20
      }}>
        <h2 style={{ fontFamily: "var(--font-head)", fontSize: 13, letterSpacing: "0.1em",
          color: "var(--text3)", fontWeight: 600, marginBottom: 10 }}>
          ADD PLAYER
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddPlayer()}
            placeholder="Full name"
            style={{
              flex: 1, padding: "10px 14px",
              background: "var(--surface2)", border: "1px solid var(--border)",
              borderRadius: "var(--r)", color: "var(--text)",
            }}
          />
          <button
            onClick={handleAddPlayer}
            disabled={addingPlayer || !newName.trim()}
            style={{
              padding: "10px 18px",
              background: "var(--surface2)", border: "1px solid var(--border2)",
              borderRadius: "var(--r)", color: "var(--accent)",
              fontFamily: "var(--font-head)", fontSize: 13, fontWeight: 700
            }}
          >
            {addingPlayer ? "…" : "ADD"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TeamCard({ team, players }) {
  const col = TEAM_COLORS[team];
  return (
    <div style={{
      background: col.bg, border: `1px solid ${col.border}`,
      borderRadius: "var(--r)", padding: "10px 12px", textAlign: "center"
    }}>
      <div style={{ fontSize: 10, fontFamily: "var(--font-head)", fontWeight: 700,
        color: col.text, letterSpacing: "0.1em", marginBottom: 6 }}>
        TEAM {team}
      </div>
      {players.map(name => (
        <div key={name} style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, lineHeight: 1.6 }}>
          {name.split(" ")[0]}
        </div>
      ))}
    </div>
  );
}
