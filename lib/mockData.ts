import {
  User, Product, Requirement, Lead, Deal, Message, Quote,
  Company, VerificationBadge, Document, DealEvent
} from './types';

// ========================================
// MOCK USERS (Buyers, Sellers, Admin)
// ========================================

const mockBuyer1: User = {
  id: 'buyer-001',
  email: 'arun@techcorp.com',
  firstName: 'Arun',
  lastName: 'Sharma',
  role: 'buyer',
  company: {
    id: 'comp-001',
    name: 'Tech Corp Solutions',
    registrationNumber: 'GST123456789',
    industry: 'Technology & Electronics',
    location: 'Bangalore, India',
    website: 'www.techcorp.in',
    employees: 150,
    yearEstablished: 2012,
  },
  phone: '+91-9876543210',
  credibilityScore: 85,
  verificationStatus: 'verified',
  verificationBadges: [
    { id: 'v-1', type: 'gst', number: 'GST123456789', issuedDate: new Date('2022-01-15'), verifiedBy: 'KARM BABA' },
    { id: 'v-2', type: 'pan', number: 'AAAAA1234A', issuedDate: new Date('2020-01-01'), verifiedBy: 'KARM BABA' },
  ],
  riskLevel: 'low',
  isOnboarded: true,
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date('2024-03-20'),
};

const mockBuyer2: User = {
  id: 'buyer-002',
  email: 'priya@fashionretail.com',
  firstName: 'Priya',
  lastName: 'Verma',
  role: 'buyer',
  company: {
    id: 'comp-002',
    name: 'Fashion Retailers EU',
    registrationNumber: 'EU987654321',
    industry: 'Fashion & Textiles',
    location: 'Berlin, Germany',
    website: 'www.fashionretailers.de',
    employees: 250,
    yearEstablished: 2008,
  },
  phone: '+49-3012345678',
  credibilityScore: 92,
  verificationStatus: 'verified',
  verificationBadges: [
    { id: 'v-3', type: 'gst', number: 'EU987654321', issuedDate: new Date('2022-06-01'), verifiedBy: 'KARM BABA' },
  ],
  riskLevel: 'low',
  isOnboarded: true,
  createdAt: new Date('2022-06-10'),
  updatedAt: new Date('2024-02-28'),
};

const mockSeller1: User = {
  id: 'seller-001',
  email: 'rajesh@automotiveparts.com',
  firstName: 'Rajesh',
  lastName: 'Kumar',
  role: 'seller',
  company: {
    id: 'comp-003',
    name: 'Automotive Parts Manufacturing Ltd',
    registrationNumber: 'GST789456123',
    industry: 'Automotive',
    location: 'Chennai, India',
    website: 'www.autoparts-mfg.in',
    employees: 500,
    yearEstablished: 2005,
  },
  phone: '+91-9988776655',
  credibilityScore: 88,
  verificationStatus: 'verified',
  verificationBadges: [
    { id: 'v-4', type: 'gst', number: 'GST789456123', issuedDate: new Date('2022-02-15'), verifiedBy: 'KARM BABA' },
    { id: 'v-5', type: 'iso_certified', number: 'ISO9001-2023', issuedDate: new Date('2023-01-10'), expiryDate: new Date('2026-01-10'), verifiedBy: 'KARM BABA' },
  ],
  riskLevel: 'low',
  isOnboarded: true,
  createdAt: new Date('2021-03-01'),
  updatedAt: new Date('2024-03-15'),
};

const mockSeller2: User = {
  id: 'seller-002',
  email: 'vikram@textileexport.com',
  firstName: 'Vikram',
  lastName: 'Patel',
  role: 'seller',
  company: {
    id: 'comp-004',
    name: 'Textile Export House',
    registrationNumber: 'GST654123789',
    industry: 'Textiles & Fabrics',
    location: 'Surat, India',
    website: 'www.textileexport.in',
    employees: 300,
    yearEstablished: 2010,
  },
  phone: '+91-8765432109',
  credibilityScore: 76,
  verificationStatus: 'verified',
  verificationBadges: [
    { id: 'v-6', type: 'export_license', number: 'EXP/2023/001', issuedDate: new Date('2023-01-20'), verifiedBy: 'KARM BABA' },
  ],
  riskLevel: 'medium',
  isOnboarded: true,
  createdAt: new Date('2023-05-10'),
  updatedAt: new Date('2024-01-20'),
};

