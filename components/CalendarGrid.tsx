'use client';

import { useState, useCallback } from 'react';
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
import { SocialPost, DAYS } from '@/lib/types';
import DayColumn from './DayColumn';
import PostModal from './PostModal';
import AddPostModal from './AddPostModal';
import StatsBar from './StatsBar';
import PostCard from './PostCard';

type Props = {
  initialPosts: SocialPost[];
};

async function patchPost(id: string, updates: Record<string, unknown>) {
  await fetch(`/api/posts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}

export default function CalendarGrid({ initialPosts }: Props) {
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [draggingPost, setDraggingPost] = useState<SocialPost | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Derive selectedPost from posts array so it always reflects latest state
  const selectedPost = selectedPostId ? (posts.find((p) => p.id === selectedPostId) ?? null) : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

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

      const newDayIndex = parseInt(overId.replace('day-', ''), 10);
      if (isNaN(newDayIndex)) return;

      const post = posts.find((p) => p.id === postId);
      if (!post || post.day_index === newDayIndex) return;

      // Optimistic update
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, day_index: newDayIndex } : p))
      );

      // Persist
      patchPost(postId, { day_index: newDayIndex });
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

  const handleMoveDay = useCallback(
    (postId: string, newDayIndex: number) => {
      const post = posts.find((p) => p.id === postId);
      if (!post || post.day_index === newDayIndex) return;

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, day_index: newDayIndex } : p))
      );
      patchPost(postId, { day_index: newDayIndex });

      // Keep modal open with updated post
      setSelectedPostId(postId);
    },
    [posts]
  );

  const handlePostCreated = useCallback((newPost: SocialPost) => {
    setPosts((prev) => [...prev, newPost]);
    setShowAddModal(false);
  }, []);

  const postedCount = posts.filter((p) => p.is_posted).length;

  return (
    <>
      <StatsBar total={posts.length} posted={postedCount} />
      <div className="mb-4">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-700 border border-blue-200 hover:border-blue-400 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          <span className="text-base leading-none">+</span> New Post
        </button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* Horizontally scrollable on mobile */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="grid grid-cols-5 gap-2 min-w-[700px]">
            {DAYS.map((day, i) => (
              <DayColumn
                key={i}
                dayIndex={i}
                dayName={day.name}
                dayDate={day.date}
                posts={posts.filter((p) => p.day_index === i)}
                onSelectPost={handleSelectPost}
              />
            ))}
          </div>
        </div>

        {/* Drag overlay — ghost card that follows the cursor */}
        <DragOverlay dropAnimation={null}>
          {draggingPost && (
            <div className="opacity-90 scale-105 shadow-xl rotate-1">
              <PostCard post={draggingPost} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={handleCloseModal}
          onMarkPosted={handleMarkPosted}
          onSave={handleSave}
          onMoveDay={handleMoveDay}
        />
      )}

      {showAddModal && (
        <AddPostModal
          onClose={() => setShowAddModal(false)}
          onCreated={handlePostCreated}
        />
      )}
    </>
  );
}
