import type { Question } from "./jev";
import { SELLER } from "./calls";
import type { Turn } from "./types";

export const PRIORITIES: Record<string, string> = {
  "Price / budget": "Cost, discounts, staying within budget",
  "Service quality": "Great customer experience, fast and friendly answers",
  "Speed to launch": "Getting live quickly, deadlines, timelines",
  "Security & compliance": "Data protection, regulations, certifications",
  Integrations: "Working with their existing tools and systems",
  Features: "Specific capabilities and functionality",
};

export const OBJECTIONS: Record<string, string> = {
  None: "No objection raised so far",
  "Too expensive": "Price is higher than they want to pay",
  "Using a competitor": "Happy enough with, or locked into, another vendor",
  "Needs approval": "Others must sign off before deciding",
  "No budget / timing": "No money or the timing is wrong right now",
  "Security concerns": "Worried about data protection or compliance",
  "Migration effort": "Switching would take too much work",
};

export const STAGES: Record<string, string> = {
  Discovery: "Still describing problems and needs",
  Evaluation: "Comparing capabilities, asking how it works",
  Negotiation: "Discussing price, terms or approvals",
  Commitment: "Agreeing to buy or to a concrete next step",
};

export const ACTIONS: Record<string, string> = {
  "Ask a discovery question": "Learn more about their situation before pitching",
  "Quantify the ROI": "Tie the price to money they lose today",
  "Offer flexible pricing": "Annual billing, a smaller plan, or a price lock",
  "Highlight support & SLA": "Reassure them about service quality and reliability",
  "Share security documentation": "Address compliance and data-protection worries",
  "Propose a pilot": "Lower the risk with a time-boxed trial",
  "Loop in the decision-maker": "Get the person who signs involved",
  "Differentiate from competitor": "Explain why switching is worth it",
  "Ask for the close": "They're ready; secure the commitment and next step",
};

export const SENTIMENT_LEVELS = ["Very negative", "Negative", "Neutral", "Positive", "Very positive"];

export function callState(company: string, turns: Turn[]) {
  return {
    seller: `${SELLER.name}, ${SELLER.product}`,
    prospect_company: company,
    transcript: turns.map((t, i) => ({ turn: i + 1, speaker: t.speaker === "rep" ? "Sales rep" : "Prospect", text: t.text })),
  };
}

/** Everything the live console asks Jev after each turn, fanned out in one request. */
export const LIVE_QUESTIONS: Record<string, Question> = {
  conversion: {
    type: "noul",
    instructions: "Judging by the conversation so far, is this prospect likely to buy?",
    criteria: { true: "Strong buying signals, needs met, clear path to purchase", false: "Weak interest, blockers, or likely to walk away" },
  },
  sentiment: { type: "score", instructions: "How does the prospect feel about the product and the conversation right now, especially in their latest message?", criteria: SENTIMENT_LEVELS },
  priority: { type: "choice", instructions: "What does the prospect care about most when choosing a vendor?", criteria: PRIORITIES },
  objection: { type: "choice", instructions: "What is the prospect's main objection or blocker at this point?", criteria: OBJECTIONS },
  stage: { type: "choice", instructions: "What stage has this sales conversation reached?", criteria: STAGES },
  nextAction: {
    type: "choice",
    instructions: "Based on the conversation so far, especially the prospect's latest message, what should the sales rep do next?",
    criteria: ACTIONS,
  },
  priceSensitive: { type: "noul", instructions: "Is the prospect price-sensitive or budget-conscious?" },
  decisionMaker: { type: "noul", instructions: "Is the prospect the person who makes or signs off the buying decision?" },
  competitor: { type: "noul", instructions: "Has the prospect mentioned using or considering a competing vendor?" },
  urgency: { type: "noul", instructions: "Does the prospect have urgency or a deadline?" },
  engaged: { type: "noul", instructions: "Is the prospect engaged and asking questions, rather than disengaging?" },
  repAddressed: { type: "noul", instructions: "Has the sales rep directly addressed the prospect's most recent concern?" },
};

export const OUTCOMES: Record<string, string> = {
  Won: "The prospect committed to buy or to sign",
  "Follow-up": "A concrete next step was agreed but no purchase yet (pilot, review, meeting)",
  Lost: "The prospect declined or postponed with no real next step",
};

export const DROPOFFS: Record<string, string> = {
  "Not lost": "The deal is progressing",
  "Price too high": "Cost was the deciding problem",
  "Chose a competitor": "Staying with or choosing another vendor",
  "No budget this cycle": "No money available until a later budget period",
  "No decision-maker buy-in": "The people who sign were not convinced or involved",
  "Missing feature": "The product lacked something they needed",
  "Bad timing": "Other priorities came first",
};

export const SCORECARD: { id: string; label: string; question: string; levels: string[] }[] = [
  { id: "discovery", label: "Discovery", question: "How well did the sales rep uncover the prospect's needs before pitching?", levels: ["Pitched blindly", "Few questions", "Some discovery", "Good discovery", "Excellent, needs fully understood"] },
  { id: "objections", label: "Objection handling", question: "How well did the sales rep handle the prospect's objections?", levels: ["Ignored or argued", "Weak", "Adequate", "Strong", "Turned objections into reasons to buy"] },
  { id: "value", label: "Value framing", question: "How well did the sales rep connect the product to the prospect's business value?", levels: ["Features only", "Vague value", "Some value", "Clear value", "Quantified, compelling value"] },
  { id: "nextsteps", label: "Next steps", question: "How clear and concrete were the next steps the sales rep secured?", levels: ["None", "Vague", "Loose plan", "Clear plan", "Specific, scheduled commitment"] },
];
