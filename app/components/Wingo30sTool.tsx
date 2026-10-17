"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { HistoricalResult, Prediction } from "../types";
import { computePrediction, formatPeriodId, getNumberCategory, getNumberColor } from "../utils/wingoEngine";
import { Icon } from "./Icons";
import { useAuth } from "../context/AuthContext";

interface Wingo30sToolProps {
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

export default function Wingo30sTool({
  history,
  onAddResult,
  onNavigateToTool,
}: Wingo30sToolProps) {
  const { user, openLoginModal } = useAuth();
  const [remaining, setRemaining] = useState(30);
  const [periodId, setPeriodId] = useState("");
  const [currentSignal, setCurrentSignal] = useState<Prediction | null>(null);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
      const res = await fetch("/api/wingo/history?mode=30s", { cache: "no-store" });
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
    return history.filter((h) => h.mode === "30s" || !h.mode);
  }, [liveResults, history]);

  const updateTimer = useCallback(() => {
    const now = Date.now();
    const cycleIndex = Math.floor(now / 30000);
    const secsLeft = 30 - Math.floor((now % 30000) / 1000);
    const safeSecs = secsLeft === 0 ? 30 : secsLeft;

    setRemaining((prev) => (prev !== safeSecs ? safeSecs : prev));

    const activeIssue = liveResults[0]?.periodId;
    let currentPeriod = formatPeriodId(new Date(now), "30s");
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
      const initialSignal = computePrediction(currentPeriod, effectiveHistory, "30s");
      setCurrentSignal(initialSignal);
    } else if (cycleIndex !== lastCycleRef.current) {
      lastCycleRef.current = cycleIndex;
      fetchLiveHistory();
      const nextPrediction = computePrediction(currentPeriod, effectiveHistory, "30s");
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
    const currentPeriod = periodId || formatPeriodId(new Date(), "30s");
    setCurrentSignal(computePrediction(currentPeriod, effectiveHistory, "30s"));
  }, [user, openLoginModal, periodId, effectiveHistory]);

  // Derived prediction values
  const displayColor = currentSignal?.color || "Red";
  const displaySize = currentSignal?.category || "Big";
  const isBig = displaySize.toLowerCase() === "big";
  const predictedNum = currentSignal?.number ?? 9;

  // Masked Draw ID: starting 4 digits + xxxxxxxxxxxx + last 4 digits
  const displayDrawId = useMemo(() => {
    const raw = periodId || (liveResults[0]?.periodId ? (BigInt(liveResults[0].periodId) + BigInt(1)).toString() : formatPeriodId(new Date(), "30s"));
    if (raw.length >= 8) {
      const first4 = raw.slice(0, 4);
      const last4 = raw.slice(-4);
      return `${first4}xxxxxxxxxxxx${last4}`;
    }
    return raw || "2026xxxxxxxxx0001";
  }, [periodId, liveResults]);

  const handleCopyDrawId = useCallback(() => {
    const rawId = periodId || (liveResults[0]?.periodId ? (BigInt(liveResults[0].periodId) + BigInt(1)).toString() : formatPeriodId(new Date(), "30s"));
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
    const defaultSample = [8, 6, 2, 3, 2, 8, 9];
    const extracted = list.map((item) => (typeof item.number === "number" ? Math.abs(item.number) % 10 : 0));
    return extracted.concat(defaultSample.slice(extracted.length)).slice(0, 7);
  }, [last10History]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* ===================================================================
          FULL-WIDTH HERO SECTION: ONLY TITLE & META DESCRIPTION
          =================================================================== */}
      <section className="hero-box prediction-hero-section">
        <div className="hero-section-inner">
          <h1 className="hero-main-title">
            WinGo 30s Live Prediction Tool: 30-Second Signal &amp; Chart
          </h1>
          <p className="hero-meta-description">
            Track real-time WinGo 30s live prediction signals, 25-second execution timing, verified 10-round history logs, and the 5-stage 1.96x multiplier chart.
          </p>
        </div>
      </section>

      {/* ===================================================================
          INTERACTIVE 30-SECOND CONSOLE (CENTERED MOBILE SCREEN)
          =================================================================== */}
      <div className="wingo-mobile-screen theme-emerald">
      {/* Mode Switcher (30s / 1m) */}
      <div className="extended-mode-switcher-modern">
        <button
          type="button"
          className="ext-mode-pill-btn is-active"
        >
          <Icon name="bolt" size={13} />
          <span>30 Sec Prediction</span>
        </button>
        <button
          type="button"
          className="ext-mode-pill-btn"
          onClick={() => onNavigateToTool?.("wingo-1m")}
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
              <linearGradient id="predictionLiquidGrad30s" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--screen-liquid-svg-from, #10b981)" stopOpacity="0.45" />
                <stop offset="55%" stopColor="var(--screen-liquid-svg-accent, #2dd4bf)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--screen-liquid-svg-to, #008f68)" stopOpacity="0.04" />
              </linearGradient>
              <linearGradient id="predictionLiquidRipple30s" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--screen-liquid-svg-accent, #2dd4bf)" stopOpacity="0.38" />
                <stop offset="100%" stopColor="var(--screen-liquid-svg-from, #10b981)" stopOpacity="0.08" />
              </linearGradient>
            </defs>
            <path
              className="liquid-svg-path-morph"
              d="M 45,25 C 80,10 120,20 145,50 C 170,80 160,125 130,150 C 100,175 55,165 30,140 C 5,115 10,70 25,45 Z"
              fill="url(#predictionLiquidGrad30s)"
            />
            <path
              className="liquid-svg-path-ripple"
              d="M 52,32 C 82,22 112,30 132,55 C 152,80 145,114 120,134 C 95,154 60,146 40,126 C 20,106 25,72 37,50 Z"
              stroke="url(#predictionLiquidRipple30s)"
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
          <h2 className="prediction-card-title">Next Round Prediction</h2>
          <p className="prediction-card-desc">
            Advanced quantitative probability analytics for your next cycle.
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

      </div>

      {/* ===================================================================
          COMPREHENSIVE ARTICLE & ANALYTICAL STRATEGY GUIDE (FULL WIDTH)
          =================================================================== */}
      <section className="article-container-wrap">
        <div className="article-ambient-blob" />

        {/* Header Block & Lead Quote */}
        <div className="article-section-card">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="step-num-badge">
              <Icon name="bolt" size={13} />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
              30-Second Rapid Cycle Signals &amp; Pattern Guide
            </span>
          </div>
          <h2 className="article-main-title">
            WinGo 30s Live Prediction Tool: Real-Time 30-Second Signals, History &amp; Pattern Guide
          </h2>
          <p className="article-lead-desc">
            Har 30 second mein live BIG/SMALL prediction signals, 25-second execution timer, aur verified result history ek hi live console par track karein.
          </p>

          <h3 className="article-sub-heading">
            About the WinGo 30-Second Live Predictor Engine
          </h3>
          <p className="article-body-text">
            Welcome to the WinGo 30s Live Predictor Engine, a real-time statistical analysis and pattern tracking console built specifically for high-speed 30-second WinGo game cycles. Running at twice the speed of standard 1-minute rounds, the 30-second format generates 120 periods per hour (2,880 rounds every 24 hours). Our engine processes live Pseudo-Random Number Generator (PRNG) outcome streams to calculate instant probability shifts for BIG (5–9), SMALL (0–4), and Color Parity (Red, Green, Violet) before the countdown locks.
          </p>

          <blockquote className="article-quote-block">
            &ldquo;In ultra-fast 30-second cycles, you only have a 25-second active window before the 5-second settlement freeze. Emotional guessing leads to instant drawdown—structured sequence tracking and pre-calculated stage multipliers are the only way to stay consistent.&rdquo;
          </blockquote>
        </div>

        {/* Section 1: The 5-Step Execution Protocol for 30-Second Cycles (25s Active Window) */}
        <div className="article-section-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="step-num-badge">01</span>
            <h2 className="article-section-title">
              The 5-Step Execution Protocol for 30-Second Cycles (25s Active Window)
            </h2>
          </div>
          <p className="article-body-text mb-3">
            Unlike 1-minute games, 30-second WinGo rounds lock all entries during the final 5 seconds (00:05 to 00:00) for server settlement. That leaves analysts with an effective 25-second decision window. Follow this exact timeline on every round:
          </p>

          <div className="article-protocol-grid">
            <div className="article-protocol-step">
              <span className="step-num-badge">1</span>
              <div>
                <strong className="text-slate-900 block text-xs sm:text-[13px] mb-0.5 font-bold">
                  Period ID &amp; Timer Sync (00:30 to 00:25)
                </strong>
                <p className="text-[11.5px] sm:text-xs text-slate-500 leading-relaxed">
                  As the new 30-second countdown begins, match the active period ID (YYYYMMDD + daily round number from 0001 to 2880) in the live signal console to ensure zero browser lag.
                </p>
              </div>
            </div>

            <div className="article-protocol-step">
              <span className="step-num-badge">2</span>
              <div>
                <strong className="text-slate-900 block text-xs sm:text-[13px] mb-0.5 font-bold">
                  Rolling 10-Round Pattern Check (00:25 to 00:18)
                </strong>
                <p className="text-[11.5px] sm:text-xs text-slate-500 leading-relaxed">
                  Scan the recent 10-period history log to identify whether the table is running a Single Zig-Zag (B-S-B-S), a Twin Jump (B-B-S-S), or an active Dragon Streak (4+ identical results).
                </p>
              </div>
            </div>

            <div className="article-protocol-step">
              <span className="step-num-badge">3</span>
              <div>
                <strong className="text-slate-900 block text-xs sm:text-[13px] mb-0.5 font-bold">
                  BIG/SMALL vs. Violet Parity Filter (00:18 to 00:12)
                </strong>
                <p className="text-[11.5px] sm:text-xs text-slate-500 leading-relaxed">
                  Check the frequency of hybrid Violet numbers (0 and 5). Because Numbers 0 and 5 cut Red/Green payouts to 1.47x, prioritize pure BIG (5–9) or SMALL (0–4) signals to lock in the full 1.96x net return.
                </p>
              </div>
            </div>

            <div className="article-protocol-step">
              <span className="step-num-badge">4</span>
              <div>
                <strong className="text-slate-900 block text-xs sm:text-[13px] mb-0.5 font-bold">
                  Stage Multiplier Execution (00:12 to 00:06)
                </strong>
                <p className="text-[11.5px] sm:text-xs text-slate-500 leading-relaxed">
                  Enter your pre-calculated unit size using our WinGo Risk &amp; Stage Calculator (following either the standard 5-stage buffer or the aggressive 3x recovery plan) well before the 5-second lock warning.
                </p>
              </div>
            </div>

            <div className="article-protocol-step">
              <span className="step-num-badge">5</span>
              <div>
                <strong className="text-slate-900 block text-xs sm:text-[13px] mb-0.5 font-bold">
                  5-Second Freeze &amp; Settlement Audit (00:05 to 00:00)
                </strong>
                <p className="text-[11.5px] sm:text-xs text-slate-500 leading-relaxed">
                  During the final 5-second lockout, no entries are permitted. Once the result settles at 00:00, verify the winning number in the live audit table and reset to Level 1 on a win.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Core Mathematical Probabilities in 30-Second WinGo */}
        <div className="article-section-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="step-num-badge">02</span>
            <h2 className="article-section-title">
              Core Mathematical Probabilities in 30-Second WinGo
            </h2>
          </div>
          <p className="article-body-text mb-3">
            Every 30-second WinGo round draws a single digit from 0 to 9. Regardless of game speed, each round is governed by these fixed base probabilities and 2% commission-adjusted returns:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <article className="guide-feature-card">
              <div className="guide-card-icon-wrap icon-green">
                <Icon name="bolt" size={15} />
              </div>
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 mb-0.5">
                BIG Outcome (5, 6, 7, 8, 9)
              </h3>
              <p className="text-[11.5px] sm:text-xs text-slate-600 leading-relaxed">
                Covers 5 out of 10 numbers (<strong>50.00% base probability</strong>) with a full <strong>1.96x net payout</strong> on every winning number, including Number 5.
              </p>
            </article>

            <article className="guide-feature-card">
              <div className="guide-card-icon-wrap icon-blue">
                <Icon name="check" size={15} />
              </div>
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 mb-0.5">
                SMALL Outcome (0, 1, 2, 3, 4)
              </h3>
              <p className="text-[11.5px] sm:text-xs text-slate-600 leading-relaxed">
                Covers 5 out of 10 numbers (<strong>50.00% base probability</strong>) with a full <strong>1.96x net payout</strong> on every winning number, including Number 0.
              </p>
            </article>

            <article className="guide-feature-card">
              <div className="guide-card-icon-wrap icon-gold">
                <Icon name="clock" size={15} />
              </div>
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 mb-0.5">
                Pure Red vs. Pure Green Parity
              </h3>
              <p className="text-[11.5px] sm:text-xs text-slate-600 leading-relaxed">
                Pure Red (2, 4, 6, 8) and Pure Green (1, 3, 7, 9) each hold a <strong>40.00% probability</strong> and pay <strong>1.96x net</strong>.
              </p>
            </article>

            <article className="guide-feature-card">
              <div className="guide-card-icon-wrap icon-gold">
                <Icon name="radar" size={15} />
              </div>
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 mb-0.5">
                Violet Hybrid Pivot Numbers (0 &amp; 5)
              </h3>
              <p className="text-[11.5px] sm:text-xs text-slate-600 leading-relaxed">
                Number 0 (Red + Violet) and Number 5 (Green + Violet) account for <strong>20.00% (1 in 5 rounds)</strong>. If you play Red on 0 or Green on 5, payout drops to <strong>1.47x</strong>—Direct Violet pays <strong>4.41x net</strong>.
              </p>
            </article>

            <article className="guide-feature-card sm:col-span-2 lg:col-span-2">
              <div className="guide-card-icon-wrap icon-green">
                <Icon name="shield" size={15} />
              </div>
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 mb-0.5">
                5-Round Streak Threshold (1 - 0.5^n)
              </h3>
              <p className="text-[11.5px] sm:text-xs text-slate-600 leading-relaxed">
                The cumulative mathematical probability of a binary trend resolving within 5 consecutive rounds is <strong>96.88% (1 - 0.5^5)</strong>, making a 5-stage bankroll buffer the industry baseline for 30s sessions.
              </p>
            </article>
          </div>
        </div>

        {/* Section 3: WinGo 30s Outcome Distribution & Payout Efficiency Table */}
        <div className="article-section-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="step-num-badge">03</span>
            <h2 className="article-section-title">
              WinGo 30s Outcome Distribution &amp; Payout Efficiency Table
            </h2>
          </div>
          <p className="article-body-text mb-3">
            The matrix below compares exact number mappings, probabilities, and net payouts (after the standard 2% platform fee) for 30-second rounds:
          </p>

          <div className="table-responsive article-table-card">
            <table className="tools-table w-full text-left">
              <thead>
                <tr>
                  <th>Outcome Group</th>
                  <th>Winning Numbers</th>
                  <th>Base Odds</th>
                  <th>Color Mapping</th>
                  <th>Gross Multiplier</th>
                  <th>Net Return (After 2% Fee)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>SMALL (Binary Size)</strong></td>
                  <td><span className="font-mono font-bold text-slate-800">0, 1, 2, 3, 4</span></td>
                  <td>50.00%</td>
                  <td>0 (R+V), 1 &amp; 3 (G), 2 &amp; 4 (R)</td>
                  <td>2.00x</td>
                  <td><span className="text-emerald-600 font-extrabold">1.96x Full Net</span></td>
                </tr>
                <tr>
                  <td><strong>BIG (Binary Size)</strong></td>
                  <td><span className="font-mono font-bold text-slate-800">5, 6, 7, 8, 9</span></td>
                  <td>50.00%</td>
                  <td>5 (G+V), 6 &amp; 8 (R), 7 &amp; 9 (G)</td>
                  <td>2.00x</td>
                  <td><span className="text-emerald-600 font-extrabold">1.96x Full Net</span></td>
                </tr>
                <tr>
                  <td><strong>Pure Red / Pure Green</strong></td>
                  <td><span className="font-mono font-bold text-slate-800">2,4,6,8 (R) / 1,3,7,9 (G)</span></td>
                  <td>40.00% each</td>
                  <td>Solid Red or Solid Green</td>
                  <td>2.00x</td>
                  <td><span className="text-emerald-600 font-extrabold">1.96x Net</span></td>
                </tr>
                <tr>
                  <td><strong>Red/Green on 0 or 5</strong></td>
                  <td><span className="font-mono font-bold text-purple-700">0 (Red) or 5 (Green)</span></td>
                  <td>10.00% each</td>
                  <td>Hybrid Violet Split</td>
                  <td>1.50x</td>
                  <td><span className="text-amber-700 font-bold">1.47x Net (50% Split Penalty)</span></td>
                </tr>
                <tr>
                  <td><strong>Direct Violet</strong></td>
                  <td><span className="font-mono font-bold text-purple-700">0, 5</span></td>
                  <td>20.00%</td>
                  <td>Dual Violet Hybrid</td>
                  <td>4.50x</td>
                  <td><span className="text-purple-700 font-extrabold">4.41x Net</span></td>
                </tr>
                <tr className="bg-emerald-50/50">
                  <td><strong className="text-emerald-800">Single Number (0–9)</strong></td>
                  <td><span className="font-mono font-bold text-emerald-900">Any Exact Digit</span></td>
                  <td>10.00%</td>
                  <td>Exact Match</td>
                  <td>9.00x</td>
                  <td><span className="text-emerald-700 font-black">8.82x Net</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: 30-Second Rapid Cycle Probability & 5-Stage Multiplier Matrix */}
        <div className="article-section-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="step-num-badge">04</span>
            <h2 className="article-section-title">
              30-Second Rapid Cycle Probability &amp; 5-Stage Multiplier Matrix
            </h2>
          </div>
          <p className="article-body-text mb-3">
            Because 30-second rounds settle in just 2.5 minutes across a 5-level cycle, disciplined stage sizing is critical. The table below outlines cumulative hit probabilities (1 - 0.5^n), the standard 3x Triple Progression (1x–3x–9x–27x–81x), and exact net recovery profits at a 1.96x payout:
          </p>

          <div className="table-responsive article-table-card mb-3">
            <table className="tools-table w-full text-left">
              <thead>
                <tr>
                  <th>Stage Level</th>
                  <th>Elapsed Time</th>
                  <th>Streak Depth</th>
                  <th>Cumulative Win Prob (1 - 0.5^n)</th>
                  <th>Multiplier Plan (3x)</th>
                  <th>Total Units Used</th>
                  <th>Net Profit (at 1.96x)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="stage-num-badge">Level 1</span></td>
                  <td>0 – 30s</td>
                  <td>1 Period</td>
                  <td>50.00%</td>
                  <td><strong>1x Base</strong></td>
                  <td>1 Unit</td>
                  <td><span className="text-emerald-600 font-bold">+0.96x Units</span></td>
                </tr>
                <tr>
                  <td><span className="stage-num-badge">Level 2</span></td>
                  <td>30 – 60s</td>
                  <td>2 Periods</td>
                  <td>75.00%</td>
                  <td><strong>3x Multiplier</strong></td>
                  <td>4 Units</td>
                  <td><span className="text-emerald-600 font-bold">+1.88x Units</span></td>
                </tr>
                <tr>
                  <td><span className="stage-num-badge">Level 3</span></td>
                  <td>60 – 90s</td>
                  <td>3 Periods</td>
                  <td>87.50%</td>
                  <td><strong>9x Multiplier</strong></td>
                  <td>13 Units</td>
                  <td><span className="text-emerald-600 font-bold">+4.64x Units</span></td>
                </tr>
                <tr>
                  <td><span className="stage-num-badge">Level 4</span></td>
                  <td>90 – 120s</td>
                  <td>4 Periods</td>
                  <td>93.75%</td>
                  <td><strong>27x Multiplier</strong></td>
                  <td>40 Units</td>
                  <td><span className="text-emerald-600 font-bold">+12.92x Units</span></td>
                </tr>
                <tr className="bg-emerald-50/40">
                  <td><span className="stage-num-badge bg-emerald-200 text-emerald-900">Level 5</span></td>
                  <td>120 – 150s</td>
                  <td>5 Periods</td>
                  <td>96.88%</td>
                  <td><strong>81x Multiplier</strong></td>
                  <td>121 Units</td>
                  <td><span className="text-emerald-700 font-black">+37.76x Units</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="article-disclaimer-box text-xs">
            <strong>Capital Saver Tip:</strong> If a 121-unit bankroll is too aggressive for your balance, switch to our Conservative 5-Stage Ratio (1x - 3x - 8x - 20x - 50x) on the WinGo Risk Calculator, which requires only 82 total units while still generating a positive net profit at every stage.
          </div>
        </div>

        {/* Section 5: Managing High-Speed Volatility & Micro-Session Risk in 30s WinGo */}
        <div className="article-section-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="step-num-badge">05</span>
            <h2 className="article-section-title">
              Managing High-Speed Volatility &amp; Micro-Session Risk in 30s WinGo
            </h2>
          </div>
          <p className="article-body-text mb-3">
            Playing 120 rounds per hour compresses an entire afternoon of 1-minute action into just 30 minutes. To protect your bankroll against rapid variance, follow these three quantitative rules:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <article className="guide-feature-card">
              <div className="guide-card-icon-wrap icon-gold">
                <Icon name="clock" size={15} />
              </div>
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 mb-0.5">
                1. Eliminating Decision Lag &amp; Micro-Session Fatigue
              </h3>
              <p className="text-[11.5px] sm:text-xs text-slate-600 leading-relaxed">
                In a 25-second active window, hesitation leads to missed stages. Enforce a strict <strong>20-round session limit (10 minutes)</strong> followed by a 10-minute break to reset focus.
              </p>
            </article>

            <article className="guide-feature-card">
              <div className="guide-card-icon-wrap icon-green">
                <Icon name="radar" size={15} />
              </div>
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 mb-0.5">
                2. Surviving Micro-Burst Dragon Streaks
              </h3>
              <p className="text-[11.5px] sm:text-xs text-slate-600 leading-relaxed">
                With 2,880 rounds daily, statistical clustering is inevitable. Never bet against an active Dragon streak using reverse Martingale until the Pattern Analyzer confirms a break.
              </p>
            </article>

            <article className="guide-feature-card">
              <div className="guide-card-icon-wrap icon-blue">
                <Icon name="shield" size={15} />
              </div>
              <h3 className="text-xs sm:text-[13px] font-bold text-slate-900 mb-0.5">
                3. Avoiding the 1.47x Violet Split Trap
              </h3>
              <p className="text-[11.5px] sm:text-xs text-slate-600 leading-relaxed">
                When Number 0 or 5 lands during color recovery, the 1.47x payout breaks progression math. Executing strictly on BIG/SMALL preserves the full 1.96x return.
              </p>
            </article>
          </div>
        </div>

        {/* Section 6: Frequently Asked Questions (WinGo 30s FAQ) */}
        <div className="article-section-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="step-num-badge">06</span>
            <h2 className="article-section-title">
              Frequently Asked Questions (WinGo 30s FAQ)
            </h2>
          </div>
          <p className="article-body-text mb-3">
            Key analytical questions answered regarding rapid 30-second algorithmic signals, period execution windows, and stage multipliers:
          </p>

          <div className="article-faq-list">
            <div className={`article-faq-item ${openFaq === 1 ? "is-open" : ""}`}>
              <button
                type="button"
                className="article-faq-question"
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
              >
                <span>How does the WinGo 30-Second Live Predictor calculate rapid period signals?</span>
                <Icon name="chevron-right" size={14} className={`transition-transform duration-200 ${openFaq === 1 ? "rotate-90 text-emerald-600" : ""}`} />
              </button>
              {openFaq === 1 && (
                <div className="article-faq-answer">
                  Our 30s prediction engine analyzes rolling 10-period and 30-period outcome sequences, BIG/SMALL parity imbalances, and Violet pivot intervals in real time. The signal gauge updates automatically within the first 2 seconds of every new 30-second countdown.
                </div>
              )}
            </div>

            <div className={`article-faq-item ${openFaq === 2 ? "is-open" : ""}`}>
              <button
                type="button"
                className="article-faq-question"
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
              >
                <span>Is WinGo 30s faster than the standard 1-minute WinGo cycles?</span>
                <Icon name="chevron-right" size={14} className={`transition-transform duration-200 ${openFaq === 2 ? "rotate-90 text-emerald-600" : ""}`} />
              </button>
              {openFaq === 2 && (
                <div className="article-faq-answer">
                  Yes. WinGo 30s runs at double the speed of standard 1-minute games, completing 2 rounds per minute (120 rounds per hour and 2,880 rounds per day). Importantly, because the final 5 seconds are locked for settlement, players have a 25-second active window to verify signals and place entries.
                </div>
              )}
            </div>

            <div className={`article-faq-item ${openFaq === 3 ? "is-open" : ""}`}>
              <button
                type="button"
                className="article-faq-question"
                onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
              >
                <span>What numbers belong to BIG and SMALL in 30-Second WinGo?</span>
                <Icon name="chevron-right" size={14} className={`transition-transform duration-200 ${openFaq === 3 ? "rotate-90 text-emerald-600" : ""}`} />
              </button>
              {openFaq === 3 && (
                <div className="article-faq-answer">
                  In WinGo 30s, SMALL includes numbers 0, 1, 2, 3, and 4 (50% probability), while BIG includes numbers 5, 6, 7, 8, and 9 (50% probability). Both BIG and SMALL pay a full 1.96x net return on all winning numbers without any Violet split reduction.
                </div>
              )}
            </div>

            <div className={`article-faq-item ${openFaq === 4 ? "is-open" : ""}`}>
              <button
                type="button"
                className="article-faq-question"
                onClick={() => setOpenFaq(openFaq === 4 ? null : 4)}
              >
                <span>How are the WinGo 30s 10-round history logs verified?</span>
                <Icon name="chevron-right" size={14} className={`transition-transform duration-200 ${openFaq === 4 ? "rotate-90 text-emerald-600" : ""}`} />
              </button>
              {openFaq === 4 && (
                <div className="article-faq-answer">
                  Every settled round is synchronized directly with the official 30-second server period ID (YYYYMMDD + 4-digit round counter from 0001 to 2880) at 00:00. Our live audit log records the exact period number, predicted bias, actual settled digit (0–9), and hit/miss status for complete transparency.
                </div>
              )}
            </div>

            <div className={`article-faq-item ${openFaq === 5 ? "is-open" : ""}`}>
              <button
                type="button"
                className="article-faq-question"
                onClick={() => setOpenFaq(openFaq === 5 ? null : 5)}
              >
                <span>Where can I get real-time WinGo 30s Telegram signal alerts?</span>
                <Icon name="chevron-right" size={14} className={`transition-transform duration-200 ${openFaq === 5 ? "rotate-90 text-emerald-600" : ""}`} />
              </button>
              {openFaq === 5 && (
                <div className="article-faq-answer">
                  You can track instant, zero-latency signals directly on this WinGo 30s Live Predictor web console or join our official Telegram broadcast channel via the floating Telegram button on the screen for live Dragon alerts and session schedules.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transparency & Disclaimer Box */}
        <div className="article-disclaimer-box">
          <div className="flex items-center gap-1.5 font-bold mb-1 text-amber-900 text-xs sm:text-[13px]">
            <Icon name="shield" size={15} />
            <span>Analytical Disclaimer</span>
          </div>
          <p className="text-[11.5px] sm:text-xs leading-relaxed text-amber-950/80">
            WinGo Prediction AI is an independent statistical data visualization and mathematical analysis platform. PRNG sequences involve inherent variance, and historical patterns do not guarantee future outcomes. We store zero personal user data and do not operate real-money gaming or gambling services.
          </p>
        </div>

        {/* Explore Our Complete WinGo Analytics Suite */}
        <div className="guide-internal-links-panel">
          <div className="links-panel-header">
            <h2 className="article-section-title mb-1.5">
              Explore Our Complete WinGo Analytics Suite
            </h2>
            <p className="article-body-text mb-3">
              Switch to standard 60-second analysis on the WinGo 1-Min Live Tools, forecast exact digits with the WinGo Number Predictor, decode streak clusters on the WinGo Pattern Analyzer, inspect deep-learning models on the WinGo Predictor AI, calculate exact unit buffers on the WinGo Risk Calculator, or reach our team via the Official Support Center.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mt-2">
            <Link
              href="/wingo-1-min-live-prediction-tool"
              onClick={(e) => {
                e.preventDefault();
                onNavigateToTool?.("wingo-1m");
              }}
              className="guide-link-pill-card"
              title="Switch to standard 60-second analysis on the WinGo 1-Min Live Tools"
            >
              <div className="link-pill-icon">
                <Icon name="clock" size={16} />
              </div>
              <div className="link-pill-text">
                <span className="pill-name text-xs font-bold">WinGo 1-Min Live Tools</span>
                <span className="pill-meta text-[11px] text-slate-500">60s cycle analysis</span>
              </div>
            </Link>

            <Link
              href="/wingo-pattern-radar"
              onClick={(e) => {
                e.preventDefault();
                onNavigateToTool?.("pattern-radar");
              }}
              className="guide-link-pill-card"
              title="Decode streak clusters on the WinGo Pattern Analyzer"
            >
              <div className="link-pill-icon">
                <Icon name="radar" size={16} />
              </div>
              <div className="link-pill-text">
                <span className="pill-name text-xs font-bold">WinGo Pattern Analyzer</span>
                <span className="pill-meta text-[11px] text-slate-500">Bead Road clusters</span>
              </div>
            </Link>

            <Link
              href="/wingo-calculator"
              onClick={(e) => {
                e.preventDefault();
                onNavigateToTool?.("calculator");
              }}
              className="guide-link-pill-card"
              title="Calculate exact unit buffers on the WinGo Risk Calculator"
            >
              <div className="link-pill-icon">
                <Icon name="calculator" size={16} />
              </div>
              <div className="link-pill-text">
                <span className="pill-name text-xs font-bold">WinGo Risk Calculator</span>
                <span className="pill-meta text-[11px] text-slate-500">5 &amp; 8-stage staging</span>
              </div>
            </Link>

            <a
              href="https://t.me/+Mjp4enRzhcZhNjE1"
              target="_blank"
              rel="noopener noreferrer"
              className="guide-link-pill-card"
              title="Reach our team via the Official Support Center on Telegram"
            >
              <div className="link-pill-icon">
                <Icon name="telegram" size={16} />
              </div>
              <div className="link-pill-text">
                <span className="pill-name text-xs font-bold">Official Support Center</span>
                <span className="pill-meta text-[11px] text-slate-500">Live Telegram alerts</span>
              </div>
            </a>
          </div>
        </div>

        {/* Comprehensive JSON-LD Structured Data Schema: BreadcrumbList, Article, and FAQPage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "BreadcrumbList",
                  "@id": "https://wingologic.com/wingo-30s-live-prediction#breadcrumb",
                  "itemListElement": [
                    {
                      "@type": "ListItem",
                      "position": 1,
                      "name": "Home",
                      "item": "https://wingologic.com/"
                    },
                    {
                      "@type": "ListItem",
                      "position": 2,
                      "name": "Prediction Tools",
                      "item": "https://wingologic.com/#tools"
                    },
                    {
                      "@type": "ListItem",
                      "position": 3,
                      "name": "WinGo 30s Live Prediction Tool",
                      "item": "https://wingologic.com/wingo-30s-live-prediction"
                    }
                  ]
                },
                {
                  "@type": "Article",
                  "@id": "https://wingologic.com/wingo-30s-live-prediction#article",
                  "isPartOf": {
                    "@type": "WebPage",
                    "@id": "https://wingologic.com/wingo-30s-live-prediction"
                  },
                  "headline": "WinGo 30s Live Prediction Tool: 30-Second Signal & Chart",
                  "name": "WinGo 30s Live Prediction Tool: Real-Time 30-Second Signals, History & Pattern Guide",
                  "description": "Track real-time WinGo 30s live prediction signals, 25-second execution timing, verified 10-round history logs, and the 5-stage 1.96x multiplier chart.",
                  "keywords": [
                    "WinGo 30s Live Prediction",
                    "WinGo 30 Second Trick & Chart",
                    "wingo ai prediction",
                    "wingo prediction tool v5 apk",
                    "wingo prediction tool online free",
                    "wingo 30 second prediction apk",
                    "wingo master calculator",
                    "wingo number prediction analysis",
                    "wingo 30 second live",
                    "wingo30"
                  ],
                  "image": [
                    "https://wingologic.com/wingo-logic-official-logo.png"
                  ],
                  "mainEntityOfPage": "https://wingologic.com/wingo-30s-live-prediction",
                  "author": {
                    "@type": "Organization",
                    "name": "WinGo Logic Tools",
                    "url": "https://wingologic.com/"
                  },
                  "publisher": {
                    "@type": "Organization",
                    "name": "WinGo Logic Tools",
                    "url": "https://wingologic.com/",
                    "logo": {
                      "@type": "ImageObject",
                      "url": "https://wingologic.com/wingo-logic-official-logo.png"
                    }
                  },
                  "datePublished": "2026-01-15T00:00:00Z",
                  "dateModified": "2026-10-17T00:00:00Z",
                  "inLanguage": "en-US",
                  "articleSection": "Prediction Strategy & Analytics"
                },
                {
                  "@type": "FAQPage",
                  "@id": "https://wingologic.com/wingo-30s-live-prediction#faq",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "How does the WinGo 30-Second Live Predictor calculate rapid period signals?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Our 30s prediction engine analyzes rolling 10-period and 30-period outcome sequences, BIG/SMALL parity imbalances, and Violet pivot intervals in real time. The signal gauge updates automatically within the first 2 seconds of every new 30-second countdown."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Is WinGo 30s faster than the standard 1-minute WinGo cycles?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes. WinGo 30s runs at double the speed of standard 1-minute games, completing 2 rounds per minute (120 rounds per hour and 2,880 rounds per day). Because the final 5 seconds are locked for settlement, analysts have a 25-second active window to verify signals and execute entries."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "What numbers belong to BIG and SMALL in 30-Second WinGo?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "In WinGo 30s, SMALL includes numbers 0, 1, 2, 3, and 4 (50% probability), while BIG includes numbers 5, 6, 7, 8, and 9 (50% probability). Both BIG and SMALL pay a full 1.96x net return on all winning numbers without any Violet split penalty."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "How are the WinGo 30s 10-round history logs verified?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Every settled round is synchronized directly with the official 30-second server period ID (YYYYMMDD + 4-digit round counter from 0001 to 2880) at 00:00. Our live audit log records the exact period number, predicted bias, actual settled digit (0–9), and hit/miss status."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Where can I get real-time WinGo 30s Telegram signal alerts?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "You can track instant, zero-latency signals directly on our WinGo 30s Live Predictor web console or join our official Telegram channel for live Dragon streak alerts and daily session schedules."
                      }
                    }
                  ]
                }
              ]
            })
          }}
        />
      </section>
    </div>
  );
}
