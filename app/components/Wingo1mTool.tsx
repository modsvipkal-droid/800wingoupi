"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { HistoricalResult, Prediction } from "../types";
import { computePrediction, formatPeriodId, getNumberCategory, getNumberColor } from "../utils/wingoEngine";
import { Icon } from "./Icons";
import { useAuth } from "../context/AuthContext";

interface Wingo1mToolProps {
  history: HistoricalResult[];
  onAddResult: (res: HistoricalResult) => void;
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

export default function Wingo1mTool({
  history,
  onAddResult,
  onNavigateToTool,
}: Wingo1mToolProps) {
  const { user, openLoginModal } = useAuth();
  const [remaining, setRemaining] = useState(60);
  const [periodId, setPeriodId] = useState("");
  const [currentSignal, setCurrentSignal] = useState<Prediction | null>(null);
  const [copied, setCopied] = useState(false);

  const lastCycleRef = useRef<number | null>(null);
  const [liveResults, setLiveResults] = useState<HistoricalResult[]>([]);
  const tgsContainerRef = useRef<HTMLDivElement>(null);

  // Directly load and render wingo-logic-ai.tgs client-side
  useEffect(() => {
    let animInstance: any = null;
    let isMounted = true;

    async function loadTgs() {
      try {
        const [lottieModule, pakoModule, res] = await Promise.all([
          import("lottie-web"),
          import("pako"),
          fetch("/wingo-logic-ai.tgs"),
        ]);
        if (!isMounted || !tgsContainerRef.current || !res.ok) return;

        const buffer = await res.arrayBuffer();
        const pako = pakoModule.default || pakoModule;
        const decompressed = pako.ungzip(new Uint8Array(buffer));
        const json = JSON.parse(new TextDecoder("utf-8").decode(decompressed));

        const lottie = lottieModule.default || lottieModule;
        tgsContainerRef.current.innerHTML = "";
        animInstance = lottie.loadAnimation({
          container: tgsContainerRef.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData: json,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
          },
        });
      } catch (e) {
        console.warn("TGS direct load error:", e);
      }
    }

    loadTgs();

    return () => {
      isMounted = false;
      if (animInstance) {
        try {
          animInstance.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const isFetchingRef = useRef(false);

  const fetchLiveHistory = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const res = await fetch("/api/wingo/history?mode=1m", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.list) && data.list.length > 0) {
        setLiveResults(data.list);
        if (data.list[0] && onAddResult) {
          onAddResult(data.list[0]);
        }
      }
    } catch {
      // Graceful fallback to existing state if offline or during reload
    } finally {
      isFetchingRef.current = false;
    }
  }, [onAddResult]);

  useEffect(() => {
    fetchLiveHistory();
    const interval = setInterval(fetchLiveHistory, 4000);
    return () => clearInterval(interval);
  }, [fetchLiveHistory]);

  const effectiveHistory = useMemo(() => {
    if (liveResults.length > 0) return liveResults;
    return history.filter((h) => h.mode === "1m" || !h.mode);
  }, [liveResults, history]);

  const updateTimer = useCallback(() => {
    const now = Date.now();
    const cycleIndex = Math.floor(now / 60000);
    const secsLeft = 60 - Math.floor((now % 60000) / 1000);
    const safeSecs = secsLeft === 0 ? 60 : secsLeft;

    setRemaining((prev) => (prev !== safeSecs ? safeSecs : prev));

    const activeIssue = liveResults[0]?.periodId;
    let currentPeriod = formatPeriodId(new Date(now), "1m");
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
      const initialSignal = computePrediction(currentPeriod, effectiveHistory, "1m");
      setCurrentSignal(initialSignal);
    } else if (cycleIndex !== lastCycleRef.current) {
      lastCycleRef.current = cycleIndex;
      fetchLiveHistory();
      const nextPrediction = computePrediction(currentPeriod, effectiveHistory, "1m");
      setCurrentSignal(nextPrediction);
    }
  }, [effectiveHistory, liveResults, fetchLiveHistory]);

  useEffect(() => {
    const timer = setInterval(updateTimer, 500);
    return () => clearInterval(timer);
  }, [updateTimer]);

  const handleManualRefresh = useCallback(() => {
    if (!user) {
      openLoginModal();
      return;
    }
    const currentPeriod = periodId || formatPeriodId(new Date(), "1m");
    setCurrentSignal(computePrediction(currentPeriod, effectiveHistory, "1m"));
  }, [user, openLoginModal, periodId, effectiveHistory]);

