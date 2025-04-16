"use client";

import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

const QrScanner = ({ deviceId, onScan }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Ensure we're running in the browser
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
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    const context = canvas.getContext('2d');
    
    const startScanning = async () => {
      try {
        console.log("Attempting to access camera with:", { 
          deviceId, 
          mediaDevices: !!navigator.mediaDevices,
          getUserMedia: !!navigator.mediaDevices.getUserMedia
        });
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            facingMode: "environment",
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });
        
        console.log("Camera access granted:", !!stream);
        streamRef.current = stream;
        video.srcObject = stream;
        
        video.onloadedmetadata = () => {
          console.log("Video metadata loaded, attempting to play");
          video.play().catch(e => {
            console.error("Error playing video:", e);
            setError("Error playing video: " + e.message);
          });
        };
        
        video.oncanplay = () => {
          console.log("Video can play, starting QR scanning");
          scanQRCode();
        };
      } catch (error) {
        console.error('Error accessing camera:', error);
        setError('Error accessing camera: ' + error.message);
      }
    };
    
    const scanQRCode = () => {
      if (!video || !canvas) return;

      try {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          
          if (code) {
            console.log("QR code detected:", code.data);
            onScan(code.data);
            
            // Draw outline around QR code
            context.beginPath();
            context.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
            context.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
            context.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
            context.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
            context.lineTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
            context.lineWidth = 4;
            context.strokeStyle = "#FF3B58";
            context.stroke();
          }
        }
      } catch (e) {
        console.error("Error in QR scanning:", e);
      }
      
      rafRef.current = requestAnimationFrame(scanQRCode);
    };
    
    startScanning();
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [deviceId, onScan]);
  
  return (
    <div className="relative w-full">
      {error ? (
        <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
      ) : (
        <>
          <video ref={videoRef} className="w-full" />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" style={{ display: 'none' }} />
        </>
      )}
    </div>
  );
};

export default QrScanner;