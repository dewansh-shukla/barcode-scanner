'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRCodeScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);
  const [scannedCodes, setScannedCodes] = useState(new Set());
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    // Cleanup when component unmounts
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(error => {
          console.error("Error stopping scanner:", error);
        });
      }
    };
  }, []);

  const startScanner = () => {
    if (!scannerRef.current) return;

    const html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCodeRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };

    // Simply use the library's start method with environment facing mode
    html5QrCode.start(
      { facingMode: "environment" },
      config,
      onScanSuccess,
      onScanFailure
    ).then(() => {
      setScanning(true);
    }).catch((err) => {
      console.error("Error starting scanner:", err);
      alert("Could not start camera. Please check camera permissions.");
    });
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().then(() => {
        setScanning(false);
      }).catch((err) => {
        console.error("Error stopping scanner:", err);
      });
    }
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    // Check if this code has been scanned before using our scannedCodes Set
    if (!scannedCodes.has(decodedText)) {
      // Add to our Set of scanned codes
      setScannedCodes(prevScannedCodes => {
        const newScannedCodes = new Set(prevScannedCodes);
        newScannedCodes.add(decodedText);
        return newScannedCodes;
      });
      
      // Add to our results table
      setResults(prevResults => [
        ...prevResults,
        {
          id: Date.now(),
          text: decodedText,
          time: new Date().toLocaleTimeString(),
          type: decodedResult.result.format ? decodedResult.result.format.toString() : 'QR Code'
        }
      ]);
      
      // Pause scanning briefly to prevent immediate rescans of the same code
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.pause();
        setTimeout(() => {
          if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.resume();
          }
        }, 2000);
      }
    }
  };

  const onScanFailure = (error) => {
    // Failure handling is optional, we're just ignoring most errors
    // console.error(`QR scan error: ${error}`);
  };

  const clearResults = () => {
    setResults([]);
    setScannedCodes(new Set());
  };

  return (
    <div className="qr-scanner-container">
      <h2>QR Code Scanner</h2>
      
      <div id="qr-reader" ref={scannerRef} style={{ 
        width: '100%', 
        maxWidth: '500px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}></div>
      
      <div className="scanner-status" style={{ 
        margin: '10px 0', 
        color: scanning ? '#4caf50' : '#f44336',
        fontWeight: 'bold' 
      }}>
        {scanning ? 'Scanner is active - Point at a QR code or barcode' : 'Scanner inactive'}
      </div>
      
      <div className="scanner-controls" style={{ margin: '20px 0' }}>
        {!scanning ? (
          <button 
            onClick={startScanner} 
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
            Start Scanner
          </button>
        ) : (
          <button 
            onClick={stopScanner} 
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
            Stop Scanner
          </button>
        )}
        
        <button 
          onClick={clearResults} 
          style={{
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginLeft: '10px'
          }}>
          Clear Results
        </button>
      </div>

      <div className="results-container" style={{ marginTop: '30px' }}>
        <h3>Scan Results</h3>
        {results.length > 0 ? (
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="results-table" style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              border: '1px solid #ddd',
              boxShadow: '0 2px 3px rgba(0,0,0,0.1)'
            }}>
              <thead>
                <tr>
                  <th style={{...tableHeaderStyle, width: '8%'}}>No.</th>
                  <th style={{...tableHeaderStyle, width: '50%'}}>Content</th>
                  <th style={{...tableHeaderStyle, width: '22%'}}>Type</th>
                  <th style={{...tableHeaderStyle, width: '20%'}}>Time</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={result.id} style={{
                    backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
                  }}>
                    <td style={tableCellStyle}>{index + 1}</td>
                    <td style={{...tableCellStyle, wordBreak: 'break-all'}}>{result.text}</td>
                    <td style={tableCellStyle}>{result.type || 'QR Code'}</td>
                    <td style={tableCellStyle}>{result.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No QR codes scanned yet</p>
        )}
      </div>
    </div>
  );
};

// Styles
const tableHeaderStyle = {
  backgroundColor: '#3a86ff',
  color: 'white',
  padding: '12px',
  borderBottom: '1px solid #ddd',
  textAlign: 'left',
  fontWeight: 'bold'
};

const tableCellStyle = {
  padding: '12px',
  borderBottom: '1px solid #ddd',
  verticalAlign: 'middle'
};

export default QRCodeScanner;