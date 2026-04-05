# 🚀 KARM BABA - Quick Start Guide

## Project Overview

KARM BABA is a comprehensive Global Trade Intelligence & Deal Execution platform built with:
- **Framework:** Next.js 15 (App Router)
- **UI:** React 19 with TypeScript
- **Styling:** Tailwind CSS 3.4
- **Design:** Material Design with custom color system
- **Typography:** Manrope (Headlines) + Inter (Body)

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Run Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

The application will start at **http://localhost:3000**

## Project Structure

```
/app
  /layout.tsx                 # Root layout with fonts & styles
  /globals.css               # Global styles & CSS variables
  /page.tsx                  # Home/Landing page
  
  /dashboard
    /page.tsx               # Main dashboard
  
  /deals
    /page.tsx               # Deals list
    /[id]
      /page.tsx             # Deal details
    /new
      /page.tsx             # Create new deal
    /workflows
      /page.tsx             # Deal workflows
  
  /leads
    /page.tsx               # Leads list
    /scoring
      /page.tsx             # Lead scoring
  
  /network
    /page.tsx               # Network overview
    /verified
      /page.tsx             # Verified network
  
  /documents
    /upload
      /page.tsx             # Document upload
  
  /certification
    /center
      /page.tsx             # Certification center
  
  /profile
    /premium
      /page.tsx             # Premium profile
  
  /trade
    /execute
      /page.tsx             # Trade execution
  
  /assistant
    /page.tsx               # AI Assistant
  
  /onboarding
    /page.tsx               # Role selection
    /roles
      /page.tsx             # Role selection (dedicated)
    /account
      /page.tsx             # Account creation
    /verification
      /page.tsx             # Email/OTP verification
  
  /login
    /page.tsx               # Login page
  
  /pricing
    /page.tsx               # Pricing page
  
  /analytics
    /page.tsx               # Analytics dashboard
  
  /requirements
    /page.tsx               # Requirements management
  
  /settings
    /page.tsx               # Account settings
  
  /verification
    /page.tsx               # Verification status

/components
  /DashboardLayout.tsx       # Layout wrapper for dashboard pages
  /TopHeader.tsx             # Top navigation with search
  /Sidebar.tsx               # Left navigation sidebar
  /TopNavbar.tsx             # Landing page navbar

/lib
  /utils.ts                  # Utility functions

/public
  /                          # Static assets
```

## Key Features Implemented

### ✅ Navigation
- Sticky sidebar with active state indicators
- Top navigation header with search and notifications
- Proper routing between all pages
- Material Design Icons throughout

### ✅ Layouts
- DashboardLayout component (fixes sidebar overlay)
- Responsive grid systems
- Mobile-first design
- Fixed header/sidebar positioning

### ✅ Pages & Functionality
- **Dashboard:** Overview with stats and active deals
- **Deals:** Create, view, and manage deals with workflows
- **Leads:** Lead scoring with AI-powered scoring system
- **Network:** Connect with verified traders and suppliers
- **Documents:** Upload and verify business documents
- **Certification:** Manage business certifications
- **Profile:** Premium profile with certifications and badges
- **Trade Execution:** Monitor international trade transactions
- **AI Assistant:** Chat-based intelligent business assistant
- **Onboarding:** Multi-step user registration flow
- **Settings:** User account and preference management

### ✅ Design System
- Primary Color: #003ba1 (Blue)
- Secondary Colors: #4648d4, #5f248e, #ba1a1a
- Neutral Colors: Multiple shades for surfaces and text
- Typography Scale with Manrope and Inter
- Border Radius: 0.25rem, 0.5rem, 0.75rem, full
- Spacing Scale: Tailwind standard (4px base unit)

## Navigation Map

```
Landing Page (/)
├── /onboarding/roles         (Role Selection)
│   └── /onboarding/account   (Account Creation)
│       └── /onboarding/verification (Email Verification)
│           └── /dashboard    (Main App)
├── /login                     (Existing Users)
└── /pricing                   (Pricing Info)

Dashboard (/dashboard)
├── /deals                     (Deals List)
│   ├── /deals/[id]           (Deal Details)
│   ├── /deals/new            (Create Deal)
│   └── /deals/workflows      (Deal Workflows)
├── /leads                     (Leads List)
│   └── /leads/scoring        (Lead Scoring)
├── /network                   (Network Overview)
│   └── /network/verified     (Verified Network)
├── /documents/upload         (Upload Documents)
├── /certification/center     (Certifications)
├── /profile/premium          (Profile Settings)
├── /trade/execute            (Trade Execution)
├── /assistant                (AI Assistant)
├── /analytics                (Analytics)
├── /requirements             (Requirements)
├── /settings                 (Account Settings)
└── /verification             (Verification Status)
```

