"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import ResultContainerPlugin from './ResultContainerPlugin';
import HowToUse from './HowToUse';

// Skip the fancy component composition and directly use the library
const Html5QrScannerWrapper = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const scannerContainerRef = useRef(null);
  const scannerInstanceRef = useRef(null);
  const lastScannedCodeRef = useRef(null);
  const cooldownTimerRef = useRef(null);

  // Memoize the success callback to prevent unnecessary rerenders
  const onScanSuccess = useCallback((decodedText, decodedResult) => {
    console.log("Scan successful:", decodedText);
    
    // Prevent duplicate scans
    if (lastScannedCodeRef.current === decodedText) {
      console.log("Duplicate scan prevented");
      return;
    }
    
    // Update last scanned code and add to results
    lastScannedCodeRef.current = decodedText;
    
    // Add to results
    setResults(prevResults => {
      // Check if this code already exists in the results
      const isDuplicate = prevResults.some(result => 
        result.decodedText === decodedText
      );
      
      if (isDuplicate) {
        console.log("Duplicate result prevented");
        return prevResults;
      }
      
      return [...prevResults, decodedResult];
    });
    
    // Temporarily pause scanning to prevent multiple reads
    setIsScanning(false);
    
    // Resume scanning after a cooldown period
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
    }
    
    cooldownTimerRef.current = setTimeout(() => {
      lastScannedCodeRef.current = null;
      setIsScanning(true);
    }, 2000); // 2 second cooldown between scans
  }, []);

  // Memoize the error callback 
  const onScanError = useCallback((errorMessage) => {
    // Don't set errors for common scan failures
    if (typeof errorMessage === 'string' && 
       (errorMessage.includes("No QR code found") || 
        errorMessage.includes("No barcode found"))) {
      return;
    }
    console.error("Scan error:", errorMessage);
    setError(errorMessage);
  }, []);

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
            // Support all formats
            formatsToSupport: [
              0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
            ],
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true
          }, 
          false // verbose flag
        );

        // Save the scanner instance for cleanup
        scannerInstanceRef.current = scanner;

        // Render the scanner UI
        scanner.render(onScanSuccess, onScanError);
        
        // Apply styling for white background and black text
        // This is done after render to ensure elements exist
        setTimeout(() => {
          const scannerElements = document.querySelectorAll('#reader *');
          scannerElements.forEach(el => {
            if (el.style) {
              el.style.backgroundColor = '#FFFFFF';
              el.style.color = '#000000';
            }
          });
          
          // Fix camera section background
          const videoContainer = document.querySelector('#reader__scan_region');
          if (videoContainer) {
            videoContainer.style.backgroundColor = '#FFFFFF';
          }
          
          const messageElement = document.querySelector('#reader__status_span');
          if (messageElement) {
            messageElement.style.color = '#000000';
          }
        }, 500);
      } catch (err) {
        console.error("Error initializing scanner:", err);
        setError(`Scanner initialization error: ${err.message}`);
      }
    };

    // Initialize scanner
    initializeScanner();

    // Cleanup function
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
      
      if (scannerInstanceRef.current) {
        try {
          scannerInstanceRef.current.clear();
        } catch (err) {
          console.error("Error cleaning up scanner:", err);
        }
      }
    };
  }, [onScanSuccess, onScanError]);

  // Update pause/resume scanning
  useEffect(() => {
    if (!scannerInstanceRef.current) return;
    
    // Advanced pause/resume if needed (optional)
    try {
      const scanRegion = document.getElementById('reader__scan_region');
      if (scanRegion) {
        if (!isScanning) {
          scanRegion.style.opacity = '0.5';
        } else {
          scanRegion.style.opacity = '1';
        }
      }
    } catch (err) {
      console.error("Error updating scanning state:", err);
    }
  }, [isScanning]);

  return (
    <div>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>{error.toString()}</p>
        </div>
      )}
      
      {/* Scanner will be rendered into this div */}
      <div id="reader" ref={scannerContainerRef} className="w-full bg-white text-black"></div>
      
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