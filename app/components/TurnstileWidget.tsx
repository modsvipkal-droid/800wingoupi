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
  siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAAFWxxYyKrc52CKmJ",
  onSuccess,
  onExpire,
  onError,
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    let pollInterval: NodeJS.Timeout | null = null;

    setHasError(false);
    setErrorMessage(null);

    const renderWidget = () => {
      if (isCancelled || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return;

      try {
        containerRef.current.innerHTML = "";

        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "light",
          size: "normal",
          "refresh-expired": "auto",
          retry: "auto",
          callback: (token: string) => {
            if (!isCancelled) {
              setHasError(false);
              setErrorMessage(null);
              onSuccess(token);
            }
          },
          "expired-callback": () => {
            if (!isCancelled) {
              onExpire?.();
            }
          },
          "error-callback": (err: unknown) => {
            console.warn("Cloudflare Turnstile challenge error:", err);
            if (!isCancelled) {
              setHasError(true);
              setErrorMessage("Security challenge could not be loaded. Please click retry.");
              onError?.(err);
            }
          },
        });

        widgetIdRef.current = id;
      } catch (err) {
        console.warn("Turnstile render error:", err);
        if (!isCancelled) {
          setHasError(true);
          setErrorMessage("Failed to initialize security challenge.");
          onError?.(err);
        }
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      pollInterval = setInterval(() => {
        if (window.turnstile) {
          if (pollInterval) clearInterval(pollInterval);
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
        renderWidget();
      };
      script.addEventListener("load", onScriptLoad);

      return () => {
        isCancelled = true;
        if (pollInterval) clearInterval(pollInterval);
        script?.removeEventListener("load", onScriptLoad);
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
      if (pollInterval) clearInterval(pollInterval);
      if (widgetIdRef.current && window.turnstile?.remove) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, retryTrigger, onSuccess, onExpire, onError]);

  const handleRetry = () => {
    if (widgetIdRef.current && window.turnstile?.remove) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {}
      widgetIdRef.current = null;
    }
    setHasError(false);
    setErrorMessage(null);
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


