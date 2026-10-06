"use client";

import { motion } from "framer-motion";
import { Play, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { CALLS, HISTORY } from "@/lib/calls";
import { pct } from "@/lib/format";
import type { HistoryCall } from "@/lib/types";

const OUTCOME_COLOR: Record<HistoryCall["outcome"], string> = { Won: "var(--lime)", "Follow-up": "var(--amber)", Lost: "var(--coral)" };

export default function Library({ onOpenCall }: { onOpenCall: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [outcome, setOutcome] = useState<HistoryCall["outcome"] | null>(null);
  const rows = HISTORY.filter(
    (h) => (!outcome || h.outcome === outcome) && (!q || `${h.company} ${h.contact} ${h.rep} ${h.industry}`.toLowerCase().includes(q.toLowerCase())),
  );

  const stats = useMemo(() => {
    const won = HISTORY.filter((h) => h.outcome === "Won").length;
    const avgConv = HISTORY.reduce((s, h) => s + h.conversion, 0) / HISTORY.length;
    const avgMin = HISTORY.reduce((s, h) => s + h.minutes, 0) / HISTORY.length;
    const drop: Record<string, number> = {};
    HISTORY.filter((h) => h.dropoff).forEach((h) => (drop[h.dropoff!] = (drop[h.dropoff!] ?? 0) + 1));
    const reps: Record<string, { won: number; total: number }> = {};
    HISTORY.forEach((h) => {
      reps[h.rep] ??= { won: 0, total: 0 };
      reps[h.rep].total++;
      if (h.outcome === "Won") reps[h.rep].won++;
    });
    const pri: Record<string, { won: number; total: number }> = {};
    HISTORY.forEach((h) => {
      pri[h.priority] ??= { won: 0, total: 0 };
      pri[h.priority].total++;
      if (h.outcome === "Won") pri[h.priority].won++;
    });
    return { won, avgConv, avgMin, drop: Object.entries(drop).sort((a, b) => b[1] - a[1]), reps: Object.entries(reps).sort((a, b) => b[1].won / b[1].total - a[1].won / a[1].total), pri: Object.entries(pri).sort((a, b) => b[1].total - a[1].total) };
  }, []);
  const maxDrop = Math.max(...stats.drop.map((d) => d[1]), 1);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.14em] text-lime">Call library</div>
          <h1 className="mt-1 font-display text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight">Last 30 days</h1>
          <p className="mt-1 text-[14px] text-ink-3">Every call is classified by Jev after it ends: outcome, drop-off reason, and what the prospect prioritised. History below is synthetic demo data.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Calls analysed" value={String(HISTORY.length)} />
        <Kpi label="Win rate" value={pct(stats.won / HISTORY.length)} tone="var(--lime)" />
        <Kpi label="Avg. conversion at hang-up" value={pct(stats.avgConv)} />
        <Kpi label="Avg. call length" value={`${stats.avgMin.toFixed(0)} min`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Box title="Why deals stall or drop">
          <div className="space-y-2.5">
            {stats.drop.map(([label, n], i) => (
              <div key={label}>
                <div className="flex justify-between text-[12.5px]">
                  <span>{label}</span>
                  <span className="font-mono text-ink-3">{n}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div className="h-full rounded-full bg-coral" style={{ opacity: 1 - i * 0.12 }} initial={{ width: 0 }} animate={{ width: `${(n / maxDrop) * 100}%` }} transition={{ delay: i * 0.06, duration: 0.7 }} />
                </div>
              </div>
            ))}
          </div>
        </Box>
        <Box title="Win rate by rep">
          <div className="space-y-2.5">
            {stats.reps.map(([rep, r], i) => (
              <div key={rep}>
                <div className="flex justify-between text-[12.5px]">
                  <span>{rep}</span>
                  <span className="font-mono text-ink-3">
                    {r.won}/{r.total} · {pct(r.won / r.total)}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div className="h-full rounded-full bg-lime" initial={{ width: 0 }} animate={{ width: `${(r.won / r.total) * 100}%` }} transition={{ delay: i * 0.06, duration: 0.7 }} />
                </div>
              </div>
            ))}
          </div>
        </Box>
        <Box title="What prospects cared about">
          <div className="space-y-2.5">
            {stats.pri.map(([label, r], i) => (
              <div key={label} className="grid grid-cols-[1fr_auto] items-center gap-3 text-[12.5px]">
                <div>
                  <div className="flex justify-between">
                    <span>{label}</span>
                    <span className="font-mono text-ink-3">{r.total} calls</span>
                  </div>
                  <div className="mt-1 flex h-2 overflow-hidden rounded-full bg-white/[0.05]">
                    <motion.div className="h-full bg-lime" initial={{ width: 0 }} animate={{ width: `${(r.won / r.total) * 100}%` }} transition={{ delay: i * 0.06, duration: 0.7 }} />
                    <motion.div className="h-full bg-violet/60" initial={{ width: 0 }} animate={{ width: `${(1 - r.won / r.total) * 100}%` }} transition={{ delay: i * 0.06, duration: 0.7 }} />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-3 pt-1 text-[11px] text-ink-3">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-lime" /> won
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-violet/60" /> not won
              </span>
            </div>
          </div>
        </Box>
      </div>

      <Box title="Today's recordings · replay any call with live Jev analysis" className="mt-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {CALLS.map((c) => (
            <button key={c.id} onClick={() => onOpenCall(c.id)} className="group flex items-center gap-3 rounded-xl bg-white/[0.03] p-3 text-left ring-1 ring-line transition hover:bg-white/[0.06] hover:ring-lime/30">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg font-display font-bold text-white" style={{ background: `hsl(${c.hue} 60% 45%)` }}>
                {c.company[0]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">{c.company}</span>
                <span className="block truncate text-[11.5px] text-ink-3">{c.contact.name}</span>
              </span>
              <Play size={15} className="text-ink-3 group-hover:text-lime" />
            </button>
          ))}
        </div>
      </Box>

      <div className="panel mt-4 overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
          <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg bg-white/[0.05] px-3 sm:max-w-xs">
            <Search size={14} className="text-ink-3" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search calls…" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-ink-3" />
          </label>
          <div className="flex rounded-full bg-white/[0.05] p-0.5 text-[12px]">
            {([null, "Won", "Follow-up", "Lost"] as const).map((o) => (
              <button key={o ?? "all"} onClick={() => setOutcome(o)} className={`rounded-full px-3 py-1 ${outcome === o ? "bg-white/15 text-ink" : "text-ink-3"}`}>
                {o ?? "All"}
              </button>
            ))}
          </div>
        </div>
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="text-left text-[11.5px] text-ink-3">
              <tr className="border-b border-line">
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-3 font-medium">Account</th>
                <th className="px-3 font-medium">Rep</th>
                <th className="px-3 font-medium">Length</th>
                <th className="px-3 font-medium">Outcome</th>
                <th className="px-3 font-medium">Cared most about</th>
                <th className="px-3 font-medium">Drop-off reason</th>
                <th className="px-4 font-medium">Conversion</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((h) => (
                <tr key={h.id} className="border-b border-line last:border-0 hover:bg-white/[0.025]">
                  <td className="whitespace-nowrap px-4 py-2.5 text-ink-3">{new Date(h.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                  <td className="px-3">
                    <div className="font-medium">{h.company}</div>
                    <div className="text-[11.5px] text-ink-3">
                      {h.contact} · {h.industry}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 text-ink-2">{h.rep}</td>
                  <td className="px-3 font-mono text-ink-3">{h.minutes}m</td>
                  <td className="px-3">
                    <span className="rounded-full px-2 py-0.5 text-[11.5px] font-semibold" style={{ color: OUTCOME_COLOR[h.outcome], background: `color-mix(in srgb, ${OUTCOME_COLOR[h.outcome]} 13%, transparent)` }}>
                      {h.outcome}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 text-ink-2">{h.priority}</td>
                  <td className="whitespace-nowrap px-3 text-ink-3">{h.dropoff ?? "—"}</td>
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full" style={{ width: `${h.conversion * 100}%`, background: OUTCOME_COLOR[h.outcome] }} />
                      </div>
                      <span className="font-mono text-[11.5px] text-ink-3">{pct(h.conversion)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="panel rounded-2xl p-4">
      <div className="text-[12px] text-ink-3">{label}</div>
      <div className="mt-1 font-display text-[1.9rem] font-bold" style={{ color: tone }}>
        {value}
      </div>
    </div>
  );
}

function Box({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`panel rounded-2xl p-4 ${className}`}>
      <h3 className="mb-4 text-[11.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">{title}</h3>
      {children}
    </section>
  );
}
