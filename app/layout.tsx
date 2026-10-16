import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import TelegramFab from "./components/TelegramFab";
import Script from "next/script";

const nunitoBlack = localFont({
  src: "../public/font/Nunito-Black.ttf",
  variable: "--font-nunito-black",
  display: "swap",
});

const plusJakartaSansBold = localFont({
  src: "../public/font/PlusJakartaSans-Bold.ttf",
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wingologic.com";

export const viewport: Viewport = {
  themeColor: "#050b14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AI Wingo Prediction & Color Signal Analytics | Wingo Logic",
    template: "%s | Wingo Logic",
  },
  description:
    "Track live WinGo 30-second and 1-minute cycles with real-time AI probability signals, high-accuracy color & size forecasts, verified round history, and risk management tools.",
  applicationName: "Wingo Logic",
  authors: [{ name: "Wingo Logic Team", url: siteUrl }],
  generator: "Next.js",
  keywords: [
    "Wingo prediction",
    "Wingo 30s prediction",
    "Wingo 1m prediction",
    "Wingo logic",
    "Wingo AI signals",
    "Wingo color prediction",
    "Big Small prediction algorithm",
    "Martingale risk calculator",
    "Bead road trend radar",
    "Wingo analytics terminal",
    "wingologic.com",
  ],
  alternates: {
    canonical: siteUrl.replace(/\/+$/, ""),
  },
  openGraph: {
    title: "AI Wingo Prediction & Color Signal Analytics | Wingo Logic",
    description:
      "Track live WinGo 30-second and 1-minute cycles with real-time AI probability signals, high-accuracy color & size forecasts, verified round history, and risk calculators.",
    url: siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`,
    siteName: "Wingo Logic",
    images: [
      {
        url: "/wingo-logic-official-logo.png",
        width: 1200,
        height: 630,
        alt: "Wingo Logic - WinGo 30s & 1m AI Prediction & Live Analytics Terminal",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Wingo Prediction & Color Signal Analytics | Wingo Logic",
    description:
      "Live AI probability signals, high-accuracy color and size forecasts for WinGo rapid cycles.",
    images: ["/wingo-logic-official-logo.png"],
    creator: "@wingologic",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/wingo-logic-official-logo.png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/wingo-logic-official-logo.png",
    apple: "/wingo-logic-official-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${nunitoBlack.variable} ${plusJakartaSansBold.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        {children}
        <TelegramFab />
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
