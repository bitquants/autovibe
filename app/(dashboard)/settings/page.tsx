import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AccountConnections } from '@/components/dashboard/AccountConnections';
import { BillingSettings } from '@/components/billing/BillingSettings';
import { BillingOverview } from '@/components/billing/BillingOverview';

// Default profile for new users or when profile is not yet created
const DEFAULT_PROFILE = {
  id: '',
  email: '',
  full_name: null,
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  credits: 500,
  subscription_tier: 'free' as const,
  subscription_status: 'inactive' as const,
  stripe_customer_id: null,
  stripe_subscription_id: null,
  subscription_period_end: null,
  monthly_credits_used: 0,
  credits_reset_at: new Date().toISOString(),
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch connected accounts
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch user profile with credits - create default if not exists
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // If profile doesn't exist, use default profile values
  if (!profile) {
    profile = {
      ...DEFAULT_PROFILE,
      id: user.id,
      email: user.email || '',
    };
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-medium text-[#fafafa]">Settings</h1>
        <p className="text-[13px] text-[#71717a] mt-0.5">
          Manage your account, billing, and connected platforms.
        </p>
      </div>

      {/* Billing Overview Section - Always visible */}
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-[14px] font-medium text-[#fafafa] mb-1">Billing & Credits</h2>
          <p className="text-[12px] text-[#71717a]">
            Overview of your credits usage and billing information
          </p>
        </div>
        <BillingOverview profile={profile} />
      </div>

      {/* Subscription & Payment Methods - Always visible */}
      <div className="max-w-4xl pt-6 border-t border-[#27272a]/50">
        <BillingSettings profile={profile} />
      </div>

      {/* Connected Accounts */}
      <div className="max-w-4xl pt-6 border-t border-[#27272a]/50">
        <AccountConnections accounts={accounts || []} />
      </div>
    </div>
  );
}