const mockAdmin: User = {
  id: 'admin-001',
  email: 'admin@karmbaba.com',
  firstName: 'Admin',
  lastName: 'Manager',
  role: 'admin',
  company: {
    id: 'comp-admin',
    name: 'KARM BABA',
    registrationNumber: 'ADMIN001',
    industry: 'B2B Platform',
    location: 'Mumbai, India',
    website: 'www.karmbaba.com',
    employees: 50,
    yearEstablished: 2023,
  },
  phone: '+91-9999999999',
  credibilityScore: 100,
  verificationStatus: 'verified',
  verificationBadges: [],
  riskLevel: 'low',
  isOnboarded: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2024-03-20'),
};

export const mockUsers = [mockBuyer1, mockBuyer2, mockSeller1, mockSeller2, mockAdmin];

// ========================================
// MOCK PRODUCTS
// ========================================

export const mockProducts: Product[] = [
  {
    id: 'prod-001',
    sellerId: 'seller-001',
    name: 'Automotive Engine Gaskets',
    description: 'High-performance engine gaskets for 4-cylinder engines, precision manufactured',
    category: 'Automotive Components',
    images: ['/images/gaskets.jpg'],
    basePrice: 45,
    currency: 'USD',
    minimumOrderQuantity: 500,
    availableQuantity: 50000,
    specifications: {
      material: 'Multi-layer steel',
      thickness: '2-3mm',
      temperature_rating: '250°C',
      pressure_rating: '3000 PSI',
    },
    certifications: ['ISO 9001', 'TS 16949'],
    leadTime: 14,
    shippingTerms: 'FOB Chennai',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-18'),
  },
  {
    id: 'prod-002',
    sellerId: 'seller-001',
    name: 'Brake Pad Assemblies',
    description: 'Certified brake pad sets with premium friction material',
    category: 'Automotive Components',
    images: ['/images/brakes.jpg'],
    basePrice: 120,
    currency: 'USD',
    minimumOrderQuantity: 200,
    availableQuantity: 15000,
    specifications: {
      type: 'Semi-metallic',
      thickness: '8-10mm',
      friction_coefficient: '0.35-0.45',
    },
    certifications: ['ISO 6311', 'SAE J2430'],
    leadTime: 21,
    shippingTerms: 'CIF Berlin',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-10'),
  },
  {
    id: 'prod-003',
    sellerId: 'seller-002',
    name: 'Cotton Woven Fabric 100%',
    description: 'Pure cotton fabric, 100gsm, perfect for summer garments',
    category: 'Textile Fabrics',
    images: ['/images/cotton.jpg'],
    basePrice: 3.5,
    currency: 'USD',
    minimumOrderQuantity: 5000,
    availableQuantity: 500000,
    specifications: {
      composition: '100% Cotton',
      weight: '100 GSM',
      width: '150 cm',
      weave: 'Plain',
      color: 'Natural White',
    },
    certifications: ['GOTS', 'Oeko-Tex 100'],
    leadTime: 7,
    shippingTerms: 'FCA Surat',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-03-05'),
  },
  {
    id: 'prod-004',
    sellerId: 'seller-002',
    name: 'Polyester Dyed Fabric',
    description: 'Vibrant polyester fabric, ready for cutting and garment manufacturing',
    category: 'Textile Fabrics',
    images: ['/images/polyester.jpg'],
    basePrice: 2.8,
    currency: 'USD',
    minimumOrderQuantity: 3000,
    availableQuantity: 700000,
    specifications: {
      composition: '100% Polyester',
      weight: '80 GSM',
      width: '150 cm',
      colors: 'Available in 50+ colors',
    },
    certifications: ['Oeko-Tex 100', 'REACH Compliant'],
    leadTime: 10,
    shippingTerms: 'FOB Surat',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-08'),
  },
];

