"use client";

import React from 'react';

const HowToUse = () => {
  return (
    <div className="HowToUse bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="text-lg font-bold mb-3">How to Use the Scanner</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Scanning Instructions:</h4>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>
            <span className="font-medium">Select Camera</span>: Choose your preferred camera from the dropdown menu
          </li>
          <li>
            <span className="font-medium">Position Code</span>: Center the QR code or barcode within the viewfinder
          </li>
          <li>
            <span className="font-medium">Hold Steady</span>: Keep the device stable for best results
          </li>
          <li>
            <span className="font-medium">Auto Detection</span>: The scanner automatically processes and displays results
          </li>
          <li>
            <span className="font-medium">Flashlight</span>: Use the torch button if scanning in low light conditions
          </li>
        </ul>
      </div>
      
      <div>
        <h4 className="font-semibold text-sm text-gray-700 mb-2">Supported Formats:</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 p-2 rounded">QR Code</div>
          <div className="bg-gray-50 p-2 rounded">Code 128</div>
          <div className="bg-gray-50 p-2 rounded">Code 39</div>
          <div className="bg-gray-50 p-2 rounded">EAN-13</div>
          <div className="bg-gray-50 p-2 rounded">EAN-8</div>
          <div className="bg-gray-50 p-2 rounded">UPC-A</div>
          <div className="bg-gray-50 p-2 rounded">UPC-E</div>
          <div className="bg-gray-50 p-2 rounded">And more...</div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Note: For best results, ensure good lighting and a clear view of the code.</p>
      </div>
    </div>
  );
};

export default React.memo(HowToUse); 