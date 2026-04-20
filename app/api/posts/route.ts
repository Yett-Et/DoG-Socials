import { createClient } from '@/lib/supabase';
import { TYPE_SECTION } from '@/lib/types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createClient();

  const section = TYPE_SECTION[body.post_type] ?? 'feed';

  // Place the new post at the end of its section for that day
  const { data: existing } = await supabase
    .from('social_calendar_posts')
    .select('position')
    .eq('post_date', body.post_date)
    .eq('section', section)
    .order('position', { ascending: false })
    .limit(1);

  const position = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { data, error } = await supabase
    .from('social_calendar_posts')
    .insert({
      post_type: body.post_type,
      section,
      name: body.name,
      post_date: body.post_date,
      ig_handle: body.ig_handle ?? null,
      drive_link: body.drive_link ?? null,
      event_link: body.event_link ?? null,
      tags: body.tags ?? [],
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
