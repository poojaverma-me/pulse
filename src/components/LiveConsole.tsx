"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, FastForward, Pause, Play, RotateCcw, Sparkles, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { turnSeconds } from "@/lib/calls";
import { eventBetween, type CallEvent } from "@/lib/events";
import { clock, ms, pct, usd } from "@/lib/format";
import type { Call, Insight, PostCall, Turn } from "@/lib/types";
import ConversionChart, { type ChartPoint } from "./ConversionChart";
import { Card, NextAction, PostCallPanel, Sentiment, Signals, StageTrack, Transcript, Waveform } from "./Panels";
import { useAnalysis, usePlayback } from "./useSession";

/** Derived view-model shared by the scripted player and the live-mic console. */
export function useDerived(insights: Record<number, Insight>) {
  return useMemo(() => {
    const keys = Object.keys(insights)
      .map(Number)
      .sort((a, b) => a - b);
    const events: Record<number, CallEvent> = {};
    const points: ChartPoint[] = keys.map((k, i) => {
      const ev = eventBetween(i ? insights[keys[i - 1]] : undefined, insights[k]);
      if (ev) events[k] = ev;
      return { turn: k, p: insights[k].conversion, event: ev ? { label: ev.label, tone: ev.tone } : undefined };
    });
    const latest = keys.length ? insights[keys.at(-1)!] : undefined;
    const prev = keys.length > 1 ? insights[keys.at(-2)!] : undefined;
    const spend = keys.reduce((s, k) => s + insights[k].costUsd, 0);
    const tokens = keys.reduce((s, k) => s + insights[k].inputTokens, 0);
    const avgLatency = keys.length ? keys.reduce((s, k) => s + insights[k].latencyMs, 0) / keys.length : 0;
    const nudges = keys.filter((k) => events[k]).map((k) => ({ turn: k, ...events[k] }));
    return { keys, events, points, latest, prev, spend, tokens, avgLatency, nudges };
  }, [insights]);
}

/** Each replay is a fresh mount, so the player and the Jev results start clean. */
export default function LiveConsole({ call }: { call: Call }) {
  const [run, setRun] = useState(0);
  return <LiveRun key={`${call.id}-${run}`} call={call} autoPlay={run > 0} onReplay={() => setRun((r) => r + 1)} />;
}

