'use client';

import { useDroppable } from '@dnd-kit/core';
import { SocialPost } from '@/lib/types';
import PostCard from './PostCard';

type Props = {
  dayIndex: number;
  dayName: string;
  dayDate: string;
  posts: SocialPost[];
  onSelectPost: (post: SocialPost) => void;
};

export default function DayColumn({ dayIndex, dayName, dayDate, posts, onSelectPost }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${dayIndex}` });

  const feedPosts = posts.filter((p) => p.section === 'feed');
  const storyPosts = posts.filter((p) => p.section === 'story');
  const postedCount = posts.filter((p) => p.is_posted).length;

  return (
    <div
      ref={setNodeRef}
      className={[
        'flex flex-col gap-1.5 rounded-xl p-2 min-h-[300px] transition-colors',
        isOver ? 'bg-blue-50 ring-2 ring-blue-200 ring-inset' : 'bg-gray-50',
      ].join(' ')}
    >
      {/* Day header */}
      <div className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-center mb-1 flex-shrink-0">
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{dayName}</div>
        <div className="text-base font-bold text-gray-800 leading-tight">{dayDate}</div>
        <div className="text-[9px] text-gray-400 mt-0.5">
          {postedCount}/{posts.length} posted
        </div>
      </div>

      {/* Feed section */}
      {feedPosts.length > 0 && (
        <>
          <div className="text-[8px] font-bold uppercase tracking-widest text-gray-300 px-1 pt-0.5">
            Feed
          </div>
          {feedPosts.map((post) => (
            <PostCard key={post.id} post={post} onClick={() => onSelectPost(post)} />
          ))}
        </>
      )}

      {/* Stories section */}
      {storyPosts.length > 0 && (
        <>
          <div className="text-[8px] font-bold uppercase tracking-widest text-gray-300 px-1 pt-1">
            Stories
          </div>
          {storyPosts.map((post) => (
            <PostCard key={post.id} post={post} onClick={() => onSelectPost(post)} />
          ))}
        </>
      )}

      {/* Empty state */}
      {posts.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[9px] text-gray-300 uppercase tracking-wide">Drop here</p>
        </div>
      )}
    </div>
  );
}
