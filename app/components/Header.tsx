"use client";

import { memo, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ActiveTool } from "../types";
import { Icon } from "./Icons";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
  onToggleSidebar: () => void;
}

function HeaderComponent({
  activeTool,
  onSelectTool,
  onToggleSidebar,
}: HeaderProps) {
  const { user, openLoginModal, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleProfileClick = () => {
    if (!user) {
      openLoginModal();
    } else {
      setMenuOpen((prev) => !prev);
    }
  };

  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Live Tools", href: "#live-tools" },
    { label: "Why Us", href: "#why-us" },
    { label: "Reviews", href: "#reviews" },
    { label: "FAQs", href: "#faqs" },
  ];

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (activeTool !== "landing") {
      onSelectTool("landing");
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 120);
    } else {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="tools-header">
      {/* Left: Menu Toggle Button & Brand Link */}
      <div className="header-left flex items-center gap-3">
        <button
          type="button"
          className="header-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          title="Open Navigation"
        >
          <Icon name="menu" size={22} />
        </button>

        {/* Center: Wingo Logic Header Logo (Centered & Enlarged) */}
        <Link
          href="/"
          className="header-logo-centered flex items-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            onSelectTool("landing");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          title="Wingo Logic Home"
        >
          <img
            src="/wingo-logic-header-logo.png"
            alt="Wingo Logic"
            className="header-brand-logo-large h-9 w-auto"
          />
        </Link>
      </div>

      {/* Center: Desktop Navigation Links */}
      <nav className="header-nav-center hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={(e) => handleNavClick(e, link.href)}
            className="transition-colors hover:text-emerald-600 text-xs uppercase tracking-wider font-bold"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Right: Primary CTA + Profile Icon Button / User Dropdown */}
      <div className="header-right flex items-center gap-3" ref={menuRef}>
        <button
          type="button"
          onClick={() => onSelectTool("wingo-30s")}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-500/20 active:scale-95"
          title="Launch 30s Real-Time Terminal"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span>{activeTool === "wingo-30s" ? "Signal Live" : "Launch Terminal"}</span>
        </button>

        <button
          type="button"
          onClick={handleProfileClick}
          className={`header-profile-btn ${user ? "is-logged-in" : ""}`}
          title={user ? (user.displayName || user.email || "Account Profile") : "Sign In with Google"}
          aria-label="Account Profile"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "User"}
              className="header-user-avatar-img"
              referrerPolicy="no-referrer"
            />
          ) : user ? (
            <span className="header-user-initial">{userInitial}</span>
          ) : (
            <Icon name="user" size={19} />
          )}
          {user && <span className="header-user-status-dot" />}
        </button>

        {/* Logged In User Dropdown Menu */}
        {user && menuOpen && (
          <div className="header-profile-dropdown" role="menu">
            <div className="profile-dropdown-user-info">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="dropdown-avatar-img"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="dropdown-avatar-initial">{userInitial}</div>
              )}
              <div className="dropdown-user-details">
                <span className="dropdown-user-name">
                  {user.displayName || "Google User"}
                </span>
                <span className="dropdown-user-email">{user.email}</span>
                <span className="dropdown-verified-badge">
                  <span className="verified-dot" /> Verified Member
                </span>
              </div>
            </div>

            <div className="profile-dropdown-divider" />

            <button
              type="button"
              className="profile-dropdown-logout-btn"
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

const Header = memo(HeaderComponent);
export default Header;
