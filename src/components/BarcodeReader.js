"use client";

import React, { useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';

const BarcodeReader = ({ deviceId, onDetected }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Ensure we're running in a browser environment
    if (typeof window === 'undefined' || 
        typeof navigator === 'undefined') {
      setError('Browser environment not detected');
      return;
    }

    // Add polyfill for older browsers
    if (!navigator.mediaDevices) {
      navigator.mediaDevices = {};
    }

    // Polyfill getUserMedia
    if (!navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia = function(constraints) {
        const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        
        if (!getUserMedia) {
          setError("Your browser doesn't support camera access");
          return Promise.reject(new Error('getUserMedia is not implemented'));
        }
        
        return new Promise(function(resolve, reject) {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }
    
    if (!containerRef.current) return;
    
    console.log("Initializing Quagga barcode scanner");
    
    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: containerRef.current,
        constraints: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { min: 640 },
          height: { min: 480 },
          facingMode: "environment"
        }
      },
      locator: {
        patchSize: "medium",
        halfSample: true
      },
      numOfWorkers: (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4,
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader"
        ]
      },
      locate: true
    }, function(err) {
      if (err) {
        console.error('Error initializing barcode scanner:', err);
        setError('Error initializing barcode scanner: ' + (err.message || err));
        return;
      }
      
      console.log("Quagga initialized successfully");
      Quagga.start();
    });
    
    Quagga.onDetected((result) => {
      console.log("Barcode detected:", result.codeResult.code);
      const code = result.codeResult.code;
      onDetected(code);
      
      // Optional: Highlight detected barcode
      if (result.box) {
        const drawingCtx = Quagga.canvas.ctx.overlay;
        const drawingCanvas = Quagga.canvas.dom.overlay;
        
        drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute('width')), parseInt(drawingCanvas.getAttribute('height')));
        Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: 'blue', lineWidth: 2 });
      }
    });
    
    return () => {
      console.log("Stopping Quagga");
      Quagga.stop();
    };
  }, [deviceId, onDetected]);
  
  return (
    <div>
      {error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
      ) : (
        <div ref={containerRef} className="w-full h-64" />
      )}
    </div>
  );
};

export default BarcodeReader;