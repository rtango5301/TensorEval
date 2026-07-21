'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { useUser } from '@/contexts/user-context';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/datasets', label: 'Datasets', icon: 'folder_open' },
  { href: '/evaluations', label: 'Evaluations', icon: 'science' },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useUser();
  const items = user.isAdmin
    ? [...navItems, { href: '/admin', label: 'Admin', icon: 'shield_person' }]
    : navItems;

  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-[var(--outline-variant)] bg-white md:flex">
      <div className="flex h-full flex-col p-4">
        {/* Logo – opens landing page in new tab */}
        <div className="flex flex-col mb-8 px-2 mt-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 group"
          >
            <Logo variant="dashboard" size="md" />
            <span className="material-symbols-outlined text-base text-[var(--outline)] opacity-0 transition-opacity group-hover:opacity-100">
              open_in_new
            </span>
          </a>
        </div>

        {/* Primary Navigation */}
        <nav className="flex flex-col gap-1 flex-1">
          {items.map((item) => {
            const isActive =
              item.href === '/datasets'
                ? pathname.startsWith('/datasets')
                : item.href === '/evaluations'
                  ? pathname.startsWith('/evaluations')
                  : item.href === '/admin'
                    ? pathname.startsWith('/admin')
                    : pathname === item.href || pathname.startsWith('/dashboard');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-[4px] px-3 py-2.5 transition-colors',
                  isActive
                    ? 'bg-[var(--surface-container)] text-[var(--primary)]'
                    : 'text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]'
                )}
              >
                <span className={cn('material-symbols-outlined', isActive && 'filled')}>
                  {item.icon}
                </span>
                <p
                  className={cn(
                    'text-sm leading-normal',
                    isActive
                      ? 'font-display font-bold'
                      : 'font-medium group-hover:text-[var(--on-surface)]'
                  )}
                >
                  {item.label}
                </p>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
