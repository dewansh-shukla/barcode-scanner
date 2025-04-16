"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Loading component with skeleton UI
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-32 bg-gray-200 rounded mb-4"></div>
    <div className="h-40 bg-gray-200 rounded"></div>
  </div>
);

// Import the wrapper component with SSR disabled
const Html5QrScannerWrapper = dynamic(() => import('../components/Html5QrScannerWrapper'), {
  ssr: false,
  loading: () => <LoadingSkeleton />
});

export default function Home() {
  return (
    <div className="container mx-auto py-6 px-4 sm:py-8 md:px-6">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          QR Code & Barcode Scanner
        </h1>
        <p className="text-gray-600 mt-2">
          Scan QR codes and barcodes directly from your device&apos;s camera
        </p>
      </header>
      
      <main className="max-w-2xl mx-auto">
        <Suspense fallback={<LoadingSkeleton />}>
          <Html5QrScannerWrapper />
        </Suspense>
      </main>
      
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} QR & Barcode Scanner | Built with Next.js and html5-qrcode</p>
      </footer>
    </div>
  );
}
