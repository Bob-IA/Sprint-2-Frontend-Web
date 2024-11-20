import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="bg-gray-200 p-8 rounded-lg shadow-lg flex flex-col justify-center items-center" style={{ width: '500px', height: '500px' }}>
        <img src="/bob.gif" alt="Loading" className="h-64 w-64 mb-4" />
        <img src="/cargando-png.gif" alt="Loading" className="h-32 w-32 mb-4" />
        <div className="text-lg font-bold text-blue-900">
          <span className="letter-1">B</span>
          <span className="letter-2">u</span>
          <span className="letter-3">s</span>
          <span className="letter-4">c</span>
          <span className="letter-5">a</span>
          <span className="letter-6">n</span>
          <span className="letter-7">d</span>
          <span className="letter-8">o</span>
          <span className="dot-1">.</span>
          <span className="dot-2">.</span>
          <span className="dot-3">.</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;