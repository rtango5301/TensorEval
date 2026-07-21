'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/login/actions';
import { clearTokenCache } from '@/lib/api/client';

interface User {
  id: string;
  email?: string;
  name?: string | null;
  avatarUrl?: string | null;
}

interface LandingProfileDropdownProps {
  user: User;
}

/**
 * Extracts initials from a user's name for avatar fallback.
 * Takes first letter of first name and first letter of last name.
 */
function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return 'U';

  const parts = trimmed.split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function LandingProfileDropdown({ user }: LandingProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const displayName = user.name || user.email?.split('@')[0] || 'User';

  // Click-outside detection to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setIsOpen(false);
    clearTokenCache();
    // Sign out client-side first so onAuthStateChange fires and clears UI state
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    // Then sign out server-side to invalidate the session cookie
    await signOut();
    router.refresh();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-center size-9 rounded-full overflow-hidden',
          'focus:outline-none focus:ring-2 focus:ring-[var(--brand-highlight)] focus:ring-offset-2',
          'transition-all border-2 border-transparent hover:border-[var(--primary)]/20'
        )}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Open profile menu"
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={`${displayName}'s avatar`}
            width={36}
            height={36}
            className="size-9 rounded-full object-cover"
          />
        ) : (
          <div className="size-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-semibold">
            {getInitials(displayName)}
          </div>
        )}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-60 rounded-[8px] border border-[var(--outline-variant)] bg-white py-1 shadow-xl"
            role="menu"
            aria-orientation="vertical"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-[var(--border-light)]">
              <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                {displayName}
              </p>
              {user.email && (
                <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{user.email}</p>
              )}
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface-container-low)] focus:outline-none focus-visible:bg-[var(--surface-container-low)] focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-inset"
                role="menuitem"
              >
                <LayoutDashboard className="w-4 h-4 text-[var(--text-secondary)]" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface-container-low)] focus:outline-none focus-visible:bg-[var(--surface-container-low)] focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-inset"
                role="menuitem"
              >
                <Settings className="w-4 h-4 text-[var(--text-secondary)]" />
                Settings
              </Link>
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--border-light)] my-1" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left text-red-600 hover:bg-red-50 focus:outline-none focus-visible:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset transition-colors',
                isLoggingOut && 'opacity-50 cursor-not-allowed'
              )}
              role="menuitem"
            >
              <LogOut className="w-4 h-4" />
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
