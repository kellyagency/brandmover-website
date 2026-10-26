// Simple in-memory limiter. On serverless it resets per instance, so it slows abuse but is not airtight.
const hits = new Map<string, number[]>();
export function allow(key: string, max = 5, windowMs = 3600_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) { hits.set(key, recent); return false; }
  recent.push(now); hits.set(key, recent);
  return true;
}
