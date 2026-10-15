"use client";

import { memo, useEffect, useRef, useState } from "react";
import { ActiveTool } from "../types";
import { Icon } from "./Icons";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
  onToggleSidebar: () => void;
}

function HeaderComponent({
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

  return (
    <header className="tools-header">
      {/* Left: Menu Toggle Button */}
      <div className="header-left">
        <button
          type="button"
          className="header-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          title="Open Navigation"
        >
          <Icon name="menu" size={22} />
        </button>
      </div>

      {/* Center: Wingo Logic Header Logo (Centered & Enlarged) */}
      <div
        className="header-logo-centered"
        onClick={() => onSelectTool("wingo-30s")}
        role="button"
        tabIndex={0}
        title="Wingo Logic Home"
      >
        <img
          src="/wingo-logic-header-logo.png"
          alt="Wingo Logic"
          className="header-brand-logo-large"
        />
      </div>

      {/* Right: Profile Icon Button / User Dropdown */}
      <div className="header-right" ref={menuRef}>
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
