import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  starter: {
    name: "Starter",
    price_id: process.env.STRIPE_STARTER_PRICE_ID,
    queries: 50,
  },
  professional: {
    name: "Professional",
    price_id: process.env.STRIPE_PRO_PRICE_ID,
    queries: 300,
  },
  enterprise: {
    name: "Enterprise",
    price_id: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    queries: 999999,
  },
};

export async function POST(req) {
  try {
    const { plan, email, username } = await req.json();
    const planConfig = PLANS[plan];
    if (!planConfig) return Response.json({ error: "Invalid plan" }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: planConfig.price_id, quantity: 1 }],
      metadata: { username, plan },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
