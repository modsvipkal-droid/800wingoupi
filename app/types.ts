export type ResultCategory = "Big" | "Small";
export type ResultColor = "Green" | "Red" | "Violet";
export type WingoMode = "30s" | "1m";

export type ActiveTool =
  | "landing"
  | "wingo-30s"
  | "wingo-1m"
  | "pattern-radar"
  | "calculator"
  | "about";

export interface Prediction {
  periodId: string;
  category: ResultCategory;
  number: number;
  color: ResultColor;
  confidence: number;
  strategy: string;
  suggestedNumbers: number[];
  riskLevel: "Low" | "Medium" | "High";
  timestamp?: string;
}

export interface HistoricalResult {
  periodId: string;
  category: ResultCategory;
  number: number;
  color: ResultColor;
  mode: WingoMode;
  status: "Completed";
  recordedAt: string;
}

export interface MartingaleStage {
  stage: number;
  bet: number;
  cumulative: number;
  payout: number;
  profit: number;
  riskRating: "Safe" | "Moderate" | "Aggressive" | "Critical";
}

export type DataSource = "demo" | "live";
