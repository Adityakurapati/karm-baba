import { ref, set, get, update, push, remove, serverTimestamp } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { database, storage } from '../firebase';
import { BusinessProfile, BusinessDocument, BusinessHistory } from '../types';

const DB_BUSINESSES = 'businesses';
const DB_DOCUMENTS = 'businessDocuments';
const DB_HISTORY = 'businessHistory';

// ==========================================
// MOCK APIS
// ==========================================

export const verifyGST = async (gstin: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (gstin.includes('0000')) {
    return { status: 'Rejected', message: 'GSTIN is invalid or cancelled.' };
  }
  return { 
    status: 'Verified', 
    legalName: 'MOCK COMPANY PVT LTD', 
    registeredAddress: '123 Mock Street, Mock City',
    active: true 
  };
};

export const verifyPAN = async (pan: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (pan.includes('0000')) {
    return { status: 'Rejected', message: 'PAN is invalid.' };
  }
  return { 
    status: 'Verified', 
    name: 'MOCK COMPANY PVT LTD',
    active: true 
  };
};

// ==========================================
// BUSINESS PROFILE SERVICES
// ==========================================

export const createBusiness = async (businessData: Omit<BusinessProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
  const businessesRef = ref(database, DB_BUSINESSES);
  const newBusinessRef = push(businessesRef);
  const businessId = newBusinessRef.key as string;

  const newBusiness: BusinessProfile = {
    ...businessData,
    id: businessId,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Convert Date objects to ISO strings for Firebase RTDB
  const fbData = {
    ...newBusiness,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    verificationTimestamp: newBusiness.verificationTimestamp ? newBusiness.verificationTimestamp.toISOString() : null
  };

  await set(newBusinessRef, fbData);
  return businessId;
};

export const getBusinessById = async (businessId: string): Promise<BusinessProfile | null> => {
  const businessRef = ref(database, `${DB_BUSINESSES}/${businessId}`);
  const snapshot = await get(businessRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    return {
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      verificationTimestamp: data.verificationTimestamp ? new Date(data.verificationTimestamp) : undefined
    };
  }
  return null;
};

export const updateBusiness = async (
  businessId: string, 
  updates: Partial<BusinessProfile>,
  changedBy: string
) => {
  const businessRef = ref(database, `${DB_BUSINESSES}/${businessId}`);
  const currentBusiness = await getBusinessById(businessId);
  
  if (!currentBusiness) throw new Error("Business not found");

  const updatesForFb: any = { ...updates, updatedAt: serverTimestamp() };
  
  // Handle Date to ISO conversion for Firebase RTDB
  if (updates.verificationTimestamp) {
    updatesForFb.verificationTimestamp = updates.verificationTimestamp.toISOString();
  }

  // Create history logs for each changed field
  for (const [key, value] of Object.entries(updates)) {
    if (key !== 'updatedAt' && currentBusiness[key as keyof BusinessProfile] !== value) {
      await createHistoryLog({
        businessId,
        changedBy,
        fieldName: key,
        oldValue: currentBusiness[key as keyof BusinessProfile] as any,
        newValue: value as any,
        timestamp: new Date()
      });
    }
  }

  await update(businessRef, updatesForFb);
};

export const deleteBusiness = async (businessId: string) => {
  // Note: in a real application you might want to soft-delete or handle cascades
  const businessRef = ref(database, `${DB_BUSINESSES}/${businessId}`);
  await remove(businessRef);
};

// ==========================================
// DOCUMENT MANAGEMENT SERVICES
// ==========================================

export const uploadBusinessDocument = async (
  businessId: string,
  file: File,
  documentType: string,
  uploadedBy: string
) => {
  // 1. Upload file to Storage
  const fileExtension = file.name.split('.').pop();
  const fileName = `${businessId}_${documentType}_${Date.now()}.${fileExtension}`;
  const fileRef = storageRef(storage, `businessDocuments/${businessId}/${fileName}`);
  
  await uploadBytes(fileRef, file);
  const fileUrl = await getDownloadURL(fileRef);

  // 2. Save metadata to RTDB
  const docsRef = ref(database, `${DB_DOCUMENTS}/${businessId}`);
  const newDocRef = push(docsRef);
  
  const documentMetadata: BusinessDocument = {
    id: newDocRef.key as string,
    businessId,
    documentType,
    fileUrl,
    uploadedBy,
    uploadedAt: new Date(),
    verificationStatus: 'Pending'
  };

  const fbData = {
    ...documentMetadata,
    uploadedAt: serverTimestamp()
  };

  await set(newDocRef, fbData);
  return documentMetadata;
};

export const deleteBusinessDocument = async (businessId: string, documentId: string, fileUrl: string) => {
  // 1. Delete from Storage
  // Extract path from URL (simplified logic, may need robust parsing in production depending on storage bucket structure)
  try {
     const httpRef = storageRef(storage, fileUrl);
     await deleteObject(httpRef);
  } catch(e) {
    console.error("Failed to delete file from storage", e);
  }

  // 2. Delete metadata from RTDB
  const docRef = ref(database, `${DB_DOCUMENTS}/${businessId}/${documentId}`);
  await remove(docRef);
};

// ==========================================
// HISTORY SERVICES
// ==========================================

export const createHistoryLog = async (logData: Omit<BusinessHistory, 'id'>) => {
  const historyRef = ref(database, `${DB_HISTORY}/${logData.businessId}`);
  const newLogRef = push(historyRef);
  
  const fbData = {
    ...logData,
    id: newLogRef.key,
    timestamp: serverTimestamp()
  };
  
  await set(newLogRef, fbData);
};
