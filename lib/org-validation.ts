import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name is required'),
  industry: z.string().min(2, 'Industry is required'),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().min(5, 'Address is required'),
  country: z.string().min(2, 'Country is required'),
  state: z.string().min(2, 'State is required'),
  timezone: z.string().min(2, 'Timezone is required'),
  subscriptionPlan: z.enum(['Starter', 'Professional', 'Enterprise']),
  billingCycle: z.enum(['monthly', 'yearly']),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  pin: z.string().length(4, 'PIN must be exactly 4 digits').regex(/^\d+$/, 'PIN must contain only numbers'),
});

export const updateOrganizationSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  notificationSettings: z.object({
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    systemAlerts: z.boolean(),
  }),
  emailSettings: z.object({
    senderName: z.string(),
    senderEmail: z.string().email('Invalid sender email'),
  }),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['organization_admin', 'manager', 'analyst', 'vendor_user']),
});

export type CreateOrganizationData = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationSettingsData = z.infer<typeof updateOrganizationSettingsSchema>;
export type InviteMemberData = z.infer<typeof inviteMemberSchema>;
