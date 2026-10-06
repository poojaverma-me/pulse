import type { Turn } from "./types";

/** Validate turns coming from the browser (including live-mic transcripts). */
export const cleanTurns = (turns: unknown): Turn[] =>
  Array.isArray(turns)
    ? turns
        .filter((t): t is Turn => !!t && (t.speaker === "rep" || t.speaker === "client") && typeof t.text === "string" && t.text.trim() !== "")
        .slice(-60)
        .map((t) => ({ speaker: t.speaker, text: t.text.slice(0, 1200) }))
    : [];
