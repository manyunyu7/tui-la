# Features Specification

## Overview

**Twy** is a real-time collaborative mapping application for couples to create, share, and preserve their memories together.

> App name is configurable via `APP_NAME` env variable.

---

## Core Features

### 1. Authentication & Pairing

#### User Registration
- Email and password registration
- Display name (shown to partner)
- Avatar upload (optional)
- Automatic couple creation with unique invite code

#### Login
- Email/password authentication
- JWT-based session management
- Persistent login (refresh tokens)
- Remember me option

#### Couple Pairing
- 8-character invite code generated on registration
- Partner enters code to join
- Real-time notification when partner joins
- Ability to unpair (with confirmation)

---

### 2. Interactive Map

#### Map Display
- **Library**: mapcn (MapLibre-based, Tailwind-native)
- OpenStreetMap/OpenFreeMap tiles (no API key required)
- Smooth vector rendering
- Multiple map styles (standard, romantic, minimal)
- Zoom controls
- Geolocation (center on current location)

#### Map Navigation
- Pan and zoom
- Search places (Nominatim geocoding)
- Fly to location animation
- Save viewport preferences per map

---

### 3. Memory Pins

#### Pin Creation
- Click/tap on map to add pin
- Quick "I'm here!" for current location
- Create from place search

#### Pin Details
- **Title**: Short name for the memory
- **Description**: Longer text description
- **Date**: When the memory happened
- **Category/Type**:
  - Memory (default)
  - Wishlist (places to visit)
  - Milestone (special events)
  - Trip (travel markers)
- **Icon**: Emoji picker or predefined romantic set
- **Color**: Custom color picker
- **Privacy**: Private (only creator sees) or shared

#### Pin Media
- Multiple photos per pin (up to 10)
- Drag to reorder photos
- Photo gallery/lightbox view
- Thumbnail generation
- Future: Voice notes, videos

#### Pin Interactions
- Edit pin (creator or partner for shared)
- Delete pin
- Drag to reposition
- View pin history (who added/edited)

---

### 4. Collaborative Drawing

#### Drawing Tools
- Freehand pen
- Stroke color picker (romantic palette)
- Stroke width slider
- Eraser tool
- Clear all drawings

#### Drawing Behavior
- Drawings overlay on map
- Scale with zoom level
- Persist per map
- Show creator info

#### Real-time Sync
- See partner's strokes live
- Different colors per partner (optional)
- Stroke-by-stroke transmission

---

### 5. Real-time Chat

#### Messaging
- Text messages
- Photo sharing
- Pin sharing ("Check out this memory!")
- Emoji support

#### Presence
- Online/offline status
- Typing indicator
- Last seen timestamp

#### Message Features
- Read receipts
- Message reactions (❤️)
- Timestamps
- Pagination (load older messages)

---

### 6. Reactions & Comments

#### Reactions on Pins
- Quick emoji reactions
- Predefined set: ❤️ 😍 🥺 💋 😭 🔥
- One reaction per user per pin
- Show reaction counts

#### Comments on Pins
- Text comments
- Comment thread per pin
- Edit/delete own comments
- Timestamps

---

### 7. Map Management

#### Map Types

| Type | Description | Permissions |
|------|-------------|-------------|
| **Shared** | Both partners can edit | Full edit for both |
| **Solo Trip** | One person's journey | Owner edits, partner views |
| **Memory Collection** | Themed collection | Full edit for both |

#### Map Operations
- Create new map
- Edit map name/description
- Set map cover image
- Archive map (soft delete)
- Delete map (permanent)

#### Map List
- Grid view with cover images
- Pin count per map
- Last activity date
- Quick actions

---

### 8. Theme Customization

#### Predefined Themes

| Theme | Primary | Secondary | Background |
|-------|---------|-----------|------------|
| Rose Garden | #E11D48 | #FB7185 | #FFF1F2 |
| Sunset Love | #F97316 | #FDBA74 | #FFF7ED |
| Midnight Romance | #7C3AED | #A78BFA | #F5F3FF |
| Cherry Blossom | #EC4899 | #F9A8D4 | #FDF2F8 |
| Lavender Dreams | #8B5CF6 | #C4B5FD | #FAF5FF |
| Ocean Breeze | #0EA5E9 | #7DD3FC | #F0F9FF |

#### Custom Theme
- Color picker for primary color
- Auto-generate complementary colors
- Preview before applying
- Save to couple preferences

---

### 9. Partner Presence

#### On Map
- Show partner's cursor position
- Partner's avatar follows cursor
- Smooth animation

#### Global
- Online/offline indicator
- "Partner is viewing this map"
- Activity feed (optional)

---

### 10. Search & Discovery

#### Place Search
- Search by name/address
- Powered by Nominatim (free)
- Autocomplete suggestions
- Category icons

#### Pin Search
- Search pins by title
- Filter by date range
- Filter by category
- Filter by creator

---

## Future Features (Roadmap)

### V2
- [ ] Voice notes on pins
- [ ] Video attachments
- [ ] Anniversary reminders
- [ ] Relationship milestones
- [ ] Export map as image/PDF
- [ ] Share map preview (public link)

### V3
- [ ] Timeline view (chronological)
- [ ] Statistics dashboard
- [ ] Memory slideshow
- [ ] Offline mode (PWA)
- [ ] Push notifications
- [ ] Mobile apps (React Native)

### V4
- [ ] AI memory suggestions
- [ ] Auto-tagging photos
- [ ] Music integration (attach songs)
- [ ] Weather data at pin time
- [ ] Distance traveled stats

---

## UI/UX Guidelines

### Duolingo-Inspired Style

#### Buttons
```css
/* Primary Button */
.btn-primary {
  @apply bg-rose-500 text-white font-bold;
  @apply py-3 px-6 rounded-2xl;
  @apply border-b-4 border-rose-700;
  @apply active:border-b-0 active:translate-y-1;
  @apply hover:bg-rose-400;
  @apply transition-all duration-150;
}

/* Secondary Button */
.btn-secondary {
  @apply bg-rose-100 text-rose-700 font-bold;
  @apply py-3 px-6 rounded-2xl;
  @apply border-b-4 border-rose-200;
  @apply active:border-b-0 active:translate-y-1;
  @apply hover:bg-rose-50;
  @apply transition-all duration-150;
}
```

#### Cards
```css
.card {
  @apply bg-white rounded-3xl;
  @apply shadow-lg shadow-rose-100;
  @apply border border-rose-100;
  @apply p-6;
}
```

#### Inputs
```css
.input {
  @apply w-full px-4 py-3;
  @apply rounded-2xl border-2;
  @apply border-gray-200;
  @apply focus:border-rose-500 focus:ring-0;
  @apply transition-colors;
}
```

### Micro-interactions
- Button press effect (translate-y on active)
- Smooth transitions (150-300ms)
- Subtle hover states
- Loading skeletons
- Success/error animations

### Empty States
- Friendly illustrations
- Clear call-to-action
- Helpful suggestions

### Loading States
- Heart pulse animation for global loading
- Skeleton screens for content
- Optimistic UI where possible

---

## Accessibility

- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus indicators
- Alt text for images
- ARIA labels

---

## Security Considerations

- All API calls require authentication
- Couple data isolation (never leak across couples)
- File upload validation (type, size)
- XSS prevention (sanitize user input)
- CSRF protection
- Rate limiting
- Secure password storage (bcrypt)
- HTTPS only in production
