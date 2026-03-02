

# Nex Express — Online Bus Ticket Booking System

## Overview
A mobile-first bus ticket booking platform built with React + Vite + Tailwind + Supabase. Designed for extremely simple UX with a clean, minimal interface using primary color **#9a1919** and LINE Seed Sans font.

---

## Phase 1: Foundation & Booking Flow (Core MVP)

### 1.1 Design System & Layout
- Custom theme with #9a1919 primary, neutral grays, LINE Seed Sans font
- Mobile-first responsive layout with large tap targets
- Step indicator component (Steps 1–5) visible throughout booking
- Loading skeleton components for all pages
- One primary CTA per page principle

### 1.2 Booking Landing Page (Step 1)
- Full-screen booking form — the first thing users see
- Fields: Route selector, travel date picker, origin/destination province, boarding/drop-off point, passenger count
- "Search Trips" CTA button
- Mock data for routes, provinces, and boarding points

### 1.3 Trip Search Results (Step 2)
- List of available trips showing: departure/arrival time, price, available seats, trip type, bus type
- Tap a trip to proceed to seat selection
- Loading skeletons while "searching"

### 1.4 Seat Selection (Step 3)
- Interactive cinema-style seat map component
- Seat statuses: Available (tappable), Booked (grayed), Unavailable, Selected (highlighted in #9a1919)
- Visual bus layout with rows and aisle
- Summary of selected seats at bottom
- "Continue" CTA

### 1.5 Passenger Information (Step 4)
- Form per selected seat: Full Name, Thai ID (with format validation), Phone Number, Passenger Type (Child/Male/Female/Monk)
- Promotion code field with "Apply" button and dynamic discount summary
- "Proceed to Payment" CTA

### 1.6 Payment Page (Step 5)
- Booking summary with all details
- 15-minute countdown timer
- Payment method selection (QR Payment, Wallet — mock UI for now)
- Mock payment flow → redirect to pending page → simulate success
- Transition to e-ticket on "success"

### 1.7 E-Ticket Page
- Generated ticket with QR code (mock)
- Booking information summary
- "Download PDF" button (client-side PDF generation)
- "Send to Email" with popup if no email on file

---

## Phase 2: Membership, Tickets & Wallet

### 2.1 My Tickets Page
- Ticket history list with status badges (Upcoming, Completed, Cancelled)
- Tap to view ticket details and QR code

### 2.2 Points System
- Points balance display for members
- Points earn history
- Non-members see a CTA to register for membership
- Membership registration page

### 2.3 E-Wallet
- Terms & Conditions acceptance before activation
- Wallet balance display
- Transaction history (top-ups, refunds, purchases)
- Refund-to-wallet flow

---

## Phase 3: Promotions & Privileges

### 3.1 Promotions Listing Page
- Filter tabs: "All" / "Members Only"
- Promotion cards with image, title, expiry date

### 3.2 Promotion Detail Page
- Description, remaining quota, expiry date, validity period
- Barcode display
- Promo code with copy button
- "Use This Code" CTA linking back to booking

---

## Phase 4: Backend Integration (Supabase + Lovable Cloud)

### 4.1 Database Schema
- Tables: routes, trips, seats, bookings, passengers, payments, users/profiles, points, wallet_transactions, promotions
- Row-level security policies

### 4.2 Authentication
- Supabase Auth (email/phone initially, LINE LIFF integration later)
- User profiles with membership status

### 4.3 Edge Functions
- Payment webhook handler (for future Omise integration)
- Booking status polling endpoint
- Seat availability with concurrency control
- Ticket PDF generation

### 4.4 Real-time Features
- Seat availability updates during selection
- Payment status polling/webhooks

---

## Phase 5: Integrations (Future)

- **LINE LIFF SDK** integration when LIFF ID is ready
- **Omise Payment Gateway** with real QR payment and wallet
- Auto-send booking QR to LINE OA chat
- Email service for ticket delivery

---

## UX & Performance Principles Throughout
- One CTA per page, no clutter
- Optimistic UI updates
- Dynamic imports for heavy components (seat map, PDF generation)
- Friendly error messages in Thai/English
- Fast page transitions with loading states

