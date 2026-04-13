'use client';

import { useState, useEffect, useCallback } from 'react';
import { SocialPost, POST_TYPE_STYLES, DAYS } from '@/lib/types';

type Props = {
  post: SocialPost;
  onClose: () => void;
  onMarkPosted: (postId: string, isPosted: boolean) => void;
  onSaveCaption: (postId: string, caption: string) => void;
  onMoveDay: (postId: string, newDayIndex: number) => void;
};

function CopyIcon() {
  return (
    <svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

export default function PostModal({ post, onClose, onMarkPosted, onSaveCaption, onMoveDay }: Props) {
  const [caption, setCaption] = useState(post.caption ?? '');
  const [captionChanged, setCaptionChanged] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Sync caption when post changes (e.g. after save)
  useEffect(() => {
    setCaption(post.caption ?? '');
    setCaptionChanged(false);
  }, [post.id, post.caption]);

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
    } catch {
      // fallback: select the text
    }
  }, []);

  function handleCaptionChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setCaption(val);
    setCaptionChanged(val !== (post.caption ?? ''));
  }

  function handleSave() {
    onSaveCaption(post.id, caption);
    setCaptionChanged(false);
  }

  const typeStyle = POST_TYPE_STYLES[post.post_type];

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
              {post.subtitle && (
                <p className="text-xs text-gray-500 mt-0.5">{post.subtitle}</p>
              )}
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
          {/* IG Handle */}
          {post.ig_handle && (
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                IG Handle
              </div>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-gray-700 flex-1">@{post.ig_handle}</span>
                <button
                  onClick={() => handleCopy(`@${post.ig_handle}`, 'handle')}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700 whitespace-nowrap"
                >
                  {copied === 'handle' ? (
                    <span className="text-green-600">✓ Copied!</span>
                  ) : (
                    <><CopyIcon /> Copy</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Bio */}
          {post.bio && (
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Bio
              </div>
              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 border border-gray-200 rounded-lg p-3">
                {post.bio}
              </p>
            </div>
          )}

          {/* Caption */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Caption Draft
              </div>
              {caption && (
                <button
                  onClick={() => handleCopy(caption, 'caption')}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-700"
                >
                  {copied === 'caption' ? (
                    <span className="text-green-600">✓ Copied!</span>
                  ) : (
                    <><CopyIcon /> Copy caption</>
                  )}
                </button>
              )}
            </div>
            <textarea
              value={caption}
              onChange={handleCaptionChange}
              rows={6}
              className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors"
              placeholder="No caption yet — type one here..."
            />
            {captionChanged && (
              <button
                onClick={handleSave}
                className="mt-1.5 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-md transition-colors"
              >
                Save caption
              </button>
            )}
          </div>

          {/* Move to day */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Move to day
            </div>
            <div className="flex gap-1 flex-wrap">
              {DAYS.map((d, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (i !== post.day_index) {
                      onMoveDay(post.id, i);
                    }
                  }}
                  className={[
                    'px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors',
                    post.day_index === i
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
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t bg-gray-50">
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
        </div>
      </div>
    </div>
  );
}
