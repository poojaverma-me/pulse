export const pct = (p: number) => `${Math.round(p * 100)}%`;
export const usd = (n: number) => (n === 0 ? "$0" : n < 0.01 ? `$${n.toFixed(5)}` : `$${n.toFixed(3)}`);
export const ms = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)} s` : `${Math.round(n)} ms`);
export const clock = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
export const initials = (s: string) =>
  s
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
