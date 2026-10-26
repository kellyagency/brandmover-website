import { NextResponse } from "next/server";
import { searchPlaces } from "@/lib/places";

// POST { cities: ["Houston, TX", "Atlanta, GA"], query?: "restaurants" }   Header: x-admin-secret
// Runs ONE Places search per city (max 10 cities) and reports how many of the results have no website.
// Compare cities by that share, then run the full lead finder in the winner.
export async function POST(req: Request) {
  if (req.headers.get("x-admin-secret") !== process.env.ADMIN_SECRET)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { cities, query = "restaurants" } = await req.json().catch(() => ({}));
  if (!Array.isArray(cities) || cities.length === 0)
    return NextResponse.json({ error: "cities must be a non-empty array" }, { status: 400 });

  const rows: { city: string; sampled?: number; noWebsite?: number; sharePct?: number | null; error?: string }[] = [];
  for (const city of cities.slice(0, 10).map(String)) {
    try {
      const found = await searchPlaces(query, city);
      const noWebsite = found.filter((l) => !l.hasWebsite).length;
      rows.push({ city, sampled: found.length, noWebsite, sharePct: found.length ? Math.round((noWebsite / found.length) * 100) : null });
    } catch (e) { rows.push({ city, error: String(e).slice(0, 200) }); }
  }
  rows.sort((a, b) => (b.sharePct ?? -1) - (a.sharePct ?? -1));
  return NextResponse.json({
    note: "Each city is a sample of up to 20 top-ranked results, so treat it as a rough signal. Well-known places rank first, so the real share without a website is probably higher.",
    rows,
  });
}
