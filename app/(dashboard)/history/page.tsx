import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { HistoryList } from '@/components/dashboard/HistoryList';

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all content ideas with their generated posts
  const { data: ideas } = await supabase
    .from('content_ideas')
    .select(`
      *,
      generated_posts (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium text-[#fafafa]">History</h1>
        <p className="text-[13px] text-[#71717a] mt-0.5">
          View all your content ideas and generated posts.
        </p>
      </div>

      <HistoryList ideas={ideas || []} />
    </div>
  );
}
