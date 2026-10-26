import "../pay.css";
import { WHATSAPP_LINK } from "@/lib/config";
export const metadata = { title: "Payment received | BrandMover" };
export default function Thanks() {
  return (
    <main className="pay-thanks"><div className="pay-box">
      <div className="check" aria-hidden>✓</div>
      <h1>Thank you. Your payment is on its way.</h1>
      <p>You will get a receipt by email. We will message you within one business day to collect your photos, menu and logo, then start your work.</p>
      <a className="pay-btn" href={WHATSAPP_LINK}>Message us on WhatsApp</a>
    </div></main>
  );
}