  // Derived prediction values
  const displayColor = currentSignal?.color || "Green";
  const displaySize = currentSignal?.category || "Big";
  const isBig = displaySize.toLowerCase() === "big";
  const predictedNum = currentSignal?.number ?? 7;

  // Masked Draw ID: starting 4 digits + xxxxxxxxxxxx + last 4 digits
  const displayDrawId = useMemo(() => {
    const raw = periodId || (liveResults[0]?.periodId ? (BigInt(liveResults[0].periodId) + BigInt(1)).toString() : formatPeriodId(new Date(), "1m"));
    if (raw.length >= 8) {
      const first4 = raw.slice(0, 4);
      const last4 = raw.slice(-4);
      return `${first4}xxxxxxxxxxxx${last4}`;
    }
    return raw || "2026xxxxxxxxx0001";
  }, [periodId, liveResults]);

  const handleCopyDrawId = useCallback(() => {
    const rawId = periodId || (liveResults[0]?.periodId ? (BigInt(liveResults[0].periodId) + BigInt(1)).toString() : formatPeriodId(new Date(), "1m"));
    if (typeof window !== "undefined" && navigator?.clipboard) {
      navigator.clipboard.writeText(rawId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }, [periodId, liveResults]);

  // Digital countdown segments
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const minTens = Math.floor(minutes / 10);
  const minOnes = minutes % 10;
  const secTens = Math.floor(seconds / 10);
  const secOnes = seconds % 10;
  const formattedMinSec = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Last 10 verified rounds for Game History
  const last10History = useMemo(() => {
    return effectiveHistory.slice(0, 10);
  }, [effectiveHistory]);

  // Last 7 drawn SVG balls for Radar Strip
  const recent7Numbers = useMemo(() => {
    const list = last10History.slice(0, 7);
    if (list.length >= 7) {
      return list.map((item) => (typeof item.number === "number" ? Math.abs(item.number) % 10 : 0));
    }
    const defaultSample = [1, 9, 7, 4, 0, 5, 8];
    const extracted = list.map((item) => (typeof item.number === "number" ? Math.abs(item.number) % 10 : 0));
    return extracted.concat(defaultSample.slice(extracted.length)).slice(0, 7);
  }, [last10History]);

  return (
    <div className="wingo-mobile-screen theme-sapphire">
      {/* Mode Switcher (30s / 1m) */}
      <div className="extended-mode-switcher-modern">
        <button
          type="button"
          className="ext-mode-pill-btn"
          onClick={() => onNavigateToTool?.("wingo-30s")}
        >
          <Icon name="bolt" size={13} />
          <span>30 Sec Prediction</span>
        </button>
        <button
          type="button"
          className="ext-mode-pill-btn is-active"
        >
          <Icon name="clock" size={13} />
          <span>1 Min Prediction</span>
        </button>
      </div>

      {/* ===================================================================
          CARD 1: CURRENT DRAW STATUS & LIVE DIGITAL COUNTDOWN
          =================================================================== */}
      <section className="draw-countdown-card">
        {/* Left: 3D Glossy Sphere with Orbit & Satellite */}
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

        {/* Right: Digital Timer, Colored Dots, Flip Blocks, Draw ID */}
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

            {/* Segmented Purple Flip Digit Blocks */}
            <div className="draw-flip-blocks" title="Live Countdown">
              <div className="flip-block">{minTens}</div>
              <div className="flip-block">{minOnes}</div>
              <span className="flip-separator">:</span>
              <div className="flip-block">{secTens}</div>
              <div className="flip-block">{secOnes}</div>
            </div>
          </div>

          {/* Draw ID & One-Click Copy */}
          <div className="draw-id-row">
            <span className="draw-id-label">Draw ID</span>
            <div className="draw-id-value-wrap">
              <span className="draw-id-code" suppressHydrationWarning title={periodId}>{displayDrawId}</span>
              <button
                type="button"
                onClick={handleCopyDrawId}
                className={`draw-id-copy-btn ${copied ? "copied" : ""}`}
                title={copied ? "Copied to clipboard!" : "Copy Draw ID"}
              >
                {copied ? <Icon name="check" size={12} /> : <Icon name="copy" size={12} />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          CARD 2: MYSTERY BALLS RADAR STRIP (REALTIME LAST 7 DRAWN SVG BALLS)
          =================================================================== */}
      <section className="mystery-balls-card">
        <span className="mystery-sparkle">✦</span>
        <div className="mystery-balls-track">
          {recent7Numbers.map((num, i) => (
            <div key={`radar-ball-${i}`} className="radar-ball-item" title={`Ball ${num}`}>
              <img
                src={`/${num}.svg`}
                alt={`Drawn Number ${num}`}
                className="radar-ball-svg"
                width={36}
                height={36}
              />
            </div>
          ))}
        </div>
        <span className="mystery-sparkle">✦</span>
      </section>

      {/* ===================================================================
          CARD 3: NEXT ROUND PREDICTION & VERDICT
          =================================================================== */}
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
              <linearGradient id="predictionLiquidGrad1m" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--screen-liquid-svg-from, #3b82f6)" stopOpacity="0.45" />
                <stop offset="55%" stopColor="var(--screen-liquid-svg-accent, #38bdf8)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--screen-liquid-svg-to, #1d4ed8)" stopOpacity="0.04" />
              </linearGradient>
              <linearGradient id="predictionLiquidRipple1m" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--screen-liquid-svg-accent, #38bdf8)" stopOpacity="0.38" />
                <stop offset="100%" stopColor="var(--screen-liquid-svg-from, #3b82f6)" stopOpacity="0.08" />
              </linearGradient>
            </defs>
            <path
              className="liquid-svg-path-morph"
              d="M 45,25 C 80,10 120,20 145,50 C 170,80 160,125 130,150 C 100,175 55,165 30,140 C 5,115 10,70 25,45 Z"
              fill="url(#predictionLiquidGrad1m)"
            />
            <path
              className="liquid-svg-path-ripple"
              d="M 52,32 C 82,22 112,30 132,55 C 152,80 145,114 120,134 C 95,154 60,146 40,126 C 20,106 25,72 37,50 Z"
              stroke="url(#predictionLiquidRipple1m)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              fill="none"
            />
            <circle cx="45" cy="40" r="3" fill="var(--screen-liquid-svg-from, #3b82f6)" opacity="0.6" className="liquid-floating-particle p1" />
            <circle cx="85" cy="26" r="2" fill="var(--screen-liquid-svg-accent, #38bdf8)" opacity="0.5" className="liquid-floating-particle p2" />
            <circle cx="30" cy="75" r="2.5" fill="var(--screen-liquid-svg-accent, #38bdf8)" opacity="0.5" className="liquid-floating-particle p3" />
          </svg>
        </div>

        <div className="prediction-bg-glow" />
        <div className="prediction-info-wrap">
          <h2 className="prediction-card-title">Next Round Prediction</h2>
          <p className="prediction-card-desc">
            Macro-trend probabilistic modeling for 1-minute cycles.
          </p>

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

        {/* Right: AI Engine Animated TGS Animation */}
        <div className="prediction-tgs-wrap" title="WinGo AI Prediction Engine">
          <div className="prediction-tgs-ambient-glow" />
          <div ref={tgsContainerRef} className="prediction-tgs-player" />
        </div>
      </section>

      {/* ===================================================================
          CARD 4: GAME HISTORY TABLE CARD (REALTIME LAST 10 RESULTS)
          =================================================================== */}
      <section className="game-history-card">
        <div className="history-header-row">
          <h3 className="history-title">Game History</h3>
        </div>

        {/* Purple Solid Gradient Header Bar */}
        <div className="history-purple-bar">
          <span>Period</span>
          <span>Number</span>
          <span>Big/Small</span>
          <span>Color</span>
        </div>

        {/* Soft Rounded Card Rows */}
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
                <div key={`${item.periodId || "row"}-${idx}`} className="history-item-row">
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

      {/* ===================================================================
          QUICK ACTION BUTTONS STRIP
          =================================================================== */}
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

      {/* ===================================================================
          COMPREHENSIVE SEO CONTENT & STRATEGY GUIDE
          =================================================================== */}
      <section className="prediction-guide-section">
        <div className="guide-header-block">
          <span className="guide-eyebrow-pill">
            <Icon name="book" size={13} />
            <span>EXPERT METHODOLOGY &amp; DOCUMENTATION</span>
          </span>
          <h2 className="guide-main-heading">
            Understanding the WinGo 1-Minute Algorithmic Prediction Framework
          </h2>
          <p className="guide-lead-text">
            Explore how quantitative statistical models, macro-trend variance smoothing, and real-time round audits power high-probability forecasts for 1-minute standard cycles.
          </p>
        </div>

        <div className="guide-cards-grid">
          {/* Card 1 */}
          <article className="guide-feature-card">
            <div className="guide-card-icon-wrap icon-green">
              <Icon name="clock" size={20} />
            </div>
            <h2 className="guide-card-title">
              How the 1-Minute Predictive AI Architecture Operates
            </h2>
            <p className="guide-card-desc">
              The WinGo 1m engine operates on 60-second horizon periods. With double the interval of the 30s engine, the algorithmic pipeline benefits from improved statistical sample depth and smoother regression curves.
            </p>
            <p className="guide-card-desc">
              By filtering out micro-fluctuations, the model detects persistent dragon runs and structural regime changes across color frequencies (Green, Red, Violet) and size groups (Big, Small).
            </p>
          </article>

          {/* Card 2 */}
          <article className="guide-feature-card">
            <div className="guide-card-icon-wrap icon-gold">
              <Icon name="shield" size={20} />
            </div>
            <h2 className="guide-card-title">
              Target Audience &amp; Disciplined Bankroll Management
            </h2>
            <p className="guide-card-desc">
              Designed for analytical players who favor steady, lower-volatility cycles. The extended 60-second window gives users sufficient time to analyze trend sheets, calibrate staging levels, and place strategic entries.
            </p>
            <p className="guide-card-desc">
              We recommend combining our 1m predictions with strict capital allocation rules, reserving sufficient reserves across 6 to 8 recovery tiers to absorb variance comfortably.
            </p>
          </article>

          {/* Card 3 */}
          <article className="guide-feature-card">
            <div className="guide-card-icon-wrap icon-blue">
              <Icon name="check" size={20} />
            </div>
            <h2 className="guide-card-title">
              Real-Time Verification Protocol &amp; Round Audit Proof
            </h2>
            <p className="guide-card-desc">
              Every round’s official period number, winning number, size, and color combination are verified against live lottery endpoints in real-time.
            </p>
            <p className="guide-card-desc">
              Users can cross-examine past AI forecasts with actual outcomes directly in the transparent Game History ledger, ensuring complete algorithmic accountability.
            </p>
          </article>
        </div>

        {/* Section 4: Internal Links */}
        <div className="guide-internal-links-panel">
          <div className="links-panel-header">
            <h2 className="links-panel-title">
              Next Steps: Supporting Analytics &amp; Strategic Tools
            </h2>
            <p className="links-panel-subtitle">
              Enhance your predictive strategy with our suite of specialized analytical tools.
            </p>
          </div>

          <div className="guide-links-deck">
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateToTool?.("wingo-30s");
              }}
              className="guide-link-pill-card"
              title="Switch to WinGo 30-Second Horizon"
            >
              <div className="link-pill-icon">
                <Icon name="bolt" size={18} />
              </div>
              <div className="link-pill-text">
                <span className="pill-name">WinGo 30-Second Model</span>
                <span className="pill-meta">High-frequency momentum analytics</span>
              </div>
            </Link>

            <Link
              href="/wingo-pattern-radar"
              onClick={(e) => {
                e.preventDefault();
                onNavigateToTool?.("pattern-radar");
              }}
              className="guide-link-pill-card"
              title="Open Pattern & Trend Radar"
            >
              <div className="link-pill-icon">
                <Icon name="radar" size={18} />
              </div>
              <div className="link-pill-text">
                <span className="pill-name">Bead Road Pattern Radar</span>
                <span className="pill-meta">Visual streak analysis &amp; cluster detection</span>
              </div>
            </Link>

            <Link
              href="/wingo-calculator"
              onClick={(e) => {
                e.preventDefault();
                onNavigateToTool?.("calculator");
              }}
              className="guide-link-pill-card"
              title="Open Martingale Staging Calculator"
            >
              <div className="link-pill-icon">
                <Icon name="calculator" size={18} />
              </div>
              <div className="link-pill-text">
                <span className="pill-name">Risk Stage Calculator</span>
                <span className="pill-meta">Calculate optimal 8-stage capital staging</span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
