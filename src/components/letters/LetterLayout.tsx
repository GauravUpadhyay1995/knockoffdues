// components/letters/LetterLayout.tsx
import { CompanyData } from '@/types/letter.types';
import React, { useState, useEffect } from 'react';

interface LetterLayoutProps {
  title: string;
  children: React.ReactNode;
}

const LetterLayout: React.FC<LetterLayoutProps> = ({ title, children }) => {
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    if (!companyInfo) {
      fetch('/api/v1/admin/settings/config')
        .then(res => res.json())
        .then(data => setCompanyInfo(data.data));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden relative">
        
        {/* Watermark */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div 
            className="absolute -bottom-40 -left-20 w-[800px] h-[200px] opacity-10"
            style={{
              transform: 'rotate(45deg)',
              transformOrigin: 'bottom left'
            }}
          >
            <div className="flex items-center justify-start h-full">
              <span className="text-6xl font-bold text-gray-400 whitespace-nowrap tracking-wider">
                KNOCK OFF DUES
              </span>
            </div>
          </div>
        </div>

        {/* Letter Header */}
        <div className="border-b-2 border-blue-600 p-8 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <img
                src={companyInfo?.companyLogo || '/default-logo.png'}
                alt={`${companyInfo?.name} Logo`}
                className="h-16 w-auto mb-4"
              />
              <h1 className="text-3xl font-bold text-gray-800">{companyInfo?.companyName}</h1>
            </div>
            <div className="text-right text-gray-600">
              <p><strong>Phone:</strong> {companyInfo?.companyWhatsapp}</p>
              <p><strong>Address:</strong> {companyInfo?.companyAddress}</p>
              <p><strong>Email:</strong> {companyInfo?.companyEmail}</p>
            </div>
          </div>
        </div>

        {/* Letter Content */}
        <div className="p-8 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-blue-700 uppercase tracking-wide">
              {title}
            </h2>
          </div>

          {children}
        </div>

        {/* Letter Footer */}
        <div className="border-t-2 border-gray-200 p-8 bg-gray-50 relative z-10">
          <div className="text-center text-gray-500 text-sm">
            <p>{companyInfo?.companyName} • {companyInfo?.companyAddress}</p>
            <p className="mt-2">Confidential & Proprietary</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LetterLayout;