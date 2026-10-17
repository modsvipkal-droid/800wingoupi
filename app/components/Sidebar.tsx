"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import { ActiveTool } from "../types";
import { Icon, IconName } from "./Icons";

interface SidebarProps {
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  id: ActiveTool;
  label: string;
  badge?: string;
  badgeColor?: "green" | "gold" | "blue" | "purple";
  iconName: IconName;
  href: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "PLATFORM",
    items: [
      { id: "landing", label: "Home Overview", badge: "PORTAL", badgeColor: "blue", iconName: "globe", href: "/" },
    ],
  },
  {
    title: "PREDICTION TOOLS",
    items: [
      { id: "wingo-30s", label: "Wingo 30 Sec Tool", badge: "30s LIVE", badgeColor: "gold", iconName: "bolt", href: "/wingo-30s-live-prediction" },
      { id: "wingo-1m", label: "Wingo 1 Min Tool", badge: "1M SYNC", badgeColor: "green", iconName: "clock", href: "/wingo-1-min-live-prediction-tool" },
    ],
  },
  {
    title: "CALCULATORS & RADAR",
    items: [
      { id: "pattern-radar", label: "Pattern & Trend Radar", badge: "HOT", badgeColor: "gold", iconName: "radar", href: "/wingo-pattern-radar" },
      { id: "calculator", label: "Martingale Calculator", badge: "RISK", badgeColor: "purple", iconName: "calculator", href: "/wingo-calculator" },
    ],
  },
  {
    title: "DOCUMENTATION",
    items: [
      { id: "about", label: "About & Documentation", badge: "GUIDE", badgeColor: "blue", iconName: "book", href: "/about" },
    ],
  },
];

function SidebarComponent({
  activeTool,
  onSelectTool,
  isOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setUtcTime(
        d.toLocaleTimeString("en-US", {
          hour12: false,
          timeZone: "UTC",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " UTC"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleItemClick = (tool: ActiveTool) => {
    onSelectTool(tool);
    onCloseMobile();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="sidebar-backdrop"
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className="app-sidebar is-open"
        aria-label="Sidebar Navigation"
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <Link
            href="/"
            className="sidebar-brand"
            onClick={(e) => {
              e.preventDefault();
              handleItemClick("landing");
            }}
          >
            <div className="sidebar-logo">
              <img
                src="/wingo-logic-official-logo.png"
                alt="Wingo Logic Official Logo"
                className="sidebar-official-logo-img"
              />
            </div>
            <div className="sidebar-brand-text">
              <span className="brand-title">
                WINGO<strong>LOGIC</strong>
              </span>
              <span className="brand-subtitle">
                TOOLS SUITE <span className="pro-tag">PRO</span>
              </span>
            </div>
          </Link>

          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onCloseMobile}
            aria-label="Close navigation"
            title="Close navigation"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {navSections.map((section, idx) => (
            <div key={idx} className="nav-group">
              {!isCollapsed && <div className="nav-group-title">{section.title}</div>}
              <ul className="nav-group-list">
                {section.items.map((item) => {
                  const isActive = activeTool === item.id;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleItemClick(item.id);
                        }}
                        className={`sidebar-nav-item ${isActive ? "is-active" : ""}`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <span className="nav-icon" aria-hidden="true">
                          <Icon name={item.iconName} size={16} />
                        </span>
                        {!isCollapsed && <span className="nav-text">{item.label}</span>}
                        {!isCollapsed && item.badge && (
                          <span className={`nav-badge badge-${item.badgeColor || "green"}`}>
                            {item.badge}
                          </span>
                        )}
                        {isActive && <span className="active-glow-bar" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-status-card">
            <div className="status-indicator-row">
              <span className="status-dot online" />
              {!isCollapsed && (
                <span className="status-text">
                  Engine Synchronized
                </span>
              )}
            </div>
            {!isCollapsed && (
              <div className="utc-clock">
                <Icon name="globe" size={12} />
                <span className="clock-digits">{utcTime || "--:--:-- UTC"}</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

const Sidebar = memo(SidebarComponent);
export default Sidebar;
