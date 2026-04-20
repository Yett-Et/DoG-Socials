# Moments. Gallery — Social Calendar

A general-purpose social media planning tool for managing Instagram posting schedules across campaigns, events, and projects.

Built with a rolling weekly calendar, drag-and-drop rescheduling, and a tag/project system for organizing posts by event or campaign.

---

## What It Does

The app displays a scrollable weekly calendar grid showing every planned social media post. Each post is a card you can tap to open a detail panel where you can edit captions, view bios, grab asset links, and mark posts as done.

**Core features:**

- **Rolling weekly calendar** — navigate forward/backward by week, jump to today
- **Color-coded post types** — 4 types at a glance (Feed, Carousel, Reel, Story)
- **Tags / projects** — group posts by event or campaign; tags carry metadata (event link, associated IG handles)
- **Tap any card** to open the detail panel (description, caption, IG handle, assets link, event link, tags)
- **One-tap copy** for IG handle, description, caption, and event link
- **Mark as Posted** — cards fade and get a checkmark; persists across refreshes
- **Drag cards** between day columns to reschedule
- **Add new posts** — create any post type with a date picker
- **Delete posts** — two-step confirmation to avoid accidents
- **Edit everything** — all fields are editable inline with auto-save

---

## Post Types

| Badge | Type | Section |
|---|---|---|
| ◼ Feed | `feed` | Feed |
| ▦ Carousel | `carousel` | Feed |
| ▶ Reel | `reel` | Feed |
| ◎ Story | `story` | Stories |

Feed, Carousel, and Reel posts appear in the **Feed** section of each day column. Story posts appear in the **Stories** section below.

---

## Tags / Projects

Tags are the primary way to organize posts by event or campaign (e.g. "Dreaming of Greece", "Summer Launch").

Each tag can store:
- **Name** — displayed as a colored chip on each post card
- **Event Link** — default event link auto-filled on posts when the tag is applied (one-way; editing a post's event link doesn't change the tag's default)
- **Handles** — list of IG handles associated with this tag; shown as clickable chips in the handle picker; automatically updated when handles are saved on posts with this tag
- **Color** — pill color for visual identification; new tags are auto-assigned distinct colors

Tags are created on the fly — just type a new name in the tag field and press Enter.

---

## How to Use It

### Browsing the Calendar

Use the **← →** arrows to navigate weeks, or click **Today** to jump back to the current week. Each day column shows Feed posts on top and Story posts below.

Each card shows:
- Post type badge (color-coded)
- Name
- IG handle (if set)
- Tag chips
- A faded look + ✓ if already marked as posted

### Opening a Post

Tap any card to open the detail panel. From here you can:

**Copy things:**
- **Event Link** — copies the event RSVP link to clipboard
- **IG Handle** — copies `@handle` ready to paste into Instagram
- **Description** — copies the full bio/description text
- **Caption Draft** — copies the full caption

**Edit things:**
- **IG Handle** — type a new handle; a Save button appears
- **Assets Link** — paste a Google Drive link; the "Open ↗" link updates immediately
- **Event Link** — edit per-post; a Save button appears when changed
- **Description** — edit directly, Save when done
- **Caption Draft** — edit directly, Save when done
- **Tags** — add/remove tags via dropdown or freeform input; selecting a tag auto-fills its event link and surfaces its handles

All saves persist immediately to the database — no page refresh needed.

**Move to a different day:**
Use the date picker at the bottom of the panel to move the post to any date. The card jumps to the new column instantly.

**Mark as Posted:**
Big green button at the bottom of the panel. Tap once to mark done, tap again to unmark.

**Delete a post:**
Red "Delete post" button below the green button — shows a confirm prompt to prevent accidents.

### Dragging Posts

Drag any card directly to a different day column without opening the panel. The card moves instantly and the change saves in the background.

### Adding a New Post

Click **+ New Post** above the calendar grid. A form panel slides in with:

- **Post Type** — click one of the 4 colored buttons (Feed, Carousel, Reel, Story)
- **Name** — the person, brand, or account name (required)
- **Date** — date picker to place it on any day
- **Tags** — select existing tags or type to create new ones; selecting a tag auto-fills its event link and suggests its handles
- **IG Handle(s)** — type freeform or click suggested handles from selected tags
- **Event Link** — optional; toggle with checkbox; auto-filled when a tag is selected
- **Assets Link** — paste a Google Drive link
- **Description** — optional; toggle with checkbox
- **Caption Draft** — write or paste the full caption

Click **Create Post** and it appears in the correct day column immediately.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Drag & Drop | @dnd-kit/core |
| Deployment | Vercel (auto-deploys on push to `main`) |

---

## Database

### `social_calendar_posts`

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `post_date` | Date | The scheduled date (`YYYY-MM-DD`) |
| `section` | Text | `feed` or `story` |
| `post_type` | Text | `feed`, `carousel`, `reel`, or `story` |
| `name` | Text | Display name |
| `ig_handle` | Text | Instagram handle(s), comma-separated |
| `bio` | Text | Description text |
| `caption` | Text | Full caption draft |
| `drive_link` | Text | Google Drive link |
| `event_link` | Text | Per-post event/RSVP link |
| `tags` | Text[] | Array of tag names associated with this post |
| `position` | Integer | Sort order within a day+section |
| `is_posted` | Boolean | Whether the post has been marked done |
| `posted_at` | Timestamp | When it was marked done |
| `created_at` | Timestamp | Row creation time |
| `updated_at` | Timestamp | Last modified time |

### `tags`

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | Text | Unique tag name |
| `event_link` | Text | Default event link for this tag |
| `handles` | Text[] | IG handles associated with this tag |
| `color` | Text | Hex color for tag chips |
| `created_at` | Timestamp | Row creation time |

---

## File Structure

```
/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Server component — fetches posts + tags from Supabase
│   ├── globals.css
│   └── api/
│       ├── posts/
│       │   ├── route.ts        # POST — create a new post
│       │   └── [id]/
│       │       └── route.ts   # PATCH — update fields | DELETE — remove post
│       └── tags/
│           └── route.ts        # GET — list tags | POST — create a new tag
│
├── components/
│   ├── CalendarGrid.tsx        # Main client component — holds all state, DnD context
│   ├── DayColumn.tsx           # One day column (Feed + Stories sections, droppable)
│   ├── PostCard.tsx            # Individual draggable card
│   ├── PostModal.tsx           # Slide-in detail panel (edit, copy, move, delete)
│   ├── AddPostModal.tsx        # Slide-in form for creating new posts
│   └── StatsBar.tsx            # Posted / Remaining / % progress bar
│
├── lib/
│   ├── supabase.ts             # Supabase client
│   └── types.ts                # SocialPost + Tag types, POST_TYPE_STYLES, TYPE_SECTION, helpers
│
├── public/
│   └── logo.svg                # Logo shown in the header — replace with your own file
├── .env.local                  # NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
└── next.config.mjs             # Next.js config
```

---

## Data Flow

1. **Page load** — `app/page.tsx` (server component) fetches all posts and tags from Supabase with `cache: 'no-store'`
2. **Client state** — `CalendarGrid.tsx` holds posts and tags in React state; all UI interactions update state immediately (optimistic)
3. **Persistence** — every mutation fires a `PATCH` or `DELETE` to the API in the background
4. **API routes** — all routes talk directly to Supabase server-side

Because all updates are optimistic, the UI always feels instant.

---

## Deployment

Auto-deploys to Vercel on every push to `main`.

Environment variables required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
