'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Heart, Sparkles, BarChart3, Settings as SettingsIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/lib/store/userStore';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/library', label: 'Library', icon: BookOpen },
  { href: '/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/recommendations', label: 'Recommendations', icon: Sparkles },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-brand/10 text-brand'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUserStore((s) => s.user);
  const isAddPage = pathname === '/add';

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-muted/30 p-4">
        <div className="mb-8 px-2 text-xl font-bold text-brand">BookMate</div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} active={pathname === item.href} />
          ))}
        </nav>
        <div className="flex flex-col gap-1 border-t border-border pt-3">
          <NavLink href="/settings" label="Settings" icon={SettingsIcon} active={pathname === '/settings'} />
          {user && (
            <p className="truncate px-3 pt-2 text-xs text-muted-foreground" title={user.email}>
              {user.email}
            </p>
          )}
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end border-b border-border px-8 py-4">
          {!isAddPage && (
            <Button className="bg-brand hover:bg-brand/90" onClick={() => router.push('/add')}>
              <Plus className="mr-1 h-4 w-4" />
              Add book
            </Button>
          )}
        </header>
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