function LiveRun({ call, autoPlay, onReplay }: { call: Call; autoPlay: boolean; onReplay: () => void }) {
  const player = usePlayback(call.turns, autoPlay);
  const { insights, post, postLoading, analyze, finish } = useAnalysis(call.company);
  const finished = useRef(false);

  useEffect(() => {
    if (player.completed > 0) void analyze(call.turns.slice(0, player.completed));
  }, [player.completed, call.turns, analyze]);

  useEffect(() => {
    if (player.ended && !finished.current) {
      finished.current = true;
      void finish(call.turns);
    }
  }, [player.ended, call.turns, finish]);

  const spoken = call.turns.slice(0, player.completed);
  const speaking = player.partial ? call.turns[player.partial.index].speaker : null;
  const names = { rep: call.rep, client: call.contact.name };

  return (
    <ConsoleLayout
      header={
        <CallHeader
          company={call.company}
          sub={`${call.contact.name} · ${call.contact.title}`}
          rep={call.rep}
          hue={call.hue}
          live={player.playing}
          clockSec={player.cursor}
          waveform={<Waveform active={player.playing} speaker={speaking} />}
          controls={
            <div className="flex items-center gap-2">
              <button
                onClick={() => (player.ended ? onReplay() : player.setPlaying(!player.playing))}
                className="flex h-10 items-center gap-2 rounded-full bg-lime px-4 text-[14px] font-semibold text-[#0a0c0f] transition hover:brightness-110 active:scale-95"
              >
                {player.ended ? <RotateCcw size={16} /> : player.playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                {player.ended ? "Replay" : player.playing ? "Pause" : player.cursor > 0 ? "Resume" : "Start call"}
              </button>
              <div className="flex rounded-full bg-white/[0.06] p-0.5 text-[12px]">
                {[1, 2, 4].map((s) => (
                  <button key={s} onClick={() => player.setSpeed(s)} className={`rounded-full px-2.5 py-1 font-mono ${player.speed === s ? "bg-white/15 text-ink" : "text-ink-3"}`}>
                    {s}×
                  </button>
                ))}
              </div>
              {!player.ended && player.cursor > 0 && (
                <button onClick={player.skipToEnd} title="Skip to end" className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-ink-2 hover:text-ink">
                  <FastForward size={15} />
                </button>
              )}
            </div>
          }
        />
      }
      turns={spoken}
      partial={player.partial ? { speaker: call.turns[player.partial.index].speaker, text: player.partial.text } : null}
      totalTurns={call.turns.length}
      insights={insights}
      names={names}
      post={post}
      postLoading={postLoading}
      minutes={call.turns.reduce((s, t) => s + turnSeconds(t), 0) / 60}
    />
  );
}

export function CallHeader({
  company,
  sub,
  rep,
  hue,
  live,
  clockSec,
  waveform,
  controls,
}: {
  company: string;
  sub: string;
  rep: string;
  hue: number;
  live: boolean;
  clockSec: number;
  waveform: React.ReactNode;
  controls: React.ReactNode;
}) {
  return (
    <div className="panel rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl font-display text-lg font-bold text-white" style={{ background: `linear-gradient(140deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 60% 38%))` }}>
          {company[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-[1.15rem] font-semibold">{company}</div>
          <div className="truncate text-[12.5px] text-ink-3">
            {sub} · rep {rep}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/[0.05] px-3 py-1.5 font-mono text-[13px]">
          <span className={`h-2 w-2 rounded-full ${live ? "live-dot bg-coral" : "bg-ink-3"}`} />
          {clock(clockSec)}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {waveform}
        {controls}
      </div>
    </div>
  );
}

export function ConsoleLayout({
  header,
  turns,
  partial,
  totalTurns,
  insights,
  names,
  post,
  postLoading,
  minutes,
  footer,
}: {
  header: React.ReactNode;
  turns: Turn[];
  partial: { speaker: "rep" | "client"; text: string } | null;
  totalTurns: number;
  insights: Record<number, Insight>;
  names: { rep: string; client: string };
  post: PostCall | null;
  postLoading: boolean;
  minutes: number;
  footer?: React.ReactNode;
}) {
  const d = useDerived(insights);
  const latest = d.latest;
  const delta = latest && d.prev ? latest.conversion - d.prev.conversion : 0;
  const repWords = turns.filter((t) => t.speaker === "rep").reduce((s, t) => s + t.text.split(/\s+/).length, 0);
  const allWords = turns.reduce((s, t) => s + t.text.split(/\s+/).length, 0) || 1;
  const postRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (post) postRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [post]);

  return (
    <div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_330px]">
        {/* Left: call + transcript */}
        <div className="flex min-h-0 flex-col gap-4">
          {header}
          <div className="panel h-[min(62vh,640px)] rounded-2xl p-4">
            <Transcript turns={turns} partial={partial} insights={insights} events={d.events} names={names} />
          </div>
          {footer}
        </div>

        {/* Middle: conversion + sentiment + nudges */}
        <div className="flex flex-col gap-4">
          <Card
            title="Conversion probability"
            right={<span className="font-mono text-[11px] text-ink-3">noul · after every turn</span>}
          >
            <div className="flex items-end gap-3">
              <motion.span key={latest ? Math.round(latest.conversion * 100) : "x"} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-display text-[3.4rem] font-bold leading-none tracking-tight" style={{ color: !latest ? "var(--ink-3)" : latest.conversion >= 0.6 ? "var(--lime)" : latest.conversion >= 0.4 ? "var(--amber)" : "var(--coral)" }}>
                {latest ? pct(latest.conversion) : "—"}
              </motion.span>
              {latest && d.prev && Math.abs(delta) >= 0.01 && (
                <span className={`mb-2 flex items-center gap-0.5 text-[13px] font-semibold ${delta > 0 ? "text-lime" : "text-coral"}`}>
                  {delta > 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
                  {Math.abs(Math.round(delta * 100))} pts
                </span>
              )}
              <span className="mb-2 ml-auto text-right text-[12px] text-ink-3">
                {latest ? `after turn ${latest.turn} of ${totalTurns}` : "waiting for the first turn"}
              </span>
            </div>
            <div className="mt-2">
              <ConversionChart points={d.points} totalTurns={totalTurns} />
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card title="Prospect sentiment">
              <Sentiment insight={latest} />
            </Card>
            <Card title="Deal stage">
              <StageTrack insight={latest} />
              <div className="mt-3 text-[12px] text-ink-3">
                Rep talk time <span className="font-mono text-ink-2">{pct(repWords / allWords)}</span>
              </div>
            </Card>
          </div>

          <Card title="Coaching feed" right={<Sparkles size={13} className="text-ink-3" />}>
            <div className="thin-scroll max-h-[220px] space-y-2 overflow-y-auto">
              {d.nudges.length === 0 && <div className="py-4 text-center text-[13px] text-ink-3">Nudges appear when Jev spots a shift in the call.</div>}
              <AnimatePresence initial={false}>
                {[...d.nudges].reverse().map((n) => (
                  <motion.div key={n.turn} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 rounded-xl bg-white/[0.03] p-3 ring-1 ring-line">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.tone === "good" ? "bg-lime" : n.tone === "bad" ? "bg-coral" : "bg-sky"}`} />
                    <div>
                      <div className="text-[12.5px] font-semibold">
                        {n.label} <span className="font-mono text-[11px] font-normal text-ink-3">· turn {n.turn}</span>
                      </div>
                      <div className="text-[12.5px] leading-snug text-ink-2">{n.nudge}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </div>

        {/* Right: next action + signals + telemetry */}
        <div className="flex flex-col gap-4">
          <NextAction insight={latest} />
          <Card title="Client signals">
            <Signals insight={latest} />
          </Card>
          <Card title="Jev telemetry" right={<Zap size={13} className="text-lime" />}>
            <div className="grid grid-cols-2 gap-y-2 text-[12.5px]">
              <span className="text-ink-3">Analyses</span>
              <span className="text-right font-mono">{d.keys.length}</span>
              <span className="text-ink-3">Questions each</span>
              <span className="text-right font-mono">12</span>
              <span className="text-ink-3">Avg latency</span>
              <span className="text-right font-mono text-lime">{d.keys.length ? ms(d.avgLatency) : "—"}</span>
              <span className="text-ink-3">Tokens</span>
              <span className="text-right font-mono">{d.tokens.toLocaleString()}</span>
              <span className="text-ink-3">Call cost so far</span>
              <span className="text-right font-mono text-lime">{usd(d.spend)}</span>
            </div>
          </Card>
        </div>
      </div>

      <div ref={postRef} className="scroll-mt-24">
        {postLoading && <div className="panel mt-5 h-40 rounded-3xl shimmer" />}
        {post && <PostCallPanel post={post} turns={turns} names={names} talkRatio={repWords / allWords} minutes={minutes} />}
      </div>
    </div>
  );
}
