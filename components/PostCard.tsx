'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { SocialPost, Tag, POST_TYPE_STYLES } from '@/lib/types';

type Props = {
  post: SocialPost;
  tagMap: Record<string, Tag>;
  onClick: () => void;
};

export default function PostCard({ post, tagMap, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 999 : undefined,
    position: isDragging ? ('relative' as const) : undefined,
  };

  const typeStyle = POST_TYPE_STYLES[post.post_type] ?? POST_TYPE_STYLES['feed'];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={[
        'relative rounded-md border px-2 py-1.5 cursor-pointer select-none transition-opacity',
        typeStyle.bg,
        typeStyle.border,
        isDragging ? 'opacity-50 shadow-lg' : 'hover:opacity-80',
        post.is_posted ? 'opacity-40' : '',
        post.missed && !post.is_posted ? 'grayscale opacity-40' : '',
      ].join(' ')}
    >
      {post.is_posted && (
        <span className={`absolute top-1 right-2 text-[10px] font-bold ${typeStyle.labelColor}`}>
          ✓
        </span>
      )}
      {post.missed && !post.is_posted && (
        <span className="absolute top-1 right-2 text-[10px] font-bold text-gray-400">
          ✗
        </span>
      )}
      <div
        className="inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded text-white mb-0.5"
        style={{ backgroundColor: typeStyle.color }}
      >
        {typeStyle.icon} {typeStyle.label}
      </div>
      <div className="text-[11px] font-semibold text-gray-800 pr-4 leading-tight mt-0.5">
        {post.name}
      </div>
      {post.ig_handle && (
        <div className="text-[9px] text-gray-400 mt-0.5">@{post.ig_handle}</div>
      )}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mt-1">
          {post.tags.map((tagName) => {
            const tag = tagMap[tagName];
            const color = tag?.color ?? '#6b7280';
            return (
              <span
                key={tagName}
                className="text-[7px] font-semibold px-1 py-0.5 rounded text-white"
                style={{ backgroundColor: color }}
              >
                {tagName}
              </span>
            );
          })}
        </div>
      )}
      {post.bio && (
        <div className="text-[8px] text-gray-400 mt-1 opacity-70">tap for description &amp; caption ›</div>
      )}
    </div>
  );
}
