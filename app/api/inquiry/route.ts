import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (b.company2) return NextResponse.json({ ok: true }); // honeypot: bots fill this
  const s = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
  const name = s(b.name, 100), business = s(b.business, 120);
  const phone = s(b.phone, 40), email = s(b.email, 150);
  const interest = ["website", "social", "both"].includes(b.interest) ? b.interest : "both";
  const country = ["US", "GH", "other"].includes(b.country) ? b.country : "other";
  if (!name || !business || (!phone && !email))
    return NextResponse.json({ error: "Name, business and a phone or email are required." }, { status: 400 });
  await db.inquiry.create({ data: { name, business, phone, email, interest, country, message: s(b.message, 1000) } });
  return NextResponse.json({ ok: true });
}
