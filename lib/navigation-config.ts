import { UserRole } from '@/lib/types';

export interface NavItem {
  icon: string;
  label: string;
  href: string;
  roles: UserRole[];
  badge?: number;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const navigationConfig: Partial<Record<UserRole, NavSection[]>> = {
  buyer: [
    {
      title: 'Main',
      items: [
        { icon: 'dashboard', label: 'Dashboard', href: '/dashboard', roles: ['buyer'] },
        { icon: 'assignment', label: 'Requirements', href: '/buyer/requirements', roles: ['buyer'] },
        { icon: 'person_search', label: 'Find Suppliers', href: '/buyer/matches', roles: ['buyer'] },
        { icon: 'handshake', label: 'My Deals', href: '/buyer/deals', roles: ['buyer'] },
        { icon: 'person_search', label: 'Leads', href: '/buyer/leads', roles: ['buyer'] },
        { icon: 'storefront', label: 'Product Marketplace', href: '/buyer/marketplace/products', roles: ['buyer'] },
        { icon: 'shopping_cart', label: 'My Purchases', href: '/buyer/purchases', roles: ['buyer'] },
      ],
    },
    {
      title: 'Tools',
      items: [
        // { icon: 'group', label: 'Network', href: '/network', roles: ['buyer'] },
        // { icon: 'verified', label: 'Certifications', href: '/buyer/certifications', roles: ['buyer'] },
        // { icon: 'smart_toy', label: 'AI Assistant', href: '/assistant', roles: ['buyer'] },
      ],
    },
  ],

  seller: [
    {
      title: 'Main',
      items: [
        { icon: 'dashboard', label: 'Dashboard', href: '/dashboard', roles: ['seller'] },
        { icon: 'shopping_bag', label: 'My Products', href: '/seller/products', roles: ['seller'] },
        { icon: 'person_search', label: 'Leads', href: '/seller/leads', roles: ['seller'] },
        { icon: 'handshake', label: 'My Deals', href: '/seller/deals', roles: ['seller'] },
      ],
    },
    {
      title: 'Tools',
      items: [
        // { icon: 'group', label: 'Network', href: '/network', roles: ['seller'] },
        { icon: 'storefront', label: 'Marketplace', href: '/seller/marketplace', roles: ['seller'] },
        // { icon: 'smart_toy', label: 'AI Assistant', href: '/assistant', roles: ['seller'] },
      ],
    },
  ],

  admin: [
    {
      title: 'Admin Panel',
      items: [
        { icon: 'dashboard', label: 'Dashboard', href: '/admin', roles: ['admin'] },
        { icon: 'people', label: 'User Management', href: '/admin/users', roles: ['admin'] },
        { icon: 'handshake', label: 'Deal Pipeline', href: '/admin/deals', roles: ['admin'] },
        { icon: 'trending_up', label: 'Analytics', href: '/admin/analytics', roles: ['admin'] },
      ],
    },
    {
      title: 'Platform',
      items: [
        { icon: 'person_search', label: 'All Leads', href: '/leads', roles: ['admin'] },
        { icon: 'assignment', label: 'Requirements', href: '/requirements', roles: ['admin'] },
      ],
    },
  ],

  guest: [
    {
      title: 'KARM BABA',
      items: [
        { icon: 'login', label: 'Login', href: '/login', roles: ['guest'] },
        { icon: 'person_add', label: 'Register', href: '/register', roles: ['guest'] },
      ],
    },
  ],

  lead: [],
  individual: [],
  business: []
};

export function getNavigationForRole(role: UserRole): NavSection[] {
  return navigationConfig[role] || [];
}

export function getAllMenuItems(role: UserRole): NavItem[] {
  const sections = navigationConfig[role] || [];
  return sections.flatMap(section => section.items);
}
