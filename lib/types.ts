export type SocialPost = {
  id: string;
  post_date: string;    // 'YYYY-MM-DD'
  section: 'feed' | 'story';
  post_type: 'af' | 'as' | 'sf' | 'ss' | 'is' | 'ir';
  name: string;
  subtitle: string | null;
  ig_handle: string | null;
  bio: string | null;
  caption: string | null;
  drive_link: string | null;
  position: number;
  is_posted: boolean;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PostTypeStyle = {
  bg: string;
  border: string;
  label: string;
  labelColor: string;
  dotColor: string;
  icon: string;
  color: string;
};

export const POST_TYPE_STYLES: Record<string, PostTypeStyle> = {
  af: {
    bg: 'bg-[#ddeeff]',
    border: 'border-[#88bbee]',
    label: 'Artist Feed',
    labelColor: 'text-[#1155aa]',
    dotColor: 'bg-[#88bbee]',
    icon: '◼',
    color: '#5599dd',
  },
  as: {
    bg: 'bg-[#dff2df]',
    border: 'border-[#88cc88]',
    label: 'Artist Story',
    labelColor: 'text-[#2d7a2d]',
    dotColor: 'bg-[#88cc88]',
    icon: '◎',
    color: '#55aa55',
  },
  sf: {
    bg: 'bg-[#fff0cc]',
    border: 'border-[#eebb44]',
    label: 'Sponsor Feed',
    labelColor: 'text-[#996600]',
    dotColor: 'bg-[#eebb44]',
    icon: '◼',
    color: '#cc9900',
  },
  ss: {
    bg: 'bg-[#fff7dd]',
    border: 'border-[#ffcc66]',
    label: 'Sponsor Story',
    labelColor: 'text-[#996600]',
    dotColor: 'bg-[#ffcc66]',
    icon: '◎',
    color: '#ddaa00',
  },
  is: {
    bg: 'bg-[#fde8f2]',
    border: 'border-[#ee88bb]',
    label: 'Influencer Story',
    labelColor: 'text-[#882255]',
    dotColor: 'bg-[#ee88bb]',
    icon: '◎',
    color: '#cc5599',
  },
  ir: {
    bg: 'bg-[#eeeaff]',
    border: 'border-[#aa99ee]',
    label: 'Influencer Reel',
    labelColor: 'text-[#443399]',
    dotColor: 'bg-[#aa99ee]',
    icon: '▶',
    color: '#7766cc',
  },
};

export type WeekDay = {
  name: string;   // 'Mon', 'Tue', etc.
  date: string;   // 'YYYY-MM-DD'
  label: string;  // 'Apr 13'
};

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDays(weekStart: Date): WeekDay[] {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return dayNames.map((name, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return {
      name,
      date: toISODate(d),
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });
}
