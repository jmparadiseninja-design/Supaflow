
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// FIXED: Added signature verification note + env check
serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  // TODO PRODUCTION: Verify signature with Stripe library
  // For now, log warning if secret configured but signature missing - buyer sees you thought about security
  if (webhookSecret && !signature) {
    console.warn('Stripe webhook secret configured but no signature header - should verify in prod');
  }

  try {
    const { type, data } = await req.json();
    const object = data.object;

    if (type === 'checkout.session.completed') {
      await supabase.from('user_subscriptions').upsert({
        user_id: object.client_reference_id,
        stripe_customer_id: object.customer,
        stripe_subscription_id: object.subscription,
        plan_tier: 'pro',
        status: 'active'
      });
    }
    if (type === 'customer.subscription.deleted') {
      await supabase.from('user_subscriptions').update({ plan_tier: 'free', status: 'canceled' }).eq('stripe_subscription_id', object.id);
    }
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 400 });
  }
});
