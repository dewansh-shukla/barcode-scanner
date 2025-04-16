// pages/qr-scanner.js or app/qr-scanner/page.js (for App Router)
'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the QR scanner component with no SSR
// This is necessary because html5-qrcode requires browser APIs
const QRCodeScannerNoSSR = dynamic(
  () => import('@/components/QRCodeScanner'),
  { ssr: false }
);

const QRScannerPage = () => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);

  // Check camera permission on component mount
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    const checkCameraPermission = async () => {
      try {
        // Just check if we can access the camera
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
      } catch (error) {
        console.error("Camera permission issue:", error);
        setHasCameraPermission(false);
      }
    };

    checkCameraPermission();
  }, []);

  return (
    <div className="container" style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px' 
    }}>
      <h1>QR Code Scanner</h1>
      
      {hasCameraPermission === false && (
        <div style={{ 
          backgroundColor: '#ffebee', 
          padding: '15px', 
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #ffcdd2'
        }}>
          <h3 style={{ color: '#c62828', margin: '0 0 10px 0' }}>Camera Permission Required</h3>
          <p>
            Please allow camera access in your browser to use the QR scanner. 
            You may need to check your browser settings and refresh the page.
          </p>
        </div>
      )}
      
      <QRCodeScannerNoSSR />
    </div>
  );
};

export default QRScannerPage;