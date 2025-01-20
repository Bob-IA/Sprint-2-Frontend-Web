import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

const ErrorModal = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full transform transition-all duration-300 ease-in-out scale-100 opacity-100">
        {/* Encabezado */}
        <div className="flex items-center mb-4">
          <FaExclamationTriangle className="text-red-500 text-4xl mr-3 animate-pulse" />
          <h2 className="text-2xl font-bold text-red-500">¡Error!</h2>
        </div>

        {/* Mensaje */}
        <p className="text-gray-700 text-lg leading-relaxed mb-6">
          {message}
        </p>

        {/* Botón de cierre */}
        <div className="flex justify-end">
          <button
            className="flex items-center bg-red-500 text-white px-5 py-2 rounded-lg shadow-md hover:bg-red-600 hover:scale-105 transition-all duration-300"
            onClick={onClose}
          >
            <span className="mr-2">Cerrar</span>
            <FaExclamationTriangle />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
