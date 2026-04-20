'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SocialPost, Tag, getWeekStart, getWeekDays } from '@/lib/types';
import DayColumn from './DayColumn';
import PostModal from './PostModal';
import AddPostModal from './AddPostModal';
import StatsBar from './StatsBar';
import PostCard from './PostCard';

type Props = {
  initialPosts: SocialPost[];
  initialTags: Tag[];
};

async function patchPost(id: string, updates: Record<string, unknown>) {
  await fetch(`/api/posts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}

export default function CalendarGrid({ initialPosts, initialTags }: Props) {
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [draggingPost, setDraggingPost] = useState<SocialPost | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const tagMap = useMemo(() => {
    const m: Record<string, Tag> = {};
    for (const t of tags) m[t.name] = t;
    return m;
  }, [tags]);

  const selectedPost = selectedPostId ? (posts.find((p) => p.id === selectedPostId) ?? null) : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const goToPrevWeek = useCallback(() => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }, []);

  const goToToday = useCallback(() => {
    setWeekStart(getWeekStart(new Date()));
  }, []);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const post = posts.find((p) => p.id === event.active.id);
      setDraggingPost(post ?? null);
    },
    [posts]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDraggingPost(null);
      const { active, over } = event;
      if (!over) return;

      const postId = active.id as string;
      const overId = over.id as string;
      if (!overId.startsWith('day-')) return;

      const newDate = overId.replace('day-', '');
      const post = posts.find((p) => p.id === postId);
      if (!post || post.post_date === newDate) return;

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, post_date: newDate } : p))
      );
      patchPost(postId, { post_date: newDate });
    },
    [posts]
  );

  const handleSelectPost = useCallback((post: SocialPost) => {
    setSelectedPostId(post.id);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPostId(null);
  }, []);

  const handleMarkPosted = useCallback((postId: string, isPosted: boolean) => {
    const postedAt = isPosted ? new Date().toISOString() : null;
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, is_posted: isPosted, posted_at: postedAt } : p))
    );
    patchPost(postId, { is_posted: isPosted, posted_at: postedAt });
  }, []);

  const handleSave = useCallback((postId: string, updates: Partial<SocialPost>) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, ...updates } : p)));
    patchPost(postId, updates as Record<string, unknown>);
  }, []);

  const handleDelete = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setSelectedPostId(null);
    fetch(`/api/posts/${postId}`, { method: 'DELETE' });
  }, []);

  const handleMoveDay = useCallback(
    (postId: string, newDate: string) => {
      const post = posts.find((p) => p.id === postId);
      if (!post || post.post_date === newDate) return;

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, post_date: newDate } : p))
      );
      patchPost(postId, { post_date: newDate });
      setSelectedPostId(postId);
    },
    [posts]
  );

  const handlePostCreated = useCallback((newPost: SocialPost) => {
    setPosts((prev) => [...prev, newPost]);
    setShowAddModal(false);
  }, []);

  const handleTagCreated = useCallback((newTag: Tag) => {
    setTags((prev) => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  const handleTagUpdated = useCallback((updatedTag: Tag) => {
    setTags((prev) => prev.map((t) => (t.id === updatedTag.id ? updatedTag : t)));
  }, []);

  const handleTagDeleted = useCallback((tagId: string) => {
    setTags((prev) => prev.filter((t) => t.id !== tagId));
  }, []);

  const postedCount = posts.filter((p) => p.is_posted).length;

  const weekLabel = `${weekDays[0].label} – ${weekDays[6].label}, ${weekStart.getFullYear()}`;

  return (
    <>
      <StatsBar total={posts.length} posted={postedCount} />

      {/* Week navigation + New Post button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrevWeek}
            className="px-2.5 py-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <span className="text-sm font-semibold text-gray-700 px-1">{weekLabel}</span>
          <button
            onClick={goToNextWeek}
            className="px-2.5 py-1.5 text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            →
          </button>
          <button
            onClick={goToToday}
            className="ml-1 text-xs font-semibold text-blue-500 hover:text-blue-700 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Today
          </button>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-700 border border-blue-200 hover:border-blue-400 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span className="text-base leading-none">+</span> New Post
        </button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="grid grid-cols-7 gap-2 min-w-[980px]">
            {weekDays.map((day) => (
              <DayColumn
                key={day.date}
                date={day.date}
                dayName={day.name}
                dayLabel={day.label}
                posts={posts.filter((p) => p.post_date === day.date)}
                tagMap={tagMap}
                onSelectPost={handleSelectPost}
              />
            ))}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {draggingPost && (
            <div className="opacity-90 scale-105 shadow-xl rotate-1">
              <PostCard post={draggingPost} tagMap={tagMap} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          tags={tags}
          onClose={handleCloseModal}
          onMarkPosted={handleMarkPosted}
          onSave={handleSave}
          onMoveDay={handleMoveDay}
          onDelete={handleDelete}
          onTagCreated={handleTagCreated}
          onTagUpdated={handleTagUpdated}
          onTagDeleted={handleTagDeleted}
        />
      )}

      {showAddModal && (
        <AddPostModal
          tags={tags}
          onClose={() => setShowAddModal(false)}
          onCreated={handlePostCreated}
          onTagCreated={handleTagCreated}
          onTagUpdated={handleTagUpdated}
          onTagDeleted={handleTagDeleted}
        />
      )}
    </>
  );
}
