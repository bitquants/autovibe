import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentIdeas } from '@/components/dashboard/RecentIdeas';
import { ConnectedAccounts } from '@/components/dashboard/ConnectedAccounts';
import { ScheduleSection } from '@/components/schedule/ScheduleSection';

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

  // Fix: generated_posts doesn't have user_id, need to join with content_ideas
  const { count: postsCount } = await supabase
    .from('generated_posts')
    .select('*, content_ideas!inner(user_id)', { count: 'exact', head: true })
    .eq('content_ideas.user_id', user.id);

  const { count: accountsCount } = await supabase
    .from('social_accounts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true);

  // Fetch scheduled posts count
  const { count: scheduledCount } = await supabase
    .from('scheduled_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('status', ['pending', 'processing']);

  // Fetch recent ideas with their post counts
  const { data: recentIdeas } = await supabase
    .from('content_ideas')
    .select(`
      *,
      generated_posts (count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch connected accounts
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true);

  // Fetch user profile with credits
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits, subscription_tier, subscription_status')
    .eq('id', user.id)
    .single();

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
        scheduledCount={scheduledCount || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentIdeas ideas={(recentIdeas as unknown as { id: string; idea: string; niche: string; created_at: string; generated_posts: { count: number }[] }[]) || []} />
        <ConnectedAccounts accounts={accounts || []} />
      </div>

      {/* Schedule Section - Full Width */}
      <ScheduleSection />
    </div>
  );
}
