"use client";

import { Mic, MicOff, PhoneOff, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Speaker, Turn } from "@/lib/types";
import { CallHeader, ConsoleLayout } from "./LiveConsole";
import { Waveform } from "./Panels";
import { useAnalysis } from "./useSession";

type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};

function getRecognition(): (new () => Recognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const COMPANY = "Your prospect";

/** Speak (or type) both sides of a call; every finished line is analysed by Jev. */
export default function MicConsole() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [speaker, setSpeaker] = useState<Speaker>("client");
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [draft, setDraft] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [started] = useState(() => Date.now());
  const [now, setNow] = useState(started);
  const rec = useRef<Recognition | null>(null);
  const speakerRef = useRef(speaker);
  useEffect(() => {
    speakerRef.current = speaker;
  }, [speaker]);
  const { insights, post, postLoading, analyze, finish, reset } = useAnalysis(COMPANY);
  const supported = typeof window !== "undefined" && !!getRecognition();

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const add = useCallback(
    (text: string, who: Speaker) => {
      const clean = text.trim();
      if (!clean) return;
      setTurns((prev) => {
        const next = [...prev, { speaker: who, text: clean[0].toUpperCase() + clean.slice(1) }];
        void analyze(next);
        return next;
      });
    },
    [analyze],
  );

  const toggleMic = () => {
    if (listening) {
      rec.current?.stop();
      setListening(false);
      return;
    }
    const R = getRecognition();
    if (!R) return;
    const r = new R();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";
    r.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) add(res[0].transcript, speakerRef.current);
        else live += res[0].transcript;
      }
      setInterim(live);
    };
    r.onerror = (e) => setMicError(e.error === "not-allowed" ? "Microphone permission was denied." : `Speech recognition error: ${e.error}`);
    r.onend = () => setListening(false);
    rec.current = r;
    setMicError(null);
    r.start();
    setListening(true);
  };

  useEffect(() => () => rec.current?.stop(), []);

  const names = { rep: "You (rep)", client: "Prospect" };

  return (
    <ConsoleLayout
      header={
        <CallHeader
          company="Live call"
          sub={supported ? "Microphone transcription in your browser" : "Type each line (speech recognition needs Chrome)"}
          rep="you"
          hue={120}
          live={listening}
          clockSec={(now - started) / 1000}
          waveform={<Waveform active={listening && !!interim} speaker={speaker} />}
          controls={
            <div className="flex items-center gap-2">
              <div className="flex rounded-full bg-white/[0.06] p-0.5 text-[12px]">
                {(["client", "rep"] as Speaker[]).map((s) => (
                  <button key={s} onClick={() => setSpeaker(s)} className={`rounded-full px-3 py-1 font-medium ${speaker === s ? (s === "rep" ? "bg-sky/25 text-sky" : "bg-violet/25 text-violet") : "text-ink-3"}`}>
                    {s === "rep" ? "Rep speaking" : "Prospect speaking"}
                  </button>
                ))}
              </div>
              {supported && (
                <button onClick={toggleMic} className={`grid h-10 w-10 place-items-center rounded-full ${listening ? "bg-coral text-white" : "bg-lime text-[#0a0c0f]"}`} aria-label={listening ? "Stop microphone" : "Start microphone"}>
                  {listening ? <MicOff size={17} /> : <Mic size={17} />}
                </button>
              )}
              <button
                disabled={turns.filter((t) => t.speaker === "client").length < 2 || postLoading}
                onClick={() => {
                  rec.current?.stop();
                  void finish(turns);
                }}
                className="flex h-10 items-center gap-1.5 rounded-full bg-white/[0.08] px-3 text-[13px] font-medium text-ink-2 hover:text-ink disabled:opacity-40"
              >
                <PhoneOff size={15} /> End call
              </button>
            </div>
          }
        />
      }
      turns={turns}
      partial={interim ? { speaker, text: interim } : null}
      totalTurns={Math.max(12, turns.length + 2)}
      insights={insights}
      names={names}
      post={post}
      postLoading={postLoading}
      minutes={(now - started) / 60000}
      footer={
        <div className="panel rounded-2xl p-3">
          {micError && <div className="mb-2 text-[12px] text-coral">{micError}</div>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              add(draft, speaker);
              setDraft("");
            }}
            className="flex items-center gap-2"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={speaker === "rep" ? "Type what the rep says…" : "Type what the prospect says…"}
              className="h-10 flex-1 rounded-xl bg-white/[0.05] px-3 text-[14px] outline-none ring-1 ring-line focus:ring-lime/40"
            />
            <button className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.08] text-ink-2 hover:text-ink" aria-label="Add line">
              <Send size={15} />
            </button>
            {turns.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setTurns([]);
                  reset();
                }}
                className="h-10 rounded-xl px-3 text-[12.5px] text-ink-3 hover:text-ink"
              >
                Clear
              </button>
            )}
          </form>
          <div className="mt-2 text-[11.5px] text-ink-3">Try: “Honestly the price is more than we budgeted, and we already use another tool.”</div>
        </div>
      }
    />
  );
}
