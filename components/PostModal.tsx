'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SocialPost, Tag, POST_TYPE_STYLES } from '@/lib/types';

type Props = {
  post: SocialPost;
  tags: Tag[];
  onClose: () => void;
  onMarkPosted: (postId: string, isPosted: boolean) => void;
  onSave: (postId: string, updates: Partial<SocialPost>) => void;
  onMoveDay: (postId: string, newDate: string) => void;
  onDelete: (postId: string) => void;
  onTagCreated: (tag: Tag) => void;
};

function CopyIcon() {
  return (
    <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
      {children}
    </div>
  );
}

function SaveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mt-1.5 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-md transition-colors"
    >
      Save
    </button>
  );
}

export default function PostModal({ post, tags, onClose, onMarkPosted, onSave, onMoveDay, onDelete, onTagCreated }: Props) {
  const [igHandle, setIgHandle] = useState(post.ig_handle ?? '');
  const [driveLink, setDriveLink] = useState(post.drive_link ?? '');
  const [eventLink, setEventLink] = useState(post.event_link ?? '');
  const [bio, setBio] = useState(post.bio ?? '');
  const [caption, setCaption] = useState(post.caption ?? '');
  const [postTags, setPostTags] = useState<string[]>(post.tags ?? []);
  const [newTagInput, setNewTagInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync fields when a different post is opened
  useEffect(() => {
    setIgHandle(post.ig_handle ?? '');
    setDriveLink(post.drive_link ?? '');
    setEventLink(post.event_link ?? '');
    setBio(post.bio ?? '');
    setCaption(post.caption ?? '');
    setPostTags(post.tags ?? []);
    setNewTagInput('');
    setConfirmDelete(false);
  }, [post.id]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch { /* ignore */ }
  }, []);

  const igHandleChanged = igHandle !== (post.ig_handle ?? '');
  const driveLinkChanged = driveLink !== (post.drive_link ?? '');
  const eventLinkChanged = eventLink !== (post.event_link ?? '');
  const bioChanged = bio !== (post.bio ?? '');
  const captionChanged = caption !== (post.caption ?? '');

  const typeStyle = POST_TYPE_STYLES[post.post_type] ?? POST_TYPE_STYLES['feed'];

  // Tags helpers
  const addTag = useCallback(async (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed || postTags.includes(trimmed)) return;

    const newTags = [...postTags, trimmed];
    setPostTags(newTags);
    onSave(post.id, { tags: newTags });

    // Auto-fill event_link if blank and tag has one
    const existingTag = tags.find((t) => t.name === trimmed);
    if (existingTag) {
      if (!eventLink && existingTag.event_link) {
        setEventLink(existingTag.event_link);
        onSave(post.id, { event_link: existingTag.event_link });
      }
    } else {
      // Create new tag in DB
      try {
        const res = await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmed }),
        });
        if (res.ok) {
          const newTag: Tag = await res.json();
          onTagCreated(newTag);
        }
      } catch { /* ignore */ }
    }
  }, [postTags, tags, eventLink, post.id, onSave, onTagCreated]);

  const removeTag = useCallback((tagName: string) => {
    const newTags = postTags.filter((t) => t !== tagName);
    setPostTags(newTags);
    onSave(post.id, { tags: newTags });
  }, [postTags, post.id, onSave]);

  const handleNewTagKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(newTagInput);
      setNewTagInput('');
    }
  }, [newTagInput, addTag]);

  const availableTags = tags.filter((t) => !postTags.includes(t.name));

  // Handles suggested by the post's current tags
  const suggestedHandles = useMemo(() => {
    const all = new Set<string>();
    for (const tagName of postTags) {
      const tag = tags.find((t) => t.name === tagName);
      if (tag) tag.handles.forEach((h) => all.add(h));
    }
    return Array.from(all).sort();
  }, [postTags, tags]);

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-black/30" />

      {/* Panel */}
      <div
        className="w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex-shrink-0 p-4 border-b ${typeStyle.bg} ${typeStyle.border} border-l-4`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span
                className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mb-1.5 text-white"
                style={{ backgroundColor: typeStyle.color }}
              >
                {typeStyle.icon} {typeStyle.label}
              </span>
              <h2 className="text-base font-bold text-gray-900 leading-tight">{post.name}</h2>
              {post.subtitle && <p className="text-xs text-gray-500 mt-0.5">{post.subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-700 text-2xl leading-none font-light mt-0.5"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

          {/* Tags */}
          <div>
            <FieldLabel>Tags</FieldLabel>
            {postTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {postTags.map((tagName) => {
                  const tag = tags.find((t) => t.name === tagName);
                  const color = tag?.color ?? '#6b7280';
                  return (
                    <span
                      key={tagName}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: color }}
                    >
                      {tagName}
                      <button
                        onClick={() => removeTag(tagName)}
                        className="opacity-70 hover:opacity-100 leading-none"
                        aria-label={`Remove tag ${tagName}`}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            <div className="flex gap-1.5">
              {availableTags.length > 0 && (
                <select
                  className="flex-1 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value=""
                  onChange={(e) => { if (e.target.value) { addTag(e.target.value); e.target.value = ''; } }}
                >
                  <option value="">Add existing tag…</option>
                  {availableTags.map((t) => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              )}
              <input
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleNewTagKeyDown}
                onBlur={() => { if (newTagInput.trim()) { addTag(newTagInput); setNewTagInput(''); } }}
                placeholder="New tag…"
                className="flex-1 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
          </div>

          {/* Event Link */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>Event Link</FieldLabel>
              {eventLink && (
                <button
                  onClick={() => handleCopy(eventLink, 'eventlink')}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700"
                >
                  {copied === 'eventlink'
                    ? <span className="text-green-600">✓ Copied!</span>
                    : <><CopyIcon /> Copy link</>}
                </button>
              )}
            </div>
            <input
              value={eventLink}
              onChange={(e) => setEventLink(e.target.value)}
              placeholder="https://partiful.com/e/..."
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
            />
            {eventLinkChanged && (
              <SaveButton onClick={() => onSave(post.id, { event_link: eventLink || null })} />
            )}
          </div>

          {/* Assets Link */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>Assets Link</FieldLabel>
              {driveLink && (
                <a
                  href={driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700"
                >
                  Open ↗
                </a>
              )}
            </div>
            <input
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
            />
            {driveLinkChanged && (
              <SaveButton onClick={() => onSave(post.id, { drive_link: driveLink || null })} />
            )}
          </div>

          {/* IG Handle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>IG Handle</FieldLabel>
              {igHandle && (
                <button
                  onClick={() => handleCopy(`@${igHandle.replace(/^@/, '')}`, 'handle')}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700"
                >
                  {copied === 'handle'
                    ? <span className="text-green-600">✓ Copied!</span>
                    : <><CopyIcon /> Copy</>}
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="text-gray-400 text-sm">@</span>
              <input
                value={igHandle.replace(/^@/, '')}
                onChange={(e) => setIgHandle(e.target.value)}
                placeholder="handle"
                className="flex-1 text-sm text-gray-700 bg-transparent focus:outline-none"
              />
            </div>
            {suggestedHandles.length > 0 && (
              <div className="mt-2">
                <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">From tag</div>
                <div className="flex flex-wrap gap-1">
                  {suggestedHandles.map((h) => (
                    <button
                      key={h}
                      onClick={() => setIgHandle(h)}
                      className={[
                        'text-[9px] font-semibold px-1.5 py-0.5 rounded border transition-colors',
                        igHandle.replace(/^@/, '') === h
                          ? 'bg-gray-700 text-white border-gray-700'
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400',
                      ].join(' ')}
                    >
                      @{h}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {igHandleChanged && (
              <SaveButton onClick={() => onSave(post.id, { ig_handle: igHandle.replace(/^@/, '') || null })} />
            )}
          </div>

          {/* Description (bio) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>Description</FieldLabel>
              {bio && (
                <button
                  onClick={() => handleCopy(bio, 'bio')}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700"
                >
                  {copied === 'bio'
                    ? <span className="text-green-600">✓ Copied!</span>
                    : <><CopyIcon /> Copy</>}
                </button>
              )}
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="No description yet — type one here..."
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
            />
            {bioChanged && (
              <SaveButton onClick={() => onSave(post.id, { bio: bio || null })} />
            )}
          </div>

          {/* Caption */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>Caption Draft</FieldLabel>
              {caption && (
                <button
                  onClick={() => handleCopy(caption, 'caption')}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700"
                >
                  {copied === 'caption'
                    ? <span className="text-green-600">✓ Copied!</span>
                    : <><CopyIcon /> Copy caption</>}
                </button>
              )}
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={6}
              placeholder="No caption yet — type one here..."
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
            />
            {captionChanged && (
              <SaveButton onClick={() => onSave(post.id, { caption: caption || null })} />
            )}
          </div>

          {/* Move to day */}
          <div>
            <FieldLabel>Move to day</FieldLabel>
            <input
              type="date"
              defaultValue={post.post_date}
              key={post.post_date}
              onChange={(e) => { if (e.target.value) onMoveDay(post.id, e.target.value); }}
              className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t bg-gray-50 flex flex-col gap-2">
          <button
            onClick={() => onMarkPosted(post.id, !post.is_posted)}
            className={[
              'w-full py-2.5 rounded-xl font-semibold text-sm transition-colors',
              post.is_posted
                ? 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                : 'bg-green-500 text-white hover:bg-green-600',
            ].join(' ')}
          >
            {post.is_posted ? '✓ Posted — Tap to unmark' : 'Mark as Posted ✓'}
          </button>
          {confirmDelete ? (
            <div className="flex gap-2">
              <button
                onClick={() => onDelete(post.id)}
                className="flex-1 py-2 rounded-xl font-semibold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 rounded-xl font-semibold text-sm bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full py-2 rounded-xl font-semibold text-sm text-red-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
            >
              Delete post
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
