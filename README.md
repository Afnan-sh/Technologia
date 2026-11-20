# Technologia
### Minimalist Tech Marketplace & Sourcing Hub (Pakistan)

A clean, responsive, uncluttered web application running completely on `localhost` for buying, selling, and sourcing tech hardware in Pakistan.

---

## 🎨 Design System & Theme
- **Aesthetic:** Extremely clean, minimalist, and uncluttered. Lots of whitespace to let product data breathe.
- **Primary Background:** Clean White (`#FFFFFF` / `bg-white`) and subtle background separation (`bg-gray-50`).
- **Secondary (Actions/Highlights):** Modern Blue (`blue-600` / `blue-700`) for primary buttons, active links, and pill badges.
- **Tertiary/Accent (Sparing use):** Subtle Brown (`amber-800` / `amber-900`) for top accent line (`h-[3px] bg-amber-800`), distinctive request card borders, and "Offer Part" actions.
- **Typography:** `Inter` (via Next.js `next/font`) with lightweight SVG icons from `lucide-react`.
- **Text:** Slate / dark gray (`text-slate-900`, `text-slate-700`, `text-slate-500`) for maximum contrast and legibility without harsh pure blacks.

---

## 🧭 Page Architecture & Navigation

### 1. The Welcome / Mock Sign-Up Page (`/`)
- Clean, full-screen landing view with pure white background.
- Prominent "Technologia" branding.
- Mock Email and Password input fields.
- Primary Blue **"Enter Marketplace"** button and **"Continue as Guest"** link routing directly to `/home`.
- The global marketplace header is hidden on this page to create a focused entry point.

### 2. Global Header & Slide-Out Navigation Drawer
- Fixed, sticky top header on every internal marketplace page.
- Thin subtle brown accent bar (`h-[3px] bg-amber-800`) across the top.
- Centered **"Technologia"** branding in clean, modern, bold sans-serif.
- Hamburger menu icon (☰) opening a slide-out drawer with a soft overlay (`bg-slate-900/25 backdrop-blur-sm`).
- **4 Main Modes in Drawer (each expandable to Mobile Phones & Laptops):**
  1. **Buy**
     - Mobile Phones (`/buy/phones`)
     - Laptops (`/buy/laptops`)
  2. **Sell**
     - Mobile Phones (`/post-ad?category=PHONE`)
     - Laptops (`/post-ad?category=LAPTOP`)
  3. **Request** (Post a sourcing request)
     - Mobile Phones (`/requests/new?category=PHONE`)
     - Laptops (`/requests/new?category=LAPTOP`)
  4. **View Requests** (Browse sourcing requests)
     - Mobile Phones (`/requests/phones`)
     - Laptops (`/requests/laptops`)

### 3. Main Landing Page (`/home`)
- Features 3 horizontal rows of data:
  - **Row 1: Fresh Arrivals (Phones):** 3 to 4 phone cards with verified PTA badges, condition, and blue price tags.
  - **Row 2: Top Laptops:** 3 to 4 laptop cards with RAM/Storage pill tags, condition, and blue price tags.
  - **Row 3: Urgent Part Requests:** 3 to 4 request cards with subtle brown accent borders, target budget in PKR, and an **"Offer Part"** button.

---

## ⚡ Performance-Friendly Premium UI Polish
- **Hover Lift:** Product cards lift subtly on hover (`hover:-translate-y-1 hover:shadow-md`).
- **Tactile Buttons:** Active/press states (`active:scale-97`) for crisp feedback.
- **Pill Tags for Specs:** High information density without visual clutter (`rounded-full bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5`).
- **Skeleton Loaders:** Smooth pulse loaders instead of blank screens while fetching database records.
- **Empty States:** Clean centered icons and helpful call-to-actions when no records match filters.

---

## 🚀 Localhost Execution
The server is running on:
👉 **[http://localhost:3000](http://localhost:3000)**

```bash
# Start server
npm start -p 3000

# Run automated tests
node scratch/test-flow.js
```
