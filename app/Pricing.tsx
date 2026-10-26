"use client";
import { useState } from "react";

// Starter prices. [name, one-off, per month]. Edit freely.
const PLANS = {
  GHS: { sym: "GHS ", v: [["Website", 2000, 250], ["Social media starter", 0, 900], ["Social media growth", 0, 1500], ["Website + social growth", 2500, 1200]] },
  USD: { sym: "$", v: [["Website", 600, 49], ["Social media starter", 0, 400], ["Social media growth", 0, 800], ["Website + social growth", 700, 600]] },
} as const;
const BULLETS = [
  ["Menu, hours, location and photos on one mobile-friendly page", "Call, WhatsApp and directions buttons", "Hosting, security and menu updates every month"],
  ["Profile set up and branded", "12 posts a month: dishes, specials and events", "A short monthly report"],
  ["Everything in the starter plan", "Two platforms and 20 posts a month", "Event and weekend promotions, plus a monthly report"],
  ["Everything in Website and Social media growth", "One invoice, one person to talk to", "Your site and posts match"],
];

export default function Pricing({ defaultCur = "USD" }: { defaultCur?: "GHS" | "USD" }) {
  const [cur, setCur] = useState<"GHS" | "USD">(defaultCur);
  const p = PLANS[cur];
  return (
    <>
      <div className="tog" role="group" aria-label="Currency">
        {(["GHS", "USD"] as const).map((c) => (
          <button key={c} aria-pressed={cur === c} onClick={() => setCur(c)}>{c}</button>
        ))}
      </div>
      <div className="grid">
        {p.v.map(([name, once, month], i) => (
          <div key={name} className={`plan ${i === 3 ? "best" : ""}`}>
            <h3>{name}</h3>
            <div className="price">
              {once ? <>{p.sym}{once.toLocaleString()} <small>once</small></> : null}
              {once && month ? <br /> : null}
              {month ? <>{p.sym}{month.toLocaleString()} <small>per month</small></> : null}
            </div>
            <ul>{BULLETS[i].map((b) => <li key={b}>{b}</li>)}</ul>
          </div>
        ))}
      </div>
    </>
  );
}
