'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Sparkles,
  History,
  Settings,
  LogOut,
  Sparkles as LogoIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generate', label: 'Generate', icon: Sparkles },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-16 lg:w-56 bg-[#09090b] border-r border-[#27272a]/50 flex flex-col z-50">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[#27272a]/50">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#22d3ee]/10 flex items-center justify-center">
            <LogoIcon className="w-4 h-4 text-[#22d3ee]" />
          </div>
          <span className="hidden lg:block text-[13px] font-medium text-[#fafafa]">
            AutoVibe
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2 rounded-md text-[12px] transition-colors ${
                isActive
                  ? 'text-[#fafafa]'
                  : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#27272a]/30'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-[#27272a] rounded-md"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span className="hidden lg:block">{item.label}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-[#27272a]/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[12px] text-[#71717a] hover:text-[#ef4444] hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden lg:block">Logout</span>
        </button>
      </div>
    </aside>
  );
}
