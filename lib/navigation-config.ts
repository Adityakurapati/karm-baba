import { UserRole } from '@/lib/types';

export interface NavItem {
  icon: string;
  label: string;
  href: string;
  roles: UserRole[];
  badge?: number;
  exactMatchOnly?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const organizationNavSection: NavSection = {
  title: 'Organization Management',
  items: [
    { icon: 'corporate_fare', label: 'Org Dashboard', href: '/organizations/:orgId', roles: [], exactMatchOnly: true },
    { icon: 'group', label: 'Team Members', href: '/organizations/:orgId/members', roles: [] },
    { icon: 'settings', label: 'Settings', href: '/organizations/:orgId/settings', roles: [] },
    { icon: 'storefront', label: 'Business Profiles', href: '/organizations/:orgId/business-profiles', roles: [] },
  ],
};

export const businessProfileNavSection: NavSection = {
  title: 'Business Profile',
  items: [
    { icon: 'arrow_back', label: 'Back to Organization', href: '/organizations/:orgId', roles: [], exactMatchOnly: true },
    { icon: 'storefront', label: 'Profile Dashboard', href: '/organizations/:orgId/business-profiles/:businessId', roles: [], exactMatchOnly: true },
    { icon: 'folder', label: 'Documents', href: '/organizations/:orgId/business-profiles/:businessId/documents', roles: [] },
    { icon: 'history', label: 'Audit History', href: '/organizations/:orgId/business-profiles/:businessId/history', roles: [] },
    { icon: 'settings', label: 'Settings', href: '/organizations/:orgId/business-profiles/:businessId/edit', roles: [] },
  ],
};

const platformAdminNav: NavSection[] = [
  {
    title: 'Platform Administration',
    items: [
      { icon: 'dashboard', label: 'Admin Dashboard', href: '/admin', roles: ['super_admin', 'admin'] },
      { icon: 'group', label: 'Users', href: '/admin/users', roles: ['super_admin', 'admin'] },
      { icon: 'assignment_ind', label: 'Leads', href: '/admin/leads', roles: ['super_admin', 'admin'] },
      { icon: 'corporate_fare', label: 'Organizations', href: '/admin/organizations', roles: ['super_admin', 'admin'] },
      { icon: 'security', label: 'Roles & Permissions', href: '/admin/roles', roles: ['super_admin', 'admin'] },
      { icon: 'history', label: 'Activity Logs', href: '/admin/activity-logs', roles: ['super_admin', 'admin'] },
    ],
  }
];

export const navigationConfig: Partial<Record<UserRole, NavSection[]>> = {
  super_admin: platformAdminNav,
  admin: platformAdminNav,
  vendor_user: [
    {
      title: 'Vendor Portal',
      items: [
        { icon: 'dashboard', label: 'Dashboard', href: '/dashboard', roles: ['vendor_user'] },
        { icon: 'shopping_bag', label: 'My Products', href: '/seller/products', roles: ['vendor_user'] },
        { icon: 'handshake', label: 'My Deals', href: '/seller/deals', roles: ['vendor_user'] },
      ],
    }
  ],
  buyer: [
    {
      title: 'Buying',
      items: [
        { icon: 'dashboard', label: 'Dashboard', href: '/dashboard', roles: ['buyer'] },
        { icon: 'assignment', label: 'Requirements', href: '/buyer/requirements', roles: ['buyer'] },
        { icon: 'person_search', label: 'Find Suppliers', href: '/buyer/matches', roles: ['buyer'] },
        { icon: 'handshake', label: 'My Deals (Buy)', href: '/buyer/deals', roles: ['buyer'] },
        { icon: 'person_search', label: 'Leads (Buy)', href: '/buyer/leads', roles: ['buyer'] },
        { icon: 'storefront', label: 'Marketplace (Buy)', href: '/buyer/marketplace/products', roles: ['buyer'] },
        { icon: 'shopping_cart', label: 'My Purchases', href: '/buyer/purchases', roles: ['buyer'] },
      ],
    }
  ],
  seller: [
    {
      title: 'Selling',
      items: [
        { icon: 'shopping_bag', label: 'My Products', href: '/seller/products', roles: ['seller'] },
        { icon: 'person_search', label: 'Sales Leads', href: '/seller/leads', roles: ['seller'] },
        { icon: 'handshake', label: 'Sales Deals', href: '/seller/deals', roles: ['seller'] },
        { icon: 'storefront', label: 'Marketplace', href: '/seller/marketplace', roles: ['seller'] },
      ],
    }
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
  manager: [],
  analyst: [],
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
        { icon: 'storefront', label: 'Marketplace', href: '/seller/marketplace', roles: ['individual'] },
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
        { icon: 'storefront', label: 'Marketplace', href: '/seller/marketplace', roles: ['business'] },
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
