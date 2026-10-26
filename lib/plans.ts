export type Cur = "GHS" | "USD";
export const PLANS = [
  { id: "website", name: "Website", blurb: "A fast, mobile-ready site with your menu, hours, photos and directions.", features: ["Hosting and updates included", "Call, WhatsApp and directions buttons", "Live within days of approval"], GHS: { setup: 2000, monthly: 250 }, USD: { setup: 600, monthly: 49 } },
  { id: "social_starter", name: "Social Starter", blurb: "12 posts a month, written and designed for your business.", features: ["12 posts per month", "You approve before anything goes live", "Monthly performance report"], GHS: { setup: 0, monthly: 900 }, USD: { setup: 0, monthly: 400 } },
  { id: "social_growth", name: "Social Growth", blurb: "Two platforms, 20 posts a month, plus promotions.", features: ["2 platforms, 20 posts per month", "Promotion and offer campaigns", "Monthly performance report"], GHS: { setup: 0, monthly: 1500 }, USD: { setup: 0, monthly: 800 } },
  { id: "bundle", name: "Website + Social Growth", blurb: "Everything in one plan. Best value.", best: true, features: ["Website and Social Growth together", "One simple monthly bill", "Priority support on WhatsApp"], GHS: { setup: 2500, monthly: 1200 }, USD: { setup: 700, monthly: 600 } },
] as const;
export type PlanId = (typeof PLANS)[number]["id"];
export const findPlan = (id: string) => PLANS.find((p) => p.id === id);
export const money = (n: number, c: Cur) => new Intl.NumberFormat(c === "GHS" ? "en-GH" : "en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
