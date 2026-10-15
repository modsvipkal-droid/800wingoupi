import React from "react";

export type IconName =
  | "bolt"
  | "clock"
  | "hourglass"
  | "radar"
  | "calculator"
  | "book"
  | "shield"
  | "copy"
  | "check"
  | "bell"
  | "lock"
  | "target"
  | "bar-chart"
  | "compass"
  | "flame"
  | "snowflake"
  | "alert-triangle"
  | "trending-up"
  | "trending-down"
  | "crown"
  | "menu"
  | "close"
  | "chevron-down"
  | "chevron-right"
  | "chevron-left"
  | "arrow-right"
  | "refresh"
  | "globe"
  | "info"
  | "grid"
  | "share"
  | "telegram"
  | "volume"
  | "user"
  | "x";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 18, className = "" }: IconProps) {
  const shared = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const renderPath = () => {
    switch (name) {
      case "bolt":
        return <polygon {...shared} points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />;
      case "clock":
        return (
          <>
            <circle {...shared} cx="12" cy="12" r="10" />
            <polyline {...shared} points="12 6 12 12 16 14" />
          </>
        );
      case "hourglass":
        return (
          <>
            <path {...shared} d="M5 22h14M5 2h14" />
            <path {...shared} d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
            <path {...shared} d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
          </>
        );
      case "radar":
      case "target":
        return (
          <>
            <circle {...shared} cx="12" cy="12" r="10" />
            <circle {...shared} cx="12" cy="12" r="6" />
            <circle {...shared} cx="12" cy="12" r="2" />
          </>
        );
      case "calculator":
        return (
          <>
            <rect {...shared} x="4" y="2" width="16" height="20" rx="2" />
            <line {...shared} x1="8" y1="6" x2="16" y2="6" />
            <line {...shared} x1="16" y1="14" x2="16" y2="18" />
            <path {...shared} d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
          </>
        );
      case "book":
        return (
          <>
            <path {...shared} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path {...shared} d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </>
        );
      case "shield":
        return <path {...shared} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
      case "copy":
        return (
          <>
            <rect {...shared} x="9" y="9" width="13" height="13" rx="2" />
            <path {...shared} d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </>
        );
      case "check":
        return <polyline {...shared} points="20 6 9 17 4 12" />;
      case "bell":
        return (
          <>
            <path {...shared} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path {...shared} d="M13.73 21a2 2 0 0 1-3.46 0" />
          </>
        );
      case "lock":
        return (
          <>
            <rect {...shared} x="3" y="11" width="18" height="11" rx="2" />
            <path {...shared} d="M7 11V7a5 5 0 0 1 10 0v4" />
          </>
        );
      case "bar-chart":
        return (
          <>
            <line {...shared} x1="12" y1="20" x2="12" y2="10" />
            <line {...shared} x1="18" y1="20" x2="18" y2="4" />
            <line {...shared} x1="6" y1="20" x2="6" y2="16" />
          </>
        );
      case "compass":
        return (
          <>
            <circle {...shared} cx="12" cy="12" r="10" />
            <polygon {...shared} points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </>
        );
      case "flame":
        return (
          <path
            {...shared}
            d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
          />
        );
      case "snowflake":
        return (
          <>
            <line {...shared} x1="12" y1="2" x2="12" y2="22" />
            <line {...shared} x1="20" y1="12" x2="4" y2="12" />
            <line {...shared} x1="17.657" y1="6.343" x2="6.343" y2="17.657" />
            <line {...shared} x1="17.657" y1="17.657" x2="6.343" y2="6.343" />
          </>
        );
      case "alert-triangle":
        return (
          <>
            <path {...shared} d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line {...shared} x1="12" y1="9" x2="12" y2="13" />
            <line {...shared} x1="12" y1="17" x2="12.01" y2="17" />
          </>
        );
      case "trending-up":
        return (
          <>
            <polyline {...shared} points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline {...shared} points="17 6 23 6 23 12" />
          </>
        );
      case "trending-down":
        return (
          <>
            <polyline {...shared} points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline {...shared} points="17 18 23 18 23 12" />
          </>
        );
      case "crown":
        return (
          <path
            {...shared}
            d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5z"
          />
        );
      case "menu":
        return (
          <>
            <line {...shared} x1="3" y1="12" x2="21" y2="12" />
            <line {...shared} x1="3" y1="6" x2="21" y2="6" />
            <line {...shared} x1="3" y1="18" x2="21" y2="18" />
          </>
        );
      case "close":
        return (
          <>
            <line {...shared} x1="18" y1="6" x2="6" y2="18" />
            <line {...shared} x1="6" y1="6" x2="18" y2="18" />
          </>
        );
      case "chevron-down":
        return <polyline {...shared} points="6 9 12 15 18 9" />;
      case "chevron-right":
        return <polyline {...shared} points="9 18 15 12 9 6" />;
      case "chevron-left":
        return <polyline {...shared} points="15 18 9 12 15 6" />;
      case "arrow-right":
        return (
          <>
            <line {...shared} x1="5" y1="12" x2="19" y2="12" />
            <polyline {...shared} points="12 5 19 12 12 19" />
          </>
        );
      case "refresh":
        return (
          <>
            <polyline {...shared} points="23 4 23 10 17 10" />
            <polyline {...shared} points="1 20 1 14 7 14" />
            <path {...shared} d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </>
        );
      case "globe":
        return (
          <>
            <circle {...shared} cx="12" cy="12" r="10" />
            <line {...shared} x1="2" y1="12" x2="22" y2="12" />
            <path {...shared} d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </>
        );
      case "info":
        return (
          <>
            <circle {...shared} cx="12" cy="12" r="10" />
            <line {...shared} x1="12" y1="16" x2="12" y2="12" />
            <line {...shared} x1="12" y1="8" x2="12.01" y2="8" />
          </>
        );
      case "grid":
        return (
          <>
            <rect {...shared} x="3" y="3" width="7" height="7" />
            <rect {...shared} x="14" y="3" width="7" height="7" />
            <rect {...shared} x="14" y="14" width="7" height="7" />
            <rect {...shared} x="3" y="14" width="7" height="7" />
          </>
        );
      case "share":
        return (
          <>
            <circle {...shared} cx="18" cy="5" r="3" />
            <circle {...shared} cx="6" cy="12" r="3" />
            <circle {...shared} cx="18" cy="19" r="3" />
            <line {...shared} x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line {...shared} x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </>
        );
      case "telegram":
        return (
          <path
            d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.313 4.693c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"
            fill="currentColor"
          />
        );
      case "volume":
        return (
          <>
            <polygon {...shared} points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path {...shared} d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </>
        );
      case "user":
        return (
          <>
            <path {...shared} d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle {...shared} cx="12" cy="7" r="4" />
          </>
        );
      case "x":
        return (
          <>
            <line {...shared} x1="18" y1="6" x2="6" y2="18" />
            <line {...shared} x1="6" y1="6" x2="18" y2="18" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      style={{ flex: "none", verticalAlign: "middle" }}
    >
      {renderPath()}
    </svg>
  );
}
