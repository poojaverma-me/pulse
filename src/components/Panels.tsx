"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeDollarSign,
  CalendarCheck,
  CircleHelp,
  Crown,
  FileLock2,
  FlaskConical,
  Handshake,
  Lightbulb,
  Quote,
  ShieldCheck,
  Swords,
  TrendingUp,
  UserCheck,
  Zap,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { ms, pct } from "@/lib/format";
import { SENTIMENT_LEVELS, STAGES } from "@/lib/questions";
import type { Insight, PostCall, Turn } from "@/lib/types";
import type { CallEvent } from "@/lib/events";

export const ACTION_ICON: Record<string, React.ReactNode> = {
  "Ask a discovery question": <CircleHelp size={20} />,
  "Quantify the ROI": <TrendingUp size={20} />,
  "Offer flexible pricing": <BadgeDollarSign size={20} />,
  "Highlight support & SLA": <ShieldCheck size={20} />,
  "Share security documentation": <FileLock2 size={20} />,
  "Propose a pilot": <FlaskConical size={20} />,
  "Loop in the decision-maker": <UserCheck size={20} />,
  "Differentiate from competitor": <Swords size={20} />,
  "Ask for the close": <Handshake size={20} />,
};

export function Card({ title, right, children, className = "" }: { title?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`panel rounded-2xl ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4 pb-1 pt-3.5">
          <h3 className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">{title}</h3>
          {right}
        </div>
      )}
      <div className="p-4 pt-2">{children}</div>
    </section>
  );
}

/* ───────── Waveform ───────── */

export function Waveform({ active, speaker }: { active: boolean; speaker: "rep" | "client" | null }) {
  const color = speaker === "rep" ? "var(--sky)" : speaker === "client" ? "var(--violet)" : "var(--ink-3)";
  return (
    <div className="flex h-9 items-center gap-[3px]" aria-hidden>
      {Array.from({ length: 36 }, (_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full"
          style={{ background: color }}
          animate={active ? { height: [4, 6 + ((i * 37) % 26), 5, 10 + ((i * 53) % 20), 4] } : { height: 3 }}
          transition={active ? { duration: 0.9 + (i % 5) * 0.12, repeat: Infinity, ease: "easeInOut", delay: (i % 7) * 0.05 } : { duration: 0.3 }}
        />
      ))}
    </div>
  );
}

/* ───────── Transcript ───────── */

export function Transcript({
  turns,
  partial,
  insights,
  events,
  names,
}: {
  turns: Turn[];
  partial: { speaker: "rep" | "client"; text: string } | null;
  insights: Record<number, Insight>;
  events: Record<number, CallEvent>;
  names: { rep: string; client: string };
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [turns.length, partial?.text]);

  return (
    <div ref={ref} className="thin-scroll h-full space-y-3 overflow-y-auto pr-1">
      {turns.length === 0 && !partial && <div className="grid h-full place-items-center text-sm text-ink-3">Press play to start the call.</div>}
      {turns.map((t, i) => (
        <Bubble key={i} turn={t} n={i + 1} insight={insights[i + 1]} event={events[i + 1]} names={names} />
      ))}
      {partial && partial.text && <Bubble turn={partial} n={turns.length + 1} names={names} typing />}
    </div>
  );
}

function Bubble({ turn, n, insight, event, names, typing }: { turn: Turn; n: number; insight?: Insight; event?: CallEvent; names: { rep: string; client: string }; typing?: boolean }) {
  const rep = turn.speaker === "rep";
  const toneCls = { good: "bg-lime/12 text-lime", bad: "bg-coral/12 text-coral", info: "bg-sky/12 text-sky" };
  return (
    <motion.div initial={typing ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${rep ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] ${rep ? "items-end text-right" : ""} flex flex-col`}>
        <div className={`mb-1 flex items-center gap-2 text-[11px] ${rep ? "flex-row-reverse" : ""}`}>
          <span className="font-semibold" style={{ color: rep ? "var(--sky)" : "var(--violet)" }}>
            {rep ? names.rep : names.client}
          </span>
          <span className="font-mono text-ink-3">#{n}</span>
          {insight && <span className="font-mono text-ink-3">Jev · {ms(insight.latencyMs)}</span>}
          {!insight && !typing && <span className="h-2 w-10 rounded-full shimmer" />}
        </div>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-left text-[14px] leading-relaxed ${rep ? "rounded-tr-md bg-sky/[0.09] text-ink" : "rounded-tl-md bg-violet/[0.1] text-ink"} ${typing ? "caret" : ""}`}
        >
          {turn.text}
        </div>
        {event && (
          <span className={`mt-1.5 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${toneCls[event.tone]} ${rep ? "self-end" : ""}`}>
            <Zap size={10} fill="currentColor" /> {event.label}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ───────── Next best action ───────── */

export function NextAction({ insight }: { insight?: Insight }) {
  if (!insight)
    return (
      <div className="rounded-2xl border border-dashed border-line-2 p-5 text-sm text-ink-3">Jev suggests a next move after the first exchange.</div>
    );
  const top = Object.entries(insight.nextAction.probs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const why = [
    insight.flags.priceSensitive >= 0.5 && `price-sensitive ${pct(insight.flags.priceSensitive)}`,
    insight.objection.choice !== "None" && `objection: ${insight.objection.choice.toLowerCase()}`,
    insight.flags.competitor >= 0.5 && "competitor in play",
    insight.flags.decisionMaker < 0.4 && "not the final decision-maker",
    `prioritises ${insight.priority.choice.toLowerCase()}`,
  ].filter(Boolean) as string[];
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-lime/[0.18] via-lime/[0.06] to-transparent p-5 ring-1 ring-lime/25">
      <div className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-lime">Pivot your pitch</div>
      <AnimatePresence mode="wait">
        <motion.div key={insight.nextAction.choice} initial={{ opacity: 0, y: 10, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-lime text-[#0a0c0f]">{ACTION_ICON[insight.nextAction.choice]}</span>
            <div className="font-display text-[1.45rem] font-semibold leading-tight">{insight.nextAction.choice}</div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {why.slice(0, 3).map((w) => (
          <span key={w} className="rounded-full bg-black/25 px-2 py-0.5 text-[11px] text-ink-2">
            {w}
          </span>
        ))}
      </div>
      <div className="mt-4 space-y-1.5">
        {top.map(([label, p]) => (
          <div key={label} className="grid grid-cols-[1fr_70px_34px] items-center gap-2 text-[11.5px]">
            <span className="truncate text-ink-2">{label}</span>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-lime" animate={{ width: `${p * 100}%` }} />
            </div>
            <span className="text-right font-mono text-ink-3">{pct(p)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Client signals ───────── */

export function Signals({ insight }: { insight?: Insight }) {
  const pri = insight ? Object.entries(insight.priority.probs).sort((a, b) => b[1] - a[1]) : [];
  const flags: [keyof Insight["flags"], string, boolean][] = [
    ["priceSensitive", "Price-sensitive", false],
    ["decisionMaker", "Decision-maker", true],
    ["competitor", "Competitor in play", false],
    ["urgency", "Has a deadline", true],
    ["engaged", "Engaged", true],
  ];
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-[12px] text-ink-3">What the prospect cares about</div>
        <div className="space-y-1.5">
          {(pri.length ? pri : Object.entries({ "": 0 })).slice(0, 4).map(([label, p], i) =>
            label ? (
              <div key={label} className="grid grid-cols-[1fr_90px_36px] items-center gap-2 text-[12.5px]">
                <span className={i === 0 ? "font-semibold" : "text-ink-2"}>{label}</span>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div className="h-full rounded-full" style={{ background: i === 0 ? "var(--violet)" : "var(--ink-3)" }} animate={{ width: `${Math.max(2, p * 100)}%` }} />
                </div>
                <span className="text-right font-mono text-[11px] text-ink-3">{pct(p)}</span>
              </div>
            ) : (
              <div key="empty" className="h-20 rounded-lg shimmer" />
            ),
          )}
        </div>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5">
        <span className="text-[12px] text-ink-3">Main objection</span>
        <span className={`text-[13px] font-semibold ${insight && insight.objection.choice !== "None" ? "text-coral" : "text-ink-2"}`}>{insight?.objection.choice ?? "—"}</span>
      </div>
      <div className="grid grid-cols-1 gap-1.5">
        {flags.map(([k, label, good]) => {
          const v = insight?.flags[k] ?? 0;
          const on = v >= 0.5;
          const color = on ? (good ? "var(--lime)" : "var(--coral)") : "var(--ink-3)";
          return (
            <div key={k} className="flex items-center gap-2.5 text-[12.5px]">
              <span className={`relative h-[18px] w-[30px] rounded-full transition-colors`} style={{ background: on ? `color-mix(in srgb, ${color} 35%, transparent)` : "rgba(255,255,255,.08)" }}>
                <motion.span className="absolute top-[2px] h-[14px] w-[14px] rounded-full" style={{ background: on ? color : "rgba(255,255,255,.35)" }} animate={{ left: on ? 14 : 2 }} />
              </span>
              <span className={on ? "text-ink" : "text-ink-3"}>{label}</span>
              <span className="ml-auto font-mono text-[11px] text-ink-3">{insight ? v.toFixed(2) : "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── Sentiment + stage ───────── */

export function Sentiment({ insight }: { insight?: Insight }) {
  const s = insight?.sentiment.score ?? 2;
  const label = SENTIMENT_LEVELS[Math.round(s)];
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-display text-[1.3rem] font-semibold">{insight ? label : "—"}</span>
        <span className="font-mono text-[11px] text-ink-3">{insight ? `${s.toFixed(2)} / 4` : ""}</span>
      </div>
      <div className="relative mt-3 h-2 rounded-full bg-gradient-to-r from-coral via-amber to-lime">
        <motion.span className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg bg-ink shadow" animate={{ left: `${(s / 4) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[10.5px] text-ink-3">
        <span>Very negative</span>
        <span>Very positive</span>
      </div>
    </div>
  );
}

