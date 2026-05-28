'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TopNavbar from '@/components/TopNavbar';
import Sidebar from '@/components/Sidebar';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';
import { ModernBadge } from '@/components/ModernBadge';
import { useAuth } from '@/lib/auth-context';
import { getBusinessById, uploadBusinessDocument, deleteBusinessDocument } from '@/lib/services/business-services';
import { BusinessProfile, BusinessDocument } from '@/lib/types';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { 
  ArrowUpTrayIcon, 
  DocumentIcon, 
  TrashIcon, 
  ArrowDownTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const DOCUMENT_TYPES = [
  'GST Certificate',
  'PAN Card',
  'Company Registration Certificate',
  'Incorporation Documents',
  'Vendor Agreements',
  'Financial Statements'
];

export default function DocumentManagement() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedType, setSelectedType] = useState(DOCUMENT_TYPES[0]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const data = await getBusinessById(id);
        if (data) setBusiness(data);
        else setError('Business not found');
      } catch (err: any) {
        setError(err.message);
      }
    };
    if (id) fetchBusiness();
  }, [id]);

  useEffect(() => {
    // Listen for realtime document updates
    const docsRef = ref(database, `businessDocuments/${id}`);
    const unsubscribe = onValue(docsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const docsList = Object.keys(data).map(key => ({
          ...data[key],
          id: key,
          uploadedAt: new Date(data[key].uploadedAt)
        }));
        setDocuments(docsList);
      } else {
        setDocuments([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF, PNG, JPG, JPEG files are allowed');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Max file size is 10MB');
      return false;
    }
    return true;
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUpload(e.dataTransfer.files[0]);
    }
  }, [selectedType]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!user || !validateFile(file)) return;
    
    setUploading(true);
    setError('');
    try {
      await uploadBusinessDocument(id, file, selectedType, user.firstName + ' ' + user.lastName);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteBusinessDocument(id, docId, fileUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to delete document');
    }
  };

  if (loading && !business) {
    return (
      <div className="min-h-screen bg-surface-container flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-24">
          <div className="max-w-6xl mx-auto space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-on-surface">Document Management</h1>
                <p className="text-on-surface-variant mt-1">Upload and manage verification documents</p>
              </div>
              <ModernButton variant="outline" onClick={() => router.push(`/business/${id}`)}>
                Back to Dashboard
              </ModernButton>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Upload Section */}
              <div className="lg:col-span-1 space-y-6">
                <ModernCard className="p-6">
                  <h3 className="font-bold text-on-surface mb-4">Upload New Document</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-on-surface mb-2">Document Type</label>
                      <select 
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/40 outline-none"
                      >
                        {DOCUMENT_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div 
                      className={`
                        relative border-2 border-dashed rounded-xl p-8 text-center transition-colors
                        ${dragActive ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50 bg-surface-container-low'}
                      `}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleChange}
                        accept=".pdf,.png,.jpg,.jpeg"
                        disabled={uploading}
                      />
                      <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                        <ArrowUpTrayIcon className={`w-10 h-10 ${dragActive ? 'text-primary' : 'text-on-surface-variant'}`} />
                        <p className="text-sm font-bold text-on-surface">
                          {uploading ? 'Uploading...' : 'Drag & drop file here'}
                        </p>
                        <p className="text-xs text-on-surface-variant">or click to browse</p>
                        <p className="text-xs text-on-surface-variant mt-2">Max 10MB (PDF, PNG, JPG)</p>
                      </div>
                    </div>
                  </div>
                </ModernCard>
              </div>

              {/* Documents List */}
              <div className="lg:col-span-2">
                <ModernCard className="p-0 overflow-hidden">
                  <div className="p-6 border-b border-outline-variant">
                    <h3 className="font-bold text-on-surface">Uploaded Documents ({documents.length})</h3>
                  </div>
                  
                  {documents.length === 0 ? (
                    <div className="p-12 text-center">
                      <DocumentIcon className="w-12 h-12 text-on-surface-variant mx-auto mb-3 opacity-50" />
                      <p className="text-on-surface-variant">No documents uploaded yet.</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-outline-variant">
                      {documents.map((doc) => (
                        <li key={doc.id} className="p-4 hover:bg-surface-container-low transition-colors flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <DocumentIcon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-on-surface">{doc.documentType}</p>
                              <div className="flex items-center space-x-3 mt-1">
                                <p className="text-xs text-on-surface-variant">Uploaded by {doc.uploadedBy}</p>
                                <span className="text-xs text-on-surface-variant">•</span>
                                <p className="text-xs text-on-surface-variant">
                                  {doc.uploadedAt instanceof Date ? doc.uploadedAt.toLocaleDateString() : 'Unknown Date'}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <ModernBadge 
                              variant={doc.verificationStatus === 'Verified' ? 'success' : doc.verificationStatus === 'Pending' ? 'warning' : 'error'}
                            >
                              {doc.verificationStatus}
                            </ModernBadge>
                            
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => window.open(doc.fileUrl, '_blank')}
                                className="p-2 text-on-surface-variant hover:text-primary transition-colors tooltip-trigger"
                                title="Preview"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </button>
                              <a 
                                href={doc.fileUrl} 
                                download
                                target="_blank" 
                                rel="noreferrer"
                                className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                                title="Download"
                              >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                              </a>
                              <button 
                                onClick={() => handleDelete(doc.id, doc.fileUrl)}
                                className="p-2 text-on-surface-variant hover:text-error transition-colors"
                                title="Delete"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </ModernCard>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
