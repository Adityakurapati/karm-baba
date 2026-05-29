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

export const navigationConfig: Record<UserRole, NavSection[]> = {
  buyer: [
    {
      items: [
        { icon: 'dashboard', label: 'Dashboard', href: '/dashboard', roles: ['buyer'] },
        { icon: 'handshake', label: 'Deals', href: '/buyer/deals', roles: ['buyer'] },
        { icon: 'person_search', label: 'Leads', href: '/buyer/leads', roles: ['buyer'] },
        { icon: 'storefront', label: 'Product Marketplace', href: '/buyer/marketplace/products', roles: ['buyer'] },
        { icon: 'shopping_cart', label: 'Purchases', href: '/buyer/purchases', roles: ['buyer'] },
        { icon: 'assignment', label: 'Requirements', href: '/buyer/requirements', roles: ['buyer'] },
        { icon: 'person_search', label: 'Find Suppliers', href: '/buyer/matches', roles: ['buyer'] },
      ],
    }
  ],

  seller: [
    {
      items: [
        { icon: 'dashboard', label: 'Dashboard', href: '/dashboard', roles: ['seller'] },
        { icon: 'person_search', label: 'Leads', href: '/seller/leads', roles: ['seller'] },
        { icon: 'handshake', label: 'Deals', href: '/seller/deals', roles: ['seller'] },
        { icon: 'storefront', label: 'Marketplace', href: '/seller/marketplace', roles: ['seller'] },
        { icon: 'shopping_bag', label: 'Products', href: '/seller/products', roles: ['seller'] },
      ],
    }
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
  individual: [
    {
      title: 'Buying',
      items: [
        { icon: 'dashboard', label: 'Dashboard', href: '/dashboard', roles: ['individual'] },
        { icon: 'assignment', label: 'Requirements', href: '/buyer/requirements', roles: ['individual'] },
        { icon: 'person_search', label: 'Find Suppliers', href: '/buyer/matches', roles: ['individual'] },
        { icon: 'handshake', label: 'My Deals (Buy)', href: '/buyer/deals', roles: ['individual'] },
        { icon: 'person_search', label: 'Leads (Buy)', href: '/buyer/leads', roles: ['individual'] },
        { icon: 'storefront', label: 'Marketplace (Buy)', href: '/buyer/marketplace/products', roles: ['individual'] },
        { icon: 'shopping_cart', label: 'My Purchases', href: '/buyer/purchases', roles: ['individual'] },
      ],
    },
    {
      title: 'Selling',
      items: [
        { icon: 'shopping_bag', label: 'My Products', href: '/seller/products', roles: ['individual'] },
        { icon: 'person_search', label: 'Sales Leads', href: '/seller/leads', roles: ['individual'] },
        { icon: 'handshake', label: 'Sales Deals', href: '/seller/deals', roles: ['individual'] },
        { icon: 'storefront', label: 'B2B Marketplace', href: '/seller/marketplace', roles: ['individual'] },
      ],
    }
  ],
  business: [
    {
      title: 'Buying',
      items: [
        { icon: 'dashboard', label: 'Dashboard', href: '/dashboard', roles: ['business'] },
        { icon: 'assignment', label: 'Requirements', href: '/buyer/requirements', roles: ['business'] },
        { icon: 'person_search', label: 'Find Suppliers', href: '/buyer/matches', roles: ['business'] },
        { icon: 'handshake', label: 'My Deals (Buy)', href: '/buyer/deals', roles: ['business'] },
        { icon: 'person_search', label: 'Leads (Buy)', href: '/buyer/leads', roles: ['business'] },
        { icon: 'storefront', label: 'Marketplace (Buy)', href: '/buyer/marketplace/products', roles: ['business'] },
        { icon: 'shopping_cart', label: 'My Purchases', href: '/buyer/purchases', roles: ['business'] },
      ],
    },
    {
      title: 'Selling',
      items: [
        { icon: 'shopping_bag', label: 'My Products', href: '/seller/products', roles: ['business'] },
        { icon: 'person_search', label: 'Sales Leads', href: '/seller/leads', roles: ['business'] },
        { icon: 'handshake', label: 'Sales Deals', href: '/seller/deals', roles: ['business'] },
        { icon: 'storefront', label: 'B2B Marketplace', href: '/seller/marketplace', roles: ['business'] },
      ],
    }
  ]
};

export function getNavigationForRole(role: UserRole | string): NavSection[] {
  if (!role) return [];
  return navigationConfig[role.toLowerCase() as UserRole] || [];
}

export function getAllMenuItems(role: UserRole | string): NavItem[] {
  if (!role) return [];
  const sections = navigationConfig[role.toLowerCase() as UserRole] || [];
  return sections.flatMap(section => section.items);
}
