"use client";
import { useState } from "react";
import { WHATSAPP_LINK } from "@/lib/config";

type R = { found: boolean; name?: string; address?: string | null; hasWebsite?: boolean; socialStatus?: string; phoneListed?: boolean };

function Row({ ok, label, detail }: { ok: boolean | null; label: string; detail: string }) {
  return (
    <div className="card" style={{ borderColor: ok === false ? "var(--gold)" : undefined }}>
      <b>{ok === true ? "✓ " : ok === false ? "✗ " : "? "}{label}</b>
      <small>{detail}</small>
    </div>
  );
}

export default function CheckForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "err">("idle");
  const [err, setErr] = useState("");
  const [res, setRes] = useState<R | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch("/api/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const j = await r.json();
      if (r.ok && j.result) { setRes(j.result); setState("done"); }
      else { setErr(j.error ?? "Something went wrong. Please try again."); setState("err"); }
    } catch { setErr("Something went wrong. Please try again."); setState("err"); }
  }

  if (state === "done" && res) {
    return (
      <div style={{ marginTop: 18, display: "grid", gap: 12, maxWidth: 560 }} aria-live="polite">
        {res.found ? (
          <>
            <p className="lead">Closest match: <b>{res.name}</b>{res.address ? `, ${res.address}` : ""}. If that isn’t your business, tell us and we’ll check again.</p>
            <Row ok label="Listed on Google Maps" detail="Diners searching for places to eat nearby can see you." />
            <Row ok={res.hasWebsite ?? false} label="Website" detail={res.hasWebsite ? "Your listing links to a website." : "No website is linked from your listing. Diners often want to see a menu before they visit, and may choose a place that has one."} />
            <Row ok={res.socialStatus === "found" ? true : null} label="Social media" detail={res.socialStatus === "found" ? "Your listing links to a social page." : "We can’t see social pages from a listing, so send us yours and we’ll review it by hand."} />
            <Row ok={res.phoneListed ?? false} label="Phone number listed" detail={res.phoneListed ? "Customers can call you from Google." : "No phone number shows on your listing."} />
          </>
        ) : (
          <>
            <Row ok={false} label="Google Maps listing" detail="We couldn’t find a listing matching that name and city. If you have one under another name, tell us. If not, we can set one up for you." />
          </>
        )}
        <p className="lead">We’ll follow up with a free recommendation. To talk now:</p>
        <div><a className="btn" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>{" "}<a className="btn alt" href="/#start">Request a free preview</a></div>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <label>Restaurant or lounge name<input name="business" required /></label>
      <label>City<input name="city" required autoComplete="address-level2" /></label>
      <label>Country
        <select name="country" defaultValue="US">
          <option value="US">United States</option>
          <option value="GH">Ghana</option>
          <option value="other">Somewhere else</option>
        </select>
      </label>
      <label>Your name (optional)<input name="name" autoComplete="name" /></label>
      <label>Phone or email<input name="contact" required autoComplete="email" /></label>
      <input className="hp" name="company2" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="btn" disabled={state === "sending"}>{state === "sending" ? "Checking…" : "Check my business"}</button>
      {state === "err" && <p className="msg err" role="alert">{err}</p>}
    </form>
  );
}