// ========================================
// MOCK REQUIREMENTS
// ========================================

export const mockRequirements: Requirement[] = [
  {
    id: 'req-001',
    buyerId: 'buyer-001',
    title: 'Urgent: Electronic Components for Manufacturing',
    description: 'Looking for high-quality capacitors, resistors and semiconductors for our product line',
    category: 'Electronics',
    quantity: 100000,
    unit: 'pieces',
    budget: 50000,
    currency: 'USD',
    requiredDeliveryDate: new Date('2024-05-15'),
    specifications: {
      quality_standard: 'IEC 60068',
      packaging: 'Tape & Reel',
      lead_time: '15 days max',
    },
    documents: [],
    status: 'matched',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-18'),
  },
  {
    id: 'req-002',
    buyerId: 'buyer-002',
    title: 'Bulk Cotton Fabric Import for Q2 2024',
    description: 'Importing cotton fabric for summer collection manufacturing across European markets',
    category: 'Textiles',
    quantity: 50000,
    unit: 'meters',
    budget: 175000,
    currency: 'USD',
    requiredDeliveryDate: new Date('2024-04-30'),
    specifications: {
      type: '100% Cotton, plain weave',
      width: '150cm',
      gsm: '100',
    },
    documents: [],
    status: 'open',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-20'),
  },
];

// ========================================
// MOCK LEADS
// ========================================

export const mockLeads: Lead[] = [
  {
    id: 'lead-001',
    sellerId: 'seller-001',
    buyerId: 'buyer-001',
    requirementId: 'req-001',
    status: 'hot',
    leadScore: 92,
    conversationHistory: [
      {
        id: 'msg-1',
        conversationId: 'conv-001',
        senderId: 'seller-001',
        senderName: 'Rajesh Kumar',
        content: 'Hi Arun, I have high-quality capacitors that match your requirements. Can we discuss specifications?',
        type: 'text',
        createdAt: new Date('2024-03-18T10:30:00'),
      },
      {
        id: 'msg-2',
        conversationId: 'conv-001',
        senderId: 'buyer-001',
        senderName: 'Arun Sharma',
        content: 'Interested! What are your MOQ and delivery timeline?',
        type: 'text',
        createdAt: new Date('2024-03-18T11:15:00'),
      },
    ],
    quotes: [],
    lastContactedAt: new Date('2024-03-18T11:15:00'),
    nextFollowUpDate: new Date('2024-03-22'),
    rmAssignedId: 'admin-001',
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date('2024-03-18'),
  },
  {
    id: 'lead-002',
    sellerId: 'seller-002',
    buyerId: 'buyer-002',
    requirementId: 'req-002',
    status: 'contacted',
    leadScore: 78,
    conversationHistory: [
      {
        id: 'msg-3',
        conversationId: 'conv-002',
        senderId: 'seller-002',
        senderName: 'Vikram Patel',
        content: 'Dear Priya, We have premium cotton fabric exactly matching your specs. Pricing: $3.50/meter for 50k+ meters.',
        type: 'text',
        createdAt: new Date('2024-03-19T09:00:00'),
      },
    ],
    quotes: [
      {
        id: 'quote-001',
        leadId: 'lead-002',
        sellerId: 'seller-002',
        productName: 'Cotton Woven Fabric 100%',
        quantity: 50000,
        unit: 'meters',
        pricePerUnit: 3.5,
        totalPrice: 175000,
        currency: 'USD',
        validUntil: new Date('2024-03-25'),
        paymentTerms: 'Net 30',
        deliveryTerms: 'FCA Surat, 3-4 weeks',
        status: 'pending',
        createdAt: new Date('2024-03-19'),
        updatedAt: new Date('2024-03-19'),
      },
    ],
    lastContactedAt: new Date('2024-03-19T09:00:00'),
    nextFollowUpDate: new Date('2024-03-23'),
    createdAt: new Date('2024-03-19'),
    updatedAt: new Date('2024-03-19'),
  },
];

