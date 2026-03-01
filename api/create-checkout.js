import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Map plan IDs to Stripe price IDs — fill these in after creating Stripe products
const PRICE_MAP = {
  starter: process.env.STRIPE_PRICE_STARTER,
  growth: process.env.STRIPE_PRICE_GROWTH,
  scale: process.env.STRIPE_PRICE_SCALE,
}

const PLAN_LIMITS = {
  starter: 20,
  growth: 80,
  scale: 9999,
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const token = req.headers.authorization?.replace("Bearer ", "")
  if (!token) return res.status(401).json({ error: "Unauthorized" })

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: "Invalid token" })

  const { planId } = req.body
  const priceId = PRICE_MAP[planId]

  if (!priceId) {
    return res.status(400).json({ error: "Invalid plan" })
  }

  try {
    // Check if user already has a Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || req.headers.origin}?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || req.headers.origin}?checkout=cancelled`,
      metadata: {
        supabase_user_id: user.id,
        plan_id: planId,
      },
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error("Checkout error:", err)
    return res.status(500).json({ error: "Failed to create checkout" })
  }
}
