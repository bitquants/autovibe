import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { GenerateForm } from '@/components/generate/GenerateForm';

export default async function GeneratePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium text-[#fafafa]">Generate Content</h1>
        <p className="text-[13px] text-[#71717a] mt-0.5">
          Enter your idea and let AI create platform-optimized content.
        </p>
      </div>

      <GenerateForm />
    </div>
  );
}
