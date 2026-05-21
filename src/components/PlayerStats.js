// src/components/PlayerStats.js
import React from "react";

export default function PlayerStats({ stats, players, selectedPlayer, setSelectedPlayer }) {
  const playerNames = players.map(p => p.name);
  const current = selectedPlayer || playerNames[0];
  const pData = stats?.players?.find(p => p.name === current);

  if (!stats?.players?.length) {
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text3)" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
        <p>No data yet</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 16px" }} className="fade-up">

      {/* Player selector */}
      <div style={{ marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        <div style={{ display: "flex", gap: 6, width: "max-content" }}>
          {playerNames.map(name => (
            <button
              key={name}
              onClick={() => setSelectedPlayer(name)}
              style={{
                padding: "6px 14px", borderRadius: 20, whiteSpace: "nowrap",
                background: current === name ? "var(--accent)" : "var(--surface2)",
                border: `1px solid ${current === name ? "var(--accent)" : "var(--border)"}`,
                color: current === name ? "#0f0f0f" : "var(--text3)",
                fontFamily: "var(--font-head)", fontSize: 11, fontWeight: 700
              }}
            >
              {name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {pData ? <PlayerCard p={pData} allStats={stats} /> : (
        <div style={{ color: "var(--text3)", textAlign: "center", padding: "2rem" }}>
          No games for {current} yet
        </div>
      )}
    </div>
  );
}

function PlayerCard({ p, allStats }) {
  const coatColor = p.coatRate < 20 ? "var(--success)" : p.coatRate < 40 ? "var(--accent)" : "var(--danger)";
  const rank = allStats.players.findIndex(x => x.name === p.name) + 1;

  // Partner stats — find pairs involving this player
  const myPairs = allStats.pairs
    .filter(pr => pr.p1 === p.name || pr.p2 === p.name)
    .map(pr => ({
      partner: pr.p1 === p.name ? pr.p2 : pr.p1,
      games: pr.gamesTogther,
      coats: pr.coatsTogether,
      rate: pr.coatRate,
      wins: pr.wins,
      winRate: pr.winRate
    }))
    .sort((a, b) => a.rate - b.rate);

  const luckyPartner  = myPairs[0];
  const nemesisPartner = myPairs[myPairs.length - 1];

  return (
    <div>
      {/* Name + rank hero */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)", padding: "20px 18px", marginBottom: 14
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800, color: "var(--text)" }}>
              {p.name.split(" ")[0]}
            </h2>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>{p.name}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 32, fontWeight: 800, color: coatColor, lineHeight: 1 }}>
              {p.coatRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: 10, color: "var(--text3)" }}>coat rate · #{rank} rank</div>
          </div>
        </div>

        {/* Trend */}
        {p.formTrend !== "stable" && (
          <div style={{
            marginTop: 12, fontSize: 12, padding: "6px 10px",
            borderRadius: "var(--r)", display: "inline-block",
            background: p.formTrend === "improving" ? "#1a2e1a" : "#2a1a1a",
            color: p.formTrend === "improving" ? "var(--success)" : "var(--danger)"
          }}>
            {p.formTrend === "improving" ? "↑ Form improving (last 5 games)" : "↓ Form worsening (last 5 games)"}
          </div>
        )}

        {/* Recent form dots */}
        {p.recentForm.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 6, letterSpacing: "0.05em" }}>
              LAST {p.recentForm.length} GAMES
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {p.recentForm.map((coated, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: coated ? "var(--danger)" : "var(--success)"
                }} />
              ))}
            </div>
            <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4 }}>
              🔴 coat &nbsp; 🟢 clean
            </div>
          </div>
        )}
      </div>

      {/* Core stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Games",  value: p.gamesPlayed,    color: "var(--text)" },
          { label: "Coats",  value: p.coatsReceived,  color: "var(--danger)" },
          { label: "Rank",   value: `#${rank}`,        color: coatColor },
        ].map(m => (
          <div key={m.label} style={{
            background: "var(--surface2)", borderRadius: "var(--r)",
            padding: "12px 10px", textAlign: "center"
          }}>
            <div style={{ fontSize: 22, fontFamily: "var(--font-head)", fontWeight: 800, color: m.color }}>
              {m.value}
            </div>
            <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{m.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Streaks */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        <StatCard label="Best clean streak" value={`${p.bestCleanStreak} games`} color="var(--success)" icon="🔥" />
        <StatCard label="Worst coat streak" value={`${p.worstCoatStreak} games`} color="var(--danger)" icon="💀" />
        <StatCard
          label="Current streak"
          value={p.currentStreak === 0 ? "—" : p.currentStreak > 0 ? `${p.currentStreak} clean` : `${Math.abs(p.currentStreak)} coats`}
          color={p.currentStreak >= 0 ? "var(--success)" : "var(--danger)"}
          icon="📍"
        />
        <StatCard
          label="Last coated"
          value={p.lastCoatDate || "Never!"}
          color="var(--text2)"
          icon="📅"
        />
      </div>

      {/* Partner stats */}
      {myPairs.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ fontFamily: "var(--font-head)", fontSize: 13, letterSpacing: "0.1em",
            color: "var(--text2)", fontWeight: 600, marginBottom: 10 }}>
            PARTNER BREAKDOWN
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {myPairs.map(pr => {
              const c = pr.rate < 20 ? "var(--success)" : pr.rate < 40 ? "var(--accent)" : "var(--danger)";
              return (
                <div key={pr.partner} style={{
                  background: "var(--surface2)", borderRadius: "var(--r)",
                  padding: "10px 14px",
                  display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-head)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                      {pr.partner.split(" ")[0]}
                      {pr.partner === luckyPartner?.partner && myPairs.length > 1 &&
                        <span style={{ fontSize: 10, color: "var(--success)", marginLeft: 6 }}>🍀 lucky</span>}
                      {pr.partner === nemesisPartner?.partner && myPairs.length > 1 &&
                        <span style={{ fontSize: 10, color: "var(--danger)", marginLeft: 6 }}>👿 nemesis</span>}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
                      {pr.games} games · {pr.coats} coats · {pr.wins} wins
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--font-head)", fontSize: 16, fontWeight: 800, color: c }}>
                    {pr.rate.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly stats */}
      {p.monthlyStats?.length > 0 && (
        <div>
          <h3 style={{ fontFamily: "var(--font-head)", fontSize: 13, letterSpacing: "0.1em",
            color: "var(--text2)", fontWeight: 600, marginBottom: 10 }}>
            MONTHLY TREND
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {p.monthlyStats.slice(-6).reverse().map(m => {
              const c = m.rate < 20 ? "var(--success)" : m.rate < 40 ? "var(--accent)" : "var(--danger)";
              return (
                <div key={m.month} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "var(--surface2)", borderRadius: "var(--r)",
                  padding: "8px 12px"
                }}>
                  <div style={{ width: 50, fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-head)", flexShrink: 0 }}>
                    {m.month}
                  </div>
                  <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(m.rate, 100)}%`, background: c }} />
                  </div>
                  <div style={{ width: 38, textAlign: "right", fontFamily: "var(--font-head)", fontSize: 12, fontWeight: 700, color: c }}>
                    {m.rate.toFixed(0)}%
                  </div>
                  <div style={{ width: 40, fontSize: 10, color: "var(--text3)" }}>
                    {m.games}g
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      background: "var(--surface2)", borderRadius: "var(--r)",
      padding: "12px 12px"
    }}>
      <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: "0.05em", marginBottom: 4 }}>
        {icon} {label.toUpperCase()}
      </div>
      <div style={{ fontFamily: "var(--font-head)", fontSize: 14, fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  );
}
