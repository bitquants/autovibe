import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, createCheckoutSession, createCustomer, STRIPE_PRICE_IDS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tier } = body as { tier: 'pro' | 'enterprise' };

    if (!tier || !['pro', 'enterprise'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Get user's profile or create if not exists
    let { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single();

    // Create profile if it doesn't exist
    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          credits: 500,
          subscription_tier: 'free',
          subscription_status: 'inactive',
        })
        .select('stripe_customer_id, email')
        .single();

      if (createError) {
        console.error('Failed to create profile:', createError);
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        );
      }

      profile = newProfile;
    }

    // Create or retrieve Stripe customer
    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await createCustomer(profile.email, user.id);
      customerId = customer.id;

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create checkout session
    const priceId = STRIPE_PRICE_IDS[tier];
    
    if (!priceId) {
      return NextResponse.json(
        { error: `Price ID not configured for tier: ${tier}. Please check your environment variables.` },
        { status: 500 }
      );
    }
    
    const session = await createCheckoutSession(customerId, priceId, user.id);

    // Record checkout session
    await supabase
      .from('checkout_sessions')
      .insert({
        user_id: user.id,
        stripe_session_id: session.id,
        stripe_price_id: priceId,
        tier,
        status: 'pending',
      });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
