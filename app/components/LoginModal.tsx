"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Icon } from "./Icons";
import TurnstileWidget from "./TurnstileWidget";

function LoginModalContent() {
  const { closeLoginModal, loginWithGoogle, isLoggingIn, authError, setAuthError } = useAuth();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLoginModal();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeLoginModal]);

  // Strict validation: button is strictly disabled until BOTH Turnstile succeeds and Terms checkbox is checked
  const isVerified = Boolean(turnstileToken) && acceptedTerms;
  const isButtonDisabled = !isVerified || isLoggingIn;

  const handleGoogleClick = () => {
    if (isButtonDisabled || !turnstileToken) {
      return;
    }
    loginWithGoogle(turnstileToken);
  };

  return (
    <div className="login-modal-overlay" onClick={closeLoginModal} role="dialog" aria-modal="true">
      <div
        className="login-sheet-card"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Top Handle Bar for Sheet Aesthetics */}
        <div className="login-sheet-handle" />

        {/* Top Right Close Button */}
        <button
          type="button"
          onClick={closeLoginModal}
          className="login-sheet-close-btn"
          aria-label="Close dialog"
          title="Close"
        >
          <Icon name="x" size={18} />
        </button>

        {/* Top Centered Lightning Icon in Mint Container */}
        <div className="login-sheet-icon-wrap">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>

        {/* Titles */}
        <h2 className="login-sheet-title">Sign in to continue</h2>
        <p className="login-sheet-desc">
          Access live predictions and your account history.
        </p>

        {/* Auth Error Banner if any */}
        {authError && (
          <div className="login-sheet-error">
            <span>{authError}</span>
          </div>
        )}

        {/* 1. Cloudflare Turnstile Verification Widget */}
        <div className="login-sheet-turnstile-wrap">
          <TurnstileWidget
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            onSuccess={(token) => {
              setTurnstileToken(token);
              setAuthError(null);
            }}
            onExpire={() => {
              setTurnstileToken(null);
            }}
            onError={(err) => {
              console.warn("Turnstile challenge error:", err);
              setTurnstileToken(null);
            }}
          />
        </div>

        {/* 2. Terms & Privacy Policy Checkbox Row (Right below Turnstile) */}
        <label className="login-sheet-terms-label">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => {
              setAcceptedTerms(e.target.checked);
            }}
            className="login-sheet-checkbox"
          />
          <span className="login-terms-text">
            I agree to <span className="terms-highlight">Terms &amp; Privacy Policy</span>
          </span>
        </label>

        {/* 3. Sign In with Google Button (Strictly DISABLED until BOTH Turnstile & Terms are satisfied) */}
        <button
          type="button"
          onClick={handleGoogleClick}
          disabled={isButtonDisabled}
          className="login-google-btn"
          title={
            !turnstileToken
              ? "Please complete the security check above"
              : !acceptedTerms
              ? "Please agree to Terms & Privacy Policy"
              : "Sign in securely with your Google account"
          }
        >
          {isLoggingIn ? (
            <span className="login-btn-spinner" />
          ) : (
            <svg
              className="google-svg-logo"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>{isLoggingIn ? "Signing in..." : "Sign In with Google"}</span>
        </button>

        {/* Security / Privacy Footnote */}
        <div className="login-sheet-footer-note">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>Secure Google OAuth. Passwords are never stored.</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginModal() {
  const { isLoginModalOpen } = useAuth();

  if (!isLoginModalOpen) return null;

  return <LoginModalContent />;
}
