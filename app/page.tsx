"use client";

import { useCallback, useEffect, useState } from "react";
import AboutPage from "./components/AboutPage";
import CalculatorTool from "./components/CalculatorTool";
import Header from "./components/Header";
import PatternRadarTool from "./components/PatternRadarTool";
import Sidebar from "./components/Sidebar";
import Wingo1mTool from "./components/Wingo1mTool";
import Wingo30sTool from "./components/Wingo30sTool";
import WingoExtendedTool from "./components/WingoExtendedTool";
import { ActiveTool, HistoricalResult } from "./types";
import { generateInitialHistory } from "./utils/wingoEngine";
import { AuthProvider } from "./context/AuthContext";
import LoginModal from "./components/LoginModal";

export default function Home() {
  const [activeTool, setActiveTool] = useState<ActiveTool>("wingo-30s");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [history, setHistory] = useState<HistoricalResult[]>([]);

  useEffect(() => {
    // Attempt to load real live history immediately from API
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

    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "") as ActiveTool;
      const validTools: ActiveTool[] = [
        "wingo-30s",
        "wingo-1m",
        "wingo-extended",
        "pattern-radar",
        "calculator",
        "about",
      ];
      if (validTools.includes(hash)) {
        setActiveTool(hash);
      }
    }
  }, []);

  const handleSelectTool = useCallback((tool: ActiveTool) => {
    setActiveTool(tool);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${tool}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const handleAddResult = useCallback((newResult: HistoricalResult) => {
    setHistory((prev) => [newResult, ...prev.slice(0, 75)]);
  }, []);

  return (
    <AuthProvider>
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
          <main className="app-content-area">
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

            {activeTool === "wingo-extended" && (
              <WingoExtendedTool
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

            {/* Footer */}
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
          </main>
        </div>
      </div>

      {/* Global Login Sheet Modal */}
      <LoginModal />
    </AuthProvider>
  );
}
