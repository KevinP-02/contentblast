import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PLAN_LIMITS = {
  starter: 20,
  growth: 80,
  scale: 9999,
}

// Disable body parsing — Stripe needs the raw body for signature verification
export const config = {
  api: { bodyParser: false },
}

async function getRawBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const rawBody = await getRawBody(req)
  const sig = req.headers["stripe-signature"]

  let event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message)
    return res.status(400).json({ error: "Invalid signature" })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const userId = session.metadata?.supabase_user_id
        const planId = session.metadata?.plan_id
        const subscriptionId = session.subscription

        if (userId && planId) {
          await supabase
            .from("profiles")
            .update({
              plan: planId,
              blasts_limit: PLAN_LIMITS[planId] || 20,
              blasts_used: 0,
              stripe_subscription_id: subscriptionId,
            })
            .eq("id", userId)
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object
        // Handle plan changes, cancellations etc
        if (subscription.cancel_at_period_end) {
          // User cancelled but still has access until period end
          console.log("Subscription will cancel at period end:", subscription.id)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object
        const customerId = subscription.customer

        // Find user by stripe customer id and downgrade
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (profile) {
          await supabase
            .from("profiles")
            .update({
              plan: "starter",
              blasts_limit: 20,
              stripe_subscription_id: null,
            })
            .eq("id", profile.id)
        }
        break
      }

      case "invoice.paid": {
        // Reset monthly usage on successful payment
        const invoice = event.data.object
        const customerId = invoice.customer

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single()

        if (profile) {
          await supabase
            .from("profiles")
            .update({ blasts_used: 0 })
            .eq("id", profile.id)
        }
        break
      }

      default:
        console.log("Unhandled event type:", event.type)
    }
  } catch (err) {
    console.error("Webhook processing error:", err)
    return res.status(500).json({ error: "Webhook processing failed" })
  }

  return res.status(200).json({ received: true })
}
