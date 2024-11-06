import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorModal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full transform transition-transform duration-500 ease-in-out scale-105">
        <div className="flex items-center mb-4">
          <FaExclamationTriangle className="text-red-600 text-3xl mr-3" />
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
        </div>
        <p className="text-gray-700 text-lg mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            className="bg-red-600 text-white px-5 py-2 rounded-lg shadow hover:bg-red-700 transition-all duration-300"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