// ========================================
// MOCK DEALS
// ========================================

export const mockDeals: Deal[] = [
  {
    id: 'deal-001',
    buyerId: 'buyer-001',
    sellerId: 'seller-001',
    productId: 'prod-001',
    leadId: 'lead-001',
    title: 'Engine Gasket Supply Agreement',
    description: 'Supply of 10,000 units of engine gaskets for automotive assembly',
    quantity: 10000,
    unit: 'pieces',
    agreedPrice: 45,
    currency: 'USD',
    status: 'quote_received',
    paymentTerms: 'Net 30',
    deliveryTerms: 'FOB Chennai',
    deliveryDate: new Date('2024-04-15'),
    documents: [],
    conversations: [],
    timeline: [
      {
        id: 'event-1',
        dealId: 'deal-001',
        type: 'status_change',
        title: 'Deal Created',
        description: 'Buyer Arun Sharma initiated deal discussion',
        createdBy: 'buyer-001',
        createdAt: new Date('2024-03-18'),
      },
      {
        id: 'event-2',
        dealId: 'deal-001',
        type: 'offer_made',
        title: 'Quote Submitted',
        description: 'Rajesh Kumar sent quote: $450,000 for 10,000 units',
        createdBy: 'seller-001',
        createdAt: new Date('2024-03-19'),
      },
    ],
    rmAssignedId: 'admin-001',
    expectedValue: 450000,
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date('2024-03-19'),
  },
  {
    id: 'deal-002',
    buyerId: 'buyer-002',
    sellerId: 'seller-002',
    productId: 'prod-003',
    leadId: 'lead-002',
    title: 'Cotton Fabric Bulk Import',
    description: 'Supply of 50,000 meters of cotton fabric for summer collection',
    quantity: 50000,
    unit: 'meters',
    agreedPrice: 3.5,
    currency: 'USD',
    status: 'negotiation',
    paymentTerms: 'Net 30',
    deliveryTerms: 'FCA Surat',
    deliveryDate: new Date('2024-04-30'),
    documents: [],
    conversations: [],
    timeline: [
      {
        id: 'event-3',
        dealId: 'deal-002',
        type: 'status_change',
        title: 'Deal Created',
        description: 'Buyer Priya Verma posted requirement',
        createdBy: 'buyer-002',
        createdAt: new Date('2024-03-05'),
      },
      {
        id: 'event-4',
        dealId: 'deal-002',
        type: 'offer_made',
        title: 'Quote Submitted',
        description: 'Vikram Patel submitted quote: $175,000',
        createdBy: 'seller-002',
        createdAt: new Date('2024-03-19'),
      },
    ],
    expectedValue: 175000,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-19'),
  },
];

// ========================================
// UTILITY FUNCTIONS
// ========================================

export function getUserById(userId: string): User | undefined {
  return mockUsers.find(u => u.id === userId);
}

export function getProductsBySellerId(sellerId: string): Product[] {
  return mockProducts.filter(p => p.sellerId === sellerId);
}

export function getRequirementsByBuyerId(buyerId: string): Requirement[] {
  return mockRequirements.filter(r => r.buyerId === buyerId);
}

export function getLeadsBySellerId(sellerId: string): Lead[] {
  return mockLeads.filter(l => l.sellerId === sellerId);
}

export function getLeadsByBuyerId(buyerId: string): Lead[] {
  return mockLeads.filter(l => l.buyerId === buyerId);
}

export function getDealById(dealId: string): Deal | undefined {
  return mockDeals.find(d => d.id === dealId);
}

export function getDealsByBuyerId(buyerId: string): Deal[] {
  return mockDeals.filter(d => d.buyerId === buyerId);
}

export function getDealsBySellerId(sellerId: string): Deal[] {
  return mockDeals.filter(d => d.sellerId === sellerId);
}

export function getAllDeals(): Deal[] {
  return mockDeals;
}

export function getActiveDeals(): Deal[] {
  return mockDeals.filter(d => !['cancelled'].includes(d.status));
}
