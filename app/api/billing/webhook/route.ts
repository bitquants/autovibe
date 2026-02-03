import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      if (!stripe) {
        return NextResponse.json(
          { error: 'Stripe is not configured' },
          { status: 500 }
        );
      }
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        if (!userId) {
          console.error('No userId in session metadata');
          break;
        }

        // Get subscription details
        if (!stripe) {
          return NextResponse.json(
            { error: 'Stripe is not configured' },
            { status: 500 }
          );
        }
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;

        // Determine tier from price ID
        let tier: 'pro' | 'enterprise' = 'pro';
        if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
          tier = 'enterprise';
        }

        // Update profile with subscription info
        await supabase
          .from('profiles')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
            stripe_subscription_id: subscriptionId,
            subscription_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
            credits: tier === 'enterprise' ? 2000 : 500,
          })
          .eq('id', userId);

        // Update checkout session status
        await supabase
          .from('checkout_sessions')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('stripe_session_id', session.id);

        // Record credit transaction
        await supabase
          .from('credit_transactions')
          .insert({
            user_id: userId,
            amount: tier === 'enterprise' ? 2000 : 500,
            type: 'subscription_grant',
            description: `${tier} subscription activated`,
          });

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as unknown as { subscription: string }).subscription;

        // Get subscription to find user
        if (!stripe) {
          return NextResponse.json(
            { error: 'Stripe is not configured' },
            { status: 500 }
          );
        }
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        // Update subscription period end
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscriptionId);

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as unknown as { subscription: string }).subscription;

        await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due',
          })
          .eq('stripe_subscription_id', subscriptionId);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) break;

        await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_status: 'inactive',
            stripe_subscription_id: null,
            subscription_period_end: null,
            credits: 10, // Reset to free tier
          })
          .eq('id', userId);

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
