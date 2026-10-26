import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { searchPlaces } from "@/lib/places";

// POST { city: "Accra", market: "GH", type: "no_website" | "no_social" | "neither", query?: "restaurants" }
// With no query, it searches both "restaurants" and "lounges".
// Header: x-admin-secret
export async function POST(req: Request) {
  if (req.headers.get("x-admin-secret") !== process.env.ADMIN_SECRET)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { query, city, market = "GH", type = "no_website" } = await req.json();
  if (!city) return NextResponse.json({ error: "city is required" }, { status: 400 });

  const queries: string[] = query ? [query] : ["restaurants", "lounges"];
  const batches = await Promise.all(queries.map((q) => searchPlaces(q, city)));
  const seen = new Set<string>();
  const found = batches.flat().filter((l) => !seen.has(l.placeId) && !!seen.add(l.placeId));
  const matches = found.filter((l) =>
    type === "no_website" ? !l.hasWebsite :
    type === "no_social" ? l.socialStatus !== "found" :
    !l.hasWebsite && l.socialStatus !== "found");

  const saved = [];
  for (const l of matches) {
    saved.push(await db.lead.upsert({
      where: { placeId: l.placeId }, update: {},
      create: { ...l, market, city },
    }));
  }
  return NextResponse.json({ searched: found.length, saved: saved.length, leads: saved });
}
