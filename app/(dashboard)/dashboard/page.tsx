import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentIdeas } from '@/components/dashboard/RecentIdeas';
import { ConnectedAccounts } from '@/components/dashboard/ConnectedAccounts';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's stats
  const { count: ideasCount } = await supabase
    .from('content_ideas')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: postsCount } = await supabase
    .from('generated_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: accountsCount } = await supabase
    .from('social_accounts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true);

  // Fetch recent ideas
  const { data: recentIdeas } = await supabase
    .from('content_ideas')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch connected accounts
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-medium text-[#fafafa]">Dashboard</h1>
        <p className="text-[13px] text-[#71717a] mt-0.5">
          Welcome back! Here's what's happening with your content.
        </p>
      </div>

      <DashboardStats
        ideasCount={ideasCount || 0}
        postsCount={postsCount || 0}
        accountsCount={accountsCount || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentIdeas ideas={recentIdeas || []} />
        <ConnectedAccounts accounts={accounts || []} />
      </div>
    </div>
  );
}
