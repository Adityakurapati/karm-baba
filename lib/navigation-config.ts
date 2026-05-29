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
      title: 'Buyer Portal',
      items: [
        { icon: 'dashboard', label: 'Dashboard', href: '/dashboard', roles: ['buyer'] },
        { icon: 'assignment', label: 'Requirements', href: '/buyer/requirements', roles: ['buyer'] },
        { icon: 'person_search', label: 'Find Suppliers', href: '/buyer/matches', roles: ['buyer'] },
        { icon: 'handshake', label: 'My Deals', href: '/buyer/deals', roles: ['buyer'] },
      ],
    }
  ],
  seller: [
    {
      title: 'Vendor Portal',
      items: [
        { icon: 'dashboard', label: 'Dashboard', href: '/dashboard', roles: ['seller'] },
        { icon: 'shopping_bag', label: 'My Products', href: '/seller/products', roles: ['seller'] },
        { icon: 'handshake', label: 'My Deals', href: '/seller/deals', roles: ['seller'] },
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
