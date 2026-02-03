import { Sidebar } from '@/components/dashboard/Sidebar';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('credits, subscription_tier, subscription_status')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar profile={profile || undefined} />
      <main className="flex-1 ml-16 lg:ml-56">
        <div className="max-w-5xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
