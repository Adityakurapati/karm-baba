import { ref, set, get, update, remove, push, serverTimestamp, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../firebase';
import { 
  Organization, 
  OrganizationSettings, 
  OrganizationMember, 
  OrganizationInvitation, 
  OrganizationAnalytics,
  OrganizationApprovalLog,
  User,
  OrgRole,
  OrganizationStatus
} from '../types';

// Core DB Paths
const DB_ORGS = 'organizations';
const DB_ORG_SETTINGS = 'organizationSettings';
const DB_ORG_MEMBERS = 'organizationMembers';
const DB_ORG_INVITES = 'organizationInvitations';
const DB_ORG_ANALYTICS = 'organizationAnalytics';
const DB_ORG_APPROVALS = 'organizationApprovalLogs';

// ==========================================
// CORE TENANT HELPER
// ==========================================

/**
 * Validates access to an organization's data path.
 * If the user is a super_admin, they have access.
 * Otherwise, verifies that the user belongs to the requested organization.
 */
export const getOrganizationData = async (orgId: string, path: string, currentUser: User) => {
  if (currentUser.role === 'super_admin') {
    // Access granted
  } else {
    // Check if user is a member of the organization
    const memberRef = ref(database, `${DB_ORG_MEMBERS}/${orgId}/${currentUser.id}`);
    const memberSnap = await get(memberRef);
    if (!memberSnap.exists() && currentUser.organizationId !== orgId) {
      throw new Error("Unauthorized access to organization data.");
    }
  }

  const dataRef = ref(database, path);
  const snapshot = await get(dataRef);
  return snapshot.val();
};

// ==========================================
// ORGANIZATION CRUD
// ==========================================

export const createOrganization = async (orgData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt' | 'status'>, userId: string) => {
  const orgsRef = ref(database, DB_ORGS);
  const newOrgRef = push(orgsRef);
  const orgId = newOrgRef.key!;
  
  const fbData = {
    ...orgData,
    id: orgId,
    status: 'Pending' as OrganizationStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await set(newOrgRef, fbData);

  // Set default settings
  const defaultSettings: OrganizationSettings = {
    id: orgId,
    theme: 'system',
    notificationSettings: { emailNotifications: true, smsNotifications: false, systemAlerts: true },
    emailSettings: { senderName: orgData.name, senderEmail: 'no-reply@karmbaba.com', smtpConfigured: false },
    aiSettings: { aiProvider: 'default', aiModel: 'default', automationRulesEnabled: false },
    crmSettings: { leadPipelineStages: ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'], leadAssignmentRules: 'Round Robin', followUpSettings: '2 Days' }
  };
  await set(ref(database, `${DB_ORG_SETTINGS}/${orgId}`), defaultSettings);

  // Make the creator the organization_admin
  await assignRole(orgId, userId, 'organization_admin', ['all'], userId);
  
  // Link user to organization
  await update(ref(database, `users/${userId}`), { organizationId: orgId });

  return orgId;
};

export const getOrganization = async (orgId: string): Promise<Organization | null> => {
  const orgRef = ref(database, `${DB_ORGS}/${orgId}`);
  const snapshot = await get(orgRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      renewalDate: new Date(data.renewalDate)
    } as Organization;
  }
  return null;
};

export const updateOrganization = async (orgId: string, updates: Partial<Organization>) => {
  const orgRef = ref(database, `${DB_ORGS}/${orgId}`);
  await update(orgRef, { ...updates, updatedAt: serverTimestamp() });
};

export const deleteOrganization = async (orgId: string) => {
  // Soft delete logic if needed, or hard delete
  await update(ref(database, `${DB_ORGS}/${orgId}`), { status: 'Deleted', updatedAt: serverTimestamp() });
};

// ==========================================
// SETTINGS & ANALYTICS
// ==========================================

export const updateOrganizationSettings = async (orgId: string, settings: Partial<OrganizationSettings>) => {
  const settingsRef = ref(database, `${DB_ORG_SETTINGS}/${orgId}`);
  await update(settingsRef, settings);
};

export const getOrganizationSettings = async (orgId: string): Promise<OrganizationSettings | null> => {
  const snapshot = await get(ref(database, `${DB_ORG_SETTINGS}/${orgId}`));
  return snapshot.exists() ? snapshot.val() as OrganizationSettings : null;
};

export const getOrganizationAnalytics = async (orgId: string): Promise<OrganizationAnalytics | null> => {
  const snapshot = await get(ref(database, `${DB_ORG_ANALYTICS}/${orgId}`));
  if (snapshot.exists()) {
    const data = snapshot.val();
    return {
      ...data,
      updatedAt: new Date(data.updatedAt)
    } as OrganizationAnalytics;
  }
  return null;
};

// ==========================================
// MEMBER MANAGEMENT
// ==========================================

export const getOrganizationMembers = async (orgId: string) => {
  const membersRef = ref(database, `${DB_ORG_MEMBERS}/${orgId}`);
  const snapshot = await get(membersRef);
  const members: OrganizationMember[] = [];
  if (snapshot.exists()) {
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      members.push({
        ...data,
        joinedAt: new Date(data.joinedAt)
      });
    });
  }
  return members;
};

export const assignRole = async (orgId: string, userId: string, role: OrgRole, permissions: string[], assignerId: string) => {
  const memberRef = ref(database, `${DB_ORG_MEMBERS}/${orgId}/${userId}`);
  const memberSnap = await get(memberRef);
  
  const memberData = {
    userId,
    role,
    permissions,
    joinedAt: memberSnap.exists() ? memberSnap.val().joinedAt : serverTimestamp(),
    invitedBy: memberSnap.exists() ? memberSnap.val().invitedBy : assignerId
  };
  
  await set(memberRef, memberData);
};

export const removeMember = async (orgId: string, userId: string) => {
  const memberRef = ref(database, `${DB_ORG_MEMBERS}/${orgId}/${userId}`);
  await remove(memberRef);
  await update(ref(database, `users/${userId}`), { organizationId: null });
};

export const inviteMember = async (orgId: string, email: string, role: OrgRole, inviterId: string) => {
  const invitesRef = ref(database, DB_ORG_INVITES);
  const newInviteRef = push(invitesRef);
  
  const inviteData: Omit<OrganizationInvitation, 'id'> = {
    organizationId: orgId,
    email,
    role,
    invitationStatus: 'Pending',
    invitedBy: inviterId,
    invitedAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  };
  
  await set(newInviteRef, {
    ...inviteData,
    id: newInviteRef.key,
    invitedAt: serverTimestamp(),
    expiresAt: inviteData.expiresAt.toISOString()
  });
  
  return newInviteRef.key;
};

// ==========================================
// APPROVAL WORKFLOW (SUPER ADMIN)
// ==========================================

export const approveOrganization = async (orgId: string, adminId: string, remarks: string) => {
  await updateOrganization(orgId, { status: 'Approved' });
  await logApproval(orgId, 'Approved', adminId, remarks);
};

export const rejectOrganization = async (orgId: string, adminId: string, remarks: string) => {
  await updateOrganization(orgId, { status: 'Rejected' });
  await logApproval(orgId, 'Rejected', adminId, remarks);
};

const logApproval = async (orgId: string, status: OrganizationStatus, adminId: string, remarks: string) => {
  const logsRef = ref(database, DB_ORG_APPROVALS);
  const newLogRef = push(logsRef);
  
  const fbData = {
    id: newLogRef.key,
    organizationId: orgId,
    status,
    remarks,
    approvedBy: adminId,
    approvedAt: serverTimestamp()
  };
  
  await set(newLogRef, fbData);
};
