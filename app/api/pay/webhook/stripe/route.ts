import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { markPaid } from "@/lib/paid";

export async function POST(req: Request) {
  const raw = await req.text();
  const parts = Object.fromEntries((req.headers.get("stripe-signature") || "").split(",").map((s) => s.split("=") as [string, string]));
  const want = createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET || "").update(`${parts.t}.${raw}`).digest("hex");
  const ok = !!parts.v1 && parts.v1.length === want.length && timingSafeEqual(Buffer.from(parts.v1), Buffer.from(want));
  if (!ok || Math.abs(Date.now() / 1000 - Number(parts.t)) > 300) return NextResponse.json({ error: "bad signature" }, { status: 401 });
  const e = JSON.parse(raw);
  if (e.type === "checkout.session.completed" && e.data?.object?.client_reference_id) await markPaid(String(e.data.object.client_reference_id));
  return NextResponse.json({ ok: true });
}
