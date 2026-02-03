import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's credits
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits, subscription_tier, subscription_status, monthly_credits_used, credits_reset_at')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create it with default values
    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          credits: 500,
          subscription_tier: 'free',
          subscription_status: 'inactive',
          monthly_credits_used: 0,
          credits_reset_at: new Date().toISOString(),
        })
        .select('credits, subscription_tier, subscription_status, monthly_credits_used, credits_reset_at')
        .single();

      if (createError) {
        console.error('Failed to create profile:', createError);
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        credits: newProfile.credits,
        tier: newProfile.subscription_tier,
        status: newProfile.subscription_status,
        monthlyUsed: newProfile.monthly_credits_used,
        resetAt: newProfile.credits_reset_at,
      });
    }

    return NextResponse.json({
      credits: profile.credits,
      tier: profile.subscription_tier,
      status: profile.subscription_status,
      monthlyUsed: profile.monthly_credits_used,
      resetAt: profile.credits_reset_at,
    });
  } catch (error) {
    console.error('Check credits error:', error);
    return NextResponse.json(
      { error: 'Failed to check credits' },
      { status: 500 }
    );
  }
}
