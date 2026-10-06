import "server-only";
import { askJev, choice, costUsd, noul, score, type ChoiceAnswer, type Question } from "./jev";
import { callState, DROPOFFS, LIVE_QUESTIONS, OUTCOMES, SCORECARD } from "./questions";
import type { Dist, Insight, PostCall, Turn } from "./types";

const dist = (a: ChoiceAnswer): Dist => ({ choice: a.choice, probs: a.probabilities, confidence: a.confidence });
const levelProbs = (probs: Record<string, number>) => Object.keys(probs).sort((a, b) => Number(a) - Number(b)).map((k) => probs[k]);

export async function analyzeTurns(company: string, turns: Turn[]): Promise<Insight> {
  const res = await askJev(callState(company, turns), LIVE_QUESTIONS);
  const a = res.answers;
  const s = score(a.sentiment);
  return {
    turn: turns.length,
    conversion: noul(a.conversion),
    sentiment: { score: s.score, probs: levelProbs(s.probabilities) },
    priority: dist(choice(a.priority)),
    objection: dist(choice(a.objection)),
    stage: dist(choice(a.stage)),
    nextAction: dist(choice(a.nextAction)),
    flags: {
      priceSensitive: noul(a.priceSensitive),
      decisionMaker: noul(a.decisionMaker),
      competitor: noul(a.competitor),
      urgency: noul(a.urgency),
      engaged: noul(a.engaged),
      repAddressed: noul(a.repAddressed),
    },
    latencyMs: res.latencyMs,
    inputTokens: res.usage.input_tokens,
    costUsd: costUsd(res.usage.input_tokens),
    model: res.model,
  };
}

/** Post-call: outcome, drop-off reason, rep scorecard, and the key turns, all in one request. */
export async function analyzeCall(company: string, turns: Turn[]): Promise<PostCall> {
  const clientTurns = turns.map((t, i) => ({ ...t, n: i + 1 })).filter((t) => t.speaker === "client");
  const turnOptions = Object.fromEntries(clientTurns.map((t) => [`turn ${t.n}`, t.text]));
  const moment = (q: string): Question => ({ type: "choice", instructions: q, criteria: turnOptions });
  const questions: Record<string, Question> = {
    outcome: { type: "choice", instructions: "How did this sales call end?", criteria: OUTCOMES },
    dropoff: { type: "choice", instructions: "If this deal is at risk or lost, what is the main reason? Choose 'Not lost' if it is progressing well.", criteria: DROPOFFS },
    nextStepAgreed: { type: "noul", instructions: "Was a concrete, dated next step agreed by the end of the call?" },
    need: moment("Which of the prospect's turns best states their main need or problem?"),
    objectionTurn: moment("Which of the prospect's turns contains their biggest objection or hesitation?"),
    commitment: moment("Which of the prospect's turns best captures where they landed at the end: their commitment, next step, or refusal?"),
    ...Object.fromEntries(SCORECARD.map((s) => [`sc_${s.id}`, { type: "score", instructions: s.question, criteria: s.levels } satisfies Question])),
  };
  const res = await askJev(callState(company, turns), questions);
  const a = res.answers;
  const pickTurn = (k: string) => {
    const c = choice(a[k]);
    return { turn: Number(c.choice.replace("turn ", "")), p: c.probabilities[c.choice] ?? 0 };
  };
  return {
    outcome: dist(choice(a.outcome)),
    dropoff: dist(choice(a.dropoff)),
    nextStepAgreed: noul(a.nextStepAgreed),
    moments: { need: pickTurn("need"), objection: pickTurn("objectionTurn"), commitment: pickTurn("commitment") },
    scorecard: SCORECARD.map((s) => {
      const sc = score(a[`sc_${s.id}`]);
      return { id: s.id, label: s.label, score: (sc.score / (s.levels.length - 1)) * 10, probs: levelProbs(sc.probabilities), levels: s.levels };
    }),
    latencyMs: res.latencyMs,
    inputTokens: res.usage.input_tokens,
    costUsd: costUsd(res.usage.input_tokens),
  };
}
