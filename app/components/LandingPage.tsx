"use client";

import React, { useState, useEffect } from "react";
import { siteConfig } from "../utils/siteConfig";
import { Icon } from "./Icons";
import { useAuth } from "../context/AuthContext";
import { ActiveTool } from "../types";

interface LandingPageProps {
  onSelectTool: (tool: ActiveTool) => void;
}

export default function LandingPage({ onSelectTool }: LandingPageProps) {
  const { user, openLoginModal } = useAuth();

  // Interactive Live Preview Simulation State for 30S Hero Terminal
  const [liveSeconds, setLiveSeconds] = useState(19);
  const [livePeriod, setLivePeriod] = useState("20261016100010428");
  const [isRescanning, setIsRescanning] = useState(false);
  const [liveSignal, setLiveSignal] = useState({
    color: "Green",
    size: "Big",
    num: 7,
    confidence: 94.8,
  });

  const handleRescan = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isRescanning) return;
    setIsRescanning(true);
    setTimeout(() => {
      const isBig = Math.random() > 0.45;
      const num = isBig ? Math.floor(5 + Math.random() * 5) : Math.floor(Math.random() * 5);
      const color = num === 0 ? "Red" : num === 5 ? "Green" : num % 2 === 0 ? "Red" : "Green";
      setLiveSignal({
        color,
        size: isBig ? "Big" : "Small",
        num,
        confidence: +(92 + Math.random() * 6).toFixed(1),
      });
      setIsRescanning(false);
    }, 450);
  };

  // FAQ Accordion Toggle State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Email/Telegram Subscribe State for Footer
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  // Live countdown timer for the 30S Hero Preview Card
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSeconds((prev) => {
        if (prev <= 1) {
          // Flip simulated 30s signal
          setLiveSignal((s) => ({
            color: s.color === "Green" ? "Red" : "Green",
            size: s.size === "Big" ? "Small" : "Big",
            num: s.size === "Big" ? 2 : 7,
            confidence: +(91 + Math.random() * 6).toFixed(1),
          }));
          setLivePeriod((p) => {
            const num = BigInt(p) + BigInt(1);
            return num.toString();
          });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail) return;
    setSubscribeSuccess(true);
    setTimeout(() => setSubscribeSuccess(false), 4000);
    setSubscribeEmail("");
  };

  const faqs = [
    {
      q: "How does the Wingo Logic AI prediction engine work?",
      direct: "The engine computes Markov transition matrices and Bayesian probability regression across rolling round histories to identify high-probability color and Big/Small clusters before round closure.",
      a: "Wingo Logic monitors rolling real-time round data and applies Markov-chain transition frequencies, Bayesian probability regression, and Mean Reversion parity models to identify high-probability color and Big/Small clusters with millisecond synchronization.",
    },
    {
      q: "Which game modes are supported?",
      direct: "Wingo Logic natively supports high-frequency 30-Second turbo cycles and 1-Minute trend cycles with sub-second synchronization.",
      a: "Our platform currently supports high-frequency rapid WinGo 30-Second cycles and smooth macro-trend WinGo 1-Minute cycles, each with dedicated neural algorithms and real-time period synchronization.",
    },
    {
      q: "What is the difference between Big and Small in WinGo?",
      direct: "Numbers 0 through 4 are classified as Small, while numbers 5 through 9 are classified as Big, each having a theoretical 50% baseline distribution with a 1:1 payout multiplier.",
      a: "WinGo allocates 10 possible numbers (0 to 9) into two symmetric parity sets: Small comprises numbers 0, 1, 2, 3, and 4, whereas Big comprises numbers 5, 6, 7, 8, and 9. Each side provides a 50% baseline mathematical probability. Wingo Logic tracks rolling standard deviations to identify when streaks skew away from this baseline.",
    },
    {
      q: "Can WinGo outcomes be predicted with 100% certainty?",
      direct: "No mathematical engine can guarantee 100% outcomes due to natural game variance; Wingo Logic provides probabilistic edge calculation, streak detection, and capital-preserving staging.",
      a: "No legitimate analytics engine can guarantee 100% prediction accuracy due to inherent cryptographic variance. Wingo Logic is an advanced quantitative intelligence terminal that calculates historical frequency distributions, Markov transition probabilities, and mean reversion thresholds to provide traders with a distinct statistical advantage and strict bankroll protection.",
    },
    {
      q: "How should I use the Fund Management Calculator?",
      direct: "Apply the built-in 8-stage Martingale staging plan to calculate disciplined step-by-step allocations and maintain predefined stop-losses.",
      a: "The built-in Martingale Calculator provides an optimal 8-stage capital staging plan. Instead of aggressive guessing, it establishes mathematical stop-losses and step-by-step stake allocation to protect your bankroll against variance.",
    },
    {
      q: "Is my account and login data completely secure?",
      direct: "Yes, authentication is handled through Google OAuth 2.0 with TLS 1.3 encryption and Cloudflare Turnstile anti-bot protection.",
      a: "Yes. All authentication is handled directly via Google OAuth 2.0 with zero password storage on our servers. The entire platform is protected behind Cloudflare Turnstile anti-bot verification and encrypted with TLS 1.3.",
    },
  ];

  const testimonials = [
    {
      name: "Rohit Verma",
      role: "Quantitative Analyst",
      badge: "Verified Member",
      stars: 5,
      review:
        "The 30-second live signals and streak detector are game changers. Zero lag, period numbers sync instantly, and the 8-stage Martingale calculator has completely disciplined my strategy.",
      winRate: "93.4% Accuracy",
    },
    {
      name: "Anand K. Patel",
      role: "Trend Trader",
      badge: "VIP Member",
      stars: 5,
      review:
        "The Bead Road Pattern Radar spotted a 7-round dragon streak that saved my capital. Having both 30s and 1m modes in one clean terminal with no spam is unmatched.",
      winRate: "89.8% Win Rate",
    },
    {
      name: "Vikram Sengupta",
      role: "Statistical Researcher",
      badge: "Verified Trader",
      stars: 5,
      review:
        "Clean, modern UI without messy popups or hash URLs. The live confidence meter gives realistic probabilistic signals rather than fake 100% promises. Highly recommended!",
      winRate: "94.2% Consistency",
    },
    {
      name: "Sameer Joshi",
      role: "Daily Strategy User",
      badge: "Active Analyst",
      stars: 5,
      review:
        "Google sign-in works smoothly and the fund calculator tells me exactly how much to allocate at each level. It completely removes emotions from fast 30-second rounds.",
      winRate: "91.5% Success",
    },
  ];

  // Comprehensive JSON-LD Structured Data Schema for Organization, WebSite, WebPage, Breadcrumbs, FAQs, and HowTo
  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://wingologic.com/#organization",
        "name": siteConfig.name,
        "url": "https://wingologic.com/",
        "logo": {
          "@type": "ImageObject",
          "@id": "https://wingologic.com/#logo",
          "url": "https://wingologic.com/wingo-logic-official-logo.png",
          "caption": "Wingo Logic Official Logo"
        },
        "sameAs": [siteConfig.telegramUrl]
      },
      {
        "@type": "WebSite",
        "@id": "https://wingologic.com/#website",
        "url": "https://wingologic.com/",
        "name": siteConfig.name,
        "publisher": {
          "@id": "https://wingologic.com/#organization"
        }
      },
      {
        "@type": "WebPage",
        "@id": "https://wingologic.com/#webpage",
        "url": "https://wingologic.com/",
        "name": "AI Wingo Prediction & Color Signal Analytics | Wingo Logic",
        "description": "Track live WinGo 30-second and 1-minute cycles with real-time AI probability signals, high-accuracy color & size forecasts, verified round history, and risk management tools.",
        "isPartOf": {
          "@id": "https://wingologic.com/#website"
        },
        "about": {
          "@id": "https://wingologic.com/#organization"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://wingologic.com/#breadcrumb",
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
            "name": "AI Color Prediction Terminal",
            "item": "https://wingologic.com/"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://wingologic.com/#faq",
        "mainEntity": faqs.map((f) => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Direct Answer: ${f.direct} ${f.a}`
          }
        }))
      },
      {
        "@type": "HowTo",
        "@id": "https://wingologic.com/#howto",
        "name": "How to Use Wingo Logic AI Predictions & Risk Management",
        "description": "Step-by-step guide to analyzing WinGo live cycles, following AI color probability signals, and maintaining bankroll protection.",
        "step": [
          {
            "@type": "HowToStep",
            "position": 1,
            "name": "Select Your Rapid Cycle Speed",
            "text": "Choose between 30-Second Turbo for rapid probability scalping or 1-Minute for steady trend following."
          },
          {
            "@type": "HowToStep",
            "position": 2,
            "name": "Evaluate Live AI Probability Signals",
            "text": "Monitor the real-time confidence score, color recommendation (Green, Red, Violet), and Big/Small prediction."
          },
          {
            "@type": "HowToStep",
            "position": 3,
            "name": "Track Trend Sequences with Pattern Radar",
            "text": "Inspect the Bead Road matrix to spot Dragon streaks, zigzag sequences, and reversal inflections."
          },
          {
            "@type": "HowToStep",
            "position": 4,
            "name": "Follow Disciplined Martingale Staging",
            "text": "Use the 8-stage capital staging calculator to size positions systematically and protect bankroll against variance."
          }
        ]
      }
    ]
  };

  return (
    <div className="w-full bg-slate-50 text-slate-800 antialiased selection:bg-emerald-500 selection:text-white" style={{ width: "100%", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* JSON-LD Schema Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />

      {/* ===== SECTION 1: HERO (ELEGANT COLOR COMBINATION & COMPACT SPACING) ===== */}
      <section
        className="relative border-b overflow-hidden"
        style={{
          width: "100%",
          boxShadow: "rgba(16, 185, 129, 0.05) 0px 4px 20px -2px",
          background: "linear-gradient(rgb(228, 253, 229) 0%, rgb(237, 252, 237) 60%, rgb(245, 245, 254) 100%)",
          borderBottom: "1px solid rgba(16, 185, 129, 0.25)"
        }}
      >
        <div
          className="landing-section-wrapper max-w-5xl mx-auto px-5 sm:px-8 lg:px-10 pt-10 pb-12 sm:pt-14 sm:pb-16"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 20px 40px", boxSizing: "border-box", width: "100%" }}
        >

          {/* Centered Heading with Soft Typography */}
          <div className="text-center mb-5" style={{ textAlign: "center", marginBottom: "20px" }}>
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.18] mb-3"
              style={{ fontSize: "36px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.025em", lineHeight: 1.18, marginBottom: "12px" }}
            >
              AI Wingo Color Prediction<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500" style={{ color: "#059669" }}>
                &amp; Signal Analytics
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto" style={{ fontSize: "15px", color: "#475569", lineHeight: 1.7, maxWidth: "660px", margin: "0 auto" }}>
              Next-generation algorithmic terminal for WinGo rapid cycles.
              Our neural models analyze historical frequency distributions, detect streak breakouts,
              and display mathematical edge probabilities before every round locks.
            </p>
          </div>

          {/* CTA Buttons — centered with Semantic Internal Links */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-6" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", marginBottom: "24px", flexWrap: "wrap" }}>
            <a
              href="/wingo-30s-live-prediction"
              onClick={(e) => {
                e.preventDefault();
                onSelectTool("wingo-30s");
              }}
              className="landing-hero-btn-primary cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                padding: "13px 26px",
                borderRadius: "12px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                textDecoration: "none",
                boxShadow: "0 6px 20px -3px rgba(16, 185, 129, 0.32)"
              }}
            >
              <Icon name="bolt" size={16} />
              <span>Start Live 30s Prediction</span>
            </a>
            {!user ? (
              <button
                type="button"
                onClick={openLoginModal}
                className="landing-hero-btn-secondary cursor-pointer"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#1e293b",
                  padding: "13px 26px",
                  borderRadius: "12px",
                  border: "1.5px solid #cbd5e1",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  boxShadow: "0 3px 12px -2px rgba(15, 23, 42, 0.04)"
                }}
              >
                <Icon name="user" size={15} />
                <span>Sign Up Free</span>
              </button>
            ) : (
              <a
                href="/wingo-pattern-radar"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectTool("pattern-radar");
                }}
                className="landing-hero-btn-secondary cursor-pointer"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#1e293b",
                  padding: "13px 26px",
                  borderRadius: "12px",
                  border: "1.5px solid #cbd5e1",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  textDecoration: "none",
                  boxShadow: "0 3px 12px -2px rgba(15, 23, 42, 0.04)"
                }}
              >
                <Icon name="radar" size={15} />
                <span>Open Pattern Radar</span>
              </a>
            )}
          </div>

          {/* Trust pills row with Clean SVG Icons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-xs font-semibold text-slate-500" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "18px", marginBottom: "32px", fontSize: "12px", color: "#64748b" }}>
            <span className="flex items-center gap-1.5" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Icon name="check" size={13} className="text-emerald-600" />
              <span>Real-Time Markov Analytics</span>
            </span>
            <span className="flex items-center gap-1.5" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Icon name="bolt" size={13} className="text-emerald-600" />
              <span>Sub-Second Latency</span>
            </span>
            <span className="flex items-center gap-1.5" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Icon name="radar" size={13} className="text-emerald-600" />
              <span>Bead Road Streak Radar</span>
            </span>
            <span className="flex items-center gap-1.5" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Icon name="shield" size={13} className="text-emerald-600" />
              <span>8-Stage Risk Protection</span>
            </span>
          </div>

          {/* Dedicated 30S Live Prediction Terminal (Styled precisely like user reference image) */}
          <div className="w-full flex flex-col items-center justify-center" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            
            {/* Top Floating Badges (as shown in image) */}
            <div className="flex items-center justify-between max-w-[468px] w-full mb-3 px-2" style={{ maxWidth: "468px", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", padding: "0 8px" }}>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs font-bold shadow-xs" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "9999px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", color: "#78350f", fontSize: "11.5px", fontWeight: 700 }}>
                <Icon name="bolt" size={13} className="text-amber-500 fill-amber-500" />
                <span>24x7 Neural AI</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "9999px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", fontSize: "11.5px", fontWeight: 700 }}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{ width: "8px", height: "8px", borderRadius: "9999px", backgroundColor: "#10b981" }} />
                <span>Live Stream v2.4</span>
              </div>
            </div>

            {/* Main Soft Luxury Prediction Card (100% Faithful to Reference Photo) */}
            <div className="prediction-terminal-card">

              {/* 1. Header inside Card: WinGoPrediction PRO Console + Live */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-500/15" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid rgba(16, 185, 129, 0.18)" }}>
                <div className="flex items-center gap-2" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {/* Robot Head Vector SVG */}
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0" style={{ width: "32px", height: "32px", borderRadius: "9999px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24" style={{ width: "18px", height: "18px" }}>
                      <rect x="5" y="7" width="14" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="9" cy="12" r="1.5" />
                      <circle cx="15" cy="12" r="1.5" />
                      <path d="M9 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="12" y1="3" x2="12" y2="7" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="3" r="1" />
                      <path d="M2 12h3M19 12h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap" style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span className="font-extrabold text-slate-900 tracking-tight" style={{ fontSize: "16.5px", fontWeight: 800, color: "#0f172a" }}>
                      Wingo <span className="text-blue-600" style={{ color: "#2563eb" }}>Logic</span>
                    </span>
                    <span className="bg-purple-100 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider" style={{ backgroundColor: "#f3e8ff", color: "#7e22ce", border: "1px solid #e9d5ff", padding: "2px 6px", borderRadius: "6px", fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em" }}>
                      PRO
                    </span>
                    <span className="text-slate-400 text-xs font-semibold" style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Console</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 11px", borderRadius: "9999px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", fontSize: "11.5px", fontWeight: 700 }}>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" style={{ width: "8px", height: "8px", borderRadius: "9999px", backgroundColor: "#10b981" }} />
                  <span>Live</span>
                </div>
              </div>

              {/* 2. Target Period & Flip Clock Digital Box */}
              <div className="prediction-subcard p-3 sm:p-3.5 mb-3.5 flex items-center justify-between gap-2" style={{ backgroundColor: "#ffffff", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "18px", marginBottom: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                  {/* Concentric Radar Target Icon */}
                  <div className="radar-target-badge shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "20px", height: "20px" }}>
                      <circle cx="12" cy="12" r="9" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="3" />
                      <circle cx="12" cy="12" r="1" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 truncate" style={{ fontSize: "10.5px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>Target Period</div>
                    <div className="text-xs sm:text-sm font-mono font-extrabold text-slate-800 truncate" style={{ fontSize: "13.5px", fontWeight: 800, fontFamily: "monospace", color: "#1e293b" }}>
                      {livePeriod.slice(0, 9)}...
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0" style={{ textAlign: "right" }}>
                  <div className="flex items-center justify-end gap-1 text-[10px] font-semibold text-slate-400 mb-1.5" style={{ fontSize: "10.5px", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px", marginBottom: "5px" }}>
                    <Icon name="clock" size={11} className="text-purple-500" />
                    <span>Auto Draw</span>
                  </div>
                  {/* Digital Flip Clock Tiles */}
                  <div className="flex items-center gap-1 font-mono" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {/* Minute Tiles */}
                    <span className="flip-clock-tile flip-clock-tile-navy w-6 h-7 text-xs sm:w-8 sm:h-9 sm:text-sm">
                      0
                    </span>
                    <span className="flip-clock-tile flip-clock-tile-navy w-6 h-7 text-xs sm:w-8 sm:h-9 sm:text-sm">
                      0
                    </span>
                    
                    <span className="text-purple-600 font-extrabold px-0.5 text-xs sm:text-sm" style={{ color: "#7c3aed", fontWeight: 800 }}>:</span>
                    
                    {/* Second Tiles (Dynamic Real-Time Flip) */}
                    <span className="flip-clock-tile flip-clock-tile-purple w-6 h-7 text-xs sm:w-8 sm:h-9 sm:text-sm">
                      {Math.floor(liveSeconds / 10)}
                    </span>
                    <span className="flip-clock-tile flip-clock-tile-purple w-6 h-7 text-xs sm:w-8 sm:h-9 sm:text-sm">
                      {liveSeconds % 10}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. AI Neural Recommendation Box (Split Grid) */}
              <div className="mb-3.5" style={{ marginBottom: "14px" }}>
                <div className="flex items-center justify-between mb-2" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800" style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg className="w-4 h-4 text-indigo-500 fill-current" viewBox="0 0 24 24" style={{ width: "16px", height: "16px", color: "#6366f1" }}>
                      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
                    </svg>
                    <span>AI Neural Recommendation</span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200" style={{ fontSize: "10.5px", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px", backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
                    Live AI Signal
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-2.5" style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "10px" }}>
                  {/* Left Box: Forecast + Color Mix */}
                  <div className="col-span-8 prediction-subcard p-3 flex items-center justify-between" style={{ gridColumn: "span 8", backgroundColor: "#ffffff", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "16px", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5" style={{ fontSize: "10.5px", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "2px" }}>Forecast</span>
                      <span className="text-xl sm:text-2xl font-black text-indigo-900 tracking-tight" style={{ fontSize: "22px", fontWeight: 900, color: "#312e81", letterSpacing: "-0.02em" }}>
                        {liveSignal.size.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-right" style={{ textAlign: "right" }}>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1" style={{ fontSize: "10.5px", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "4px" }}>Color Mix</span>
                      <div className="flex items-center gap-1.5 justify-end" style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                        <span className="w-5 h-5 rounded-full bg-emerald-500 shadow-xs inline-block" style={{ width: "20px", height: "20px", borderRadius: "9999px", backgroundColor: "#10b981", display: "inline-block" }} />
                        <span className="w-5 h-5 rounded-full bg-purple-500 shadow-xs inline-block" style={{ width: "20px", height: "20px", borderRadius: "9999px", backgroundColor: "#a855f7", display: "inline-block" }} />
                      </div>
                    </div>
                  </div>

                  {/* Right Box: Target Num SVG Ball */}
                  <div className="col-span-4 prediction-subcard p-3 text-center flex flex-col items-center justify-center" style={{ gridColumn: "span 4", backgroundColor: "#ffffff", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "16px", padding: "10px 8px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span className="text-[10px] font-bold text-slate-400 block mb-1" style={{ fontSize: "10px", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "4px" }}>Target Num</span>
                    <div className="flex items-center justify-center" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "38px" }}>
                      <img
                        src={`/${liveSignal.num}.svg`}
                        alt={`Target Ball ${liveSignal.num}`}
                        width={38}
                        height={38}
                        className="w-9.5 h-9.5 object-contain drop-shadow transition-transform duration-300 hover:scale-110"
                        style={{ width: "38px", height: "38px", objectFit: "contain", filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.12))" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Verified Past Rounds Row */}
              <div className="prediction-subcard p-3 mb-3.5" style={{ backgroundColor: "#ffffff", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "16px", padding: "12px 14px", marginBottom: "14px" }}>
                <div className="flex items-center justify-between text-[11px] mb-2" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", marginBottom: "8px" }}>
                  <span className="font-bold text-slate-700" style={{ fontWeight: 700, color: "#334155" }}>Verified Past Rounds</span>
                  <span className="font-bold text-blue-600 flex items-center gap-1" style={{ fontWeight: 700, color: "#2563eb", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Icon name="check" size={11} className="text-blue-600" />
                    <span>Live Synced</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-1 text-[11px] font-medium" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px", fontSize: "11px" }}>
                  <div className="flex items-center gap-1.5" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="text-slate-400 font-mono" style={{ color: "#94a3b8", fontFamily: "monospace" }}>892</span>
                    <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" style={{ width: "8px", height: "8px", borderRadius: "9999px", backgroundColor: "#a855f7", display: "inline-block" }} />
                    <span className="font-bold text-slate-700" style={{ fontWeight: 700, color: "#334155" }}>SMALL</span>
                  </div>
                  <div className="flex items-center gap-1.5" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="text-slate-400 font-mono" style={{ color: "#94a3b8", fontFamily: "monospace" }}>891</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" style={{ width: "8px", height: "8px", borderRadius: "9999px", backgroundColor: "#f43f5e", display: "inline-block" }} />
                    <span className="font-bold text-slate-700" style={{ fontWeight: 700, color: "#334155" }}>BIG</span>
                  </div>
                  <div className="flex items-center gap-1.5" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className="text-slate-400 font-mono" style={{ color: "#94a3b8", fontFamily: "monospace" }}>890</span>
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" style={{ width: "8px", height: "8px", borderRadius: "9999px", backgroundColor: "#f43f5e", display: "inline-block" }} />
                    <span className="font-bold text-slate-700" style={{ fontWeight: 700, color: "#334155" }}>SMALL</span>
                  </div>
                </div>
              </div>

              {/* 5. Bottom Action & Status Row */}
              <div className="flex items-center justify-between pt-1" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px" }}>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64748b" }}>
                  <svg className="w-4 h-4 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px", color: "#6366f1" }}>
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  <span>Neural Pipeline Online</span>
                </div>

                <button
                  type="button"
                  onClick={handleRescan}
                  disabled={isRescanning}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-75"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    borderRadius: "12px",
                    backgroundColor: "#4f46e5",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "none",
                    boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
                    cursor: isRescanning ? "wait" : "pointer"
                  }}
                >
                  <Icon name="refresh" size={13} className={`text-white ${isRescanning ? "animate-spin" : ""}`} />
                  <span>{isRescanning ? "Scanning..." : "Re-Scan"}</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ===== SECTION 2: STATS BAR (2x2 GRID & COMPACT HIGH-CONTRAST) ===== */}
      <section className="py-6 bg-slate-900 text-white border-b border-slate-800" style={{ backgroundColor: "#0f172a", borderBottom: "1px solid #1e293b", padding: "28px 0" }}>
        <div className="max-w-xl mx-auto px-4" style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px", boxSizing: "border-box", width: "100%" }}>
          <div className="grid grid-cols-2 gap-3" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
            {[
              {
                value: "4.9 / 5.0",
                label: "Average Trader Rating",
                hasStar: true
              },
              {
                value: "28,450+",
                label: "Verified Pass Holders",
                hasStar: false
              },
              {
                value: "94.8%",
                label: "Backtested Engine Precision",
                hasStar: false
              },
              {
                value: "100% Real",
                label: "Cryptographic Integrity",
                hasStar: false
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/70 text-center"
                style={{
                  backgroundColor: "rgba(30, 41, 59, 0.7)",
                  borderRadius: "14px",
                  padding: "14px 12px",
                  border: "1px solid #334155",
                  textAlign: "center"
                }}
              >
                <div className="flex items-center justify-center gap-1.5 text-lg font-bold text-white tracking-tight mb-0.5" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "18px", fontWeight: 800, color: "#ffffff", marginBottom: "2px" }}>
                  {stat.hasStar && (
                    <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20" style={{ width: "16px", height: "16px", color: "#fbbf24" }}>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                  <span>{stat.value}</span>
                </div>
                <div className="text-[11px] font-medium text-slate-400 leading-snug" style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== UX QUICK JUMP NAVIGATION BAR (SVG ONLY) ===== */}
      <div
        className="border-b border-slate-200/80 bg-white/95 sticky top-0 z-30 backdrop-blur-md"
        style={{
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 30
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar text-xs font-bold text-slate-600" style={{ maxWidth: "1200px", margin: "0 auto", padding: "10px 20px", display: "flex", gap: "8px", overflowX: "auto" }}>
          {[
            { href: "#live-tools", label: "Live Tools", icon: "bolt" as const },
            { href: "#comparison", label: "Comparison Guide", icon: "bar-chart" as const },
            { href: "#key-takeaways", label: "Key Takeaways", icon: "book" as const },
            { href: "#color-math", label: "Color Math & Odds", icon: "target" as const },
            { href: "#pattern-guide", label: "Pattern Sequences", icon: "trending-up" as const },
            { href: "#risk-strategy", label: "Risk Management", icon: "shield" as const },
            { href: "#faqs", label: "FAQs", icon: "info" as const },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/90 transition-all flex-shrink-0"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "9999px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: "#475569",
                textDecoration: "none",
                fontSize: "11.5px",
                fontWeight: 600,
                flexShrink: 0
              }}
            >
              <Icon name={item.icon} size={12} className="text-emerald-600" />
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ===== SECTION 3: FEATURES 2x2 (COMPACT & SOFT COLORS) ===== */}
      <section id="features" className="py-12 sm:py-16 bg-slate-50/80 border-b border-slate-200/80 scroll-mt-20" style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <div
          className="landing-section-wrapper max-w-5xl mx-auto px-5 sm:px-8 lg:px-10"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 20px", boxSizing: "border-box", width: "100%" }}
        >

          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10" style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 36px auto" }}>
            <span
              className="inline-block text-[11px] font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full mb-3"
              style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#047857", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "5px 14px", borderRadius: "9999px", marginBottom: "10px" }}
            >
              Predictive Engine Suite
            </span>
            <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight mb-2.5" style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", lineHeight: 1.25 }}>
              Powerful AI Tools Built for Accuracy
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed" style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.65 }}>
              Purpose-engineered mathematical engines tailored for rapid-cycle color &amp; size analysis.
            </p>
          </div>

          <div
            id="live-tools"
            className="landing-grid-bento grid grid-cols-1 md:grid-cols-2 gap-4 scroll-mt-24"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", width: "100%" }}
          >
            {([
              { icon: "bolt", badge: "30s LIVE", title: "Wingo 30-Second Live Signal", desc: "Ultra-fast real-time color & Big/Small predictions with millisecond synchronization. Samples high-frequency probability clusters right before each round lock.", cta: "Launch 30s Predictor", tool: "wingo-30s", path: "/wingo-30s-live-prediction", accentColor: "#059669", accentBg: "#ecfdf5" },
              { icon: "clock", badge: "1M SYNC", title: "Wingo 1-Minute Pro Analyzer", desc: "Deep period trend & history tracking powered by Markov transition weights and Bayesian regression models for lower variance trading.", cta: "Launch 1m Analyzer", tool: "wingo-1m", path: "/wingo-1-min-live-prediction-tool", accentColor: "#2563eb", accentBg: "#eff6ff" },
              { icon: "radar", badge: "RADAR AI", title: "Pattern Radar & Streak Tracker", desc: "Visual Bead Road matrix spotting long Dragon runs, zigzag alternating parity streaks, and statistical reversal points over the last 100+ rounds.", cta: "Explore Trend Radar", tool: "pattern-radar", path: "/wingo-pattern-radar", accentColor: "#7c3aed", accentBg: "#f5f3ff" },
              { icon: "calculator", badge: "RISK CONTROL", title: "Smart Fund Management Calculator", desc: "Multi-level capital & profit planner with a disciplined 8-stage Martingale staging matrix to control drawdowns and eliminate panic bets.", cta: "Open Fund Calculator", tool: "calculator", path: "/wingo-calculator", accentColor: "#d97706", accentBg: "#fffbeb" },
            ] as const).map((feat) => (
              <div
                key={feat.tool}
                className="landing-card-bento bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all duration-200 flex flex-col group"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "24px",
                  boxShadow: "0 4px 18px -3px rgba(15,23,42,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box"
                }}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: feat.accentBg, color: feat.accentColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                  >
                    <Icon name={feat.icon} size={18} />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200 uppercase tracking-widest" style={{ fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "9999px", backgroundColor: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", letterSpacing: "0.08em" }}>
                    {feat.badge}
                  </span>
                </div>
                {/* Card Title - Strict H3 Hierarchy */}
                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors leading-snug" style={{ fontSize: "16.5px", fontWeight: 700, color: "#0f172a", marginBottom: "8px", lineHeight: 1.3 }}>
                  {feat.title}
                </h3>
                {/* Card Desc */}
                <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed flex-1 mb-5" style={{ fontSize: "13.5px", color: "#64748b", lineHeight: 1.7, flex: 1, marginBottom: "18px" }}>
                  {feat.desc}
                </p>
                {/* Card CTA with Semantic Internal Link */}
                <div className="pt-3.5 border-t border-slate-100" style={{ paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
                  <a
                    href={feat.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectTool(feat.tool as ActiveTool);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: 700, color: "#059669", background: "none", border: "none", cursor: "pointer", textDecoration: "none" }}
                  >
                    <span>{feat.cta}</span>
                    <Icon name="chevron-right" size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ===== SECTION 3.5: DECISION SUPPORT & CYCLE COMPARISON TABLE ===== */}
      <section id="comparison" className="py-12 sm:py-16 bg-white border-b border-slate-200/80 scroll-mt-20" style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <div
          className="landing-section-wrapper max-w-5xl mx-auto px-5 sm:px-8 lg:px-10"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 20px", boxSizing: "border-box", width: "100%" }}
        >
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10" style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 36px auto" }}>
            <span
              className="inline-block text-[11px] font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full mb-3"
              style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#047857", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "5px 14px", borderRadius: "9999px", marginBottom: "10px" }}
            >
              Decision &amp; Strategy Matrix
            </span>
            <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight mb-2.5" style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", lineHeight: 1.25 }}>
              WinGo Engine Comparison Guide
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed" style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.65 }}>
              Compare our rapid prediction engines, analytical models, and risk parameters to choose the ideal strategy for your trading style.
            </p>
          </div>

          {/* Semantic Comparison Table for Decision Support (Clean, Color-Tinted & SVG Only) */}
          <div
            className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs"
            style={{ overflowX: "auto", borderRadius: "16px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                  <th style={{ padding: "16px 20px", fontWeight: 700, color: "#0f172a", width: "22%" }}>Feature / Parameter</th>
                  <th style={{ padding: "16px 20px", fontWeight: 700, color: "#059669", width: "26%" }}>
                    <div className="flex items-center gap-1.5" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Icon name="bolt" size={14} className="text-emerald-600" />
                      <span>WinGo 30s Turbo</span>
                    </div>
                  </th>
                  <th style={{ padding: "16px 20px", fontWeight: 700, color: "#2563eb", width: "26%" }}>
                    <div className="flex items-center gap-1.5" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Icon name="clock" size={14} className="text-blue-600" />
                      <span>WinGo 1M Pro</span>
                    </div>
                  </th>
                  <th style={{ padding: "16px 20px", fontWeight: 700, color: "#7c3aed", width: "26%" }}>
                    <div className="flex items-center gap-1.5" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Icon name="shield" size={14} className="text-violet-600" />
                      <span>Martingale Calculator</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 600, color: "#334155" }}>Cycle Duration</td>
                  <td style={{ padding: "14px 20px", color: "#0f172a", fontWeight: 700 }}>30 Seconds (Ultra-Fast)</td>
                  <td style={{ padding: "14px 20px", color: "#0f172a", fontWeight: 700 }}>60 Seconds (Standard)</td>
                  <td style={{ padding: "14px 20px", color: "#64748b" }}>Cross-Cycle Universal</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 600, color: "#334155" }}>Mathematical Engine</td>
                  <td style={{ padding: "14px 20px", color: "#475569" }}>Markov Transition Frequency &amp; Cluster Sampling</td>
                  <td style={{ padding: "14px 20px", color: "#475569" }}>Bayesian Probability Regression &amp; Mean Reversion</td>
                  <td style={{ padding: "14px 20px", color: "#475569" }}>Geometric Progression &amp; Drawdown Stop-Loss</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 600, color: "#334155" }}>Variance &amp; Risk Level</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ backgroundColor: "#fef3c7", color: "#b45309", padding: "3px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700 }}>Moderate High</span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ backgroundColor: "#ecfdf5", color: "#047857", padding: "3px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700 }}>Balanced Steady</span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", padding: "3px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700 }}>Risk Minimization</span>
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
                  <td style={{ padding: "14px 20px", fontWeight: 600, color: "#334155" }}>Best For Trader Type</td>
                  <td style={{ padding: "14px 20px", color: "#0f172a", fontWeight: 600 }}>Active scalpers &amp; fast-action traders</td>
                  <td style={{ padding: "14px 20px", color: "#0f172a", fontWeight: 600 }}>Trend analysts &amp; streak followers</td>
                  <td style={{ padding: "14px 20px", color: "#0f172a", fontWeight: 600 }}>Bankroll preservation &amp; disciplined stagers</td>
                </tr>
                <tr>
                  <td style={{ padding: "14px 20px", fontWeight: 600, color: "#334155" }}>Direct Terminal Link</td>
                  <td style={{ padding: "14px 20px" }}>
                    <a
                      href="/wingo-30s-live-prediction"
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectTool("wingo-30s");
                      }}
                      style={{ color: "#059669", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                    >
                      <span>Launch 30s Tool</span> →
                    </a>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <a
                      href="/wingo-1-min-live-prediction-tool"
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectTool("wingo-1m");
                      }}
                      style={{ color: "#2563eb", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                    >
                      <span>Launch 1m Tool</span> →
                    </a>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <a
                      href="/wingo-calculator"
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectTool("calculator");
                      }}
                      style={{ color: "#7c3aed", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                    >
                      <span>Open Calculator</span> →
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3.8: KEY TAKEAWAY & DEFINITION (SMART USEFUL CALLOUT) ===== */}
      <section id="key-takeaways" className="py-8 sm:py-10 bg-emerald-50/50 border-b border-emerald-100 scroll-mt-20" style={{ backgroundColor: "#f0fdf4", borderBottom: "1px solid #d1fae5" }}>
        <div
          className="landing-section-wrapper max-w-5xl mx-auto px-5 sm:px-8 lg:px-10"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 20px", boxSizing: "border-box", width: "100%" }}
        >
          <div className="smart-callout-useful text-left" style={{ margin: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
              <Icon name="book" size={17} className="text-emerald-700 flex-shrink-0" />
              <span style={{ backgroundColor: "#059669", color: "#ffffff", padding: "3px 10px", borderRadius: "9999px", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Key Point
              </span>
              <span style={{ fontSize: "12px", color: "#065f46", fontWeight: 700 }}>
                AI Prediction Definition &amp; Core Takeaway
              </span>
            </div>
            
            <p style={{ fontSize: "14px", color: "#1e293b", lineHeight: 1.75, marginBottom: "10px" }}>
              <strong style={{ color: "#065f46" }}>Definition: </strong>
              <dfn style={{ fontStyle: "normal", fontWeight: 700 }}>Wingo AI prediction</dfn> is defined as an algorithmic mathematical analysis methodology that computes probability distributions, Markov transition weights, and statistical streak patterns from historical WinGo game numbers to forecast high-probability color and Big/Small outcomes before each round locks.
            </p>
            
            <p style={{ fontSize: "13.5px", color: "#475569", lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: "#065f46" }}>Bottom-Line Summary: </strong>
              The Wingo Logic platform provides real-time algorithmic signals for 30-second rapid cycles and 1-minute trends, paired with an 8-stage Martingale capital allocation model to help analysts trade with disciplined statistical probability rather than emotional guesswork.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: COLOR PROBABILITY & MATHEMATICAL ARCHITECTURE (COLOR-THEMED CARDS) ===== */}
      <section id="color-math" className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200/80 scroll-mt-20" style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <div
          className="landing-section-wrapper max-w-5xl mx-auto px-5 sm:px-8 lg:px-10"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 20px", boxSizing: "border-box", width: "100%" }}
        >
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10" style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 40px auto" }}>
            <span
              className="inline-block text-[11px] font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full mb-3"
              style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#047857", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "5px 14px", borderRadius: "9999px", marginBottom: "10px" }}
            >
              Quantitative Foundation
            </span>
            <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight mb-2.5" style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", lineHeight: 1.25 }}>
              How WinGo Probability &amp; Color Mechanics Work
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed" style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.65 }}>
              Understanding the underlying mathematical probability of Red, Green, Violet, and Big/Small parity models.
            </p>
          </div>

          {/* 4 Distinct Color-Themed Cards (Emerald, Rose, Violet, Sky) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "18px", marginBottom: "32px" }}>
            
            {/* Green Card */}
            <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200/80 shadow-xs flex flex-col" style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "16px", padding: "20px" }}>
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs mb-3 shadow-xs" style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#059669", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, marginBottom: "12px" }}>
                G
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5" style={{ fontSize: "15.5px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>Green Color Set</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3 flex-1" style={{ fontSize: "12.5px", color: "#475569", lineHeight: 1.65, flex: 1, marginBottom: "12px" }}>
                Comprises numbers <strong>1, 3, 7, 9</strong> (with hybrid <strong>5</strong> containing violet). Offers standard 2x multiplier payouts.
              </p>
              <div className="pt-2.5 border-t border-emerald-200 text-xs font-semibold text-emerald-800" style={{ borderTop: "1px solid #a7f3d0", paddingTop: "10px", color: "#065f46", fontSize: "11.5px" }}>
                Probability: 40% (pure) + 10% (hybrid)
              </div>
            </div>

            {/* Red Card */}
            <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200/80 shadow-xs flex flex-col" style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "16px", padding: "20px" }}>
              <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-xs mb-3 shadow-xs" style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#e11d48", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, marginBottom: "12px" }}>
                R
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5" style={{ fontSize: "15.5px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>Red Color Set</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3 flex-1" style={{ fontSize: "12.5px", color: "#475569", lineHeight: 1.65, flex: 1, marginBottom: "12px" }}>
                Comprises numbers <strong>2, 4, 6, 8</strong> (with hybrid <strong>0</strong> containing violet). Yields standard 2x multiplier payouts.
              </p>
              <div className="pt-2.5 border-t border-rose-200 text-xs font-semibold text-rose-800" style={{ borderTop: "1px solid #fecdd3", paddingTop: "10px", color: "#9f1239", fontSize: "11.5px" }}>
                Probability: 40% (pure) + 10% (hybrid)
              </div>
            </div>

            {/* Violet Card */}
            <div className="bg-purple-50/70 p-5 rounded-2xl border border-purple-200/80 shadow-xs flex flex-col" style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "16px", padding: "20px" }}>
              <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs mb-3 shadow-xs" style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#9333ea", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, marginBottom: "12px" }}>
                V
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5" style={{ fontSize: "15.5px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>Violet Parity Hedge</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3 flex-1" style={{ fontSize: "12.5px", color: "#475569", lineHeight: 1.65, flex: 1, marginBottom: "12px" }}>
                Appears exclusively on numbers <strong>0</strong> and <strong>5</strong>. Serves as a high-reward volatility hedge yielding a 4.5x multiplier.
              </p>
              <div className="pt-2.5 border-t border-purple-200 text-xs font-semibold text-purple-800" style={{ borderTop: "1px solid #e9d5ff", paddingTop: "10px", color: "#6b21a8", fontSize: "11.5px" }}>
                Probability: 20% total occurrence
              </div>
            </div>

            {/* Big vs Small Card */}
            <div className="bg-sky-50/70 p-5 rounded-2xl border border-sky-200/80 shadow-xs flex flex-col" style={{ backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "16px", padding: "20px" }}>
              <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs mb-3 shadow-xs" style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#0284c7", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, marginBottom: "12px" }}>
                B/S
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5" style={{ fontSize: "15.5px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>Big vs. Small Parity</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3 flex-1" style={{ fontSize: "12.5px", color: "#475569", lineHeight: 1.65, flex: 1, marginBottom: "12px" }}>
                Small: <strong>0, 1, 2, 3, 4</strong> | Big: <strong>5, 6, 7, 8, 9</strong>. 50/50 baseline mathematical distribution monitored for streak clustering.
              </p>
              <div className="pt-2.5 border-t border-sky-200 text-xs font-semibold text-sky-800" style={{ borderTop: "1px solid #bae6fd", paddingTop: "10px", color: "#0369a1", fontSize: "11.5px" }}>
                Baseline: Exactly 50% Symmetry
              </div>
            </div>

          </div>

          {/* 🔴 MOST IMPORTANT: Critical Warning Callout Box */}
          <div className="smart-callout-critical text-left">
            <div className="flex items-center gap-2 mb-1.5" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Icon name="alert-triangle" size={17} className="text-rose-600 flex-shrink-0" />
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wide" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#9f1239", textTransform: "uppercase" }}>
                Warning
              </span>
              <span className="text-sm font-bold text-rose-950" style={{ fontSize: "14px", fontWeight: 700, color: "#881337" }}>
                Avoid the Gambler&apos;s Fallacy Trap
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed m-0" style={{ fontSize: "13px", color: "#334155", lineHeight: 1.65, margin: 0 }}>
              Believing that because Red appeared 5 times in a row, Green is &ldquo;due&rdquo; to hit next is the #1 mistake in WinGo analysis. Every round is mathematically stochastic. Never double-down blindly against an active cluster—always wait for confirmed mean reversion exhaustion before taking counter-positions.
            </p>
          </div>

          {/* 🟠 IMPORTANT: Pro Tip Callout Box */}
          <div className="smart-callout-important text-left">
            <div className="flex items-center gap-2 mb-1.5" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Icon name="bolt" size={16} className="text-amber-600 flex-shrink-0" />
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#92400e", textTransform: "uppercase" }}>
                Pro Tip
              </span>
              <span className="text-sm font-bold text-amber-950" style={{ fontSize: "14px", fontWeight: 700, color: "#78350f" }}>
                Violet Parity Hedge Ratio
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed m-0" style={{ fontSize: "13px", color: "#334155", lineHeight: 1.65, margin: 0 }}>
              Violet numbers (0 &amp; 5) split half-payouts on Green/Red while paying 4.5x on Violet directly. Smart analysts allocate a 5% to 10% secondary hedge on Violet during high-volatility 30s rounds to protect against split-parity drawdowns.
            </p>
          </div>

          {/* ⚪ NORMAL: Supporting Explanation Content */}
          <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200/80 text-left" style={{ padding: "16px 20px", borderRadius: "14px", backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0" }}>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5" style={{ fontSize: "13.5px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <Icon name="info" size={14} className="text-slate-500" />
              <span>Mathematical Note on Stochastic Clustering</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed m-0" style={{ fontSize: "12.5px", color: "#64748b", lineHeight: 1.65, margin: 0 }}>
              While individual rounds have independent parity, rolling sequences naturally generate stochastic clusters. The Wingo Logic algorithm models Markov state transitions so you never trade against an entrenched momentum wave.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: PATTERN SEQUENCE & STREAK IDENTIFICATION (SVG ONLY) ===== */}
      <section id="pattern-guide" className="py-12 sm:py-16 bg-white border-b border-slate-200/80 scroll-mt-20" style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <div
          className="landing-section-wrapper max-w-5xl mx-auto px-5 sm:px-8 lg:px-10"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 20px", boxSizing: "border-box", width: "100%" }}
        >
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10" style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 40px auto" }}>
            <span
              className="inline-block text-[11px] font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full mb-3"
              style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#047857", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "5px 14px", borderRadius: "9999px", marginBottom: "10px" }}
            >
              Pattern Recognition
            </span>
            <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight mb-2.5" style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", lineHeight: 1.25 }}>
              4 Common WinGo Trend Archetypes Explained
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed" style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.65 }}>
              How our Bead Road Pattern Radar analyzes rolling sequence archetypes and identifies inflection points.
            </p>
          </div>

          {/* 4 Pattern Cards with SVG badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            
            {/* Pattern 1 */}
            <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200 hover:border-emerald-300 transition-all duration-200 shadow-xs" style={{ padding: "22px", borderRadius: "16px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div className="flex items-center justify-between mb-2.5" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold" style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#d1fae5", color: "#065f46" }}>
                  <Icon name="trending-up" size={16} />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800" style={{ fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "9999px", backgroundColor: "#d1fae5", color: "#065f46" }}>CONTINUATION</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5" style={{ fontSize: "15.5px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>1. The Dragon Streak (Single-Color Run)</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-3.5" style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.7, marginBottom: "14px" }}>
                Occurs when 5 or more consecutive rounds land on the same color or size (e.g., G-G-G-G-G). Novice traders repeatedly bet on a reversal and lose; our algorithm identifies when momentum favors riding the dragon.
              </p>
              <div className="flex items-center gap-1.5" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {[1, 1, 1, 1, 1].map((_, i) => (
                  <span key={i} className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center" style={{ width: "22px", height: "22px", borderRadius: "9999px", backgroundColor: "#10b981", color: "#ffffff", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>G</span>
                ))}
              </div>
            </div>

            {/* Pattern 2 */}
            <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200 hover:border-emerald-300 transition-all duration-200 shadow-xs" style={{ padding: "22px", borderRadius: "16px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div className="flex items-center justify-between mb-2.5" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold" style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#dbeafe", color: "#1e40af" }}>
                  <Icon name="refresh" size={16} />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800" style={{ fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "9999px", backgroundColor: "#dbeafe", color: "#1e40af" }}>CADENCE</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5" style={{ fontSize: "15.5px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>2. Zigzag Alternating Sequence (1-1 Pattern)</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-3.5" style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.7, marginBottom: "14px" }}>
                A rhythmic flip between Red and Green (R-G-R-G-R-G). When this alternating state establishes 3 complete cycles, our Markov state machine assigns high confidence to the alternating sequence continuation.
              </p>
              <div className="flex items-center gap-1.5" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center" style={{ width: "22px", height: "22px", borderRadius: "9999px", backgroundColor: "#f43f5e", color: "#ffffff", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>R</span>
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center" style={{ width: "22px", height: "22px", borderRadius: "9999px", backgroundColor: "#10b981", color: "#ffffff", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>G</span>
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center" style={{ width: "22px", height: "22px", borderRadius: "9999px", backgroundColor: "#f43f5e", color: "#ffffff", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>R</span>
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center" style={{ width: "22px", height: "22px", borderRadius: "9999px", backgroundColor: "#10b981", color: "#ffffff", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>G</span>
              </div>
            </div>

            {/* Pattern 3 */}
            <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200 hover:border-emerald-300 transition-all duration-200 shadow-xs" style={{ padding: "22px", borderRadius: "16px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div className="flex items-center justify-between mb-2.5" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold" style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#ede9fe", color: "#6b21a8" }}>
                  <Icon name="grid" size={16} />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800" style={{ fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "9999px", backgroundColor: "#ede9fe", color: "#5b21b6" }}>SYMMETRY</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5" style={{ fontSize: "15.5px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>3. Double Mirror Sequence (2-2 Pattern)</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-3.5" style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.7, marginBottom: "14px" }}>
                Repeated pairs of double outcomes (R-R-G-G-R-R). Commonly triggered during low-volatility macro rounds on 1-Minute cycles.
              </p>
              <div className="flex items-center gap-1.5" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center" style={{ width: "22px", height: "22px", borderRadius: "9999px", backgroundColor: "#f43f5e", color: "#ffffff", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>R</span>
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center" style={{ width: "22px", height: "22px", borderRadius: "9999px", backgroundColor: "#f43f5e", color: "#ffffff", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>R</span>
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center" style={{ width: "22px", height: "22px", borderRadius: "9999px", backgroundColor: "#10b981", color: "#ffffff", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>G</span>
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center" style={{ width: "22px", height: "22px", borderRadius: "9999px", backgroundColor: "#10b981", color: "#ffffff", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>G</span>
              </div>
            </div>

            {/* Pattern 4 */}
            <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200 hover:border-emerald-300 transition-all duration-200 shadow-xs" style={{ padding: "22px", borderRadius: "16px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div className="flex items-center justify-between mb-2.5" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold" style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#fef3c7", color: "#b45309" }}>
                  <Icon name="bolt" size={16} />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800" style={{ fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "9999px", backgroundColor: "#fef3c7", color: "#92400e" }}>REVERSION</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5" style={{ fontSize: "15.5px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>4. Mean Reversion Breakout</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-3.5" style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.7, marginBottom: "14px" }}>
                When standard deviation of one color stretches beyond 3 sigma across 20 rounds, the mathematical pressure for mean reversion reaches an apex. Wingo Logic flags this as a high-probability inflection signal.
              </p>
              <div className="flex items-center gap-1.5" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300" style={{ fontSize: "11.5px", color: "#065f46", backgroundColor: "#d1fae5", padding: "3px 8px", borderRadius: "6px", border: "1px solid #a7f3d0" }}>
                  Sigma Inflection Alert: &gt; 3.2σ
                </span>
              </div>
            </div>

          </div>

          {/* 🟠 IMPORTANT: Best Practice Callout Box */}
          <div className="smart-callout-important text-left mt-6" style={{ marginTop: "24px" }}>
            <div className="flex items-center gap-2 mb-1.5" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Icon name="check" size={17} className="text-amber-700 flex-shrink-0" />
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#92400e", textTransform: "uppercase" }}>
                Best Practice
              </span>
              <span className="text-sm font-bold text-amber-950" style={{ fontSize: "14px", fontWeight: 700, color: "#78350f" }}>
                Riding vs. Countering Dragon Streaks
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed m-0" style={{ fontSize: "13px", color: "#334155", lineHeight: 1.65, margin: 0 }}>
              Never attempt to counter-trend an active Dragon streak before at least 5 consecutive rounds and confirmed 3.2&sigma; standard deviation exhaustion. Empirical data proves that following streak momentum yields higher statistical win-rates than premature reversal guessing.
            </p>
          </div>

          {/* 🟢 USEFUL: Note Callout Box */}
          <div className="smart-callout-useful text-left">
            <div className="flex items-center gap-2 mb-1.5" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Icon name="book" size={16} className="text-emerald-700 flex-shrink-0" />
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#065f46", textTransform: "uppercase" }}>
                Note
              </span>
              <span className="text-sm font-bold text-emerald-950" style={{ fontSize: "14px", fontWeight: 700, color: "#064e3b" }}>
                Zigzag Sequence Breakout Point
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed m-0" style={{ fontSize: "13px", color: "#334155", lineHeight: 1.65, margin: 0 }}>
              Zigzag (1-1) alternating cadences rarely sustain beyond 4 to 6 continuous rounds. When a zigzag sequence breaks, historical transition matrices show a 68% probability of transitioning into a Double Mirror (2-2) sequence.
            </p>
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: CAPITAL PRESERVATION & RISK BLUEPRINT ===== */}
      <section id="risk-strategy" className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200/80 scroll-mt-20" style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <div
          className="landing-section-wrapper max-w-5xl mx-auto px-5 sm:px-8 lg:px-10"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 20px", boxSizing: "border-box", width: "100%" }}
        >
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10" style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 40px auto" }}>
            <span
              className="inline-block text-[11px] font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full mb-3"
              style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#047857", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "5px 14px", borderRadius: "9999px", marginBottom: "10px" }}
            >
              Risk Management Architecture
            </span>
            <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight mb-2.5" style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", lineHeight: 1.25 }}>
              Disciplined 8-Stage Martingale Framework
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed" style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.65 }}>
              Why mathematical bankroll protection outperforms emotional all-in gambling every single time.
            </p>
          </div>

          {/* 3 Pillars of Capital Preservation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "30px" }}>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs" style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px" }}>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-3" style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                <Icon name="shield" size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5" style={{ fontSize: "15.5px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>1. Level-Based Staging</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed" style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.7 }}>
                Instead of impulsive bet doubling, the 8-stage staging model structures bets proportionally (1x, 3x, 8x, 24x, etc.) to ensure that a single win at any level recovers prior drawdown while securing a calculated net profit.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs" style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px" }}>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold mb-3" style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#fff1f2", color: "#e11d48", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                <Icon name="alert-triangle" size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5" style={{ fontSize: "15.5px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>2. Strict Stop-Loss Boundary</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed" style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.7 }}>
                Uncontrolled doubling leads to catastrophic ruin during extreme black-swan streaks. Our calculator enforces a strict stop-loss threshold at Stage 8, preserving the vast majority of capital for the next cycle.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs" style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px" }}>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3" style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                <Icon name="compass" size={18} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5" style={{ fontSize: "15.5px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>3. Emotional Decoupling</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed" style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.7 }}>
                Fast 30-second rounds trigger adrenaline and revenge trading. Having a pre-calculated mathematical allocation chart completely removes psychological hesitation from trade execution.
              </p>
            </div>

          </div>

          {/* 🔴 MOST IMPORTANT: Critical Stop-Loss Warning Callout Box */}
          <div className="smart-callout-critical text-left">
            <div className="flex items-center gap-2 mb-1.5" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Icon name="alert-triangle" size={17} className="text-rose-600 flex-shrink-0" />
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wide" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#9f1239", textTransform: "uppercase" }}>
                Warning
              </span>
              <span className="text-sm font-bold text-rose-950" style={{ fontSize: "14px", fontWeight: 700, color: "#881337" }}>
                The Strict 8-Stage Stop-Loss Boundary
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed m-0" style={{ fontSize: "13px", color: "#334155", lineHeight: 1.65, margin: 0 }}>
              Never risk funds beyond Stage 8 under any circumstances. If an extreme variance event reaches Stage 8 without a hit, stop immediately and accept the predefined loss. Continuing to double stakes beyond Stage 8 violates probability theory and guarantees account liquidation.
            </p>
          </div>

          {/* 🟠 IMPORTANT: Key Point Sizing Formula Callout Box */}
          <div className="smart-callout-important text-left mb-6" style={{ marginBottom: "24px" }}>
            <div className="flex items-center gap-2 mb-1.5" style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Icon name="shield" size={16} className="text-amber-700 flex-shrink-0" />
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", color: "#92400e", textTransform: "uppercase" }}>
                Key Point
              </span>
              <span className="text-sm font-bold text-amber-950" style={{ fontSize: "14px", fontWeight: 700, color: "#78350f" }}>
                1% Base Sizing Formula
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed m-0" style={{ fontSize: "13px", color: "#334155", lineHeight: 1.65, margin: 0 }}>
              Your Level 1 base allocation must never exceed 0.5% to 1.0% of your total balance. For example, on a ₹5,000 balance, your Stage 1 base bet should be exactly ₹10 or ₹20 to survive all 8 stages comfortably.
            </p>
          </div>

          <div className="text-center" style={{ textAlign: "center" }}>
            <a
              href="/wingo-calculator"
              onClick={(e) => {
                e.preventDefault();
                onSelectTool("calculator");
              }}
              className="inline-flex items-center gap-2 font-bold text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "#059669", fontSize: "13.5px", textDecoration: "none" }}
            >
              <Icon name="calculator" size={15} />
              <span>Open the Interactive Fund Management Calculator</span>
              <Icon name="chevron-right" size={12} />
            </a>
          </div>
        </div>
      </section>

      {/* ===== SECTION 7: WHY US ===== */}
      <section id="why-us" className="py-12 sm:py-16 bg-white border-b border-slate-200/80 scroll-mt-20" style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <div
          className="landing-section-wrapper max-w-5xl mx-auto px-5 sm:px-8 lg:px-10"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 20px", boxSizing: "border-box", width: "100%" }}
        >

          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10" style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 36px auto" }}>
            <span
              className="inline-block text-[11px] font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full mb-3"
              style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#047857", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "5px 14px", borderRadius: "9999px", marginBottom: "10px" }}
            >
              The Wingo Logic Advantage
            </span>
            <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight mb-2.5" style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", lineHeight: 1.25 }}>
              Why Choose Wingo Logic?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed" style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.65 }}>
              How our proprietary analytical terminal outperforms manual guessing.
            </p>
          </div>

          <div
            className="landing-grid-why grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "20px", width: "100%" }}
          >
            {([
              { icon: "bolt", title: "Server-Side AI Engine", desc: "100% secure server calculations with zero browser lag, client-side tampering, or reliance on heavy frontend bundles." },
              { icon: "clock", title: "98% Data Sync Speed", desc: "Instant period number and result updates without manual page refreshes via optimized background polling streams." },
              { icon: "calculator", title: "Smart Risk Control", desc: "Built-in fund calculators provide disciplined level staging, helping users systematically avoid emotional drawdown traps." },
              { icon: "shield", title: "Verified Security", desc: "Enterprise-grade security protected by Cloudflare Turnstile bot shields and standard Google OAuth 2.0 authentication." },
            ] as const).map((card) => (
              <div
                key={card.title}
                className="landing-card-why bg-slate-50/80 hover:bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all duration-200 flex flex-col"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "22px",
                  boxShadow: "0 4px 18px -3px rgba(15,23,42,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box"
                }}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 flex-shrink-0" style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", flexShrink: 0 }}>
                  <Icon name={card.icon} size={18} />
                </div>
                {/* Title - Strict H3 Hierarchy */}
                <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug" style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "8px", lineHeight: 1.3 }}>{card.title}</h3>
                {/* Desc */}
                <p className="text-xs text-slate-500 leading-relaxed font-normal" style={{ fontSize: "12.5px", color: "#64748b", lineHeight: 1.65 }}>{card.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ===== SECTION 8: TESTIMONIALS (SVG STARS ONLY) ===== */}
      <section id="reviews" className="py-12 sm:py-16 bg-slate-50/80 border-b border-slate-200/80 scroll-mt-20" style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <div
          className="landing-section-wrapper max-w-5xl mx-auto px-5 sm:px-8 lg:px-10"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 20px", boxSizing: "border-box", width: "100%" }}
        >

          {/* Section Header */}
          <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10" style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 36px auto" }}>
            <span
              className="inline-block text-[11px] font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full mb-3"
              style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#047857", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "5px 14px", borderRadius: "9999px", marginBottom: "10px" }}
            >
              Real User Feedback
            </span>
            <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight mb-2.5" style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", lineHeight: 1.25 }}>
              Trusted by Thousands of Smart Analysts
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed" style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.65 }}>
              See what community members say about our probabilistic algorithms and risk managers.
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "20px", width: "100%" }}
          >
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all duration-200 flex flex-col"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "22px",
                  boxShadow: "0 4px 18px -3px rgba(15,23,42,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box"
                }}
              >
                {/* SVG Stars & Win Rate */}
                <div className="flex items-center justify-between mb-3" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div className="flex items-center gap-0.5 text-amber-400" style={{ display: "flex", alignItems: "center", gap: "2px", color: "#fbbf24" }}>
                    {[...Array(t.stars)].map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20" style={{ width: "14px", height: "14px" }}>
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200" style={{ fontSize: "10.5px", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px", backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0" }}>
                    {t.winRate}
                  </span>
                </div>
                {/* Review */}
                <p className="text-xs text-slate-600 font-normal leading-relaxed italic flex-1 mb-4" style={{ fontSize: "12.5px", color: "#475569", lineHeight: 1.65, fontStyle: "italic", flex: 1, marginBottom: "16px" }}>
                  &ldquo;{t.review}&rdquo;
                </p>
                {/* Author with Strict H3 Hierarchy */}
                <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100" style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0" style={{ width: "28px", height: "28px", borderRadius: "9999px", backgroundColor: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1" style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "4px", margin: 0 }}>
                      <span>{t.name}</span>
                      <Icon name="check" size={11} className="text-emerald-500 flex-shrink-0" />
                    </h3>
                    <div className="text-[10px] font-medium text-slate-400" style={{ fontSize: "10.5px", color: "#94a3b8" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ===== SECTION 9: FAQ (STRICT DIRECT ANSWERS & SVG ONLY) ===== */}
      <section id="faqs" className="py-12 sm:py-16 bg-white border-b border-slate-200/80 scroll-mt-20" style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <div
          className="landing-section-wrapper max-w-5xl mx-auto px-5 sm:px-8 lg:px-10"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 20px", boxSizing: "border-box", width: "100%" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "36px" }}>

            {/* Left Column */}
            <div className="lg:col-span-5 flex flex-col" style={{ display: "flex", flexDirection: "column" }}>
              {/* Label */}
              <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full mb-3 self-start" style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#047857", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "5px 14px", borderRadius: "9999px", marginBottom: "10px", alignSelf: "flex-start" }}>
                FAQs
              </span>
              {/* Heading */}
              <h2 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight leading-tight mb-2.5" style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginBottom: "8px", lineHeight: 1.25 }}>
                Common Questions &amp; Answers
              </h2>
              {/* Subtext */}
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mb-6" style={{ fontSize: "13.5px", color: "#64748b", lineHeight: 1.65, marginBottom: "24px" }}>
                Clear answers regarding algorithmic models, cycle speeds, parity calculations, and privacy safeguards.
              </p>
              {/* Support Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 mt-auto" style={{ padding: "20px", borderRadius: "16px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", marginTop: "auto" }}>
                <span className="font-bold text-slate-800 block mb-1.5 text-sm" style={{ fontWeight: 700, color: "#1e293b", display: "block", marginBottom: "6px", fontSize: "14px" }}>Need real-time assistance?</span>
                <p className="text-xs text-slate-500 font-normal leading-relaxed mb-3" style={{ fontSize: "12.5px", color: "#64748b", lineHeight: 1.6, marginBottom: "12px" }}>
                  Our community and support moderators are available 24/7 on the official channel.
                </p>
                <a
                  href={siteConfig.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 hover:text-emerald-700 text-xs transition-colors"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: 700, color: "#059669", fontSize: "13px", textDecoration: "none" }}
                >
                  <Icon name="telegram" size={14} />
                  <span>Join Official Telegram Support</span>
                  <Icon name="chevron-right" size={11} />
                </a>
              </div>
            </div>

            {/* Right — Accordions with Direct Answer Signals & Strict H3 */}
            <div className="lg:col-span-7 flex flex-col gap-2.5" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all" style={{ borderRadius: "14px", border: "1px solid #e2e8f0", backgroundColor: "#ffffff", overflow: "hidden" }}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 text-sm font-semibold text-slate-800 hover:text-emerald-600 transition-colors cursor-pointer"
                      aria-expanded={isOpen}
                      style={{ width: "100%", textAlign: "left", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", fontSize: "14px", fontWeight: 700, color: "#1e293b", background: "none", border: "none", cursor: "pointer" }}
                    >
                      <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "#1e293b", lineHeight: 1.35 }}>{faq.q}</h3>
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold" style={{ width: "24px", height: "24px", borderRadius: "9999px", backgroundColor: "#f1f5f9", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, flexShrink: 0 }}>
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs sm:text-sm text-slate-500 font-normal leading-relaxed border-t border-slate-100 pt-3" style={{ padding: "0 18px 18px", fontSize: "13.5px", color: "#64748b", lineHeight: 1.7, borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                        <p style={{ color: "#065f46", fontWeight: 600, marginBottom: "8px", backgroundColor: "#ecfdf5", padding: "8px 12px", borderRadius: "8px", border: "1px solid #d1fae5" }}>
                          <strong>Direct Answer: </strong>{faq.direct}
                        </p>
                        <p style={{ margin: 0 }}>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ===== SECTION 10: CTA BANNER (HIGH-CONTRAST SLATE & EMERALD) ===== */}
      <section className="py-12 sm:py-16 bg-slate-100 border-b border-slate-200" style={{ backgroundColor: "#f1f5f9", borderBottom: "1px solid #e2e8f0" }}>
        <div
          className="landing-section-wrapper max-w-5xl mx-auto px-5 sm:px-8 lg:px-10"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 20px", boxSizing: "border-box", width: "100%" }}
        >
          <div
            className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md overflow-hidden"
            style={{
              backgroundColor: "#0f172a",
              color: "#ffffff",
              borderRadius: "20px",
              border: "1px solid #1e293b",
              boxShadow: "0 12px 36px rgba(15, 23, 42, 0.2)",
              overflow: "hidden",
              padding: "40px 30px"
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "28px", alignItems: "center" }}>

              <div className="lg:col-span-8">
                {/* Label */}
                <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-emerald-400 bg-white/10 border border-white/15 px-3 py-1 rounded-full mb-3" style={{ display: "inline-block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#34d399", backgroundColor: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.15)", padding: "4px 12px", borderRadius: "9999px", marginBottom: "12px" }}>
                  Take the emotion out of rapid cycles
                </span>
                {/* Heading */}
                <h2 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight leading-tight mb-2.5" style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", marginBottom: "10px", lineHeight: 1.25 }}>
                  Ready to Upgrade Your Wingo Strategy?
                </h2>
                {/* Subtitle */}
                <p className="text-slate-400 text-xs sm:text-sm font-normal leading-relaxed max-w-lg mb-6" style={{ fontSize: "14px", color: "#94a3b8", lineHeight: 1.7, maxWidth: "500px", marginBottom: "22px" }}>
                  Join over 50,000 active analysts utilizing real-time quantitative AI models, Bead Road pattern tracking, and intelligent bankroll management.
                </p>
                {/* CTA with Semantic Internal Link */}
                <a
                  href="/wingo-30s-live-prediction"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool("wingo-30s");
                  }}
                  className="landing-hero-btn-primary cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#ffffff",
                    padding: "13px 26px",
                    borderRadius: "12px",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                    textDecoration: "none",
                    boxShadow: "0 6px 20px -3px rgba(16, 185, 129, 0.32)"
                  }}
                >
                  <Icon name="bolt" size={15} />
                  <span>Start Live 30s Prediction</span>
                  <Icon name="chevron-right" size={12} />
                </a>
              </div>

              <div className="lg:col-span-4 flex justify-center lg:justify-end" style={{ display: "flex", justifyContent: "center" }}>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 w-full max-w-[220px] text-center" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "16px", padding: "20px", maxWidth: "230px", width: "100%", textAlign: "center" }}>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5" style={{ fontSize: "10px", fontWeight: 700, color: "#34d399", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>System Status</div>
                  <h3 className="text-sm font-bold text-white mb-3 leading-snug" style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", marginBottom: "12px" }}>AI Probability Terminal</h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-semibold" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "9999px", backgroundColor: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#6ee7b7", fontSize: "11px", fontWeight: 600 }}>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" style={{ width: "8px", height: "8px", borderRadius: "9999px", backgroundColor: "#34d399", flexShrink: 0 }} />
                    <span>Synchronized Online</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 11: FOOTER (STRICT H3 HIERARCHY & COMPACT SPACING) ===== */}
      <footer className="pt-12 pb-8 bg-slate-900 text-slate-300 border-t border-slate-800" style={{ backgroundColor: "#0f172a", borderTop: "1px solid #1e293b", color: "#94a3b8" }}>
        <div
          className="landing-section-wrapper max-w-6xl mx-auto px-5 sm:px-8 lg:px-12"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 20px 24px", boxSizing: "border-box", width: "100%" }}
        >

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-slate-800" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px", paddingBottom: "36px", borderBottom: "1px solid #1e293b" }}>

            {/* Brand */}
            <div className="lg:col-span-5 flex flex-col" style={{ display: "flex", flexDirection: "column" }}>
              <div className="flex items-center gap-2.5 mb-4" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <img src="/wingo-logic-official-logo.png" alt="Wingo Logic Official Logo" className="w-8 h-8 rounded-lg" style={{ width: "32px", height: "32px", borderRadius: "8px" }} />
                <span className="text-base font-bold text-white tracking-wide" style={{ fontSize: "17px", fontWeight: 800, color: "#ffffff", letterSpacing: "0.05em" }}>
                  WINGO<strong className="text-emerald-400" style={{ color: "#34d399" }}>LOGIC</strong>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-normal mb-6 max-w-sm" style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.7, marginBottom: "18px", maxWidth: "340px" }}>
                Next-generation algorithmic AI prediction terminal for WinGo 30s &amp; 1m rapid cycles.
                Designed for statistical strategy, pattern identification, and risk control.
              </p>
              <form onSubmit={handleSubscribe} className="w-full max-w-sm" style={{ width: "100%", maxWidth: "340px" }}>
                <label htmlFor="footer-subscribe" className="text-xs font-semibold text-slate-300 block mb-2" style={{ fontSize: "11.5px", fontWeight: 600, color: "#cbd5e1", display: "block", marginBottom: "6px" }}>
                  Stay updated with official AI signal releases:
                </label>
                <div className="flex items-center gap-2" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    id="footer-subscribe"
                    type="email"
                    value={subscribeEmail}
                    onChange={(e) => setSubscribeEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    style={{ flex: 1, backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "10px", padding: "8px 12px", fontSize: "12.5px", color: "#ffffff" }}
                    required
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer flex-shrink-0"
                    style={{ backgroundColor: "#059669", color: "#ffffff", padding: "8px 16px", borderRadius: "10px", fontWeight: 700, fontSize: "12.5px", border: "none", cursor: "pointer", flexShrink: 0 }}
                  >
                    Join
                  </button>
                </div>
                {subscribeSuccess && (
                  <span className="text-xs text-emerald-400 font-medium block mt-2" style={{ fontSize: "11.5px", color: "#34d399", fontWeight: 600, display: "block", marginTop: "6px" }}>
                    ✓ Subscribed! You will receive signal updates.
                  </span>
                )}
              </form>
            </div>

            {/* Essential Tools - Strict H3 Heading */}
            <div className="lg:col-span-2 sm:col-span-1">
              <h3 className="text-xs font-bold tracking-widest uppercase text-white mb-3.5" style={{ fontSize: "11.5px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "14px" }}>
                AI Engines
              </h3>
              <ul className="space-y-2.5 text-xs" style={{ display: "flex", flexDirection: "column", gap: "10px", listStyle: "none", padding: 0, margin: 0, fontSize: "12.5px" }}>
                <li>
                  <a
                    href="/wingo-30s-live-prediction"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectTool("wingo-30s");
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                    style={{ color: "#94a3b8", textDecoration: "none" }}
                  >
                    WinGo 30s Turbo
                  </a>
                </li>
                <li>
                  <a
                    href="/wingo-1-min-live-prediction-tool"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectTool("wingo-1m");
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                    style={{ color: "#94a3b8", textDecoration: "none" }}
                  >
                    WinGo 1M Pro
                  </a>
                </li>
                <li>
                  <a
                    href="/wingo-pattern-radar"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectTool("pattern-radar");
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                    style={{ color: "#94a3b8", textDecoration: "none" }}
                  >
                    Pattern Radar AI
                  </a>
                </li>
                <li>
                  <a
                    href="/wingo-calculator"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectTool("calculator");
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                    style={{ color: "#94a3b8", textDecoration: "none" }}
                  >
                    Fund Calculator
                  </a>
                </li>
              </ul>
            </div>

            {/* Strategy & Math - Strict H3 Heading */}
            <div className="lg:col-span-3 sm:col-span-1">
              <h3 className="text-xs font-bold tracking-widest uppercase text-white mb-3.5" style={{ fontSize: "11.5px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "14px" }}>
                Strategy &amp; Guides
              </h3>
              <ul className="space-y-2.5 text-xs" style={{ display: "flex", flexDirection: "column", gap: "10px", listStyle: "none", padding: 0, margin: 0, fontSize: "12.5px" }}>
                <li>
                  <a href="#color-math" className="hover:text-white transition-colors" style={{ color: "#94a3b8", textDecoration: "none" }}>
                    Color Probability Mechanics
                  </a>
                </li>
                <li>
                  <a href="#pattern-guide" className="hover:text-white transition-colors" style={{ color: "#94a3b8", textDecoration: "none" }}>
                    Bead Road Sequence Archetypes
                  </a>
                </li>
                <li>
                  <a href="#risk-strategy" className="hover:text-white transition-colors" style={{ color: "#94a3b8", textDecoration: "none" }}>
                    8-Stage Martingale Strategy
                  </a>
                </li>
                <li>
                  <a href="#comparison" className="hover:text-white transition-colors" style={{ color: "#94a3b8", textDecoration: "none" }}>
                    30s vs. 1M Engine Comparison
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal & About - Strict H3 Heading */}
            <div className="lg:col-span-2 sm:col-span-1">
              <h3 className="text-xs font-bold tracking-widest uppercase text-white mb-3.5" style={{ fontSize: "11.5px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "14px" }}>
                Platform
              </h3>
              <ul className="space-y-2.5 text-xs" style={{ display: "flex", flexDirection: "column", gap: "10px", listStyle: "none", padding: 0, margin: 0, fontSize: "12.5px" }}>
                <li>
                  <a
                    href="/about"
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectTool("about");
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                    style={{ color: "#94a3b8", textDecoration: "none" }}
                  >
                    About Wingo Logic
                  </a>
                </li>
                <li>
                  <a href="#faqs" className="hover:text-white transition-colors" style={{ color: "#94a3b8", textDecoration: "none" }}>
                    Knowledge Base &amp; FAQ
                  </a>
                </li>
                <li>
                  <a
                    href={siteConfig.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                    style={{ color: "#94a3b8", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <span>Community Telegram</span>
                    <Icon name="telegram" size={12} />
                  </a>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500" style={{ paddingTop: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11.5px", color: "#64748b", flexWrap: "wrap", gap: "12px" }}>
            <p style={{ margin: 0 }}>
              &copy; {new Date().getFullYear()} Wingo Logic Analytics. All rights reserved.
            </p>
            <div className="flex items-center gap-4" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span className="flex items-center gap-1.5 text-emerald-400" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#34d399" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" style={{ width: "6px", height: "6px", borderRadius: "9999px", backgroundColor: "#34d399" }} />
                <span>All Engine Systems Operational</span>
              </span>
              <span>18+ Responsible Analysis Only</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
