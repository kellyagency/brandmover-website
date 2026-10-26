# BrandMover AI: database, lead finder and public landing page

The home page (`app/page.tsx`) is the customer-facing landing page. Its form saves to the `Inquiry` table through `/api/inquiry`. Edit prices in `app/Pricing.tsx`. The free presence check lives at `/check` (`app/check`, `app/api/check`); it uses Google Places, so each check counts as one search request.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env` and fill in the three values.
3. `npx prisma db push` (creates the tables in Supabase)
4. `npm run dev`
5. Test the lead finder:
```
curl -X POST http://localhost:3000/api/leads/search \
 -H "Content-Type: application/json" -H "x-admin-secret: YOUR_SECRET" \
 -d '{"city":"Accra","market":"GH","type":"neither"}'
```

## Go live on Vercel
1. Push this folder to a GitHub repo.
2. vercel.com > Add New Project > import the repo.
3. Add the same three variables under Environment Variables.
4. Deploy. Add your domain under Settings > Domains.

## Landing page
The public page is `app/page.tsx` with prices in `components/Pricing.tsx`. Set `NEXT_PUBLIC_CONTACT_EMAIL` (and optionally `NEXT_PUBLIC_WHATSAPP`) so the buttons reach you.

## Notes
- Google Places can't see social pages. `socialStatus` is `unknown` unless the listed website is itself a social link. Verify before claiming a business has no social presence.
- Email is not collected here. Add it from the business's own public contact page or a reply, and keep opt-outs (`optedOut`) permanent.

## Pick a city with data
```
curl -X POST http://localhost:3000/api/leads/scout \
 -H "Content-Type: application/json" -H "x-admin-secret: YOUR_SECRET" \
 -d '{"cities":["Houston, TX","Atlanta, GA","Columbus, OH","Charlotte, NC"]}'
```
One Google search per city. Pick the cities with the highest share of results without a website, then run `/api/leads/search` there.

## Dashboard
Open `/dashboard`, enter your `ADMIN_SECRET`. Review leads, write a draft, edit it, **Approve**, then **Send**. Sending needs `RESEND_API_KEY` and `RESEND_FROM`. Cap: 50 emails/day. Opted-out leads are blocked everywhere.

## Payments (/pay)
1. Run `npx prisma db push` (adds the Payment table).
2. Paystack (Ghana): add `PAYSTACK_SECRET_KEY`. In the Paystack dashboard set the webhook URL to `https://YOURDOMAIN/api/pay/webhook/paystack`.
3. Stripe (US): add `STRIPE_SECRET_KEY`. Create a webhook to `https://YOURDOMAIN/api/pay/webhook/stripe` for `checkout.session.completed` and put its signing secret in `STRIPE_WEBHOOK_SECRET`.
4. Set `NEXT_PUBLIC_SITE_URL` to your live address. Test with Paystack/Stripe test keys first.
Notes: prices live in `lib/plans.ts` and are charged by the server, never the browser. US plans renew monthly automatically. Ghana plans collect the first payment; send a Paystack payment link each month until you add Paystack subscription plans.

## Easiest launch (no terminal)
1. Upload this folder's files to a new GitHub repository (github.com > New repository > "uploading an existing file", drag the files in).
2. On vercel.com, click Add New > Project, pick that repository, paste the settings from `.env.example` into Environment Variables, and click Deploy.
3. Vercel builds the app and creates the database tables automatically during the build (`prisma db push` is part of the build). Once it works, you may remove that step from the build script.
