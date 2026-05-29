import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// In production replace this with a real DB (Supabase, PlanetScale etc.)
// For now we log events — wire up your DB here
export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("New subscription:", {
        username: session.metadata.username,
        plan: session.metadata.plan,
        customer: session.customer,
        subscription: session.subscription,
      });
      // TODO: Save to your database
      // await db.users.update({ username: session.metadata.username }, {
      //   plan: session.metadata.plan,
      //   stripe_customer_id: session.customer,
      //   stripe_subscription_id: session.subscription,
      //   queries_used: 0,
      // });
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      console.log("Subscription cancelled:", sub.id);
      // TODO: Downgrade user in your database
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      console.log("Payment failed:", invoice.customer);
      // TODO: Notify user, restrict access
      break;
    }
  }

  return Response.json({ received: true });
}