## Color System Usage

```css
/* Primary Colors */
--primary: #003ba1
--primary-container: #0050d3
--on-primary: #ffffff
--on-primary-container: #c5d2ff
--on-primary-fixed: #00174b
--on-primary-fixed-variant: #003ea8

/* Surface Colors */
--surface: #faf8ff
--surface-dim: #d2d9f4
--surface-bright: #faf8ff
--surface-container: #eaedff
--surface-container-low: #f2f3ff
--surface-container-high: #e2e7ff
--surface-container-highest: #dae2fd

/* Text Colors */
--on-surface: #131b2e
--on-surface-variant: #434654
--outline: #737685
--outline-variant: #c3c6d6
```

## Component Usage Examples

### DashboardLayout
```tsx
import DashboardLayout from '@/components/DashboardLayout';

export default function MyPage() {
  return (
    <DashboardLayout>
      {/* Your content here */}
    </DashboardLayout>
  );
}
```

### TopHeader
```tsx
import TopHeader from '@/components/TopHeader';

export default function MyPage() {
  return (
    <>
      <TopHeader 
        searchPlaceholder="Search..."
        title="My Page"
      />
      {/* Your content */}
    </>
  );
}
```

### Sidebar
The Sidebar is automatically included in DashboardLayout.

## Styling with Tailwind

All pages use Tailwind CSS with custom color tokens:

```tsx
// Primary color
<button className="bg-primary text-white">Primary Button</button>

// Surface colors
<div className="bg-surface-container p-6">Container</div>

// Text colors
<p className="text-on-surface">Text</p>
<p className="text-on-surface-variant">Secondary Text</p>

// Responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive Grid
</div>
```

## Material Symbols Icons

Icons are from Google's Material Symbols:

```tsx
<span className="material-symbols-outlined">dashboard</span>
<span className="material-symbols-outlined" style={{fontSize: '32px'}}>
  star
</span>
```

Common icons used:
- `dashboard` - Dashboard
- `person_add` - Onboarding
- `person_search` - Leads
- `handshake` - Deals
- `group` - Network
- `trending_up` - Analytics
- `description` - Documents
- `verified` - Verification
- `settings` - Settings
- `smart_toy` - AI

## Development Tips

### Adding a New Page

1. Create page file: `/app/path/page.tsx`
2. Add imports:
```tsx
import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';
```
3. Wrap content in DashboardLayout
4. Add to navigation in Sidebar component

### Modifying Colors

Edit color values in `/app/globals.css` (CSS variables) and they'll apply globally.

### Adding Components

Create components in `/components` folder and import them in your pages.

### Using TypeScript

All files use TypeScript (.tsx for JSX, .ts for utilities). Add proper types for better development experience.

## Performance Optimization

- Next.js 15 automatic optimizations enabled
- Image optimization for external images
- Font optimization with next/font
- CSS-in-JS with Tailwind (purged in production)
- Server-side rendering by default

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Sidebar Overlaying Content
The DashboardLayout component properly handles sidebar spacing. Make sure you're using it as the wrapper.

### Styles Not Applied
- Clear Next.js cache: `rm -rf .next`
- Restart dev server: `npm run dev`
- Check Tailwind config in `tailwind.config.ts`

### Icons Not Showing
Ensure Material Symbols font is loaded in `app/layout.tsx`:
```tsx
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

## Next Steps

1. **Database:** Connect to Supabase, Neon, or your preferred database
2. **Authentication:** Implement Auth.js or NextAuth.js
3. **API Routes:** Create API endpoints in `/app/api`
4. **Real Data:** Replace mock data with actual API calls
5. **Deployment:** Deploy to Vercel with `vercel deploy`

## Support & Resources

- **Next.js Docs:** https://nextjs.org/docs
- **React Docs:** https://react.dev
- **Tailwind Docs:** https://tailwindcss.com
- **Material Design:** https://material.io/design

---

**Happy Building! 🎉**

For more information, see:
- README.md - Project overview
- IMPLEMENTATION_STATUS.md - Detailed page status
- PROJECT_SUMMARY.md - Architecture overview
