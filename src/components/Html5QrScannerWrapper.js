"use client";

import { useState, useEffect, useRef } from 'react';
import ResultContainerPlugin from './ResultContainerPlugin';
import HowToUse from './HowToUse';

// Skip the fancy component composition and directly use the library
const Html5QrScannerWrapper = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const scannerContainerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    // Dynamic import to ensure it only happens on the client
    const initializeScanner = async () => {
      try {
        // Dynamically import the scanner library
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        
        if (!scannerContainerRef.current) return;

        // Create new scanner instance
        const scanner = new Html5QrcodeScanner(
          "reader", // HTML element ID
          { 
            fps: 10,
            qrbox: 250,
            formatsToSupport: undefined 
          }, 
          false // verbose flag
        );

        // Save the scanner instance for cleanup
        scannerInstanceRef.current = scanner;

        // Define success callback
        const onScanSuccess = (decodedText, decodedResult) => {
          console.log("Scan successful:", decodedText);
          setResults(prevResults => [...prevResults, decodedResult]);
        };

        // Define error callback
        const onScanError = (errorMessage) => {
          // Don't set errors for common scan failures
          if (errorMessage.includes("No QR code found")) {
            return;
          }
          console.error("Scan error:", errorMessage);
          setError(errorMessage);
        };

        // Render the scanner UI
        scanner.render(onScanSuccess, onScanError);
      } catch (err) {
        console.error("Error initializing scanner:", err);
        setError(`Scanner initialization error: ${err.message}`);
      }
    };

    // Wait a bit for the DOM to fully render
    const timerId = setTimeout(() => {
      initializeScanner();
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timerId);
      if (scannerInstanceRef.current) {
        try {
          scannerInstanceRef.current.clear();
        } catch (err) {
          console.error("Error cleaning up scanner:", err);
        }
      }
    };
  }, []);

  return (
    <div>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error.toString()}</p>
        </div>
      )}
      
      {/* Scanner will be rendered into this div */}
      <div id="reader" ref={scannerContainerRef} className="w-full"></div>
      
      <div className="mt-6">
        <ResultContainerPlugin results={results} />
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <HowToUse />
      </div>
    </div>
  );
};

export default Html5QrScannerWrapper; 