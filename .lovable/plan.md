

## Issues Found

1. **`use-navigation.tsx`** imports `usePathname` from `next/navigation` — this doesn't exist in React Router. Must rewrite using `useLocation` from `react-router-dom`.

2. **`BottomNav.tsx`** and **`Home.tsx`** import `@iconify/react` which is not installed. Also `Home.tsx` imports `Link` from `lucide-react` instead of `react-router-dom`.

3. **Wrong menu items** in BottomNav — currently has Home/Explore/Notifications/Messages. Need: หน้าแรก / ค้นหาเที่ยวรถ / โปรโมชั่นและสิทธิพิเศษ / โปรไฟล์.

4. **Duplicate `/ticket` route** in App.tsx (both `Ticket` and `ETicket` mapped to `/ticket`). Need to fix — e.g. ETicket at `/e-ticket`.

5. **Home.tsx** uses `<body>` tag inside component (invalid HTML nesting). Replace with `<main>` or `<div>`.

---

## Plan

### 1. Fix `use-navigation.tsx`
- Remove `next/navigation` import, use `useLocation` from `react-router-dom`
- Update active states to match new routes: `/`, `/ticket`, `/promotions`, `/profile`

### 2. Rewrite `BottomNav.tsx`
- Remove `@iconify/react` dependency, use Lucide icons instead
- 4 tabs with labels:
  - **หน้าแรก** → `/` (Home icon)
  - **ค้นหาเที่ยวรถ** → `/ticket` (Search icon)
  - **โปรโมชั่น** → `/promotions` (Tag icon)
  - **โปรไฟล์** → `/profile` (User icon)
- Active state uses primary color (#9a1919), with filled/outline icon variants
- Add bottom padding to main content so BottomNav doesn't overlap

### 3. Fix `Home.tsx`
- Remove `@iconify/react` import, use Lucide icons
- Fix `Link` import to use `react-router-dom`
- Replace `<body>` with `<main>`
- Keep search input, popular destinations grid, and promotions section

### 4. Fix App.tsx routing
- Fix duplicate `/ticket` route — move ETicket to `/e-ticket`
- Add `/profile` route (placeholder Profile page)
- Ensure BottomNav only shows on main pages (not during booking flow steps 2-5)

### 5. Create Profile placeholder page
- Simple page with user icon and "โปรไฟล์" title
- Links to My Tickets, membership (future)

### 6. Test booking flow end-to-end
- After fixes, use browser tools to walk through the complete flow: Home → Ticket search → Search results → Seat selection → Passenger info → Payment → E-Ticket

