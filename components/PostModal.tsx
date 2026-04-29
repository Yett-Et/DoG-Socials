'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SocialPost, Tag, POST_TYPE_STYLES } from '@/lib/types';

type Props = {
  post: SocialPost;
  tags: Tag[];
  onClose: () => void;
  onMarkPosted: (postId: string, isPosted: boolean) => void;
  onMarkMissed: (postId: string, missed: boolean) => void;
  onSave: (postId: string, updates: Partial<SocialPost>) => void;
  onMoveDay: (postId: string, newDate: string) => void;
  onDelete: (postId: string) => void;
  onDuplicate: (postId: string) => void;
  onTagCreated: (tag: Tag) => void;
  onTagUpdated: (tag: Tag) => void;
  onTagDeleted: (tagId: string) => void;
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
    <button onClick={onClick} className="mt-1.5 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-md transition-colors">
      Save
    </button>
  );
}

function splitHandles(raw: string): string[] {
  return raw.split(/[\s,]+/).map((h) => h.replace(/^@/, '').trim()).filter(Boolean);
}

async function patchTag(tag: Tag, updates: Record<string, unknown>, onTagUpdated: (t: Tag) => void) {
  try {
    const res = await fetch(`/api/tags/${tag.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (res.ok) onTagUpdated(await res.json());
  } catch { /* ignore */ }
}

export default function PostModal({
  post, tags, onClose, onMarkPosted, onMarkMissed, onSave, onMoveDay, onDelete, onDuplicate,
  onTagCreated, onTagUpdated, onTagDeleted,
}: Props) {
  const [selectedHandles, setSelectedHandles] = useState<string[]>(
    () => post.ig_handle ? splitHandles(post.ig_handle) : []
  );
  const [handleInput, setHandleInput] = useState('');
  const [driveLink, setDriveLink] = useState(post.drive_link ?? '');
  const [eventLink, setEventLink] = useState(post.event_link ?? '');
  const [bio, setBio] = useState(post.bio ?? '');
  const [caption, setCaption] = useState(post.caption ?? '');
  const [postTags, setPostTags] = useState<string[]>(post.tags ?? []);
  const [newTagInput, setNewTagInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeleteTagId, setConfirmDeleteTagId] = useState<string | null>(null);
  const [confirmDeleteHandle, setConfirmDeleteHandle] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(post.name);

  useEffect(() => {
    setSelectedHandles(post.ig_handle ? splitHandles(post.ig_handle) : []);
    setHandleInput('');
    setDriveLink(post.drive_link ?? '');
    setEventLink(post.event_link ?? '');
    setBio(post.bio ?? '');
    setCaption(post.caption ?? '');
    setPostTags(post.tags ?? []);
    setNewTagInput('');
    setConfirmDelete(false);
    setConfirmDeleteTagId(null);
    setConfirmDeleteHandle(null);
    setEditingName(false);
    setNameValue(post.name);
  }, [post.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
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

  const originalHandles = useMemo(
    () => (post.ig_handle ? splitHandles(post.ig_handle) : []),
    [post.ig_handle]
  );

  const igHandleChanged =
    selectedHandles.length !== originalHandles.length ||
    selectedHandles.some((h) => !originalHandles.includes(h)) ||
    originalHandles.some((h) => !selectedHandles.includes(h));

  const driveLinkChanged = driveLink !== (post.drive_link ?? '');
  const eventLinkChanged = eventLink !== (post.event_link ?? '');
  const bioChanged = bio !== (post.bio ?? '');
  const captionChanged = caption !== (post.caption ?? '');

  const typeStyle = POST_TYPE_STYLES[post.post_type] ?? POST_TYPE_STYLES['feed'];

  // ── Name ──────────────────────────────────────────────────────────
  const handleSaveName = useCallback(() => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== post.name) onSave(post.id, { name: trimmed });
    setEditingName(false);
  }, [nameValue, post.name, post.id, onSave]);

  // ── Handle helpers ────────────────────────────────────────────────
  const toggleHandle = useCallback((h: string) => {
    setSelectedHandles((prev) => prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h]);
  }, []);

  const addHandleFromInput = useCallback(() => {
    const h = handleInput.replace(/^@/, '').trim();
    if (h && !selectedHandles.includes(h)) setSelectedHandles((prev) => [...prev, h]);
    setHandleInput('');
  }, [handleInput, selectedHandles]);

  const removeHandleFromTag = useCallback(async (handle: string) => {
    for (const tagName of postTags) {
      const tag = tags.find((t) => t.name === tagName);
      if (!tag || !tag.handles.includes(handle)) continue;
      await patchTag(tag, { handles: tag.handles.filter((h) => h !== handle) }, onTagUpdated);
    }
  }, [postTags, tags, onTagUpdated]);

  const handleSaveIgHandle = useCallback(() => {
    const value = selectedHandles.join(' ') || null;
    onSave(post.id, { ig_handle: value });
    if (selectedHandles.length > 0) {
      for (const tagName of postTags) {
        const tag = tags.find((t) => t.name === tagName);
        if (!tag) continue;
        const merged = Array.from(new Set([...tag.handles, ...selectedHandles]));
        if (merged.some((h) => !tag.handles.includes(h))) patchTag(tag, { handles: merged }, onTagUpdated);
      }
    }
  }, [selectedHandles, post.id, postTags, tags, onSave, onTagUpdated]);

  // ── Tag helpers ───────────────────────────────────────────────────
  const toggleTag = useCallback(async (tag: Tag) => {
    const isSelected = postTags.includes(tag.name);
    if (isSelected) {
      const newTags = postTags.filter((t) => t !== tag.name);
      setPostTags(newTags);
      onSave(post.id, { tags: newTags });
    } else {
      const newTags = [...postTags, tag.name];
      setPostTags(newTags);
      onSave(post.id, { tags: newTags });
      if (!eventLink && tag.event_link) {
        setEventLink(tag.event_link);
        onSave(post.id, { event_link: tag.event_link });
      }
    }
  }, [postTags, eventLink, post.id, onSave]);

  const addNewTag = useCallback(async (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed || postTags.includes(trimmed)) return;
    const newTags = [...postTags, trimmed];
    setPostTags(newTags);
    onSave(post.id, { tags: newTags });
    const existing = tags.find((t) => t.name === trimmed);
    if (existing) {
      if (!eventLink && existing.event_link) {
        setEventLink(existing.event_link);
        onSave(post.id, { event_link: existing.event_link });
      }
    } else {
      try {
        const res = await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmed }),
        });
        if (res.ok) onTagCreated(await res.json());
      } catch { /* ignore */ }
    }
  }, [postTags, tags, eventLink, post.id, onSave, onTagCreated]);

  const handleNewTagKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addNewTag(newTagInput);
      setNewTagInput('');
    }
  }, [newTagInput, addNewTag]);

  const handleDeleteTag = useCallback(async (tag: Tag) => {
    try {
      const res = await fetch(`/api/tags/${tag.id}`, { method: 'DELETE' });
      if (res.ok) {
        onTagDeleted(tag.id);
        if (postTags.includes(tag.name)) {
          const newTags = postTags.filter((t) => t !== tag.name);
          setPostTags(newTags);
          onSave(post.id, { tags: newTags });
        }
      }
    } catch { /* ignore */ }
  }, [onTagDeleted, postTags, post.id, onSave]);

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
      <div className="flex-1 bg-black/30" />
      <div className="w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={`flex-shrink-0 p-4 border-b ${typeStyle.bg} ${typeStyle.border} border-l-4`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mb-1.5 text-white" style={{ backgroundColor: typeStyle.color }}>
                {typeStyle.icon} {typeStyle.label}
              </span>
              {editingName ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <input
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') { setNameValue(post.name); setEditingName(false); } }}
                    autoFocus
                    className="flex-1 min-w-0 text-base font-bold text-gray-900 bg-white border border-blue-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <button onClick={handleSaveName} className="text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded flex-shrink-0">Save</button>
                  <button onClick={() => { setNameValue(post.name); setEditingName(false); }} className="text-gray-400 hover:text-gray-600 text-lg leading-none flex-shrink-0">×</button>
                </div>
              ) : (
                <div className="group flex items-start gap-1 cursor-pointer" onClick={() => setEditingName(true)}>
                  <h2 className="text-base font-bold text-gray-900 leading-tight">{post.name}</h2>
                  <span className="text-gray-300 group-hover:text-gray-500 text-[11px] mt-0.5 flex-shrink-0 transition-colors">✎</span>
                </div>
              )}
              {post.subtitle && <p className="text-xs text-gray-500 mt-0.5">{post.subtitle}</p>}
            </div>
            <button onClick={onClose} className="flex-shrink-0 text-gray-400 hover:text-gray-700 text-2xl leading-none font-light mt-0.5" aria-label="Close">×</button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

          {/* Tags — unified toggleable section */}
          <div>
            <FieldLabel>Tags</FieldLabel>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map((tag) => {
                  const isSelected = postTags.includes(tag.name);
                  if (confirmDeleteTagId === tag.id) {
                    return (
                      <div key={tag.id} className="inline-flex items-center rounded-full border border-red-300 bg-red-50 overflow-hidden text-[10px] font-semibold">
                        <span className="pl-2 pr-1 py-0.5 text-red-500">Delete "{tag.name}"?</span>
                        <button onClick={() => { handleDeleteTag(tag); setConfirmDeleteTagId(null); }} className="px-1.5 py-0.5 text-red-500 hover:bg-red-100 font-bold leading-none">✓</button>
                        <button onClick={() => setConfirmDeleteTagId(null)} className="pr-1.5 py-0.5 text-gray-400 hover:text-gray-600 leading-none">✗</button>
                      </div>
                    );
                  }
                  return (
                    <div key={tag.id} className="inline-flex items-center rounded-full border overflow-hidden text-[10px] font-semibold transition-colors"
                      style={{ borderColor: tag.color, backgroundColor: isSelected ? tag.color : 'transparent' }}>
                      <button
                        onClick={() => toggleTag(tag)}
                        className="pl-2 pr-1 py-0.5 transition-opacity hover:opacity-75"
                        style={{ color: isSelected ? '#fff' : tag.color }}
                      >
                        {isSelected ? '✓ ' : '+ '}{tag.name}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteTagId(tag.id); }}
                        className="pr-1.5 py-0.5 opacity-40 hover:opacity-100 hover:text-red-400 transition-all leading-none"
                        style={{ color: isSelected ? '#fff' : tag.color }}
                        title="Delete tag"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <input
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={handleNewTagKeyDown}
              onBlur={() => { if (newTagInput.trim()) { addNewTag(newTagInput); setNewTagInput(''); } }}
              placeholder="New tag…"
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
          </div>

          {/* Event Link */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>Event Link</FieldLabel>
              {eventLink && (
                <button onClick={() => handleCopy(eventLink, 'eventlink')} className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700">
                  {copied === 'eventlink' ? <span className="text-green-600">✓ Copied!</span> : <><CopyIcon /> Copy link</>}
                </button>
              )}
            </div>
            <input value={eventLink} onChange={(e) => setEventLink(e.target.value)} placeholder="https://partiful.com/e/..." className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors" />
            {eventLinkChanged && <SaveButton onClick={() => onSave(post.id, { event_link: eventLink || null })} />}
          </div>

          {/* Assets Link */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>Assets Link</FieldLabel>
              {driveLink && <a href={driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700">Open ↗</a>}
            </div>
            <input value={driveLink} onChange={(e) => setDriveLink(e.target.value)} placeholder="https://drive.google.com/..." className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors" />
            {driveLinkChanged && <SaveButton onClick={() => onSave(post.id, { drive_link: driveLink || null })} />}
          </div>

          {/* IG Handle(s) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>IG Handle{selectedHandles.length > 1 ? 's' : ''}</FieldLabel>
              {selectedHandles.length > 0 && (
                <button onClick={() => handleCopy(selectedHandles.map((h) => `@${h}`).join(' '), 'handle')} className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700">
                  {copied === 'handle' ? <span className="text-green-600">✓ Copied!</span> : <><CopyIcon /> Copy</>}
                </button>
              )}
            </div>

            {selectedHandles.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedHandles.map((h) => (
                  <button key={h} onClick={() => toggleHandle(h)} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-700 text-white hover:bg-gray-500 transition-colors">
                    @{h} <span className="opacity-60">×</span>
                  </button>
                ))}
              </div>
            )}

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

            {suggestedHandles.length > 0 && (
              <div className="mt-2">
                <div className="text-[9px] text-gray-400 uppercase tracking-wider mb-1">From tag</div>
                <div className="flex flex-wrap gap-1">
                  {suggestedHandles.map((h) => {
                    const active = selectedHandles.includes(h);
                    if (confirmDeleteHandle === h) {
                      return (
                        <div key={h} className="inline-flex items-center rounded border border-red-300 bg-red-50 overflow-hidden">
                          <span className="pl-1.5 pr-1 py-0.5 text-[9px] text-red-500">Remove @{h}?</span>
                          <button onClick={() => { removeHandleFromTag(h); setConfirmDeleteHandle(null); }} className="px-1 py-0.5 text-[9px] text-red-500 hover:bg-red-100 font-bold leading-none">✓</button>
                          <button onClick={() => setConfirmDeleteHandle(null)} className="pr-1 py-0.5 text-[9px] text-gray-400 hover:text-gray-600 leading-none">✗</button>
                        </div>
                      );
                    }
                    return (
                      <div key={h} className="inline-flex items-center rounded border overflow-hidden" style={{ backgroundColor: active ? '#374151' : '#f9fafb', borderColor: active ? '#374151' : '#e5e7eb' }}>
                        <button onClick={() => toggleHandle(h)} className="text-[9px] font-semibold px-1.5 py-0.5" style={{ color: active ? '#fff' : '#6b7280' }}>
                          @{h}
                        </button>
                        <button onClick={() => setConfirmDeleteHandle(h)} className="pr-1 text-[9px] opacity-30 hover:opacity-100 hover:text-red-400 transition-all leading-none" title="Remove from tag" style={{ color: active ? '#fff' : '#9ca3af' }}>
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {igHandleChanged && <SaveButton onClick={handleSaveIgHandle} />}
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>Description</FieldLabel>
              {bio && (
                <button onClick={() => handleCopy(bio, 'bio')} className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700">
                  {copied === 'bio' ? <span className="text-green-600">✓ Copied!</span> : <><CopyIcon /> Copy</>}
                </button>
              )}
            </div>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="No description yet — type one here..." className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors" />
            {bioChanged && <SaveButton onClick={() => onSave(post.id, { bio: bio || null })} />}
          </div>

          {/* Caption */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <FieldLabel>Caption Draft</FieldLabel>
              {caption && (
                <button onClick={() => handleCopy(caption, 'caption')} className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700">
                  {copied === 'caption' ? <span className="text-green-600">✓ Copied!</span> : <><CopyIcon /> Copy caption</>}
                </button>
              )}
            </div>
            <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={6} placeholder="No caption yet — type one here..." className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors" />
            {captionChanged && <SaveButton onClick={() => onSave(post.id, { caption: caption || null })} />}
          </div>

          {/* Move to day */}
          <div>
            <FieldLabel>Move to day</FieldLabel>
            <input type="date" defaultValue={post.post_date} key={post.post_date} onChange={(e) => { if (e.target.value) onMoveDay(post.id, e.target.value); }} className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t bg-gray-50 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => onMarkPosted(post.id, !post.is_posted)}
              className={['flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors', post.is_posted ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'].join(' ')}
            >
              {post.is_posted ? '✓ Posted' : 'Posted'}
            </button>
            {!post.is_posted && (
              <button
                onClick={() => onMarkMissed(post.id, !post.missed)}
                className={['flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors', post.missed ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-600'].join(' ')}
              >
                {post.missed ? '✗ Never Posted' : 'Never Posted'}
              </button>
            )}
          </div>
          {confirmDelete ? (
            <div className="flex gap-2">
              <button onClick={() => onDelete(post.id)} className="flex-1 py-2 rounded-xl font-semibold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors">Confirm Delete</button>
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 rounded-xl font-semibold text-sm bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">Cancel</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { onDuplicate(post.id); onClose(); }}
                className="flex-1 py-2 rounded-xl font-semibold text-sm text-blue-500 hover:text-blue-700 hover:bg-blue-50 bg-gray-100 transition-colors"
              >
                Duplicate
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex-1 py-2 rounded-xl font-semibold text-sm text-red-400 hover:text-red-600 hover:bg-red-50 bg-gray-100 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
