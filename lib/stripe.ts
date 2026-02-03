import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeKey
  ? new Stripe(stripeKey, {
      apiVersion: '2026-01-28.clover',
    })
  : null;

export const STRIPE_PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID || '',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
};

export const CREDIT_COSTS = {
  perGeneration: 1, // 1 credit per generation (generates 4 platform posts)
};

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    credits: 500,
    price: 0,
    features: [
      '500 credits per month',
      'Generate content for 4 platforms',
      'Basic AI content generation',
      'Unlimited content history',
    ],
  },
  pro: {
    name: 'Pro',
    credits: 2500,
    price: 19,
    priceId: STRIPE_PRICE_IDS.pro,
    features: [
      '2500 credits per month',
      'Generate content for 4 platforms',
      'Advanced AI content generation',
      'Unlimited content history',
      'Priority support',
      'Custom brand voice',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    credits: 10000,
    price: 79,
    priceId: STRIPE_PRICE_IDS.enterprise,
    features: [
      '10000 credits per month',
      'Everything in Pro',
      'Dedicated account manager',
      'API access',
      'Custom integrations',
      'Team collaboration (up to 10)',
    ],
  },
};

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  userId: string
) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
  });

  return session;
}

export async function createCustomer(email: string, userId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });

  return customer;
}

export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured');
  }
  const subscription = await stripe.subscriptions.cancel(subscriptionId);
  return subscription;
}
