export type SocialPost = {
  id: string;
  day_index: number;       // 0=Mon Apr14 … 4=Fri Apr18
  section: 'feed' | 'story';
  post_type: 'af' | 'as' | 'sf' | 'ss' | 'is' | 'ir';
  name: string;
  subtitle: string | null;
  ig_handle: string | null;
  bio: string | null;
  caption: string | null;
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
  color: string; // hex, used for solid badge backgrounds
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

export const DAYS = [
  { name: 'Mon', date: 'Apr 14' },
  { name: 'Tue', date: 'Apr 15' },
  { name: 'Wed', date: 'Apr 16' },
  { name: 'Thu', date: 'Apr 17' },
  { name: 'Fri', date: 'Apr 18' },
];
