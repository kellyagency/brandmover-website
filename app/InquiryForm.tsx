"use client";
import { useState } from "react";

export default function InquiryForm() {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      setState(r.ok ? "ok" : "err");
      if (r.ok) e.currentTarget.reset();
    } catch { setState("err"); }
  }
  return (
    <form onSubmit={submit}>
      <label>Your name<input name="name" required autoComplete="name" /></label>
      <label>Restaurant or lounge name<input name="business" required /></label>
      <label>Phone or WhatsApp<input name="phone" inputMode="tel" autoComplete="tel" /></label>
      <label>Email<input name="email" type="email" autoComplete="email" /></label>
      <label>Where is your business?
        <select name="country" defaultValue="US">
          <option value="US">United States</option>
          <option value="GH">Ghana</option>
          <option value="other">Somewhere else</option>
        </select>
      </label>
      <label>What do you need?
        <select name="interest" defaultValue="both">
          <option value="website">A website</option>
          <option value="social">Social media</option>
          <option value="both">Both</option>
        </select>
      </label>
      <label>Anything we should know (optional)<textarea name="message" rows={3} /></label>
      <input className="hp" name="company2" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button className="btn" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send my request"}</button>
      {state === "ok" && <p className="msg ok" role="status">Thanks. We’ll get back to you within one business day.</p>}
      {state === "err" && <p className="msg err" role="alert">That didn’t send. Check your details and try again.</p>}
      <p className="lead" style={{ fontSize: 14 }}>Give us a phone number or an email so we can reach you.</p>
    </form>
  );
}
