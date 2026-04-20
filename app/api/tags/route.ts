import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const TAG_COLORS = [
  '#e85d4a', '#e8944a', '#d4a017', '#5ab54a', '#4a9de8',
  '#7b4ae8', '#e84a9d', '#4accc8', '#89c93f', '#c94a4a',
];

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('tags').select('*').order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  const supabase = createClient();

  let color = body.color ?? null;
  if (!color) {
    const { count } = await supabase.from('tags').select('*', { count: 'exact', head: true });
    color = TAG_COLORS[(count ?? 0) % TAG_COLORS.length];
  }

  const { data, error } = await supabase
    .from('tags')
    .insert({
      name: body.name.trim(),
      event_link: body.event_link ?? null,
      handles: body.handles ?? [],
      color,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
