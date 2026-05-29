# FleetAxis EV Transition Advisor — SaaS Setup Guide

Built by Waheed Syed · FleetAxis Advisory · Powered by Claude

---

## What's included

- AI chat advisor (Claude Sonnet) with fleet Excel upload
- Login / authentication system
- 3-tier subscription pricing page ($299 / $699 / $1,999)
- Stripe billing integration with checkout & customer portal
- Usage limits per plan (50 / 300 / unlimited queries)
- Live usage meter in the header
- Upgrade prompt when limit is reached
- Client dashboard with subscription management

---

## Deploy to Vercel in 5 steps

### 1. Push to GitHub
Upload this folder to a new GitHub repository.

### 2. Connect to Vercel
Go to vercel.com → New Project → Import your GitHub repo → Deploy.

### 3. Set environment variables in Vercel
Go to Project Settings → Environment Variables and add all values from `.env.example`:

| Variable | Where to get it |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → Add endpoint → copy secret |
| `STRIPE_STARTER_PRICE_ID` | Stripe → Products → Create product → copy Price ID |
| `STRIPE_PRO_PRICE_ID` | Same as above for Professional plan |
| `STRIPE_ENTERPRISE_PRICE_ID` | Same as above for Enterprise plan |
| `NEXT_PUBLIC_BASE_URL` | Your Vercel URL e.g. https://ev-advisor.vercel.app |

### 4. Set up Stripe products
In Stripe Dashboard → Products → Add product:
- **Starter** · $299/month recurring → copy Price ID → paste into Vercel env
- **Professional** · $699/month recurring → copy Price ID
- **Enterprise** · $1,999/month recurring → copy Price ID

### 5. Set up Stripe webhook
In Stripe → Developers → Webhooks → Add endpoint:
- URL: `https://your-app.vercel.app/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
- Copy the signing secret → add as `STRIPE_WEBHOOK_SECRET` in Vercel

### 6. Redeploy
In Vercel → Deployments → Redeploy to pick up the new environment variables.

---

## Managing clients

To add/edit login credentials, open `src/app/page.js` and edit the `USERS` array:

```js
const USERS = [
  { username: "waheed", password: "fleetaxis2024", name: "Waheed Syed", plan: "enterprise" },
  { username: "client1", password: "secure123", name: "ACME Fleet Co.", plan: "professional" },
  { username: "trial1", password: "trial123", name: "Trial User", plan: "trial" },
];
```

Available plans: `trial` (5 queries) · `starter` (50) · `professional` (300) · `enterprise` (unlimited)

---

## Pages

| URL | Description |
|---|---|
| `/` | Main AI advisor chat |
| `/pricing` | Public pricing page with Stripe checkout |
| `/dashboard` | Client subscription dashboard |
| `/api/chat` | Chat API (secured, server-side) |
| `/api/stripe/create-checkout` | Stripe checkout session |
| `/api/stripe/webhook` | Stripe event handler |
| `/api/stripe/portal` | Stripe billing portal |

---

## Next steps to production-harden

1. Replace the `USERS` array with a real database (Supabase recommended — free tier)
2. Replace in-memory `usageStore` with database usage tracking
3. Add email magic-link login via NextAuth.js
4. Add PDF report export
5. Set up monthly usage reset via a Vercel Cron job

---

Contact: waheed@fleetaxis.com
