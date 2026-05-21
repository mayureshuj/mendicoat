// src/components/Leaderboard.js
import React from "react";

export default function Leaderboard({ stats, onSelectPlayer }) {
  if (!stats || !stats.players?.length) {
    return <Empty msg="No games logged yet" />;
  }

  const { players, totalGames, totalCoats } = stats;

  return (
    <div style={{ padding: "20px 16px" }} className="fade-up">

      {/* Summary metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 24 }}>
        {[
          { label: "Total games", value: totalGames },
          { label: "Total coats", value: totalCoats },
          { label: "Players", value: players.length },
        ].map(m => (
          <div key={m.label} style={{
            background: "var(--surface2)", borderRadius: "var(--r)",
            padding: "12px 10px", textAlign: "center"
          }}>
            <div style={{ fontSize: 22, fontFamily: "var(--font-head)", fontWeight: 800, color: "var(--accent)" }}>
              {m.value}
            </div>
            <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2, letterSpacing: "0.05em" }}>
              {m.label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <h2 style={{ fontFamily: "var(--font-head)", fontSize: 13, letterSpacing: "0.1em",
        color: "var(--text2)", fontWeight: 600, marginBottom: 10 }}>
        COAT LEADERBOARD
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {players.map((p, i) => {
          const rate = p.coatRate;
          const isTop = i === 0 && p.gamesPlayed > 0;
          const isLast = i === players.length - 1 && p.gamesPlayed > 0 && p.coatsReceived > 0;
          const barColor = rate < 20 ? "var(--success)" : rate < 40 ? "var(--accent)" : "var(--danger)";

          return (
            <button
              key={p.name}
              onClick={() => onSelectPlayer(p.name)}
              style={{
                background: "var(--surface)",
                border: `1px solid ${isTop ? "var(--success)" : isLast ? "var(--danger)" : "var(--border)"}`,
                borderRadius: "var(--r-lg)",
                padding: "14px 16px",
                textAlign: "left", width: "100%",
                transition: "border-color .2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                {/* Rank */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: isTop ? "var(--success)" : isLast ? "var(--danger)" : "var(--surface2)",
                  color: isTop || isLast ? "#fff" : "var(--text3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-head)", fontSize: 12, fontWeight: 800, flexShrink: 0
                }}>
                  {i + 1}
                </div>

                {/* Name + form */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "var(--font-head)", fontSize: 15, fontWeight: 700,
                    color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>
                    {p.gamesPlayed} games · {p.coatsReceived} coats
                    {p.formTrend === "improving" && <span style={{ color: "var(--success)", marginLeft: 6 }}>↑ improving</span>}
                    {p.formTrend === "worsening" && <span style={{ color: "var(--danger)", marginLeft: 6 }}>↓ worsening</span>}
                  </div>
                </div>

                {/* Rate */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{
                    fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 800,
                    color: barColor
                  }}>
                    {rate.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text3)" }}>coat rate</div>
                </div>
              </div>

              {/* Progress bar */}
              {p.gamesPlayed > 0 && (
                <div style={{ height: 3, background: "var(--surface2)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${Math.min(rate, 100)}%`,
                    background: barColor, borderRadius: 2,
                    transition: "width .4s ease"
                  }} />
                </div>
              )}

              {/* Streak badge */}
              {p.currentStreak !== 0 && (
                <div style={{
                  marginTop: 8, fontSize: 10,
                  color: p.currentStreak > 0 ? "var(--success)" : "var(--danger)",
                }}>
                  {p.currentStreak > 0
                    ? `🔥 ${p.currentStreak} game clean streak`
                    : `💀 ${Math.abs(p.currentStreak)} coat streak`}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p style={{ textAlign: "center", fontSize: 11, color: "var(--text3)", marginTop: 16 }}>
        Tap a player to see full stats
      </p>
    </div>
  );
}

function Empty({ msg }) {
  return (
    <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text3)" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🃏</div>
      <p>{msg}</p>
    </div>
  );
}
