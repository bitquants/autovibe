'use client';

import { motion } from 'framer-motion';
import { Lightbulb, FileText, Link2, Calendar } from 'lucide-react';

interface DashboardStatsProps {
  ideasCount: number;
  postsCount: number;
  accountsCount: number;
  scheduledCount?: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export function DashboardStats({ ideasCount, postsCount, accountsCount, scheduledCount = 0 }: DashboardStatsProps) {
  const stats = [
    { label: 'Content Ideas', value: ideasCount, icon: Lightbulb, color: 'text-[#fbbf24]', bg: 'bg-[#fbbf24]/10' },
    { label: 'Generated Posts', value: postsCount, icon: FileText, color: 'text-[#4ade80]', bg: 'bg-[#4ade80]/10' },
    { label: 'Connected Accounts', value: accountsCount, icon: Link2, color: 'text-[#22d3ee]', bg: 'bg-[#22d3ee]/10' },
    { label: 'Scheduled', value: scheduledCount, icon: Calendar, color: 'text-[#a78bfa]', bg: 'bg-[#a78bfa]/10' },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={item}
          className="p-4 rounded-lg bg-[#18181b] border border-[#27272a]/50 hover-lift"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-md ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xl font-medium text-[#fafafa]">{stat.value}</p>
              <p className="text-[12px] text-[#71717a]">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
