# Dreaming of Greece — Social Calendar

An internal tool for managing the social media posting schedule for the **Dreaming of Greece** exhibition at Moments Gallery, Dream Downtown NYC (Opening Night: Saturday April 18th).

Built for Vasia to handle all posting across artists, sponsors, and influencers during the week of April 13–17.

---

## What It Does

The app displays a 5-day calendar grid (Mon–Fri) showing every social media post planned for the week. Each post is a card you can tap to open a detail panel where you can copy captions, view bios, grab Drive links, and mark posts as done.

**Core features:**

- **5-day calendar grid** — Mon Apr 13 through Fri Apr 17, each column showing that day's feed and story posts
- **Color-coded post types** — 6 types at a glance (see legend below)
- **Tap any card** to open the detail panel (bio, caption, IG handle, Drive link, event link)
- **One-tap copy** for IG handle, bio, caption, and event link
- **Mark as Posted** — cards fade and get a checkmark; persists across refreshes
- **Drag cards** between day columns to reschedule
- **Add new posts** — create any post type directly from the UI
- **Delete posts** — two-step confirmation to avoid accidents
- **Edit everything** — bio, caption, IG handle, and assets folder link are all editable inline
- **Progress bar** — shows how many posts have been marked as done

---

## Post Types

| Badge | Type | Used For |
|---|---|---|
| ◼ Artist Feed | `af` | Artists' feed posts (carousel / single image) |
| ◎ Artist Story | `as` | Artists' story posts |
| ◼ Sponsor Feed | `sf` | Sponsor carousel (one combined post) |
| ◎ Sponsor Story | `ss` | Individual sponsor story tags |
| ◎ Influencer Story | `is` | Influencer story tags |
| ▶ Influencer Reel | `ir` | Influencer reel (one combined post) |

Feed posts (`af`, `sf`, `ir`) appear in the **Feed** section of each day column. Story posts (`as`, `ss`, `is`) appear in the **Stories** section below.

---

## How to Use It

### Browsing the Calendar

The calendar loads showing all 43 posts across the 5 days. Each card shows:
- The post type badge (color-coded)
- The person/brand name
- Their IG handle if available
- A faded look + ✓ if already marked as posted

### Opening a Post

Tap any card to open the detail panel on the right. From here you can:

**Copy things:**
- **Event Link** — copies the Partiful RSVP link to clipboard
- **IG Handle** — copies `@handle` ready to paste into Instagram
- **Bio** — copies the full bio text
- **Caption Draft** — copies the full caption ready to paste into Instagram

**Edit things:**
- **IG Handle** — type a new handle, a Save button appears
- **Assets Folder** — paste a Google Drive link, a Save button appears; the "Open in Drive ↗" link updates immediately
- **Bio** — edit directly, Save when done
- **Caption Draft** — edit directly, Save when done

All saves persist immediately to the database — no page refresh needed.

**Move to a different day:**
- Use the day buttons at the bottom of the panel to move the post. The card jumps to the new column instantly.

**Mark as Posted:**
- Big green button at the bottom of the panel. Tap once to mark done, tap again to unmark. The card on the grid will fade out to show it's been handled.

**Delete a post:**
- Red "Delete post" button below the green button. Tapping it shows a "Confirm Delete / Cancel" prompt to prevent accidents.

### Dragging Posts

You can also drag any card directly to a different day column without opening the panel. The card moves instantly and the change is saved to the database in the background.

### Adding a New Post

Click the **+ New Post** button above the calendar grid. A form panel slides in with:
- **Post Type** — click one of the 6 colored badges to select
- **Name** — the artist, sponsor, or influencer name (required)
- **Day** — which day to place it on
- **IG Handle** — without the @
- **Event Link** — always pre-filled (shown as info, not editable here)
- **Assets Folder** — paste a Google Drive link
- **Bio** — write the bio
- **Caption Draft** — write or paste the full caption

Click **Create Post** and it appears in the correct day column immediately.

---

## Caption Format

All captions follow this consistent structure (established by the Our Exploration post):

```
@handle

[2–3 sentence bio in punchy, evocative style — starts with "A [descriptor] who..."]

Part of Dreaming of Greece, a curated exhibition of contemporary Greek voices shaping culture today.

Opening Night
Saturday April 18th
@dreamdowntown NYC

[RSVP link in bio]

Exhibition on view for two weeks following opening

#momentsgallerynyc #dreamingofgreece #[relevant tags per post type]
```

Sponsor posts use "Proud supporter of Dreaming of Greece..." instead of "Part of Dreaming of Greece..."

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

All posts live in a single Supabase table: `social_calendar_posts`

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `day_index` | Integer | 0 = Mon Apr 13 … 4 = Fri Apr 17 |
| `section` | Text | `feed` or `story` |
| `post_type` | Text | `af`, `as`, `sf`, `ss`, `is`, `ir` |
| `name` | Text | Display name |
| `subtitle` | Text | Optional subtitle |
| `ig_handle` | Text | Instagram handle (without @) |
| `bio` | Text | Bio text |
| `caption` | Text | Full caption draft |
| `drive_link` | Text | Google Drive folder/file link |
| `position` | Integer | Sort order within a day+section |
| `is_posted` | Boolean | Whether the post has been marked done |
| `posted_at` | Timestamp | When it was marked done |
| `created_at` | Timestamp | Row creation time |
| `updated_at` | Timestamp | Last modified time |

The `sponsorships` table (existing data from before this project) is untouched.

---

## File Structure

```
/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Server component — fetches all posts from Supabase
│   ├── globals.css
│   └── api/
│       └── posts/
│           ├── route.ts        # POST — create a new post
│           └── [id]/
│               └── route.ts   # PATCH — update fields | DELETE — remove post
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
│   ├── supabase.ts             # Supabase client (with cache: no-store to bypass Next.js cache)
│   └── types.ts                # SocialPost type, POST_TYPE_STYLES config, DAYS array
│
├── .env.local                  # NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
├── vercel.json                 # { "framework": "nextjs" } — required for Vercel detection
└── next.config.mjs             # Next.js config
```

---

## Data Flow

1. **Page load** — `app/page.tsx` (server component) fetches all posts from Supabase with `cache: 'no-store'` so it always gets fresh data
2. **Client state** — `CalendarGrid.tsx` holds the posts in React state; all UI interactions update state immediately (optimistic)
3. **Persistence** — every mutation (edit, move, mark posted, delete) fires a `PATCH` or `DELETE` to the API in the background
4. **API routes** — `app/api/posts/route.ts` (create) and `app/api/posts/[id]/route.ts` (update/delete) talk directly to Supabase server-side

Because all updates are optimistic, the UI always feels instant even if the network is slow.

---

## Deployment

The app is deployed on Vercel and auto-deploys whenever `main` is pushed to GitHub. No manual deploy step needed.

Environment variables required in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These are already set in the Vercel project. The Supabase anon key is safe to be public — security is handled by Row Level Security (RLS) policies on the database side.
