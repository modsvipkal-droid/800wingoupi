"use client";

import { useMemo, useState } from "react";
import { HistoricalResult, WingoMode } from "../types";
import { Icon } from "./Icons";

interface PatternRadarToolProps {
  history: HistoricalResult[];
  onNavigateToTool: (tool: string) => void;
}

export default function PatternRadarTool({
  history,
  onNavigateToTool,
}: PatternRadarToolProps) {
  const [filterMode, setFilterMode] = useState<"all" | WingoMode>("all");

  const records = useMemo(() => {
    if (filterMode === "all") return history;
    return history.filter((h) => h.mode === filterMode);
  }, [history, filterMode]);

  const numberStats = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let i = 0; i <= 9; i++) counts[i] = 0;
    records.forEach((r) => {
      counts[r.number] = (counts[r.number] || 0) + 1;
    });

    const sorted = Object.entries(counts).map(([num, count]) => ({
      number: Number(num),
      count,
      pct: records.length ? Math.round((count / records.length) * 100) : 0,
    }));

    sorted.sort((a, b) => b.count - a.count);
    const hot = sorted.slice(0, 3);
    const cold = [...sorted].reverse().slice(0, 3);
    return { sorted, hot, cold };
  }, [records]);

  const currentStreak = useMemo(() => {
    if (records.length === 0) return { category: "None", count: 0 };
    const firstCat = records[0].category;
    let count = 0;
    for (const r of records) {
      if (r.category === firstCat) count++;
      else break;
    }
    return { category: firstCat, count };
  }, [records]);

  const bigCount = records.filter((r) => r.category === "Big").length;
  const smallCount = records.length - bigCount;
  const bigPct = records.length ? Math.round((bigCount / records.length) * 100) : 50;

  const greenCount = records.filter((r) => r.color === "Green").length;
  const redCount = records.filter((r) => r.color === "Red").length;
  const violetCount = records.filter((r) => r.color === "Violet").length;

  return (
    <div className="tool-view-container animate-fade-in">
      <div className="tool-hero-strip">
        <div className="hero-left">
          <span className="live-pulse-badge badge-gold">
            <span className="pulse-dot dot-gold" />
            ADVANCED PATTERN & STREAK RADAR
          </span>
          <h1 className="hero-tool-title">Pattern & Trend Radar</h1>
          <p className="hero-tool-desc">
            Visual Bead Road matrix, Hot/Cold number frequency tracking, and live Dragon streak detector.
          </p>
        </div>

        <div className="hero-meta-badges">
          <div className="mode-toggle-pills">
            {(["all", "30s", "1m"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`mode-pill-btn ${filterMode === mode ? "active" : ""}`}
                onClick={() => setFilterMode(mode)}
              >
                {mode === "all" ? "All Modes" : mode === "30s" ? "30 Sec" : "1 Min"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Streak Alert Banner */}
      {currentStreak.count >= 3 && (
        <div className="dragon-alert-card animate-slide-up">
          <span className="dragon-icon">
            <Icon name="trending-up" size={26} />
          </span>
          <div className="dragon-content">
            <h4>
              Dragon Streak Detected: {currentStreak.count}x Consecutive {currentStreak.category.toUpperCase()}
            </h4>
            <p>
              Mathematical streaks above 3 consecutive rounds indicate strong directional momentum or impending mean reversion.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onNavigateToTool("calculator")}
          >
            Calculate Multipliers <Icon name="arrow-right" size={13} />
          </button>
        </div>
      )}

      {/* Grid: Bead Road + Hot/Cold */}
      <div className="radar-grid">
        <section className="radar-card bead-road-card">
          <div className="card-header-clean">
            <div>
              <h3>Casino Bead Road Matrix</h3>
              <p>Visual sequential representation of last 30 recorded rounds</p>
            </div>
            <span className="badge-pill">{records.length} Rounds Analyzed</span>
          </div>

          <div className="bead-road-grid">
            {records.slice(0, 30).map((r, i) => (
              <div key={r.periodId || i} className="bead-cell">
                <div className={`bead-ball ${r.color.toLowerCase()}`}>
                  <span className="bead-num">{r.number}</span>
                  <span className="bead-cat">{r.category[0]}</span>
                </div>
                <small className="bead-id mono">{r.periodId.slice(-3)}</small>
              </div>
            ))}
          </div>

          <div className="bead-legend">
            <span className="legend-item"><i className="dot-green" /> Green (1,3,7,9)</span>
            <span className="legend-item"><i className="dot-red" /> Red (2,4,6,8)</span>
            <span className="legend-item"><i className="dot-violet" /> Violet (0,5)</span>
            <span className="legend-item"><strong>B</strong> = Big (5-9)</span>
            <span className="legend-item"><strong>S</strong> = Small (0-4)</span>
          </div>
        </section>

        {/* Hot & Cold Numbers Card */}
        <section className="radar-card hot-cold-card">
          <div className="card-header-clean">
            <div>
              <h3>Hot & Cold Numbers</h3>
              <p>Highest and lowest frequency numbers in current set</p>
            </div>
          </div>

          <div className="hot-cold-sections">
            <div className="hot-box">
              <div className="box-title hot-title">
                <span>
                  <Icon name="flame" size={14} /> TOP HOT NUMBERS
                </span>
                <small>High probability frequency</small>
              </div>
              <div className="hot-numbers-list">
                {numberStats.hot.map((item) => (
                  <div key={item.number} className="hot-item">
                    <span className="hot-circle">{item.number}</span>
                    <div className="hot-meta">
                      <strong>{item.count} hits</strong>
                      <small>{item.pct}% frequency</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cold-box">
              <div className="box-title cold-title">
                <span>
                  <Icon name="snowflake" size={14} /> COLD NUMBERS
                </span>
                <small>Overdue / low appearances</small>
              </div>
              <div className="cold-numbers-list">
                {numberStats.cold.map((item) => (
                  <div key={item.number} className="cold-item">
                    <span className="cold-circle">{item.number}</span>
                    <div className="cold-meta">
                      <strong>{item.count} hits</strong>
                      <small>{item.pct}% frequency</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Ratio Balance Breakdown */}
      <div className="ratio-cards-row">
        <div className="ratio-card">
          <div className="ratio-head">
            <h4>Big vs Small Ratio</h4>
            <span>{bigCount} Big · {smallCount} Small</span>
          </div>
          <div className="ratio-track">
            <div className="ratio-fill-big" style={{ width: `${bigPct}%` }}>
              Big {bigPct}%
            </div>
            <div className="ratio-fill-small" style={{ width: `${100 - bigPct}%` }}>
              Small {100 - bigPct}%
            </div>
          </div>
          <small className="ratio-caption">
            Standard theoretical equilibrium is 50.0% Big vs 50.0% Small.
          </small>
        </div>

        <div className="ratio-card">
          <div className="ratio-head">
            <h4>Color Distribution</h4>
            <span>{records.length} Total</span>
          </div>
          <div className="color-strip">
            <div
              className="color-segment green"
              style={{ width: `${records.length ? (greenCount / records.length) * 100 : 40}%` }}
              title={`Green: ${greenCount}`}
            >
              Green
            </div>
            <div
              className="color-segment red"
              style={{ width: `${records.length ? (redCount / records.length) * 100 : 40}%` }}
              title={`Red: ${redCount}`}
            >
              Red
            </div>
            <div
              className="color-segment violet"
              style={{ width: `${records.length ? (violetCount / records.length) * 100 : 20}%` }}
              title={`Violet: ${violetCount}`}
            >
              Violet
            </div>
          </div>
          <div className="color-counts-row">
            <span>Green: <strong>{greenCount}</strong></span>
            <span>Red: <strong>{redCount}</strong></span>
            <span>Violet: <strong>{violetCount}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
