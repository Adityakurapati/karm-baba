// ========================================
// USER TYPES
// ========================================

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'analyst' | 'vendor_user' | 'buyer' | 'seller' | 'guest' | 'lead' | 'individual' | 'business';

export interface Company {
  id: string;
  name: string;
  registrationNumber: string;
  industry: string | string[];
  location: string;
  website?: string;
  employees: number;
  yearEstablished: number;
  gstin?: string;
  entityType?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  employeesRange?: string;
  turnoverRange?: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  company?: Company;
  organizationId?: string;
  designation?: string;
  department?: string;
  status?: 'Active' | 'Inactive' | 'Blocked' | 'Pending Approval' | 'Deleted';
  lastLogin?: Date;
  createdBy?: string;
  phone: string;
  profileImage?: string;
  credibilityScore: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationBadges: VerificationBadge[];
  riskLevel: 'low' | 'medium' | 'high';
  isOnboarded: boolean;
  onboardingStep?: number;
  isAuthorized?: boolean;
  isGstVerified?: boolean;
  isKarmBabaCertified?: boolean;
  gstDetails?: {
    gstin: string;
    legalName: string;
    tradeName: string;
    registrationDate: string;
    status: string;
    address: string;
    type: string;
    pan: string;
  };
  notificationPreferences?: NotificationPreferences;
  language?: string;
  category?: string | string[];
  specialization?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationBadge {
  id: string;
  type: 'gst' | 'pan' | 'export_license' | 'iso_certified';
  number: string;
  issuedDate: Date;
  expiryDate?: Date;
  verifiedBy?: string;
}

// ========================================
// PRODUCT & INVENTORY TYPES
// ========================================

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  category: string;
  location?: string;
  images: string[];
  basePrice: number;
  currency: string;
  minimumOrderQuantity: number;
  availableQuantity: number;
  specifications: Record<string, string>;
  certifications: string[];
  leadTime: number; // days
  shippingTerms: string;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// REQUIREMENT & LEAD TYPES
// ========================================

export interface Requirement {
  id: string;
  buyerId: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  budget: number;
  currency: string;
  requiredDeliveryDate: Date;
  specifications: Record<string, string>;
  documents: Document[];
  status: 'open' | 'matched' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  sellerId: string;
  buyerId: string;
  requirementId: string;
  status: 'new' | 'contacted' | 'hot' | 'negotiation' | 'closed' | 'lost';
  leadScore: number; // 0-100
  conversationHistory: Message[];
  quotes: Quote[];
  lastContactedAt?: Date;
  nextFollowUpDate?: Date;
  rmAssignedId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformLead {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  code?: string;
  location?: string;
  assignmentType: 'all' | 'users' | 'categories';
  assignedUsers?: string[];
  assignedCategories?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// DEAL & NEGOTIATION TYPES
// ========================================

export interface Deal {
  id: string;
  buyerId: string;
  sellerId: string;
  productId?: string;
  requirementId?: string;
  leadId?: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  agreedPrice: number;
  currency: string;
  status: 'inquiry' | 'new_supplier' | 'quote_received' | 'negotiation' | 'sample_requested' | 'finalized' | 'cancelled';
  paymentTerms: string;
  deliveryTerms: string;
  deliveryDate: Date;
  documents: Document[];
  conversations: Message[];
  timeline: DealEvent[];
  rmAssignedId?: string;
  expectedValue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DealEvent {
  id: string;
  dealId: string;
  type: 'status_change' | 'message' | 'document_uploaded' | 'offer_made' | 'offer_accepted';
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
}

export interface Quote {
  id: string;
  leadId: string;
  sellerId: string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  currency: string;
  validUntil: Date;
  paymentTerms: string;
  deliveryTerms: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// MESSAGE & DOCUMENT TYPES
// ========================================

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'offer' | 'document' | 'status_update';
  attachments?: string[];
  readAt?: Date;
  createdAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

// ========================================
// AUTHENTICATION TYPES
// ========================================

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
  companyName: string;
  token: string;
  expiresAt: Date;
}

// ========================================
// ADMIN TYPES
// ========================================

export interface PlatformCategory {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DealPipelineMetrics {
  totalDeals: number;
  byStage: Record<string, number>;
  totalValue: number;
  conversionRate: number;
}

export interface PlatformMetrics {
  totalUsers: number;
  totalBuyers: number;
  totalSellers: number;
  activeDeals: number;
  totalRevenue: number;
  dealsPipeline: DealPipelineMetrics;
}

// ========================================
// NOTIFICATION TYPES
// ========================================

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'requirement_accepted' | 'deal_initiated' | 'message_received' | 'general';
  link?: string;
  read: boolean;
  createdAt: Date;
}

export type NotificationChannel = 'email' | 'whatsapp' | 'inApp';
export type NotificationCategory = 'dealUpdates' | 'newMatches' | 'messages' | 'accountUpdates';

export type NotificationPreferences = Record<NotificationCategory, Record<NotificationChannel, boolean>>;

// ========================================
// BUSINESS PROFILE TYPES
// ========================================

export interface BusinessProfile {
  id: string; // The {businessId}
  organizationId: string;
  businessName: string;
  legalName: string;
  gstin: string;
  pan: string;
  cin?: string;
  industryType: string;
  businessCategory: string;
  companySize: string;
  annualRevenueRange: string;
  yearEstablished: number;
  websiteUrl?: string;
  linkedinUrl?: string;
  headquartersAddress: string;
  state: string;
  country: string;
  pincode: string;
  contactInformation: {
    contactPersonName: string;
    contactEmail: string;
    contactMobileNumber: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  verificationStatus: 'Pending' | 'Verified' | 'Rejected' | 'Needs Review';
  riskScore: number;
  credibilityScore: number;
  gstVerificationResponse?: any;
  panVerificationResponse?: any;
  verificationTimestamp?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessDocument {
  id: string; // The {documentId}
  businessId: string;
  documentType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
  verificationStatus: 'Pending' | 'Verified' | 'Rejected';
}

export interface BusinessHistory {
  id: string; // The {historyId}
  businessId: string;
  changedBy: string; // User Name or ID
  fieldName: string;
  oldValue: string | number | boolean | null | undefined;
  newValue: string | number | boolean | null | undefined;
  timestamp: Date;
}

// ========================================
// RBAC & SESSION TYPES
// ========================================

export interface UserSession {
  id: string; // The {sessionId}
  userId: string;
  refreshToken: string;
  device: string;
  browser: string;
  operatingSystem: string;
  ipAddress: string;
  loginTime: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface RolePermission {
  role: UserRole;
  permissions: string[];
}

export interface ActivityLog {
  id: string; // The {logId}
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  timestamp: Date;
}

// ========================================

export type OrganizationStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected' | 'Suspended';
export type SubscriptionPlan = 'Starter' | 'Professional' | 'Enterprise';
export type PaymentStatus = 'Active' | 'Trial' | 'Expired' | 'Suspended';
export type OrgRole = 'organization_admin' | 'manager' | 'analyst' | 'vendor_user';

export interface Organization {
  id: string; // {organizationId}
  name: string;
  industry: string;
  gstin: string;
  website?: string;
  address: string;
  country: string;
  state: string;
  timezone: string;
  logo?: string;
  status: OrganizationStatus;
  subscriptionPlan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  renewalDate: Date;
  paymentStatus: PaymentStatus;
  userLimit: number;
  storageLimit: number;
  apiLimit: number;
  createdBy: string;
  phoneNumber?: string;
  hashedPin?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  id: string; // {organizationId}
  theme: 'light' | 'dark' | 'system';
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    systemAlerts: boolean;
  };
  emailSettings: {
    senderName: string;
    senderEmail: string;
    smtpConfigured: boolean;
  };
  aiSettings: {
    aiProvider: string;
    aiModel: string;
    automationRulesEnabled: boolean;
  };
  crmSettings: {
    leadPipelineStages: string[];
    leadAssignmentRules: string;
    followUpSettings: string;
  };
}

export interface OrganizationMember {
  userId: string;
  role: OrgRole;
  permissions: string[];
  joinedAt: Date;
  invitedBy: string;
}

export interface OrganizationInvitation {
  id: string; // {inviteId}
  organizationId: string;
  email: string;
  role: OrgRole;
  invitationStatus: 'Pending' | 'Accepted' | 'Expired' | 'Rejected' | 'Suspended';
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
}

export interface OrganizationAnalytics {
  id: string; // {organizationId}
  totalUsers: number;
  activeUsers: number;
  vendorsAdded: number;
  leadsCreated: number;
  aiReportsGenerated: number;
  pricingRecordsUploaded: number;
  updatedAt: Date;
}

export interface OrganizationApprovalLog {
  id: string; // {approvalId}
  organizationId: string;
  status: OrganizationStatus;
  remarks: string;
  approvedBy: string;
  approvedAt: Date;
}
