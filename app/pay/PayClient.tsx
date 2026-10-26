"use client";
import { useState } from "react";
import { PLANS, findPlan, money, type Cur } from "@/lib/plans";
import { WHATSAPP_LINK } from "@/lib/config";

export default function PayClient({ defaultCur, defaultPlan }: { defaultCur: Cur; defaultPlan: string }) {
  const [cur, setCur] = useState<Cur>(defaultCur);
  const [plan, setPlan] = useState(findPlan(defaultPlan)?.id ?? "bundle");
  const [f, setF] = useState({ name: "", business: "", email: "", phone: "", terms: false });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const p = findPlan(plan)!;
  const price = p[cur];
  const first = price.setup + price.monthly;
  const upd = (k: string, v: string | boolean) => setF({ ...f, [k]: v });

  async function go(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/pay/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, plan, currency: cur }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Something went wrong.");
      window.location.href = j.url;
    } catch (x) { setErr((x as Error).message); setBusy(false); }
  }

  return (
    <div className="pay">
      <header className="pay-head"><a href="/" className="pay-logo">BrandMover</a>
        <span className="pay-lock">🔒 Secure checkout</span></header>
      <main className="pay-grid">
        <section aria-labelledby="h-plan">
          <div className="pay-title"><h1 id="h-plan">Choose your plan</h1>
            <div className="seg" role="group" aria-label="Currency">
              {(["GHS", "USD"] as Cur[]).map((c) => <button key={c} type="button" aria-pressed={cur === c} className={cur === c ? "on" : ""} onClick={() => setCur(c)}>{c === "GHS" ? "Ghana (GHS)" : "US (USD)"}</button>)}
            </div></div>
          <div className="plans">
            {PLANS.map((x) => (
              <label key={x.id} className={"plan" + (plan === x.id ? " sel" : "")}>
                <input type="radio" name="plan" checked={plan === x.id} onChange={() => setPlan(x.id)} />
                {"best" in x && x.best && <span className="badge">Best value</span>}
                <b>{x.name}</b><p>{x.blurb}</p>
                <div className="amt">{x[cur].setup > 0 && <span>{money(x[cur].setup, cur)} once + </span>}<strong>{money(x[cur].monthly, cur)}</strong>/month</div>
                <ul>{x.features.map((t) => <li key={t}>{t}</li>)}</ul>
              </label>))}
          </div>
          <div className="trust">
            <div><b>Pay your way</b><span>{cur === "GHS" ? "Mobile Money, cards and bank transfer via Paystack." : "Credit and debit cards, Apple Pay and Google Pay via Stripe."}</span></div>
            <div><b>No surprises</b><span>Cancel any time. You approve everything before it goes live.</span></div>
            <div><b>Your data is safe</b><span>We never see or store your card or Mobile Money details.</span></div>
          </div>
        </section>

        <aside>
          <form className="pay-box" onSubmit={go}>
            <h2>Your details</h2>
            <label>Your name<input required value={f.name} onChange={(e) => upd("name", e.target.value)} autoComplete="name" /></label>
            <label>Business name<input required value={f.business} onChange={(e) => upd("business", e.target.value)} autoComplete="organization" /></label>
            <label>Email for your receipt<input required type="email" value={f.email} onChange={(e) => upd("email", e.target.value)} autoComplete="email" /></label>
            <label>Phone or WhatsApp (optional)<input type="tel" value={f.phone} onChange={(e) => upd("phone", e.target.value)} autoComplete="tel" /></label>
            <div className="sum" aria-live="polite">
              <div><span>{p.name} monthly</span><span>{money(price.monthly, cur)}</span></div>
              {price.setup > 0 && <div><span>Setup (one time)</span><span>{money(price.setup, cur)}</span></div>}
              <div className="tot"><span>Due today</span><span>{money(first, cur)}</span></div>
              <small>{cur === "USD" ? `Then ${money(price.monthly, cur)} every month until you cancel.` : `Your first payment is ${money(first, cur)}. We will send you a payment link each month for ${money(price.monthly, cur)}.`}</small>
            </div>
            <label className="chk"><input type="checkbox" checked={f.terms} onChange={(e) => upd("terms", e.target.checked)} /> I agree to the service terms and understand I can cancel any time.</label>
            {err && <p className="pay-err" role="alert">{err}</p>}
            <button className="pay-btn" disabled={busy}>{busy ? "Redirecting to secure payment…" : `Pay ${money(first, cur)} securely`}</button>
            <p className="help">Questions first? <a href={WHATSAPP_LINK}>Chat with us on WhatsApp</a></p>
          </form>
        </aside>
      </main>
    </div>
  );
}
