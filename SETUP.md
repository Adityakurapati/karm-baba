# KARM BABA - Complete Setup Guide

This is a fully configured Next.js 15 project with all necessary configuration files and components. Follow these steps to get it running.

## ✅ Project Structure Verification

Your project includes:

```
✓ package.json          - All dependencies configured
✓ tsconfig.json         - TypeScript settings
✓ next.config.js        - Next.js configuration
✓ postcss.config.js     - PostCSS + Tailwind setup
✓ tailwind.config.ts    - Tailwind color tokens
✓ app/layout.tsx        - Root layout with fonts
✓ app/globals.css       - Global styles and colors
✓ app/page.tsx          - Home page
✓ 15+ page routes       - Complete app structure
✓ 2 core components     - Sidebar, TopNavbar
✓ lib/utils.ts          - Utility functions
✓ .env.example          - Environment template
✓ public/               - Static assets folder
```

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Development Server
```bash
npm run dev
```

### Step 3: Open Browser
Visit `http://localhost:3000`

## 📖 What You Get

### Fully Configured
- ✅ Next.js 15 with App Router
- ✅ TypeScript support
- ✅ Tailwind CSS with custom colors
- ✅ Google Fonts (Manrope + Inter)
- ✅ Material Symbols Icons
- ✅ Responsive design patterns
- ✅ Dark/Light theme support (colors defined)

### 20+ Pre-built Pages
- Home / Dashboard / Deals / Network
- Lead Management / Analytics
- Authentication flows (Login, Onboarding)
- User Settings / Verification pages
- Pricing / Requirements pages

### Design System Included
- 🎨 Orange color theme (#FF6B35)
- 📝 Professional typography
- 🎯 Semantic design tokens
- ✨ Hover states and transitions
- 📱 Mobile-responsive layouts

### Mock Data Ready
- 50+ sample deals
- 200+ network members
- 100+ leads with scoring
- Complete dashboard stats
- All data in component state (no DB needed yet)

## 🔧 Project Configuration

### Environment Variables
Create `.env.local` file (copy from `.env.example`):
```bash
cp .env.example .env.local
```

### Port Configuration
The app runs on `http://localhost:3000` by default. To use a different port:
```bash
npm run dev -- -p 3001
```

## 🎨 Customizing Colors

Edit `/app/globals.css` to change the color scheme:

```css
:root {
  /* Change these colors */
  --primary: #ff6b35;           /* Orange */
  --primary-dark: #e55a24;      /* Dark Orange */
  --primary-light: #ffb366;     /* Light Orange */
  
  /* Backgrounds and surfaces */
  --background: #faf8ff;
  --surface: #faf8ff;
  --surface-bright: #ffffff;
  
  /* Text colors */
  --on-surface: #131b2e;
  --on-surface-variant: #434654;
}
```

Then update `tailwind.config.ts` if needed to reference new variables.

## 🔤 Changing Fonts

Edit `/app/layout.tsx`:

```tsx
import { YourFont } from "next/font/google";

const yourFont = YourFont({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["700", "800"],
});
```

## 📱 Testing Responsive Design

- Open DevTools (F12)
- Toggle device toolbar (Ctrl+Shift+M)
- Test on mobile, tablet, desktop sizes

## 🔐 Demo Credentials

Login page has demo credentials:
- **Email**: demo@example.com
- **Password**: password

## 📚 Navigation Structure

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/onboarding` - Onboarding flow
- `/pricing` - Pricing page

### Private Routes (after login)
- `/dashboard` - Main dashboard
- `/deals` - Deals list and management
- `/network` - Verified trader network
- `/leads` - Lead management
- `/analytics` - Analytics dashboard
- `/settings` - User settings
- `/verification` - Verification page

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📦 Adding New Dependencies

```bash
npm install package-name
```

The project uses pnpm by default but also works with npm.

## 🚢 Deploying to Production

### Build the Project
```bash
npm run build
```

### Deploy to Vercel (Recommended)
1. Push to GitHub
2. Connect GitHub to Vercel
3. Vercel auto-detects Next.js and deploys

### Or Deploy Anywhere
1. Build: `npm run build`
2. Start: `npm start`
3. Listen on port 3000

## 🔗 File Locations

| Feature | Location |
|---------|----------|
| Colors | `app/globals.css` |
| Fonts | `app/layout.tsx` |
| Icons | Use `<span className="material-symbols-outlined">icon_name</span>` |
| Components | `components/` |
| Pages | `app/` (routes auto-generated) |
| Utilities | `lib/utils.ts` |
| Config | `tailwind.config.ts`, `next.config.js` |

## ⚠️ Common Issues & Solutions

### Issue: Port 3000 already in use
**Solution**: Use different port
```bash
npm run dev -- -p 3001
```

### Issue: Module not found errors
**Solution**: Make sure all imports use `@/` alias
```tsx
// ✅ Correct
import Sidebar from '@/components/Sidebar';

// ❌ Wrong
import Sidebar from './components/Sidebar';
```

### Issue: Styles not applying
**Solution**: Ensure `globals.css` is imported in `layout.tsx` and Tailwind is configured.

### Issue: Build fails
**Solution**: Check for TypeScript errors
```bash
npx tsc --noEmit
```

## 📖 Documentation Links

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Material Symbols](https://fonts.google.com/metadata/icons)

## 🎯 Next Steps

1. **Run the app** - `npm run dev`
2. **Explore pages** - Visit different routes
3. **Customize colors** - Edit `app/globals.css`
4. **Add features** - Create new pages in `app/`
5. **Connect API** - Replace mock data with real API calls
6. **Deploy** - Push to Vercel or your hosting

## 💡 Tips

- All components are marked with `'use client'` for interactivity
- Use `<Link>` from next/link for navigation
- Tailwind classes are available for all styling
- Material Symbols are ready to use throughout the app
- Mock data is easily replaceable with API calls

## ❓ Questions?

- Check `README.md` for more information
- Review component code in `components/`
- Check page implementations in `app/`
- All code is well-commented

Happy coding! 🚀
