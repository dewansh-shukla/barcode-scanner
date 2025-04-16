"use client";

import dynamic from 'next/dynamic';

// Import the wrapper component with SSR disabled
const Html5QrScannerWrapper = dynamic(() => import('../components/Html5QrScannerWrapper'), {
  ssr: false,
  loading: () => <div className="p-4 border border-gray-200 rounded text-center">Loading QR Scanner...</div>
});

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">QR Code & Barcode Scanner</h1>
      
      <div className="max-w-2xl mx-auto">
        <Html5QrScannerWrapper />
      </div>
    </div>
  );
}
