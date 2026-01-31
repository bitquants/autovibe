import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AccountConnections } from '@/components/dashboard/AccountConnections';

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium text-[#fafafa]">Settings</h1>
        <p className="text-[13px] text-[#71717a] mt-0.5">
          Manage your account and connected platforms.
        </p>
      </div>

      <div className="max-w-xl">
        <AccountConnections accounts={accounts || []} />
      </div>
    </div>
  );
}
