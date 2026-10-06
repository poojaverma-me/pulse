import { analyzeCall } from "@/lib/analyze";
import { cleanTurns } from "@/lib/clean";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { company?: string; turns?: unknown };
  const turns = cleanTurns(body.turns);
  if (turns.filter((t) => t.speaker === "client").length < 2) return Response.json({ error: "need at least two prospect turns" }, { status: 400 });
  try {
    return Response.json(await analyzeCall(String(body.company ?? "the prospect"), turns));
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
}
