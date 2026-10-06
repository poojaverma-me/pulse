export type Speaker = "rep" | "client";
export type Turn = { speaker: Speaker; text: string };

export type Call = {
  id: string;
  company: string;
  industry: string;
  contact: { name: string; title: string };
  rep: string;
  seats: number;
  scheduled: string;
  hue: number;
  turns: Turn[];
};

export type Dist = { choice: string; probs: Record<string, number>; confidence: number };

export type Insight = {
  turn: number;
  conversion: number;
  sentiment: { score: number; probs: number[] };
  priority: Dist;
  objection: Dist;
  stage: Dist;
  nextAction: Dist;
  flags: { priceSensitive: number; decisionMaker: number; competitor: number; urgency: number; engaged: number; repAddressed: number };
  latencyMs: number;
  inputTokens: number;
  costUsd: number;
  model: string;
  error?: string;
};

export type PostCall = {
  outcome: Dist;
  dropoff: Dist;
  nextStepAgreed: number;
  moments: { need: { turn: number; p: number }; objection: { turn: number; p: number }; commitment: { turn: number; p: number } };
  scorecard: { id: string; label: string; score: number; probs: number[]; levels: string[] }[];
  latencyMs: number;
  inputTokens: number;
  costUsd: number;
};

export type HistoryCall = {
  id: string;
  company: string;
  industry: string;
  contact: string;
  rep: string;
  date: string;
  minutes: number;
  outcome: "Won" | "Follow-up" | "Lost";
  priority: string;
  dropoff: string | null;
  conversion: number;
  sentiment: number;
  scripted?: string;
};
