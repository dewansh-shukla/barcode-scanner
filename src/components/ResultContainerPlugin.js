"use client";

import React from 'react';

const filterResults = (results = []) => {
  if (!results || !Array.isArray(results) || results.length === 0) {
    return [];
  }

  let filteredResults = [];
  for (let i = 0; i < results.length; ++i) {
    if (i === 0) {
      filteredResults.push(results[i]);
      continue;
    }

    if (results[i].decodedText !== results[i-1].decodedText) {
      filteredResults.push(results[i]);
    }
  }
  return filteredResults;
};

const ResultContainerTable = ({ data = [] }) => {
  const results = filterResults(data);
  
  if (results.length === 0) {
    return (
      <div className="text-gray-500 py-4 text-center">
        No results yet. Scan a QR code to see results here.
      </div>
    );
  }
  
  return (
    <table className="Qrcode-result-table">
      <thead>
        <tr>
          <td>#</td>
          <td>Decoded Text</td>
          <td>Format</td>
        </tr>
      </thead>
      <tbody>
        {results.map((result, i) => (
          <tr key={i}>
            <td>{i}</td>
            <td>{result.decodedText}</td>
            <td>{result.result.format.formatName}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const ResultContainerPlugin = ({ results = [] }) => {
  const filteredResults = filterResults(results);
  
  return (
    <div className="Result-container">
      <div className="Result-header">Scanned results ({filteredResults.length})</div>
      <div className="Result-section">
        <ResultContainerTable data={results} />
      </div>
    </div>
  );
};

export default ResultContainerPlugin; 