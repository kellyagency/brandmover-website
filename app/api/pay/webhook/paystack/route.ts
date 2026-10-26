import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { markPaid } from "@/lib/paid";

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-paystack-signature") || "";
  const want = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "").update(raw).digest("hex");
  if (sig.length !== want.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return NextResponse.json({ error: "bad signature" }, { status: 401 });
  const e = JSON.parse(raw);
  if (e.event === "charge.success" && e.data?.reference) await markPaid(String(e.data.reference));
  return NextResponse.json({ ok: true });
}
