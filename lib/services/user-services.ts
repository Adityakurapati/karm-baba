import { ref, set, get, update, remove, push, serverTimestamp, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../firebase';
import { User, UserSession, ActivityLog, UserRole } from '../types';

const DB_USERS = 'users';
const DB_SESSIONS = 'userSessions';
const DB_ACTIVITY = 'activityLogs';
const DB_ROLES = 'rolePermissions';

// ==========================================
// USER CRUD SERVICES
// ==========================================

export const createUserRecord = async (userId: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
  const userRef = ref(database, `${DB_USERS}/${userId}`);
  
  const fbData = {
    ...userData,
    id: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await set(userRef, fbData);
  return userId;
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userRef = ref(database, `${DB_USERS}/${userId}`);
  const snapshot = await get(userRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    return {
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      lastLogin: data.lastLogin ? new Date(data.lastLogin) : undefined,
    } as User;
  }
  return null;
};

export const updateUser = async (userId: string, updates: Partial<User>) => {
  const userRef = ref(database, `${DB_USERS}/${userId}`);
  const updatesForFb: any = { ...updates, updatedAt: serverTimestamp() };
  await update(userRef, updatesForFb);
};

export const deleteUser = async (userId: string) => {
  // In a real app, you might want to use soft delete.
  // For now, we will do a soft delete by setting status to 'Deleted'
  const userRef = ref(database, `${DB_USERS}/${userId}`);
  await update(userRef, { status: 'Deleted', updatedAt: serverTimestamp() });
};

// ==========================================
// USER STATUS MANAGEMENT
// ==========================================

export const activateUser = async (userId: string, adminId: string) => {
  await updateUser(userId, { status: 'Active' });
  await logActivity({
    userId: adminId,
    action: 'ACTIVATE_USER',
    entityType: 'USER',
    entityId: userId,
    description: `Activated user ${userId}`
  });
};

export const blockUser = async (userId: string, adminId: string) => {
  await updateUser(userId, { status: 'Blocked' });
  await logActivity({
    userId: adminId,
    action: 'BLOCK_USER',
    entityType: 'USER',
    entityId: userId,
    description: `Blocked user ${userId}`
  });
};

// ==========================================
// RBAC SERVICES
// ==========================================

export const assignRole = async (userId: string, newRole: UserRole, adminId: string) => {
  await updateUser(userId, { role: newRole });
  await logActivity({
    userId: adminId,
    action: 'ASSIGN_ROLE',
    entityType: 'USER',
    entityId: userId,
    description: `Assigned role ${newRole} to user ${userId}`
  });
};

export const removeRole = async (userId: string, adminId: string) => {
  await updateUser(userId, { role: 'guest' });
  await logActivity({
    userId: adminId,
    action: 'REMOVE_ROLE',
    entityType: 'USER',
    entityId: userId,
    description: `Removed role from user ${userId}, set to guest`
  });
};

export const hasPermission = async (userRole: UserRole, permission: string): Promise<boolean> => {
  // Check role-based permissions stored in Firebase
  const roleRef = ref(database, `${DB_ROLES}/${userRole}`);
  const snapshot = await get(roleRef);
  
  if (snapshot.exists()) {
    const permissions: string[] = snapshot.val().permissions || [];
    return permissions.includes(permission) || permissions.includes('all');
  }
  
  // Fallback default permissions
  if (userRole === 'super_admin') return true;
  if (userRole === 'admin') return ['manageUsers', 'manageVendors', 'viewCRM', 'manageCRM', 'uploadPricing'].includes(permission);
  if (userRole === 'manager') return ['viewCRM', 'manageCRM', 'manageVendors'].includes(permission);
  if (userRole === 'analyst') return ['viewCRM', 'accessAnalytics'].includes(permission);
  
  return false;
};

// ==========================================
// SESSION MANAGEMENT SERVICES
// ==========================================

export const createSession = async (userId: string, deviceData: Partial<UserSession>) => {
  const sessionsRef = ref(database, DB_SESSIONS);
  const newSessionRef = push(sessionsRef);
  
  const sessionInfo = {
    id: newSessionRef.key,
    userId,
    refreshToken: deviceData.refreshToken || '',
    device: deviceData.device || 'Unknown',
    browser: deviceData.browser || 'Unknown',
    operatingSystem: deviceData.operatingSystem || 'Unknown',
    ipAddress: deviceData.ipAddress || 'Unknown',
    loginTime: serverTimestamp(),
    lastActivity: serverTimestamp(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    isActive: true
  };

  await set(newSessionRef, sessionInfo);
  return newSessionRef.key;
};

export const terminateSession = async (sessionId: string) => {
  const sessionRef = ref(database, `${DB_SESSIONS}/${sessionId}`);
  await update(sessionRef, { isActive: false });
};

export const logoutAllSessions = async (userId: string) => {
  const sessionsRef = ref(database, DB_SESSIONS);
  const userSessionsQuery = query(sessionsRef, orderByChild('userId'), equalTo(userId));
  const snapshot = await get(userSessionsQuery);
  
  if (snapshot.exists()) {
    const updates: any = {};
    snapshot.forEach((childSnapshot) => {
      updates[`${childSnapshot.key}/isActive`] = false;
    });
    await update(sessionsRef, updates);
  }
};

// ==========================================
// ACTIVITY LOGGING
// ==========================================

export const logActivity = async (logData: Omit<ActivityLog, 'id' | 'timestamp'>) => {
  const activityRef = ref(database, DB_ACTIVITY);
  const newLogRef = push(activityRef);
  
  const fbData = {
    ...logData,
    id: newLogRef.key,
    timestamp: serverTimestamp()
  };
  
  await set(newLogRef, fbData);
};
