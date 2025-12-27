'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
  items: Array<{
    href: string;
    label: string;
    icon: React.ReactNode;
  }>;
}

export function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-800 bg-gray-950 min-h-screen p-4">
      <nav className="space-y-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all',
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <span className="w-5 h-5">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
