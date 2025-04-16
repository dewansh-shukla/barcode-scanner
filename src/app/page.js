// pages/qr-scanner.js or app/qr-scanner/page.js (for App Router)
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the QR scanner component with no SSR
// This is necessary because html5-qrcode requires browser APIs
const QRCodeScannerNoSSR = dynamic(
  () => import('@/components/QRCodeScanner'),
  { ssr: false }
);

const QRScannerPage = () => {
  return (
    <div className="container" style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px' 
    }}>
      <QRCodeScannerNoSSR />
    </div>
  );
};

export default QRScannerPage;