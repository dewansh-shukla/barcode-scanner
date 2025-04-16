"use client";

import { useState, useEffect } from 'react';
import Html5QrcodePlugin from './Html5QrcodePlugin';
import ResultContainerPlugin from './ResultContainerPlugin';
import HowToUse from './HowToUse';

const QrCodeScanner = () => {
  const [decodedResults, setDecodedResults] = useState([]);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set loaded flag after component mounts on client
    setIsLoaded(true);
  }, []);

  const onNewScanResult = (decodedText, decodedResult) => {
    console.log("App [result]", decodedResult);
    setDecodedResults(prevResults => [...prevResults, decodedResult]);
  };

  const onScanError = (error) => {
    console.error("Scan error:", error);
    setError(error);
  };

  if (!isLoaded) {
    return <div className="p-4 border border-gray-200 rounded text-center">Loading QR Scanner...</div>;
  }

  return (
    <>
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          <p>Error: {error.toString()}</p>
        </div>
      )}
      
      <Html5QrcodePlugin 
        fps={10}
        qrbox={250}
        disableFlip={false}
        qrCodeSuccessCallback={onNewScanResult}
        qrCodeErrorCallback={onScanError}
        verbose={true}
      />
      
      <div className="mt-6">
        <ResultContainerPlugin results={decodedResults} />
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <HowToUse />
      </div>
    </>
  );
};

export default QrCodeScanner; 