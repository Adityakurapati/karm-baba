import { z } from 'zod';

// Step 1: Basic Information
export const basicInfoSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  legalName: z.string().min(2, "Legal name must be at least 2 characters"),
  industryType: z.string().min(1, "Please select an industry type"),
  businessCategory: z.string().min(1, "Please select a business category"),
  yearEstablished: z.coerce.number().min(1800, "Invalid year").max(new Date().getFullYear(), "Year cannot be in the future")
});

// Step 2: Registration Information
export const registrationInfoSchema = z.object({
  gstin: z.string()
    .length(15, "GSTIN must be exactly 15 characters")
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format"),
  pan: z.string()
    .length(10, "PAN must be exactly 10 characters")
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
  cin: z.string().optional().refine(val => !val || val.length === 21, {
    message: "CIN must be 21 characters long if provided"
  })
});

// Step 3: Contact Information
export const contactInfoSchema = z.object({
  websiteUrl: z.string().url("Invalid URL format").optional().or(z.literal('')),
  linkedinUrl: z.string().url("Invalid URL format").includes("linkedin.com", { message: "Must be a valid LinkedIn URL" }).optional().or(z.literal('')),
  headquartersAddress: z.string().min(5, "Address must be at least 5 characters"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),
  contactPersonName: z.string().min(2, "Contact person name is required"),
  contactEmail: z.string().email("Invalid email format"),
  contactMobileNumber: z.string().regex(/^[0-9]{10}$/, "Mobile number must be 10 digits")
});

// Step 4: Company Information
export const companyInfoSchema = z.object({
  companySize: z.string().min(1, "Company size is required"),
  annualRevenueRange: z.string().min(1, "Annual revenue range is required")
});

// Full Business Profile Schema
export const businessProfileSchema = z.object({}).merge(basicInfoSchema).merge(registrationInfoSchema).merge(contactInfoSchema).merge(companyInfoSchema);

// Document Upload Schema
export const documentUploadSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  file: z.any()
    .refine((file) => file !== null && file !== undefined, "File is required")
    .refine((file) => file?.size <= 10 * 1024 * 1024, "Max file size is 10MB")
    .refine(
      (file) => ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'].includes(file?.type),
      "Only PDF, PNG, JPG and JPEG formats are allowed."
    )
});

export type BasicInfoData = z.infer<typeof basicInfoSchema>;
export type RegistrationInfoData = z.infer<typeof registrationInfoSchema>;
export type ContactInfoData = z.infer<typeof contactInfoSchema>;
export type CompanyInfoData = z.infer<typeof companyInfoSchema>;
export type BusinessProfileData = z.infer<typeof businessProfileSchema>;
