import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const body = await req.json();

  const updates: Record<string, unknown> = {};
  if ('handles' in body) updates.handles = body.handles;
  if ('event_link' in body) updates.event_link = body.event_link;
  if ('color' in body) updates.color = body.color;
  if ('name' in body) updates.name = body.name;

  const { data, error } = await supabase
    .from('tags')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
