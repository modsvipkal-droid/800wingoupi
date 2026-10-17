"use client";

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: (error?: unknown) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
          action?: string;
          cData?: string;
          "refresh-expired"?: "auto" | "manual" | "never";
          retry?: "auto" | "never";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

interface TurnstileWidgetProps {
  siteKey?: string;
  onSuccess: (token: string) => void;
  onExpire?: () => void;
  onError?: (error?: unknown) => void;
  className?: string;
}

export default function TurnstileWidget({
  siteKey,
  onSuccess,
  onExpire,
  onError,
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Stable refs for callbacks to prevent infinite re-render / refresh loops
  const onSuccessRef = useRef(onSuccess);
  const onExpireRef = useRef(onExpire);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Guaranteed fallback site key
  const activeSiteKey =
    (siteKey && siteKey.trim()) ||
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
    "0x4AAAAAAFWxxYyKrc52CKmJ";

  useEffect(() => {
    isMountedRef.current = true;
    let isCancelled = false;
    let pollInterval: NodeJS.Timeout | null = null;
    let timeoutTimer: NodeJS.Timeout | null = null;

    const renderWidget = () => {
      if (isCancelled || !containerRef.current || !window.turnstile) return;
      // Do not re-render if already rendered and widget ID exists
      if (widgetIdRef.current) return;

      try {
        containerRef.current.innerHTML = "";

        const id = window.turnstile.render(containerRef.current, {
          sitekey: activeSiteKey,
          theme: "light",
          size: "normal",
          "refresh-expired": "auto",
          retry: "never", // Strictly disable auto-retrying in an infinite loop on failure
          callback: (token: string) => {
            if (!isCancelled && isMountedRef.current) {
              setHasError(false);
              setErrorMessage(null);
              onSuccessRef.current?.(token);
            }
          },
          "expired-callback": () => {
            if (!isCancelled && isMountedRef.current) {
              onExpireRef.current?.();
            }
          },
          "error-callback": (err: unknown) => {
            console.warn("Cloudflare Turnstile challenge error:", err);
            if (!isCancelled && isMountedRef.current) {
              setHasError(true);
              setErrorMessage("Security check could not be completed. Please click retry.");
              onErrorRef.current?.(err);
            }
          },
        });

        widgetIdRef.current = id;
      } catch (err) {
        console.warn("Turnstile render error:", err);
        if (!isCancelled && isMountedRef.current) {
          setHasError(true);
          setErrorMessage("Failed to initialize security challenge.");
          onErrorRef.current?.(err);
        }
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      pollInterval = setInterval(() => {
        if (window.turnstile) {
          if (pollInterval) clearInterval(pollInterval);
          if (timeoutTimer) clearTimeout(timeoutTimer);
          renderWidget();
        }
      }, 50);

      // Check if Cloudflare script tag exists
      let script = document.querySelector<HTMLScriptElement>(
        'script[src*="challenges.cloudflare.com/turnstile"]'
      );
      if (!script) {
        script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        document.head.appendChild(script);
      }

      const onScriptLoad = () => {
        if (pollInterval) clearInterval(pollInterval);
        if (timeoutTimer) clearTimeout(timeoutTimer);
        renderWidget();
      };

      const onScriptError = () => {
        if (pollInterval) clearInterval(pollInterval);
        if (timeoutTimer) clearTimeout(timeoutTimer);
        if (!isCancelled && isMountedRef.current) {
          setHasError(true);
          setErrorMessage("Security check was blocked. Please disable ad-blockers and retry.");
          onErrorRef.current?.(new Error("Turnstile script load failed"));
        }
      };

      script.addEventListener("load", onScriptLoad);
      script.addEventListener("error", onScriptError);

      // 10s fallback timeout if Turnstile CDN cannot be reached
      timeoutTimer = setTimeout(() => {
        if (!window.turnstile && !isCancelled && isMountedRef.current) {
          if (pollInterval) clearInterval(pollInterval);
          setHasError(true);
          setErrorMessage("Security check timed out. Please check your internet connection.");
          onErrorRef.current?.(new Error("Turnstile timeout"));
        }
      }, 10000);

      return () => {
        isCancelled = true;
        isMountedRef.current = false;
        if (pollInterval) clearInterval(pollInterval);
        if (timeoutTimer) clearTimeout(timeoutTimer);
        script?.removeEventListener("load", onScriptLoad);
        script?.removeEventListener("error", onScriptError);
        if (widgetIdRef.current && window.turnstile?.remove) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {}
          widgetIdRef.current = null;
        }
      };
    }

    return () => {
      isCancelled = true;
      isMountedRef.current = false;
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (widgetIdRef.current && window.turnstile?.remove) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [activeSiteKey, retryTrigger]);

  const handleRetry = () => {
    setHasError(false);
    setErrorMessage(null);
    if (widgetIdRef.current && window.turnstile?.reset) {
      try {
        window.turnstile.reset(widgetIdRef.current);
        return;
      } catch {
        // Fallback to remove and re-render
      }
    }
    if (widgetIdRef.current && window.turnstile?.remove) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {}
      widgetIdRef.current = null;
    }
    setRetryTrigger((c) => c + 1);
  };

  return (
    <div
      className={className}
      style={{
        minHeight: "65px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Cloudflare Turnstile Official Widget Container */}
      <div
        ref={containerRef}
        style={{
          display: hasError ? "none" : "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "65px",
          width: "100%",
        }}
      />

      {/* Error state with Retry button if network fails */}
      {hasError && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "12px", color: "#b91c1c", fontWeight: 500 }}>
            {errorMessage || "Security check connection issue."}
          </span>
          <button
            type="button"
            onClick={handleRetry}
            style={{
              fontSize: "12px",
              padding: "5px 12px",
              borderRadius: "6px",
              background: "#ffffff",
              border: "1px solid #d1d5db",
              cursor: "pointer",
              fontWeight: 600,
              color: "#374151",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            ↻ Retry Security Check
          </button>
        </div>
      )}
    </div>
  );
}


