"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AboutPage from "./components/AboutPage";
import CalculatorTool from "./components/CalculatorTool";
import Header from "./components/Header";
import LandingPage from "./components/LandingPage";
import PatternRadarTool from "./components/PatternRadarTool";
import Sidebar from "./components/Sidebar";
import Wingo1mTool from "./components/Wingo1mTool";
import Wingo30sTool from "./components/Wingo30sTool";
import { ActiveTool, HistoricalResult } from "./types";
import { generateInitialHistory } from "./utils/wingoEngine";
import { AuthProvider } from "./context/AuthContext";
import LoginModal from "./components/LoginModal";
import { siteConfig } from "./utils/siteConfig";

const VALID_TOOLS: ActiveTool[] = [
  "landing",
  "wingo-30s",
  "wingo-1m",
  "pattern-radar",
  "calculator",
  "about",
];

export const TOOL_ROUTES: Record<ActiveTool, string> = {
  "landing": "/",
  "wingo-30s": "/wingo-30s-prediction",
  "wingo-1m": "/wingo-1-minute-prediction",
  "pattern-radar": "/wingo-pattern-radar",
  "calculator": "/wingo-calculator",
  "about": "/about",
};

export const ROUTE_TO_TOOL: Record<string, ActiveTool> = {
  "/": "landing",
  "/wingo-30s-prediction": "wingo-30s",
  "/wingo-1-minute-prediction": "wingo-1m",
  "/wingo-pattern-radar": "pattern-radar",
  "/wingo-calculator": "calculator",
  "/about": "about",
};

const TOOL_SEO: Record<
  ActiveTool,
  { title: string; description: string; canonical: string }
> = {
  "landing": {
    title: "AI Wingo Prediction & Color Signal Analytics | Wingo Logic",
    description:
      "Next-generation algorithmic AI prediction terminal for WinGo 30s & 1m rapid cycles. Real-time probability signals, pattern radars, and bankroll risk management.",
    canonical: "https://wingologic.com",
  },
  "wingo-30s": {
    title: "WinGo 30s AI Prediction & Live Analytics Terminal | Wingo Logic",
    description:
      "Track live WinGo 30-second rapid cycles with real-time AI probability signals, high-accuracy Big/Small & color forecasts, verified round history, and risk management tools.",
    canonical: "https://wingologic.com/wingo-30s-prediction",
  },
  "wingo-1m": {
    title: "WinGo 1 Minute AI Prediction & Trend Analysis | Wingo Logic",
    description:
      "Live 1-minute WinGo cycle prediction algorithm with real-time pattern detection, color forecasting, and dynamic probability analytics.",
    canonical: "https://wingologic.com/wingo-1-minute-prediction",
  },
  "pattern-radar": {
    title: "WinGo Pattern & Trend Radar - Bead Road Analytics | Wingo Logic",
    description:
      "Real-time WinGo pattern radar, streak detector, bead road matrix, and reversal probability calculator for smart predictions.",
    canonical: "https://wingologic.com/wingo-pattern-radar",
  },
  "calculator": {
    title: "WinGo Martingale & Risk Management Calculator | Wingo Logic",
    description:
      "Professional Martingale betting calculator and bankroll risk management tool for WinGo trading sessions.",
    canonical: "https://wingologic.com/wingo-calculator",
  },
  "about": {
    title: "About Wingo Logic - AI Analytics Engine & Methodology | Wingo Logic",
    description:
      "Learn about the Wingo Logic AI prediction algorithms, platform architecture, pattern recognition engines, and responsible gaming guidelines.",
    canonical: "https://wingologic.com/about",
  },
};

function HomeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const toolParam = searchParams.get("t") as ActiveTool | null;
  const initialTool: ActiveTool =
    toolParam && VALID_TOOLS.includes(toolParam) ? toolParam : "landing";

  const [activeTool, setActiveTool] = useState<ActiveTool>(initialTool);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [history, setHistory] = useState<HistoricalResult[]>([]);

  // Sync route on popstate and pathname
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname;
      if (ROUTE_TO_TOOL[pathname]) {
        setActiveTool(ROUTE_TO_TOOL[pathname]);
      }
    };
    handleLocationChange();
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // Sync searchParam changes
  useEffect(() => {
    if (toolParam && VALID_TOOLS.includes(toolParam)) {
      setActiveTool(toolParam);
    }
  }, [toolParam]);

  // Dynamic SEO & Metadata sync
  useEffect(() => {
    const seo = TOOL_SEO[activeTool];
    if (!seo) return;

    document.title = seo.title;

    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement("meta");
      descMeta.setAttribute("name", "description");
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute("content", seo.description);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", seo.canonical);
  }, [activeTool]);

  useEffect(() => {
    const loadRealHistory = async () => {
      try {
        const [res30, res1m] = await Promise.all([
          fetch("/api/wingo/history?mode=30s").then((r) => r.json()).catch(() => null),
          fetch("/api/wingo/history?mode=1m").then((r) => r.json()).catch(() => null),
        ]);
        const combined: HistoricalResult[] = [];
        if (res30?.success && Array.isArray(res30.list)) combined.push(...res30.list);
        if (res1m?.success && Array.isArray(res1m.list)) combined.push(...res1m.list);
        if (combined.length > 0) {
          setHistory(combined);
          return;
        }
      } catch {
        // fallback
      }
      setHistory(generateInitialHistory(40));
    };
    loadRealHistory();
  }, []);

  const handleSelectTool = useCallback(
    (tool: ActiveTool) => {
      setActiveTool(tool);
      const targetPath = TOOL_ROUTES[tool] || "/";
      window.history.pushState(null, "", targetPath);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  const handleAddResult = useCallback((newResult: HistoricalResult) => {
    setHistory((prev) => [newResult, ...prev.slice(0, 75)]);
  }, []);

  return (
    <div className="app-layout-root">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTool={activeTool}
        onSelectTool={handleSelectTool}
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Viewport */}
      <div className="app-main-viewport">
        {/* Top Header */}
        <Header
          activeTool={activeTool}
          onSelectTool={handleSelectTool}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Dynamic Tool Content */}
        <main
          className={`app-content-area ${activeTool === "landing" ? "!p-0 !max-w-none w-full" : ""}`}
          style={activeTool === "landing" ? { padding: 0, maxWidth: "100%", width: "100%", margin: 0 } : undefined}
        >
          {activeTool === "landing" && (
            <LandingPage onSelectTool={handleSelectTool} />
          )}

          {activeTool === "wingo-30s" && (
            <Wingo30sTool
              history={history}
              onAddResult={handleAddResult}
              onNavigateToTool={handleSelectTool as any}
            />
          )}

          {activeTool === "wingo-1m" && (
            <Wingo1mTool
              history={history}
              onAddResult={handleAddResult}
              onNavigateToTool={handleSelectTool as any}
            />
          )}

          {activeTool === "pattern-radar" && (
            <PatternRadarTool
              history={history}
              onNavigateToTool={handleSelectTool as any}
            />
          )}

          {activeTool === "calculator" && <CalculatorTool />}

          {activeTool === "about" && <AboutPage />}

          {/* Tool Dashboard Footer (Only shown when not on full Landing Page) */}
          {activeTool !== "landing" && (
            <footer className="dashboard-footer">
              <div className="footer-left">
                <div className="footer-brand-wrap">
                  <img
                    src="/wingo-logic-official-logo.png"
                    alt="Wingo Logic Official Logo"
                    className="footer-brand-logo-img"
                  />
                  <span className="footer-brand">WINGO LOGIC TOOLS</span>
                </div>
                <span className="footer-copy">
                  © 2026 Probability &amp; Strategy Analytics Suite. All rights reserved.
                </span>
              </div>
              <div className="footer-right">
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={() => handleSelectTool("about")}
                >
                  About &amp; Guide
                </button>
                <button
                  type="button"
                  className="footer-link-btn"
                  onClick={() => handleSelectTool("calculator")}
                >
                  Risk Calculator
                </button>
              </div>
            </footer>
          )}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <HomeInner />
      </Suspense>
      {/* Global Login Sheet Modal */}
      <LoginModal />
    </AuthProvider>
  );
}
