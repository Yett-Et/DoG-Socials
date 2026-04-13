'use client';

import { useState, useEffect, useCallback } from 'react';
import { SocialPost, POST_TYPE_STYLES, DAYS } from '@/lib/types';

const TYPE_SECTION: Record<string, 'feed' | 'story'> = {
  af: 'feed',
  sf: 'feed',
  ir: 'feed',
  as: 'story',
  ss: 'story',
  is: 'story',
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
      {children}
    </div>
  );
}

type Props = {
  onClose: () => void;
  onCreated: (post: SocialPost) => void;
};

export default function AddPostModal({ onClose, onCreated }: Props) {
  const [postType, setPostType] = useState('af');
  const [name, setName] = useState('');
  const [dayIndex, setDayIndex] = useState(0);
  const [igHandle, setIgHandle] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [bio, setBio] = useState('');
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_type: postType,
          section: TYPE_SECTION[postType],
          name: name.trim(),
          day_index: dayIndex,
          ig_handle: igHandle.replace(/^@/, '') || null,
          drive_link: driveLink || null,
          bio: bio || null,
          caption: caption || null,
        }),
      });
      const newPost = await res.json();
      onCreated(newPost);
    } finally {
      setSaving(false);
    }
  }, [postType, name, dayIndex, igHandle, driveLink, bio, caption, onCreated]);

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/30" />
      <div
        className="w-full max-w-sm bg-white shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">New Post</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl leading-none font-light"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable content */}
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
              placeholder="Artist / Sponsor / Influencer name"
              className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
            />
          </div>

          {/* Day */}
          <div>
            <FieldLabel>Day</FieldLabel>
            <div className="flex gap-1 flex-wrap">
              {DAYS.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setDayIndex(i)}
                  className={[
                    'px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors',
                    dayIndex === i
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50',
                  ].join(' ')}
                >
                  {d.name}
                  <span className="ml-1 font-normal opacity-60">{d.date.split(' ')[1]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* IG Handle */}
          <div>
            <FieldLabel>IG Handle</FieldLabel>
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <span className="text-gray-400 text-sm">@</span>
              <input
                value={igHandle.replace(/^@/, '')}
                onChange={(e) => setIgHandle(e.target.value)}
                placeholder="handle"
                className="flex-1 text-sm text-gray-700 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Event Link */}
          <div>
            <FieldLabel>Event Link</FieldLabel>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-400 truncate">
              partiful.com/e/CeIqFeWlGdikbguBUm8M — pre-filled on all posts
            </div>
          </div>

          {/* Assets Folder */}
          <div>
            <FieldLabel>Assets Folder</FieldLabel>
            <input
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
            />
          </div>

          {/* Bio */}
          <div>
            <FieldLabel>Bio</FieldLabel>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="A [descriptor] who..."
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
            />
          </div>

          {/* Caption */}
          <div>
            <FieldLabel>Caption Draft</FieldLabel>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={6}
              placeholder={`@handle\n\nBio text...\n\nPart of Dreaming of Greece...`}
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
            />
          </div>

        </div>

        {/* Footer */}
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
