// Outreach drafts for restaurants and lounges. Every draft is reviewed and approved by you before sending.
// Social status is "unknown" for most leads (Places can't see social pages), so wording says
// "couldn't find ... linked from your listing" instead of claiming a business has no social media.

export type Segment = "no_website" | "no_social" | "neither";

export function draftEmail(o: { name: string; city: string; segment: Segment; market: "GH" | "US"; category?: string }) {
  const place = (o.category ?? "restaurant").toLowerCase().includes("lounge") ? "lounge" : "restaurant";
  const gap =
    o.segment === "no_website" ? "a website linked from your Google listing, with your menu and opening hours"
    : o.segment === "no_social" ? "social media pages linked from your Google listing"
    : "a website or social media pages linked from your Google listing";
  const offer =
    o.segment === "no_website" ? "build you a simple website with your menu, hours, photos and directions"
    : o.segment === "no_social" ? "set up and run your social media, with posts about your dishes, specials and events"
    : "build you a simple website with your menu and run your social media";
  const pay = o.market === "GH" ? "You can pay by Mobile Money, card or bank transfer." : "You can pay by card or bank transfer.";
  const sender = process.env.SENDER_NAME ?? "BrandMover AI";
  const address = process.env.SENDER_ADDRESS ?? "[ADD YOUR POSTAL ADDRESS IN .env]";

  return {
    subject: `Helping ${o.name} get found by hungry customers`,
    body: `Hello,

We came across ${o.name} while looking at ${place}s in ${o.city}, and we couldn’t find ${gap}. Many diners look for a menu, photos and opening hours online before choosing where to eat.

We can ${offer}. You only pay once you’ve seen and approved the result. ${pay}

If you’d like to see a free preview, just reply to this email.

Best regards,
${sender}

You’re receiving this because ${o.name} is listed publicly on Google Maps. If you’d rather not hear from us, reply “stop” and we won’t contact you again.
${sender}, ${address}`,
  };
}
