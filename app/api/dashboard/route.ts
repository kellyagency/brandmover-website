import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { draftEmail, type Segment } from "@/lib/outreach";

const DAILY_CAP = 50;
const STATUSES = ["lead_found","outreach_sent","replied_interested","call_booked","proposal_sent","paid","building_website","preview_ready","approved","delivered","opted_out"];
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
const authed = (req: Request) => !!process.env.ADMIN_SECRET && req.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
const startOfDay = () => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d; };

export async function GET(req: Request) {
  if (!authed(req)) return bad("Unauthorized", 401);
  const leads = await db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 300, include: { outreach: { orderBy: { createdAt: "desc" }, take: 1 } } });
  const sentToday = await db.outreach.count({ where: { sentAt: { gte: startOfDay() } } });
  return NextResponse.json({ leads, sentToday, cap: DAILY_CAP });
}

// POST { action: "draft"|"approve"|"send"|"status"|"optout"|"email", ... }
export async function POST(req: Request) {
  if (!authed(req)) return bad("Unauthorized", 401);
  const b = await req.json().catch(() => ({}));

  if (b.action === "draft") {
    const lead = await db.lead.findUnique({ where: { id: b.leadId } });
    if (!lead) return bad("Lead not found", 404);
    if (lead.optedOut) return bad("This lead opted out. Never contact again.");
    const segment: Segment = !lead.hasWebsite ? (lead.socialStatus === "found" ? "no_website" : "neither") : "no_social";
    const d = draftEmail({ name: lead.name, city: lead.city, segment, market: lead.market, category: lead.category ?? undefined });
    const o = await db.outreach.create({ data: { leadId: lead.id, subject: d.subject, body: d.body } });
    return NextResponse.json({ outreach: o });
  }

  if (b.action === "approve") {
    const o = await db.outreach.update({ where: { id: b.outreachId }, data: { approved: true, subject: String(b.subject), body: String(b.body) } });
    return NextResponse.json({ outreach: o });
  }

  if (b.action === "send") {
    const o = await db.outreach.findUnique({ where: { id: b.outreachId }, include: { lead: true } });
    if (!o) return bad("Draft not found", 404);
    if (!o.approved) return bad("Approve the draft first. Nothing is sent without your approval.");
    if (o.sentAt) return bad("Already sent.");
    if (o.lead.optedOut) return bad("This lead opted out.");
    if (!o.lead.email) return bad("Add an email address for this lead first.");
    if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) return bad("Set RESEND_API_KEY and RESEND_FROM in your environment to send.");
    if ((await db.outreach.count({ where: { sentAt: { gte: startOfDay() } } })) >= DAILY_CAP) return bad(`Daily limit of ${DAILY_CAP} emails reached.`);
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.RESEND_FROM, to: o.lead.email, subject: o.subject, text: o.body }),
    });
    if (!r.ok) return bad(`Email provider error: ${(await r.text()).slice(0, 200)}`, 502);
    await db.$transaction([
      db.outreach.update({ where: { id: o.id }, data: { sentAt: new Date() } }),
      db.lead.update({ where: { id: o.leadId }, data: { status: "outreach_sent" } }),
    ]);
    return NextResponse.json({ ok: true });
  }

  if (b.action === "status") {
    if (!STATUSES.includes(b.status)) return bad("Unknown status");
    return NextResponse.json({ lead: await db.lead.update({ where: { id: b.leadId }, data: { status: b.status } }) });
  }
  if (b.action === "optout") {
    return NextResponse.json({ lead: await db.lead.update({ where: { id: b.leadId }, data: { optedOut: true, status: "opted_out" } }) });
  }
  if (b.action === "email") {
    return NextResponse.json({ lead: await db.lead.update({ where: { id: b.leadId }, data: { email: String(b.email).trim() || null } }) });
  }
  return bad("Unknown action");
}
