import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface UsageQuota {
  datasets_used: number;
  datasets_limit: number;
  datasets_remaining: number;
  evaluations_used: number;
  evaluations_limit: number;
  evaluations_remaining: number;
  period_start: string;
  period_end: string;
}

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase.rpc('get_usage_quota');

  if (error) {
    console.error('[usage] RPC error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 });
  }

  return NextResponse.json(data as UsageQuota);
}
