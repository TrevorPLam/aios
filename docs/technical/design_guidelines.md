# AIOS Design Guidelines

## Brand Identity

**Aesthetic Direction**: Tech-forward, futuristic HUD/control panel
- Dark-first UI with electric blue accent color
- Premium, innovative feel—NOT generic template
- Expressive motion: tasteful animations, swipe physics, subtle glow highlights
- Confidence and urgency shown visually through card design

**Memorable Element**: Interactive recommendation cards with HUD-style confidence meters and swipeable physics that feel responsive and satisfying.

---

## Color Palette

**Primary Colors**:
- Electric Blue: `#00D9FF` (accent, highlights, interactive elements)
- Deep Space: `#0A0E1A` (primary background)
- Slate Panel: `#1A1F2E` (surface/card background)

**Text Colors**:
- Primary Text: `#FFFFFF`
- Secondary Text: `#8B93A7`
- Tertiary/Muted: `#4A5568`

**Semantic Colors**:
- Success: `#00FF94` (accepted cards, positive actions)
- Warning: `#FFB800` (medium confidence, expiring soon)
- Error: `#FF3B5C` (declined, critical)
- Low Confidence: `#6366F1` (purple-blue tint)

**Visual Feedback**: All touchable elements must have pressed states using electric blue glow or 85% opacity.

---

## Typography

**Font Family**: Use **Inter** or **Space Grotesk** (modern humanist sans-serif)

**Type Scale**:
- Hero/Large Title: 32px, Bold (700)
- H1 (Screen Title): 24px, Semibold (600)
- H2 (Section Header): 20px, Semibold (600)
- H3 (Card Title): 18px, Semibold (600)
- H4 (Subsection): 16px, Semibold (600)
- H5 (Small Header): 14px, Semibold (600)
- H6 (Micro Header): 12px, Semibold (600)
- Body: 16px, Regular (400)
- Caption/Metadata: 14px, Regular (400)
- Small Label: 12px, Medium (500)

**Usage Guidelines**:
- Use hero for splash screens and major landing pages
- Use h1 for main screen titles
- Use h2 for major sections within a screen
- Use h3 for card titles and important subsections
- Use h4 for subsections and emphasized content within body text
- Use h5 for small headers in compact layouts
- Use h6 for micro headers in dense information displays
- Use body for all standard text content
- Use caption for metadata and supplementary information
- Use small for labels and compact UI elements

**Note on Size Overlaps**: 
The heading variants h4-h6 intentionally share sizes with body text (h4=body=16px, h5=caption=14px, h6=small=12px) but use semibold weight (600) instead of regular/medium weight. This design decision:
- Provides clear visual distinction through weight rather than size
- Maintains consistent vertical rhythm across the UI
- Reduces the number of font sizes, improving design system simplicity
- Allows semantic markup without disrupting text flow

---

## Navigation Architecture

**Root Navigation**: Custom hybrid navigation
- **Home Screen**: Command Center (default landing)
- **Module Grid**: Accessible via top-left Home icon (6-module grid layout)
- **Bottom Navigation**: Left module quick button + Center AI Brain button + Right module quick button + Top-right Settings icon
- **AI Assist**: Module-scoped bottom sheet (NOT a chatbox) showing card templates

**Module List**:
1. Command Center (Home)
2. Notebook
3. Planner
4. Calendar
5. Email
6. Settings

---

## Screen-by-Screen Specifications

### 1. Command Center (Home)
**Purpose**: Display swipeable AI recommendation cards

**Layout**:
- Header: Transparent, custom header with "AIOS Command Center" title, module grid icon (top-left), settings icon (top-right)
- Main Content: Swipeable card deck (up to 24 active cards)
  - Each card shows: title, summary, confidence meter (HUD-style segmented dots/bar), expiry timestamp, priority indicator
  - Swipe right = accept (green glow), swipe left = decline (red glow)
  - Tap card = expand to full-screen detail view showing "Why" field
- Floating Elements: 
  - AI Limits indicator badge (bottom-left): "AI Cards: X/Y"
  - Next refresh countdown (bottom-right): "Refreshes in 5h 23m"
