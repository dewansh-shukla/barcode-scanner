"use client"; // Add this if using Next.js 13+ with app directory

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import libraries to avoid SSR issues
const QrScanner = dynamic(() => import('./QrScanner'), { ssr: false });
const BarcodeReader = dynamic(() => import('./BarcodeReader'), { ssr: false });

const BarcodeScanner = () => {
  const [activeTab, setActiveTab] = useState('barcode');
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState('No result yet');
  const [error, setError] = useState(null);
  const [bypassChecks, setBypassChecks] = useState(false);
  
  useEffect(() => {
    // Add detailed diagnostic logging
    console.log("Browser API check:", {
      window: typeof window !== 'undefined',
      navigator: typeof navigator !== 'undefined',
      mediaDevices: navigator && 'mediaDevices' in navigator,
      getUserMedia: navigator && navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices,
      enumerateDevices: navigator && navigator.mediaDevices && 'enumerateDevices' in navigator.mediaDevices,
      protocol: window.location.protocol,
      isSecureContext: window.isSecureContext
    });
    
    // Skip checks if bypass is enabled
    if (bypassChecks) {
      initCameraWithPolyfills();
      return;
    }
    
    // Check if using HTTPS (required for camera access in most browsers)
    if (window.location.protocol !== 'https:' && 
        window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
      setError("Camera access requires HTTPS. Please use a secure connection or click 'Try Anyway'.");
      return;
    }
    
    // Check if browser supports mediaDevices
    if (typeof window === 'undefined' || 
        typeof navigator === 'undefined') {
      setError("Your browser doesn't have window or navigator objects");
      return;
    }
    
    initCameraWithPolyfills();
  }, [bypassChecks]);
  
  // Initialize camera with polyfills for older browsers
  const initCameraWithPolyfills = () => {
    // Add adapter for older browsers
    if (!navigator.mediaDevices) {
      navigator.mediaDevices = {};
    }
    
    // Add getUserMedia polyfill for older browsers
    if (!navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
        const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        
        if (!getUserMedia) {
          setError("Your browser doesn't support camera access (no getUserMedia)");
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }
        
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }
    
    if (!navigator.mediaDevices.enumerateDevices) {
      setError("Your browser doesn't support enumerateDevices");
      return;
    }
    
    // Get available cameras when component mounts
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          setError('No cameras found on your device');
          return;
        }
        
        setCameras(videoDevices);
        
        // If only one camera, select it automatically
        if (videoDevices.length === 1) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error enumerating devices:', error);
        setError('Error accessing cameras: ' + error.message);
      }
    };
    
    // Request camera permissions first
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach(track => track.stop());
        // Now fetch the camera list
        getCameras();
      })
      .catch(err => {
        console.error('Permission denied or camera error:', err);
        setError('Camera permission denied: ' + err.message);
      });
  };
  
  const startScanner = () => {
    if (!selectedCamera) {
      setError('Please select a camera first');
      return;
    }
    
    setIsScanning(true);
    setError(null);
  };
  
  const stopScanner = () => {
    setIsScanning(false);
  };
  
  const handleResult = (result) => {
    setScanResult(result);
    // Optionally stop scanning after a successful scan
    // stopScanner();
  };

  if (error && !isScanning) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">QR Code and Barcode Scanner</h1>
        <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
          {error}
        </div>
        <div className="flex flex-col space-y-3">
          <button 
            className="py-2 px-4 bg-blue-500 text-white rounded"
            onClick={() => setError(null)}
          >
            Try Again
          </button>
          
          <button 
            className="py-2 px-4 bg-yellow-500 text-white rounded"
            onClick={() => setBypassChecks(true)}
          >
            Try Anyway (Bypass Checks)
          </button>
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-bold mb-2">Troubleshooting Tips:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Make sure your page is loaded over HTTPS</li>
              <li>Grant camera permissions when prompted</li>
              <li>Try using Chrome, Firefox or Edge</li>
              <li>Make sure your camera is not being used by another application</li>
              <li>Check your browser settings to ensure camera access is allowed</li>
              <li>Try refreshing the page or restarting your browser</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">QR Code and Barcode Scanner</h1>
      
      <div className="flex mb-4">
        <button 
          className={`flex-1 py-2 px-4 border ${activeTab === 'barcode' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('barcode')}
        >
          Barcode Scanner
        </button>
        <button 
          className={`flex-1 py-2 px-4 border ${activeTab === 'qrcode' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
          onClick={() => setActiveTab('qrcode')}
        >
          QR Code Scanner
        </button>
      </div>
      
      <select 
        className="w-full p-2 mb-4 border"
        value={selectedCamera}
        onChange={(e) => setSelectedCamera(e.target.value)}
      >
        <option value="">Select Camera</option>
        {cameras.map((camera, index) => (
          <option key={camera.deviceId} value={camera.deviceId}>
            {camera.label || `Camera ${index + 1}`}
          </option>
        ))}
      </select>
      
      {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded">{error}</div>}
      
      <div className="relative w-full max-w-md mx-auto mb-4 overflow-hidden">
        {activeTab === 'barcode' && (
          <div className={isScanning ? 'block' : 'hidden'}>
            {isScanning && <BarcodeReader 
              deviceId={selectedCamera} 
              onDetected={handleResult} 
            />}
          </div>
        )}
        
        {activeTab === 'qrcode' && (
          <div className={isScanning ? 'block' : 'hidden'}>
            {isScanning && <QrScanner 
              deviceId={selectedCamera} 
              onScan={handleResult} 
            />}
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mb-4">
        <button 
          className={`py-2 px-4 bg-green-500 text-white rounded ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={startScanner}
          disabled={isScanning}
        >
          Start Scanner
        </button>
        <button 
          className={`py-2 px-4 bg-red-500 text-white rounded ${!isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={stopScanner}
          disabled={!isScanning}
        >
          Stop Scanner
        </button>
      </div>
      
      <div>
        <h3 className="font-bold">Scan Result:</h3>
        <div className="p-3 border bg-gray-50 break-all min-h-12">
          {scanResult}
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;