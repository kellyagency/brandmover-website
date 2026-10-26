import "./pay.css";
import { headers } from "next/headers";
import PayClient from "./PayClient";
export const metadata = { title: "Get started | BrandMover", description: "Choose a plan and pay securely by card or Mobile Money." };
export default function Page({ searchParams }: { searchParams: { plan?: string } }) {
  const gh = headers().get("x-vercel-ip-country") === "GH";
  return <PayClient defaultCur={gh ? "GHS" : "USD"} defaultPlan={searchParams.plan || "bundle"} />;
}
