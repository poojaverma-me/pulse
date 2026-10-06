import type { Insight } from "./types";

export type CallEvent = { label: string; tone: "good" | "bad" | "info"; nudge: string };

const OBJECTION_NUDGE: Record<string, string> = {
  "Too expensive": "Price objection. Tie the cost to what slow support costs them today before touching the discount lever.",
  "Using a competitor": "Competitor in play. Focus on what switching unlocks, and mention free migration.",
  "Needs approval": "They need sign-off. Ask who else decides, and offer material they can forward.",
  "No budget / timing": "Budget is blocked. Offer a business case for the next budget cycle instead of pushing now.",
  "Security concerns": "Security comes first for them. Lead with the compliance pack before more features.",
  "Migration effort": "Switching feels like work. Offer the migration team and a realistic timeline.",
};

/** Turn two consecutive Jev readings into a moment worth pinning on the timeline (code, not model). */
export function eventBetween(prev: Insight | undefined, cur: Insight): CallEvent | undefined {
  const crossed = (k: keyof Insight["flags"], up = true) => (up ? (prev?.flags[k] ?? 0) < 0.5 && cur.flags[k] >= 0.5 : (prev?.flags[k] ?? 1) >= 0.5 && cur.flags[k] < 0.5);
  if (cur.objection.choice !== "None" && cur.objection.choice !== prev?.objection.choice)
    return { label: cur.objection.choice, tone: "bad", nudge: OBJECTION_NUDGE[cur.objection.choice] ?? "New objection raised." };
  if (crossed("competitor")) return { label: "Competitor mentioned", tone: "bad", nudge: OBJECTION_NUDGE["Using a competitor"] };
  if (cur.stage.choice === "Commitment" && prev?.stage.choice !== "Commitment")
    return { label: "Buying signal", tone: "good", nudge: "They're leaning in. Confirm the decision and lock a dated next step." };
  if (crossed("decisionMaker")) return { label: "Decision-maker", tone: "good", nudge: "You're talking to the person who signs. A good moment to ask for commitment." };
  if (prev && cur.conversion - prev.conversion >= 0.15) return { label: "Momentum", tone: "good", nudge: "That landed. Conversion jumped; build on the point you just made." };
  if (prev && prev.conversion - cur.conversion >= 0.15) return { label: "Risk", tone: "bad", nudge: "Conversion dropped. Pause the pitch and ask what's behind the hesitation." };
  return undefined;
}
