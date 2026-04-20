'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SocialPost, Tag, POST_TYPE_STYLES, TYPE_SECTION, toISODateStr } from '@/lib/types';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
      {children}
    </div>
  );
}

type Props = {
  tags: Tag[];
  onClose: () => void;
  onCreated: (post: SocialPost) => void;
  onTagCreated: (tag: Tag) => void;
  onTagUpdated: (tag: Tag) => void;
};

export default function AddPostModal({ tags, onClose, onCreated, onTagCreated, onTagUpdated }: Props) {
  const today = toISODateStr(new Date());

  const [postType, setPostType] = useState('feed');
  const [name, setName] = useState('');
  const [postDate, setPostDate] = useState(today);
  const [selectedHandles, setSelectedHandles] = useState<string[]>([]);
  const [handleInput, setHandleInput] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [eventLink, setEventLink] = useState('');
  const [bio, setBio] = useState('');
  const [caption, setCaption] = useState('');
  const [showEventLink, setShowEventLink] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Handles suggested by the currently selected tags
  const suggestedHandles = useMemo(() => {
    const all = new Set<string>();
    for (const tagName of selectedTags) {
      const tag = tags.find((t) => t.name === tagName);
      if (tag) tag.handles.forEach((h) => all.add(h));
    }
    return Array.from(all).sort();
  }, [selectedTags, tags]);

  const toggleHandle = useCallback((handle: string) => {
    setSelectedHandles((prev) =>
      prev.includes(handle) ? prev.filter((h) => h !== handle) : [...prev, handle]
    );
  }, []);

  const addHandleFromInput = useCallback(() => {
    const h = handleInput.replace(/^@/, '').trim();
    if (h && !selectedHandles.includes(h)) {
      setSelectedHandles((prev) => [...prev, h]);
    }
    setHandleInput('');
  }, [handleInput, selectedHandles]);

  const addTag = useCallback(async (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed || selectedTags.includes(trimmed)) return;

    setSelectedTags((prev) => [...prev, trimmed]);

    const existingTag = tags.find((t) => t.name === trimmed);
    if (existingTag) {
      if (!eventLink && existingTag.event_link) {
        setEventLink(existingTag.event_link);
        if (!showEventLink) setShowEventLink(true);
      }
    } else {
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
  }, [selectedTags, tags, eventLink, showEventLink, onTagCreated]);

  const removeTag = useCallback((tagName: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tagName));
  }, []);

  const handleNewTagKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(newTagInput);
      setNewTagInput('');
    }
  }, [newTagInput, addTag]);

  const availableTags = tags.filter((t) => !selectedTags.includes(t.name));

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return;
    setSaving(true);
    const handlesList = selectedHandles.length > 0
      ? selectedHandles
      : (handleInput.replace(/^@/, '').trim() ? [handleInput.replace(/^@/, '').trim()] : []);
    const igHandleValue = handlesList.length > 0 ? handlesList.join(' ') : null;
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_type: postType,
          section: TYPE_SECTION[postType],
          name: name.trim(),
          post_date: postDate,
          ig_handle: igHandleValue,
          drive_link: driveLink || null,
          event_link: showEventLink ? (eventLink || null) : null,
          bio: showDescription ? (bio || null) : null,
          caption: caption || null,
          tags: selectedTags,
        }),
      });
      const newPost = await res.json();
      onCreated(newPost);
      // Save handles back to each selected tag for future suggestions
      if (handlesList.length > 0) {
        for (const tagName of selectedTags) {
          const tag = tags.find((t) => t.name === tagName);
          if (!tag) continue;
          const merged = Array.from(new Set([...tag.handles, ...handlesList]));
          if (merged.some((h) => !tag.handles.includes(h))) {
            fetch(`/api/tags/${tag.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ handles: merged }),
            }).then((r) => r.ok ? r.json() : null)
              .then((updated) => { if (updated) onTagUpdated(updated); })
              .catch(() => {});
          }
        }
      }
    } finally {
      setSaving(false);
    }
  }, [postType, name, postDate, selectedHandles, handleInput, driveLink, eventLink, bio, caption, showEventLink, showDescription, selectedTags, tags, onCreated, onTagUpdated]);

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/30" />
      <div
        className="w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">New Post</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none font-light" aria-label="Close">×</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

          {/* Post Type */}
          <div>
            <FieldLabel>Post Type</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(POST_TYPE_STYLES).map(([type, style]) => (
                <button
                  key={type}
                  onClick={() => setPostType(type)}
                  className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded transition-all"
                  style={{
                    backgroundColor: postType === type ? style.color : '#f3f4f6',
                    color: postType === type ? '#fff' : '#6b7280',
                    outline: postType === type ? `2px solid ${style.color}` : 'none',
                    outlineOffset: '1px',
                  }}
                >
                  {style.icon} {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <FieldLabel>Name *</FieldLabel>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Person, brand, or account name"
              className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
            />
          </div>

          {/* Date */}
          <div>
            <FieldLabel>Date</FieldLabel>
            <input
              type="date"
              value={postDate}
              onChange={(e) => setPostDate(e.target.value)}
              className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
            />
          </div>

          {/* Tags */}
          <div>
            <FieldLabel>Tags</FieldLabel>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedTags.map((tagName) => {
                  const tag = tags.find((t) => t.name === tagName);
                  const color = tag?.color ?? '#6b7280';
                  return (
                    <span key={tagName} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
                      {tagName}
                      <button onClick={() => removeTag(tagName)} className="opacity-70 hover:opacity-100 leading-none">×</button>
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
                  <option value="">Add tag…</option>
                  {availableTags.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
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

          {/* IG Handle(s) */}
          <div>
            <FieldLabel>IG Handle{selectedHandles.length > 1 ? 's' : ''}</FieldLabel>

            {/* Selected handles as chips */}
            {selectedHandles.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedHandles.map((h) => (
                  <span key={h} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-700 text-white">
                    @{h}
                    <button onClick={() => toggleHandle(h)} className="opacity-70 hover:opacity-100 leading-none">×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Freeform input */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="text-gray-400 text-sm">@</span>
              <input
                value={handleInput.replace(/^@/, '')}
                onChange={(e) => setHandleInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addHandleFromInput(); } }}
                onBlur={addHandleFromInput}
                placeholder="type handle and press Enter"
                className="flex-1 text-sm text-gray-700 bg-transparent focus:outline-none"
              />
            </div>

            {/* Suggested handles from selected tags */}
            {suggestedHandles.length > 0 && (
              <div className="mt-2">
                <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">From tag</div>
                <div className="flex flex-wrap gap-1">
                  {suggestedHandles.map((h) => {
                    const active = selectedHandles.includes(h);
                    return (
                      <button
                        key={h}
                        onClick={() => toggleHandle(h)}
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded border transition-colors"
                        style={{
                          backgroundColor: active ? '#374151' : '#f9fafb',
                          color: active ? '#fff' : '#6b7280',
                          borderColor: active ? '#374151' : '#e5e7eb',
                        }}
                      >
                        @{h}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Event Link (toggleable) */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" checked={showEventLink} onChange={(e) => setShowEventLink(e.target.checked)} className="rounded" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Event Link</span>
            </label>
            {showEventLink && (
              <input
                value={eventLink}
                onChange={(e) => setEventLink(e.target.value)}
                placeholder="https://partiful.com/e/..."
                className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
              />
            )}
          </div>

          {/* Assets Link */}
          <div>
            <FieldLabel>Assets Link</FieldLabel>
            <input
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
            />
          </div>

          {/* Description (toggleable) */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input type="checkbox" checked={showDescription} onChange={(e) => setShowDescription(e.target.checked)} className="rounded" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Description</span>
            </label>
            {showDescription && (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="A short description..."
                className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
              />
            )}
          </div>

          {/* Caption */}
          <div>
            <FieldLabel>Caption Draft</FieldLabel>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={6}
              placeholder={`@handle\n\nDescription...\n\nEvent link...`}
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
            />
          </div>

        </div>

        <div className="flex-shrink-0 p-4 border-t bg-gray-50">
          <button
            onClick={handleCreate}
            disabled={!name.trim() || saving}
            className="w-full py-2.5 rounded-xl font-semibold text-sm bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Creating…' : 'Create Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
