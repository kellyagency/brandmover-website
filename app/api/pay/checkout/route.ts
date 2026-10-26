import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { allow } from "@/lib/ratelimit";
import { findPlan } from "@/lib/plans";

const err = (m: string, s = 400) => NextResponse.json({ error: m }, { status: s });

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "x").split(",")[0].trim();
  if (!allow("pay:" + ip, 10)) return err("Too many attempts. Please try again later.", 429);
  const b = await req.json().catch(() => ({}));
  const plan = findPlan(String(b.plan));
  const cur = b.currency === "GHS" ? "GHS" : b.currency === "USD" ? "USD" : null;
  const name = String(b.name || "").trim(), business = String(b.business || "").trim(), email = String(b.email || "").trim().toLowerCase(), phone = String(b.phone || "").trim();
  if (!plan || !cur) return err("Choose a plan.");
  if (!name || !business || !/^\S+@\S+\.\S+$/.test(email)) return err("Enter your name, business name and a valid email.");
  if (!b.terms) return err("Please accept the terms to continue.");

  const p = plan[cur];
  const first = p.setup + p.monthly;                // first payment, major units (server decides, never the browser)
  const reference = "BM-" + randomUUID().slice(0, 12);
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const provider = cur === "GHS" ? "paystack" : "stripe";
  await db.payment.create({ data: { reference, plan: plan.id, currency: cur, amount: first * 100, provider, name, business, email, phone: phone || null } });

  if (provider === "paystack") {
    if (!process.env.PAYSTACK_SECRET_KEY) return err("Payments are not switched on yet. Please WhatsApp us.", 503);
    const r = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST", headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email, amount: first * 100, currency: "GHS", reference, callback_url: `${site}/pay/thanks`, metadata: { plan: plan.id, business, name } }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j?.data?.authorization_url) return err("Could not start the payment. Please try again.", 502);
    return NextResponse.json({ url: j.data.authorization_url });
  }

  if (!process.env.STRIPE_SECRET_KEY) return err("Payments are not switched on yet. Please WhatsApp us.", 503);
  const f = new URLSearchParams({ mode: "subscription", customer_email: email, client_reference_id: reference, success_url: `${site}/pay/thanks`, cancel_url: `${site}/pay`, "metadata[reference]": reference });
  f.set("line_items[0][quantity]", "1"); f.set("line_items[0][price_data][currency]", "usd");
  f.set("line_items[0][price_data][unit_amount]", String(p.monthly * 100));
  f.set("line_items[0][price_data][recurring][interval]", "month");
  f.set("line_items[0][price_data][product_data][name]", `${plan.name} (monthly)`);
  if (p.setup > 0) {
    f.set("line_items[1][quantity]", "1"); f.set("line_items[1][price_data][currency]", "usd");
    f.set("line_items[1][price_data][unit_amount]", String(p.setup * 100));
    f.set("line_items[1][price_data][product_data][name]", `${plan.name} setup (one time)`);
  }
  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" }, body: f });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.url) return err("Could not start the payment. Please try again.", 502);
  return NextResponse.json({ url: j.url });
}
