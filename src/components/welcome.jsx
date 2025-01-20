import React from 'react';
import { FaPaperclip } from 'react-icons/fa';

const Welcome = () => {
  return (
    <div className="flex flex-col lg:flex-row items-start justify-center min-h-screen bg-gradient-to-r from-gray-50 via-white to-gray-50 px-8 py-16 lg:space-x-8 space-y-8 lg:space-y-0">
      {/* Sección de bienvenida */}
      <div className="flex flex-col items-start text-left max-w-lg w-full bg-white rounded-xl shadow-xl p-8 transform transition-transform hover:scale-105">
        <h2 className="text-4xl font-extrabold text-blue-700 mb-6">
          Bienvenido a <span className="text-blue-500">BOB IA</span>
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          Usa la barra de búsqueda para encontrar productos rápidamente y
          explorar opciones disponibles.
        </p>
      </div>

      {/* Sección de carga de archivos CSV */}
      <div className="flex flex-col items-start text-left max-w-lg w-full bg-blue-100 rounded-xl shadow-xl p-8 transform transition-transform hover:scale-105">
        <div className="flex items-center mb-6">
          <FaPaperclip className="text-blue-500 text-5xl mr-4 animate-bounce" />
          <h3 className="text-3xl font-semibold text-blue-700">
            Subir archivos CSV
          </h3>
        </div>
        <p className="text-gray-700 text-lg leading-relaxed">
          Haz clic en el icono para cargar un archivo CSV y realizar búsquedas más rápidas y eficientes.
        </p>
      </div>

      {/* Instrucciones adicionales */}
      <div className="flex flex-col items-start text-left max-w-lg w-full bg-gray-100 rounded-xl shadow-xl p-8 transform transition-transform hover:scale-105">
        <h4 className="text-2xl font-bold text-gray-800 mb-4">
          ¿Cómo funciona?
        </h4>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          Los resultados aparecerán para cada producto buscado, organizados de forma clara y detallada.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed">
          Selecciona productos específicos para descargarlos en un archivo CSV o PDF.
        </p>
      </div>
    </div>
  );
};

export default Welcome;
