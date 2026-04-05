# KARM BABA - Global Trade Intelligence & Deal Execution Platform

A comprehensive Next.js 15 application for global trade intelligence, deal management, CRM, and network verification.

## Features

- **Deal Management**: Create, track, and execute trade deals with real-time status updates
- **Lead Scoring**: AI-powered lead scoring system to identify hot prospects
- **Verified Network**: Connect with 200+ verified traders, suppliers, and buyers worldwide
- **Analytics Dashboard**: Real-time insights into deal pipeline and market trends
- **Document Verification**: AI-powered document upload and verification system
- **CRM Integration**: Complete customer relationship management tools
- **User Verification**: Multi-step verification process with document validation
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Fonts**: Manrope (headlines), Inter (body text)
- **Icons**: Material Symbols
- **Package Manager**: pnpm or npm

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager

### Installation

1. Clone the repository or extract the project files

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Create environment variables file:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
app/
├── layout.tsx              # Root layout with metadata
├── globals.css             # Global styles and design tokens
├── page.tsx                # Home page
├── dashboard/
│   └── page.tsx           # Main dashboard
├── deals/
│   ├── page.tsx           # Deals list
│   ├── [id]/page.tsx      # Deal details
│   └── new/page.tsx       # Create new deal
├── network/
│   └── page.tsx           # Verified network
├── leads/
│   └── page.tsx           # Lead management
├── analytics/
│   └── page.tsx           # Analytics dashboard
├── login/
│   └── page.tsx           # Login page
├── onboarding/
│   ├── page.tsx           # Role selection
│   ├── account/page.tsx   # Account creation
│   └── verification/page.tsx  # Verification
├── pricing/
│   └── page.tsx           # Pricing page
├── requirements/
│   └── page.tsx           # Requirements
├── verification/
│   └── page.tsx           # Verification page
└── settings/
    └── page.tsx           # User settings

components/
├── TopNavbar.tsx          # Top navigation bar
└── Sidebar.tsx            # Sidebar navigation

lib/
└── utils.ts               # Utility functions

tailwind.config.ts         # Tailwind configuration
tsconfig.json             # TypeScript configuration
next.config.js            # Next.js configuration
postcss.config.js         # PostCSS configuration
```

## Demo Credentials

Login with the following credentials to test the application:

- **Email**: demo@example.com
- **Password**: password

## Color Scheme

The application uses an orange-based color system:

- **Primary**: #FF6B35 (Orange)
- **Primary Dark**: #E55A24
- **Primary Light**: #FFB366
- **Background**: #FAF8FF
- **Surface**: #FFFFFF
- **On Surface**: #131B2E

## Key Pages

- **Home** (`/`): Landing page with feature overview
- **Login** (`/login`): User authentication
- **Onboarding** (`/onboarding`): Role selection → Account creation → Verification
- **Dashboard** (`/dashboard`): Main dashboard with active deals and leads
- **Deals** (`/deals`): Deal management and tracking
- **Network** (`/network`): Verified trader network
- **Analytics** (`/analytics`): Revenue and performance analytics
- **Settings** (`/settings`): User profile and preferences

## Development

### Building for Production

```bash
npm run build
# or
pnpm build
```

### Starting Production Server

```bash
npm start
# or
pnpm start
```

### Linting

```bash
npm run lint
# or
pnpm lint
```

## Mock Data

The application includes comprehensive mock data for:

- 50+ active and completed deals
- 200+ verified network members
- 100+ leads with scoring
- Monthly revenue analytics
- User profiles and settings

All data is stored locally in component state and can be easily connected to a backend API.

## Customization

### Colors

Edit `/app/globals.css` to customize the color scheme using CSS variables:

```css
:root {
  --primary: #ff6b35;
  --primary-dark: #e55a24;
  /* ... more colors */
}
```

### Fonts

Fonts are configured in `/app/layout.tsx` using Google Fonts API.

### Tailwind

Customize Tailwind in `/tailwind.config.ts`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Backend API integration
- Real database (PostgreSQL/MongoDB)
- Payment gateway integration
- Real-time notifications
- Video conferencing for deal negotiations
- Advanced AI analytics
- Mobile app (React Native)

## License

All rights reserved. KARM BABA © 2024

## Support

For issues or questions, please contact support@karmbaba.com
