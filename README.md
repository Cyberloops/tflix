# TFLIX — Next-Generation Live OTT Cinema & TV Platform

**tflix** is a high-performance OTT Live TV streaming and cinema broadcast platform engineered by **cybertech by cyberloops**. Featuring an embedded SQLite database engine (`data/tflix.sqlite`), unique subscriber entry pass authentication, an administrator profit and code generation portal, and Category-Wise channel navigation.

---

## Key Features & Architecture

- **Subscriber Unique Code Entry Gate**:
  - Gated access: Only subscribers with a verified unique entry code (e.g. `TFLIX-VIP-ACCESS`, `TFLIX-PREMIUM-2026`) can access playback.
  - Device activation limits, validity durations, and instant validation via SQLite.
- **Admin Security & Profit Engine**:
  - Secure admin login (`/api/admin/login`).
  - Entry Code Generator: Create single or bulk passes with custom tiers (VIP Ultra 4K, Premium HD, 30-Day, 7-Day Trial, Lifetime).
  - Profit tracker: Real-time revenue analytics in USD ($) and INR (₹).
  - **1-Click Share to Asking Users**: Send codes directly to asking users via WhatsApp Web/App or copy formatted cards.
- **Category-Wise Channel Navigation**:
  - Pressing "Next" or "Previous" channel automatically cycles channels **within the current category** (e.g. Tamil Movies, News, Sports).
  - Quick Category Zapper drawer overlay on the video player for instant channel surfing without interrupting playback.
- **Top OTT Features (JioTV, Hotstar, Prime, Netflix)**:
  - Top 10 Trending Today carousel and badges.
  - Quality level selector (Auto, 1080p, 720p, 480p, Data Saver).
  - Picture-in-Picture (PiP), sleep timer (15m, 30m, 45m, 60m), and simulated Live EPG broadcast timeline.
  - Intelligent CORS and stream proxy (`/api/stream-proxy`) with adaptive m3u8 playlist rewriting.
- **SQLite Database Integration (`data/tflix.sqlite`)**:
  - Tables: `channels`, `entry_codes`, `admin_users`, `user_sessions`, `favorites`, `watch_history`, `app_metadata`.

---

## Copyright & Ownership

© 2026 **cybertech by cyberloops**. All rights reserved.
