"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mic } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CALLS } from "@/lib/calls";
import HowJevListens from "./HowJevListens";
import Library from "./Library";
import LiveConsole from "./LiveConsole";
import MicConsole from "./MicConsole";

type View = "live" | "library" | "how";
const TABS: { id: View; label: string; hash: string }[] = [
  { id: "live", label: "Live call", hash: "" },
  { id: "library", label: "Call library", hash: "library" },
  { id: "how", label: "How Jev listens", hash: "how-jev-listens" },
];

export default function PulseApp() {
  const [view, setViewState] = useState<View>("live");
  const [callId, setCallId] = useState<string>(CALLS[0].id);

  const setView = useCallback((v: View) => {
    setViewState(v);
    const hash = TABS.find((t) => t.id === v)!.hash;
    window.history.replaceState(null, "", hash ? `#${hash}` : window.location.pathname);
    window.scrollTo({ top: 0 });
  }, []);
  useEffect(() => {
    const fromHash = () => {
      const t = TABS.find((x) => x.hash && x.hash === window.location.hash.slice(1));
      if (t) setViewState(t.id);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const call = CALLS.find((c) => c.id === callId);

  return (
    <div className="min-h-screen pb-16">
      <header className="glass sticky top-0 z-40">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
          <button onClick={() => setView("live")} className="flex items-center gap-2">
            <PulseMark />
            <span className="font-display text-[1.2rem] font-bold tracking-tight">Pulse</span>
            <span className="hidden rounded-full bg-lime/12 px-2 py-0.5 text-[10.5px] font-semibold text-lime sm:inline">powered by Jev</span>
          </button>
          <nav className="mx-auto flex rounded-full bg-white/[0.05] p-0.5" aria-label="Sections">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setView(t.id)} className={`relative rounded-full px-3 py-1.5 text-[13px] font-medium sm:px-4 ${view === t.id ? "text-[#0a0c0f]" : "text-ink-2 hover:text-ink"}`}>
                {view === t.id && <motion.span layoutId="tab" className="absolute inset-0 rounded-full bg-lime" transition={{ type: "spring", bounce: 0.18, duration: 0.45 }} />}
                <span className="relative whitespace-nowrap">{t.label}</span>
              </button>
            ))}
          </nav>
          <div className="hidden items-center gap-2 text-[12.5px] text-ink-3 lg:flex">
            <span className="h-2 w-2 rounded-full bg-lime" /> Helio sales team
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 pt-5 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {view === "live" && (
              <>
                <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
                  {CALLS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCallId(c.id)}
                      className={`flex min-w-[210px] items-center gap-3 rounded-2xl p-3 text-left transition ${c.id === callId ? "bg-white/[0.08] ring-1 ring-lime/40" : "panel hover:bg-white/[0.05]"}`}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg font-display font-bold text-white" style={{ background: `hsl(${c.hue} 60% 45%)` }}>
                        {c.company[0]}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold">{c.company}</span>
                        <span className="block truncate text-[11.5px] text-ink-3">
                          {c.scheduled} · {c.seats} seats
                        </span>
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => setCallId("mic")}
                    className={`flex min-w-[190px] items-center gap-3 rounded-2xl p-3 text-left transition ${callId === "mic" ? "bg-white/[0.08] ring-1 ring-coral/50" : "panel hover:bg-white/[0.05]"}`}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-coral/20 text-coral">
                      <Mic size={17} />
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold">Live mic</span>
                      <span className="block text-[11.5px] text-ink-3">Speak or type a call</span>
                    </span>
                  </button>
                </div>
                {call ? <LiveConsole key={call.id} call={call} /> : <MicConsole />}
              </>
            )}
            {view === "library" && (
              <Library
                onOpenCall={(id) => {
                  setCallId(id);
                  setView("live");
                }}
              />
            )}
            {view === "how" && <HowJevListens />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function PulseMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
      <rect width="26" height="26" rx="8" fill="var(--lime)" />
      <path d="M4 14h4l2.5-6 4 11 2.5-7H22" fill="none" stroke="#0a0c0f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
