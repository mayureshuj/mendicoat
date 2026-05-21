// src/components/PairStats.js
import React, { useState } from "react";

export default function PairStats({ stats }) {
  const [sort, setSort]       = useState("coatRate");
  const [expanded, setExpanded] = useState(null);

  if (!stats?.pairs?.length) {
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center", color: "var(--text3)" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🤝</div>
        <p>Need at least 2 games per pair to show stats</p>
      </div>
    );
  }

  const sorted = [...stats.pairs].sort((a, b) => {
    if (sort === "coatRate") return a.coatRate - b.coatRate;
    if (sort === "winRate")  return b.winRate - a.winRate;
    return b.gamesTogther - a.gamesTogther;
  });

  const best      = [...stats.pairs].sort((a, b) => a.coatRate - b.coatRate)[0];
  const worst     = [...stats.pairs].sort((a, b) => b.coatRate - a.coatRate)[0];
  const most      = [...stats.pairs].sort((a, b) => b.gamesTogther - a.gamesTogther)[0];
  const bestWin   = [...stats.pairs].sort((a, b) => b.winRate - a.winRate)[0];

  return (
    <div style={{ padding: "20px 16px" }} className="fade-up">

      {/* Highlight cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
        <HighlightCard label="Best duo"    emoji="🏅" name={`${best.p1.split(" ")[0]} + ${best.p2.split(" ")[0]}`}     value={`${best.coatRate}% coats`}       color="var(--success)" />
        <HighlightCard label="Danger duo"  emoji="💀" name={`${worst.p1.split(" ")[0]} + ${worst.p2.split(" ")[0]}`}   value={`${worst.coatRate}% coats`}      color="var(--danger)" />
        <HighlightCard label="Most wins"   emoji="⚡" name={`${bestWin.p1.split(" ")[0]} + ${bestWin.p2.split(" ")[0]}`} value={`${bestWin.winRate}% win rate`} color="var(--info)" />
        <HighlightCard label="Most played" emoji="🃏" name={`${most.p1.split(" ")[0]} + ${most.p2.split(" ")[0]}`}     value={`${most.gamesTogther} games`}    color="var(--text2)" />
      </div>

      {/* Sort toggle */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: "0.08em",
          fontFamily: "var(--font-head)", marginBottom: 6 }}>
          SORT BY
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { val: "coatRate", label: "Coat %", icon: "↑" },
            { val: "winRate",  label: "Win %",  icon: "↓" },
            { val: "games",    label: "Games",  icon: "↓" },
          ].map(s => {
            const active = sort === s.val;
            return (
              <button
                key={s.val}
                type="button"
                onClick={() => setSort(s.val)}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "6px 12px", borderRadius: 20,
                  background: active ? "var(--accent)" : "var(--surface2)",
                  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  color: active ? "#0f0f0f" : "var(--text2)",
                  fontFamily: "var(--font-head)", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.05em",
                  transition: "background .15s, color .15s, border-color .15s"
                }}
              >
                {s.label}
                <span style={{ fontSize: 10, opacity: active ? 1 : 0.4 }}>{s.icon}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pair list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map(pr => {
          const pk = `${pr.p1}||${pr.p2}`;
          const coatColor = pr.coatRate < 20 ? "var(--success)" : pr.coatRate < 40 ? "var(--accent)" : "var(--danger)";
          const isExpanded = expanded === pk;
          const h2hEntries = Object.entries(pr.headToHead || {});

          return (
            <div key={pk} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-lg)",
              padding: "14px 16px"
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-head)", fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>
                    {pr.p1.split(" ")[0]} + {pr.p2.split(" ")[0]}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>
                    {pr.gamesTogther} games together
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 800, color: coatColor }}>
                    {pr.coatRate.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text3)" }}>coat rate</div>
                </div>
              </div>

              {/* Stats pills */}
              <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                <StatPill label="Coats"      value={pr.coatsTogether}           color="var(--danger)" />
                <StatPill label="Wins"       value={pr.wins}                    color="var(--success)" />
                <StatPill label="Win rate"   value={`${pr.winRate.toFixed(0)}%`} color="var(--info)" />
                {(pr.currentWinStreak ?? 0) > 0 && (
                  <StatPill label="Win streak" value={`${pr.currentWinStreak}🔥`} color="var(--info)" />
                )}
              </div>

              {/* Recent form dots */}
              {pr.recentForm?.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 10 }}>
                  <span style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.05em", marginRight: 2 }}>LAST 5:</span>
                  {pr.recentForm.map((coated, i) => (
                    <div key={i} style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: coated ? "var(--danger)" : "var(--success)"
                    }} />
                  ))}
                </div>
              )}

              {/* Coat rate bar */}
              <div style={{ height: 2, background: "var(--surface2)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(pr.coatRate, 100)}%`, background: coatColor }} />
              </div>

              {/* Head-to-head toggle */}
              {h2hEntries.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : pk)}
                    style={{
                      marginTop: 10, fontSize: 10, color: "var(--text3)",
                      background: "none", fontFamily: "var(--font-head)",
                      letterSpacing: "0.06em", fontWeight: 600, padding: 0
                    }}
                  >
                    {isExpanded ? "▲ HIDE H2H" : "▼ HEAD TO HEAD"}
                  </button>

                  {isExpanded && (
                    <div style={{ marginTop: 8, borderTop: "1px solid var(--border)", paddingTop: 10,
                      display: "flex", flexDirection: "column", gap: 6 }}>
                      {h2hEntries.map(([oppKey, h2h]) => {
                        const [oA, oB] = oppKey.split("||");
                        return (
                          <div key={oppKey} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            fontSize: 12, color: "var(--text2)"
                          }}>
                            <span>vs {oA.split(" ")[0]} + {oB.split(" ")[0]}</span>
                            <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 12 }}>
                              <span style={{ color: "var(--success)" }}>{h2h.wins}W</span>
                              <span style={{ color: "var(--text3)" }}> · </span>
                              <span style={{ color: "var(--danger)" }}>{h2h.losses}L</span>
                              <span style={{ color: "var(--text3)" }}> · {h2h.games}G</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HighlightCard({ label, emoji, name, value, color }) {
  return (
    <div style={{ background: "var(--surface2)", borderRadius: "var(--r)", padding: "12px 12px" }}>
      <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: "0.05em", marginBottom: 4 }}>
        {emoji} {label.toUpperCase()}
      </div>
      <div style={{ fontFamily: "var(--font-head)", fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
        {name}
      </div>
      <div style={{ fontSize: 11, color }}>
        {value}
      </div>
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-head)", color }}>
        {value}
      </div>
      <div style={{ fontSize: 9, color: "var(--text3)", letterSpacing: "0.05em" }}>
        {label.toUpperCase()}
      </div>
    </div>
  );
}
