'use client';

import DashboardLayout from '@/components/DashboardLayout';
import TopHeader from '@/components/TopHeader';
import { useState } from 'react';

export default function DocumentUploadPage() {
  const [dragging, setDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const documentTypes = [
    { id: 'invoice', name: 'Invoice', icon: 'receipt_long' },
    { id: 'po', name: 'Purchase Order', icon: 'shopping_cart' },
    { id: 'contract', name: 'Contract', icon: 'description' },
    { id: 'certificate', name: 'Certificate', icon: 'verified' },
    { id: 'license', name: 'Business License', icon: 'business' },
    { id: 'bankdetail', name: 'Bank Details', icon: 'account_balance' },
  ];

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  return (
    <DashboardLayout>
      <TopHeader searchPlaceholder="Search documents..." />
      
      <div className="flex-1 overflow-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
            Document Upload
          </h1>
          <p className="text-on-surface-variant">
            Upload and verify business documents
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Upload Area */}
          <div className="col-span-2">
            {/* Document Types */}
            <div className="mb-8">
              <h2 className="text-lg font-headline font-bold text-on-surface mb-4">
                Document Types
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {documentTypes.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-xl border border-outline-variant p-4 hover:border-primary cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-primary">
                        {doc.icon}
                      </span>
                    </div>
                    <h3 className="font-headline font-bold text-on-surface text-sm">
                      {doc.name}
                    </h3>
                  </div>
                ))}
              </div>
            </div>

            {/* Drop Zone */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                dragging
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant hover:border-primary'
              }`}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">
                  cloud_upload
                </span>
              </div>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-2">
                Drag and drop files here
              </h3>
              <p className="text-on-surface-variant mb-4">
                or click to select files
              </p>
              <button className="px-6 py-2 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-container transition-colors">
                Browse Files
              </button>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-headline font-bold text-on-surface mb-4">
                  Uploaded Files
                </h2>
                <div className="space-y-2">
                  {uploadedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg border border-outline-variant p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary">
                            description
                          </span>
                        </div>
                        <div>
                          <p className="font-headline font-bold text-on-surface text-sm">
                            {file.name}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-green-600">
                        check_circle
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Verification Status */}
          <div className="bg-white rounded-xl border border-outline-variant p-6 h-fit">
            <h3 className="text-lg font-headline font-bold text-on-surface mb-4">
              Verification Status
            </h3>
            <div className="space-y-4">
              {[
                { label: 'GST Certificate', status: 'pending', icon: 'schedule' },
                { label: 'Business License', status: 'verified', icon: 'check_circle' },
                { label: 'Bank Details', status: 'pending', icon: 'schedule' },
              ].map((item, i) => (
                <div key={i} className="pb-4 border-b border-outline-variant last:border-b-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-headline font-bold text-on-surface">
                      {item.label}
                    </span>
                    <span className={`material-symbols-outlined text-lg ${
                      item.status === 'verified' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {item.icon}
                    </span>
                  </div>
                  <span className={`text-xs font-bold mt-1 inline-block px-2 py-0.5 rounded ${
                    item.status === 'verified'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-3 bg-primary text-white font-headline font-bold rounded-lg hover:bg-primary-container transition-colors">
              Submit for Verification
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
