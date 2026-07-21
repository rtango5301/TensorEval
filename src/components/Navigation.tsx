'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, X, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LandingProfileDropdown } from '@/components/ui/landing-profile-dropdown';
import { signOut } from '@/app/login/actions';
import { clearTokenCache } from '@/lib/api/client';
import { useCalendly } from '@/hooks/use-calendly';

const navLinks = [
  { href: '#', label: 'About' },
  { href: '#demo', label: 'Demo' },
  { href: '#workflow', label: 'Workflow' },
  { href: '#features', label: 'Features' },
  { href: '#use-cases', label: 'Use Cases' },
  { href: '#pricing', label: 'Pricing' },
];

type AuthUser = {
  id: string;
  email?: string | undefined;
  name?: string | null;
  avatarUrl?: string | null;
} | null;

/**
 * Extracts initials from a user's name for avatar fallback.
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

interface NavigationProps {
  user?: AuthUser;
}

export function Navigation({ user: initialUser }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<AuthUser>(initialUser ?? null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const router = useRouter();
  const { openCalendly } = useCalendly();

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setMobileMenuOpen(false);
    clearTokenCache();
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    await signOut();
    router.refresh();
  };

  // Listen for auth state changes (logout in another tab, etc.)
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (
        _event: string,
        session: {
          user?: { id: string; email?: string; user_metadata?: Record<string, string> };
        } | null
      ) => {
        const newUser = session?.user
          ? {
              id: session.user.id,
              email: session.user.email,
              name:
                session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
              avatarUrl: session.user.user_metadata?.avatar_url || null,
            }
          : null;
        setUser(newUser);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);

        // Detect active section
        const sections = navLinks
          .filter((link) => link.href.startsWith('#') && link.href !== '#')
          .map((link) => link.href.slice(1));

        for (const section of sections.reverse()) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 100) {
              setActiveSection(section);
              rafRef.current = null;
              return;
            }
          }
        }
        setActiveSection('');
        rafRef.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 border-b bg-white transition-colors duration-300 ${
        scrolled ? 'border-[var(--outline-variant)]' : 'border-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 lg:px-10">
        {/* Logo */}
        <Link href="/" className="flex items-center text-[var(--foreground)] no-underline">
          <Logo size="sm" showText={false} className="lg:hidden" />
          <Logo size="sm" lockup className="hidden lg:block" />
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <motion.div key={link.label} whileHover={{ y: -1 }}>
                <Link
                  href={link.href}
                  className={`relative rounded-[4px] px-4 py-2 text-[15px] font-medium transition-colors ${
                    isActive
                      ? 'text-[var(--primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--bg-subtle)]'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-[var(--primary)] rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCalendly}
            className="rounded-[4px] border border-[var(--primary)] bg-white px-5 py-2.5 text-[15px] font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--surface-container-low)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2"
          >
            Schedule a call
          </motion.button>
          {user ? (
            <>
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 rounded-[4px] bg-[var(--primary)] px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2"
                  aria-label="Go to Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </motion.button>
              </Link>
              <LandingProfileDropdown user={user} />
            </>
          ) : (
            <>
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-[4px] bg-[var(--primary)] px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-[var(--primary-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] focus-visible:ring-offset-2"
                >
                  Sign In
                </motion.button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="rounded-[4px] p-2 transition-colors hover:bg-[var(--surface-container-low)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)] lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{
          height: mobileMenuOpen ? 'auto' : 0,
          opacity: mobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden border-t border-[var(--outline-variant)] bg-white lg:hidden"
      >
        <div className="flex flex-col gap-1 px-4 py-4">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.label}
              initial={{ opacity: 0, x: -20 }}
              animate={mobileMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={link.href}
                className={`block rounded-[4px] px-4 py-3 text-base font-medium transition-colors ${
                  activeSection === link.href.slice(1)
                    ? 'text-[var(--primary)] bg-[var(--primary)]/5'
                    : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--bg-subtle)]'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
          <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-[var(--border-light)]">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openCalendly();
              }}
              className="w-full rounded-[4px] border border-[var(--primary)] bg-white py-3 text-base font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--surface-container-low)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-highlight)]"
            >
              Schedule a call
            </button>
            {user ? (
              <>
                {/* User Info Header */}
                <div className="mb-2 flex items-center gap-3 rounded-[8px] bg-[var(--surface-container-low)] px-4 py-3">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={`${user.name || 'User'}'s avatar`}
                      width={40}
                      height={40}
                      className="size-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials(user.name || user.email || 'U')}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                      {user.name || user.email?.split('@')[0] || 'User'}
                    </p>
                    {user.email && (
                      <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
                    )}
                  </div>
                </div>

                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <button className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-[var(--primary)] py-3 text-base font-semibold text-white transition-colors hover:bg-[var(--primary-dark)]">
                    <LayoutDashboard className="w-4 h-4" />
                    Go to Dashboard
                  </button>
                </Link>

                <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)}>
                  <button className="flex w-full items-center justify-center gap-2 rounded-[4px] border border-[var(--outline-variant)] py-3 text-base font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface-container-low)]">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </Link>

                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className={`flex w-full items-center justify-center gap-2 rounded-[4px] border border-red-200 py-3 text-base font-medium text-red-600 transition-colors hover:bg-red-50 ${isSigningOut ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <LogOut className="w-4 h-4" />
                  {isSigningOut ? 'Signing out...' : 'Sign out'}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full rounded-[4px] bg-[var(--primary)] py-3 text-base font-semibold text-white transition-colors hover:bg-[var(--primary-dark)]">
                    Sign In
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}
