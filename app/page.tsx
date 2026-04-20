import { createClient } from '@/lib/supabase';
import { POST_TYPE_STYLES } from '@/lib/types';
import CalendarGrid from '@/components/CalendarGrid';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const supabase = createClient();
  const [{ data: posts, error }, { data: tags }] = await Promise.all([
    supabase
      .from('social_calendar_posts')
      .select('*')
      .order('post_date', { ascending: true })
      .order('section', { ascending: false })
      .order('position', { ascending: true }),
    supabase.from('tags').select('*').order('name', { ascending: true }),
  ]);

  if (error) {
    console.error('Failed to load posts:', error.message);
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="px-4 py-5 max-w-[1500px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src="/logo.svg"
            alt="Moments. Gallery"
            className="h-10 w-auto flex-shrink-0"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Moments. Gallery — Social Calendar</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Drag cards to reschedule &nbsp;·&nbsp; Tap cards for details &amp; captions
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mb-5">
          {Object.entries(POST_TYPE_STYLES).map(([type, style]) => (
            <span
              key={type}
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded text-white"
              style={{ backgroundColor: style.color }}
            >
              {style.icon} {style.label}
            </span>
          ))}
        </div>

        <CalendarGrid initialPosts={posts ?? []} initialTags={tags ?? []} />
      </div>
    </main>
  );
}
