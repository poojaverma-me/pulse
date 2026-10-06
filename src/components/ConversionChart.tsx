"use client";

import { motion } from "framer-motion";

export type ChartPoint = { turn: number; p: number; event?: { label: string; tone: "good" | "bad" | "info" } };

const W = 640;
const H = 230;
const PAD = { l: 34, r: 14, t: 18, b: 26 };

/** Conversion probability after every turn, with key moments pinned to the line. */
export default function ConversionChart({ points, totalTurns }: { points: ChartPoint[]; totalTurns: number }) {
  const x = (turn: number) => PAD.l + ((turn - 1) / Math.max(1, totalTurns - 1)) * (W - PAD.l - PAD.r);
  const y = (p: number) => PAD.t + (1 - p) * (H - PAD.t - PAD.b);
  const line = points.map((pt, i) => `${i ? "L" : "M"}${x(pt.turn).toFixed(1)} ${y(pt.p).toFixed(1)}`).join(" ");
  const area = points.length ? `${line} L${x(points.at(-1)!.turn)} ${y(0)} L${x(points[0].turn)} ${y(0)} Z` : "";
  const tone = { good: "var(--lime)", bad: "var(--coral)", info: "var(--sky)" };
  const events = points.filter((p) => p.event);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Conversion probability over the call">
      <defs>
        <linearGradient id="convFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--lime)" stopOpacity="0.32" />
          <stop offset="0.55" stopColor="var(--lime)" stopOpacity="0.06" />
          <stop offset="1" stopColor="var(--coral)" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="convStroke" x1="0" x2="0" y1={y(1)} y2={y(0)} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--lime)" />
          <stop offset="0.5" stopColor="var(--amber)" />
          <stop offset="1" stopColor="var(--coral)" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((g) => (
        <g key={g}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(g)} y2={y(g)} stroke={g === 0.5 ? "var(--line-2)" : "var(--line)"} strokeDasharray={g === 0.5 ? "4 4" : undefined} />
          <text x={PAD.l - 8} y={y(g)} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="var(--ink-3)">
            {g * 100}%
          </text>
        </g>
      ))}
      {Array.from({ length: totalTurns }, (_, i) => i + 1)
        .filter((t) => t === 1 || t % 4 === 0 || t === totalTurns)
        .map((t) => (
          <text key={t} x={x(t)} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--ink-3)">
            {t}
          </text>
        ))}
      {points.length > 1 && (
        <>
          <motion.path d={area} fill="url(#convFill)" initial={false} animate={{ d: area }} transition={{ duration: 0.5 }} />
          <motion.path d={line} fill="none" stroke="url(#convStroke)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" initial={false} animate={{ d: line }} transition={{ duration: 0.5 }} />
        </>
      )}
      {points.map((pt) => (
        <circle key={pt.turn} cx={x(pt.turn)} cy={y(pt.p)} r={pt.event ? 4.5 : 2.5} fill={pt.event ? tone[pt.event.tone] : "var(--ink)"} stroke="var(--panel)" strokeWidth={1.5} />
      ))}
      {events.map((pt, i) => {
        const above = pt.p < 0.72;
        const ly = above ? y(pt.p) - 16 - (i % 2) * 14 : y(pt.p) + 18 + (i % 2) * 14;
        const lx = Math.min(W - PAD.r - 4, Math.max(PAD.l + 4, x(pt.turn)));
        return (
          <motion.g key={`${pt.turn}-${pt.event!.label}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <line x1={x(pt.turn)} x2={x(pt.turn)} y1={y(pt.p)} y2={ly} stroke={tone[pt.event!.tone]} strokeOpacity={0.5} />
            <text x={lx} y={ly + (above ? -3 : 9)} textAnchor={x(pt.turn) > W - 110 ? "end" : x(pt.turn) < 110 ? "start" : "middle"} fontSize="10.5" fontWeight={600} fill={tone[pt.event!.tone]}>
              {pt.event!.label}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}
