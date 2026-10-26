import { db } from "@/lib/db";
// Marks a payment paid (safe to call twice) and moves any matching lead to "paid".
export async function markPaid(reference: string) {
  const p = await db.payment.findUnique({ where: { reference } });
  if (!p || p.status === "paid") return;
  await db.payment.update({ where: { reference }, data: { status: "paid", paidAt: new Date() } });
  await db.lead.updateMany({ where: { email: p.email }, data: { status: "paid" } });
}