- Safe Area Insets: Top = headerHeight + 24px, Bottom = tabBarHeight + 24px

**Components**: Custom swipeable card deck, HUD confidence meter, timestamp badges, expandable detail modal

**Empty State**: "No active recommendations. Check back in [countdown]" with subtle grid pattern illustration

---

### 2. Notebook
**Purpose**: Create and edit markdown notes with AI assistance

**Layout**:
- Header: Default header with "+ New Note" button (right)
- Main Content: Scrollable list of note cards showing title, preview, tags, last edited timestamp
- Floating Element: AI brain button (bottom-right) opens module-specific bottom sheet

**Note Editor Screen**:
- Header: Back button (left), "Save" button (right)
- Main Content: Scrollable form with title input + markdown body editor with formatting toolbar (#, **, [], etc.)
- Autosave every 2 seconds
- AI Assist Bottom Sheet: Grammar, Clarity, Title, Tags, Summary, Checklist (each produces bounded output, user must explicitly accept)

**Empty State**: "Your notes will appear here" with notebook illustration

---

### 3. Planner
**Purpose**: Manage tasks and projects with AI assistance

**Layout**:
- Header: Default with "+ New Task" button (right)
- Main Content: Scrollable task list grouped by project, showing title, priority indicator, due date, status
- Floating Element: AI brain button (bottom-right)

**Task Detail Screen**:
- Header: Back (left), Edit (right)
- Main Content: Scrollable form
  - User Notes section (editable markdown)
  - AI Notes section (read-only, gray background, clearly labeled "AI Generated Notes")
  - Priority, due date, recurrence, project assignment, dependencies
- AI Assist: Suggests priority/due date/breakdown/dependencies as card templates

**Empty State**: "No tasks yet. Create one to get started" with checklist illustration

---

### 4. Calendar
**Purpose**: Native CRUD calendar with day/week views

**Layout**:
- Header: Default with month/year title, view toggle (day/week), "+ New Event" (right)
- Main Content: List-based day view OR week grid (simple scaffold)
- Create/Edit Event: Modal form with title, time range, location, recurrence dropdown

**Empty State**: "No events scheduled" with calendar icon

---

### 5. Email (UI Only)
**Purpose**: Mock email interface (no integrations)

**Layout**:
- Header: Default with "Email" title, search icon (right)
- Main Content: Thread list with sender, subject, preview, timestamp
- Thread Detail: Scrollable message list + draft reply box
- Draft reply has disabled "Send" button with tooltip: "Integrations not enabled in this build"

**Empty State**: "Inbox Empty" with envelope illustration

---

### 6. Settings
**Purpose**: Configure app preferences and view history

**Layout**:
- Header: Default with "Settings" title
- Main Content: Scrollable grouped list
  - AI Settings: AI Name input, Tier selection
  - Modules: Toggle switches for each module
  - History: Navigate to history log screen
- History Screen: Scrollable list of formatted log entries showing accepted/declined/archived cards with timestamps

---

## Visual Design Principles

- **NO Emojis**: Use Feather icons from @expo/vector-icons
- **Card Shadows**: Floating cards use subtle drop shadow (offset: 0, 2; opacity: 0.15; radius: 8; color: electric blue tint)
- **Glow Effects**: Active/interactive states use electric blue outer glow
- **Motion**: 300-400ms spring animations for swipe physics; 150ms ease-out for button presses

---

## Assets to Generate

**Required**:
1. **icon.png** - App icon with futuristic HUD/brain motif in electric blue on dark background - USED: Device home screen
2. **splash-icon.png** - Same as app icon - USED: Launch screen
3. **empty-command-center.png** - Subtle grid pattern with HUD interface outline - USED: Command Center empty state
4. **empty-notebook.png** - Minimalist notebook/document icon - USED: Notebook empty state
5. **empty-planner.png** - Checklist icon with tech aesthetic - USED: Planner empty state
6. **empty-calendar.png** - Calendar grid icon - USED: Calendar empty state
7. **empty-email.png** - Envelope icon - USED: Email empty state

**Style**: All illustrations use electric blue on dark background with clean geometric shapes and subtle HUD elements. Avoid complexity—keep them supporting, not distracting.