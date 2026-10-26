import Pricing from "./Pricing";
import InquiryForm from "./InquiryForm";
import { headers } from "next/headers";
import { WHATSAPP_LINK } from "@/lib/config";

export default function Home() {
  // Visitors in Ghana see GHS first; everyone else (including the US) sees USD.
  const cur = headers().get("x-vercel-ip-country") === "GH" ? "GHS" : "USD";
  return (
    <div className="wrap">
      <nav>
        <div className="logo">Brand<i>Mover</i> AI</div>
        <a className="btn alt" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
      </nav>

      <header className="hero">
        <div>
          <h1>Hungry customers are searching. Make sure they find your restaurant.</h1>
          <p>We build your restaurant or lounge a website with your menu, hours and location, and run your social media with your dishes, specials and events. You only pay once you’ve seen and approved the result.</p>
          <a className="btn" href="#start">Get my free preview</a>{" "}
          <a className="btn alt" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>
          <p style={{ fontSize: 15, marginTop: 16 }}>Serving local businesses in the United States and Ghana.</p>
        </div>
        <div className="cmp" aria-label="Search result comparison">
          <div className="card no"><small>Your business today</small><b>Your Restaurant Name</b><small>No menu online. No active social pages.</small></div>
          <div className="card yes"><small>With BrandMover</small><b>Your Restaurant Name</b><span className="u">yourbusiness.com</span><small>Menu, hours, photos, directions and a button to call or message you.</small></div>
        </div>
      </header>

      <section>
        <h2>Most diners check online before they choose where to eat</h2>
        <p className="lead">They look for a menu, photos, opening hours and reviews. If they can’t find them, they pick the place next door. We fix that without you learning new tools or spending your evenings posting.</p>
      </section>

      <section>
        <h2>Not sure what you’re missing?</h2>
        <p className="lead">Run our free online presence check. In under a minute you’ll see whether diners can find your restaurant on Google, and whether you have a website with your menu.</p>
        <p style={{ marginTop: 16 }}><a className="btn" href="/check">Check my business for free</a></p>
      </section>

      <section>
        <h2>How it works</h2>
        <div className="steps">
          <div><b>Tell us about your business</b><br />Send the short form below. It takes two minutes.</div>
          <div><b>See your preview</b><br />We show you a draft of your site or first posts before you pay anything.</div>
          <div><b>Approve and pay</b><br />Happy with it? Pay by card or bank transfer, or Mobile Money in Ghana.</div>
          <div><b>Go live</b><br />Your site is published and your posts start going out.</div>
        </div>
      </section>

      <section>
        <h2>Simple pricing</h2>
        <p className="lead">Pick a website, social media, or both. Prices are monthly unless marked once. No contracts you can’t leave.</p>
        <Pricing defaultCur={cur} />
      </section>

      <section id="start">
        <h2>Tell us about your restaurant or lounge</h2>
        <p className="lead">We’ll reply within one business day with next steps, or <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" style={{ color: "var(--ok)" }}>message us on WhatsApp</a>.</p>
        <InquiryForm />
      </section>

      <footer>© BrandMover AI. We only contact businesses using public listing information, include an opt-out in every email, and stop when you ask.</footer>
    </div>
  );
}
