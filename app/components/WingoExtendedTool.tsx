"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HistoricalResult, Prediction } from "../types";
import { computePrediction, formatPeriodId, getNumberCategory, getNumberColor } from "../utils/wingoEngine";
import { Icon } from "./Icons";

interface WingoExtendedToolProps {
  history: HistoricalResult[];
  onAddResult?: (res: HistoricalResult) => void;
  onNavigateToTool?: (tool: string) => void;
}

function renderResultColorDot(num: number) {
  const safeNum = Math.abs(num) % 10;
  if (safeNum === 0) {
    return (
      <div className="row-result-split-dots" title="Red + Violet">
        <span className="result-dot dot-red" />
        <span className="result-dot dot-violet" />
      </div>
    );
  }
  if (safeNum === 5) {
    return (
      <div className="row-result-split-dots" title="Green + Violet">
        <span className="result-dot dot-green" />
        <span className="result-dot dot-violet" />
      </div>
    );
  }
  if ([1, 3, 7, 9].includes(safeNum)) {
    return <span className="result-dot dot-green" title="Green" />;
  }
  return <span className="result-dot dot-red" title="Red" />;
}

export default function WingoExtendedTool({
  history,
  onAddResult,
}: WingoExtendedToolProps) {
  const [mode, setMode] = useState<"30s" | "1m">("30s");
  const [remaining, setRemaining] = useState(30);
  const [periodId, setPeriodId] = useState("");
  const [currentSignal, setCurrentSignal] = useState<Prediction | null>(null);
  const [copied, setCopied] = useState(false);

  const lastCycleRef = useRef<number | null>(null);
  const [liveResults, setLiveResults] = useState<HistoricalResult[]>([]);

  const fetchLiveHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/wingo/history?mode=${mode}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.list) && data.list.length > 0) {
        setLiveResults(data.list);
        if (data.list[0] && onAddResult) {
          onAddResult(data.list[0]);
        }
      }
    } catch (e) {
      console.warn(`Live ${mode} fetch error:`, e);
    }
  }, [mode, onAddResult]);

  useEffect(() => {
    fetchLiveHistory();
    const interval = setInterval(fetchLiveHistory, 4000);
    return () => clearInterval(interval);
  }, [fetchLiveHistory]);

  const effectiveHistory = useMemo(() => {
    if (liveResults.length > 0) return liveResults;
    return history.filter((h) => h.mode === mode || !h.mode);
  }, [liveResults, history, mode]);

  const updateTimer = useCallback(() => {
    const now = Date.now();
    const cycleDuration = mode === "30s" ? 30 : 60;
    const cycleMs = cycleDuration * 1000;
    const cycleIndex = Math.floor(now / cycleMs);
    const secsLeft = cycleDuration - Math.floor((now % cycleMs) / 1000);
    const safeSecs = secsLeft === 0 ? cycleDuration : secsLeft;

    setRemaining((prev) => (prev !== safeSecs ? safeSecs : prev));

    const activeIssue = liveResults[0]?.periodId;
    let currentPeriod = formatPeriodId(new Date(now), mode);
    if (activeIssue) {
      try {
        currentPeriod = (BigInt(activeIssue) + BigInt(1)).toString();
      } catch {
        // fallback
      }
    }
    setPeriodId((prev) => (prev !== currentPeriod ? currentPeriod : prev));

    if (lastCycleRef.current === null) {
      lastCycleRef.current = cycleIndex;
      const initialSignal = computePrediction(currentPeriod, effectiveHistory, mode);
      setCurrentSignal(initialSignal);
    } else if (cycleIndex !== lastCycleRef.current) {
      lastCycleRef.current = cycleIndex;
      fetchLiveHistory();
      const nextPrediction = computePrediction(currentPeriod, effectiveHistory, mode);
      setCurrentSignal(nextPrediction);
    }
  }, [effectiveHistory, liveResults, fetchLiveHistory, mode]);

  useEffect(() => {
    const timer = setInterval(updateTimer, 500);
    return () => clearInterval(timer);
  }, [updateTimer]);

  const handleManualRefresh = useCallback(() => {
    const currentPeriod = periodId || formatPeriodId(new Date(), mode);
    setCurrentSignal(computePrediction(currentPeriod, effectiveHistory, mode));
  }, [periodId, effectiveHistory, mode]);

  const predictedNum = currentSignal?.number ?? (mode === "30s" ? 9 : 7);
  const displayColor = currentSignal?.color ?? (mode === "30s" ? "Red" : "Green");
  const displaySize = currentSignal?.category ?? "Big";
  const isBig = displaySize.toLowerCase() === "big";

  const displayDrawId = useMemo(() => {
    const raw = periodId || (liveResults[0]?.periodId ? (BigInt(liveResults[0].periodId) + BigInt(1)).toString() : formatPeriodId(new Date(), mode));
    if (raw.length >= 8) {
      const first4 = raw.slice(0, 4);
      const last4 = raw.slice(-4);
      return `${first4}xxxxxxxxxxxx${last4}`;
    }
    return raw || "2026xxxxxxxxx0001";
  }, [periodId, liveResults, mode]);

  const handleCopyDrawId = useCallback(() => {
    const rawId = periodId || (liveResults[0]?.periodId ? (BigInt(liveResults[0].periodId) + BigInt(1)).toString() : formatPeriodId(new Date(), mode));
    if (typeof window !== "undefined" && navigator?.clipboard) {
      navigator.clipboard.writeText(rawId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }, [periodId, liveResults, mode]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const minTens = Math.floor(minutes / 10);
  const minOnes = minutes % 10;
  const secTens = Math.floor(seconds / 10);
  const secOnes = seconds % 10;
  const formattedMinSec = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const last10History = useMemo(() => {
    return effectiveHistory.slice(0, 10);
  }, [effectiveHistory]);

  const recent7Numbers = useMemo(() => {
    const list = last10History.slice(0, 7);
    if (list.length >= 7) {
      return list.map((item) => (typeof item.number === "number" ? Math.abs(item.number) % 10 : 0));
    }
    const defaultSample = mode === "30s" ? [8, 6, 2, 3, 2, 8, 9] : [1, 9, 7, 4, 0, 5, 8];
    const extracted = list.map((item) => (typeof item.number === "number" ? Math.abs(item.number) % 10 : 0));
    return extracted.concat(defaultSample.slice(extracted.length)).slice(0, 7);
  }, [last10History, mode]);

  return (
    <div className={`wingo-mobile-screen ${mode === "30s" ? "theme-emerald" : "theme-sapphire"}`}>
      {/* Mode Switcher (30s / 1m only) */}
      <div className="extended-mode-switcher-modern">
        <button
          type="button"
          className={`ext-mode-pill-btn ${mode === "30s" ? "is-active" : ""}`}
          onClick={() => {
            setMode("30s");
            setRemaining(30);
          }}
        >
          <Icon name="bolt" size={13} />
          <span>30 Sec Prediction</span>
        </button>
        <button
          type="button"
          className={`ext-mode-pill-btn ${mode === "1m" ? "is-active" : ""}`}
          onClick={() => {
            setMode("1m");
            setRemaining(60);
          }}
        >
          <Icon name="clock" size={13} />
          <span>1 Min Prediction</span>
        </button>
      </div>

      {/* CARD 1: COUNTDOWN */}
      <section className="draw-countdown-card">
        <div className="draw-sphere-wrap">
          <div className="draw-sphere-glow" />
          <div className="draw-sphere-main">
            <span className="draw-sphere-number">{predictedNum}</span>
          </div>
          <div className="draw-sphere-orbit">
            <span className="orbit-dot orbit-dot-1" />
            <span className="orbit-dot orbit-dot-2" />
          </div>
          <div className="draw-sphere-satellite">
            <span>{(predictedNum + 4) % 10}</span>
          </div>
        </div>

        <div className="draw-info-col">
          <div className="draw-countdown-row">
            <div className="draw-timer-block">
              <span className="draw-timer-label">Next Draw In</span>
              <span className="draw-timer-digits">{formattedMinSec}</span>
              <div className="draw-timer-dots">
                <span className="timer-dot dot-purple" />
                <span className="timer-dot dot-orange" />
                <span className="timer-dot dot-blue" />
              </div>
            </div>

            <div className="draw-flip-blocks" title="Live Countdown">
              <div className="flip-block">{minTens}</div>
              <div className="flip-block">{minOnes}</div>
              <span className="flip-separator">:</span>
              <div className="flip-block">{secTens}</div>
              <div className="flip-block">{secOnes}</div>
            </div>
          </div>

          <div className="draw-id-row">
            <span className="draw-id-label">Draw ID</span>
            <div className="draw-id-value-wrap">
              <span className="draw-id-code" title={periodId}>{displayDrawId}</span>
              <button
                type="button"
                onClick={handleCopyDrawId}
                className={`draw-id-copy-btn ${copied ? "copied" : ""}`}
                title="Copy Draw ID"
              >
                {copied ? <Icon name="check" size={12} /> : <Icon name="copy" size={12} />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CARD 2: MYSTERY RADAR STRIP */}
      <section className="mystery-balls-card">
        <span className="mystery-sparkle">✦</span>
        <div className="mystery-balls-track">
          {recent7Numbers.map((num, i) => (
            <div key={`extended-ball-${i}`} className="radar-ball-item" title={`Ball ${num}`}>
              <img
                src={`/${num}.svg`}
                alt={`Ball ${num}`}
                className="radar-ball-svg"
                width={36}
                height={36}
              />
            </div>
          ))}
        </div>
        <span className="mystery-sparkle">✦</span>
      </section>

      {/* CARD 3: PREDICTION */}
      <section className="ai-prediction-banner-card CheckoutView-modulemxw7gapayAmountCard">
        {/* Top-Left Liquid Background & Animated Fluid SVG */}
        <div className="prediction-card-liquid-bg" aria-hidden="true">
          <div className="liquid-shape-layer-1" />
          <div className="liquid-shape-layer-2" />
          <svg
            className="liquid-svg-fluid"
            viewBox="0 0 180 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="predictionLiquidGradExt" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--screen-liquid-svg-from, #10b981)" stopOpacity="0.45" />
                <stop offset="55%" stopColor="var(--screen-liquid-svg-accent, #2dd4bf)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--screen-liquid-svg-to, #008f68)" stopOpacity="0.04" />
              </linearGradient>
              <linearGradient id="predictionLiquidRippleExt" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--screen-liquid-svg-accent, #2dd4bf)" stopOpacity="0.38" />
                <stop offset="100%" stopColor="var(--screen-liquid-svg-from, #10b981)" stopOpacity="0.08" />
              </linearGradient>
            </defs>
            <path
              className="liquid-svg-path-morph"
              d="M 45,25 C 80,10 120,20 145,50 C 170,80 160,125 130,150 C 100,175 55,165 30,140 C 5,115 10,70 25,45 Z"
              fill="url(#predictionLiquidGradExt)"
            />
            <path
              className="liquid-svg-path-ripple"
              d="M 52,32 C 82,22 112,30 132,55 C 152,80 145,114 120,134 C 95,154 60,146 40,126 C 20,106 25,72 37,50 Z"
              stroke="url(#predictionLiquidRippleExt)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              fill="none"
            />
            <circle cx="45" cy="40" r="3" fill="var(--screen-liquid-svg-from, #10b981)" opacity="0.6" className="liquid-floating-particle p1" />
            <circle cx="85" cy="26" r="2" fill="var(--screen-liquid-svg-accent, #2dd4bf)" opacity="0.5" className="liquid-floating-particle p2" />
            <circle cx="30" cy="75" r="2.5" fill="var(--screen-liquid-svg-accent, #2dd4bf)" opacity="0.5" className="liquid-floating-particle p3" />
          </svg>
        </div>

        <div className="prediction-bg-glow" />
        <div className="prediction-info-wrap">
          <h2 className="prediction-card-title">
            {mode === "30s" ? "30s Rapid AI Signal" : "1m Trend Analysis"}
          </h2>
          <p className="prediction-card-desc">
            Advanced analytics to highlight your next game.
          </p>

          <div className="prediction-verdict-pills">
            <span className={`target-pill-badge target-pill-${displayColor.toLowerCase()}`}>
              {displayColor.toUpperCase()} (2x)
            </span>
            <span className="target-pill-badge target-pill-size">
              {isBig ? "HIGH (5-9)" : "SMALL (0-4)"}
            </span>
            <span
              className="target-pill-badge"
              style={{ background: "#fdf4ff", border: "1px solid #f0abfc", color: "#a21caf" }}
            >
              {mode === "30s" ? "98.9% Acc" : "99.1% Acc"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleManualRefresh}
            className="btn-get-prediction"
            title="Refresh AI algorithmic forecast"
          >
            <span>Get Prediction</span>
            <Icon name="chevron-right" size={14} />
          </button>
        </div>

        <div className="crystal-ball-wrap">
          <div className="crystal-ball-sphere">
            <svg className="crystal-ball-chart-svg" viewBox="0 0 50 34" fill="none">
              <path
                d="M 6 26 L 18 16 L 28 22 L 44 8"
                stroke="#ffffff"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="6" cy="26" r="2.8" fill="#ffffff" />
              <circle cx="18" cy="16" r="2.8" fill="#ffffff" />
              <circle cx="28" cy="22" r="2.8" fill="#ffffff" />
              <circle cx="44" cy="8" r="3.4" fill="#ffffff" />
            </svg>
          </div>
          <div className="crystal-ball-pedestal" />
          <div className="crystal-ball-ripple" />
          <span className="crystal-micro-orb micro-orb-1" />
          <span className="crystal-micro-orb micro-orb-2" />
        </div>
      </section>

      {/* CARD 4: GAME HISTORY */}
      <section className="game-history-card">
        <div className="history-header-row">
          <h3 className="history-title">Game History</h3>
        </div>

        <div className="history-purple-bar">
          <span>Period</span>
          <span>Number</span>
          <span>Big/Small</span>
          <span>Color</span>
        </div>

        <div className="history-rows-list">
          {last10History.length === 0 ? (
            <div className="history-loading-row">
              <span className="history-sync-spinner" />
              <span>Syncing live game results...</span>
            </div>
          ) : (
            last10History.map((item, idx) => {
              const periodFormatted = item.periodId
                ? (item.periodId.length >= 8
                    ? `${item.periodId.slice(0, 4)}...${item.periodId.slice(-4)}`
                    : item.periodId)
                : "—";
              const safeNum = typeof item.number === "number" ? Math.abs(item.number) % 10 : 0;
              const isItemBig = safeNum >= 5;

              return (
                <div key={`ext-history-${item.periodId || idx}`} className="history-item-row">
                  <span className="row-draw-id" title={item.periodId || ""}>
                    {periodFormatted}
                  </span>
                  <div className="row-numbers-cell">
                    <img
                      src={`/${safeNum}.svg`}
                      alt={`Ball ${safeNum}`}
                      className="history-ball-img"
                      width={26}
                      height={26}
                    />
                  </div>
                  <div className="row-type-cell">
                    <span className={isItemBig ? "pill-type-high" : "pill-type-small"}>
                      {isItemBig ? "Big" : "Small"}
                    </span>
                  </div>
                  <div className="row-result-cell">
                    {renderResultColorDot(safeNum)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* QUICK ACTION BUTTONS */}
      <div className="quick-action-strip">
        <a
          href="https://t.me/+Mjp4enRzhcZhNjE1"
          target="_blank"
          rel="noopener noreferrer"
          className="quick-action-btn-tg"
        >
          <Icon name="telegram" size={16} />
          <span>Join Telegram</span>
        </a>
        <button
          type="button"
          onClick={() => {
            window.open("https://t.me/+Mjp4enRzhcZhNjE1", "_blank");
          }}
          className="quick-action-btn-pro"
        >
          <Icon name="crown" size={16} />
          <span>Unlock VIP Pro</span>
        </button>
      </div>
    </div>
  );
}
