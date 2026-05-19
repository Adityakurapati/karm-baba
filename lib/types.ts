// ========================================
// USER TYPES
// ========================================

export type UserRole = 'buyer' | 'seller' | 'admin' | 'guest' | 'lead';

export interface Company {
  id: string;
  name: string;
  registrationNumber: string;
  industry: string | string[];
  location: string;
  website?: string;
  employees: number;
  yearEstablished: number;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  company: Company;
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
  category?: string;
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
  status: 'new_supplier' | 'quote_received' | 'negotiation' | 'sample_requested' | 'finalized' | 'cancelled';
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
