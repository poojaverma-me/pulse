"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { turnSeconds } from "@/lib/calls";
import type { Insight, PostCall, Turn } from "@/lib/types";

/** Jev results keyed by how many turns had been spoken when the question was asked. */
export function useAnalysis(company: string) {
  const [insights, setInsights] = useState<Record<number, Insight>>({});
  const [post, setPost] = useState<PostCall | null>(null);
  const [postLoading, setPostLoading] = useState(false);
  const [errors, setErrors] = useState(0);
  const asked = useRef(new Set<number>());

  const analyze = useCallback(
    async (turns: Turn[]) => {
      const n = turns.length;
      if (!n || asked.current.has(n)) return;
      asked.current.add(n);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ company, turns }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setInsights((m) => ({ ...m, [n]: data as Insight }));
      } catch {
        asked.current.delete(n);
        setErrors((e) => e + 1);
      }
    },
    [company],
  );

  const finish = useCallback(
    async (turns: Turn[]) => {
      setPostLoading(true);
      try {
        const res = await fetch("/api/postcall", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ company, turns }),
        });
        const data = await res.json();
        if (!data.error) setPost(data as PostCall);
      } finally {
        setPostLoading(false);
      }
    },
    [company],
  );

  const reset = useCallback(() => {
    asked.current.clear();
    setInsights({});
    setPost(null);
    setPostLoading(false);
    setErrors(0);
  }, []);

  return { insights, post, postLoading, errors, analyze, finish, reset };
}

/** Plays a scripted call in (accelerated) real time: words appear as they'd be spoken. */
export function usePlayback(turns: Turn[], autoPlay = false) {
  const timeline = useMemo(() => {
    const out: { start: number; end: number; words: string[] }[] = [];
    for (const turn of turns) {
      const start = out.at(-1)?.end ?? 0;
      out.push({ start, end: start + turnSeconds(turn), words: turn.text.split(/\s+/) });
    }
    return out;
  }, [turns]);
  const total = timeline.at(-1)?.end ?? 0;

  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(2);
  const last = useRef(0);

  useEffect(() => {
    if (!playing) return;
    last.current = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const dt = ((now - last.current) / 1000) * speed;
      last.current = now;
      setCursor((c) => Math.min(total, c + dt));
    }, 50);
    return () => clearInterval(id);
  }, [playing, speed, total]);

  const completed = timeline.filter((t) => t.end <= cursor).length;
  const ended = completed === turns.length && turns.length > 0;
  const current = timeline[completed];
  const partialWords = current ? Math.floor(((cursor - current.start) / (current.end - current.start - 0.8)) * current.words.length) : 0;

  const restart = useCallback(() => {
    setCursor(0);
    setPlaying(false);
  }, []);
  const skipToEnd = useCallback(() => setCursor(total), [total]);

  return {
    cursor,
    total,
    completed,
    ended,
    playing: playing && !ended,
    setPlaying,
    speed,
    setSpeed,
    restart,
    skipToEnd,
    partial: current ? { index: completed, text: current.words.slice(0, Math.max(0, Math.min(current.words.length, partialWords))).join(" ") } : null,
  };
}
