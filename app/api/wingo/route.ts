import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { WingoMode } from "@/app/types";
import {
  computePrediction,
  fetchUpstreamHistory,
  formatPeriodId,
  maskPeriodId,
} from "@/app/utils/wingoEngine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const modeParam = searchParams.get("mode");
  const mode: WingoMode = modeParam === "1m" ? "1m" : "30s";

  const upstream = await fetchUpstreamHistory(mode);
  const list = upstream.list || [];

  const now = Date.now();
  const duration = mode === "1m" ? 60 : 30;
  const msInCycle = now % (duration * 1000);
  const remaining = Math.max(0, duration - Math.floor(msInCycle / 1000));
  const safeRemaining = remaining === 0 ? duration : remaining;

  const activeIssue = list[0]?.periodId;
  let nextPeriod = formatPeriodId(new Date(now), mode);
  if (activeIssue) {
    try {
      nextPeriod = (BigInt(activeIssue) + BigInt(1)).toString();
    } catch {
      // fallback
    }
  }

  // Compute prediction strictly on the backend
  const prediction = computePrediction(nextPeriod, list, mode);

  // Extract recent 7 numbers for the radar strip (using official ball numbers 0-9)
  const recentNumbers = list.slice(0, 7).map((item) => (typeof item.number === "number" ? Math.abs(item.number) % 10 : 0));
  while (recentNumbers.length < 7) {
    recentNumbers.push(Math.floor(Math.random() * 10));
  }

  // Format last 10 rounds for Game History
  const history = list.slice(0, 10).map((item) => ({
    periodId: item.periodId,
    displayPeriod:
      item.periodId && item.periodId.length >= 8
        ? `${item.periodId.slice(0, 4)}...${item.periodId.slice(-4)}`
        : item.periodId || "—",
    number: item.number,
    category: item.category,
    color: item.color,
  }));

  return NextResponse.json(
    {
      success: true,
      mode,
      periodId: nextPeriod,
      displayDrawId: maskPeriodId(nextPeriod),
      remaining: safeRemaining,
      prediction,
      recentNumbers,
      history,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
