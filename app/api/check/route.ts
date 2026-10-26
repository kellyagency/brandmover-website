import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { lookupBusiness } from "@/lib/places";
import { allow } from "@/lib/ratelimit";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (b.company2) return NextResponse.json({ ok: true }); // honeypot
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (!allow(ip)) return NextResponse.json({ error: "Too many checks. Please try again later." }, { status: 429 });

  const s = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
  const business = s(b.business, 120), city = s(b.city, 80), name = s(b.name, 100), contact = s(b.contact, 150);
  const country = ["US", "GH", "other"].includes(b.country) ? b.country : "other";
  if (!business || !city || !contact)
    return NextResponse.json({ error: "Business name, city and a phone or email are required." }, { status: 400 });
  const isEmail = contact.includes("@");

  let result: any = null, failed = false;
  try {
    const f = await lookupBusiness(business, city);
    result = f ? {
      found: true, name: f.name, address: f.address ?? null,
      hasWebsite: f.hasWebsite, socialStatus: f.socialStatus, phoneListed: !!f.phone,
    } : { found: false };
  } catch { failed = true; }

  const summary = failed ? "lookup failed"
    : !result.found ? "no Google listing found"
    : `listing found; website: ${result.hasWebsite ? "yes" : "no"}; social: ${result.socialStatus}`;
  await db.inquiry.create({ data: {
    name: name || "Presence check", business,
    phone: isEmail ? "" : contact, email: isEmail ? contact : "",
    interest: "both", country, source: "presence_check",
    message: `Presence check in ${city}: ${summary}`,
  } });

  if (failed) return NextResponse.json({ error: "We couldn’t run the check right now. We’ll review it by hand and contact you." }, { status: 502 });
  return NextResponse.json({ ok: true, result });
}
