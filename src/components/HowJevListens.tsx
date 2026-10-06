"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CALLS, turnSeconds } from "@/lib/calls";
import { ms, pct, usd } from "@/lib/format";
import { ACTIONS, callState, LIVE_QUESTIONS, OBJECTIONS, PRIORITIES, SENTIMENT_LEVELS, STAGES } from "@/lib/questions";
import type { Insight } from "@/lib/types";

// LLM baseline for one analysis: same prompt size, ~220 output tokens of JSON at ~75 tok/s.
const LLM_OUT_TOKENS = 220;
const llmSeconds = () => 0.9 + LLM_OUT_TOKENS / 75;
const llmCost = (inputTokens: number) => (inputTokens / 1e6) * 3 + (LLM_OUT_TOKENS / 1e6) * 15;

const ORDER = ["conversion", "sentiment", "priority", "objection", "stage", "nextAction", "priceSensitive", "decisionMaker", "competitor", "urgency", "engaged", "repAddressed"] as const;

function answerOf(i: Insight, id: (typeof ORDER)[number]) {
  switch (id) {
    case "conversion":
      return { kind: "noul" as const, p: i.conversion };
    case "sentiment":
      return { kind: "score" as const, value: i.sentiment.score, bars: SENTIMENT_LEVELS.map((l, k) => [l, i.sentiment.probs[k] ?? 0] as const) };
    case "priority":
    case "objection":
    case "stage":
    case "nextAction": {
      const d = i[id];
      const keys = Object.keys(id === "priority" ? PRIORITIES : id === "objection" ? OBJECTIONS : id === "stage" ? STAGES : ACTIONS);
      return { kind: "choice" as const, choice: d.choice, confidence: d.confidence, bars: keys.map((k) => [k, d.probs[k] ?? 0] as const).sort((a, b) => b[1] - a[1]) };
    }
    default:
      return { kind: "noul" as const, p: i.flags[id] };
  }
}

