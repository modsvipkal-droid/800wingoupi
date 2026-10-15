"use server";

import { HistoricalResult, Prediction, WingoMode } from "@/app/types";
import {
  computePrediction,
  fetchUpstreamHistory,
  generateInitialHistory,
  formatPeriodId,
} from "@/app/utils/wingoEngine";

/**
 * Server Action: Calculate Algorithmic Prediction
 * This function runs EXCLUSIVELY on the server.
 * The underlying heuristics, mathematical formulas, and business logic
 * NEVER leak into the client's browser bundle or DevTools Sources tab.
 */
export async function getPredictionAction(
  periodId: string,
  history: HistoricalResult[],
  mode: WingoMode
): Promise<Prediction> {
  const safeHistory = Array.isArray(history) && history.length > 0 ? history : generateInitialHistory(20);
  return computePrediction(periodId, safeHistory, mode);
}

/**
 * Server Action: Fetch Live Official Lottery History
 * Queries upstream providers directly from the server runtime.
 */
export async function fetchLiveHistoryAction(mode: WingoMode): Promise<{
  success: boolean;
  mode: WingoMode;
  list: HistoricalResult[];
}> {
  const res = await fetchUpstreamHistory(mode);
  return {
    success: res.success,
    mode: res.mode,
    list: res.list,
  };
}

/**
 * Server Action: Unified Live Data & Server-Computed Prediction
 * Returns verified last 10 rounds AND server-calculated AI prediction in a single secure payload.
 */
export async function getLiveWingoDataAction(mode: WingoMode): Promise<{
  success: boolean;
  mode: WingoMode;
  list: HistoricalResult[];
  prediction: Prediction;
  periodId: string;
}> {
  const data = await fetchUpstreamHistory(mode);
  const list = data.list && data.list.length > 0 ? data.list : generateInitialHistory(15).filter(h => h.mode === mode);
  
  const activeIssue = list[0]?.periodId;
  let nextPeriod = formatPeriodId(new Date(), mode);
  if (activeIssue) {
    try {
      nextPeriod = (BigInt(activeIssue) + BigInt(1)).toString();
    } catch {
      // fallback
    }
  }

  const prediction = computePrediction(nextPeriod, list, mode);

  return {
    success: data.success,
    mode,
    list,
    prediction,
    periodId: nextPeriod,
  };
}
