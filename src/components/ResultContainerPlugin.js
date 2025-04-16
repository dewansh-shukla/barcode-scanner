"use client";

import React, { useMemo } from 'react';

// Filter and deduplicate results
const useFilteredResults = (results = []) => {
  return useMemo(() => {
    if (!results || !Array.isArray(results) || results.length === 0) {
      return [];
    }

    // Use a map to track unique codes by their decoded text
    const uniqueResults = new Map();
    
    // Process results to keep only unique scans
    results.forEach(result => {
      if (!uniqueResults.has(result.decodedText)) {
        uniqueResults.set(result.decodedText, result);
      }
    });
    
    // Convert map back to array
    return Array.from(uniqueResults.values());
  }, [results]);
};

// Memoized result table component
const ResultContainerTable = React.memo(({ data = [] }) => {
  if (data.length === 0) {
    return (
      <div className="text-gray-500 py-4 text-center">
        No results yet. Scan a QR code or barcode to see results here.
      </div>
    );
  }
  
  return (
    <table className="Qrcode-result-table">
      <thead>
        <tr>
          <th className="text-left">#</th>
          <th className="text-left">Decoded Text</th>
          <th className="text-left">Format</th>
          <th className="text-left">Time</th>
        </tr>
      </thead>
      <tbody>
        {data.map((result, i) => (
          <tr key={result.decodedText}>
            <td>{i + 1}</td>
            <td className="break-all">{result.decodedText}</td>
            <td>{result.result.format?.formatName || 'Unknown'}</td>
            <td>{new Date().toLocaleTimeString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});

ResultContainerTable.displayName = 'ResultContainerTable';

// Main result container component
const ResultContainerPlugin = ({ results = [] }) => {
  const filteredResults = useFilteredResults(results);
  
  return (
    <div className="Result-container">
      <div className="Result-header">
        <h2 className="text-lg font-bold">Scanned Results ({filteredResults.length})</h2>
        {filteredResults.length > 0 && (
          <button 
            onClick={() => navigator.clipboard.writeText(
              filteredResults.map(r => r.decodedText).join('\n')
            )}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded ml-2"
            title="Copy all results to clipboard"
          >
            Copy All
          </button>
        )}
      </div>
      <div className="Result-section">
        <ResultContainerTable data={filteredResults} />
      </div>
    </div>
  );
};

export default React.memo(ResultContainerPlugin); 