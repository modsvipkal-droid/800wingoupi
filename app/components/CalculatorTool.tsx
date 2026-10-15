"use client";

import { useMemo, useState } from "react";
import { MartingaleStage } from "../types";
import { Icon } from "./Icons";

export default function CalculatorTool() {
  const [bankroll, setBankroll] = useState(2000);
  const [baseBet, setBaseBet] = useState(10);
  const [multiplier, setMultiplier] = useState(2);
  const [maxStages, setMaxStages] = useState(7);
  const [payoutRate, setPayoutRate] = useState(1.96);

  const applyPreset = (cap: number, base: number, mult: number, stg: number) => {
    setBankroll(cap);
    setBaseBet(base);
    setMultiplier(mult);
    setMaxStages(stg);
  };

  const stages: MartingaleStage[] = useMemo(() => {
    const list: MartingaleStage[] = [];
    let cumulative = 0;

    for (let i = 1; i <= maxStages; i++) {
      let bet = 0;
      if (i === 1) {
        bet = baseBet;
      } else {
        bet = Math.ceil(list[i - 2].bet * multiplier);
      }

      cumulative += bet;
      const payout = Math.floor(bet * payoutRate);
      const profit = payout - cumulative;

      let riskRating: MartingaleStage["riskRating"] = "Safe";
      if (i >= 6) riskRating = "Critical";
      else if (i >= 5) riskRating = "Aggressive";
      else if (i >= 4) riskRating = "Moderate";

      list.push({
        stage: i,
        bet,
        cumulative,
        payout,
        profit,
        riskRating,
      });
    }

    return list;
  }, [baseBet, multiplier, maxStages, payoutRate]);

  const totalRequired = stages[stages.length - 1]?.cumulative || 0;
  const isAffordable = bankroll >= totalRequired;
  const coverageRounds = stages.filter((s) => s.cumulative <= bankroll).length;

  return (
    <div className="tool-view-container animate-fade-in">
      <div className="tool-hero-strip">
        <div className="hero-left">
          <span className="live-pulse-badge badge-purple">
            <span className="pulse-dot dot-purple" />
            BANKROLL RISK & RECOVERY CALCULATOR
          </span>
          <h1 className="hero-tool-title">Martingale Risk Calculator</h1>
          <p className="hero-tool-desc">
            Calculate exact bet sizes, cumulative drawdowns, and net profit per recovery stage to prevent complete balance liquidation.
          </p>
        </div>

        {/* Presets */}
        <div className="preset-buttons-wrap">
          <button
            type="button"
            className="preset-btn"
            onClick={() => applyPreset(1000, 10, 2, 6)}
          >
            Starter 1K
          </button>
          <button
            type="button"
            className="preset-btn"
            onClick={() => applyPreset(3000, 10, 2, 7)}
          >
            Safe 3K
          </button>
          <button
            type="button"
            className="preset-btn"
            onClick={() => applyPreset(10000, 20, 2.2, 8)}
          >
            Pro 10K
          </button>
        </div>
      </div>

      {/* Inputs + Summary Row */}
      <div className="calc-top-grid">
        <section className="calc-controls-card">
          <div className="card-header-clean">
            <h3>Configuration Parameters</h3>
            <span className="badge-pill">Editable</span>
          </div>

          <div className="inputs-grid">
            <div className="input-group">
              <label>Total Available Capital</label>
              <input
                type="number"
                min="50"
                step="50"
                value={bankroll}
                onChange={(e) => setBankroll(Math.max(10, Number(e.target.value)))}
                className="calc-input mono"
              />
            </div>

            <div className="input-group">
              <label>Base Bet (Level 1 Amount)</label>
              <input
                type="number"
                min="1"
                value={baseBet}
                onChange={(e) => setBaseBet(Math.max(1, Number(e.target.value)))}
                className="calc-input mono"
              />
            </div>

            <div className="input-group">
              <label>Multiplier Factor (x)</label>
              <select
                value={multiplier}
                onChange={(e) => setMultiplier(Number(e.target.value))}
                className="calc-select mono"
              >
                <option value={2}>2.0x (Classic Martingale)</option>
                <option value={2.2}>2.2x (Recommended 1.96x hedge)</option>
                <option value={2.5}>2.5x (Aggressive Recovery)</option>
                <option value={3}>3.0x (Triple Multiplier)</option>
              </select>
            </div>

            <div className="input-group">
              <label>Maximum Recovery Stages</label>
              <select
                value={maxStages}
                onChange={(e) => setMaxStages(Number(e.target.value))}
                className="calc-select mono"
              >
                <option value={4}>4 Stages (Low Risk)</option>
                <option value={5}>5 Stages (Moderate)</option>
                <option value={6}>6 Stages (Standard)</option>
                <option value={7}>7 Stages (Recommended)</option>
                <option value={8}>8 Stages (Maximum Defense)</option>
              </select>
            </div>

            <div className="input-group">
              <label>Payout Multiplier (Standard: 1.96x)</label>
              <input
                type="number"
                step="0.01"
                min="1.5"
                max="2.5"
                value={payoutRate}
                onChange={(e) => setPayoutRate(Number(e.target.value))}
                className="calc-input mono"
              />
            </div>
          </div>
        </section>

        {/* Safety Assessment Summary Card */}
        <section className="calc-summary-card">
          <div className="card-header-clean">
            <h3>Portfolio Safety Verdict</h3>
            <span className={`status-pill ${isAffordable ? "safe" : "danger"}`}>
              {isAffordable ? (
                <>
                  <Icon name="check" size={11} /> FULLY COVERED
                </>
              ) : (
                <>
                  <Icon name="alert-triangle" size={11} /> CAPITAL DEFICIT
                </>
              )}
            </span>
          </div>

          <div className="summary-stat-rows">
            <div className="stat-summary-box">
              <span>Total Capital Needed:</span>
              <strong className="mono">{totalRequired.toLocaleString()}</strong>
            </div>

            <div className="stat-summary-box">
              <span>Your Supported Stages:</span>
              <strong className="mono">
                {coverageRounds} of {maxStages} Stages
              </strong>
            </div>

            <div className="stat-summary-box">
              <span>Recommended Base Bet:</span>
              <strong className="mono">
                {Math.max(1, Math.floor(bankroll / (Math.pow(2, maxStages) - 1)))}
              </strong>
            </div>
          </div>

          <div className={`verdict-callout ${isAffordable ? "verdict-good" : "verdict-warn"}`}>
            <strong>
              {isAffordable
                ? "Safe Bankroll Configuration"
                : "Notice: Insufficient Capital"}
            </strong>
            <p>
              {isAffordable
                ? `Your bankroll of ${bankroll.toLocaleString()} can survive up to ${maxStages} consecutive losses before total liquidation.`
                : `You are short by ${(totalRequired - bankroll).toLocaleString()}. Reduce base bet to ${Math.max(1, Math.floor(bankroll / (Math.pow(2, maxStages) - 1)))} or decrease stages.`}
            </p>
          </div>
        </section>
      </div>

      {/* Dynamic Multiplier Table */}
      <section className="calc-table-card">
        <div className="card-header-clean">
          <div>
            <h3>Stage-by-Stage Martingale Table</h3>
            <p>Step-by-step breakdown of investment and net return on win</p>
          </div>
          <span className="badge-pill">{stages.length} Stages</span>
        </div>

        <div className="table-responsive">
          <table className="tools-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Bet Amount</th>
                <th>Cumulative Invested</th>
                <th>Gross Payout</th>
                <th>Net Profit</th>
                <th>Capital Remaining</th>
                <th>Risk Tier</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((stg) => {
                const rem = bankroll - stg.cumulative;
                const canAfford = rem >= 0;
                return (
                  <tr key={stg.stage} className={!canAfford ? "row-unaffordable" : ""}>
                    <td>
                      <span className="stage-num-badge">Stage {stg.stage}</span>
                    </td>
                    <td className="mono font-bold">{stg.bet.toLocaleString()}</td>
                    <td className="mono text-muted">{stg.cumulative.toLocaleString()}</td>
                    <td className="mono">{stg.payout.toLocaleString()}</td>
                    <td className="mono text-success">
                      {stg.profit >= 0 ? `+${stg.profit.toLocaleString()}` : `-${Math.abs(stg.profit)}`}
                    </td>
                    <td className={`mono ${rem < 0 ? "text-danger" : "text-muted"}`}>
                      {rem >= 0 ? rem.toLocaleString() : "EXCEEDED (-)"}
                    </td>
                    <td>
                      <span className={`risk-rating-tag ${stg.riskRating.toLowerCase()}`}>
                        {stg.riskRating}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
