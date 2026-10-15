import { NextRequest, NextResponse } from "next/server";
import { WingoMode } from "@/app/types";
import { fetchUpstreamHistory } from "@/app/services/serverPredictionService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const modeParam = searchParams.get("mode");
  const mode: WingoMode = modeParam === "1m" ? "1m" : "30s";

  const result = await fetchUpstreamHistory(mode);
  return NextResponse.json(result, { status: 200 });
}
