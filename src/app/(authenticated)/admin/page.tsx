// Admin login-telemetry dashboard
// Route: /admin (gated by requireAdmin)

import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';
import type { AuthEventType } from '@/lib/telemetry/auth';
import { cn } from '@/lib/utils';

// Always render fresh — this is an operational dashboard.
export const dynamic = 'force-dynamic';

interface AuthEventRow {
  id: string;
  user_id: string | null;
  event_type: AuthEventType;
  provider: string | null;
  status: 'success' | 'failure';
  reason: string | null;
  email_hash: string | null;
  ip_truncated: string | null;
  user_agent: string | null;
  created_at: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function since(ms: number): number {
  return Date.now() - ms;
}

function countIn(rows: AuthEventRow[], predicate: (r: AuthEventRow) => boolean, windowMs?: number) {
  const cutoff = windowMs ? since(windowMs) : 0;
  return rows.filter(
    (r) => predicate(r) && (!windowMs || new Date(r.created_at).getTime() >= cutoff)
  ).length;
}

function formatRelativeTime(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

const EVENT_LABELS: Record<AuthEventType, string> = {
  sign_in_succeeded: 'Sign in',
  sign_in_failed: 'Sign in failed',
  sign_up_succeeded: 'Sign up',
  sign_up_failed: 'Sign up failed',
  oauth_initiated: 'OAuth started',
  oauth_callback_succeeded: 'OAuth completed',
  oauth_callback_failed: 'OAuth failed',
  sign_out: 'Sign out',
  password_reset_requested: 'Password reset',
  password_updated: 'Password updated',
  login_blocked: 'Login blocked',
};

function StatCard({
  label,
  value,
  sub,
  tone = 'default',
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'default' | 'good' | 'warn' | 'bad';
  icon: string;
}) {
  const toneStyles = {
    default: 'text-slate-900',
    good: 'text-emerald-600',
    warn: 'text-amber-600',
    bad: 'text-red-600',
  }[tone];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <span className="material-symbols-outlined text-slate-400 text-xl">{icon}</span>
      </div>
      <p className={cn('mt-2 text-3xl font-bold tracking-tight', toneStyles)}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function statusStyles(status: 'success' | 'failure') {
  return status === 'success'
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : 'bg-red-100 text-red-700 border-red-200';
}

export default async function AdminPage() {
  await requireAdmin();

  const admin = createAdminClient();

  let rows: AuthEventRow[] = [];
  let loadError: string | null = null;

  if (!admin) {
    loadError = 'Telemetry storage is not configured (SUPABASE_SERVICE_ROLE_KEY missing).';
  } else {
    const { data, error } = await admin
      .from('auth_events')
      .select('*')
      .gte('created_at', new Date(since(7 * DAY_MS)).toISOString())
      .order('created_at', { ascending: false })
      .limit(2000);

    if (error) {
      loadError =
        'Could not load auth events. Has the 20260711000000_add_auth_events migration been applied?';
    } else {
      rows = (data ?? []) as AuthEventRow[];
    }
  }

  const signInsSucceeded24h = countIn(rows, (r) => r.event_type === 'sign_in_succeeded', DAY_MS);
  const signInsFailed24h = countIn(rows, (r) => r.event_type === 'sign_in_failed', DAY_MS);
  const signInsSucceeded7d = countIn(rows, (r) => r.event_type === 'sign_in_succeeded');
  const signInsFailed7d = countIn(rows, (r) => r.event_type === 'sign_in_failed');
  const signUps7d = countIn(rows, (r) => r.event_type === 'sign_up_succeeded');
  const blocked24h = countIn(rows, (r) => r.event_type === 'login_blocked', DAY_MS);

  const totalSignInAttempts7d = signInsSucceeded7d + signInsFailed7d;
  const successRate =
    totalSignInAttempts7d > 0
      ? Math.round((signInsSucceeded7d / totalSignInAttempts7d) * 100)
      : null;

  const googleLogins = countIn(
    rows,
    (r) => r.event_type === 'sign_in_succeeded' && r.provider === 'google'
  );
  const emailLogins = countIn(
    rows,
    (r) => r.event_type === 'sign_in_succeeded' && r.provider === 'email'
  );

  const recent = rows.slice(0, 25);
  // NEXT_PUBLIC_POSTHOG_HOST is the ingestion/API host (e.g. us.i.posthog.com), which
  // 404s in a browser. The dashboard UI lives at the app host (us.posthog.com) — strip ".i.".
  const posthogAppUrl = process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(
    '.i.posthog.com',
    '.posthog.com'
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Login Telemetry</h1>
        </div>
        {posthogAppUrl && (
          <a
            href={posthogAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-[#135bec] hover:underline w-fit"
          >
            <span className="material-symbols-outlined text-base">open_in_new</span>
            Open PostHog dashboards
          </a>
        )}
      </div>

      {loadError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-500">info</span>
          <p className="text-amber-800 text-sm">{loadError}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Sign-ins (24h)"
          value={String(signInsSucceeded24h)}
          sub={`${signInsFailed24h} failed`}
          icon="login"
        />
        <StatCard
          label="Success rate (7d)"
          value={successRate === null ? '--' : `${successRate}%`}
          sub={`${totalSignInAttempts7d} attempts`}
          tone={successRate !== null && successRate < 80 ? 'warn' : 'good'}
          icon="check_circle"
        />
        <StatCard
          label="Sign-ups (7d)"
          value={String(signUps7d)}
          sub="new accounts"
          icon="person_add"
        />
        <StatCard
          label="Blocked (24h)"
          value={String(blocked24h)}
          sub="brute-force throttle"
          tone={blocked24h > 0 ? 'bad' : 'default'}
          icon="gpp_maybe"
        />
      </div>

      {/* Provider breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold text-slate-900 mb-3">Sign-ins by method (7d)</p>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Google', value: googleLogins, color: 'bg-[#4285F4]' },
            { label: 'Email', value: emailLogins, color: 'bg-[#135bec]' },
          ].map((row) => {
            const total = googleLogins + emailLogins;
            const pct = total > 0 ? Math.round((row.value / total) * 100) : 0;
            return (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-16 text-sm text-slate-600">{row.label}</span>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', row.color)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-20 text-right text-sm text-slate-500">
                  {row.value} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent events */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900">Recent events</h2>
        </div>
        {recent.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-slate-300 text-4xl">history</span>
            <p className="text-slate-500 text-sm mt-2">No authentication events recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Network
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    When
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recent.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">
                          {EVENT_LABELS[row.event_type] ?? row.event_type}
                        </span>
                        {row.reason && <span className="text-xs text-slate-400">{row.reason}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                          statusStyles(row.status)
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">{row.provider ?? '--'}</td>
                    <td className="px-6 py-3 text-sm text-slate-500 font-mono text-xs">
                      {row.ip_truncated ?? '--'}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500">
                      {formatRelativeTime(row.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