export default function HowJevListens() {
  const [callId, setCallId] = useState(CALLS[0].id);
  const call = CALLS.find((c) => c.id === callId)!;
  const [turn, setTurn] = useState(6);
  const [cache, setCache] = useState<Record<string, Insight>>({});
  const [busy, setBusy] = useState(false);
  const key = (n: number) => `${callId}:${n}`;
  const insight = cache[key(turn)];

  const fetchTurn = useCallback(
    async (n: number) => {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ company: call.company, turns: call.turns.slice(0, n) }),
      });
      const data = await res.json();
      if (!data.error) setCache((c) => ({ ...c, [`${call.id}:${n}`]: data }));
    },
    [call],
  );

  // Debounced so dragging the turn slider doesn't fire a request per pixel.
  useEffect(() => {
    if (cache[`${call.id}:${turn}`]) return;
    const t = setTimeout(() => void fetchTurn(turn), 150);
    return () => clearTimeout(t);
  }, [turn, call.id, cache, fetchTurn]);

  const analyseAll = async () => {
    setBusy(true);
    const todo = call.turns.map((_, i) => i + 1).filter((n) => !cache[key(n)]);
    let i = 0;
    await Promise.all(
      Array.from({ length: 4 }, async () => {
        while (i < todo.length) await fetchTurn(todo[i++]);
      }),
    );
    setBusy(false);
  };

  const state = useMemo(() => callState(call.company, call.turns.slice(0, turn)), [call, turn]);

  return (
    <div>
      <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-lime">How Jev listens</div>
      <h1 className="mt-1 max-w-4xl font-display text-[clamp(2rem,4.4vw,3.4rem)] font-bold leading-[1.02] tracking-tight">
        Twelve typed questions after every sentence, answered before the next one starts.
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-2">
        The state is the transcript so far. Jev returns a calibrated probability for each question in one request. Nothing is generated, so
        nothing has to be parsed, and it finishes in roughly a tenth of a second.
      </p>

      <div className="panel mt-6 flex flex-wrap items-center gap-3 rounded-2xl p-3">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {CALLS.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCallId(c.id);
                setTurn(Math.min(6, c.turns.length));
              }}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-medium ${c.id === callId ? "bg-lime text-[#0a0c0f]" : "bg-white/[0.05] text-ink-2 hover:text-ink"}`}
            >
              {c.company}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setTurn((t) => Math.max(1, t - 1))} className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.06]" aria-label="Previous turn">
            <ChevronLeft size={16} />
          </button>
          <input type="range" min={1} max={call.turns.length} value={turn} onChange={(e) => setTurn(Number(e.target.value))} className="w-40 accent-[var(--lime)] sm:w-56" aria-label="Turn" />
          <button onClick={() => setTurn((t) => Math.min(call.turns.length, t + 1))} className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.06]" aria-label="Next turn">
            <ChevronRight size={16} />
          </button>
          <span className="w-24 font-mono text-[12px] text-ink-2">
            turn {turn}/{call.turns.length}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="panel flex flex-col rounded-2xl">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <div className="font-mono text-[12px] text-lime">state</div>
              <div className="text-[12px] text-ink-3">transcript up to turn {turn}, as structured JSON</div>
            </div>
            {insight && (
              <span className="rounded-full bg-lime/12 px-2.5 py-1 font-mono text-[11.5px] text-lime">
                {ms(insight.latencyMs)} · {insight.inputTokens.toLocaleString()} tok · {usd(insight.costUsd)}
              </span>
            )}
          </div>
          <div className="thin-scroll max-h-[640px] space-y-2 overflow-y-auto p-4">
            {state.transcript.map((t) => (
              <div key={t.turn} className={`rounded-xl px-3 py-2 text-[13px] leading-relaxed ${t.turn === turn ? "bg-lime/[0.08] ring-1 ring-lime/30" : "bg-white/[0.025]"}`}>
                <span className="mr-2 font-mono text-[11px]" style={{ color: t.speaker === "Prospect" ? "var(--violet)" : "var(--sky)" }}>
                  {t.turn} · {t.speaker}
                </span>
                {t.text}
              </div>
            ))}
          </div>
        </section>

        <section className="grid content-start gap-2.5 sm:grid-cols-2">
          {ORDER.map((id, i) => {
            const q = LIVE_QUESTIONS[id];
            const a = insight ? answerOf(insight, id) : null;
            return (
              <motion.div key={id} layout className={`panel rounded-xl p-3.5 ${id === "conversion" || id === "nextAction" ? "sm:col-span-2" : ""}`}>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-[10.5px] uppercase text-ink-3">{q.type}</span>
                  <span className="font-mono text-[11px] text-ink-3">{id}</span>
                </div>
                <p className="mt-1.5 text-[12.5px] leading-snug text-ink-2">{typeof q.instructions === "string" ? q.instructions : ""}</p>
                {!a ? (
                  <div className="mt-3 h-8 rounded-lg shimmer" />
                ) : a.kind === "noul" ? (
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div className="h-full rounded-full" style={{ background: a.p >= 0.5 ? "var(--lime)" : "var(--coral)" }} initial={{ width: 0 }} animate={{ width: `${a.p * 100}%` }} transition={{ delay: i * 0.03 }} />
                    </div>
                    <span className="w-12 text-right font-mono text-[13px] font-semibold">{a.p.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="mt-2.5 space-y-1">
                    <div className="mb-1.5 text-[13.5px] font-semibold">
                      {a.kind === "score" ? `${SENTIMENT_LEVELS[Math.round(a.value)]} · ${a.value.toFixed(2)}` : a.choice}
                      {a.kind === "choice" && <span className="ml-2 font-mono text-[11px] font-normal text-ink-3">confidence {a.confidence.toFixed(2)}</span>}
                    </div>
                    {a.bars.slice(0, id === "nextAction" ? 5 : 4).map(([label, p]) => (
                      <div key={label} className="grid grid-cols-[1fr_80px_34px] items-center gap-2 text-[11.5px]">
                        <span className="truncate text-ink-3">{label}</span>
                        <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                          <motion.div className="h-full rounded-full bg-violet" initial={{ width: 0 }} animate={{ width: `${p * 100}%` }} />
                        </div>
                        <span className="text-right font-mono text-ink-3">{pct(p)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </section>
      </div>

      <Headroom callId={callId} cache={cache} busy={busy} onRun={analyseAll} />
    </div>
  );
}

function Headroom({ callId, cache, busy, onRun }: { callId: string; cache: Record<string, Insight>; busy: boolean; onRun: () => void }) {
  const call = CALLS.find((c) => c.id === callId)!;
  const rows = call.turns.map((t, i) => {
    const n = i + 1;
    const ins = cache[`${callId}:${n}`];
    // The window: the next turn is already being spoken while we analyse this one.
    const window = call.turns[n] ? turnSeconds(call.turns[n]) : 4;
    return { n, speaker: t.speaker, window, jev: ins ? ins.latencyMs / 1000 : null, tokens: ins?.inputTokens ?? 0, cost: ins?.costUsd ?? 0 };
  });
  // An LLM that takes longer than the window builds a backlog.
  const llm = rows.reduce<{ delays: number[]; backlog: number }>(
    (acc, r) => {
      const delay = acc.backlog + llmSeconds();
      return { delays: [...acc.delays, delay], backlog: Math.max(0, delay - r.window) };
    },
    { delays: [], backlog: 0 },
  ).delays;
  const done = rows.filter((r) => r.jev !== null);
  const max = Math.max(...rows.map((r) => r.window), ...llm, 1);
  const lateLLM = llm.filter((d, i) => d > rows[i].window).length;
  const jevCost = done.reduce((s, r) => s + r.cost, 0);
  const llmTotal = done.reduce((s, r) => s + llmCost(r.tokens), 0);

  return (
    <section className="panel mt-6 rounded-3xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Real-time headroom · {call.company}</div>
          <h2 className="mt-1 font-display text-2xl font-bold">Is the insight ready before the moment passes?</h2>
          <p className="mt-1 max-w-2xl text-[13px] text-ink-3">
            Each turn gets the time it takes to say the next turn. Jev bars are measured; the LLM lane is projected (~{llmSeconds().toFixed(1)} s per
            analysis), and it queues up whenever it can&apos;t keep pace.
          </p>
        </div>
        <button onClick={onRun} disabled={busy || done.length === rows.length} className="flex h-10 items-center gap-2 rounded-full bg-lime px-4 text-[13.5px] font-semibold text-[#0a0c0f] disabled:opacity-50">
          {busy ? <span className="h-3.5 w-3.5 rounded-full border-2 border-[#0a0c0f] border-t-transparent" style={{ animation: "spin 0.9s linear infinite" }} /> : <Play size={14} fill="currentColor" />}
          {done.length === rows.length ? "All turns analysed" : `Analyse all ${rows.length} turns`}
        </button>
      </div>

      <div className="mt-6 space-y-1.5">
        {rows.map((r, i) => (
          <div key={r.n} className="grid grid-cols-[46px_1fr] items-center gap-3">
            <span className="font-mono text-[11px]" style={{ color: r.speaker === "client" ? "var(--violet)" : "var(--sky)" }}>
              #{r.n}
            </span>
            <div className="relative h-[18px] rounded bg-white/[0.03]">
              <div className="absolute inset-y-0 left-0 rounded bg-white/[0.06]" style={{ width: `${(r.window / max) * 100}%` }} title={`Window ${r.window.toFixed(1)} s`} />
              <motion.div className="absolute left-0 top-[3px] h-[5px] rounded-full" style={{ background: llm[i] > r.window ? "var(--coral)" : "rgba(238,242,246,.4)" }} initial={{ width: 0 }} animate={{ width: `${(llm[i] / max) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.02 }} />
              {r.jev !== null && (
                <motion.div className="absolute left-0 bottom-[3px] h-[5px] rounded-full bg-lime" initial={{ width: 0 }} animate={{ width: `max(4px, ${(r.jev / max) * 100}%)` }} />
              )}
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-ink-3">{r.jev !== null ? `${Math.round(r.jev * 1000)} ms vs ${llm[i].toFixed(1)} s` : ""}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-[11.5px] text-ink-3">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-5 rounded bg-white/[0.08]" /> time until the next turn ends
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-5 rounded-full bg-lime" /> Jev (measured)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-5 rounded-full bg-[rgba(238,242,246,.4)]" /> LLM (projected) · <span className="text-coral">red = arrives late</span>
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-lime/[0.08] p-4 ring-1 ring-lime/25">
          <div className="flex items-center gap-1.5 text-[12px] text-lime">
            <Zap size={12} fill="currentColor" /> Jev on time
          </div>
          <div className="mt-1 font-display text-2xl font-bold">
            {done.filter((r) => r.jev! < r.window).length}/{done.length || rows.length} turns
          </div>
        </div>
        <div className="rounded-2xl bg-coral/[0.08] p-4 ring-1 ring-coral/25">
          <div className="text-[12px] text-coral">Coaching delay after each turn</div>
          <div className="mt-1 font-display text-2xl font-bold">
            {done.length ? `${Math.round((done.reduce((s, r) => s + r.jev!, 0) / done.length) * 1000)} ms` : "—"}{" "}
            <span className="text-[13px] font-normal text-ink-3">
              vs ≈ {(llm.reduce((s, d) => s + d, 0) / llm.length).toFixed(1)} s LLM · late on {lateLLM} turns
            </span>
          </div>
        </div>
        <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-line">
          <div className="text-[12px] text-ink-3">Cost for the analysed turns</div>
          <div className="mt-1 font-display text-2xl font-bold">
            {usd(jevCost)}{" "}
            <span className="text-[13px] font-normal text-ink-3">
              vs ≈ {usd(llmTotal)} LLM{jevCost > 0 ? ` · ${Math.round(llmTotal / jevCost)}× cheaper` : ""}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