export function StageTrack({ insight }: { insight?: Insight }) {
  const stages = Object.keys(STAGES);
  const idx = insight ? stages.indexOf(insight.stage.choice) : -1;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-display text-[1.3rem] font-semibold">{insight ? insight.stage.choice : "—"}</span>
        <span className="font-mono text-[11px] text-ink-3">{idx >= 0 ? `${idx + 1} / ${stages.length}` : ""}</span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1.5">
        {stages.map((s, i) => (
          <div key={s} title={s} className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
            <motion.div className="h-full rounded-full bg-sky" animate={{ width: i <= idx ? "100%" : "0%" }} transition={{ duration: 0.5, delay: i * 0.05 }} />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[10.5px] text-ink-3">
        <span>Discovery</span>
        <span>Commitment</span>
      </div>
    </div>
  );
}

/* ───────── Post-call ───────── */

export function PostCallPanel({ post, turns, names, talkRatio, minutes }: { post: PostCall; turns: Turn[]; names: { rep: string; client: string }; talkRatio: number; minutes: number }) {
  const outcomeTone = post.outcome.choice === "Won" ? "lime" : post.outcome.choice === "Lost" ? "coral" : "amber";
  const quote = (n: number) => turns[n - 1]?.text ?? "";
  const moments = [
    { label: "Main need", icon: <Lightbulb size={14} />, ...post.moments.need },
    { label: "Biggest hesitation", icon: <Swords size={14} />, ...post.moments.objection },
    { label: "Where they landed", icon: <CalendarCheck size={14} />, ...post.moments.commitment },
  ];
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="panel mt-5 overflow-hidden rounded-3xl">
      <div className="flex flex-wrap items-center gap-4 border-b border-line px-6 py-5">
        <div>
          <div className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">Post-call review</div>
          <div className="mt-1 font-display text-2xl font-semibold">Call with {names.client}</div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <span className="rounded-full px-3 py-1 text-[13px] font-semibold" style={{ color: `var(--${outcomeTone})`, background: `color-mix(in srgb, var(--${outcomeTone}) 14%, transparent)` }}>
            {post.outcome.choice === "Won" && <Crown size={13} className="mr-1 inline" />}
            {post.outcome.choice} · {pct(post.outcome.probs[post.outcome.choice] ?? 0)}
          </span>
          {post.dropoff.choice !== "Not lost" && (
            <span className="rounded-full bg-coral/12 px-3 py-1 text-[13px] font-medium text-coral">Drop-off: {post.dropoff.choice}</span>
          )}
          <span className="rounded-full bg-white/5 px-3 py-1 font-mono text-[12px] text-ink-3">
            1 Jev call · {ms(post.latencyMs)} · {post.inputTokens.toLocaleString()} tok
          </span>
        </div>
      </div>
      <div className="grid gap-6 p-6 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="mb-3 text-[12px] text-ink-3">Key moments. Jev picked these turns from the transcript; nothing below is generated text.</div>
          <div className="space-y-3">
            {moments.map((m) => (
              <div key={m.label} className="rounded-2xl bg-white/[0.03] p-4 ring-1 ring-line">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-ink-2">
                  {m.icon} {m.label}
                  <span className="ml-auto font-mono text-[11px] font-normal text-ink-3">
                    turn {m.turn} · p {m.p.toFixed(2)}
                  </span>
                </div>
                <p className="mt-2 flex gap-2 text-[14px] leading-relaxed">
                  <Quote size={14} className="mt-1 shrink-0 text-violet" />
                  {quote(m.turn)}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <div>
            <div className="mb-3 text-[12px] text-ink-3">Rep scorecard · {names.rep}</div>
            <div className="space-y-2.5">
              {post.scorecard.map((s, i) => (
                <div key={s.id}>
                  <div className="flex justify-between text-[13px]">
                    <span>{s.label}</span>
                    <span className="font-mono">{s.score.toFixed(1)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: s.score >= 7 ? "var(--lime)" : s.score >= 4.5 ? "var(--amber)" : "var(--coral)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${s.score * 10}%` }}
                      transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
                    />
                  </div>
                  <div className="mt-0.5 text-[11px] text-ink-3">{s.levels[Math.round((s.score / 10) * (s.levels.length - 1))]}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Duration" value={`${minutes.toFixed(1)} min`} />
            <Stat label="Rep talk time" value={pct(talkRatio)} />
            <Stat label="Next step" value={post.nextStepAgreed >= 0.5 ? "Agreed" : "None"} />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-line">
      <div className="font-display text-[1.05rem] font-semibold">{value}</div>
      <div className="text-[11px] text-ink-3">{label}</div>
    </div>
  );
}
