import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const supabase = createClient();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if ('caption' in body) updates.caption = body.caption;
  if ('day_index' in body) updates.day_index = body.day_index;
  if ('is_posted' in body) {
    updates.is_posted = body.is_posted;
    updates.posted_at = body.is_posted ? new Date().toISOString() : null;
  }

  const { data, error } = await supabase
    .from('social_calendar_posts')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
