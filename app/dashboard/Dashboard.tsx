"use client";
import { useCallback, useEffect, useState } from "react";

type O = { id: string; subject: string; body: string; approved: boolean; sentAt: string | null };
type L = { id: string; name: string; category: string | null; city: string; phone: string | null; email: string | null; hasWebsite: boolean; socialStatus: string; market: string; status: string; optedOut: boolean; outreach: O[] };

const STAGES = ["lead_found","outreach_sent","replied_interested","call_booked","proposal_sent","paid","building_website","preview_ready","approved","delivered"];
const label = (s: string) => s.replace(/_/g, " ");

export default function Dashboard() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [leads, setLeads] = useState<L[]>([]);
  const [sentToday, setSentToday] = useState(0);
  const [cap, setCap] = useState(50);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<L | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const call = useCallback(async (k: string, method: "GET" | "POST", data?: object) => {
    const r = await fetch("/api/dashboard", { method, headers: { "x-admin-secret": k, "Content-Type": "application/json" }, body: data ? JSON.stringify(data) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || "Something went wrong");
    return j;
  }, []);

  const load = useCallback(async (k: string) => {
    const j = await call(k, "GET");
    setLeads(j.leads); setSentToday(j.sentToday); setCap(j.cap); setAuthed(true);
    return j.leads as L[];
  }, [call]);

  useEffect(() => { const k = sessionStorage.getItem("bm_key"); if (k) { setKey(k); load(k).catch(() => sessionStorage.removeItem("bm_key")); } }, [load]);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    try { await load(key); sessionStorage.setItem("bm_key", key); } catch (err) { setMsg((err as Error).message); }
  }

  function openLead(l: L) { const o = l.outreach[0]; setOpen(l); setSubject(o?.subject ?? ""); setBody(o?.body ?? ""); setEmail(l.email ?? ""); setMsg(""); }
  async function act(fn: () => Promise<void>) {
    setBusy(true); setMsg("");
    try { await fn(); const fresh = await load(key); if (open) { const u = fresh.find((x) => x.id === open.id); if (u) setOpen(u); } }
    catch (err) { setMsg((err as Error).message); }
    setBusy(false);
  }

  if (!authed) return (
    <main className="bm-login"><form onSubmit={login} className="bm-card">
      <h1>BrandMover</h1><p>Enter your admin secret to open the dashboard.</p>
      <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Admin secret" autoFocus />
      <button className="bm-btn go">Open dashboard</button>{msg && <p className="bm-err">{msg}</p>}
    </form></main>
  );

  const shown = leads.filter((l) => filter === "all" ? true : filter === "review" ? l.outreach[0] && !l.outreach[0].sentAt : l.status === filter);
  const count = (s: string) => leads.filter((l) => l.status === s).length;
  const toReview = leads.filter((l) => l.outreach[0] && !l.outreach[0].sentAt && !l.optedOut).length;
  const o = open?.outreach[0];

  return (
    <div className="bm">
      <header className="bm-top"><b>BrandMover</b><span>Lead pipeline</span>
        <button className="bm-btn ghost" onClick={() => { sessionStorage.removeItem("bm_key"); setAuthed(false); }}>Sign out</button></header>

      <section className="bm-stats">
        <div className="stat s1"><small>Total leads</small><b>{leads.length}</b></div>
        <div className="stat s2"><small>Drafts to review</small><b>{toReview}</b></div>
        <div className="stat s3"><small>Sent today</small><b>{sentToday}<i>/{cap}</i></b></div>
        <div className="stat s4"><small>Paying clients</small><b>{count("paid") + count("delivered")}</b></div>
      </section>

      <nav className="bm-chips" aria-label="Filter leads">
        {[["all", "All"], ["review", "Needs review"], ...STAGES.map((s) => [s, label(s)])].map(([k, t]) => (
          <button key={k} className={"chip" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>{t}{k !== "all" && k !== "review" ? ` ${count(k)}` : ""}</button>))}
      </nav>

      <div className="bm-table" role="table">
        {shown.length === 0 && <p className="bm-empty">No leads here yet. Run the lead finder, then they will show up in this list.</p>}
        {shown.map((l) => (
          <button key={l.id} className="row" onClick={() => openLead(l)}>
            <span className="nm"><b>{l.name}</b><small>{l.category ?? "Restaurant"} · {l.city}</small></span>
            <span className="tags">
              <em className={l.hasWebsite ? "t ok" : "t warn"}>{l.hasWebsite ? "Has website" : "No website"}</em>
              <em className={l.socialStatus === "found" ? "t ok" : "t plum"}>{l.socialStatus === "found" ? "Social found" : "Social unknown"}</em>
              {l.outreach[0] && !l.outreach[0].sentAt && <em className="t gold">{l.outreach[0].approved ? "Approved" : "Draft"}</em>}
            </span>
            <span className={"st " + l.status}>{label(l.status)}</span>
          </button>))}
      </div>

      {open && (
        <div className="bm-drawer" role="dialog" aria-label={open.name}>
          <div className="panel">
            <button className="x" onClick={() => setOpen(null)} aria-label="Close">×</button>
            <h2>{open.name}</h2>
            <p className="meta">{open.city} · {open.phone ?? "No phone listed"} · {open.market}</p>

            <label>Email address<div className="inline">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@restaurant.com" />
              <button className="bm-btn ghost" disabled={busy} onClick={() => act(async () => { await call(key, "POST", { action: "email", leadId: open.id, email }); })}>Save</button></div></label>

            {open.optedOut ? <p className="bm-err">Opted out. Never contact this business again.</p> : !o ? (
              <button className="bm-btn go" disabled={busy} onClick={() => act(async () => { const j = await call(key, "POST", { action: "draft", leadId: open.id }); setSubject(j.outreach.subject); setBody(j.outreach.body); })}>Write outreach draft</button>
            ) : (<>
              <label>Subject<input value={subject} onChange={(e) => setSubject(e.target.value)} disabled={!!o.sentAt} /></label>
              <label>Message<textarea rows={11} value={body} onChange={(e) => setBody(e.target.value)} disabled={!!o.sentAt} /></label>
              {o.sentAt ? <p className="ok-note">Sent {new Date(o.sentAt).toLocaleString()}</p> : (
                <div className="inline">
                  <button className="bm-btn ghost" disabled={busy} onClick={() => act(async () => { await call(key, "POST", { action: "approve", outreachId: o.id, subject, body }); })}>{o.approved ? "Save edits" : "Approve draft"}</button>
                  <button className="bm-btn go" disabled={busy || !o.approved} onClick={() => act(async () => { await call(key, "POST", { action: "send", outreachId: o.id }); })}>Send email</button>
                </div>)}
            </>)}

            <label>Pipeline stage
              <select value={open.status} onChange={(e) => act(async () => { await call(key, "POST", { action: "status", leadId: open.id, status: e.target.value }); })}>
                {[...STAGES, "opted_out"].map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></label>
            {!open.optedOut && <button className="bm-btn danger" disabled={busy} onClick={() => { if (confirm("Mark as opted out? They will never be contacted again.")) act(async () => { await call(key, "POST", { action: "optout", leadId: open.id }); }); }}>Mark as opted out</button>}
            {msg && <p className="bm-err" role="alert">{msg}</p>}
          </div>
        </div>)}
    </div>
  );
}
