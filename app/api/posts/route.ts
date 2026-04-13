import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createClient();

  // Place the new post at the end of its section for that day
  const { data: existing } = await supabase
    .from('social_calendar_posts')
    .select('position')
    .eq('day_index', body.day_index)
    .eq('section', body.section)
    .order('position', { ascending: false })
    .limit(1);

  const position = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { data, error } = await supabase
    .from('social_calendar_posts')
    .insert({
      post_type: body.post_type,
      section: body.section,
      name: body.name,
      day_index: body.day_index,
      ig_handle: body.ig_handle ?? null,
      drive_link: body.drive_link ?? null,
      bio: body.bio ?? null,
      caption: body.caption ?? null,
      subtitle: body.subtitle ?? null,
      position,
      is_posted: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
