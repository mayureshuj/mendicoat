// src/components/PairStats.js
import React, { useState } from "react";

export default function PairStats({ stats }) {
  const [sort, setSort] = useState("coatRate");

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

  const best  = [...stats.pairs].sort((a, b) => a.coatRate - b.coatRate)[0];
  const worst = [...stats.pairs].sort((a, b) => b.coatRate - a.coatRate)[0];
  const most  = [...stats.pairs].sort((a, b) => b.gamesTogther - a.gamesTogther)[0];

  return (
    <div style={{ padding: "20px 16px" }} className="fade-up">

      {/* Highlight cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
        <HighlightCard
          label="Best duo" emoji="🏅"
          name={`${best.p1.split(" ")[0]} + ${best.p2.split(" ")[0]}`}
          value={`${best.coatRate}% coats`}
          color="var(--success)"
        />
        <HighlightCard
          label="Danger duo" emoji="💀"
          name={`${worst.p1.split(" ")[0]} + ${worst.p2.split(" ")[0]}`}
          value={`${worst.coatRate}% coats`}
          color="var(--danger)"
        />
        <HighlightCard
          label="Most played" emoji="🃏"
          name={`${most.p1.split(" ")[0]} + ${most.p2.split(" ")[0]}`}
          value={`${most.gamesTogther} games`}
          color="var(--info)"
        />
        <HighlightCard
          label="Total pairs" emoji="🤝"
          name={`${stats.pairs.length} duos tracked`}
          value={`min 2 games each`}
          color="var(--text2)"
        />
      </div>

      {/* Sort toggle */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: "0.08em",
          fontFamily: "var(--font-head)", marginBottom: 6 }}>
          SORT BY
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { val: "coatRate", label: "Coat %",  icon: "↑" },
            { val: "winRate",  label: "Win %",   icon: "↓" },
            { val: "games",    label: "Games",   icon: "↓" },
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
        {sorted.map((pr, i) => {
          const coatColor = pr.coatRate < 20 ? "var(--success)" : pr.coatRate < 40 ? "var(--accent)" : "var(--danger)";
          return (
            <div key={`${pr.p1}||${pr.p2}`} style={{
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

              {/* Mini stats row */}
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                <StatPill label="Coats" value={pr.coatsTogether} color="var(--danger)" />
                <StatPill label="Wins" value={pr.wins} color="var(--success)" />
                <StatPill label="Win rate" value={`${pr.winRate.toFixed(0)}%`} color="var(--info)" />
              </div>

              {/* Bar */}
              <div style={{ height: 2, background: "var(--surface2)", borderRadius: 2, marginTop: 10, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(pr.coatRate, 100)}%`, background: coatColor }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HighlightCard({ label, emoji, name, value, color }) {
  return (
    <div style={{
      background: "var(--surface2)", borderRadius: "var(--r)",
      padding: "12px 12px"
    }}>
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
